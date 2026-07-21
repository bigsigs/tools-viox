import { useEffect, useMemo, useRef, useState } from "react";
import { calculateTool } from "../lib/calculate";
import { clientExactT, clientLocalePath, clientT, localizeClientResult, type ClientLocale } from "../lib/i18n-client";
import { toolsBySlug } from "../lib/tools";
import type { CalculationResult, ToolDefinition } from "../lib/types";

type Props = {
  slug: string;
  locale?: ClientLocale;
  localizedTool?: ToolDefinition;
};

export default function CalculatorIsland({ slug, locale = "en", localizedTool }: Props) {
  const tool = localizedTool ?? toolsBySlug[slug];
  const rootRef = useRef<HTMLDivElement>(null);
  const tr = (text: string) => clientT(locale, text);
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

  useEffect(() => {
    if (locale === "en" || !rootRef.current) return;
    const translateDom = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        const original = root.textContent ?? "";
        const value = original.trim();
        if (!value) return;
        const translated = clientExactT(locale, value);
        if (translated !== value) root.textContent = original.replace(value, translated);
        return;
      }
      if (!(root instanceof Element)) return;
      ["aria-label", "title", "placeholder"].forEach((attribute) => {
        const value = root.getAttribute(attribute);
        if (!value) return;
        const translated = clientExactT(locale, value);
        if (translated !== value) root.setAttribute(attribute, translated);
      });
      root.childNodes.forEach(translateDom);
    };
    const frame = requestAnimationFrame(() => rootRef.current && translateDom(rootRef.current));
    return () => cancelAnimationFrame(frame);
  }, [locale, values]);

  const result = useMemo<CalculationResult | { error: string }>(() => {
    try {
      return localizeClientResult(calculateTool(slug, values), locale);
    } catch (error) {
      return { error: clientT(locale, error instanceof Error ? error.message : "Check the input values.") };
    }
  }, [slug, values, locale]);

  function update(id: string, value: string) {
    setCopied(false);
    setValues((current) => ({ ...current, [id]: value }));
  }

  async function copyResult() {
    if ("error" in result) return;
    const text = [
      `${tool.title} ${tr("result")}`,
      `${result.primary}${result.unit ? ` ${result.unit}` : ""}`,
      result.summary,
      ...result.metrics.map((metric) => `${metric.label}: ${metric.value}`)
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  async function downloadResultPdf() {
    if ("error" in result) return;

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    const pageBottom = pageHeight - 20;
    const colors = {
      red: [215, 25, 32] as const,
      ink: [24, 29, 35] as const,
      text: [68, 78, 89] as const,
      muted: [105, 116, 128] as const,
      line: [222, 226, 231] as const,
      soft: [247, 248, 250] as const,
      redSoft: [255, 246, 246] as const,
      white: [255, 255, 255] as const
    };
    let y = 16;

    const clean = (text: string) => text
      .replaceAll("²", "2")
      .replaceAll("³", "3")
      .replaceAll("Ω", "ohm")
      .replaceAll("µ", "u")
      .replaceAll("μ", "u")
      .replaceAll("π", "pi")
      .replaceAll("φ", "phi")
      .replaceAll("ρ", "rho")
      .replaceAll("η", "eta")
      .replaceAll("τ", "tau")
      .replaceAll("θ", "theta")
      .replaceAll("Δ", "Delta")
      .replaceAll("Σ", "sum")
      .replaceAll("±", "+/-")
      .replaceAll("≈", "~")
      .replaceAll("∞", "infinity")
      .replaceAll("↔", "<->")
      .replaceAll("°", " deg ")
      .replaceAll("×", "x")
      .replaceAll("√", "sqrt")
      .replaceAll("≤", "<=")
      .replaceAll("≥", ">=")
      .replaceAll("−", "-")
      .replaceAll("–", "-")
      .replaceAll("—", "-")
      .replaceAll("→", "->");

    const drawPageTop = (continued = false) => {
      pdf.setFillColor(...colors.red);
      pdf.rect(0, 0, pageWidth, 3, "F");
      if (!continued) return;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...colors.red);
      pdf.text("VIOX ELECTRIC", margin, 13);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.muted);
      pdf.text(clean(tool.shortTitle ?? tool.title), pageWidth - margin, 13, { align: "right" });
      pdf.setDrawColor(...colors.line);
      pdf.setLineWidth(0.25);
      pdf.line(margin, 17, pageWidth - margin, 17);
    };

    const addPage = () => {
      pdf.addPage();
      drawPageTop(true);
      y = 24;
    };

    const ensureSpace = (height: number) => {
      if (y + height <= pageBottom) return false;
      addPage();
      return true;
    };

    const sectionTitle = (title: string) => {
      ensureSpace(14);
      pdf.setDrawColor(...colors.red);
      pdf.setLineWidth(0.9);
      pdf.line(margin, y + 1.2, margin + 9, y + 1.2);
      pdf.setTextColor(...colors.ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12.5);
      pdf.text(clean(title), margin + 12, y + 2.2);
      y += 10;
    };

    const drawDataCard = (x: number, top: number, width: number, height: number, label: string, value: string) => {
      pdf.setFillColor(...colors.soft);
      pdf.setDrawColor(...colors.line);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(x, top, width, height, 1.8, 1.8, "FD");
      pdf.setDrawColor(...colors.red);
      pdf.setLineWidth(0.7);
      pdf.line(x + 5, top + 5, x + 12, top + 5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.2);
      pdf.setTextColor(...colors.muted);
      const labelLines = pdf.splitTextToSize(clean(label).toUpperCase(), width - 20);
      pdf.text(labelLines, x + 15, top + 5.8);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.2);
      pdf.setTextColor(...colors.ink);
      const valueLines = pdf.splitTextToSize(clean(value), width - 10);
      pdf.text(valueLines, x + 5, top + 12.5);
    };

    const drawDataGrid = (title: string, rows: Array<{ label: string; value: string }>) => {
      sectionTitle(title);
      const gap = 4;
      const cardWidth = (contentWidth - gap) / 2;
      for (let index = 0; index < rows.length; index += 2) {
        const pair = rows.slice(index, index + 2);
        const heights = pair.map((item) => {
          const labelLines = pdf.splitTextToSize(clean(item.label).toUpperCase(), cardWidth - 20).length;
          const valueLines = pdf.splitTextToSize(clean(item.value), cardWidth - 10).length;
          return Math.max(20, 9 + labelLines * 2.8 + valueLines * 4.2);
        });
        const cardHeight = Math.max(...heights);
        if (y + cardHeight > pageBottom) {
          addPage();
          sectionTitle(`${title} continued`);
        }
        pair.forEach((item, pairIndex) => drawDataCard(margin + pairIndex * (cardWidth + gap), y, cardWidth, cardHeight, item.label, item.value));
        y += cardHeight + 4;
      }
    };

    const visibleInputRows = Array.from(document.querySelectorAll<HTMLElement>(".input-panel .field"))
      .filter((field) => field.offsetParent !== null)
      .map((field) => {
        const label = field.querySelector<HTMLElement>(":scope > span")?.innerText.trim() ?? "Input";
        const controls = Array.from(field.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input:not(:disabled), select:not(:disabled)"));
        const values = controls.map((control) => {
          if (control instanceof HTMLSelectElement) return control.selectedOptions[0]?.text.trim() ?? control.value;
          if (control.type === "checkbox") return control.checked ? "Yes" : "No";
          return control.value;
        }).filter(Boolean);
        const addon = field.querySelector<HTMLElement>(".unit-addon")?.innerText.trim();
        if (addon && values.length === 1) values[0] = `${values[0]} ${addon}`;
        return { label, value: values.join(" ") };
      })
      .filter((item) => item.value);

    const selectedQuantityRows = Array.from(document.querySelectorAll<HTMLElement>(".ohms-quantity.selected"))
      .filter((field) => field.offsetParent !== null)
      .map((field) => ({
        label: field.querySelector<HTMLElement>("button span")?.innerText.trim() ?? "Known quantity",
        value: `${field.querySelector<HTMLInputElement>("input")?.value ?? ""} ${field.querySelector<HTMLElement>(".unit-addon")?.innerText.trim() ?? ""}`.trim()
      }))
      .filter((item) => item.value);

    const inputRows = [...visibleInputRows, ...selectedQuantityRows];

    drawPageTop();
    pdf.setTextColor(...colors.red);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("VIOX", margin, y);
    pdf.setFontSize(7.5);
    pdf.setTextColor(...colors.muted);
    pdf.text("ENGINEERING TOOLS", margin + 25, y - 0.4);
      pdf.text(clean(tr("CALCULATION REPORT")), pageWidth - margin, y - 0.4, { align: "right" });
    y += 10;

    pdf.setTextColor(...colors.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    const reportTitleLines = pdf.splitTextToSize(clean(tool.title), contentWidth - 8);
    pdf.text(reportTitleLines, margin, y);
    y += reportTitleLines.length * 8 + 2;

    const now = new Date();
    const generated = now.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
    pdf.setTextColor(...colors.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`${tr("Generated")} ${generated}`, margin, y);
    pdf.text(`tools.viox.com${clientLocalePath(locale, `/${slug}/`)}`, pageWidth - margin, y, { align: "right" });
    y += 6;
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;

    const primaryLines = pdf.splitTextToSize(clean(`${result.primary}${result.unit ? ` ${result.unit}` : ""}`), contentWidth - 14);
    const summaryLines = pdf.splitTextToSize(clean(result.summary), contentWidth - 14);
    const resultBoxHeight = 25 + primaryLines.length * 9 + summaryLines.length * 4.2;
    pdf.setFillColor(...colors.white);
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, y, contentWidth, resultBoxHeight, 2.2, 2.2, "FD");
    pdf.setFillColor(...colors.red);
    pdf.roundedRect(margin, y, contentWidth, 2.2, 2.2, 2.2, "F");
    pdf.rect(margin, y + 1.2, contentWidth, 1, "F");
    pdf.setTextColor(...colors.red);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(clean(tr("CALCULATED RESULT")), margin + 7, y + 10);
    pdf.setTextColor(...colors.ink);
    pdf.setFontSize(24);
    pdf.text(primaryLines, margin + 7, y + 21);
    const summaryY = y + 21 + primaryLines.length * 9;
    pdf.setTextColor(...colors.text);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(summaryLines, margin + 7, summaryY);
    y += resultBoxHeight + 9;

    const fallbackInputs = tool.fields
      .filter((field) => !field.showWhen || field.showWhen.values.includes(String(values[field.showWhen.field])))
      .map((field) => {
        const rawValue = String(values[field.id] ?? "");
        const selectedLabel = field.options?.find((option) => option.value === rawValue)?.label ?? rawValue;
        const selectedUnit = field.unitOptions?.find((option) => option.value === String(values[`${field.id}Unit`]))?.label ?? field.unit ?? "";
        return { label: field.label, value: `${selectedLabel}${selectedUnit ? ` ${selectedUnit}` : ""}` };
      });
    drawDataGrid(tr("Inputs"), inputRows.length ? inputRows : fallbackInputs);
    y += 2;
    drawDataGrid(tr("Result details"), result.metrics);
    y += 2;

    pdf.setFont("courier", "bold");
    const formulaLines = pdf.splitTextToSize(clean(tool.formula), contentWidth - 14);
    const formulaHeight = Math.max(24, formulaLines.length * 4.4 + 16);
    ensureSpace(formulaHeight + 14);
    sectionTitle(tr("Formula and method"));
    pdf.setFillColor(...colors.soft);
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(margin, y, contentWidth, formulaHeight, 2, 2, "FD");
    pdf.setFillColor(...colors.red);
    pdf.rect(margin, y, 2.2, formulaHeight, "F");
    pdf.setFont("courier", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.ink);
    pdf.text(formulaLines, margin + 8, y + 9);
    y += formulaHeight + 7;

    sectionTitle(tr("Engineering notes"));
    result.recommendations.forEach((recommendation, index) => {
      const lines = pdf.splitTextToSize(clean(recommendation), contentWidth - 18);
      const noteHeight = Math.max(14, lines.length * 4 + 8);
      if (ensureSpace(noteHeight + 3)) sectionTitle(`${tr("Engineering notes")} ${tr("continued")}`);
      pdf.setFillColor(...colors.redSoft);
      pdf.setDrawColor(245, 218, 220);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(margin, y, contentWidth, noteHeight, 1.6, 1.6, "FD");
      pdf.setFillColor(...colors.red);
      pdf.circle(margin + 7, y + 7, 3.2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.white);
      pdf.text(String(index + 1), margin + 7, y + 8, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...colors.text);
      pdf.text(lines, margin + 14, y + 6.5);
      y += noteHeight + 3;
    });

    const disclaimer = tr("Preliminary engineering reference only. Verify all inputs, assumptions, operating conditions, equipment ratings, protection requirements, applicable standards, and manufacturer data before final design or product selection.");
    const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth - 34);
    const disclaimerHeight = disclaimerLines.length * 3.8 + 13;
    ensureSpace(disclaimerHeight + 5);
    y += 3;
    pdf.setFillColor(...colors.ink);
    pdf.roundedRect(margin, y, contentWidth, disclaimerHeight, 1.8, 1.8, "F");
    pdf.setTextColor(...colors.red);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.2);
    pdf.text(tr("IMPORTANT"), margin + 7, y + 7);
    pdf.setTextColor(...colors.white);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(disclaimerLines, margin + 25, y + 7);

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(...colors.line);
      pdf.setLineWidth(0.25);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      pdf.setTextColor(...colors.muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.2);
      pdf.text("VIOX Electrical Tools  |  tools.viox.com", margin, pageHeight - 9);
      pdf.text(`${tr("Page")} ${page} / ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    }

    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    pdf.save(`VIOX-${slug}-${date}.pdf`);
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
  const glandThreadOptions: Record<string, string[]> = {
    metric: ["M12", "M16", "M20", "M25", "M32", "M40", "M50", "M63", "M75", "M90"],
    pg: ["PG7", "PG9", "PG11", "PG13.5", "PG16", "PG21", "PG29", "PG36", "PG42", "PG48"],
    npt: ["NPT 1/4", "NPT 3/8", "NPT 1/2", "NPT 3/4", "NPT 1", "NPT 1-1/4", "NPT 1-1/2", "NPT 2"],
    g: ["G 1/4", "G 3/8", "G 1/2", "G 3/4", "G 1", "G 1-1/4", "G 1-1/2", "G 2"]
  };

  function chooseGlandMode(mode: string) {
    setCopied(false);
    setValues((current) => ({
      ...current,
      mode,
      ...(glandThreadOptions[mode]?.length ? { threadSize: glandThreadOptions[mode][0] } : {})
    }));
  }
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
    <div ref={rootRef} className={`calculator-grid ${slug === "ohms-law-calculator" ? "ohms-calculator" : ""}`}>
      <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="panel-label">{tr("Inputs")}</div>
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
        ) : slug === "solid-state-relay-calculator" ? (
          <>
            <div className="converter-tabs power-task-tabs ssr-mode-tabs" role="tablist" aria-label={tr("Solid state relay calculation mode")}>
              {[
                { value: "select", label: "Select an SSR" },
                { value: "thermal", label: "Size a heatsink" },
                { value: "verify", label: "Check an existing SSR" }
              ].map((mode) => <button type="button" role="tab" aria-selected={String(values.mode) === mode.value} className={String(values.mode) === mode.value ? "active" : ""} onClick={() => update("mode", mode.value)} key={mode.value}>{tr(mode.label)}</button>)}
            </div>
            <div className="energy-relationship-note ssr-mode-note">
              <strong>{String(values.mode) === "select" ? tr("Load → SSR electrical screen") : String(values.mode) === "thermal" ? tr("SSR loss → Heatsink and junction temperature") : tr("Candidate SSR → Datasheet limit checks")}</strong>
              <span>{String(values.mode) === "select" ? tr("Start with the load, then replace the utilization input with the exact manufacturer derating curve.") : String(values.mode) === "thermal" ? tr("Use worst-case on-state data at operating temperature, not a typical room-temperature value.") : tr("Enter limits from one exact SSR datasheet on the same waveform and duration basis.")}</span>
            </div>
            {tool.fields.filter((field) => {
              if (field.id === "mode") return false;
              const modeFields: Record<string, string[]> = {
                select: ["system", "inputMethod", "loadPower", "loadCurrent", "loadVoltage", "powerFactor", "efficiency", "loadType", "expectedInrush", "ratedUtilization", "voltageMargin", "controlVoltage"],
                thermal: ["outputTechnology", "thermalCurrent", "poles", "sharedDevices", "conductionDuty", "onStateVoltage", "onResistance", "thermalAmbient", "maxJunction", "rJc", "rCs", "installedRsa"],
                verify: ["actualCurrent", "allowedCurrent", "actualVoltage", "ratedVoltage", "inrushCurrent", "surgeRating", "pulseDuration", "ssrI2t", "fuseI2t", "offLeakage", "minimumLoad", "actualMinimumLoad"]
              };
              if (!modeFields[String(values.mode)]?.includes(field.id)) return false;
              if (field.id === "powerFactor" && values.system === "dc") return false;
              return !field.showWhen || field.showWhen.values.includes(String(values[field.showWhen.field]));
            }).map((field) => (
              <label className="field" key={field.id}>
                <span>{field.label}</span>
                {field.type === "select" ? (
                  <select value={String(values[field.id])} onChange={(event) => update(field.id, event.target.value)}>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <div className="unit-input">
                    <input type="number" inputMode="decimal" value={String(values[field.id])} min={field.min} max={field.max} step={field.step ?? "any"} onChange={(event) => update(field.id, event.target.value)} />
                    {field.unit ? <span className="unit-addon">{field.unit}</span> : null}
                  </div>
                )}
                {field.help ? <small>{field.help}</small> : null}
              </label>
            ))}
          </>
        ) : slug === "enclosure-temperature-rise-calculator" ? (
          <>
            <div className="converter-tabs power-task-tabs enclosure-mode-tabs" role="tablist" aria-label="Enclosure cooling calculation mode">
              {[
                { value: "internal", label: "Internal temperature" },
                { value: "airflow", label: "Required airflow" },
                { value: "cooling", label: "Cooling capacity" }
              ].map((mode) => <button type="button" role="tab" aria-selected={String(values.mode) === mode.value} className={String(values.mode) === mode.value ? "active" : ""} onClick={() => update("mode", mode.value)} key={mode.value}>{mode.label}</button>)}
            </div>
            <div className="energy-relationship-note enclosure-mode-note">
              <strong>{String(values.mode) === "internal" ? "Heat load + airflow → Internal temperature" : String(values.mode) === "airflow" ? "Heat load + target temperature → Required airflow" : "Heat balance + target temperature → Cooling capacity"}</strong>
              <span>{String(values.mode) === "internal" ? "Enter delivered airflow after filters, or use zero to screen passive heat transfer." : String(values.mode) === "airflow" ? "Open-loop ventilation can only approach a temperature above ambient." : "The result separates internal heat, solar allowance, wall transfer, and design margin."}</span>
            </div>
            {tool.fields.filter((field) => field.id !== "mode" && (!field.showWhen || field.showWhen.values.includes(String(values[field.showWhen.field])))).map((field) => (
              <label className="field" key={field.id}>
                <span>{field.label}</span>
                {field.type === "select" ? (
                  <select value={String(values[field.id])} onChange={(event) => update(field.id, event.target.value)}>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <div className="unit-input">
                    <input type="number" inputMode="decimal" value={String(values[field.id])} min={field.min} max={field.max} step={field.step ?? "any"} onChange={(event) => update(field.id, event.target.value)} />
                    {field.unitOptions?.length ? (
                      <select aria-label={`${field.label} ${tr("unit")}`} value={String(values[`${field.id}Unit`] ?? field.defaultUnit ?? field.unitOptions[0].value)} onChange={(event) => update(`${field.id}Unit`, event.target.value)}>
                        {field.unitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    ) : field.unit ? <span className="unit-addon">{field.unit}</span> : null}
                  </div>
                )}
                {field.help ? <small>{field.help}</small> : null}
              </label>
            ))}
          </>
        ) : slug === "three-phase-power-calculator" ? (
          <>
            <div className="converter-tabs power-task-tabs three-phase-power-tabs" role="tablist" aria-label="Three-phase power calculation mode">
              {[{ value: "measured", label: "V + A + PF → Power" }, { value: "kw-current", label: "kW + V + PF → Amps" }, { value: "kva-current", label: "kVA + V → Amps" }].map((mode) => <button type="button" role="tab" aria-selected={String(values.mode) === mode.value} className={String(values.mode) === mode.value ? "active" : ""} onClick={() => update("mode", mode.value)} key={mode.value}>{mode.label}</button>)}
            </div>
            <label className="field"><span>Line-to-line voltage</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.voltage)} onChange={(event) => update("voltage", event.target.value)} /><span className="unit-addon">V</span></div></label>
            {String(values.mode) === "measured" ? <label className="field"><span>Line current</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.current)} onChange={(event) => update("current", event.target.value)} /><span className="unit-addon">A</span></div></label> : null}
            {String(values.mode) === "kw-current" ? <label className="field"><span>Active power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.activePower)} onChange={(event) => update("activePower", event.target.value)} /><span className="unit-addon">kW</span></div></label> : null}
            {String(values.mode) === "kva-current" ? <label className="field"><span>Apparent power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.apparentPower)} onChange={(event) => update("apparentPower", event.target.value)} /><span className="unit-addon">kVA</span></div></label> : null}
            <label className="field"><span>Power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.powerFactor)} onChange={(event) => update("powerFactor", event.target.value)} /><span className="unit-addon">PF</span></div></label>
            <div className="three-phase-secondary-grid"><label className="field"><span>Reactive load</span><select value={String(values.loadType)} onChange={(event) => update("loadType", event.target.value)}><option value="inductive">Inductive — lagging</option><option value="capacitive">Capacitive — leading</option></select></label><label className="field"><span>Target power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.targetPf)} onChange={(event) => update("targetPf", event.target.value)} /><span className="unit-addon">PF</span></div></label></div>
          </>
        ) : slug === "power-energy-time-calculator" ? (
          <>
            <div className="converter-tabs power-task-tabs energy-task-tabs" role="tablist" aria-label="Power energy and time calculation">
              {[
                { value: "energy", label: "Power × Time → Energy" },
                { value: "power", label: "Energy ÷ Time → Power" },
                { value: "time", label: "Energy ÷ Power → Time" }
              ].map((mode) => <button type="button" role="tab" aria-selected={String(values.solve) === mode.value} className={String(values.solve) === mode.value ? "active" : ""} onClick={() => update("solve", mode.value)} key={mode.value}>{mode.label}</button>)}
            </div>
            {String(values.solve) !== "power" ? <label className="field"><span>Power</span><div className="unit-input"><input type="number" inputMode="decimal" min="0" step="any" value={String(values.power)} onChange={(event) => update("power", event.target.value)} /><select aria-label="Power unit" value={String(values.powerUnit)} onChange={(event) => update("powerUnit", event.target.value)}><option value="w">W</option><option value="kw">kW</option><option value="mw">MW</option></select></div></label> : null}
            {String(values.solve) !== "energy" ? <label className="field"><span>Energy</span><div className="unit-input"><input type="number" inputMode="decimal" min="0" step="any" value={String(values.energy)} onChange={(event) => update("energy", event.target.value)} /><select aria-label="Energy unit" value={String(values.energyUnit)} onChange={(event) => update("energyUnit", event.target.value)}><option value="j">J</option><option value="kj">kJ</option><option value="mj">MJ</option><option value="wh">Wh</option><option value="kwh">kWh</option><option value="mwh">MWh</option></select></div></label> : null}
            {String(values.solve) !== "time" ? <label className="field"><span>Operating time</span><div className="unit-input"><input type="number" inputMode="decimal" min="0" step="any" value={String(values.time)} onChange={(event) => update("time", event.target.value)} /><select aria-label="Time unit" value={String(values.timeUnit)} onChange={(event) => update("timeUnit", event.target.value)}><option value="s">seconds</option><option value="min">minutes</option><option value="h">hours</option><option value="day">days</option></select></div></label> : null}
            <div className="energy-relationship-note"><strong>{String(values.solve) === "energy" ? "Energy = Power × Time" : String(values.solve) === "power" ? "Power = Energy ÷ Time" : "Time = Energy ÷ Power"}</strong><span>Choose the units beside each value. The result panel also shows the equivalent W, kW, J, Wh, kWh, seconds, hours, and days.</span></div>
          </>
        ) : slug === "mm2-to-awg-converter" ? (
          <>
            <div className="converter-tabs awg-mode-tabs" role="tablist" aria-label="Wire gauge conversion direction">
              <button type="button" role="tab" aria-selected={String(values.direction) === "mm2-to-awg"} className={String(values.direction) === "mm2-to-awg" ? "active" : ""} onClick={() => update("direction", "mm2-to-awg")}>mm² → AWG</button>
              <button type="button" role="tab" aria-selected={String(values.direction) === "awg-to-mm2"} className={String(values.direction) === "awg-to-mm2" ? "active" : ""} onClick={() => update("direction", "awg-to-mm2")}>AWG → mm²</button>
            </div>
            {String(values.direction) === "mm2-to-awg" ? <label className="field"><span>Conductor cross-sectional area</span><div className="unit-input"><input type="number" inputMode="decimal" min="0.001" step="0.01" value={String(values.metricArea)} onChange={(event) => update("metricArea", event.target.value)} /><span className="unit-addon">mm²</span></div></label> : <label className="field"><span>American Wire Gauge size</span><select value={String(values.awgSize)} onChange={(event) => update("awgSize", event.target.value)}>{tool.fields.find((field) => field.id === "awgSize")?.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>}
            <div className="awg-input-note"><strong>Bare conductor reference</strong><span>AWG describes conductor geometry. Finished cable outside diameter depends on stranding and insulation.</span></div>
          </>
        ) : slug === "cable-gland-size-calculator" ? (
          <>
            <div className="converter-tabs gland-mode-tabs" role="tablist" aria-label="Cable gland selection method">
              {[
                ["diameter", "Cable OD"], ["conductor", "By mm²"], ["metric", "Metric M"], ["pg", "PG"], ["npt", "NPT"], ["g", "G / BSPP"]
              ].map(([mode, label]) => <button type="button" role="tab" aria-selected={String(values.mode) === mode} className={String(values.mode) === mode ? "active" : ""} onClick={() => chooseGlandMode(mode)} key={mode}>{label}</button>)}
            </div>
            {String(values.mode) === "diameter" ? (
              <label className="field"><span>Measured cable outside diameter</span><div className="unit-input"><input type="number" inputMode="decimal" min="0" step="0.1" value={String(values.diameter)} onChange={(event) => update("diameter", event.target.value)} /><span className="unit-addon">mm</span></div><small className="gland-field-note">Measure over the finished outer sheath, not the conductor insulation.</small></label>
            ) : String(values.mode) === "conductor" ? <div className="gland-estimate-fields">
              <label className="field"><span>Conductor cross-sectional area</span><select value={String(values.conductorArea)} onChange={(event) => update("conductorArea", event.target.value)}>{tool.fields.find((field) => field.id === "conductorArea")?.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label className="field"><span>Number of cores</span><select value={String(values.cores)} onChange={(event) => update("cores", event.target.value)}>{tool.fields.find((field) => field.id === "cores")?.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label className="field gland-family-field"><span>Cable construction reference</span><select value={String(values.cableFamily)} onChange={(event) => { update("cableFamily", event.target.value); update("armored", event.target.value === "swa" ? "armored" : "unarmored"); }}>{tool.fields.find((field) => field.id === "cableFamily")?.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select><small className="gland-field-note">Uses published cable-family dimensions; verify the actual manufacturer's cable OD.</small></label>
            </div> : (
              <label className="field"><span>Existing enclosure entry thread</span><select value={String(values.threadSize)} onChange={(event) => update("threadSize", event.target.value)}>{glandThreadOptions[String(values.mode)]?.map((size) => <option value={size} key={size}>{size}</option>)}</select><small className="gland-field-note">Nominal thread labels are not physical hole diameters.</small></label>
            )}
            <div className="gland-context-grid">
              {String(values.mode) !== "conductor" ? <label className="field"><span>Cable construction</span><select value={String(values.armored)} onChange={(event) => update("armored", event.target.value)}><option value="unarmored">Unarmored</option><option value="armored">Armored</option></select></label> : null}
              <label className="field"><span>Installation environment</span><select value={String(values.environment)} onChange={(event) => update("environment", event.target.value)}><option value="indoor">Indoor panel</option><option value="industrial">Industrial</option><option value="outdoor">Outdoor / wet</option><option value="hazardous">Hazardous area</option></select></label>
            </div>
            <div className="gland-distinction"><strong>Two checks, one selection</strong><span>The sealing range must fit the cable OD. The entry thread must independently fit the enclosure opening.</span></div>
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
        ) : slug === "nema-ip-rating-converter" ? (
          <>
            <div className="converter-tabs nema-mode-tabs" role="tablist" aria-label="NEMA and IP tool mode">
              <button type="button" role="tab" aria-selected={String(values.mode) === "nema-to-ip"} className={String(values.mode) === "nema-to-ip" ? "active" : ""} onClick={() => update("mode", "nema-to-ip")}>NEMA to IP</button>
              <button type="button" role="tab" aria-selected={String(values.mode) === "ip-to-nema"} className={String(values.mode) === "ip-to-nema" ? "active" : ""} onClick={() => update("mode", "ip-to-nema")}>IP to NEMA</button>
              <button type="button" role="tab" aria-selected={String(values.mode) === "industrial"} className={String(values.mode) === "industrial" ? "active" : ""} onClick={() => update("mode", "industrial")}>Industrial sizing</button>
            </div>
            {String(values.mode) === "nema-to-ip" ? <div className="nema-simple-mode">
              <label className="field"><span>Select NEMA enclosure Type</span><select value={String(values.nemaType)} onChange={(event) => update("nemaType", event.target.value)}>{tool.fields.find((field) => field.id === "nemaType")?.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <div className="rating-visual"><span className="rating-chip">NEMA {String(values.nemaType).toUpperCase()}</span><span className="rating-arrow">meets or exceeds</span><span className="rating-chip ip">{({ "1":"IP20", "2":"IP22", "3":"IP55", "3r":"IP24", "3s":"IP55", "3x":"IP55", "3rx":"IP24", "3sx":"IP55", "4":"IP66", "4x":"IP66", "5":"IP53", "6":"IP67", "6p":"IP68", "12":"IP54", "12k":"IP54", "13":"IP54" } as Record<string,string>)[String(values.nemaType)]}</span></div>
              <p className="nema-inline-note">One-way ingress cross-reference. The IP rating does not convert back into this NEMA Type.</p>
            </div> : null}
            {String(values.mode) === "ip-to-nema" ? <div className="nema-simple-mode">
              <div className="ip-builder"><span>IP</span><select aria-label="IP solids digit" value={String(values.solidDigit)} onChange={(event) => update("solidDigit", event.target.value)}>{[0,1,2,3,4,5,6].map((digit) => <option key={digit} value={digit}>{digit}</option>)}</select><select aria-label="IP water digit" value={String(values.waterDigit)} onChange={(event) => update("waterDigit", event.target.value)}>{[0,1,2,3,4,5,6,7,8,9].map((digit) => <option key={digit} value={digit}>{digit}</option>)}</select></div>
              <div className="ip-reverse-warning"><strong>Common ingress reference only</strong><span>The result shows NEMA Types whose published ingress cross-reference matches or exceeds the selected IP digits. It does not establish an equivalent NEMA rating or certification.</span></div>
            </div> : null}
            {String(values.mode) === "industrial" ? <div className="industrial-sizing-engine">
              <div className="engine-heading"><strong>Industrial environment</strong><span>Complete each exposure group</span></div>
              <div className="nema-condition-grid">
                <label className="field"><span>Location</span><select value={String(values.location)} onChange={(event) => update("location", event.target.value)}><option value="indoor">Indoor</option><option value="sheltered">Sheltered outdoor</option><option value="outdoor">Full outdoor</option><option value="coastal">Coastal / marine</option></select></label>
                <label className="field"><span>Water</span><select value={String(values.waterExposure)} onChange={(event) => update("waterExposure", event.target.value)}><option value="none">Dry</option><option value="drip">Drip / condensation</option><option value="rain">Rain / splash</option><option value="hose">Hose washdown</option><option value="high-pressure">High-pressure wash</option><option value="temporary">Temporary immersion</option><option value="prolonged">Prolonged immersion</option></select></label>
                <label className="field"><span>Dust</span><select value={String(values.dust)} onChange={(event) => update("dust", event.target.value)}><option value="low">Low / clean</option><option value="settling">Settling dust / lint</option><option value="heavy">Circulating / windblown</option><option value="conductive">Conductive dust</option></select></label>
                <label className="field"><span>Corrosion</span><select value={String(values.corrosion)} onChange={(event) => update("corrosion", event.target.value)}><option value="no">No special requirement</option><option value="yes">Chemical / salt exposure</option></select></label>
                <label className="field"><span>Oil / coolant</span><select value={String(values.oilCoolant)} onChange={(event) => update("oilCoolant", event.target.value)}><option value="no">None</option><option value="drip">Dripping</option><option value="spray">Spraying</option></select></label>
                <label className="field"><span>External ice</span><select value={String(values.iceOperation)} onChange={(event) => update("iceOperation", event.target.value)}><option value="none">None</option><option value="formation">Formation considered</option><option value="operable">Mechanisms operate ice-laden</option></select></label>
                <label className="field"><span>Condensation</span><select value={String(values.condensation)} onChange={(event) => update("condensation", event.target.value)}><option value="no">Low risk</option><option value="yes">Control required</option></select></label>
                <label className="field"><span>Hazardous location</span><select value={String(values.hazardous)} onChange={(event) => update("hazardous", event.target.value)}><option value="no">No</option><option value="yes">Yes – separate certification</option></select></label>
              </div>
            </div> : null}
          </>
        ) : slug === "power-factor-correction-calculator" ? (
          <>
            <div className="converter-tabs pf-mode-tabs" role="tablist" aria-label="Power factor mode">
              <button type="button" role="tab" aria-selected={String(values.mode) === "analysis"} className={String(values.mode) === "analysis" ? "active" : ""} onClick={() => update("mode", "analysis")}>Analyze power factor</button>
              <button type="button" role="tab" aria-selected={String(values.mode) !== "analysis"} className={String(values.mode) !== "analysis" ? "active" : ""} onClick={() => update("mode", "correction")}>Size correction bank</button>
            </div>
            <div className="vfd-basic-grid">
              <label className="field"><span>System</span><select value={String(values.phase)} onChange={(event) => update("phase", event.target.value)}><option value="single">Single-phase AC</option><option value="three">Three-phase AC</option></select></label>
              <label className="field"><span>{String(values.phase) === "three" ? "Line-to-line voltage" : "System voltage"}</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.voltage)} onChange={(event) => update("voltage", event.target.value)} /><span className="unit-addon">V</span></div></label>
            </div>
            {String(values.mode) === "analysis" ? (
              <>
                <label className="field"><span>Known values</span><select value={String(values.analysisBasis)} onChange={(event) => update("analysisBasis", event.target.value)}><option value="ps">Active power + apparent power</option><option value="pq">Active power + reactive power</option><option value="sq">Apparent power + reactive power</option><option value="p-pf">Active power + power factor</option><option value="meter">Voltage + current + active power</option></select></label>
                <div className="pf-analysis-grid">
                  {String(values.analysisBasis) !== "sq" ? <label className="field"><span>Active power (P)</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.power)} onChange={(event) => update("power", event.target.value)} /><span className="unit-addon">kW</span></div></label> : null}
                  {["pq", "sq"].includes(String(values.analysisBasis)) ? <label className="field"><span>Reactive power (Q)</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.reactivePower)} onChange={(event) => update("reactivePower", event.target.value)} /><span className="unit-addon">kvar</span></div></label> : null}
                  {["ps", "sq"].includes(String(values.analysisBasis)) ? <label className="field"><span>Apparent power (S)</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.apparentPower)} onChange={(event) => update("apparentPower", event.target.value)} /><span className="unit-addon">kVA</span></div></label> : null}
                  {String(values.analysisBasis) === "p-pf" ? <label className="field"><span>Power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.initialPf)} onChange={(event) => update("initialPf", event.target.value)} /><span className="unit-addon">PF</span></div></label> : null}
                  {String(values.analysisBasis) === "meter" ? <label className="field"><span>Measured line current</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.current)} onChange={(event) => update("current", event.target.value)} /><span className="unit-addon">A</span></div></label> : null}
                </div>
              </>
            ) : (
              <>
                <label className="field"><span>Active power</span><div className="unit-input"><input type="number" min="0" step="any" value={String(values.power)} onChange={(event) => update("power", event.target.value)} /><span className="unit-addon">kW</span></div></label>
                <div className="pf-analysis-grid"><label className="field"><span>Existing power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.initialPf)} onChange={(event) => update("initialPf", event.target.value)} /><span className="unit-addon">PF</span></div></label><label className="field"><span>Target power factor</span><div className="unit-input"><input type="number" min="0.01" max="1" step="0.01" value={String(values.targetPf)} onChange={(event) => update("targetPf", event.target.value)} /><span className="unit-addon">PF</span></div></label></div>
                <div className="pf-analysis-grid"><label className="field"><span>Frequency</span><select value={String(values.frequency)} onChange={(event) => update("frequency", event.target.value)}><option value="50">50 Hz</option><option value="60">60 Hz</option></select></label><label className="field"><span>Power-electronic loads</span><select value={String(values.harmonics)} onChange={(event) => update("harmonics", event.target.value)}><option value="low">Low / mainly linear loads</option><option value="moderate">Moderate VFD / UPS / rectifier load</option><option value="high">High harmonic loading</option></select></label></div>
              </>
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
                    aria-label={`${field.label} ${tr("unit")}`}
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
        <div className="panel-label">{tr("Result")}</div>
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
            {slug === "mm2-to-awg-converter" ? <p className="ampacity-disclaimer">Current figures use common circular-mil rules of thumb for comparison only. They are not code ampacities or cable ratings; verify the applicable wiring standard, insulation, terminals, ambient temperature and installation method.</p> : null}
            <div className="recommendations">
              <div className="panel-label">{tr("Next checks")}</div>
              <ul>
                {result.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="result-actions">
              <button type="button" onClick={copyResult}>{copied ? tr("Copied") : tr("Copy result")}</button>
              <button type="button" onClick={downloadResultPdf}>{tr("Download PDF")}</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
