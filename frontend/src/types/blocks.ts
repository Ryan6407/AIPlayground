export type ParamType = "number" | "select" | "boolean" | "tuple" | "text";
export type BlockCategory =
  | "io"
  | "layer"
  | "activation"
  | "normalization"
  | "regularization"
  | "pooling"
  | "merge"
  | "utility";

export interface HandleDef {
  id: string;
  label: string;
}

export interface ParamDef {
  key: string;
  label: string;
  type: ParamType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  default: unknown;
  separator?: boolean;
}

export interface BlockDefinition {
  type: string;
  category: BlockCategory;
  label: string;
  color: string;
  inputs: HandleDef[];
  outputs: HandleDef[];
  parameters: ParamDef[];
  defaultParams: Record<string, unknown>;
}
