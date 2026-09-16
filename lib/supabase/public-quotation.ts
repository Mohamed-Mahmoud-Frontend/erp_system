import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createPublicQuotationClient(token: string) {
  // Never inherit dashboard cookies or service keys. RLS scopes this anonymous
  // client to the one quotation identified by its bearer token.
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { "x-quotation-token": token } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    },
  );
}
