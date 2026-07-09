import { describe, expect, it } from "vitest";
import { calculateTool } from "./calculate";

describe("calculateTool", () => {
  it("selects Type 1+2 SPD for exposed incoming installations", () => {
    const result = calculateTool("spd-calculator", {
      building: "yes",
      supply: "overhead",
      location: "incoming",
      system: "ac"
    });

    expect(result.primary).toContain("Type 1+2");
  });

  it("calculates three-phase current from kW", () => {
    const result = calculateTool("three-phase-current-calculator", {
      mode: "kw",
      power: 30,
      voltage: 400,
      pf: 0.85,
      efficiency: 92
    });

    expect(Number(result.primary)).toBeGreaterThan(40);
    expect(result.unit).toBe("A");
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
    expect(Number(result.primary)).toBeGreaterThan(20);
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
});
