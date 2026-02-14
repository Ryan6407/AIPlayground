import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env. In frontend/.env.local add:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n" +
        "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n" +
        "Then restart the dev server (stop and run npm run dev again)."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component; middleware will refresh sessions
          }
        },
      },
    }
  );
}
