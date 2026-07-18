import type { CalculationResult } from "./types";
import esTranslations from "./locales/es-client.json";
import esPatterns from "./locales/es-patterns.json";

export type ClientLocale = "en" | "es";

const translations = esTranslations as Record<string, string>;
const cache = new Map<string, string>();
const protectedTechnicalText = new Set([
  "A", "mA", "kA", "V", "mV", "kV", "W", "kW", "MW", "VA", "kVA", "MVA", "var", "kvar",
  "J", "kJ", "MJ", "Wh", "kWh", "MWh", "Ah", "mAh", "Hz", "kHz", "MHz", "Ω", "mΩ", "kΩ", "MΩ",
  "mm", "mm²", "mm2", "cm", "m", "km", "in", "ft", "AWG", "AC", "DC", "PF", "THD", "THDi", "THDv",
  "IP", "NEMA", "IEC", "NEC", "HP", "RPM", "%", "%Z", "cos φ", "√3"
]);

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const patterns = [...(esPatterns as Array<{ source: string; target: string }>)].sort((a, b) =>
  b.source.replace(/__V\d+__/g, "").length - a.source.replace(/__V\d+__/g, "").length
).map(({ source, target }) => {
  const markers = [...source.matchAll(/__V(\d+)__/g)];
  const parts = source.split(/__V\d+__/);
  const expression = parts.map((part, index) => `${escapeRegex(part)}${index < markers.length ? "(.*?)" : ""}`).join("");
  return { regex: new RegExp(`^${expression}$`), target };
});

export function clientT(locale: ClientLocale, text: string) {
  if (locale === "en" || !text || protectedTechnicalText.has(text)) return text;
  const cached = cache.get(text);
  if (cached) return cached;
  const exact = translations[text];
  if (exact) {
    cache.set(text, exact);
    return exact;
  }
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const translated = pattern.target.replace(/__V(\d+)__/g, (_, index: string) => match[Number(index) + 1] ?? "");
    cache.set(text, translated);
    return translated;
  }
  return text;
}

export function clientExactT(locale: ClientLocale, text: string) {
  if (locale === "en" || !text || protectedTechnicalText.has(text)) return text;
  return translations[text] ?? text;
}

export function clientLocalePath(locale: ClientLocale, path: string) {
  if (!path.startsWith("/")) return path;
  if (locale === "en") return path.replace(/^\/es(?=\/|$)/, "") || "/";
  if (path === "/") return "/es/";
  return path.startsWith("/es/") ? path : `/es${path}`;
}

export function localizeClientResult(result: CalculationResult, locale: ClientLocale): CalculationResult {
  if (locale === "en") return result;
  return {
    ...result,
    primary: clientT(locale, result.primary),
    unit: result.unit,
    summary: clientT(locale, result.summary),
    metrics: result.metrics.map((metric) => ({ label: clientT(locale, metric.label), value: clientT(locale, metric.value) })),
    recommendations: result.recommendations.map((item) => clientT(locale, item))
  };
}
