import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, extractErrorMessage, resolveImageUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FloatingInput } from "@/components/FloatingInput";
import { Loader } from "@/components/Loader";
import { Sprout, Users, Mail, Phone, Pencil } from "lucide-react";

export const Route = createFileRoute("/_app/profile/")({
  head: () => ({ meta: [{ title: "My Profile — Mazr3tk" }] }),
  component: ProfilePage,
});

interface ProfileFarm { id: number; name: string; img?: string | null; location?: string; area?: string }
interface ProfileStaff { id: number; handle: string; first_name?: string; last_name?: string; img?: string | null }

function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [farms, setFarms] = useState<ProfileFarm[]>([]);
  const [staff, setStaff] = useState<ProfileStaff[]>([]);
  const [blogsCount, setBlogsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/profile");
        // API returns { data: { user: { ..., farms: [...], staff: [...] } } }
        const u = res.data?.data?.user ?? res.data?.data ?? {};
        setFarms(Array.isArray(u.farms) ? u.farms : []);
        setStaff(Array.isArray(u.staff) ? u.staff : []);
        setBlogsCount(Array.isArray(u.blogs) ? u.blogs.length : (u.blogs_count ?? 0));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Loader />;

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "?";
  const avatarUrl = resolveImageUrl(user?.img, "Profile");

  return (
    <section className="container mx-auto max-w-4xl px-4 py-12">
      <div className="glass-card flex flex-wrap items-center gap-6 rounded-2xl p-6">
        <Avatar src={avatarUrl} initials={initials} />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
          <p className="text-muted-foreground">@{user?.handle} · {user?.role}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{user?.email}</span>
            {user?.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{user.phone}</span>}
          </div>
        </div>
        <button onClick={() => setEditing((v) => !v)} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
          <Pencil className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing && <EditProfileForm onDone={() => { setEditing(false); void refreshProfile(); }} />}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Sprout} label="Farms" value={farms.length} />
        <StatCard icon={Users} label="Staff" value={staff.length} />
        <StatCard icon={Mail} label="Posts" value={blogsCount} />
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">My farms</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {farms.length === 0 ? <p className="text-sm text-muted-foreground">No farms yet.</p> : farms.map((f) => {
          const farmImg = resolveImageUrl(f.img, "Farm");
          return (
          <div key={f.id} className="glass-card overflow-hidden rounded-2xl">
            {farmImg && <img src={farmImg} alt={f.name} className="aspect-video w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
            <div className="p-3">
              <p className="font-medium">{f.name}</p>
              {f.location && <p className="text-xs text-muted-foreground">{f.location}</p>}
            </div>
          </div>
          );
        })}
      </div>

      {user?.role === "engineer" && (
        <>
          <h2 className="mt-10 font-display text-xl font-bold">My staff</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {staff.length === 0 ? <p className="text-sm text-muted-foreground">No staff assigned yet.</p> : staff.map((s) => (
              <div key={s.id} className="glass-card rounded-xl p-3">@{s.handle} — {s.first_name}</div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl p-4">
      <div className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-primary-foreground"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Avatar({ src, initials }: { src: string | null; initials: string }) {
  const [error, setError] = useState(false);
  if (src && !error) {
    return (
      <img
        src={src}
        alt="Profile"
        onError={() => setError(true)}
        className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/30"
      />
    );
  }
  return (
    <div className="grid h-20 w-20 place-items-center rounded-full gradient-hero text-2xl font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

function EditProfileForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "", last_name: user?.last_name ?? "",
    handle: user?.handle ?? "", phone: user?.phone ?? "",
  });
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (img) fd.append("img", img);
      await api.post("/api/profile/update", fd);
      onDone();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="glass-card mt-4 space-y-4 rounded-2xl p-6">
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <FloatingInput label="First name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
        <FloatingInput label="Last name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
      </div>
      <FloatingInput label="Handle" value={form.handle} onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))} />
      <FloatingInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-4 text-sm">
        <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] ?? null)} className="hidden" />
        {img ? img.name : "Change profile picture"}
      </label>
      <button disabled={loading} className="w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
