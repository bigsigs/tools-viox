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
});
