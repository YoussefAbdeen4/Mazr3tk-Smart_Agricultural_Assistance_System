import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verify email — Mazr3tk" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => { const n = [...d]; n[i] = c; return n; });
    if (c && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) { setError("Enter the 6-digit code."); return; }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("code", code);
      await api.post("/api/verify-email", fd);
      await refreshProfile();
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setInfo(null); setError(null);
    try {
      await api.post("/api/email/verification-notification");
      setInfo("A new code is on the way.");
    } catch (err) { setError(extractErrorMessage(err)); }
  };

  return (
    <SiteShell>
      <section className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-hero text-primary-foreground">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code we sent to verify your account.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
          {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {info && <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{info}</div>}
          <div className="flex justify-between gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-12 rounded-xl border border-border bg-background text-center font-display text-2xl font-bold outline-none focus:border-primary"
              />
            ))}
          </div>
          <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button type="button" onClick={resend} className="w-full text-sm text-muted-foreground hover:text-primary">
            Resend code
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
