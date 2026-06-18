import axios from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000";

export const TOKEN_KEY = "sa_token";
export const USER_KEY = "sa_user";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
});

/**
 * Resolve any image-ish field the backend might return into a usable URL.
 * Backend may return:
 *   - a full URL: "http://127.0.0.1:8000/img/Profile/abc.jpg"
 *   - a bare filename: "69ee378361e2b.jpg"
 *   - a relative path: "/img/Profile/abc.jpg"
 *   - null/undefined/empty
 * Supports common field aliases.
 */
export function resolveImageUrl(
  input: unknown,
  kind: "Profile" | "Farm" | "blogs" | "chats" = "Profile",
): string | null {
  let val: string | null = null;
  if (typeof input === "string") {
    val = input;
  } else if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const k of ["img", "image", "image_url", "avatar", "profile_image", "profile_photo", "profile_picture", "photo", "url"]) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) { val = v; break; }
    }
  }
  if (!val) return null;
  val = val.trim();
  if (!val) return null;
  if (/^https?:\/\//i.test(val) || val.startsWith("data:") || val.startsWith("blob:")) return val;
  if (val.startsWith("/")) return `${API_BASE_URL}${val}`;
  // Bare filename — guess folder by kind.
  return `${API_BASE_URL}/img/${kind}/${val}`;
}

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    const clean = token.startsWith("Bearer ") ? token.slice(7) : token;
    config.headers.Authorization = `Bearer ${clean}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // optional: localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown): string {
  const e = err as {
    message?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
        errors?: Record<string, string[] | string>;
      };
    };
  };
  const data = e?.response?.data;

  // Laravel validation errors: { errors: { field: ["msg", ...] } }
  if (data?.errors && typeof data.errors === "object") {
    const messages: string[] = [];
    for (const v of Object.values(data.errors)) {
      if (Array.isArray(v)) messages.push(...v.filter(Boolean));
      else if (typeof v === "string" && v) messages.push(v);
    }
    if (messages.length) return messages.join(" \n");
  }

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (e?.response?.status === 0 || e?.message === "Network Error") {
    return "Cannot reach the server. Check your connection and try again.";
  }
  if (e?.response?.status === 500) {
    return "Server error. Please try again in a moment.";
  }
  return e?.message || "Request failed. Please try again.";
}

export function extractFieldErrors(err: unknown): Record<string, string> {
  const e = err as { response?: { data?: { errors?: Record<string, string[] | string> } } };
  const out: Record<string, string> = {};
  const errors = e?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    for (const [k, v] of Object.entries(errors)) {
      if (Array.isArray(v)) out[k] = v[0] ?? "";
      else if (typeof v === "string") out[k] = v;
    }
  }
  return out;
}
