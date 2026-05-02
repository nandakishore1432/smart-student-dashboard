import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const receivedHeaders: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    // Redact bearer token but keep prefix/length so we can verify it was sent.
    if (k.toLowerCase() === "authorization") {
      const isBearer = v.startsWith("Bearer ");
      const tok = isBearer ? v.slice(7) : v;
      receivedHeaders[k] = `${isBearer ? "Bearer " : ""}${tok.slice(0, 12)}…(${tok.length} chars)`;
    } else if (k.toLowerCase() === "apikey") {
      receivedHeaders[k] = `${v.slice(0, 12)}…(${v.length} chars)`;
    } else {
      receivedHeaders[k] = v;
    }
  });

  const result: any = {
    method: req.method,
    received_headers: receivedHeaders,
    has_authorization: !!req.headers.get("Authorization"),
    has_apikey: !!req.headers.get("apikey"),
    env_ok: {
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SUPABASE_ANON_KEY: !!Deno.env.get("SUPABASE_ANON_KEY"),
      LOVABLE_API_KEY: !!Deno.env.get("LOVABLE_API_KEY"),
    },
    timestamp: new Date().toISOString(),
  };

  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        result.auth = { ok: false, error: error.message };
      } else {
        result.auth = {
          ok: true,
          user_id: data.user?.id,
          email: data.user?.email,
          role: data.user?.role,
          aud: data.user?.aud,
        };
      }
    } catch (e) {
      result.auth = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    result.auth = { ok: false, error: "No Authorization header" };
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
