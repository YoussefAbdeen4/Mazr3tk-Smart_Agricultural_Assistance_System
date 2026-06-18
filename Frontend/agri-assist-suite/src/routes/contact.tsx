import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { FloatingInput } from "@/components/FloatingInput";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mazr3tk" },
      { name: "description", content: "Get in touch with the Mazr3tk team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 600);
  };

  return (
    <SiteShell>
      <section className="container mx-auto max-w-2xl px-4 py-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">
            {ar ? "تواصل معنا" : "Get in touch"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {ar
              ? "أرسل لنا رسالة وسنرد عليك في أقرب وقت."
              : "Send us a message and we'll get back to you shortly."}
          </p>
        </div>

        <form onSubmit={submit} className="glass-card mt-10 space-y-4 rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="rounded-xl bg-secondary p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold">
                {ar ? "شكراً لك! سنتواصل معك قريباً." : "Thanks! We'll be in touch soon."}
              </p>
            </div>
          ) : (
            <>
              <FloatingInput
                name="name"
                label={ar ? "الاسم الكامل" : "Full name"}
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <FloatingInput
                name="email"
                type="email"
                label={ar ? "البريد الإلكتروني" : "Email"}
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <FloatingInput
                name="subject"
                label={ar ? "الموضوع" : "Subject"}
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
              <div className="floating-label">
                <textarea
                  id="message"
                  placeholder=" "
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="floating-input resize-none"
                />
                <label htmlFor="message" className="floating-text-label text-sm">
                  {ar ? "الرسالة" : "Message"}
                </label>
              </div>
              <button
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-hero py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
              >
                {loading ? (ar ? "جارٍ الإرسال…" : "Sending…") : (
                  <><Send className="h-4 w-4" /> {ar ? "إرسال الرسالة" : "Send message"}</>
                )}
              </button>
            </>
          )}
        </form>
      </section>
    </SiteShell>
  );
}
