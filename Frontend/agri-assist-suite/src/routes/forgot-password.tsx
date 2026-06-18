import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { FloatingInput } from "@/components/FloatingInput";
import { api, extractErrorMessage } from "@/lib/api";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Mazr3tk" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/api/forgot-password", { email });
      sessionStorage.setItem("mazr3tk_reset_email", email);
      router.navigate({ to: "/reset-password" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <SiteShell>
      <section className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to verify your account.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
          {error && (
            <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.split("\n").map((line, i) => <p key={i}>{line.trim()}</p>)}
            </div>
          )}
          <FloatingInput type="email" name="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Checking…" : "Continue"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="font-medium text-primary">Sign in</Link>
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
