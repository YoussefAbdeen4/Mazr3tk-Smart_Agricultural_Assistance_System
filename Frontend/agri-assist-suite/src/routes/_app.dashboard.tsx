import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Sprout, CloudSun, MessageCircle, Newspaper, User, Bot, ScanLine } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Mazr3tk" }] }),
  component: Dashboard,
});

const cards = [
  { to: "/farms", icon: Sprout, title: "My Farms", desc: "Manage farms, plants, plans & access." },
  { to: "/diagnostics", icon: ScanLine, title: "Diagnostics", desc: "AI for disease, pest & yield." },
  { to: "/weather", icon: CloudSun, title: "Weather", desc: "Live weather across Egypt." },
  { to: "/blogs", icon: Newspaper, title: "Community", desc: "Posts, comments, and reactions." },
  { to: "/chats", icon: MessageCircle, title: "Chats", desc: "Talk to engineers & farmers." },
  { to: "/profile", icon: User, title: "My Profile", desc: "Your stats and account info." },
  { to: "/chatbot", icon: Bot, title: "AI Advisor", desc: "Full-screen AI chat assistant." },
] as const;

function Dashboard() {
  const { user } = useAuth();
  return (
    <section className="container mx-auto px-4 py-12">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">{user?.first_name ?? "Farmer"} {user?.last_name ?? ""} 👋</h1>
        <p className="mt-2 text-muted-foreground">Here's everything you can do today.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="glass-card group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
