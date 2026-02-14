import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default async function Home() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Missing Supabase env")) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
          <p className="text-sm font-medium mb-2">Supabase not configured</p>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md text-center mb-4">
            Add <code className="bg-[var(--surface)] px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="bg-[var(--surface)] px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="bg-[var(--surface)] px-1 rounded">frontend/.env.local</code>, then restart the dev server.
          </p>
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Get your URL and anon key →
          </a>
        </div>
      );
    }
    throw e;
  }

  if (!user) {
    redirect("/login");
  }

  return <HomeDashboard user={user} />;
}
