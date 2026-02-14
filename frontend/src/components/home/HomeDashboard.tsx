"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function HomeDashboard({ user }: { user: User }) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.user_name ??
    user.email?.split("@")[0] ??
    "User";

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
          Choose a feature to get started.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          <Link
            href="/playground"
            className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] group-hover:bg-[var(--accent)]/20">
                <PlaygroundIcon />
              </span>
              <h3 className="font-medium text-[var(--foreground)]">
                Playground
              </h3>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">
              Build, train, and test ML models visually with the node editor.
            </p>
          </Link>
        </div>
      </main>
    </div>
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
