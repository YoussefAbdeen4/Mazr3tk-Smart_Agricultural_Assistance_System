import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api, extractErrorMessage } from "@/lib/api";
import { Bot, Send } from "lucide-react";

export const Route = createFileRoute("/_app/chatbot")({
  head: () => ({ meta: [{ title: "AI Advisor — Mazr3tk" }] }),
  component: ChatbotPage,
});

interface Msg { role: "user" | "bot"; text: string }

function ChatbotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "السلام عليكم 🌱 I'm your AI farming advisor. Ask anything about crops, pests, irrigation, or fertilizers." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/api/chatbot", { promet: text });
      setMessages((m) => [...m, { role: "bot", text: res.data?.data?.response ?? "…" }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: extractErrorMessage(err) }]);
    } finally { setLoading(false); }
  };

  return (
    <section className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground"><Bot className="h-6 w-6" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Advisor</h1>
          <p className="text-sm text-muted-foreground">Your personal agronomist, available 24/7.</p>
        </div>
      </div>

      <div className="glass-card flex h-[68vh] flex-col rounded-2xl">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary text-foreground"}`}>
                {m.role === "bot" ? <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{m.text}</ReactMarkdown></div> : m.text}
              </div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">Thinking…</div></div>}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI advisor…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <button disabled={loading || !input.trim()} className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
