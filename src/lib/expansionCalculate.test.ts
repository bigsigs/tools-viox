import { describe, expect, it } from "vitest";
import { calculateTool } from "./calculate";
import { toolsBySlug } from "./tools";
import { localizeClientResult } from "./i18n-client";

function defaults(slug: string) {
  return Object.fromEntries(toolsBySlug[slug].fields.map((field) => [field.id, field.defaultValue ?? ""]));
}

function metric(slug: string, label: string, overrides: Record<string, string | number> = {}) {
  const result = calculateTool(slug, { ...defaults(slug), ...overrides });
  return result.metrics.find((item) => item.label === label)?.value;
}

describe("20-calculator expansion reference cases", () => {
  it("calculates the balanced three-phase power triangle from voltage current and PF", () => {
    const result = calculateTool("three-phase-power-calculator", { ...defaults("three-phase-power-calculator"), mode: "measured", voltage: 400, current: 100, powerFactor: 0.9, loadType: "inductive", targetPf: 0.95 });
    expect(result.primary).toBe("62.35 kW");
    expect(result.metrics.find((item) => item.label === "Apparent power S")?.value).toBe("69.28 kVA");
    expect(result.metrics.find((item) => item.label === "Reactive power Q")?.value).toBe("30.20 kvar");
  });

  it("reverses three-phase kW and kVA into line current", () => {
    const fromKw = calculateTool("three-phase-power-calculator", { ...defaults("three-phase-power-calculator"), mode: "kw-current", voltage: 400, activePower: 62.3538, powerFactor: 0.9 });
    const fromKva = calculateTool("three-phase-power-calculator", { ...defaults("three-phase-power-calculator"), mode: "kva-current", voltage: 400, apparentPower: 69.282, powerFactor: 0.9 });
    expect(fromKw.metrics.find((item) => item.label === "Line current")?.value).toBe("100.00 A");
    expect(fromKva.metrics.find((item) => item.label === "Line current")?.value).toBe("100.00 A");
  });

  it("marks capacitive reactive power as leading and negative", () => {
    const result = calculateTool("three-phase-power-calculator", { ...defaults("three-phase-power-calculator"), mode: "measured", voltage: 400, current: 100, powerFactor: 0.9, loadType: "capacitive" });
    expect(result.metrics.find((item) => item.label === "Reactive power Q")?.value).toBe("-30.20 kvar");
    expect(result.metrics.find((item) => item.label === "Power factor")?.value).toContain("leading");
  });
  it("converts a 16-series 100 Ah battery into nominal and usable energy", () => {
    const result = calculateTool("battery-capacity-converter", {
      ...defaults("battery-capacity-converter"), mode: "capacity-to-energy", capacity: 100,
      capacityUnit: "ah", voltage: 3.2, series: 16, parallel: 1, dod: 80, efficiency: 90
    });
    expect(result.primary).toBe("5.120 kWh");
    expect(result.metrics.find((item) => item.label === "Pack voltage")?.value).toBe("51.20 V");
    expect(result.metrics.find((item) => item.label === "Estimated delivered energy")?.value).toBe("3.686 kWh");
  });

  it("converts battery kWh back to Ah at pack voltage", () => {
    const result = calculateTool("battery-capacity-converter", {
      ...defaults("battery-capacity-converter"), mode: "energy-to-capacity", energy: 5,
      energyUnit: "kwh", packVoltage: 48
    });
    expect(result.primary).toBe("104.2 Ah");
    expect(result.metrics.find((item) => item.label === "Nominal energy (kWh)")?.value).toBe("5.000 kWh");
  });

  it.each([
    ["energy", { power: 2, powerUnit: "kw", time: 5, timeUnit: "h", energyUnit: "kwh" }, "10.00 kWh"],
    ["power", { energy: 10, energyUnit: "kwh", time: 5, timeUnit: "h", powerUnit: "kw" }, "2.000 kW"],
    ["time", { energy: 10, energyUnit: "kwh", power: 2, powerUnit: "kw", timeUnit: "h" }, "5.000 h"]
  ])("solves %s in the power-energy-time relationship", (solve, overrides, expected) => {
    expect(calculateTool("power-energy-time-calculator", { ...defaults("power-energy-time-calculator"), solve, ...overrides }).primary).toBe(expected);
  });
  it("calculates an ideal voltage divider and resistor power", () => {
    const result = calculateTool("voltage-divider-calculator", { ...defaults("voltage-divider-calculator"), vin: 24, r1: 10, r2: 10, mode: "output" });
    expect(result.primary).toBe("12.00 V");
    expect(result.metrics.find((item) => item.label === "Divider source current")?.value).toBe("1.200 mA");
    expect(result.metrics.find((item) => item.label === "R1 power")?.value).toBe("14.40 mW");
  });

  it("solves R2 for a target divider voltage", () => {
    const result = calculateTool("voltage-divider-calculator", { ...defaults("voltage-divider-calculator"), mode: "resistor", vin: 24, target: 5, solve: "r2", r1: 10 });
    expect(result.metrics.find((item) => item.label === "Calculated R2")?.value).toBe("2.632 kΩ");
    expect(result.primary).toBe("5.000 V");
  });

  it("accounts for load resistance in parallel with R2", () => {
    const result = calculateTool("voltage-divider-calculator", { ...defaults("voltage-divider-calculator"), mode: "loaded", vin: 24, r1: 10, r2: 10, load: 10 });
    expect(result.primary).toBe("8.000 V");
    expect(result.metrics.find((item) => item.label === "Effective lower resistance")?.value).toBe("5.000 kΩ");
    expect(result.metrics.find((item) => item.label === "Loading error")?.value).toBe("-33.33%");
  });
  it("matches the published 800 V, PD2, Group IIIa, 5000 m insulation example", () => {
    const result = calculateTool("clearance-creepage-calculator", {
      ...defaults("clearance-creepage-calculator"), systemVoltage: 230, workingVoltage: 800,
      ovc: "ii", pollution: "2", material: "iiia", insulation: "basic", altitude: 5000, margin: 0
    });
    expect(result.primary).toBe("8.000 mm creepage");
    expect(result.metrics.find((item) => item.label === "Minimum clearance before margin")?.value).toBe("2.220 mm");
    expect(result.metrics.find((item) => item.label === "Rated impulse voltage")?.value).toBe("2.500 kV");
  });

  it("uses the next impulse step and twice creepage for reinforced insulation", () => {
    const result = calculateTool("clearance-creepage-calculator", {
      ...defaults("clearance-creepage-calculator"), systemVoltage: 230, workingVoltage: 400,
      ovc: "ii", pollution: "2", material: "ii", insulation: "reinforced", altitude: 2000, margin: 0
    });
    expect(result.primary).toBe("5.600 mm creepage");
    expect(result.metrics.find((item) => item.label === "Clearance impulse step used")?.value).toBe("4.000 kV");
    expect(result.metrics.find((item) => item.label === "Minimum clearance before margin")?.value).toBe("3.000 mm");
  });
  it("looks up external uncoated PCB spacing and applies margin", () => {
    const result = calculateTool("pcb-conductor-spacing-calculator", {
      ...defaults("pcb-conductor-spacing-calculator"), mode: "spacing", voltage: 400,
      voltageUnit: "V", voltageBasis: "dc-peak", environment: "b2", margin: 20
    });
    expect(result.primary).toBe("3.000 mm");
    expect(result.metrics.find((item) => item.label === "Legacy table spacing")?.value).toBe("2.500 mm");
    expect(result.metrics.find((item) => item.label === "Spacing with margin (mil)")?.value).toBe("118.1 mil");
  });

  it("uses the per-volt PCB spacing increment above 500 V", () => {
    const result = calculateTool("pcb-conductor-spacing-calculator", {
      ...defaults("pcb-conductor-spacing-calculator"), mode: "spacing", voltage: 600,
      voltageUnit: "V", voltageBasis: "dc-peak", environment: "b1", margin: 0
    });
    expect(result.primary).toBe("0.500 mm");
    expect(result.metrics.find((item) => item.label === "Legacy table spacing")?.value).toBe("0.500 mm");
  });

  it("converts RMS voltage to peak before PCB spacing lookup", () => {
    const result = calculateTool("pcb-conductor-spacing-calculator", {
      ...defaults("pcb-conductor-spacing-calculator"), mode: "spacing", voltage: 230,
      voltageUnit: "V", voltageBasis: "ac-rms", environment: "b2", margin: 0
    });
    expect(result.metrics.find((item) => item.label === "Lookup voltage")?.value).toBe("325.3 V DC / AC peak");
    expect(result.primary).toBe("2.500 mm");
  });

  it("reverses available PCB spacing into a voltage reference", () => {
    const result = calculateTool("pcb-conductor-spacing-calculator", {
      ...defaults("pcb-conductor-spacing-calculator"), mode: "voltage", spacing: 2.5,
      spacingUnit: "mm", environment: "b2", margin: 0
    });
    expect(result.primary).toBe("500.0 V DC / AC peak");
    expect(result.metrics.find((item) => item.label === "Approximate equivalent AC RMS")?.value).toBe("353.6 V");
  });
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

  it("converts energy in both directions", () => {
    expect(calculateTool("electrical-unit-converter", { ...defaults("electrical-unit-converter"), quantity: "energy", fromUnit: "kwh", toUnit: "mj", leftValue: 1, inputSide: "left" }).primary).toBe("3.600 MJ");
    expect(calculateTool("electrical-unit-converter", { ...defaults("electrical-unit-converter"), quantity: "energy", fromUnit: "kwh", toUnit: "mj", rightValue: 7.2, inputSide: "right" }).primary).toBe("2.000 kWh");
  });

  it("calculates three-phase current in its own mode", () => {
    expect(calculateTool("electrical-unit-converter", { ...defaults("electrical-unit-converter"), quantity: "current", phasePower: 10, phasePowerUnit: "kw", phase: "three", voltage: 400, powerFactor: 0.9 }).primary).toBe("16.04 A");
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

  it("calculates passive enclosure temperature from heat and exposed area", () => {
    const result = calculateTool("enclosure-temperature-rise-calculator", defaults("enclosure-temperature-rise-calculator"));
    expect(result.primary).toBe("56.04 °C");
    expect(metric("enclosure-temperature-rise-calculator", "Internal component heat")).toBe("250.0 W");
    expect(metric("enclosure-temperature-rise-calculator", "Effective exposed area")).toBe("2.160 m²");
  });

  it("calculates required delivered enclosure airflow with wall heat rejection", () => {
    const result = calculateTool("enclosure-temperature-rise-calculator", { ...defaults("enclosure-temperature-rise-calculator"), mode: "airflow" });
    expect(result.primary).toBe("45.72 m³/h");
    expect(result.metrics.find((item) => item.label === "Required delivered airflow (imperial)")?.value).toBe("26.91 CFM");
    expect(result.metrics.find((item) => item.label === "Wall heat at target")?.value).toBe("-118.8 W");
  });

  it("requires active cooling when enclosure target is below ambient", () => {
    const result = calculateTool("enclosure-temperature-rise-calculator", { ...defaults("enclosure-temperature-rise-calculator"), mode: "airflow", ambient: 50, target: 45 });
    expect(result.primary).toBe("Active cooling required");
    expect(result.metrics.find((item) => item.label === "Required active cooling")?.value).toBe("355.8 W (1214 BTU/h)");
    expect(result.metrics.find((item) => item.label === "Required airflow")?.value).toBe("Not physically applicable");
  });

  it("localizes enclosure cooling results for the Spanish page", () => {
    const source = calculateTool("enclosure-temperature-rise-calculator", { ...defaults("enclosure-temperature-rise-calculator"), mode: "airflow" });
    const translated = localizeClientResult(source, "es");
    expect(translated.summary).toContain("El caudal suministrado necesario");
    expect(translated.metrics.find((item) => item.label === "Caudal suministrado necesario")?.value).toBe("45.72 m³/h");
    expect(translated.recommendations).toContain("Seleccione el ventilador a partir de su curva presión-caudal considerando las pérdidas de filtros, rejillas, conductos y contaminación.");
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

  it("applies service-factor loading only when enabled and changes regional guidance only", () => {
    const base = defaults("vfd-sizing-protection-calculator");
    const withService = calculateTool("vfd-sizing-protection-calculator", { ...base, includeServiceFactor: "yes", serviceFactor: 1.15, region: "north-america" });
    expect(withService.primary).toBe("≥ 79.32 A output");
    expect(withService.metrics.find((item) => item.label === "Regional checklist")?.value).toContain("UL 61800-5-1");
    const regionOnly = calculateTool("vfd-sizing-protection-calculator", { ...base, region: "china" });
    expect(regionOnly.primary).toBe("≥ 68.97 A output");
  });

  it("exposes both IEEE 1584 arcing-current scenarios without assigning PPE", () => {
    const result = calculateTool("arc-flash-incident-energy-calculator", defaults("arc-flash-incident-energy-calculator"));
    expect(result.primary).toMatch(/cal\/cm²$/);
    expect(metric("arc-flash-incident-energy-calculator", "Reduced arcing current")).toMatch(/kA$/);
    expect(metric("arc-flash-incident-energy-calculator", "Worst-case boundary")).toMatch(/mm$/);
    expect(result.summary).toContain("not a PPE category");
  });

  it("sizes lighting fixtures with utilization and maintenance factors", () => {
    const result = calculateTool("lighting-calculator", defaults("lighting-calculator"));
    expect(result.primary).toBe("18 fixtures");
    expect(metric("lighting-calculator", "Required fixture lumens")).toBe("71429 lm");
    expect(metric("lighting-calculator", "Estimated maintained illuminance")).toBe("504.0 lx");
    expect(metric("lighting-calculator", "Connected lighting load")).toBe("648.0 W");
  });

  it("supports direct area and custom illuminance", () => {
    const result = calculateTool("lighting-calculator", { ...defaults("lighting-calculator"), application: "custom", customLux: 300, areaMode: "area", area: 50 });
    expect(result.primary).toBe("7 fixtures");
    expect(metric("lighting-calculator", "Illuminated area", { application: "custom", customLux: 300, areaMode: "area", area: 50 })).toBe("50.00 m²");
  });

  it("calculates cable tray area fill with future reserve", () => {
    const result = calculateTool("cable-tray-fill-calculator", defaults("cable-tray-fill-calculator"));
    expect(result.primary).toBe("Pass");
    expect(metric("cable-tray-fill-calculator", "Total cable area")).toBe("7012 mm²");
    expect(metric("cable-tray-fill-calculator", "Design capacity after reserve")).toBe("7200 mm²");
    expect(metric("cable-tray-fill-calculator", "Cable load")).toBe("10.80 kg/m");
  });

  it("checks single-layer cable diameter against usable tray width", () => {
    const result = calculateTool("cable-tray-fill-calculator", { ...defaults("cable-tray-fill-calculator"), method: "single-layer", trayWidth: 400 });
    expect(result.primary).toBe("Pass");
    expect(metric("cable-tray-fill-calculator", "Required single-layer width", { method: "single-layer", trayWidth: 400 })).toBe("336.0 mm");
  });

  it("rejects fractional cable quantities in cable trays", () => {
    expect(() => calculateTool("cable-tray-fill-calculator", { ...defaults("cable-tray-fill-calculator"), qty1: 2.5 })).toThrow("whole number");
  });

  it("screens a stationary battery duty cycle and charger current", () => {
    const result = calculateTool("stationary-battery-sizing-calculator", defaults("stationary-battery-sizing-calculator"));
    expect(result.primary).toBe("269.0 Ah required");
    expect(metric("stationary-battery-sizing-calculator", "Series cells or blocks")).toBe("55");
    expect(metric("stationary-battery-sizing-calculator", "Parallel strings")).toBe("2");
    expect(metric("stationary-battery-sizing-calculator", "Peak DC load")).toBe("115.0 A");
    expect(metric("stationary-battery-sizing-calculator", "Preliminary charger current")).toBe("41.90 A");
  });

  it("supports preliminary constant-load battery sizing", () => {
    const result = calculateTool("stationary-battery-sizing-calculator", { ...defaults("stationary-battery-sizing-calculator"), mode: "basic" });
    expect(result.primary).toBe("143.3 Ah required");
    expect(metric("stationary-battery-sizing-calculator", "Peak DC load", { mode: "basic" })).toBe("17.05 A");
  });

  it("screens NEC optional-method residential demand with EVSE", () => {
    const result = calculateTool("residential-electrical-load-calculator", defaults("residential-electrical-load-calculator"));
    expect(result.primary).toBe("155.8 A demand");
    expect(metric("residential-electrical-load-calculator", "Demand after margin")).toBe("37.40 kVA");
    expect(metric("residential-electrical-load-calculator", "EVSE contribution")).toBe("9.600 kVA");
    expect(metric("residential-electrical-load-calculator", "Next listed service reference")).toBe("175 A");
  });

  it("supports user-factor general residential planning", () => {
    const result = calculateTool("residential-electrical-load-calculator", { ...defaults("residential-electrical-load-calculator"), method: "planning", voltage: 230 });
    expect(result.primary).toBe("157.8 A demand");
    expect(result.summary).toContain("user-entered planning assumptions");
  });

  it("enforces whole minimum residential branch-circuit counts", () => {
    expect(() => calculateTool("residential-electrical-load-calculator", { ...defaults("residential-electrical-load-calculator"), smallApplianceCircuits: 1 })).toThrow("at least 2");
    expect(() => calculateTool("residential-electrical-load-calculator", { ...defaults("residential-electrical-load-calculator"), laundryCircuits: 1.5 })).toThrow("whole number");
  });

  it("selects Type 4X for corrosive outdoor hose washdown", () => {
    const result = calculateTool("nema-ip-rating-converter", { ...defaults("nema-ip-rating-converter"), mode: "industrial" });
    expect(result.primary).toBe("NEMA Type 4X");
    expect(metric("nema-ip-rating-converter", "Ingress cross-reference", { mode: "industrial" })).toBe("IP66");
    expect(metric("nema-ip-rating-converter", "Corrosion requirement", { mode: "industrial" })).toBe("Required");
  });

  it("keeps Type 3R separate from the Type 3 dust cross-reference", () => {
    const result = calculateTool("nema-ip-rating-converter", { ...defaults("nema-ip-rating-converter"), mode: "nema-to-ip", nemaType: "3r" });
    expect(result.primary).toBe("Type 3R → IP24");
    expect(result.summary).toContain("not an equivalent certification");
  });

  it("shows the common NEMA ingress reference for IP68 without claiming equivalence", () => {
    const result = calculateTool("nema-ip-rating-converter", { ...defaults("nema-ip-rating-converter"), mode: "ip-to-nema", solidDigit: "6", waterDigit: "8" });
    expect(result.primary).toBe("NEMA 6P");
    expect(metric("nema-ip-rating-converter", "Common NEMA ingress reference", { mode: "ip-to-nema", solidDigit: "6", waterDigit: "8" })).toBe("NEMA 6P");
    expect(metric("nema-ip-rating-converter", "Equivalent NEMA Type", { mode: "ip-to-nema", solidDigit: "6", waterDigit: "8" })).toBe("Not established");
    expect(result.summary).toContain("not an equivalent conversion");
    expect(result.recommendations[0]).toContain("depth");
  });

  it("shows both common IP66 ingress references without choosing corrosion duty", () => {
    const result = calculateTool("nema-ip-rating-converter", { ...defaults("nema-ip-rating-converter"), mode: "ip-to-nema", solidDigit: "6", waterDigit: "6" });
    expect(result.primary).toBe("NEMA 4 / NEMA 4X");
    expect(result.summary).toContain("not an equivalent conversion");
  });

  it("calculates 630 kVA transformer fault current on a three-phase basis", () => {
    expect(Number.parseFloat(metric("transformer-impedance-calculator", "Full-load current")!)).toBeCloseTo(909.3, 0);
    expect(Number.parseFloat(calculateTool("transformer-impedance-calculator", defaults("transformer-impedance-calculator")).primary)).toBeCloseTo(15.16, 1);
  });

  it("uses the larger generator steady or starting requirement", () => {
    expect(metric("generator-sizing-calculator", "Governing site output")).toBe("210.0 kW");
  });

  it("calculates THD by root-sum-square", () => {
    const expected = Math.sqrt(25 ** 2 + 18 ** 2 + 12 ** 2 + 5 ** 2 + 4 ** 2 + 3 ** 2);
    expect(Number.parseFloat(metric("harmonic-thd-calculator", "Harmonic RSS")!)).toBeCloseTo(expected, 2);
  });

  it("calculates UPS energy runtime", () => {
    expect(metric("ups-backup-time-calculator", "Bank voltage")).toBe("48.00 VDC");
    expect(calculateTool("ups-backup-time-calculator", defaults("ups-backup-time-calculator")).primary).toContain("h");
  });

  it("calculates inverter nominal DC current", () => {
    expect(Number.parseFloat(metric("inverter-sizing-calculator", "DC input current at nominal voltage")!)).toBeCloseTo(132.98, 1);
  });

  it("reduces the grounding estimate when a second rod is added", () => {
    const one = Number.parseFloat(metric("grounding-resistance-calculator", "Multiple-rod estimate", { count: 1 })!);
    const two = Number.parseFloat(metric("grounding-resistance-calculator", "Multiple-rod estimate", { count: 2 })!);
    expect(two).toBeLessThan(one);
  });

  it("corrects hotter insulation readings downward to 40 C", () => {
    expect(metric("insulation-resistance-temperature-correction-calculator", "Corrected resistance")).toBe("100.0 MΩ");
  });

  it("applies the capstan equation to cable pulling", () => {
    const straight = Number.parseFloat(metric("cable-pulling-tension-calculator", "Straight-section exit tension")!);
    const final = Number.parseFloat(metric("cable-pulling-tension-calculator", "Final pulling tension")!);
    expect(final).toBeGreaterThan(straight);
  });

  it("calculates motor torque from output kW and rpm", () => {
    expect(Number.parseFloat(calculateTool("motor-torque-calculator", defaults("motor-torque-calculator")).primary)).toBeCloseTo(97.45, 1);
  });

  it("uses 125 percent of the largest motor in the MCC feeder screen", () => {
    expect(metric("motor-control-panel-load-calculator", "125% largest motor contribution")).toBe("125.0 A");
  });

  it("calculates a 100 ms RC time constant", () => {
    expect(metric("rc-circuit-time-constant-calculator", "Time constant τ")).toBe("0.100 s");
  });

  it("matches the published series RLC operating-point example", () => {
    expect(Number.parseFloat(metric("rlc-impedance-resonance-calculator", "Impedance magnitude")!)).toBeCloseTo(12.61, 1);
  });

  it("splits 10 A between 100 and 200 ohm branches", () => {
    expect(Number.parseFloat(metric("current-divider-calculator", "Branch 1 current")!)).toBeCloseTo(6.667, 2);
    expect(Number.parseFloat(metric("current-divider-calculator", "Branch 2 current")!)).toBeCloseTo(3.333, 2);
  });

  it("calculates 100 uF capacitor reactance at 50 Hz", () => {
    expect(Number.parseFloat(calculateTool("capacitor-reactance-energy-calculator", defaults("capacitor-reactance-energy-calculator")).primary)).toBeCloseTo(31.83, 1);
  });

  it("calculates 50 mH inductive reactance at 50 Hz", () => {
    expect(Number.parseFloat(calculateTool("inductor-reactance-energy-calculator", defaults("inductor-reactance-energy-calculator")).primary)).toBeCloseTo(15.71, 1);
  });

  it("calculates a 100 A 75 mV shunt resistance", () => {
    expect(metric("current-shunt-calculator", "Shunt resistance")).toBe("750.0 µΩ");
  });

  it("corrects emergency battery energy for all entered factors", () => {
    expect(Number.parseFloat(metric("emergency-lighting-battery-calculator", "Required battery capacity")!)).toBeGreaterThan(20);
  });

  it("calculates lighting circuit quantity from planned breaker loading", () => {
    expect(metric("lighting-circuit-load-calculator", "Preliminary circuit quantity")).toBe("1");
  });

  it("adds dedicated circuits to the general branch count", () => {
    const total = Number.parseInt(metric("branch-circuit-count-calculator", "Total planning count")!, 10);
    const general = Number.parseInt(metric("branch-circuit-count-calculator", "General-load circuits")!, 10);
    expect(total).toBe(general + 5);
  });

  it("calculates panel utilization before and after added load", () => {
    expect(Number.parseFloat(metric("electrical-panel-load-spare-capacity-calculator", "Utilization after addition")!)).toBeGreaterThan(Number.parseFloat(metric("electrical-panel-load-spare-capacity-calculator", "Current utilization")!));
  });
});
