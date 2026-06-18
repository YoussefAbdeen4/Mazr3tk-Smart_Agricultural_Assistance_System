import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { FloatingInput } from "@/components/FloatingInput";
import { api, extractErrorMessage } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Mazr3tk" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("mazr3tk_reset_email");
    if (stored) setEmail(stored);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/api/reset-password", {
        email,
        password,
        password_confirmation: confirm,
      });
      sessionStorage.removeItem("mazr3tk_reset_email");
      router.navigate({ to: "/login" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <SiteShell>
      <section className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
          {error && (
            <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.split("\n").map((line, i) => <p key={i}>{line.trim()}</p>)}
            </div>
          )}
          <FloatingInput type="email" name="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FloatingInput type="password" name="password" label="New password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <FloatingInput type="password" name="password_confirmation" label="Confirm new password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Saving…" : "Reset password"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary">Back to sign in</Link>
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
