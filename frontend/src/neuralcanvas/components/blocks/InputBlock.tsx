"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { BaseBlock } from "./BaseBlock";

interface BlockData extends Record<string, unknown> {
  params: Record<string, number | string>;
}

/** Rounded "entry" node with data flow arrows */
function InputViz() {
  return (
    <svg width={160} height={36} viewBox="0 0 160 36">
      {/* Incoming data arrows */}
      {[10, 18, 26].map((y, i) => (
        <g key={i}>
          <line x1={12} y1={y} x2={40} y2={y} stroke="#F59E0B" strokeWidth="1" opacity={0.55 + i * 0.15} />
          <polygon points={`38,${y - 2} 44,${y} 38,${y + 2}`} fill="#F59E0B" opacity={0.55 + i * 0.15} />
        </g>
      ))}
      {/* Entry funnel */}
      <path d="M48,4 L70,12 L70,24 L48,32 Z" fill="#F59E0B30" stroke="#F59E0B" strokeWidth="1" opacity="0.85" rx="4" />
      {/* Output stream */}
      <line x1={74} y1={18} x2={148} y2={18} stroke="#F59E0B" strokeWidth="1.5" opacity="0.75" />
      <polygon points="146,15 152,18 146,21" fill="#F59E0B" opacity="0.85" />

      {/* Label */}
      <text x={90} y={12} fontSize="8" fill="#F59E0B" opacity="0.9" fontWeight="600">
        Dataset → Training Panel
      </text>
    </svg>
  );
}

function InputBlockComponent({ id, data, selected }: NodeProps<Node<BlockData>>) {
  return (
    <BaseBlock id={id} blockType="Input" params={data?.params ?? {}} selected={!!selected}>
      <InputViz />
    </BaseBlock>
  );
}

export const InputBlock = memo(InputBlockComponent);
