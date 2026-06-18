import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { FloatingInput } from "@/components/FloatingInput";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Mazr3tk" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await api.post("/api/login", { email, password });
      const data = res.data?.data;
      const user = data?.user ?? data;
      const token = user?.token ?? data?.token;
      if (!token) throw new Error("Login failed: no token returned.");
      setSession(user, token);
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <SiteShell>
      <section className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your farms.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
          {error && (
            <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.split("\n").map((line, i) => <p key={i}>{line.trim()}</p>)}
            </div>
          )}
          <FloatingInput type="email" name="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FloatingInput type="password" name="password" label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
          </div>
          <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            No account? <Link to="/register" className="font-medium text-primary">Register</Link>
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
