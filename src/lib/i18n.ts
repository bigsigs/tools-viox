import type { CalculationResult, ToolDefinition, ToolEquation } from "./types";
import type { SeoGuide } from "./seoGuides";
import esTranslations from "./locales/es.json";
import esPatterns from "./locales/es-patterns.json";

export type Locale = "en" | "es";

const translations = esTranslations as Record<string, string>;
const textCache = new Map<string, string>();
const protectedTechnicalText = new Set([
  "A", "mA", "kA", "V", "mV", "kV", "W", "kW", "MW", "VA", "kVA", "MVA", "var", "kvar",
  "J", "kJ", "MJ", "Wh", "kWh", "MWh", "Ah", "mAh", "Hz", "kHz", "MHz", "Ω", "mΩ", "kΩ", "MΩ",
  "mm", "mm²", "mm2", "cm", "m", "km", "in", "ft", "AWG", "AC", "DC", "PF", "THD", "THDi", "THDv",
  "IP", "NEMA", "IEC", "NEC", "HP", "RPM", "%", "%Z", "cos φ", "√3"
]);

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const dynamicPatterns = [...(esPatterns as Array<{ source: string; target: string }>)].sort((a, b) =>
  b.source.replace(/__V\d+__/g, "").length - a.source.replace(/__V\d+__/g, "").length
).map(({ source, target }) => {
  const markers = [...source.matchAll(/__V(\d+)__/g)];
  const parts = source.split(/__V\d+__/);
  const expression = parts.map((part, index) => `${escapeRegex(part)}${index < markers.length ? "(.*?)" : ""}`).join("");
  return { regex: new RegExp(`^${expression}$`), target, markers };
});

export function t(locale: Locale, text: string) {
  if (locale === "en" || !text || protectedTechnicalText.has(text)) return text;
  const cached = textCache.get(text);
  if (cached) return cached;
  const exact = translations[text];
  if (exact) {
    textCache.set(text, exact);
    return exact;
  }
  for (const pattern of dynamicPatterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const translated = pattern.target.replace(/__V(\d+)__/g, (_, index: string) => match[Number(index) + 1] ?? "");
    textCache.set(text, translated);
    return translated;
  }
  return text;
}

export function localePath(locale: Locale, path: string) {
  if (!path.startsWith("/")) return path;
  if (locale === "en") return path.replace(/^\/es(?=\/|$)/, "") || "/";
  if (path === "/") return "/es/";
  return path.startsWith("/es/") ? path : `/es${path}`;
}

export function englishPath(path: string) {
  return path.replace(/^\/es(?=\/|$)/, "") || "/";
}

export function localizeTool(tool: ToolDefinition, locale: Locale): ToolDefinition {
  if (locale === "en") return tool;
  return {
    ...tool,
    title: t(locale, tool.title),
    shortTitle: tool.shortTitle ? t(locale, tool.shortTitle) : undefined,
    description: t(locale, tool.description),
    intent: t(locale, tool.intent),
    fields: tool.fields.map((field) => ({
      ...field,
      label: t(locale, field.label),
      help: field.help ? t(locale, field.help) : undefined,
      options: field.options?.map((option) => ({ ...option, label: t(locale, option.label) })),
      unitOptions: field.unitOptions
    })),
    formula: t(locale, tool.formula),
    assumptions: tool.assumptions.map((item) => t(locale, item)),
    warnings: tool.warnings.map((item) => t(locale, item)),
    faqs: tool.faqs.map((item) => ({ question: t(locale, item.question), answer: t(locale, item.answer) })),
    relatedProducts: tool.relatedProducts.map((item) => ({ ...item, label: t(locale, item.label) })),
    keywords: tool.keywords.map((item) => t(locale, item))
  };
}

export function localizeEquation(equation: ToolEquation | undefined, locale: Locale) {
  if (!equation || locale === "en") return equation;
  return {
    ...equation,
    title: t(locale, equation.title),
    intro: t(locale, equation.intro),
    equations: equation.equations.map((item) => ({
      ...item,
      label: item.label ? t(locale, item.label) : undefined,
      note: item.note ? t(locale, item.note) : undefined
    })),
    symbols: equation.symbols.map((item) => ({ ...item, meaning: t(locale, item.meaning) })),
    conclusion: equation.conclusion ? t(locale, equation.conclusion) : undefined
  } satisfies ToolEquation;
}

export function localizeSeoGuide(guide: SeoGuide | undefined, locale: Locale) {
  if (!guide || locale === "en") return guide;
  return {
    sections: guide.sections.map((section) => ({
      ...section,
      title: t(locale, section.title),
      paragraphs: section.paragraphs.map((item) => t(locale, item)),
      callouts: section.callouts?.map((item) => t(locale, item)),
      steps: section.steps?.map((item) => t(locale, item)),
      bullets: section.bullets?.map((item) => t(locale, item)),
      table: section.table ? {
        headers: section.table.headers.map((item) => t(locale, item)),
        rows: section.table.rows.map((row) => row.map((item) => t(locale, item)))
      } : undefined,
      links: section.links?.map((item) => ({ ...item, label: t(locale, item.label), href: localePath(locale, item.href) }))
    }))
  } satisfies SeoGuide;
}

export function localizeResult(result: CalculationResult, locale: Locale): CalculationResult {
  if (locale === "en") return result;
  return {
    ...result,
    primary: t(locale, result.primary),
    unit: result.unit,
    summary: t(locale, result.summary),
    metrics: result.metrics.map((metric) => ({ label: t(locale, metric.label), value: t(locale, metric.value) })),
    recommendations: result.recommendations.map((item) => t(locale, item))
  };
}

export function localizeRecord<T>(value: T, locale: Locale, skipKeys = new Set(["slug", "href", "value", "id", "category"])): T {
  if (locale === "en") return value;
  if (typeof value === "string") return t(locale, value) as T;
  if (Array.isArray(value)) return value.map((item) => localizeRecord(item, locale, skipKeys)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, skipKeys.has(key) ? child : localizeRecord(child, locale, skipKeys)])) as T;
  }
  return value;
}
