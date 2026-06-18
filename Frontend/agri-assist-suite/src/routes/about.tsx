import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Brain, Target, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mazr3tk" },
      { name: "description", content: "Mazr3tk empowers farmers with AI-driven disease diagnosis, accurate weather, and an expert community." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-extrabold md:text-6xl">
            Built for the people who feed us.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Mazr3tk brings clear, AI-powered guidance to every field. Spot problems early, plan around the weather, and learn from a community of farmers and agricultural engineers — all from one calm app.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: "Smart by design", desc: "Snap a photo of a leaf and get an instant, plain-language diagnosis with the next steps to take." },
            { icon: Target, title: "Made for your land", desc: "Tailored to local crops, soils, and weather so every recommendation actually fits." },
            { icon: Heart, title: "Farmer-first", desc: "Simple, dual-language interface so anyone on the team can use it on day one." },
          ].map((v) => (
            <div key={v.title} className="glass-card rounded-2xl p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl space-y-6 text-muted-foreground">
          <h2 className="font-display text-2xl font-bold text-foreground">Our mission</h2>
          <p>Every farmer deserves an expert on call. Mazr3tk combines smart disease detection, hyper-local weather, farm management, and a thriving community — so modern farming feels accessible to everyone.</p>
          <h2 className="font-display text-2xl font-bold text-foreground">What we stand for</h2>
          <p>Clarity over noise. Privacy by default. Respect for the land and the people who tend it.</p>
        </div>
      </section>
    </SiteShell>
  );
}
