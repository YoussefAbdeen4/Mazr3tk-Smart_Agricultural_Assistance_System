import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/30">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-hero text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            Mazr3tk
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("footer.tag")}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("footer.product")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/farms" className="hover:text-primary">{t("nav.farms")}</Link></li>
            <li><Link to="/weather" className="hover:text-primary">{t("nav.weather")}</Link></li>
            <li><Link to="/blogs" className="hover:text-primary">{t("nav.community")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-primary">{t("nav.contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("footer.legal")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>© {new Date().getFullYear()} Mazr3tk</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
