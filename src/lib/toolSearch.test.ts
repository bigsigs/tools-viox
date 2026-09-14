import { describe, expect, it } from "vitest";
import { searchTools, type SearchableTool } from "./toolSearch";

const tools: SearchableTool[] = [
  { slug: "voltage-drop-calculator", title: "Voltage Drop Calculator", description: "Check conductor voltage loss.", keywords: ["voltage drop"], categoryTitle: "Cable & Voltage Drop" },
  { slug: "circuit-breaker-size-calculator", title: "Circuit Breaker Size Calculator", description: "Select an MCB or MCCB.", keywords: ["breaker sizing"], categoryTitle: "Circuit Protection" },
  { slug: "short-circuit-current-calculator", title: "Short Circuit Current Calculator", description: "Calculate available fault current.", keywords: ["fault current"], categoryTitle: "Circuit Protection" },
  { slug: "ohms-law-calculator", title: "Ohm's Law Calculator", description: "Calculate voltage, current, and resistance.", keywords: ["ohm law"], categoryTitle: "Fundamentals" }
];

describe("calculator search", () => {
  it("ranks a direct title match first", () => {
    expect(searchTools(tools, "voltage drop")[0]?.slug).toBe("voltage-drop-calculator");
  });

  it("matches industry aliases", () => {
    expect(searchTools(tools, "mccb")[0]?.slug).toBe("circuit-breaker-size-calculator");
  });

  it("prefers the primary sizing tool for a broad breaker search", () => {
    expect(searchTools(tools, "breaker")[0]?.slug).toBe("circuit-breaker-size-calculator");
  });

  it("matches a Spanish industry alias", () => {
    expect(searchTools(tools, "disyuntor")[0]?.slug).toBe("circuit-breaker-size-calculator");
  });

  it("tolerates a one-character typo", () => {
    expect(searchTools(tools, "volatge")[0]?.slug).toBe("voltage-drop-calculator");
  });

  it("requires every search token to match", () => {
    expect(searchTools(tools, "short fault")[0]?.slug).toBe("short-circuit-current-calculator");
  });
});
