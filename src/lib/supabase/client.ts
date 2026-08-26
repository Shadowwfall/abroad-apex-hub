import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  client = createBrowserClient<Database>(url, key);
  return client;
}

export const supabase =
  typeof window !== "undefined"
    ? getSupabaseBrowserClient()
    : (null as unknown as ReturnType<typeof createBrowserClient<Database>>);
