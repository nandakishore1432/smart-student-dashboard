
REVOKE EXECUTE ON FUNCTION public.award_credits(UUID, INTEGER, public.credit_tx_kind, TEXT, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_credits() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_reward(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.claim_daily_credits() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_credits(UUID, INTEGER, public.credit_tx_kind, TEXT, UUID) TO authenticated;
