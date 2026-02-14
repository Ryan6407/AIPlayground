"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Canvas from "@/components/editor/Canvas";
import Sidebar from "@/components/editor/Sidebar";
import Toolbar from "@/components/editor/Toolbar";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import TrainingDashboard from "@/components/training/TrainingDashboard";
import Link from "next/link";
import { useGraphStore } from "@/store/graphStore";
import { getPlayground } from "@/lib/supabase/playgrounds";
import { deserializeGraph } from "@/lib/serialization";

export default function PlaygroundByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const loadGraph = useGraphStore((s) => s.loadGraph);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!id) return;
    getPlayground(id).then((row) => {
      if (!row) {
        setStatus("error");
        return;
      }
      const { nodes, edges } = deserializeGraph(row.graph_json);
      loadGraph(nodes, edges);
      setStatus("ready");
    });
  }, [id, loadGraph]);

  useEffect(() => {
    if (status === "error") router.replace("/");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--foreground-muted)] text-sm">Loading playground…</div>
      </div>
    );
  }

  if (status === "error") {
    return null;
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--background)]">
        <div className="flex items-center gap-4 border-b border-[var(--border)] shrink-0">
          <Link
            href="/"
            className="shrink-0 px-3 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition"
          >
            ← Home
          </Link>
          <Toolbar playgroundId={id} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
          <PropertiesPanel />
          <TrainingDashboard />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
