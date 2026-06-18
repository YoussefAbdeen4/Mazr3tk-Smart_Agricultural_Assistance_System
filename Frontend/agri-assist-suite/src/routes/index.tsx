import { createFileRoute, Link } from "@tanstack/react-router";
import heroFarm from "@/assets/hero-farm.jpg";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { ScanLine, CloudSun, MessageSquareHeart, Users, Sprout, Leaf, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mazr3tk — Smart companion for every farm" },
      { name: "description", content: "Diagnose plant diseases, manage farms, get hyper-local weather, and connect with expert engineers." },
      { property: "og:title", content: "Mazr3tk — Smart companion for every farm" },
      { property: "og:description", content: "Diagnose plant diseases, manage farms, and get advice from AI and engineers." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();

  const features = [
    { icon: ScanLine, title: t("feat.diag.title"), desc: t("feat.diag.desc") },
    { icon: Sprout, title: t("feat.farm.title"), desc: t("feat.farm.desc") },
    { icon: CloudSun, title: t("feat.weather.title"), desc: t("feat.weather.desc") },
    { icon: MessageSquareHeart, title: t("feat.comm.title"), desc: t("feat.comm.desc") },
    { icon: Users, title: t("feat.access.title"), desc: t("feat.access.desc") },
    { icon: Leaf, title: t("feat.ai.title"), desc: t("feat.ai.desc") },
  ];

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroFarm} alt="Farm at sunrise" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="container mx-auto px-4 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] md:text-7xl">
              {t("hero.title1")}{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
              .
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]">
                {t("hero.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3 font-semibold backdrop-blur hover:bg-secondary">
                {t("hero.learn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t("features.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-primary-foreground md:p-16">
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold md:text-5xl">{t("cta.title")}</h2>
            <p className="mt-4 text-primary-foreground/90">{t("cta.subtitle")}</p>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-card px-6 py-3 font-semibold text-primary shadow-soft">
              {t("cta.btn")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="absolute -end-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    </SiteShell>
  );
}
