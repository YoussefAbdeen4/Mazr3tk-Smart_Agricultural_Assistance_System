import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Loader } from "@/components/Loader";
import { Mail, MessageCircle, Sprout, Ruler, MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/profile/$userId")({
  head: () => ({ meta: [{ title: "Profile — Mazr3tk" }] }),
  component: PublicProfile,
});

interface PublicUser {
  id: number; first_name: string; last_name: string; handle: string;
  role?: string; email?: string; phone?: string; img?: string | null;
}
interface PublicFarm { id: number; name: string; location?: string; area?: string; soil_type?: string; img?: string | null }
interface PublicBlogAttachment { url?: string; attachment?: string }
interface PublicBlog { id: number; title?: string; content: string; created_at?: string; attachments?: PublicBlogAttachment[] }

function PublicProfile() {
  const { userId } = Route.useParams();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/profile/${userId}`);
        const d = res.data?.data ?? {};
        setUser({
          id: d.id, first_name: d.first_name, last_name: d.last_name, handle: d.handle,
          role: d.role, email: d.email, phone: d.phone, img: d.img,
        });
        setFarms(d.farms ?? []);
        setBlogs(d.blogs ?? []);
      } catch (err) { setError(extractErrorMessage(err)); }
      finally { setLoading(false); }
    })();
  }, [userId]);

  const message = async () => {
    try {
      const fd = new FormData();
      fd.append("receiver_id", String(userId));
      const res = await api.post("/api/chats/get-or-create", fd);
      const chatId = res.data?.data?.chat_id ?? res.data?.data?.id;
      if (chatId) router.navigate({ to: "/chats/$chatId", params: { chatId: String(chatId) } });
    } catch (err) { alert(extractErrorMessage(err)); }
  };

  if (loading) return <Loader />;
  if (error || !user) return <div className="container mx-auto px-4 py-12 text-destructive">{error ?? "User not found"}</div>;

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full gradient-hero text-2xl font-bold text-primary-foreground">
            {user.img ? <img src={user.img} alt="" className="h-full w-full object-cover" /> : user.first_name?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-muted-foreground">@{user.handle} · {user.role}</p>
            {user.email && <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{user.email}</p>}
          </div>
          <button onClick={message} className="inline-flex items-center gap-2 rounded-xl gradient-hero px-4 py-2.5 font-semibold text-primary-foreground">
            <MessageCircle className="h-4 w-4" /> Message
          </button>
        </div>
      </div>

      {farms.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-xl font-bold">Farms</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {farms.map((f) => (
              <div key={f.id} className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold">{f.name}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {f.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{f.location}</span>}
                  {f.area && <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{f.area} m²</span>}
                  {f.soil_type && <span className="inline-flex items-center gap-1"><Sprout className="h-3.5 w-3.5" />{f.soil_type}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-8 font-display text-xl font-bold">Posts</h2>
      <div className="mt-3 space-y-3">
        {blogs.length === 0 ? <p className="text-sm text-muted-foreground">No public posts.</p> : blogs.map((b) => (
          <article key={b.id} className="glass-card rounded-2xl p-5">
            {b.title && <h3 className="font-display text-lg font-semibold">{b.title}</h3>}
            <p className="mt-1 whitespace-pre-wrap text-sm">{b.content}</p>
            {b.attachments && b.attachments.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {b.attachments.map((a, i) => {
                  const url = a.url ?? a.attachment ?? "";
                  return /\.(mp4|webm|mov)$/i.test(url)
                    ? <video key={i} src={url} controls className="w-full rounded-xl" />
                    : <img key={i} src={url} alt="" className="w-full rounded-xl object-cover" />;
                })}
              </div>
            )}
            {b.created_at && <p className="mt-2 text-xs text-muted-foreground">{b.created_at}</p>}
          </article>
        ))}
      </div>

      <Link to="/profile" className="mt-8 inline-block text-sm text-muted-foreground hover:text-primary">Back to my profile</Link>
    </section>
  );
}
