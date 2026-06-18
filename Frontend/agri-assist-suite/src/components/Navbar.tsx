import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { resolveImageUrl } from "@/lib/api";
import { Leaf, Menu, X, Sun, Moon, Globe } from "lucide-react";

function NavAvatar({ src, initials }: { src: string | null; initials: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt="Me"
        onError={() => setErr(true)}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
      />
    );
  }
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full gradient-hero text-xs font-bold text-primary-foreground">
      {initials}
    </span>
  );
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { lang, toggle: toggleLang, t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/" });
  };

  const publicLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  const privateLinks = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/farms", label: t("nav.farms") },
    { to: "/diagnostics", label: t("nav.diagnostics") },
    { to: "/weather", label: t("nav.weather") },
    { to: "/blogs", label: t("nav.community") },
    { to: "/chats", label: t("nav.chats") },
  ] as const;

  const ThemeBtn = (
    <button
      onClick={toggleTheme}
      aria-label={t("nav.theme")}
      title={t("nav.theme")}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  const LangBtn = (
    <button
      onClick={toggleLang}
      aria-label={t("nav.language")}
      title={t("nav.language")}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold hover:bg-secondary"
    >
      <Globe className="h-4 w-4" />
      {lang === "en" ? "عربي" : "EN"}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-hero text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span>Mazr3tk</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {(isAuthenticated ? privateLinks : publicLinks).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium text-primary bg-secondary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {LangBtn}
          {ThemeBtn}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <NavAvatar
                  src={resolveImageUrl(user?.img, "Profile")}
                  initials={`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "?"}
                />
                <span className="hidden lg:inline">@{user?.handle ?? "me"}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-secondary">
                {t("nav.signin")}
              </Link>
              <Link
                to="/register"
                className="rounded-lg gradient-hero px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-soft"
              >
                {t("nav.getstarted")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {LangBtn}
          {ThemeBtn}
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {(isAuthenticated ? privateLinks : publicLinks).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
                  @{user?.handle}
                </Link>
                <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-start text-sm font-medium hover:bg-secondary">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">{t("nav.signin")}</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg gradient-hero px-3 py-2 text-sm font-semibold text-primary-foreground">{t("nav.getstarted")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
