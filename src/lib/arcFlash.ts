import ArcFlashCalculator from "./vendor/ArcFlashCalculatorClass";

export type ElectrodeConfiguration = "VCB" | "VCBB" | "HCB" | "VOA" | "HOA";

export type ArcFlashInput = {
  voltage: number;
  boltedFaultCurrent: number;
  electrodeConfiguration: ElectrodeConfiguration;
  conductorGap: number;
  workingDistance: number;
  enclosureWidth: number;
  enclosureHeight: number;
  enclosureDepth: number;
  normalClearingTime: number;
  reducedClearingTime: number;
};

export type ArcFlashScenario = {
  arcingCurrent: number;
  incidentEnergyJcm2: number;
  incidentEnergyCalCm2: number;
  boundaryMm: number;
};

export type ArcFlashOutput = {
  normal: ArcFlashScenario;
  reduced: ArcFlashScenario;
  worstCase: "normal" | "reduced";
  worstEnergyCalCm2: number;
  worstBoundaryMm: number;
  variationFactor: number;
  enclosureCorrectionFactor: number;
  enclosureType: "Typical" | "Shallow" | "Open air";
};

const variationCoefficients: Record<ElectrodeConfiguration, number[]> = {
  VCB: [0, -0.0000014269, 0.000083137, -0.0019382, 0.022366, -0.12645, 0.30226],
  VCBB: [1.138e-6, -6.0287e-5, 0.0012758, -0.013778, 0.080217, -0.24066, 0.33524],
  HCB: [0, -3.097e-6, 0.00016405, -0.0033609, 0.033308, -0.16182, 0.34627],
  VOA: [9.5606e-7, -5.1543e-5, 0.0011161, -0.01242, 0.075125, -0.23584, 0.33696],
  HOA: [0, -3.1555e-6, 0.0001682, -0.0034607, 0.034124, -0.1599, 0.34629]
};

export function calculateArcFlash(input: ArcFlashInput): ArcFlashOutput {
  validateArcFlashInput(input);
  const inches = (mm: number) => mm / 25.4;
  const normal: any = new ArcFlashCalculator(
    input.voltage,
    input.boltedFaultCurrent,
    input.electrodeConfiguration,
    input.conductorGap,
    inches(input.workingDistance),
    inches(input.enclosureWidth),
    inches(input.enclosureHeight),
    inches(input.enclosureDepth),
    input.normalClearingTime
  );

  const voltageKv = input.voltage / 1000;
  const varCf = polynomial(variationCoefficients[input.electrodeConfiguration], voltageKv);
  const reductionFactor = 1 - 0.5 * varCf;
  const reduced = calculateReducedScenario(normal, input.reducedClearingTime, reductionFactor);
  const normalScenario: ArcFlashScenario = {
    arcingCurrent: normal.I_arc,
    incidentEnergyJcm2: normal.E,
    incidentEnergyCalCm2: normal.E_cal,
    boundaryMm: normal.AFB
  };
  const worstCase = reduced.incidentEnergyCalCm2 > normalScenario.incidentEnergyCalCm2 ? "reduced" : "normal";
  const worst = worstCase === "reduced" ? reduced : normalScenario;

  return {
    normal: normalScenario,
    reduced,
    worstCase,
    worstEnergyCalCm2: worst.incidentEnergyCalCm2,
    worstBoundaryMm: worst.boundaryMm,
    variationFactor: varCf,
    enclosureCorrectionFactor: normal.CF,
    enclosureType: input.electrodeConfiguration === "VOA" || input.electrodeConfiguration === "HOA" ? "Open air" : normal.Etype
  };
}

function calculateReducedScenario(base: any, timeMs: number, reductionFactor: number): ArcFlashScenario {
  const voltageKv = base.sec_v / 1000;
  if (voltageKv <= 0.6) {
    const iArc = base.I_arc * reductionFactor;
    const energy = intermediateEnergy(base, base.sec_v, iArc, base.I_arc600, timeMs);
    return scenario(iArc, energy, intermediateBoundary(base, base.sec_v, energy));
  }

  const i600 = base.I_arc600 * reductionFactor;
  const i2700 = base.I_arc2700 * reductionFactor;
  const i14300 = base.I_arc14300 * reductionFactor;
  const iArc = interpolate(voltageKv, i600, i2700, i14300);
  const e600 = intermediateEnergy(base, 600, i600, undefined, timeMs);
  const e2700 = intermediateEnergy(base, 2700, i2700, undefined, timeMs);
  const e14300 = intermediateEnergy(base, 14300, i14300, undefined, timeMs);
  const b600 = intermediateBoundary(base, 600, e600);
  const b2700 = intermediateBoundary(base, 2700, e2700);
  const b14300 = intermediateBoundary(base, 14300, e14300);
  return scenario(iArc, interpolate(voltageKv, e600, e2700, e14300), interpolate(voltageKv, b600, b2700, b14300));
}

function scenario(arcingCurrent: number, energyJcm2: number, boundaryMm: number): ArcFlashScenario {
  return { arcingCurrent, incidentEnergyJcm2: energyJcm2, incidentEnergyCalCm2: energyJcm2 * 0.2390057356, boundaryMm };
}

function intermediateEnergy(base: any, anchorVoltage: number, iArc: number, iArc600: number | undefined, timeMs: number) {
  const table = anchorVoltage <= 600
    ? ArcFlashCalculator.table3.find((row: any) => row.ec === base.ec)
    : anchorVoltage === 2700
      ? ArcFlashCalculator.table4.find((row: any) => row.ec === base.ec)
      : ArcFlashCalculator.table5.find((row: any) => row.ec === base.ec)!;
  if (!table) throw new Error("Arc-flash coefficient table not found.");
  const numeratorCurrent = iArc600 ?? iArc;
  const exponent = table.k1 + table.k2 * Math.log10(base.G)
    + table.k3 * numeratorCurrent / currentPolynomial(table, base.I_bf)
    + table.k11 * Math.log10(base.I_bf)
    + table.k12 * Math.log10(base.D)
    + table.k13 * Math.log10(iArc)
    + Math.log10(1 / base.CF);
  return 12.552 / 50 * timeMs * 10 ** exponent;
}

function intermediateBoundary(base: any, anchorVoltage: number, energyJcm2: number) {
  const table = anchorVoltage <= 600
    ? ArcFlashCalculator.table3.find((row: any) => row.ec === base.ec)
    : anchorVoltage === 2700
      ? ArcFlashCalculator.table4.find((row: any) => row.ec === base.ec)
      : ArcFlashCalculator.table5.find((row: any) => row.ec === base.ec)!;
  if (!table) throw new Error("Arc-flash boundary coefficient table not found.");
  const distanceFactor = energyJcm2 / base.D ** table.k12;
  return (5.0208 / distanceFactor) ** (1 / table.k12);
}

function currentPolynomial(k: any, current: number) {
  return k.k4 * current ** 7 + k.k5 * current ** 6 + k.k6 * current ** 5 + k.k7 * current ** 4
    + k.k8 * current ** 3 + k.k9 * current ** 2 + k.k10 * current;
}

function interpolate(voltageKv: number, at600: number, at2700: number, at14300: number) {
  const x1 = (at2700 - at600) / 2.1 * (voltageKv - 2.7) + at2700;
  const x2 = (at14300 - at2700) / 11.6 * (voltageKv - 14.3) + at14300;
  const x3 = x1 * (2.7 - voltageKv) / 2.1 + x2 * (voltageKv - 0.6) / 2.1;
  return voltageKv <= 2.7 ? x3 : x2;
}

function polynomial(coefficients: number[], value: number) {
  return coefficients.reduce((sum, coefficient, index) => sum + coefficient * value ** (6 - index), 0);
}

function validateArcFlashInput(input: ArcFlashInput) {
  if (input.voltage < 208 || input.voltage > 15000) throw new Error("IEEE 1584-2018 applies only from 208 V to 15,000 V three-phase AC.");
  const lv = input.voltage <= 600;
  if (input.boltedFaultCurrent < (lv ? 0.5 : 0.2) || input.boltedFaultCurrent > (lv ? 106 : 65)) throw new Error(lv ? "For 208-600 V, bolted fault current must be 0.5-106 kA." : "Above 600 V, bolted fault current must be 0.2-65 kA.");
  if (input.conductorGap < (lv ? 6.35 : 19.05) || input.conductorGap > (lv ? 76.2 : 254)) throw new Error(lv ? "For 208-600 V, conductor gap must be 6.35-76.2 mm." : "Above 600 V, conductor gap must be 19.05-254 mm.");
  if (input.workingDistance < 305) throw new Error("Working distance must be at least 305 mm.");
  if (input.enclosureWidth < 4 * input.conductorGap) throw new Error("Enclosure width must be at least four times the conductor gap.");
  for (const [label, value] of [["Enclosure height", input.enclosureHeight], ["Enclosure depth", input.enclosureDepth], ["Normal clearing time", input.normalClearingTime], ["Reduced-current clearing time", input.reducedClearingTime]] as const) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be greater than zero.`);
  }
}
