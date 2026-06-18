import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { EG_GOVERNORATES } from "@/lib/governorates";
import { CloudSun, Droplets, Wind, Thermometer } from "lucide-react";

export const Route = createFileRoute("/_app/weather")({
  head: () => ({ meta: [{ title: "Weather — Mazr3tk" }] }),
  component: WeatherPage,
});

interface WeatherData {
  city: string; country: string; status: string;
  measurements: { temperature: number; temp_max: number; temp_min: number; humidity: string };
  wind_speed: string;
}

function WeatherPage() {
  const [city, setCity] = useState("Cairo");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (target?: string) => {
    setLoading(true); setError(null);
    try {
      const gov = EG_GOVERNORATES.find((g) => g.en === (target ?? city));
      const cityName = gov ? (lang === "ar" ? gov.ar : gov.en) : (target ?? city);
      const res = await api.post("/api/weather", { city: cityName });
      setData(res.data?.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Weather</h1>
      <p className="mt-2 text-muted-foreground">Choose an Egyptian governorate to see current conditions.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="glass-card space-y-4 rounded-2xl p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Language</label>
            <div className="flex gap-2">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${lang === l ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}
                >{l === "en" ? "English" : "العربية"}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Governorate</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-primary"
            >
              {EG_GOVERNORATES.map((g) => (
                <option key={g.en} value={g.en}>{lang === "ar" ? g.ar : g.en}</option>
              ))}
            </select>
          </div>
          <button onClick={() => fetchWeather()} disabled={loading} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Loading…" : "Get weather"}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="glass-card flex min-h-[20rem] items-center justify-center rounded-2xl p-8">
          {!data ? (
            <div className="text-center text-muted-foreground">
              <CloudSun className="mx-auto h-16 w-16 text-primary/50" />
              <p className="mt-4">Pick a governorate to see weather details.</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold">{data.city}</h2>
                  <p className="text-muted-foreground">{data.country} · {data.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-6xl font-bold text-primary">{Math.round(data.measurements.temperature)}°</p>
                  <p className="text-sm text-muted-foreground">{Math.round(data.measurements.temp_min)}° / {Math.round(data.measurements.temp_max)}°</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-secondary/60 p-4">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">Feels</p>
                  <p className="font-semibold">{Math.round(data.measurements.temperature)}°C</p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-4">
                  <Droplets className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{data.measurements.humidity}</p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-4">
                  <Wind className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold">{data.wind_speed}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
