export type ToolCategory =
  | "surge-protection"
  | "circuit-protection"
  | "cable-wiring"
  | "motor-control"
  | "ev-charging"
  | "power-conversion"
  | "panel-design";

export type ToolFieldOption = {
  label: string;
  value: string;
};

export type ToolField = {
  id: string;
  label: string;
  type: "number" | "select" | "radio";
  unit?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: ToolFieldOption[];
};

export type ToolLink = {
  label: string;
  href: string;
};

export type ToolFaq = {
  question: string;
  answer: string;
};

export type ToolDefinition = {
  slug: string;
  title: string;
  shortTitle?: string;
  category: ToolCategory;
  description: string;
  intent: string;
  fields: ToolField[];
  formula: string;
  assumptions: string[];
  warnings: string[];
  faqs: ToolFaq[];
  relatedTools: string[];
  relatedProducts: ToolLink[];
  keywords: string[];
};

export type ResultSeverity = "ok" | "caution" | "warning";

export type ResultMetric = {
  label: string;
  value: string;
};

export type CalculationResult = {
  primary: string;
  unit?: string;
  severity: ResultSeverity;
  summary: string;
  metrics: ResultMetric[];
  recommendations: string[];
};
