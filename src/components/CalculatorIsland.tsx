import { useMemo, useState } from "react";
import { calculateTool } from "../lib/calculate";
import { toolsBySlug } from "../lib/tools";
import type { CalculationResult } from "../lib/types";

type Props = {
  slug: string;
};

export default function CalculatorIsland({ slug }: Props) {
  const tool = toolsBySlug[slug];
  const defaults = useMemo(() => {
    return Object.fromEntries(tool.fields.map((field) => [field.id, field.defaultValue]));
  }, [tool]);
  const [values, setValues] = useState<Record<string, string | number>>(defaults);
  const [copied, setCopied] = useState(false);

  const result = useMemo<CalculationResult | { error: string }>(() => {
    try {
      return calculateTool(slug, values);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Check the input values." };
    }
  }, [slug, values]);

  function update(id: string, value: string) {
    setCopied(false);
    setValues((current) => ({ ...current, [id]: value }));
  }

  async function copyResult() {
    if ("error" in result) return;
    const text = [
      `${tool.title} result`,
      `${result.primary}${result.unit ? ` ${result.unit}` : ""}`,
      result.summary,
      ...result.metrics.map((metric) => `${metric.label}: ${metric.value}`)
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <div className="calculator-grid">
      <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="panel-label">Inputs</div>
        {tool.fields.map((field) => (
          <label className="field" key={field.id}>
            <span>
              {field.label}
              {field.unit ? <em>{field.unit}</em> : null}
            </span>
            {field.type === "select" ? (
              <select value={String(values[field.id])} onChange={(event) => update(field.id, event.target.value)}>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                inputMode="decimal"
                value={String(values[field.id])}
                min={field.min}
                max={field.max}
                step={field.step ?? "any"}
                onChange={(event) => update(field.id, event.target.value)}
              />
            )}
            {field.help ? <small>{field.help}</small> : null}
          </label>
        ))}
      </form>

      <section className="result-panel" aria-live="polite">
        <div className="panel-label">Result</div>
        {"error" in result ? (
          <div className="result-error">{result.error}</div>
        ) : (
          <>
            <div className={`result-primary ${result.severity ?? "ok"}`}>
              <strong>{result.primary}</strong>
              {result.unit ? <span>{result.unit}</span> : null}
            </div>
            <p className="result-summary">{result.summary}</p>
            <div className="metric-list">
              {result.metrics.map((metric) => (
                <div className="metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
            <div className="recommendations">
              <div className="panel-label">Next checks</div>
              <ul>
                {result.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="result-actions">
              <button type="button" onClick={copyResult}>{copied ? "Copied" : "Copy result"}</button>
              <a href="https://viox.com/contact">Ask VIOX</a>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
