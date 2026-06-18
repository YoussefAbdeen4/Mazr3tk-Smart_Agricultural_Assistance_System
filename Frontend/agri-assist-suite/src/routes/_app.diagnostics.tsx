import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Bug, Leaf, Sprout, Upload, Wheat, AlertTriangle, ShieldCheck, Stethoscope, Info, Calendar, Wind } from "lucide-react";

export const Route = createFileRoute("/_app/diagnostics")({
  head: () => ({ meta: [{ title: "Diagnostics — Mazr3tk" }] }),
  component: DiagnosticsPage,
});

type Tab = "disease" | "pest" | "yield";

function DiagnosticsPage() {
  const [tab, setTab] = useState<Tab>("disease");
  return (
    <section className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold md:text-4xl">AI Diagnostics</h1>
      <p className="mt-2 text-muted-foreground">Detect plant diseases, identify pests, and predict crop yields.</p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {([
          { k: "disease" as const, label: "Plant Disease", icon: Leaf },
          { k: "pest" as const, label: "Pest", icon: Bug },
          { k: "yield" as const, label: "Crop Yield", icon: Wheat },
        ]).map(({ k, label, icon: Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "disease" && <PlantDisease />}
        {tab === "pest" && <PestDetection />}
        {tab === "yield" && <CropYield />}
      </div>
    </section>
  );
}

function ErrorBlock({ error }: { error: string | null }) {
  if (!error) return null;
  const lines = error.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {lines.length <= 1 ? <p>{error}</p> : lines.map((l, i) => <p key={i}>• {l}</p>)}
    </div>
  );
}

function ImageDropper({ file, setFile }: { file: File | null; setFile: (f: File | null) => void }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-sm transition-colors hover:bg-secondary/60">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      {preview ? (
        <img src={preview} alt="" className="max-h-56 rounded-lg object-contain" />
      ) : (
        <>
          <Upload className="h-8 w-8 text-primary" />
          <span>Click to upload an image</span>
          <span className="text-xs text-muted-foreground">JPG or PNG up to 10MB</span>
        </>
      )}
    </label>
  );
}

function SeverityPill({ value }: { value?: string }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const tone = /high|severe|عالي|شديد|خطير/.test(v)
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : /low|خفيف|بسيط/.test(v)
    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      <AlertTriangle className="h-3 w-3" /> {value}
    </span>
  );
}

function PlantDisease() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null); setLoading(true); setData(null);
    try {
      const fd = new FormData();
      fd.append("img", file);
      const res = await api.post("/api/plant-disease-detection", fd);
      setData(res.data?.data ?? null);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageDropper file={file} setFile={setFile} />
      <ErrorBlock error={error} />
      <button disabled={!file || loading} className="w-full rounded-xl gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
        {loading ? "Analyzing…" : "Diagnose plant"}
      </button>

      {data && (
        <div className="space-y-4">
          {data.diagnosis && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Plant</p>
                  <h3 className="font-display text-2xl font-bold">{data.diagnosis.plant_name}</h3>
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">Disease: </span>
                    <span className="font-semibold">{data.diagnosis.disease_name}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">{data.diagnosis.status}</span>
                  <SeverityPill value={data.diagnosis.severity} />
                </div>
              </div>
            </div>
          )}

          {data.action_plan && (
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard icon={Stethoscope} title="Treatment" body={data.action_plan.treatment} tone="primary" />
              <InfoCard icon={ShieldCheck} title="Prevention" body={data.action_plan.prevention} tone="emerald" />
              <InfoCard icon={AlertTriangle} title="Pesticides" body={data.action_plan.pesticides} tone="amber" />
            </div>
          )}

          {data.advice && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">Advice</p>
              <p className="mt-1">{data.advice}</p>
            </div>
          )}
          {data.disclaimer && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {data.disclaimer}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

function InfoCard({
  icon: Icon, title, body, tone,
}: { icon: React.ComponentType<{ className?: string }>; title: string; body?: string; tone: "primary" | "emerald" | "amber" }) {
  if (!body) return null;
  const tones = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <p className="mt-2 text-sm text-foreground">{body}</p>
    </div>
  );
}

function PestDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null); setLoading(true); setData(null);
    try {
      const fd = new FormData();
      fd.append("img", file);
      const res = await api.post("/api/pest-detection", fd);
      setData(res.data?.data ?? null);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageDropper file={file} setFile={setFile} />
      <ErrorBlock error={error} />
      <button disabled={!file || loading} className="w-full rounded-xl gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
        {loading ? "Analyzing…" : "Identify pest"}
      </button>

      {data && (
        <div className="space-y-4">
          {data.insect && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Identified pest</p>
                  <h3 className="font-display text-2xl font-bold">{data.insect.name}</h3>
                  {data.insect.name_en && <p className="text-sm text-muted-foreground">{data.insect.name_en}</p>}
                </div>
                {data.insect.danger_level && (
                  <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                    {data.insect.danger_level}
                  </span>
                )}
              </div>
            </div>
          )}

          {data.details && (
            <div className="glass-card space-y-3 rounded-2xl p-5 text-sm">
              {data.details.description && <p>{data.details.description}</p>}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {Array.isArray(data.details.affected_crops) && data.details.affected_crops.length > 0 && (
                  <span className="inline-flex items-center gap-1"><Sprout className="h-3.5 w-3.5" /> {data.details.affected_crops.join(", ")}</span>
                )}
                {data.details.season && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {data.details.season}</span>}
              </div>
            </div>
          )}

          {data.recommendation && (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={Stethoscope} title="Action" body={data.recommendation.action} tone="primary" />
              <InfoCard icon={AlertTriangle} title="Warning" body={data.recommendation.warning} tone="amber" />
            </div>
          )}

          {data.note && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {data.note}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

const CROP_TYPES = ["قمح", "ذرة", "أرز", "قطن", "طماطم", "بطاطس", "بصل", "فول"];
const REGIONS = ["شمال", "جنوب", "شرق", "غرب", "وسط"];
const SOIL_TYPES = ["طيني", "رملي", "طمي", "صخري", "خصب"];
const WEATHER = ["مشمس", "غائم", "ممطر", "حار", "بارد"];

function CropYield() {
  const [form, setForm] = useState({
    crop_type: CROP_TYPES[0],
    region: REGIONS[0],
    soil_type: SOIL_TYPES[0],
    weather_condition: WEATHER[0],
    rainfall_mm: 200,
    temperature_celsius: 28,
    days_to_harvest: 90,
    fertilizer_used: true,
    irrigation_used: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ result?: string; advice?: string } | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true); setData(null);
    try {
      const payload = {
        crop_type: form.crop_type,
        region: form.region,
        soil_type: form.soil_type,
        weather_condition: form.weather_condition,
        rainfall_mm: Number(form.rainfall_mm),
        temperature_celsius: Number(form.temperature_celsius),
        days_to_harvest: Number(form.days_to_harvest),
        fertilizer_used: form.fertilizer_used ? 1 : 0,
        irrigation_used: form.irrigation_used ? 1 : 0,
      };
      const res = await api.post("/api/crop_yield", payload, {
        headers: { "Content-Type": "application/json" },
      });
      const body = res.data ?? {};
      const d = body.data ?? body;
      setData({ result: d.result, advice: d.advice });
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Crop type" value={form.crop_type} options={CROP_TYPES} onChange={(v) => update("crop_type", v)} />
        <Select label="Region" value={form.region} options={REGIONS} onChange={(v) => update("region", v)} />
        <Select label="Soil type" value={form.soil_type} options={SOIL_TYPES} onChange={(v) => update("soil_type", v)} />
        <Select label="Weather" value={form.weather_condition} options={WEATHER} onChange={(v) => update("weather_condition", v)} />
        <NumInput label="Rainfall (mm)" value={form.rainfall_mm} onChange={(v) => update("rainfall_mm", v)} />
        <NumInput label="Temperature (°C)" value={form.temperature_celsius} onChange={(v) => update("temperature_celsius", v)} />
        <NumInput label="Days to harvest" value={form.days_to_harvest} onChange={(v) => update("days_to_harvest", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Toggle label="Fertilizer" value={form.fertilizer_used} onChange={(v) => update("fertilizer_used", v)} />
          <Toggle label="Irrigation" value={form.irrigation_used} onChange={(v) => update("irrigation_used", v)} />
        </div>
      </div>
      <ErrorBlock error={error} />
      <button disabled={loading} className="w-full rounded-xl gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
        {loading ? "Predicting…" : "Predict yield"}
      </button>
      {data && (
        <div className="glass-card rounded-2xl p-6">
          {data.result && (
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Predicted yield</p>
                <h3 className="font-display text-2xl font-bold">{data.result}</h3>
              </div>
            </div>
          )}
          {data.advice && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">Advice</p>
              <p className="mt-1">{data.advice}</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">{label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">{label}
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
    </label>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>
      {label}: {value ? "Yes" : "No"}
    </button>
  );
}

// Silences unused import warning when Wind icon isn't otherwise referenced.
void Wind;
