import { describe, expect, it } from "vitest";
import { calculateTool } from "./calculate";
import { toolsBySlug } from "./tools";

function defaults(slug: string) {
  return Object.fromEntries(toolsBySlug[slug].fields.map((field) => [field.id, field.defaultValue ?? ""]));
}

function metric(slug: string, label: string, overrides: Record<string, string | number> = {}) {
  const result = calculateTool(slug, { ...defaults(slug), ...overrides });
  return result.metrics.find((item) => item.label === label)?.value;
}

describe("20-calculator expansion reference cases", () => {
  it("solves Ohm's law from voltage and current", () => {
    expect(metric("ohms-law-calculator", "Resistance", { solveFrom: "vi", voltage: 12, current: 2, resistance: 1, power: 1 })).toBe("6.000 Ω");
    expect(metric("ohms-law-calculator", "Power", { solveFrom: "vi", voltage: 12, current: 2, resistance: 1, power: 1 })).toBe("24.00 W");
  });

  it.each([
    ["vr", { voltage: 12, resistance: 6 }, "2.000 A · 24.00 W"],
    ["vp", { voltage: 12, power: 24 }, "2.000 A · 6.000 Ω"],
    ["ir", { current: 2, resistance: 6 }, "12.00 V · 24.00 W"],
    ["ip", { current: 2, power: 24 }, "12.00 V · 6.000 Ω"],
    ["rp", { resistance: 6, power: 24 }, "12.00 V · 2.000 A"]
  ])("solves the %s Ohm's law input pair", (solveFrom, overrides, expected) => {
    const result = calculateTool("ohms-law-calculator", { ...defaults("ohms-law-calculator"), solveFrom, ...overrides });
    expect(result.primary).toBe(expected);
  });

  it("requires exactly two selected Ohm's law quantities", () => {
    expect(() => calculateTool("ohms-law-calculator", { ...defaults("ohms-law-calculator"), solveFrom: "v" })).toThrow("Select two known quantities");
    expect(() => calculateTool("ohms-law-calculator", { ...defaults("ohms-law-calculator"), solveFrom: "" })).toThrow("Select two known quantities");
  });

  it("converts 3000 W at 230 V to single-phase current", () => {
    expect(calculateTool("watts-amps-volts-calculator", defaults("watts-amps-volts-calculator")).primary).toBe("13.04 A");
  });

  it.each([
    ["pv", { power: 3000, voltage: 230 }, "13.04 A"],
    ["iv", { current: 13, voltage: 230 }, "2990 W"],
    ["pi", { power: 3000, current: 13 }, "230.8 V"]
  ])("solves the %s watts-amps-volts pair", (knownQuantities, overrides, expected) => {
    const result = calculateTool("watts-amps-volts-calculator", { ...defaults("watts-amps-volts-calculator"), knownQuantities, ...overrides });
    expect(result.primary).toBe(expected);
  });

  it("calculates EV charging wall energy, time, and cost", () => {
    const result = calculateTool("ev-charging-time-cost-calculator", defaults("ev-charging-time-cost-calculator"));
    expect(result.primary).toBe("4.545 h");
    expect(metric("ev-charging-time-cost-calculator", "Wall energy")).toBe("50.00 kWh");
    expect(metric("ev-charging-time-cost-calculator", "Estimated cost")).toBe("10.00");
  });

  it("calculates Ah battery charging time with efficiency", () => {
    expect(calculateTool("battery-charging-time-calculator", defaults("battery-charging-time-calculator")).primary).toBe("4.706 h");
  });

  it("adds four series resistors", () => {
    expect(calculateTool("resistor-series-parallel-calculator", defaults("resistor-series-parallel-calculator")).primary).toBe("1120 Ω");
  });

  it("converts one kilowatt to mechanical horsepower", () => {
    expect(calculateTool("electrical-unit-converter", defaults("electrical-unit-converter")).primary).toBe("1.341 hp");
  });

  it("selects the next contactor current class", () => {
    expect(calculateTool("contactor-selection-calculator", defaults("contactor-selection-calculator")).primary).toBe("32 A AC-3");
  });

  it("keeps breaking capacity separate from generic magnetic-band screening", () => {
    const result = calculateTool("breaker-selectivity-calculator", defaults("breaker-selectivity-calculator"));
    expect(result.primary).toBe("Promising screening");
    expect(metric("breaker-selectivity-calculator", "Breaking-capacity check")).toBe("Passes entered fault current");
  });

  it("calculates the IEC-style equivalent lightning collection area", () => {
    expect(metric("lightning-risk-assessment-calculator", "Equivalent collection area")).toBe("6427 m²");
  });

  it("calculates enclosure temperature from heat and effective area", () => {
    expect(metric("enclosure-temperature-rise-calculator", "Internal heat")).toBe("250.0 W");
    expect(calculateTool("enclosure-temperature-rise-calculator", defaults("enclosure-temperature-rise-calculator")).primary).toMatch(/°C$/);
  });

  it("sums panel component losses with diversity", () => {
    expect(calculateTool("panel-heat-loss-calculator", defaults("panel-heat-loss-calculator")).primary).toBe("280.0 W");
  });

  it("limits PV strings by cold Voc and hot Vmpp", () => {
    const result = calculateTool("pv-string-sizing-calculator", defaults("pv-string-sizing-calculator"));
    expect(result.primary).toBe("6-20 modules");
    expect(metric("pv-string-sizing-calculator", "Cold module Voc")).toBe("54.35 V");
  });

  it("sizes off-grid PV, battery, and inverter independently", () => {
    const result = calculateTool("off-grid-solar-system-calculator", defaults("off-grid-solar-system-calculator"));
    expect(result.primary).toBe("2.963 kWp PV");
    expect(metric("off-grid-solar-system-calculator", "Nominal battery")).toBe("27.78 kWh");
    expect(metric("off-grid-solar-system-calculator", "Inverter starting size")).toBe("6.250 kW");
  });

  it("does not exceed the SPD datasheet maximum backup rating", () => {
    expect(calculateTool("spd-backup-fuse-calculator", defaults("spd-backup-fuse-calculator")).primary).toBe("125 A gG fuse");
  });

  it("checks actual Zs against the governing maximum", () => {
    const result = calculateTool("earth-fault-loop-impedance-calculator", defaults("earth-fault-loop-impedance-calculator"));
    expect(result.primary).toBe("Fail");
    expect(metric("earth-fault-loop-impedance-calculator", "Calculated Zs")).toBe("1.070 Ω");
  });

  it("multiplies independent cable correction factors", () => {
    const result = calculateTool("cable-derating-factor-calculator", defaults("cable-derating-factor-calculator"));
    expect(Number.parseFloat(result.primary)).toBeCloseTo(63.9, 0);
  });

  it("calculates category demand before overall simultaneity", () => {
    expect(calculateTool("maximum-demand-calculator", defaults("maximum-demand-calculator")).primary).toBe("93.38 kW");
  });

  it("uses amperes in the protective-conductor adiabatic equation", () => {
    const result = calculateTool("protective-conductor-size-calculator", defaults("protective-conductor-size-calculator"));
    expect(result.primary).toBe("Pass");
    expect(metric("protective-conductor-size-calculator", "Required area")).toBe("19.44 mm²");
  });

  it("checks cable thermal withstand with I squared t", () => {
    const result = calculateTool("cable-short-circuit-thermal-calculator", defaults("cable-short-circuit-thermal-calculator"));
    expect(result.primary).toBe("Pass");
    expect(metric("cable-short-circuit-thermal-calculator", "Required area")).toBe("38.89 mm²");
  });

  it("applies the selected motor-starting current reduction", () => {
    const dol = Number.parseFloat(metric("motor-starting-voltage-drop-calculator", "Starting current") ?? "0");
    const star = Number.parseFloat(metric("motor-starting-voltage-drop-calculator", "Starting current", { method: "star-delta" }) ?? "0");
    expect(star).toBeCloseTo(dol / 3, 0);
  });

  it("sizes a VFD from output current and exposes VIOX panel coordination checks", () => {
    const result = calculateTool("vfd-sizing-protection-calculator", defaults("vfd-sizing-protection-calculator"));
    expect(result.primary).toBe("≥ 68.97 A output");
    expect(metric("vfd-sizing-protection-calculator", "Input protection reference")).toMatch(/A; exact VFD manual governs/);
    expect(metric("vfd-sizing-protection-calculator", "Estimated VFD panel heat")).toMatch(/W$/);
  });

  it("exposes both IEEE 1584 arcing-current scenarios without assigning PPE", () => {
    const result = calculateTool("arc-flash-incident-energy-calculator", defaults("arc-flash-incident-energy-calculator"));
    expect(result.primary).toMatch(/cal\/cm²$/);
    expect(metric("arc-flash-incident-energy-calculator", "Reduced arcing current")).toMatch(/kA$/);
    expect(metric("arc-flash-incident-energy-calculator", "Worst-case boundary")).toMatch(/mm$/);
    expect(result.summary).toContain("not a PPE category");
  });
});
