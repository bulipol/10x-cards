import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// TYMCZASOWE LOGOWANIE - usuń po naprawie
console.log("Debug env vars:", {
  supabaseUrl: supabaseUrl ? "✅ defined" : "❌ undefined",
  supabaseKey: supabaseAnonKey ? "✅ defined" : "❌ undefined",
});

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "e7069c0f-532f-46da-a609-ce9f26999ef5";
