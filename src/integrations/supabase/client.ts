import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const supabase = getSupabaseBrowserClient();
export type { Database } from "@/lib/supabase/types";
