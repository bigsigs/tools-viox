import { describe, expect, it } from "vitest";
import { calculateArcFlash } from "./arcFlash";

describe("IEEE 1584-2018 arc flash model", () => {
  it("matches an official-spreadsheet-derived LV VCB vector for both current scenarios", () => {
    const result = calculateArcFlash({
      voltage: 208,
      boltedFaultCurrent: 0.5,
      electrodeConfiguration: "VCB",
      conductorGap: 6.35,
      workingDistance: 305,
      enclosureWidth: 200,
      enclosureHeight: 200,
      enclosureDepth: 100,
      normalClearingTime: 10,
      reducedClearingTime: 10
    });

    expect(result.normal.arcingCurrent).toBeCloseTo(0.2288423561, 7);
    expect(result.normal.incidentEnergyJcm2).toBeCloseTo(0.01262477115, 7);
    expect(result.normal.boundaryMm).toBeCloseTo(7.203573965, 5);
    expect(result.reduced.arcingCurrent).toBeCloseTo(0.1971581301, 7);
    expect(result.reduced.incidentEnergyJcm2).toBeCloseTo(0.01094674063, 7);
    expect(result.reduced.boundaryMm).toBeCloseTo(6.588520336, 5);
  });

  it("can identify reduced-current duration as the worst energy scenario", () => {
    const result = calculateArcFlash({
      voltage: 480,
      boltedFaultCurrent: 20,
      electrodeConfiguration: "VCB",
      conductorGap: 32,
      workingDistance: 610,
      enclosureWidth: 508,
      enclosureHeight: 508,
      enclosureDepth: 508,
      normalClearingTime: 80,
      reducedClearingTime: 400
    });
    expect(result.reduced.arcingCurrent).toBeLessThan(result.normal.arcingCurrent);
    expect(result.worstCase).toBe("reduced");
    expect(result.worstEnergyCalCm2).toBe(result.reduced.incidentEnergyCalCm2);
  });

  it.each([
    ["VCBB", 0.29655064131892656, 0.014992054105095787, 12.261675603610694, 0.25376852493252383, 0.012455019655938308, 11.067278885423612],
    ["HCB", 0.3055457934679083, 0.04948253167349357, 31.330286488765733, 0.2575716605867758, 0.04145751474450631, 28.7149384406497],
    ["VOA", 0.23904506096581604, 0.010749901752544514, 6.51413145596976, 0.20425853158573137, 0.009189879657638246, 5.9053288019818115],
    ["HOA", 0.3000224569856444, 0.034680500108350165, 25.033823788581167, 0.2528474791198771, 0.02902808665895283, 22.892835235385]
  ] as const)("matches the official-spreadsheet-derived 208 V %s vector", (electrode, iNormal, eNormal, bNormal, iReduced, eReduced, bReduced) => {
    const result = calculateArcFlash({ voltage: 208, boltedFaultCurrent: 0.5, electrodeConfiguration: electrode, conductorGap: 6.35, workingDistance: 305, enclosureWidth: 200, enclosureHeight: 200, enclosureDepth: 100, normalClearingTime: 10, reducedClearingTime: 10 });
    expect(result.normal.arcingCurrent).toBeCloseTo(iNormal, 7);
    expect(result.normal.incidentEnergyJcm2).toBeCloseTo(eNormal, 7);
    expect(result.normal.boundaryMm).toBeCloseTo(bNormal, 4);
    expect(result.reduced.arcingCurrent).toBeCloseTo(iReduced, 7);
    expect(result.reduced.incidentEnergyJcm2).toBeCloseTo(eReduced, 7);
    expect(result.reduced.boundaryMm).toBeCloseTo(bReduced, 4);
  });

  it("matches a 10 kV interpolation vector", () => {
    const result = calculateArcFlash({ voltage: 10000, boltedFaultCurrent: 0.2, electrodeConfiguration: "VCB", conductorGap: 19.05, workingDistance: 305, enclosureWidth: 200, enclosureHeight: 200, enclosureDepth: 100, normalClearingTime: 10, reducedClearingTime: 10 });
    expect(result.normal.arcingCurrent).toBeCloseTo(0.18525798025331555, 7);
    expect(result.normal.incidentEnergyJcm2).toBeCloseTo(0.05870752839146346, 7);
    expect(result.normal.boundaryMm).toBeCloseTo(17.870885533339536, 5);
    expect(result.reduced.arcingCurrent).toBeCloseTo(0.18295707613856935, 7);
    expect(result.reduced.incidentEnergyJcm2).toBeCloseTo(0.05886862673115352, 7);
    expect(result.reduced.boundaryMm).toBeCloseTo(17.896445103385993, 5);
  });

  it("rejects values outside the published IEEE model range", () => {
    expect(() => calculateArcFlash({
      voltage: 120,
      boltedFaultCurrent: 10,
      electrodeConfiguration: "VCB",
      conductorGap: 25,
      workingDistance: 457,
      enclosureWidth: 356,
      enclosureHeight: 356,
      enclosureDepth: 203,
      normalClearingTime: 100,
      reducedClearingTime: 100
    })).toThrow(/208 V to 15,000 V/);
  });
});
