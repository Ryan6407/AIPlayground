"use client";

import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "@/components/editor/Canvas";
import Sidebar from "@/components/editor/Sidebar";
import Toolbar from "@/components/editor/Toolbar";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import TrainingDashboard from "@/components/training/TrainingDashboard";
import Link from "next/link";

export default function PlaygroundPage() {
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
          <Toolbar />
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
