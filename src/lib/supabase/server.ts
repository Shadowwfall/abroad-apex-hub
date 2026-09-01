import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { getRequestHeaders, setCookie } from "@tanstack/react-start/server";
import type { Database } from "./types";

export function createSupabaseServerClient() {
  const url =
    process.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    "https://masqzazjkxejuvjyrqow.supabase.co";
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable__Ej94PLKoXO0A0Jg-NR09w_zIIK8-Rs";

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables on server");
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        try {
          const headers = getRequestHeaders();
          const cookieHeader = headers.get("cookie") ?? headers.get("Cookie") ?? "";
          return parseCookieHeader(cookieHeader);
        } catch {
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, {
              ...options,
              sameSite:
                typeof options?.sameSite === "string"
                  ? (options.sameSite.toLowerCase() as "lax" | "strict" | "none")
                  : "lax",
            });
          });
        } catch {
          // Ignored if headers already sent
        }
      },
    },
  });
}
