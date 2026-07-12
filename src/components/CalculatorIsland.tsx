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
  const converterUnits = {
    power: [{ value: "w", label: "W", factor: 1 }, { value: "kw", label: "kW", factor: 1e3 }, { value: "mw", label: "MW", factor: 1e6 }, { value: "hp", label: "hp", factor: 745.699872 }, { value: "btuh", label: "BTU/h", factor: 0.2930710702 }],
    energy: [{ value: "j", label: "J", factor: 1 }, { value: "kj", label: "kJ", factor: 1e3 }, { value: "mj", label: "MJ", factor: 1e6 }, { value: "wh", label: "Wh", factor: 3600 }, { value: "kwh", label: "kWh", factor: 3.6e6 }, { value: "mwh", label: "MWh", factor: 3.6e9 }]
  };
  const converterMode = String(values.quantity) as "power" | "energy" | "current";
  const activeUnits = converterMode === "energy" ? converterUnits.energy : converterUnits.power;
  const fromFactor = activeUnits.find((unit) => unit.value === String(values.fromUnit))?.factor ?? 1;
  const toFactor = activeUnits.find((unit) => unit.value === String(values.toUnit))?.factor ?? 1;
  const leftNumber = Number(values.leftValue) || 0, rightNumber = Number(values.rightValue) || 0;
  const editedRight = String(values.inputSide) === "right";
  const convertedNumber = editedRight ? rightNumber * toFactor / fromFactor : leftNumber * fromFactor / toFactor;
  const formatConverterValue = (value: number) => Number.isFinite(value) ? Number(value.toPrecision(7)).toString() : "";
  const displayedLeft = editedRight ? formatConverterValue(convertedNumber) : String(values.leftValue);
  const displayedRight = editedRight ? String(values.rightValue) : formatConverterValue(convertedNumber);

  function chooseConverterMode(mode: "power" | "energy" | "current") {
    setCopied(false);
    setValues((current) => mode === "energy"
      ? { ...current, quantity: mode, fromUnit: "kwh", toUnit: "mj", leftValue: 1, rightValue: 3.6, inputSide: "left" }
      : mode === "power"
        ? { ...current, quantity: mode, fromUnit: "kw", toUnit: "hp", leftValue: 1, rightValue: 1.34102, inputSide: "left" }
        : { ...current, quantity: mode });
  }

  function updateConverterValue(side: "left" | "right", value: string) {
    setCopied(false);
    setValues((current) => ({ ...current, inputSide: side, [side === "left" ? "leftValue" : "rightValue"]: value }));
  }

  function swapConverterUnits() {
    setCopied(false);
    setValues((current) => ({ ...current, fromUnit: current.toUnit, toUnit: current.fromUnit, leftValue: displayedRight, rightValue: displayedLeft, inputSide: "left" }));
  }

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
        ) : slug === "electrical-unit-converter" ? (
          <>
            <div className="converter-tabs" role="tablist" aria-label="Conversion mode">
              {(["power", "energy", "current"] as const).map((mode) => (
                <button type="button" role="tab" aria-selected={converterMode === mode} className={converterMode === mode ? "active" : ""} onClick={() => chooseConverterMode(mode)} key={mode}>
                  {mode === "current" ? "Phase current" : mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {converterMode === "current" ? (
              <div className="phase-current-fields">
                <label className="field"><span>System</span><select value={String(values.phase)} onChange={(event) => update("phase", event.target.value)}><option value="dc">DC</option><option value="single">Single-phase AC</option><option value="three">Three-phase AC</option></select></label>
                <label className="field"><span>Active power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.phasePower)} onChange={(event) => update("phasePower", event.target.value)} /><select aria-label="Power unit" value={String(values.phasePowerUnit)} onChange={(event) => update("phasePowerUnit", event.target.value)}><option value="w">W</option><option value="kw">kW</option><option value="mw">MW</option></select></div></label>
                <label className="field"><span>{String(values.phase) === "three" ? "Line-to-line voltage" : "Voltage"}</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.voltage)} onChange={(event) => update("voltage", event.target.value)} /><span className="unit-addon">V</span></div></label>
                {String(values.phase) !== "dc" ? <label className="field"><span>Power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.powerFactor)} onChange={(event) => update("powerFactor", event.target.value)} /><span className="unit-addon">pf</span></div></label> : null}
              </div>
            ) : (
              <div className="bidirectional-converter">
                <label><span>From</span><div className="converter-value"><input type="number" inputMode="decimal" min="0" step="any" value={displayedLeft} onChange={(event) => updateConverterValue("left", event.target.value)} /><select aria-label="From unit" value={String(values.fromUnit)} onChange={(event) => update("fromUnit", event.target.value)}>{activeUnits.map((unit) => <option value={unit.value} key={unit.value}>{unit.label}</option>)}</select></div></label>
                <button className="swap-units" type="button" title="Swap units" aria-label="Swap units" onClick={swapConverterUnits}>↔</button>
                <label><span>To</span><div className="converter-value"><input type="number" inputMode="decimal" min="0" step="any" value={displayedRight} onChange={(event) => updateConverterValue("right", event.target.value)} /><select aria-label="To unit" value={String(values.toUnit)} onChange={(event) => update("toUnit", event.target.value)}>{activeUnits.map((unit) => <option value={unit.value} key={unit.value}>{unit.label}</option>)}</select></div></label>
              </div>
            )}
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
