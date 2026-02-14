"use client";

import { useGraphStore } from "@/store/graphStore";
import { getBlockDef } from "@/lib/blockRegistry";

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all";

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeParams } = useGraphStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-72 flex-shrink-0 border-l border-[var(--border-muted)] bg-[var(--surface)] p-6 flex items-center justify-center">
        <p className="text-sm text-[var(--foreground-muted)] text-center max-w-[180px]">
          Select a block to configure its properties
        </p>
      </div>
    );
  }

  const def = getBlockDef(selectedNode.data.blockType);
  if (!def) return null;

  const params = selectedNode.data.params;

  const handleChange = (key: string, value: unknown) => {
    updateNodeParams(selectedNode.id, { [key]: value });
  };

  return (
    <div className="w-72 flex-shrink-0 overflow-y-auto border-l border-[var(--border-muted)] bg-[var(--surface)]">
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              backgroundColor: def.color,
              boxShadow: `0 0 12px ${def.color}50`,
            }}
          />
          <h2 className="font-semibold text-sm text-[var(--foreground)]">
            {def.label}
          </h2>
        </div>

        <div className="text-[11px] font-mono text-[var(--foreground-muted)] mb-4 truncate" title={selectedNode.id}>
          ID: {selectedNode.id}
        </div>

        {def.parameters.length === 0 && (
          <p className="text-sm text-[var(--foreground-muted)]">
            No configurable parameters
          </p>
        )}

        <div className="space-y-4">
          {def.parameters.map((param) => (
            <div key={param.key}>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                {param.label}
              </label>

              {param.type === "number" && (
                <input
                  type="number"
                  value={Number(params[param.key] ?? param.default)}
                  min={param.min}
                  max={param.max}
                  step={param.step ?? 1}
                  onChange={(e) =>
                    handleChange(param.key, parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              )}

              {param.type === "select" && (
                <select
                  value={String(params[param.key] ?? param.default)}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                  className={inputClass}
                >
                  {param.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {param.type === "boolean" && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(params[param.key] ?? param.default)}
                    onChange={(e) => handleChange(param.key, e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)] focus:ring-[var(--accent)]/50"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    Enabled
                  </span>
                </label>
              )}

              {param.type === "tuple" && (
                <input
                  type="text"
                  value={
                    Array.isArray(params[param.key])
                      ? (params[param.key] as number[]).join(", ")
                      : String(param.default)
                  }
                  onChange={(e) => {
                    const vals = e.target.value
                      .split(",")
                      .map((v) => parseInt(v.trim(), 10))
                      .filter((v) => !isNaN(v));
                    handleChange(param.key, vals);
                  }}
                  placeholder="e.g. 1, 28, 28"
                  className={`${inputClass} font-mono`}
                />
              )}
            </div>
          ))}
        </div>

        {selectedNode.data.inferredShape && (
          <div className="mt-5 pt-4 border-t border-[var(--border-muted)]">
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Inferred Output Shape
            </label>
            <div className="text-sm font-mono text-[var(--accent)]">
              [{selectedNode.data.inferredShape.join(", ")}]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
