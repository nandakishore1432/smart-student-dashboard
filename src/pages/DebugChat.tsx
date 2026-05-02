import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type AuthProbe = {
  status: number;
  body: any;
};

type ChatProbe = {
  status: number;
  headers: Record<string, string>;
  preview: string;
  totalChars: number;
  events: number;
  error?: string;
};

export default function DebugChat() {
  const { user, session } = useAuth();
  const [prompt, setPrompt] = useState("Say hello in 5 words.");
  const [authResult, setAuthResult] = useState<AuthProbe | null>(null);
  const [chatResult, setChatResult] = useState<ChatProbe | null>(null);
  const [tokenInfo, setTokenInfo] = useState<string>("(none yet)");
  const [busy, setBusy] = useState(false);

  const refreshToken = async () => {
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token ?? null;
    if (!t) {
      setTokenInfo("No active session — please log in.");
      return null;
    }
    setTokenInfo(`Bearer ${t.slice(0, 16)}… (${t.length} chars), expires ${new Date((data.session?.expires_at ?? 0) * 1000).toLocaleTimeString()}`);
    return t;
  };

  const runAuthProbe = async () => {
    setBusy(true);
    setAuthResult(null);
    try {
      const token = await refreshToken();
      if (!token) return;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/debug-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ ping: true }),
      });
      const body = await resp.json().catch(() => ({ raw: "non-json" }));
      setAuthResult({ status: resp.status, body });
    } catch (e) {
      setAuthResult({ status: 0, body: { error: e instanceof Error ? e.message : String(e) } });
    } finally {
      setBusy(false);
    }
  };

  const runChatProbe = async () => {
    setBusy(true);
    setChatResult(null);
    try {
      const token = await refreshToken();
      if (!token) return;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          context: "Debug probe from /debug-chat",
        }),
      });

      const headers: Record<string, string> = {};
      resp.headers.forEach((v, k) => (headers[k] = v));

      if (!resp.ok || !resp.body) {
        const text = await resp.text();
        setChatResult({ status: resp.status, headers, preview: text.slice(0, 500), totalChars: text.length, events: 0, error: "non-ok" });
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assembled = "";
      let events = 0;
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) { assembled += c; events += 1; }
          } catch { /* partial */ }
        }
      }
      setChatResult({ status: resp.status, headers, preview: assembled.slice(0, 500), totalChars: assembled.length, events });
    } catch (e) {
      setChatResult({ status: 0, headers: {}, preview: "", totalChars: 0, events: 0, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Edge Function Debug</h1>
        <p className="text-sm text-muted-foreground">Verify Authorization header + claims for ai-chat.</p>
      </div>

      <GlassCard hover={false}>
        <div className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">User:</span> {user?.email ?? "(not logged in)"}</div>
          <div><span className="text-muted-foreground">User ID:</span> <code className="text-xs">{user?.id ?? "—"}</code></div>
          <div><span className="text-muted-foreground">Session:</span> {session ? "active" : "none"}</div>
          <div><span className="text-muted-foreground">Token:</span> <code className="text-xs break-all">{tokenInfo}</code></div>
          <Button size="sm" variant="outline" onClick={refreshToken} className="mt-2">Refresh token info</Button>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="space-y-3">
          <h2 className="font-semibold">1. Auth probe → /debug-auth</h2>
          <p className="text-xs text-muted-foreground">Echoes headers received by the edge function and resolves the user via getUser().</p>
          <Button onClick={runAuthProbe} disabled={busy} variant="gradient">Run auth probe</Button>
          {authResult && (
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-96">
{`status: ${authResult.status}\n\n${JSON.stringify(authResult.body, null, 2)}`}
            </pre>
          )}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="space-y-3">
          <h2 className="font-semibold">2. Chat probe → /ai-chat</h2>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="bg-muted/50" />
          <Button onClick={runChatProbe} disabled={busy} variant="gradient">Run chat probe</Button>
          {chatResult && (
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-96">
{`status: ${chatResult.status}
events: ${chatResult.events}
totalChars: ${chatResult.totalChars}
${chatResult.error ? `error: ${chatResult.error}\n` : ""}
--- response headers ---
${Object.entries(chatResult.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}

--- assistant preview ---
${chatResult.preview}`}
            </pre>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
