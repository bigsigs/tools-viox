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
      phase: "three",
      power: 15,
      voltage: 400,
      pf: 0.9,
      efficiency: 100
    });

    expect(result.primary).toBe("24.1");
    expect(result.metrics.find((metric) => metric.label === "Apparent power")?.value).toBe("16.7 kVA");
  });

  it("keeps input power, apparent power, and current consistent when efficiency is below 100%", () => {
    const result = calculateTool("kw-kva-amp-calculator", {
      phase: "three",
      power: 15,
      voltage: 400,
      pf: 0.9,
      efficiency: 90
    });

    expect(result.metrics.find((metric) => metric.label === "Input power")?.value).toBe("16.7 kW");
    expect(result.metrics.find((metric) => metric.label === "Apparent power")?.value).toBe("18.5 kVA");
    expect(result.primary).toBe("26.7");
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
