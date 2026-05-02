
-- =======================================================
-- 1. USER CREDITS (balance)
-- =======================================================
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  last_daily_grant DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits" ON public.user_credits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update credits" ON public.user_credits
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_user_credits_updated
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =======================================================
-- 2. CREDIT TRANSACTIONS (ledger)
-- =======================================================
CREATE TYPE public.credit_tx_kind AS ENUM (
  'signup_bonus','daily_login','task_completed','admin_grant',
  'purchase','redemption','adjustment'
);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- positive = earned, negative = spent
  kind public.credit_tx_kind NOT NULL,
  reason TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_credit_tx_user_created ON public.credit_transactions(user_id, created_at DESC);

CREATE POLICY "Users view own transactions" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- =======================================================
-- 3. REWARDS CATALOG (admin-managed)
-- =======================================================
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Education',
  cost INTEGER NOT NULL CHECK (cost > 0),
  stock INTEGER, -- NULL = unlimited
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active rewards" ON public.rewards
  FOR SELECT TO authenticated
  USING (active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert rewards" ON public.rewards
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update rewards" ON public.rewards
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete rewards" ON public.rewards
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_rewards_updated
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =======================================================
-- 4. REDEMPTIONS
-- =======================================================
CREATE TYPE public.redemption_status AS ENUM ('pending','fulfilled','cancelled');

CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  cost_at_purchase INTEGER NOT NULL,
  status public.redemption_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_redemptions_user ON public.redemptions(user_id, created_at DESC);

CREATE POLICY "Users view own redemptions" ON public.redemptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update redemptions" ON public.redemptions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_redemptions_updated
  BEFORE UPDATE ON public.redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =======================================================
-- 5. CORE FUNCTIONS
-- =======================================================

-- Award credits (atomic) — usable by the user themselves OR admin OR internal triggers
CREATE OR REPLACE FUNCTION public.award_credits(
  _user_id UUID,
  _amount INTEGER,
  _kind public.credit_tx_kind,
  _reason TEXT DEFAULT NULL,
  _reference_id UUID DEFAULT NULL
)
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.user_credits;
  caller UUID := auth.uid();
BEGIN
  IF _amount = 0 THEN
    RAISE EXCEPTION 'Amount cannot be zero';
  END IF;

  -- Authorization rules:
  -- - admins can award to anyone
  -- - users can only trigger award_credits for THEMSELVES via specific allowed kinds
  IF NOT has_role(caller, 'admin') THEN
    IF caller IS DISTINCT FROM _user_id THEN
      RAISE EXCEPTION 'Not authorized to award credits to another user';
    END IF;
    IF _kind NOT IN ('daily_login','task_completed','signup_bonus') THEN
      RAISE EXCEPTION 'Not authorized for this credit kind';
    END IF;
  END IF;

  INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
  VALUES (_user_id, GREATEST(_amount, 0), GREATEST(_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_credits.balance + _amount,
        lifetime_earned = public.user_credits.lifetime_earned + GREATEST(_amount, 0),
        updated_at = now()
  RETURNING * INTO result;

  IF result.balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, kind, reason, reference_id)
  VALUES (_user_id, _amount, _kind, _reason, _reference_id);

  RETURN result;
END;
$$;

-- Daily login grant — idempotent per day
CREATE OR REPLACE FUNCTION public.claim_daily_credits()
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
  current_row public.user_credits;
  result public.user_credits;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO current_row FROM public.user_credits WHERE user_id = caller;

  IF current_row.user_id IS NOT NULL AND current_row.last_daily_grant = CURRENT_DATE THEN
    RETURN current_row; -- already claimed today
  END IF;

  PERFORM public.award_credits(caller, 5, 'daily_login', 'Daily login bonus');

  UPDATE public.user_credits
     SET last_daily_grant = CURRENT_DATE
   WHERE user_id = caller
   RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Redeem reward atomically
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id UUID)
RETURNS public.redemptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
  reward_row public.rewards;
  current_balance INTEGER;
  redemption_row public.redemptions;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO reward_row FROM public.rewards WHERE id = _reward_id FOR UPDATE;
  IF NOT FOUND OR NOT reward_row.active THEN
    RAISE EXCEPTION 'Reward unavailable';
  END IF;

  IF reward_row.stock IS NOT NULL AND reward_row.stock <= 0 THEN
    RAISE EXCEPTION 'Out of stock';
  END IF;

  SELECT balance INTO current_balance FROM public.user_credits
   WHERE user_id = caller FOR UPDATE;

  IF current_balance IS NULL OR current_balance < reward_row.cost THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE public.user_credits
     SET balance = balance - reward_row.cost,
         updated_at = now()
   WHERE user_id = caller;

  INSERT INTO public.credit_transactions (user_id, amount, kind, reason, reference_id)
  VALUES (caller, -reward_row.cost, 'redemption', reward_row.title, reward_row.id);

  IF reward_row.stock IS NOT NULL THEN
    UPDATE public.rewards SET stock = stock - 1 WHERE id = reward_row.id;
  END IF;

  INSERT INTO public.redemptions (user_id, reward_id, cost_at_purchase)
  VALUES (caller, reward_row.id, reward_row.cost)
  RETURNING * INTO redemption_row;

  RETURN redemption_row;
END;
$$;

-- =======================================================
-- 6. SIGNUP BONUS — extend handle_new_user
-- =======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1))
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
  VALUES (NEW.id, 50, 50)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, amount, kind, reason)
  VALUES (NEW.id, 50, 'signup_bonus', 'Welcome bonus');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =======================================================
-- 7. TASK COMPLETION BONUS
-- =======================================================
CREATE OR REPLACE FUNCTION public.award_task_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.completed = true AND COALESCE(OLD.completed, false) = false THEN
    PERFORM public.award_credits(NEW.user_id, 10, 'task_completed',
      'Completed: ' || NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assignment_completion ON public.assignments;
CREATE TRIGGER trg_assignment_completion
  AFTER UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.award_task_completion();

-- Backfill: ensure every existing user has a credits row
INSERT INTO public.user_credits (user_id, balance, lifetime_earned)
SELECT id, 0, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
