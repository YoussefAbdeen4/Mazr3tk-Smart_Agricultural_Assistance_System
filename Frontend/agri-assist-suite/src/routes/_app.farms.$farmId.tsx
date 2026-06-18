import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { EG_GOVERNORATES } from "@/lib/governorates";
import { Loader } from "@/components/Loader";
import { ArrowLeft, MapPin, Ruler, Sprout, Users, Trash2, Pencil, X, Plus, CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_app/farms/$farmId")({
  head: () => ({ meta: [{ title: "Farm — Mazr3tk" }] }),
  component: FarmDetailPage,
});

interface Farm { id: number; name: string; area: string; location: string; soil_type: string; img: string | null }
interface Plant { id: number; name: string; health_status?: string; growth_stage?: string; plans?: Plan[] }
interface Plan { id: number; name: string; irrigation_date?: string; fertilization_date?: string; note?: string; plants?: { id: number; name: string }[] }
interface AccessUser {
  id?: number; handle: string; first_name?: string; last_name?: string; role?: string; email?: string;
  pivot?: { user_id?: number; farm_id?: number; role?: string };
}

function FarmDetailPage() {
  const { farmId } = Route.useParams();
  const router = useRouter();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [access, setAccess] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "plants" | "plans" | "access">("overview");
  const [grantOpen, setGrantOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [plantOpen, setPlantOpen] = useState<Plant | "new" | null>(null);
  const [planOpen, setPlanOpen] = useState<Plan | "new" | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [farmRes, plantsRes, plansRes, accessRes] = await Promise.allSettled([
        api.get(`/api/farms/${farmId}`),
        api.get(`/api/farms/${farmId}/plants`),
        api.get(`/api/farms/${farmId}/plans`),
        api.get(`/api/farms/${farmId}/access-list`),
      ]);
      if (farmRes.status === "fulfilled") setFarm(farmRes.value.data?.data ?? null);
      if (plantsRes.status === "fulfilled") setPlants(plantsRes.value.data?.data?.plants ?? []);
      if (plansRes.status === "fulfilled") setPlans(plansRes.value.data?.data?.plans ?? []);
      if (accessRes.status === "fulfilled") setAccess(accessRes.value.data?.data?.users ?? []);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [farmId]);

  const remove = async () => {
    if (!confirm("Delete this farm?")) return;
    try { await api.delete(`/api/farms/${farmId}`); router.navigate({ to: "/farms" }); }
    catch (err) { alert(extractErrorMessage(err)); }
  };

  const revoke = async (u: AccessUser) => {
    const userId = u.pivot?.user_id ?? u.id;
    if (!userId) return;
    try {
      const fd = new FormData();
      fd.append("user_id", String(userId));
      await api.post(`/api/farms/${farmId}/revoke-access`, fd);
      void load();
    } catch (err) { alert(extractErrorMessage(err)); }
  };

  const deletePlant = async (p: Plant) => {
    if (!confirm(`Delete plant "${p.name}"?`)) return;
    try { await api.delete(`/api/farms/${farmId}/plants/${p.id}`); void load(); }
    catch (err) { alert(extractErrorMessage(err)); }
  };
  const deletePlan = async (p: Plan) => {
    if (!confirm(`Delete plan "${p.name}"?`)) return;
    try { await api.delete(`/api/farms/${farmId}/plans/${p.id}`); void load(); }
    catch (err) { alert(extractErrorMessage(err)); }
  };

  if (loading) return <Loader />;
  if (error || !farm) return <div className="container mx-auto px-4 py-12 text-destructive">{error ?? "Farm not found."}</div>;

  return (
    <section className="container mx-auto px-4 py-12">
      <Link to="/farms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to farms
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl glass-card">
        {farm.img && <img src={farm.img} alt={farm.name} className="h-64 w-full object-cover" />}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{farm.name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{farm.location}</span>
              <span className="inline-flex items-center gap-1"><Ruler className="h-4 w-4" />{farm.area} m²</span>
              <span className="inline-flex items-center gap-1"><Sprout className="h-4 w-4" />{farm.soil_type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"><Pencil className="h-4 w-4" />Edit</button>
            <button onClick={remove} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" />Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {(["overview", "plants", "plans", "access"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "plants" ? `Plants (${plants.length})` : t === "plans" ? `Plans (${plans.length})` : t === "access" ? `Access (${access.length})` : "Overview"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold">Farm summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">Manage plants, plans, and team access using the tabs above.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Stat label="Plants" value={plants.length} />
              <Stat label="Plans" value={plans.length} />
              <Stat label="Members" value={access.length} />
            </div>
          </div>
        )}

        {tab === "plants" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={() => setPlantOpen("new")} className="inline-flex items-center gap-2 rounded-lg gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Add plant
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plants.length === 0 ? (
                <div className="glass-card col-span-full rounded-2xl p-8 text-center text-muted-foreground">No plants yet.</div>
              ) : plants.map((p) => (
                <div key={p.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPlantOpen(p)} className="grid h-7 w-7 place-items-center rounded hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deletePlant(p)} className="grid h-7 w-7 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {p.health_status && <p className="mt-1 text-xs text-muted-foreground">Health: {p.health_status}</p>}
                  {p.growth_stage && <p className="text-xs text-muted-foreground">Stage: {p.growth_stage}</p>}
                  {p.plans && p.plans.length > 0 && (
                    <p className="mt-2 text-xs text-primary">{p.plans.length} plan(s)</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={() => setPlanOpen("new")} className="inline-flex items-center gap-2 rounded-lg gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Add plan
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.length === 0 ? (
                <div className="glass-card col-span-full rounded-2xl p-8 text-center text-muted-foreground">No plans yet.</div>
              ) : plans.map((p) => (
                <div key={p.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold inline-flex items-center gap-2"><CalendarRange className="h-4 w-4 text-primary" /> {p.name}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPlanOpen(p)} className="grid h-7 w-7 place-items-center rounded hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deletePlan(p)} className="grid h-7 w-7 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {p.irrigation_date && <p className="mt-2 text-xs text-muted-foreground">Irrigation: {p.irrigation_date.slice(0, 10)}</p>}
                  {p.fertilization_date && <p className="text-xs text-muted-foreground">Fertilization: {p.fertilization_date.slice(0, 10)}</p>}
                  {p.note && <p className="mt-2 text-sm">{p.note}</p>}
                  {p.plants && p.plants.length > 0 && (
                    <p className="mt-2 text-xs text-primary">Plants: {p.plants.map((pl) => pl.name).join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "access" && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={() => setGrantOpen(true)} className="inline-flex items-center gap-2 rounded-lg gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Grant access
              </button>
            </div>
            <div className="glass-card overflow-hidden rounded-2xl">
              {access.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-3">No one else has access yet.</p>
                </div>
              ) : access.map((u) => (
                <div key={u.handle} className="flex items-center justify-between border-b border-border p-4 last:border-0">
                  <div>
                    <p className="font-medium">{u.first_name} {u.last_name} <span className="text-muted-foreground">@{u.handle}</span></p>
                    <p className="text-xs text-muted-foreground">{u.pivot?.role ?? u.role}</p>
                  </div>
                  <button onClick={() => revoke(u)} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">Revoke</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {grantOpen && <GrantAccessModal farmId={farmId} onClose={() => setGrantOpen(false)} onDone={() => { setGrantOpen(false); void load(); }} />}
      {editOpen && farm && <EditFarmModal farm={farm} onClose={() => setEditOpen(false)} onDone={() => { setEditOpen(false); void load(); }} />}
      {plantOpen && <PlantModal farmId={farmId} plant={plantOpen === "new" ? null : plantOpen} onClose={() => setPlantOpen(null)} onDone={() => { setPlantOpen(null); void load(); }} />}
      {planOpen && <PlanModal farmId={farmId} plan={planOpen === "new" ? null : planOpen} plants={plants} onClose={() => setPlanOpen(null)} onDone={() => { setPlanOpen(null); void load(); }} />}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBlock({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="mb-3 space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {error.split("\n").map((l, i) => <p key={i}>{l.trim()}</p>)}
    </div>
  );
}

function GrantAccessModal({ farmId, onClose, onDone }: { farmId: string; onClose: () => void; onDone: () => void }) {
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("handle", handle);
      fd.append("role", role);
      await api.post(`/api/farms/${farmId}/grant-access`, fd);
      onDone();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };
  return (
    <ModalShell title="Grant access" onClose={onClose}>
      <form onSubmit={submit}>
        <ErrorBlock error={error} />
        <div className="space-y-3">
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="User handle (e.g. Osmaaaan9)" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
          <select value={role} onChange={(e) => setRole(e.target.value as "viewer" | "editor")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button disabled={loading} className="mt-5 w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Granting…" : "Grant access"}
        </button>
      </form>
    </ModalShell>
  );
}

function EditFarmModal({ farm, onClose, onDone }: { farm: Farm; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location);
  const [area, setArea] = useState(farm.area);
  const [soil, setSoil] = useState(farm.soil_type);
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("location", location);
      fd.append("area", area);
      fd.append("soil_type", soil);
      if (img) fd.append("img", img);
      await api.post(`/api/farms/${farm.id}`, fd);
      onDone();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };
  return (
    <ModalShell title="Edit farm" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBlock error={error} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Farm name" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5">
          {EG_GOVERNORATES.map((g) => <option key={g.en} value={g.en}>{g.en} — {g.ar}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area (m²)" required className="rounded-lg border border-border bg-background px-3 py-2.5" />
          <input value={soil} onChange={(e) => setSoil(e.target.value)} placeholder="Soil type" required className="rounded-lg border border-border bg-background px-3 py-2.5" />
        </div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-4 text-sm">
          <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] ?? null)} className="hidden" />
          {img ? img.name : "Replace farm image"}
        </label>
        <button disabled={loading} className="w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </ModalShell>
  );
}

function PlantModal({ farmId, plant, onClose, onDone }: { farmId: string; plant: Plant | null; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(plant?.name ?? "");
  const [health, setHealth] = useState(plant?.health_status ?? "good");
  const [stage, setStage] = useState(plant?.growth_stage ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("health_status", health);
      fd.append("growth_stage", stage);
      if (plant) await api.post(`/api/farms/${farmId}/plants/${plant.id}`, fd);
      else await api.post(`/api/farms/${farmId}/plants`, fd);
      onDone();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };
  return (
    <ModalShell title={plant ? "Edit plant" : "Add plant"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBlock error={error} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Plant name (e.g. طماطم)" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        <input value={health} onChange={(e) => setHealth(e.target.value)} placeholder="Health status" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        <input value={stage} onChange={(e) => setStage(e.target.value)} placeholder="Growth stage" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        <button disabled={loading} className="w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Saving…" : plant ? "Save changes" : "Create plant"}
        </button>
      </form>
    </ModalShell>
  );
}

function PlanModal({ farmId, plan, plants, onClose, onDone }: { farmId: string; plan: Plan | null; plants: Plant[]; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(plan?.name ?? "");
  const [irrigation, setIrrigation] = useState((plan?.irrigation_date ?? "").slice(0, 10));
  const [fertilization, setFertilization] = useState((plan?.fertilization_date ?? "").slice(0, 10));
  const [note, setNote] = useState(plan?.note ?? "");
  const [plantIds, setPlantIds] = useState<number[]>(plan?.plants?.map((p) => p.id) ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: number) => setPlantIds((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("irrigation_date", irrigation);
      fd.append("fertilization_date", fertilization);
      fd.append("note", note);
      plantIds.forEach((id) => fd.append("plant_ids[]", String(id)));
      if (plan) await api.post(`/api/farms/${farmId}/plans/${plan.id}`, fd);
      else await api.post(`/api/farms/${farmId}/plans`, fd);
      onDone();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title={plan ? "Edit plan" : "Add plan"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBlock error={error} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Plan name" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">Irrigation date
            <input type="date" value={irrigation} onChange={(e) => setIrrigation(e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="text-xs text-muted-foreground">Fertilization date
            <input type="date" value={fertilization} onChange={(e) => setFertilization(e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes" rows={3} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5" />
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Linked plants</p>
          {plants.length === 0 ? <p className="text-xs text-muted-foreground">No plants — create some first.</p> : (
            <div className="flex flex-wrap gap-2">
              {plants.map((p) => (
                <button key={p.id} type="button" onClick={() => toggle(p.id)} className={`rounded-full border px-3 py-1 text-xs ${plantIds.includes(p.id) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>{p.name}</button>
              ))}
            </div>
          )}
        </div>
        <button disabled={loading} className="w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Saving…" : plan ? "Save changes" : "Create plan"}
        </button>
      </form>
    </ModalShell>
  );
}
