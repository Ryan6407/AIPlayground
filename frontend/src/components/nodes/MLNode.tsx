"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { getBlockDef } from "@/lib/blockRegistry";
import { NodeData } from "@/store/graphStore";

const NODE_WIDTH = 56;
const NODE_HEIGHT = 24;

export default function MLNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const def = getBlockDef(nodeData.blockType);
  if (!def) return null;

  const isIO = def.type === "input" || def.type === "output";

  return (
    <div
      className={`flex items-center justify-center rounded transition-all duration-150 bg-[var(--surface-elevated)] ${
        isIO
          ? selected
            ? "ring-1 ring-[var(--accent)]/40"
            : ""
          : selected
            ? "border border-[var(--accent)] ring-1 ring-[var(--accent)]/40"
            : "border border-[var(--border)] hover:border-[var(--foreground-muted)]/40"
      }`}
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        ...(isIO ? {} : { borderLeftWidth: 2, borderLeftColor: def.color }),
        ...(selected ? { boxShadow: "0 0 12px rgba(6, 182, 212, 0.1)" } : {}),
      }}
    >
      {def.inputs.map((inp, i) => (
        <Handle
          key={inp.id}
          type="target"
          position={Position.Top}
          id={inp.id}
          style={{
            left:
              def.inputs.length === 1
                ? "50%"
                : `${((i + 1) / (def.inputs.length + 1)) * 100}%`,
            background: def.color,
            width: 4,
            height: 4,
            border: "1px solid var(--surface-elevated)",
          }}
          title={inp.label}
        />
      ))}

      <span
        className="font-medium text-[8px] uppercase tracking-wide truncate px-1 text-center w-full"
        style={{ color: def.color }}
      >
        {def.label}
      </span>

      {def.outputs.map((out, i) => (
        <Handle
          key={out.id}
          type="source"
          position={Position.Bottom}
          id={out.id}
          style={{
            left:
              def.outputs.length === 1
                ? "50%"
                : `${((i + 1) / (def.outputs.length + 1)) * 100}%`,
            background: def.color,
            width: 4,
            height: 4,
            border: "1px solid var(--surface-elevated)",
          }}
          title={out.label}
        />
      ))}
    </div>
  );
}
