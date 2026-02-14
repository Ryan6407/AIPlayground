"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { listPlaygrounds } from "@/lib/supabase/playgrounds";
import type { PlaygroundRow } from "@/types/playground";

export function HomeDashboard({ user }: { user: User }) {
  const supabase = createClient();
  const [playgrounds, setPlaygrounds] = useState<PlaygroundRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPlaygrounds().then((list) => {
      setPlaygrounds(list);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.user_name ??
    user.email?.split("@")[0] ??
    "User";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    if (diff < 604800000) return d.toLocaleDateString(undefined, { weekday: "short" });
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">
          AIPlayground
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--foreground-muted)]">
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <h2 className="text-xl font-medium text-[var(--foreground)] mb-1">
          Welcome back
        </h2>
        <p className="text-[var(--foreground-muted)] mb-8">
          Create a new playground or open an existing one.
        </p>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-6xl">
          <Link
            href="/playground"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] min-h-[140px] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)] group-hover:bg-[var(--accent)]/20 mb-3">
              <PlusIcon />
            </span>
            <span className="text-sm font-medium text-[var(--foreground)]">
              New playground
            </span>
          </Link>

          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[140px] p-4 animate-pulse"
              >
                <div className="h-4 bg-[var(--border-muted)] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[var(--border-muted)] rounded w-1/2" />
              </div>
            ))
          ) : (
            playgrounds.map((pg) => (
              <Link
                key={pg.id}
                href={`/playground/${pg.id}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[140px] p-4 flex flex-col transition hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] mb-3 group-hover:bg-[var(--accent)]/20 shrink-0">
                  <PlaygroundIcon />
                </span>
                <h3 className="font-medium text-[var(--foreground)] truncate mb-1">
                  {pg.name}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-auto">
                  {formatDate(pg.updated_at)}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function PlaygroundIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
}
