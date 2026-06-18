import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { Loader } from "@/components/Loader";
import { Heart, MessageCircle, Plus, Send, Trash2, X, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/blogs")({
  head: () => ({ meta: [{ title: "Community — Mazr3tk" }] }),
  component: BlogsPage,
});

interface BlogUser { id: number; handle?: string; first_name?: string; last_name?: string; img?: string | null }
interface BlogAttachment { id?: number; attachment?: string; url?: string }
interface BlogComment { id: number; content?: string; comment?: string; user: BlogUser }
interface BlogReaction { id?: number; is_like?: boolean | number; user?: BlogUser; user_id?: number }
interface Blog {
  id: number; title?: string; content: string; user: BlogUser;
  attachments?: BlogAttachment[]; comments?: BlogComment[]; reactions?: BlogReaction[];
  created_at?: string;
}

function attachmentUrl(a: BlogAttachment): string {
  return a.url ?? a.attachment ?? "";
}

function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/api/blogs", { params: { page: p } });
      const body = res.data ?? {};
      // Pagination response: { data: [...], meta: {...} }
      const list = Array.isArray(body.data) ? body.data : (body.data?.data ?? []);
      setBlogs(Array.isArray(list) ? list : []);
      setLastPage(body.meta?.last_page ?? 1);
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(page); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Community</h1>
          <p className="mt-2 text-muted-foreground">Tips, results, and questions from farmers and engineers.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl gradient-hero px-4 py-2.5 font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {loading ? <Loader /> : error ? (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>
      ) : (
        <>
          <div className="mt-8 space-y-6">
            {blogs.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No posts yet. Be the first!</div>
            ) : blogs.map((b) => <BlogCard key={b.id} blog={b} onChange={() => load()} />)}
          </div>
          {lastPage > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
              <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}

      {createOpen && <CreateBlogModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); void load(1); setPage(1); }} />}
    </section>
  );
}

function BlogCard({ blog, onChange }: { blog: Blog; onChange: () => void }) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const myReaction = (blog.reactions ?? []).find((r) => r.user_id === user?.id || r.user?.id === user?.id);
  const liked = !!myReaction?.is_like;
  const isMine = blog.user?.id === user?.id;

  const toggleLike = async () => {
    try {
      await api.post(`/api/blogs/${blog.id}/reactions`, { is_like: liked ? 0 : 1 });
      onChange();
    } catch (err) { alert(extractErrorMessage(err)); }
  };
  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/api/blogs/${blog.id}/comments`, { content: comment });
      setComment(""); onChange();
    } catch (err) { alert(extractErrorMessage(err)); } finally { setPosting(false); }
  };
  const remove = async () => {
    if (!confirm("Delete this post?")) return;
    try { await api.delete(`/api/blogs/${blog.id}`); onChange(); }
    catch (err) { alert(extractErrorMessage(err)); }
  };

  return (
    <article className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/profile/$userId" params={{ userId: String(blog.user.id) }} className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-primary">
            {blog.user.img ? <img src={blog.user.img} alt="" className="h-full w-full object-cover" /> : (blog.user.first_name?.[0] ?? "?")}
          </Link>
          <div>
            <Link to="/profile/$userId" params={{ userId: String(blog.user.id) }} className="font-medium hover:text-primary">
              {blog.user.first_name} {blog.user.last_name}
            </Link>
            <p className="text-xs text-muted-foreground">{blog.user.handle ? `@${blog.user.handle}` : ""} {blog.created_at ? `· ${blog.created_at}` : ""}</p>
          </div>
        </div>
        {isMine && (
          <div className="flex items-center gap-1">
            <button onClick={() => setEditOpen(true)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
            <button onClick={remove} className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
      {blog.title && <h2 className="mt-4 font-display text-lg font-bold">{blog.title}</h2>}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{blog.content}</p>
      {blog.attachments && blog.attachments.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {blog.attachments.map((a, i) => {
            const url = attachmentUrl(a);
            const isVid = /\.(mp4|webm|mov)$/i.test(url);
            return isVid ? (
              <video key={i} src={url} controls className="w-full rounded-xl" />
            ) : (
              <img key={i} src={url} alt="" className="w-full rounded-xl object-cover" />
            );
          })}
        </div>
      )}
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm">
        <button onClick={toggleLike} className={`inline-flex items-center gap-1.5 ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {(blog.reactions ?? []).filter((r) => r.is_like).length}
        </button>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><MessageCircle className="h-4 w-4" /> {(blog.comments ?? []).length}</span>
      </div>
      {(blog.comments ?? []).length > 0 && (
        <div className="mt-4 space-y-2">
          {(blog.comments ?? []).map((c) => (
            <div key={c.id} className="rounded-xl bg-secondary/60 p-3 text-sm">
              {c.user?.id && (
                <Link to="/profile/$userId" params={{ userId: String(c.user.id) }} className="font-medium hover:text-primary">
                  {c.user.first_name} {c.user.last_name}
                </Link>
              )}
              <p className="mt-1">{c.content ?? c.comment}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={addComment} className="mt-3 flex items-center gap-2">
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button disabled={posting} className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>

      {editOpen && <EditBlogModal blog={blog} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); onChange(); }} />}
    </article>
  );
}

function CreateBlogModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      files.forEach((f) => fd.append("attachments[]", f));
      await api.post("/api/blogs", fd);
      onCreated();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">New post</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {error && (
          <div className="mb-3 space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error.split("\n").map((l, i) => <p key={i}>{l.trim()}</p>)}
          </div>
        )}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share something with the community…" rows={5} required className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-4 text-sm">
          <input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="hidden" />
          {files.length > 0 ? `${files.length} file(s) selected` : "Attach images or videos"}
        </label>
        <button disabled={loading} className="mt-4 w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}

function EditBlogModal({ blog, onClose, onSaved }: { blog: Blog; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(blog.title ?? "");
  const [content, setContent] = useState(blog.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      await api.post(`/api/blogs/${blog.id}`, fd);
      onSaved();
    } catch (err) { setError(extractErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Edit post</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} required className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        <button disabled={loading} className="mt-4 w-full rounded-lg gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
