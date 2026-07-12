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
  const regionStandards: Record<string, string> = {
    international: "IEC 61800 series; IEC 60204-1 machinery electrical requirements",
    eu: "EN IEC 61800-3 and EN IEC 61800-5-1; applicable EU machinery requirements",
    "north-america": "NEC Article 430; UL 61800-5-1; NEMA MG 1 Part 31",
    "au-nz": "AS/NZS 3000; AS/NZS IEC 61800.3; local machinery safety requirements",
    china: "GB/T 12668 series; GB/T 5226.1 machinery electrical requirements",
    other: "Use the standards and certification requirements stated by the project authority"
  };
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
        ) : slug === "kw-kva-amp-calculator" ? (
          <>
            <div className="converter-tabs power-task-tabs" role="tablist" aria-label="Power calculation mode">
              {[
                { value: "kva-to-amps", label: "kVA → Amps" },
                { value: "amps-to-kw", label: "Amps → kW" },
                { value: "kw-to-amps", label: "kW → Amps" }
              ].map((mode) => (
                <button type="button" role="tab" aria-selected={String(values.mode) === mode.value} className={String(values.mode) === mode.value ? "active" : ""} onClick={() => setValues((current) => ({ ...current, mode: mode.value, phase: mode.value === "kva-to-amps" && current.phase === "dc" ? "three" : current.phase }))} key={mode.value}>{mode.label}</button>
              ))}
            </div>
            <label className="field">
              <span>System</span>
              <select value={String(values.phase)} onChange={(event) => update("phase", event.target.value)}>
                {String(values.mode) !== "kva-to-amps" ? <option value="dc">DC</option> : null}
                <option value="single">Single-phase AC</option>
                <option value="three">Three-phase AC</option>
              </select>
            </label>
            {String(values.mode) === "kva-to-amps" ? <label className="field"><span>Apparent power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.kva)} onChange={(event) => update("kva", event.target.value)} /><span className="unit-addon">kVA</span></div></label> : null}
            {String(values.mode) === "amps-to-kw" ? <label className="field"><span>Current</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.amps)} onChange={(event) => update("amps", event.target.value)} /><span className="unit-addon">A</span></div></label> : null}
            {String(values.mode) === "kw-to-amps" ? <label className="field"><span>Active power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.power)} onChange={(event) => update("power", event.target.value)} /><span className="unit-addon">kW</span></div></label> : null}
            <label className="field"><span>{String(values.phase) === "three" ? "Line-to-line voltage" : "Voltage"}</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.voltage)} onChange={(event) => update("voltage", event.target.value)} /><span className="unit-addon">V</span></div></label>
            {String(values.mode) !== "kva-to-amps" && String(values.phase) !== "dc" ? <label className="field"><span>Power factor</span><div className="unit-input"><input type="number" min="0.1" max="1" step="0.01" value={String(values.pf)} onChange={(event) => update("pf", event.target.value)} /><span className="unit-addon">pf</span></div></label> : null}
          </>
        ) : slug === "vfd-sizing-protection-calculator" ? (
          <>
            <label className="field"><span>Motor rated output power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.motorPower)} onChange={(event) => update("motorPower", event.target.value)} /><select aria-label="Motor power unit" value={String(values.motorPowerUnit ?? "kw")} onChange={(event) => update("motorPowerUnit", event.target.value)}><option value="kw">kW</option><option value="hp">HP</option></select></div></label>
            <div className="vfd-basic-grid">
              <label className="field"><span>Motor rated voltage</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.motorVoltage)} onChange={(event) => update("motorVoltage", event.target.value)} /><span className="unit-addon">V</span></div></label>
              <label className="field"><span>Motor nameplate current</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.motorCurrent)} onChange={(event) => update("motorCurrent", event.target.value)} /><span className="unit-addon">A</span></div></label>
            </div>
            <label className="field"><span>Application duty</span><select value={String(values.loadType)} onChange={(event) => update("loadType", event.target.value)}><option value="variable">Variable torque: fan / centrifugal pump</option><option value="constant">Constant torque: conveyor / mixer</option><option value="heavy">Heavy / overhauling: hoist / crane</option></select></label>
            <label className="field"><span>Required short-time overload</span><div className="unit-input"><input type="number" min="100" max="250" step="5" value={String(values.requiredOverload)} onChange={(event) => update("requiredOverload", event.target.value)} /><span className="unit-addon">%</span></div></label>
            <div className="service-factor-control">
              <label className="toggle-row"><span><b>Include service-factor loading</b><small>Enable only when operation above nameplate rating is expected.</small></span><input type="checkbox" checked={String(values.includeServiceFactor ?? "no") === "yes"} onChange={(event) => update("includeServiceFactor", event.target.checked ? "yes" : "no")} /></label>
              {String(values.includeServiceFactor ?? "no") === "yes" ? <div className="service-slider"><div><span>Motor service factor</span><strong>{Number(values.serviceFactor ?? 1.15).toFixed(2)}</strong></div><input type="range" min="1" max="1.25" step="0.05" value={String(values.serviceFactor ?? 1.15)} onChange={(event) => update("serviceFactor", event.target.value)} aria-label="Motor service factor" /><div className="slider-labels"><span>1.00</span><span>1.05</span><span>1.10</span><span>1.15</span><span>1.20</span><span>1.25</span></div></div> : null}
            </div>
            <label className="field region-field"><span>Installation region / standards</span><select value={String(values.region ?? "international")} onChange={(event) => update("region", event.target.value)}><option value="international">International — IEC 61800 / IEC 60204-1</option><option value="eu">European Union — EN IEC 61800</option><option value="north-america">North America — NEC 430 / UL 61800-5-1</option><option value="au-nz">Australia / New Zealand — AS/NZS 3000 / 61800.3</option><option value="china">China — GB/T 12668 / GB/T 5226.1</option><option value="other">Other — project-specific standards</option></select><small className="region-standards">{regionStandards[String(values.region ?? "international")]}</small></label>
            <details className="vfd-advanced">
              <summary>Advanced conditions</summary>
              <div className="vfd-advanced-grid">
                {[
                  ["motorEfficiency", "Motor efficiency", "%", 1, 100], ["motorPowerFactor", "Motor power factor", "pf", 0.01, 1], ["designMargin", "Additional sizing margin", "%", 0, 50], ["supplyVoltage", "VFD supply voltage", "V", 1, undefined], ["vfdEfficiency", "VFD efficiency", "%", 80, 100], ["ambient", "Maximum panel ambient", "°C", undefined, undefined], ["altitude", "Installation altitude", "m", 0, undefined], ["motorCableLength", "VFD-to-motor cable length", "m", 0, undefined], ["faultCurrent", "Prospective fault current", "kA", 0, undefined], ["candidateBreaking", "Protection breaking capacity", "kA", 0, undefined]
                ].map(([id, label, unit, min, max]) => <label className="field" key={String(id)}><span>{label}</span><div className="unit-input"><input type="number" step="any" min={min as number | undefined} max={max as number | undefined} value={String(values[String(id)])} onChange={(event) => update(String(id), event.target.value)} /><span className="unit-addon">{unit}</span></div></label>)}
                <label className="field"><span>Rapid braking / overhauling</span><select value={String(values.braking)} onChange={(event) => update("braking", event.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></label>
                <label className="field"><span>Across-line bypass required</span><select value={String(values.bypass)} onChange={(event) => update("bypass", event.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></label>
              </div>
            </details>
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
