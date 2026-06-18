import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { FloatingInput } from "@/components/FloatingInput";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Mazr3tk" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", handle: "",
    phone: "", password: "", password_confirmation: "", role: "farmer",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await api.post("/api/register", fd);
      const data = res.data?.data;
      const user = data?.user ?? data;
      const token = user?.token ?? data?.token;
      if (token) setSession(user, token);
      // trigger verification email
      try { await api.post("/api/email/verification-notification"); } catch { /* ignore */ }
      router.navigate({ to: "/verify-email" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <section className="container mx-auto flex max-w-xl flex-col px-4 py-12">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground"><Leaf className="h-6 w-6" /></span>
          <h1 className="mt-4 font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join farmers and engineers across Egypt.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
          {error && (
            <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.split("\n").map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput name="first_name" label="First name" required value={form.first_name} onChange={set("first_name")} />
            <FloatingInput name="last_name" label="Last name" required value={form.last_name} onChange={set("last_name")} />
          </div>
          <FloatingInput type="email" name="email" label="Email" required value={form.email} onChange={set("email")} />
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput name="handle" label="Handle (@)" required value={form.handle} onChange={set("handle")} />
            <FloatingInput name="phone" label="Phone" required value={form.phone} onChange={set("phone")} />
          </div>
          <div className="floating-label">
            <select
              id="role" name="role" value={form.role} onChange={set("role")}
              className="floating-input appearance-none pr-10"
            >
              <option value="farmer">Farmer</option>
              <option value="engineer">Engineer</option>
            </select>
            <label htmlFor="role" className="floating-text-label text-sm" style={{ transform: "translateY(-0.55rem) scale(0.8)", color: "var(--color-primary)" }}>Role</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput type="password" name="password" label="Password" required value={form.password} onChange={set("password")} />
            <FloatingInput type="password" name="password_confirmation" label="Confirm password" required value={form.password_confirmation} onChange={set("password_confirmation")} />
          </div>
          <button disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have one? <Link to="/login" className="font-medium text-primary">Sign in</Link>
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
