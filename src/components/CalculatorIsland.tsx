import { useEffect, useMemo, useState } from "react";
import { calculateTool } from "../lib/calculate";
import { toolsBySlug } from "../lib/tools";
import type { CalculationResult } from "../lib/types";

type Props = {
  slug: string;
};

export default function CalculatorIsland({ slug }: Props) {
  const tool = toolsBySlug[slug];
  const defaults = useMemo<Record<string, string | number>>(() => {
    return Object.fromEntries(tool.fields.flatMap((field) => {
      const entries: Array<[string, string | number]> = [[field.id, field.defaultValue ?? ""]];
      if (field.unitOptions?.length) {
        entries.push([`${field.id}Unit`, field.defaultUnit ?? field.unitOptions[0].value]);
      }
      return entries;
    }));
  }, [tool]);
  const [values, setValues] = useState<Record<string, string | number>>(defaults);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storageKey = "viox:last-used-calculators";
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      const current = Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
      localStorage.setItem(storageKey, JSON.stringify([slug, ...current.filter((item) => item !== slug)].slice(0, 3)));
    } catch {
      localStorage.setItem(storageKey, JSON.stringify([slug]));
    }
  }, [slug]);

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

  function selectOhmsQuantity(symbol: string) {
    const selected = String(values.solveFrom);
    const order = ["v", "i", "r", "p"];
    const next = selected.includes(symbol)
      ? selected.replace(symbol, "")
      : [...(selected.length < 2 ? selected : selected.slice(-1)), symbol]
          .sort((a, b) => order.indexOf(a) - order.indexOf(b))
          .join("");
    update("solveFrom", next);
  }

  function selectPowerQuantity(symbol: string) {
    const selected = String(values.knownQuantities);
    const order = ["p", "i", "v"];
    const next = selected.includes(symbol)
      ? selected.replace(symbol, "")
      : [...(selected.length < 2 ? selected : selected.slice(-1)), symbol]
          .sort((a, b) => order.indexOf(a) - order.indexOf(b))
          .join("");
    update("knownQuantities", next);
  }

  const ohmsQuantities = [
    { id: "voltage", symbol: "V", key: "v", label: "Voltage", unit: "V" },
    { id: "current", symbol: "I", key: "i", label: "Current", unit: "A" },
    { id: "resistance", symbol: "R", key: "r", label: "Resistance", unit: "Ω" },
    { id: "power", symbol: "P", key: "p", label: "Power", unit: "W" }
  ];
  const powerQuantities = [
    { id: "power", symbol: "P", key: "p", label: "Power", unit: "W" },
    { id: "current", symbol: "I", key: "i", label: "Current", unit: "A" },
    { id: "voltage", symbol: "V", key: "v", label: "Voltage", unit: "V" }
  ];

  return (
    <div className={`calculator-grid ${slug === "ohms-law-calculator" ? "ohms-calculator" : ""}`}>
      <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="panel-label">Inputs</div>
        {slug === "ohms-law-calculator" ? (
          <>
            <p className="ohms-instruction">Choose two known quantities, then enter their values.</p>
            <div className="ohms-quantity-grid">
              {ohmsQuantities.map((quantity) => {
                const selected = String(values.solveFrom).includes(quantity.key);
                return (
                  <div className={`ohms-quantity ${selected ? "selected" : ""}`} key={quantity.id}>
                    <button type="button" aria-pressed={selected} onClick={() => selectOhmsQuantity(quantity.key)}>
                      <b>{quantity.symbol}</b><span>{quantity.label}</span>
                    </button>
                    <div className="unit-input">
                      <input type="number" inputMode="decimal" min="0" step="any" disabled={!selected} aria-label={`${quantity.label}${selected ? " known value" : " not selected"}`} value={String(values[quantity.id])} onChange={(event) => update(quantity.id, event.target.value)} />
                      <span className="unit-addon">{quantity.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : slug === "watts-amps-volts-calculator" ? (
          <>
            <label className="field">
              <span>System</span>
              <select value={String(values.phase)} onChange={(event) => update("phase", event.target.value)}>
                <option value="dc">DC</option>
                <option value="single">Single-phase AC</option>
                <option value="three">Three-phase AC</option>
              </select>
            </label>
            <p className="ohms-instruction">Choose two known quantities, then enter their values.</p>
            <div className="ohms-quantity-grid power-quantity-grid">
              {powerQuantities.map((quantity) => {
                const selected = String(values.knownQuantities).includes(quantity.key);
                return (
                  <div className={`ohms-quantity ${selected ? "selected" : ""}`} key={quantity.id}>
                    <button type="button" aria-pressed={selected} onClick={() => selectPowerQuantity(quantity.key)}>
                      <b>{quantity.symbol}</b><span>{quantity.label}</span>
                    </button>
                    <div className="unit-input">
                      <input type="number" inputMode="decimal" min="0" step="any" disabled={!selected} aria-label={`${quantity.label}${selected ? " known value" : " calculated value"}`} value={String(values[quantity.id])} onChange={(event) => update(quantity.id, event.target.value)} />
                      <span className="unit-addon">{quantity.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {String(values.phase) !== "dc" ? (
              <label className="field">
                <span>Power factor</span>
                <div className="unit-input">
                  <input type="number" inputMode="decimal" min="0.01" max="1" step="0.01" value={String(values.powerFactor)} onChange={(event) => update("powerFactor", event.target.value)} />
                  <span className="unit-addon">pf</span>
                </div>
              </label>
            ) : null}
          </>
        ) : tool.fields.filter((field) => !field.showWhen || field.showWhen.values.includes(String(values[field.showWhen.field]))).map((field) => (
          <label className="field" key={field.id}>
            <span>
              {field.label}
            </span>
            {field.type === "select" ? (
              <select value={String(values[field.id])} onChange={(event) => update(field.id, event.target.value)}>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <div className="unit-input">
                <input
                  type="number"
                  inputMode="decimal"
                  value={String(values[field.id])}
                  min={field.min}
                  max={field.max}
                  step={field.step ?? (values[`${field.id}Unit`] === "AWG" ? 1 : "any")}
                  onChange={(event) => update(field.id, event.target.value)}
                />
                {field.unitOptions?.length ? (
                  <select
                    aria-label={`${field.label} unit`}
                    value={String(values[`${field.id}Unit`] ?? field.defaultUnit ?? field.unitOptions[0].value)}
                    onChange={(event) => update(`${field.id}Unit`, event.target.value)}
                  >
                    {field.unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : field.unit ? (
                  <span className="unit-addon">{field.unit}</span>
                ) : null}
              </div>
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
