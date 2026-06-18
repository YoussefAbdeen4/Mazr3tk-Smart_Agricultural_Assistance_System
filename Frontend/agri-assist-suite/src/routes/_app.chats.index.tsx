import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Loader } from "@/components/Loader";
import { MessageCircle, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/chats/")({
  head: () => ({ meta: [{ title: "Chats — Mazr3tk" }] }),
  component: ChatsListPage,
});

interface ChatPerson { id?: number; handle?: string; first_name?: string; last_name?: string; img?: string | null }
interface ChatItem {
  chat_id: number;
  sender?: ChatPerson;
  receiver?: ChatPerson;
  messages?: Array<{ id: number; message?: string; content?: string; timestamp?: string }>;
  updated_at?: string;
}

function ChatsListPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/chats");
        const list = res.data?.data ?? [];
        setChats(Array.isArray(list) ? list : []);
      } catch (err) { setError(extractErrorMessage(err)); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      const other = otherParty(c, user?.id);
      const name = `${other?.first_name ?? ""} ${other?.last_name ?? ""}`.toLowerCase();
      const handle = (other?.handle ?? "").toLowerCase();
      return name.includes(q) || handle.includes(q);
    });
  }, [chats, query, user?.id]);

  if (loading) return <Loader />;

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Chats</h1>
      <p className="mt-2 text-muted-foreground">Your conversations with farmers and engineers.</p>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or @handle"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>}

      <div className="glass-card mt-6 overflow-hidden rounded-2xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <MessageCircle className="mx-auto h-10 w-10 opacity-50" />
            <p className="mt-3">No conversations match. Visit a profile to start one.</p>
          </div>
        ) : filtered.map((c) => {
          const other = otherParty(c, user?.id);
          const last = c.messages?.[c.messages.length - 1];
          return (
            <Link key={c.chat_id} to="/chats/$chatId" params={{ chatId: String(c.chat_id) }} className="flex items-center gap-3 border-b border-border p-4 transition-colors last:border-0 hover:bg-secondary/40">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-primary">
                {other?.img ? <img src={other.img} alt="" className="h-full w-full object-cover" /> : (other?.first_name?.[0] ?? other?.handle?.[0] ?? "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{other?.first_name} {other?.last_name} {other?.handle && <span className="text-muted-foreground">@{other.handle}</span>}</p>
                <p className="truncate text-sm text-muted-foreground">{last?.message ?? last?.content ?? "Start chatting…"}</p>
              </div>
              {c.updated_at && <span className="text-xs text-muted-foreground">{c.updated_at}</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function otherParty(c: ChatItem, myId?: number): ChatPerson | undefined {
  if (!myId) return c.receiver ?? c.sender;
  if (c.sender?.id === myId) return c.receiver;
  if (c.receiver?.id === myId) return c.sender;
  return c.receiver ?? c.sender;
}
