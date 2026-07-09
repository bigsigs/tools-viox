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
  name: string;
  label: string;
  type: "number" | "select" | "radio";
  unit?: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: ToolFieldOption[];
  help?: string;
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
  deck: string;
  category: ToolCategory;
  description: string;
  intent: string;
  fields: ToolField[];
  formulaNotes: string[];
  warnings: string[];
  faqs: ToolFaq[];
  related: string[];
  productLinks: ToolLink[];
};

export type CalculationResult = {
  primaryLabel: string;
  primaryValue: string;
  secondary?: string;
  summary: string;
  notes: string[];
  warnings: string[];
};
