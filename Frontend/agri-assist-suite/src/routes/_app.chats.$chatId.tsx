import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Paperclip, Send } from "lucide-react";

export const Route = createFileRoute("/_app/chats/$chatId")({
  head: () => ({ meta: [{ title: "Chat — Mazr3tk" }] }),
  component: ChatRoom,
});

interface MsgUser { id?: number; first_name?: string; last_name?: string; handle?: string; img?: string | null }
interface MsgAttachment { url?: string }
interface ChatMessage {
  id: number;
  message?: string;
  content?: string;
  sent_at?: string;
  timestamp?: string;
  sender?: MsgUser;
  sender_id?: number;
  attachments?: MsgAttachment[];
}
interface ChatBundle {
  chat_id: number;
  sender?: MsgUser;
  receiver?: MsgUser;
  messages?: ChatMessage[];
}

function ChatRoom() {
  const { chatId } = Route.useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState<ChatBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/api/chats");
      const list: ChatBundle[] = res.data?.data ?? [];
      const found = list.find((c) => String(c.chat_id) === String(chatId)) ?? null;
      setChat(found);
      setError(found ? null : "Chat not found.");
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  }, [chatId]);

  useEffect(() => {
    void load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat?.messages?.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append("content", text);
      files.forEach((f) => fd.append("attachments[]", f));
      await api.post(`/api/chats/${chatId}/send-message`, fd);
      setText(""); setFiles([]);
      void load();
    } catch (err) { alert(extractErrorMessage(err)); }
    finally { setSending(false); }
  };

  if (loading) return <Loader />;

  const messages = (chat?.messages ?? []).slice().sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });
  const other = chat?.sender?.id === user?.id ? chat?.receiver : chat?.sender;

  return (
    <section className="container mx-auto max-w-3xl px-4 py-6">
      <Link to="/chats" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to chats
      </Link>

      {other && (
        <div className="glass-card mt-4 flex items-center gap-3 rounded-2xl p-4">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-primary">
            {other.img ? <img src={other.img} alt="" className="h-full w-full object-cover" /> : (other.first_name?.[0] ?? "?")}
          </div>
          <div>
            <p className="font-semibold">{other.first_name} {other.last_name}</p>
            {other.handle && <p className="text-xs text-muted-foreground">@{other.handle}</p>}
          </div>
        </div>
      )}

      <div className="glass-card mt-4 flex h-[64vh] flex-col rounded-2xl">
        {error && <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p>}
          {messages.map((m) => {
            const mine = m.sender?.id === user?.id || m.sender_id === user?.id;
            const body = m.content ?? m.message;
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary text-foreground"}`}>
                  {!mine && m.sender && <p className="mb-1 text-xs opacity-70">{m.sender.first_name} {m.sender.last_name}</p>}
                  {body && <p className="whitespace-pre-wrap">{body}</p>}
                  {(m.attachments ?? []).map((a, i) => {
                    const url = a.url ?? "";
                    return /\.(mp4|webm|mov)$/i.test(url)
                      ? <video key={i} src={url} controls className="mt-2 max-w-full rounded-lg" />
                      : <img key={i} src={url} alt="" className="mt-2 max-w-full rounded-lg" />;
                  })}
                  {m.sent_at && <p className="mt-1 text-[10px] opacity-60">{m.sent_at}</p>}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-border hover:bg-secondary">
            <input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="hidden" />
            <Paperclip className="h-4 w-4" />
          </label>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={files.length ? `${files.length} attachment(s)` : "Type a message…"} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={sending} className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
