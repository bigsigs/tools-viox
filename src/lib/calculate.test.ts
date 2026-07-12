import { describe, expect, it } from "vitest";
import { calculateTool } from "./calculate";
import { tools } from "./tools";

describe("calculateTool", () => {
  it("calculates every tool from its configured defaults", () => {
    for (const tool of tools) {
      const values = Object.fromEntries(tool.fields.flatMap((field) => {
        const entries: Array<[string, string | number]> = [[field.id, field.defaultValue ?? ""]];
        if (field.unitOptions?.length) entries.push([`${field.id}Unit`, field.defaultUnit ?? field.unitOptions[0].value]);
        return entries;
      }));

      const result = calculateTool(tool.slug, values);

      expect(result.primary, tool.slug).toBeTruthy();
      expect(result.metrics.length, tool.slug).toBeGreaterThan(0);
      expect(result.recommendations.length, tool.slug).toBeGreaterThan(0);
    }
  });

  it("sizes a general-purpose gG fuse within cable ampacity", () => {
    const result = calculateTool("fuse-sizing-calculator", {
      application: "general", loadCurrent: 32, continuousFactor: 125,
      cableAmpacity: 50, systemVoltage: 400, faultCurrent: 10
    });
    expect(result.primary).toBe("40 A gG");
    expect(result.metrics.find((item) => item.label === "Corrected design current")?.value).toBe("40.0 A");
  });

  it("uses an explicit manufacturer-dependent factor for aM fuse screening", () => {
    const result = calculateTool("fuse-sizing-calculator", {
      application: "motor", motorCurrent: 14.2, motorFuseFactor: 160,
      startMultiple: 6, startTime: 3, systemVoltage: 400, faultCurrent: 10
    });
    expect(result.primary).toBe("25 A aM");
    expect(result.metrics.find((item) => item.label === "Entered fuse factor")?.value).toBe("160%");
  });

  it("classifies MCB inrush inside the selected magnetic band", () => {
    const result = calculateTool("mcb-inrush-compatibility-checker", {
      rating: 16, curve: "c", inrush: 90, duration: 100,
      faultCurrent: 500, breakingCapacity: 6
    });
    expect(result.primary).toBe("C curve: Inside uncertain magnetic band");
    expect(result.metrics.find((item) => item.label === "Inrush multiple")?.value).toContain("5.63 × In");
  });

  it("converts metric conductor area to nearest and not-smaller AWG sizes", () => {
    const result = calculateTool("mm2-to-awg-converter", {
      direction: "mm2-to-awg", metricArea: 4, awgSize: "12"
    });
    expect(result.primary).toBe("11 AWG");
    expect(result.metrics.find((item) => item.label === "Nearest nominal AWG area")?.value).toBe("11 AWG / 4.17 mm²");
    expect(result.metrics.find((item) => item.label === "Not-smaller AWG")?.value).toBe("11 AWG / 4.17 mm²");
  });

  it("converts aught AWG notation to nominal square millimeters", () => {
    const result = calculateTool("mm2-to-awg-converter", {
      direction: "awg-to-mm2", metricArea: 4, awgSize: "1/0"
    });
    expect(result.primary).toBe("53.5");
    expect(result.unit).toBe("mm²");
    expect(result.metrics.find((item) => item.label === "Not-smaller metric size")?.value).toBe("70.0 mm²");
  });

  it("matches the defined AWG endpoint areas", () => {
    const awg36 = calculateTool("mm2-to-awg-converter", {
      direction: "awg-to-mm2", metricArea: 4, awgSize: "36"
    });
    const awg4o = calculateTool("mm2-to-awg-converter", {
      direction: "awg-to-mm2", metricArea: 4, awgSize: "4/0"
    });
    expect(awg36.primary).toBe("0.0127");
    expect(awg4o.primary).toBe("107.2");
  });

  it("does not mislabel metric conductors above the 4/0 AWG range", () => {
    const result = calculateTool("mm2-to-awg-converter", {
      direction: "mm2-to-awg", metricArea: 120, awgSize: "12"
    });
    expect(result.primary).toBe("Larger than 4/0 AWG");
    expect(result.metrics.find((item) => item.label === "Not-smaller AWG")?.value).toBe("Above 4/0 AWG range");
    expect(result.metrics.find((item) => item.label === "Equivalent circular area")?.value).toBe("236.8 kcmil");
  });

  it("selects an EV residual-current solution based on 6 mA DC detection", () => {
    const withoutDetection = calculateTool("rcd-rcbo-selector", {
      application: "ev", device: "rcbo", system: "single",
      loadCurrent: 26, cableAmpacity: 40, inrushMultiple: 2,
      faultCurrent: 5, dcDetection: "no"
    });
    const withDetection = calculateTool("rcd-rcbo-selector", {
      application: "ev", device: "rcbo", system: "single",
      loadCurrent: 26, cableAmpacity: 40, inrushMultiple: 2,
      faultCurrent: 5, dcDetection: "yes"
    });
    expect(withoutDetection.primary).toContain("Type B");
    expect(withDetection.primary).toContain("Type A with verified 6 mA DC detection");
  });

  it("sizes a PC-class four-pole ATS with current margin", () => {
    const result = calculateTool("ats-selection-calculator", {
      loadCurrent: 125, designFactor: 125, system: "three-neutral",
      neutralSwitching: "required", integratedProtection: "no",
      source: "generator", loadType: "general", faultCurrent: 25
    });
    expect(result.primary).toBe("160 A PC class ATS");
    expect(result.metrics.find((item) => item.label === "Pole arrangement")?.value).toBe("4P");
  });

  it("converts 1/0 AWG while selecting a copper cable lug", () => {
    const result = calculateTool("cable-lug-selector", {
      sizeSystem: "awg", awgSize: "1/0", metricSize: "50",
      conductorMaterial: "copper", terminalMaterial: "copper",
      stud: "M10", holes: "one", environment: "indoor",
      termination: "compression"
    });
    expect(result.primary).toContain("1/0 AWG");
    expect(result.metrics.find((item) => item.label === "Approximate area")?.value).toBe("53.5 mm²");
  });

  it("calculates pack C-rate, usable energy, and runtime", () => {
    const result = calculateTool("battery-c-rate-runtime-calculator", {
      level: "pack", voltage: 48, capacityAh: 200, current: 100,
      energyMwh: 200, powerMw: 50, socHigh: 90, socLow: 10,
      soh: 100, efficiency: 95
    });
    expect(result.primary).toBe("1.52");
    expect(result.metrics.find((item) => item.label === "C-rate")?.value).toBe("0.50C");
    expect(result.metrics.find((item) => item.label === "Usable delivered energy")?.value).toBe("7.30 kWh");
  });

  it("calculates BESS P-rate and adjusted runtime", () => {
    const result = calculateTool("battery-c-rate-runtime-calculator", {
      level: "project", voltage: 48, capacityAh: 200, current: 100,
      energyMwh: 200, powerMw: 50, socHigh: 90, socLow: 10,
      soh: 100, efficiency: 95
    });
    expect(result.primary).toBe("3.04");
    expect(result.metrics.find((item) => item.label === "P-rate")?.value).toBe("0.25P");
  });

  it("calculates daily, monthly, and annual energy cost", () => {
    const result = calculateTool("energy-cost-calculator", {
      power: 7.5, quantity: 1, loadFactor: 80, hoursPerDay: 10,
      daysPerMonth: 26, monthsPerYear: 12, tariff: 0.12, currency: "USD"
    });
    expect(result.primary).toBe("187");
    expect(result.metrics.find((item) => item.label === "Daily energy / cost")?.value).toBe("60.0 kWh / USD 7.20");
  });

  it("calculates I squared R terminal heating", () => {
    const result = calculateTool("terminal-heating-calculator", {
      current: 200, resistance: 100, resistanceUnit: "uohm",
      referenceResistance: 25, referenceResistanceUnit: "uohm",
      hours: 12, thermalResistance: 8, ambient: 35
    });
    expect(result.primary).toBe("4.00");
    expect(result.metrics.find((item) => item.label === "Contact voltage drop")?.value).toBe("20.0 mV");
  });

  it("calculates busbar electrodynamic force from RMS fault current", () => {
    const result = calculateTool("busbar-short-circuit-force-calculator", {
      currentBasis: "rms", faultCurrent: 50, peakFactor: 2.2,
      spacing: 100, span: 500, supportRating: 15000
    });
    expect(result.primary).toBe("12100");
    expect(result.metrics.find((item) => item.label === "Peak current used")?.value).toBe("110 kA");
  });

  it("rejects an invalid battery SOC window", () => {
    expect(() => calculateTool("battery-c-rate-runtime-calculator", {
      level: "pack", voltage: 48, capacityAh: 200, current: 100,
      socHigh: 10, socLow: 90, soh: 100, efficiency: 95
    })).toThrow("Upper SOC");
  });

  it("rejects fractional conduit cable quantities", () => {
    expect(() => calculateTool("conduit-fill-calculator", {
      conduitType: "emt", tradeSize: "1", runType: "normal",
      cableA: "cat6", qtyA: 2.5, customOdA: 0.25,
      cableB: "none", qtyB: 1, customOdB: 0.25
    })).toThrow("whole number");
  });

  it("rejects fractional current-carrying conductor quantities", () => {
    expect(() => calculateTool("awg-wire-size-calculator", {
      circuit: "single", material: "copper", current: 20, voltage: 120,
      length: 50, maxDrop: 3, continuous: "no", currentConductors: 3.5
    })).toThrow("whole number");
  });

  it("calculates capacitor kvar and current reduction", () => {
    const result = calculateTool("power-factor-correction-calculator", {
      phase: "three", power: 100, voltage: 400, initialPf: 0.75,
      targetPf: 0.95, frequency: "50", harmonics: "low"
    });
    expect(Number(result.primary)).toBeCloseTo(55.3, 1);
    expect(result.unit).toBe("kvar");
  });

  it("completes the power triangle from real and apparent power", () => {
    const result = calculateTool("power-factor-correction-calculator", {
      mode: "analysis", analysisBasis: "ps", phase: "three",
      power: 100, apparentPower: 125, voltage: 400
    });
    expect(Number(result.primary)).toBeCloseTo(0.8, 3);
    expect(result.unit).toBe("PF");
    expect(result.metrics.find((item) => item.label === "Reactive power (Q)")?.value).toContain("75");
    expect(result.metrics.find((item) => item.label === "Line current")?.value).toBe("180 A");
  });

  it("rejects an apparent power lower than real power", () => {
    expect(() => calculateTool("power-factor-correction-calculator", {
      mode: "analysis", analysisBasis: "ps", phase: "three",
      power: 125, apparentPower: 100, voltage: 400
    })).toThrow("Apparent power");
  });

  it("selects a motor starter from a 7.5 kW motor estimate", () => {
    const result = calculateTool("motor-starter-selection-calculator", {
      inputMode: "power", power: 7.5, voltage: 400, pf: 0.85,
      efficiency: 90, duty: "ac3", startMethod: "dol", startTime: 3,
      tripClass: "10", protection: "mpcb"
    });
    expect(result.metrics.find((item) => item.label === "Motor full-load current")?.value).toContain("14.2 A");
    expect(result.primary).toBe("18 A AC3");
  });

  it("calculates maximum-deviation three-phase voltage unbalance", () => {
    const result = calculateTool("three-phase-voltage-unbalance-calculator", {
      v1: 400, v2: 392, v3: 408, nominal: 400,
      overSetting: 10, underSetting: 10, asymSetting: 8,
      monitoring: "full-delay", wiring: "three-wire"
    });
    expect(result.primary).toBe("4.00");
    expect(result.summary).toContain("FCP18-03");
  });

  it("corrects PV string Voc for cold temperature", () => {
    const result = calculateTool("pv-combiner-box-sizing-calculator", {
      moduleVoc: 49.5, vocTempCoeff: -0.28, minimumTemp: -10,
      seriesModules: 18, moduleIsc: 13.7, parallelStrings: 6,
      currentFactor: 125, maxSeriesFuse: 25, outputCableAmpacity: 125,
      inverterMaxVoltage: 1000, lightning: "normal", environment: "outdoor"
    });
    expect(Number(result.primary.split(" ")[0])).toBeCloseTo(978, 0);
    expect(result.metrics.find((item) => item.label === "Preliminary string fuse")?.value).toBe("20 A gPV");
  });

  it("selects an advanced Type 1+2 SPD for an exposed origin", () => {
    const result = calculateTool("advanced-spd-selection-calculator", {
      system: "ac-three", nominalVoltage: 230, earthing: "tt",
      location: "origin", externalLps: "yes", supply: "overhead",
      faultCurrent: 15, equipmentWithstand: "2.5"
    });
    expect(result.primary).toBe("Type 1+2");
    expect(result.metrics.find((item) => item.label === "Connection arrangement")?.value).toContain("3+1");
    expect(result.metrics.find((item) => item.label === "Next voltage reference")?.value).toBe("275 V");
  });

  it("selects Type 1+2 SPD for exposed incoming installations", () => {
    const result = calculateTool("spd-calculator", {
      building: "yes",
      supply: "overhead",
      location: "incoming",
      system: "ac"
    });

    expect(result.primary).toContain("Type 1+2");
  });

  it("adds Type 3 SPD coordination for sensitive equipment", () => {
    const result = calculateTool("spd-calculator", {
      building: "no",
      supply: "underground",
      location: "equipment",
      system: "tn"
    });

    expect(result.primary).toBe("Type 2 upstream + Type 3 local");
    expect(result.severity).toBe("caution");
  });

  it("calculates three-phase current from kW", () => {
    const result = calculateTool("three-phase-current-calculator", {
      mode: "kw",
      power: 30,
      voltage: 400,
      pf: 0.85,
      efficiency: 92
    });

    expect(result.primary).toBe("55.4");
    expect(result.unit).toBe("A");
    expect(result.metrics.find((metric) => metric.label === "Equivalent kVA")?.value).toBe("38.4 kVA");
  });

  it("flags high voltage drop as warning", () => {
    const result = calculateTool("voltage-drop-calculator", {
      phase: "single",
      material: "copper",
      current: 40,
      voltage: 230,
      length: 80,
      area: 4
    });

    expect(result.severity).toBe("warning");
    expect(result.primary).toBe("12.2");
  });

  it("converts voltage-drop input units before calculating", () => {
    const base = calculateTool("voltage-drop-calculator", {
      phase: "three",
      material: "copper",
      current: 32,
      currentUnit: "A",
      voltage: 400,
      voltageUnit: "V",
      length: 50,
      lengthUnit: "m",
      area: 10,
      areaUnit: "mm2",
      conductors: 1
    });
    const converted = calculateTool("voltage-drop-calculator", {
      phase: "three",
      material: "copper",
      current: 0.032,
      currentUnit: "kA",
      voltage: 0.4,
      voltageUnit: "kV",
      length: 164.042,
      lengthUnit: "ft",
      area: 10,
      areaUnit: "mm2",
      conductors: 1
    });

    expect(Number(converted.primary)).toBeCloseTo(Number(base.primary), 2);
    expect(base.metrics.find((metric) => metric.label === "Voltage drop")?.value).toBe("4.85 V");
  });

  it("converts AWG conductor size for voltage-drop calculations", () => {
    const result = calculateTool("voltage-drop-calculator", {
      phase: "single",
      material: "copper",
      current: 20,
      currentUnit: "A",
      voltage: 120,
      voltageUnit: "V",
      length: 100,
      lengthUnit: "ft",
      area: 10,
      areaUnit: "AWG",
      conductors: 1
    });

    expect(result.metrics.find((metric) => metric.label === "Converted basis")?.value).toContain("mm² total");
    expect(Number(result.primary)).toBeGreaterThan(1);
  });

  it("rejects a fractional parallel-conductor count", () => {
    expect(() => calculateTool("voltage-drop-calculator", {
      phase: "three",
      material: "copper",
      current: 32,
      voltage: 400,
      length: 50,
      area: 10,
      conductors: 1.5
    })).toThrow("whole number");
  });

  it("sizes a copper cable from ampacity, sizing factor, and derating table", () => {
    const result = calculateTool("cable-size-calculator", {
      current: 32,
      factor: 125,
      material: "copper",
      installation: "normal"
    });

    expect(result.primary).toBe("10.0");
    expect(result.unit).toBe("mm²");
    expect(result.metrics.find((metric) => metric.label === "Required reference ampacity")?.value).toBe("40.0 A");
  });

  it("upsizes cable selection for aluminum in enclosed installation", () => {
    const result = calculateTool("cable-size-calculator", {
      current: 32,
      factor: 125,
      material: "aluminum",
      installation: "enclosed"
    });

    expect(result.primary).toBe("16.0");
    expect(result.metrics.find((metric) => metric.label === "Installation derating")?.value).toBe("82.0%");
  });

  it("rounds circuit breaker sizing to a standard rating", () => {
    const result = calculateTool("circuit-breaker-size-calculator", {
      phase: "three",
      power: 15,
      voltage: 400,
      pf: 0.85,
      factor: 125
    });

    expect(result.unit).toBe("A");
    expect(result.primary).toBe("32");
    expect(result.metrics.find((metric) => metric.label === "Minimum rating")?.value).toBe("31.8 A");
  });

  it("calculates conduit fill from cable and conduit areas", () => {
    const result = calculateTool("conduit-fill-calculator", {
      conduitType: "emt",
      tradeSize: "1",
      runType: "normal",
      cableA: "cat6",
      qtyA: 12,
      customOdA: 0.25,
      cableB: "none",
      qtyB: 1,
      customOdB: 0.25
    });

    expect(result.severity).toBe("warning");
    expect(Number(result.primary)).toBeCloseTo(60.7, 1);
    expect(result.summary).toContain("40");
  });

  it("applies the conduit nipple fill limit", () => {
    const result = calculateTool("conduit-fill-calculator", {
      conduitType: "emt",
      tradeSize: "1",
      runType: "nipple",
      cableA: "custom",
      qtyA: 1,
      customOdA: 0.4,
      cableB: "none",
      qtyB: 1,
      customOdB: 0.25
    });

    expect(result.summary).toContain("60.0%");
    expect(result.severity).toBe("ok");
  });

  it("uses Schedule 40 PVC internal dimensions rather than EMT dimensions", () => {
    const result = calculateTool("conduit-fill-calculator", {
      conduitType: "pvc40",
      tradeSize: "1",
      runType: "normal",
      cableA: "custom",
      qtyA: 4,
      customOdA: 0.5,
      cableB: "none",
      qtyB: 1,
      customOdB: 0.25
    });

    expect(result.metrics.find((metric) => metric.label === "Conduit ID")?.value).toBe("1.03 in");
    expect(Number(result.primary)).toBeCloseTo(94.4, 1);
  });

  it("checks DC voltage drop with AWG resistance and temperature correction", () => {
    const result = calculateTool("dc-voltage-drop-calculator", {
      voltage: 24,
      current: 3,
      length: 100,
      awg: "14",
      material: "copper",
      temperature: 75,
      maxDrop: 5
    });

    expect(result.severity).toBe("warning");
    expect(Number(result.primary)).toBeCloseTo(6.41, 1);
    expect(result.metrics.find((metric) => metric.label === "Load voltage")?.value).toContain("22");
  });

  it("selects the smallest AWG that passes ampacity and voltage drop", () => {
    const result = calculateTool("awg-wire-size-calculator", {
      circuit: "single",
      material: "copper",
      current: 20,
      voltage: 120,
      length: 100,
      maxDrop: 3,
      continuous: "no",
      currentConductors: 3
    });

    expect(result.primary).toBe("8 AWG");
  });

  it("returns no listed AWG when ampacity and voltage drop both fail the table", () => {
    const result = calculateTool("awg-wire-size-calculator", {
      circuit: "dc",
      material: "copper",
      current: 250,
      voltage: 12,
      length: 200,
      maxDrop: 3,
      continuous: "yes",
      currentConductors: 8
    });

    expect(result.primary).toBe("Larger than 4/0");
    expect(result.severity).toBe("warning");
  });

  it("sizes transformers with demand, growth, loading margin, and ambient derate", () => {
    const result = calculateTool("transformer-sizing-calculator", {
      series: "ansi",
      phase: "three",
      loadMode: "kw",
      load: 200,
      pf: 0.85,
      efficiency: 90,
      demand: 70,
      growth: 20,
      loading: 80,
      ambient: 40,
      voltage: 480
    });

    expect(result.primary).toBe("300");
    expect(result.unit).toBe("kVA");
    expect(result.metrics.find((metric) => metric.label === "Secondary FLC")?.value).toBe("361 A");
  });

  it("estimates transformer secondary short-circuit current from percent impedance", () => {
    const result = calculateTool("short-circuit-current-calculator", {
      phase: "three",
      kva: 500,
      impedance: 5.75,
      voltage: 400,
      utilityMva: 0
    });

    expect(result.unit).toBe("kA");
    expect(Number(result.primary)).toBeCloseTo(12.6, 1);
  });

  it("uses the single-phase transformer current formula when single-phase is selected", () => {
    const result = calculateTool("short-circuit-current-calculator", {
      phase: "single",
      kva: 600,
      impedance: 5.75,
      voltage: 400,
      utilityMva: 0
    });

    expect(result.primary).toBe("26.1");
    expect(result.metrics.find((metric) => metric.label === "Calculation basis")?.value).toBe("Single-phase: S = V × I");
    expect(result.metrics.find((metric) => metric.label === "Full-load current")?.value).toBe("1500 A");
    expect(result.metrics.find((metric) => metric.label === "Fault MVA")?.value).toBe("10.4 MVA");
  });

  it("uses the three-phase transformer current formula when three-phase is selected", () => {
    const result = calculateTool("short-circuit-current-calculator", {
      phase: "three",
      kva: 600,
      impedance: 5.75,
      voltage: 400,
      utilityMva: 0
    });

    expect(result.primary).toBe("15.1");
    expect(result.metrics.find((metric) => metric.label === "Calculation basis")?.value).toBe("Three-phase: S = √3 × V × I");
    expect(result.metrics.find((metric) => metric.label === "Full-load current")?.value).toBe("866 A");
    expect(result.metrics.find((metric) => metric.label === "Fault MVA")?.value).toBe("10.4 MVA");
  });

  it("includes upstream utility impedance in short-circuit current", () => {
    const result = calculateTool("short-circuit-current-calculator", {
      phase: "three",
      kva: 500,
      impedance: 5.75,
      voltage: 400,
      utilityMva: 25
    });

    expect(result.primary).toBe("9.31");
    expect(result.metrics.find((metric) => metric.label === "Source Z allowance")?.value).toBe("2.00%");
  });

  it("converts kW to kVA and current for balanced three-phase power", () => {
    const result = calculateTool("kw-kva-amp-calculator", {
      mode: "kw-to-amps",
      phase: "three",
      power: 15,
      voltage: 400,
      pf: 0.9
    });

    expect(result.primary).toBe("24.1");
    expect(result.metrics.find((metric) => metric.label === "Apparent power")?.value).toBe("16.7 kVA");
  });

  it("converts three-phase amps to kW", () => {
    const result = calculateTool("kw-kva-amp-calculator", {
      mode: "amps-to-kw",
      phase: "three",
      amps: 100,
      voltage: 400,
      pf: 0.8
    });
    expect(result.primary).toBe("55.4");
  });

  it("converts three-phase kVA to amps without power factor", () => {
    const result = calculateTool("kw-kva-amp-calculator", { mode: "kva-to-amps", phase: "three", kva: 100, voltage: 400, pf: 0.2 });
    expect(result.primary).toBe("144");
    expect(result.metrics.find((metric) => metric.label === "Power factor")?.value).toBe("Not required");
  });

  it("rejects a fractional EV charger quantity", () => {
    expect(() => calculateTool("ev-charger-load-calculator", {
      phase: "three",
      power: 11,
      voltage: 400,
      count: 2.5,
      simultaneity: 80,
      pf: 0.98
    })).toThrow("whole number");
  });

  it("warns when breaker demand exceeds the internal standard rating range", () => {
    const result = calculateTool("circuit-breaker-size-calculator", {
      phase: "three",
      power: 4000,
      voltage: 400,
      pf: 0.8,
      factor: 125
    });

    expect(result.severity).toBe("warning");
    expect(result.recommendations[0]).toContain("exceeds");
  });

  it("calculates current directly from kVA for three-phase systems", () => {
    const result = calculateTool("three-phase-current-calculator", {
      mode: "kva",
      power: 100,
      voltage: 400,
      pf: 0.8,
      efficiency: 90
    });

    expect(result.primary).toBe("144");
    expect(result.metrics.find((metric) => metric.label === "Power factor")?.value).toBe("Not required for kVA input");
  });

  it("calculates motor full-load current and overload reference", () => {
    const result = calculateTool("motor-current-calculator", {
      unit: "kw",
      power: 7.5,
      voltage: 400,
      pf: 0.86,
      efficiency: 90,
      serviceFactor: 115
    });

    expect(result.primary).toBe("14.0");
    expect(result.metrics.find((metric) => metric.label === "Overload reference")?.value).toBe("16.1 A");
  });

  it("converts horsepower before calculating motor current", () => {
    const result = calculateTool("motor-current-calculator", {
      unit: "hp",
      power: 10,
      voltage: 400,
      pf: 0.86,
      efficiency: 90,
      serviceFactor: 115
    });

    expect(result.metrics.find((metric) => metric.label === "Motor output")?.value).toBe("7.46 kW");
  });

  it("calculates EV charger planned load with simultaneity", () => {
    const result = calculateTool("ev-charger-load-calculator", {
      phase: "three",
      power: 11,
      voltage: 400,
      count: 4,
      simultaneity: 80,
      pf: 0.98
    });

    expect(result.primary).toBe("51.8");
    expect(result.metrics.find((metric) => metric.label === "Current per charger")?.value).toBe("16.2 A");
  });

  it("selects a starting metric cable gland thread by cable OD", () => {
    const result = calculateTool("cable-gland-size-calculator", {
      diameter: 18,
      armored: "armored",
      environment: "hazardous"
    });

    expect(result.primary).toBe("M25");
    expect(result.severity).toBe("warning");
    expect(result.metrics.find((metric) => metric.label === "Cable construction")?.value).toBe("Armored cable");
  });

  it("estimates busbar current from area, density, material, and derating", () => {
    const result = calculateTool("busbar-current-rating-calculator", {
      width: 30,
      thickness: 5,
      density: 1.2,
      material: "copper",
      derating: 80
    });

    expect(result.primary).toBe("144");
    expect(result.metrics.find((metric) => metric.label === "Cross-section")?.value).toBe("150 mm²");
  });
});
