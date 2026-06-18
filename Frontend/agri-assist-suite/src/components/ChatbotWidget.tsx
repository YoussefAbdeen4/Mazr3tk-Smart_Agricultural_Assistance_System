import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Msg { role: "user" | "bot"; text: string }

export function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your AI farming advisor. Ask me anything about crops, irrigation, or pests." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!isAuthenticated) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/api/chatbot", { promet: text });
      const reply = res.data?.data?.response ?? "…";
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: extractErrorMessage(err) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full gradient-hero text-primary-foreground shadow-soft transition-transform hover:scale-105"
        aria-label="AI Advisor"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-full gradient-hero text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Advisor</p>
              <p className="text-xs text-muted-foreground">Mazr3tk assistant</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm text-foreground"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">Thinking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
