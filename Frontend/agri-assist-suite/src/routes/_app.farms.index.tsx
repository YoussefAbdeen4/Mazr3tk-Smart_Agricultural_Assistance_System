import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { EG_GOVERNORATES } from "@/lib/governorates";
import { Loader } from "@/components/Loader";
import { Plus, MapPin, Ruler, Sprout, X } from "lucide-react";

export const Route = createFileRoute("/_app/farms/")({
  head: () => ({ meta: [{ title: "Farms — Mazr3tk" }] }),
  component: FarmsPage,
});

interface Farm {
  id: number; name: string; area: string; location: string; soil_type: string; img: string | null;
}

function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/farms");
      setFarms(res.data?.data ?? []);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">My Farms</h1>
          <p className="mt-2 text-muted-foreground">All your registered farms in one place.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl gradient-hero px-5 py-2.5 font-semibold text-primary-foreground shadow-soft">
          <Plus className="h-4 w-4" /> New farm
        </button>
      </div>

      {loading ? <Loader /> : error ? (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>
      ) : farms.length === 0 ? (
        <div className="glass-card mt-8 rounded-2xl p-12 text-center">
          <Sprout className="mx-auto h-12 w-12 text-primary/60" />
          <p className="mt-4 font-semibold">No farms yet</p>
          <p className="text-sm text-muted-foreground">Create your first farm to get started.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((f) => (
            <div key={f.id} className="glass-card group flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-soft">
              <Link to="/farms/$farmId" params={{ farmId: String(f.id) }} className="block">
                <div className="aspect-video w-full overflow-hidden bg-secondary">
                  {f.img ? (
                    <img src={f.img} alt={f.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center"><Sprout className="h-10 w-10 text-primary/40" /></div>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Link to="/farms/$farmId" params={{ farmId: String(f.id) }} className="block">
                  <h3 className="font-display text-lg font-bold hover:text-primary">{f.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{f.location}</span>
                    <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{f.area} m²</span>
                    <span className="inline-flex items-center gap-1"><Sprout className="h-3.5 w-3.5" />{f.soil_type}</span>
                  </div>
                </Link>
                <Link to="/farms/$farmId" params={{ farmId: String(f.id) }} className="mt-auto inline-flex w-full items-center justify-center rounded-lg gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <CreateFarmModal onClose={() => setOpen(false)} onCreated={() => { setOpen(false); void load(); }} />}
    </section>
  );
}

function CreateFarmModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Cairo");
  const [area, setArea] = useState("");
  const [soil, setSoil] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("location", location);
      fd.append("area", area);
      fd.append("soil_type", soil);
      if (img) fd.append("img", img);
      await api.post("/api/farms", fd);
      onCreated();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Create farm</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Farm name" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary">
            {EG_GOVERNORATES.map((g) => <option key={g.en} value={g.en}>{g.en} — {g.ar}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area (m²)" required className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
            <input value={soil} onChange={(e) => setSoil(e.target.value)} placeholder="Soil type" required className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-6 text-sm">
            <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] ?? null)} className="hidden" />
            {img ? img.name : "Upload farm image"}
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 font-medium">Cancel</button>
          <button disabled={loading} className="flex-1 rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
