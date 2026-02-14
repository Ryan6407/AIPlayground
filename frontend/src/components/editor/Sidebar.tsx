"use client";

import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from "@/lib/blockRegistry";
import { DragEvent } from "react";

export default function Sidebar() {
  const onDragStart = (event: DragEvent, blockType: string) => {
    event.dataTransfer.setData("application/reactflow", blockType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-60 flex-shrink-0 overflow-y-auto border-r border-[var(--border-muted)] bg-[var(--surface)]">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-4">
          Blocks
        </h2>
        {BLOCK_CATEGORIES.map((cat) => {
          const blocks = BLOCK_REGISTRY.filter((b) => b.category === cat.key);
          if (blocks.length === 0) return null;
          return (
            <div key={cat.key} className="mb-5">
              <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--foreground-muted)]/80 mb-2 px-0.5">
                {cat.label}
              </h3>
              <div className="space-y-1">
                {blocks.map((block) => (
                  <div
                    key={block.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, block.type)}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing bg-[var(--surface-elevated)] border border-[var(--border-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-elevated)]/90 transition-all duration-200"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white/10"
                      style={{ backgroundColor: block.color, boxShadow: `0 0 10px ${block.color}40` }}
                    />
                    <span className="text-sm text-[var(--foreground)] group-hover:text-white transition-colors">
                      {block.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
