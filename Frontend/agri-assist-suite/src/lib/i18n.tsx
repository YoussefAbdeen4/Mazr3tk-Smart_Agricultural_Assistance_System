import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const DICT: Dict = {
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.about": { en: "About", ar: "من نحن" },
  "nav.contact": { en: "Contact", ar: "تواصل" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.farms": { en: "Farms", ar: "المزارع" },
  "nav.weather": { en: "Weather", ar: "الطقس" },
  "nav.community": { en: "Community", ar: "المجتمع" },
  "nav.chats": { en: "Chats", ar: "المحادثات" },
  "nav.diagnostics": { en: "Diagnostics", ar: "التشخيص" },
  "nav.signin": { en: "Sign in", ar: "تسجيل الدخول" },
  "nav.getstarted": { en: "Get started", ar: "ابدأ الآن" },
  "nav.logout": { en: "Logout", ar: "تسجيل الخروج" },
  "nav.language": { en: "Language", ar: "اللغة" },
  "nav.theme": { en: "Toggle theme", ar: "تبديل المظهر" },

  "hero.title1": { en: "Grow smarter with", ar: "ازرع بذكاء مع" },
  "hero.title2": { en: "AI in your field", ar: "الذكاء الاصطناعي في حقلك" },
  "hero.subtitle": {
    en: "Diagnose plant diseases from a single photo, manage every farm, and get weather and expert advice tailored to your land.",
    ar: "شخّص أمراض النباتات من صورة واحدة، أدر مزارعك، واحصل على نصائح الخبراء وحالة الطقس المخصصة لأرضك.",
  },
  "hero.cta": { en: "Get started", ar: "ابدأ الآن" },
  "hero.learn": { en: "Learn more", ar: "اعرف المزيد" },

  "features.title": { en: "Everything a modern farm needs", ar: "كل ما تحتاجه المزرعة الحديثة" },
  "features.subtitle": {
    en: "From diagnosis to community — one calm, integrated platform.",
    ar: "من التشخيص إلى المجتمع — منصة واحدة متكاملة وسهلة.",
  },

  "feat.diag.title": { en: "AI Disease Diagnosis", ar: "تشخيص الأمراض بالذكاء الاصطناعي" },
  "feat.diag.desc": {
    en: "Snap a leaf photo and get an instant diagnosis with clear treatment recommendations.",
    ar: "التقط صورة لورقة النبات واحصل على تشخيص فوري وتوصيات علاج واضحة.",
  },
  "feat.farm.title": { en: "Farm Management", ar: "إدارة المزارع" },
  "feat.farm.desc": {
    en: "Track farms, plants, irrigation, and yield in one calm dashboard.",
    ar: "تابع مزارعك ونباتاتك والري والمحصول في لوحة واحدة بسيطة.",
  },
  "feat.weather.title": { en: "Live Weather", ar: "الطقس المباشر" },
  "feat.weather.desc": {
    en: "Accurate local weather to help you plan irrigation and harvest.",
    ar: "طقس محلي دقيق يساعدك على تخطيط الري والحصاد.",
  },
  "feat.comm.title": { en: "Expert Community", ar: "مجتمع الخبراء" },
  "feat.comm.desc": {
    en: "Share results, ask engineers, and learn from farmers near you.",
    ar: "شارك تجاربك، اسأل المهندسين، وتعلم من المزارعين حولك.",
  },
  "feat.access.title": { en: "Team Access", ar: "وصول الفريق" },
  "feat.access.desc": {
    en: "Grant editor or viewer roles to staff and partners with one tap.",
    ar: "امنح صلاحيات التعديل أو العرض لفريقك وشركائك بضغطة واحدة.",
  },
  "feat.ai.title": { en: "AI Advisor", ar: "المستشار الذكي" },
  "feat.ai.desc": {
    en: "Chat with our AI agronomist anytime, in Arabic or English.",
    ar: "تحدث مع المستشار الزراعي الذكي في أي وقت، بالعربية أو الإنجليزية.",
  },

  "cta.title": { en: "Ready to diagnose your first plant?", ar: "جاهز لتشخيص أول نبتة؟" },
  "cta.subtitle": { en: "Create an account in 30 seconds and start growing smarter today.", ar: "أنشئ حسابك في 30 ثانية وابدأ الزراعة الذكية اليوم." },
  "cta.btn": { en: "Register now", ar: "سجّل الآن" },

  "footer.tag": { en: "Smart companion for farmers and agricultural engineers.", ar: "الرفيق الذكي للمزارعين والمهندسين الزراعيين." },
  "footer.product": { en: "Product", ar: "المنتج" },
  "footer.company": { en: "Company", ar: "الشركة" },
  "footer.legal": { en: "Legal", ar: "قانوني" },
};

interface I18nCtx {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: keyof typeof DICT | string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE_KEY = "sa_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? "en";
    setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[lang];
  };

  return (
    <Ctx.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, toggle: () => setLang(lang === "en" ? "ar" : "en"), t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
