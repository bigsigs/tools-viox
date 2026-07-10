import type { CalculationResult } from "./types";

type Values = Record<string, string | number>;

const breakerSizes = [1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];
const conductorTable = [
  { mm2: 1.5, amps: 15 },
  { mm2: 2.5, amps: 21 },
  { mm2: 4, amps: 28 },
  { mm2: 6, amps: 36 },
  { mm2: 10, amps: 50 },
  { mm2: 16, amps: 68 },
  { mm2: 25, amps: 89 },
  { mm2: 35, amps: 110 },
  { mm2: 50, amps: 134 },
  { mm2: 70, amps: 171 },
  { mm2: 95, amps: 207 },
  { mm2: 120, amps: 239 },
  { mm2: 150, amps: 272 },
  { mm2: 185, amps: 310 },
  { mm2: 240, amps: 364 },
  { mm2: 300, amps: 419 },
  { mm2: 400, amps: 502 }
];

const conduitIdsInch: Record<string, Record<string, number>> = {
  emt: {
    "1/2": 0.622,
    "3/4": 0.824,
    "1": 1.049,
    "1-1/4": 1.38,
    "1-1/2": 1.61,
    "2": 2.067,
    "2-1/2": 2.731,
    "3": 3.356,
    "3-1/2": 3.834,
    "4": 4.334
  },
  rmc: {
    "1/2": 0.632,
    "3/4": 0.836,
    "1": 1.063,
    "1-1/4": 1.394,
    "1-1/2": 1.624,
    "2": 2.083,
    "2-1/2": 2.489,
    "3": 3.09,
    "3-1/2": 3.57,
    "4": 4.05
  },
  pvc40: {
    "1/2": 0.602,
    "3/4": 0.804,
    "1": 1.029,
    "1-1/4": 1.36,
    "1-1/2": 1.59,
    "2": 2.047,
    "2-1/2": 2.445,
    "3": 3.042,
    "3-1/2": 3.521,
    "4": 3.998
  },
  pvc80: {
    "1/2": 0.546,
    "3/4": 0.742,
    "1": 0.957,
    "1-1/4": 1.278,
    "1-1/2": 1.5,
    "2": 1.939,
    "2-1/2": 2.323,
    "3": 2.9,
    "3-1/2": 3.364,
    "4": 3.826
  }
};

const cableOutsideDiametersInch: Record<string, number> = {
  "thhn-14": 0.111,
  "thhn-12": 0.13,
  "thhn-10": 0.164,
  "thhn-8": 0.216,
  "thhn-6": 0.254,
  "thhn-4": 0.324,
  "cat5e": 0.197,
  "cat6": 0.236,
  "cat6a-utp": 0.315,
  "cat6a-stp": 0.276,
  "fire-18-2": 0.157,
  "fire-18-4": 0.177,
  "control-22-4": 0.138,
  "coax-rg6": 0.275,
  "fiber-armored": 0.492
};

const awgConductors = [
  { size: "18 AWG", key: "18", copperOhmPer1000Ft: 6.385, copperAmpacity: 5, aluminumAmpacity: 0 },
  { size: "16 AWG", key: "16", copperOhmPer1000Ft: 4.016, copperAmpacity: 10, aluminumAmpacity: 0 },
  { size: "14 AWG", key: "14", copperOhmPer1000Ft: 2.525, copperAmpacity: 15, aluminumAmpacity: 0 },
  { size: "12 AWG", key: "12", copperOhmPer1000Ft: 1.588, copperAmpacity: 20, aluminumAmpacity: 15 },
  { size: "10 AWG", key: "10", copperOhmPer1000Ft: 0.999, copperAmpacity: 30, aluminumAmpacity: 25 },
  { size: "8 AWG", key: "8", copperOhmPer1000Ft: 0.6282, copperAmpacity: 40, aluminumAmpacity: 35 },
  { size: "6 AWG", key: "6", copperOhmPer1000Ft: 0.3951, copperAmpacity: 55, aluminumAmpacity: 40 },
  { size: "4 AWG", key: "4", copperOhmPer1000Ft: 0.2485, copperAmpacity: 70, aluminumAmpacity: 55 },
  { size: "3 AWG", key: "3", copperOhmPer1000Ft: 0.197, copperAmpacity: 85, aluminumAmpacity: 65 },
  { size: "2 AWG", key: "2", copperOhmPer1000Ft: 0.1563, copperAmpacity: 95, aluminumAmpacity: 75 },
  { size: "1 AWG", key: "1", copperOhmPer1000Ft: 0.1239, copperAmpacity: 110, aluminumAmpacity: 85 },
  { size: "1/0 AWG", key: "1/0", copperOhmPer1000Ft: 0.0983, copperAmpacity: 125, aluminumAmpacity: 100 },
  { size: "2/0 AWG", key: "2/0", copperOhmPer1000Ft: 0.0779, copperAmpacity: 145, aluminumAmpacity: 115 },
  { size: "3/0 AWG", key: "3/0", copperOhmPer1000Ft: 0.0618, copperAmpacity: 165, aluminumAmpacity: 130 },
  { size: "4/0 AWG", key: "4/0", copperOhmPer1000Ft: 0.049, copperAmpacity: 195, aluminumAmpacity: 150 }
];

export function calculateTool(slug: string, values: Values): CalculationResult {
  switch (slug) {
    case "spd-calculator":
      return calculateSpd(values);
    case "voltage-drop-calculator":
      return calculateVoltageDrop(values);
    case "cable-size-calculator":
      return calculateCableSize(values);
    case "conduit-fill-calculator":
      return calculateConduitFill(values);
    case "dc-voltage-drop-calculator":
      return calculateDcVoltageDrop(values);
    case "awg-wire-size-calculator":
      return calculateAwgWireSize(values);
    case "circuit-breaker-size-calculator":
      return calculateBreakerSize(values);
    case "transformer-sizing-calculator":
      return calculateTransformerSizing(values);
    case "short-circuit-current-calculator":
      return calculateShortCircuit(values);
    case "kw-kva-amp-calculator":
      return calculatePowerConversion(values);
    case "three-phase-current-calculator":
      return calculateThreePhase(values);
    case "motor-current-calculator":
      return calculateMotorCurrent(values);
    case "ev-charger-load-calculator":
      return calculateEvCharger(values);
    case "cable-gland-size-calculator":
      return calculateCableGland(values);
    case "busbar-current-rating-calculator":
      return calculateBusbar(values);
    default:
      throw new Error("Unknown calculator");
  }
}

function calculateSpd(values: Values): CalculationResult {
  const building = str(values.building);
  const supply = str(values.supply);
  const location = str(values.location);
  const system = str(values.system);

  let primary = "Type 2 SPD";
  let summary = "Use Type 2 protection as the starting point for normal distribution-board surge protection.";
  const recommendations = [
    "Check Uc against the system voltage and earthing arrangement.",
    "Coordinate upstream and downstream SPDs when multiple levels are installed."
  ];

  if (building === "yes" || supply === "overhead" || supply === "mixed") {
    primary = "Type 1+2 SPD";
    summary = "Higher lightning exposure points to Type 1+2 protection at the incoming board.";
    recommendations.unshift("Verify impulse current rating and installation position against the project lightning-risk assessment.");
  }

  if (location === "equipment") {
    primary = primary === "Type 1+2 SPD" ? "Type 1+2 upstream + Type 3 local" : "Type 2 upstream + Type 3 local";
    summary = "Sensitive equipment usually needs coordinated upstream protection plus local fine protection.";
  }

  if (system === "pv") {
    primary = "DC/PV SPD";
    summary = "Use a DC-rated PV SPD selected by maximum array voltage and PV system configuration.";
    recommendations.unshift("Confirm maximum continuous operating voltage and DC short-circuit conditions from the PV design.");
  }

  return {
    primary,
    severity: primary.includes("Type 3") || primary.includes("DC") ? "caution" : "ok",
    summary,
    metrics: [
      { label: "Lightning exposure", value: building === "yes" ? "External LPS present" : supply === "underground" ? "Lower exposure" : "Elevated exposure" },
      { label: "Installation point", value: readable(location) },
      { label: "System", value: system.toUpperCase() },
      { label: "Selection mode", value: "Rule-based type family" }
    ],
    recommendations
  };
}

function calculateVoltageDrop(values: Values): CalculationResult {
  const phase = str(values.phase);
  const rho = str(values.material) === "aluminum" ? 0.0282 : 0.0175;
  const current = currentToAmps(positiveNumber(values.current, "Load current"), str(values.currentUnit || "A"));
  const voltage = voltageToVolts(positiveNumber(values.voltage, "System voltage"), str(values.voltageUnit || "V"));
  const length = lengthToMeters(positiveNumber(values.length, "Cable length"), str(values.lengthUnit || "m"));
  const singleArea = conductorAreaToMm2(positiveNumber(values.area, "Conductor size"), str(values.areaUnit || "mm2"));
  const conductors = positiveInteger(values.conductors || 1, "Parallel conductors");
  const area = singleArea * conductors;
  const drop = phase === "three"
    ? Math.sqrt(3) * current * rho * length / area
    : 2 * current * rho * length / area;
  const percent = drop / voltage * 100;

  return {
    primary: fmt(percent),
    unit: "%",
    severity: percent > 5 ? "warning" : percent > 3 ? "caution" : "ok",
    summary: `${fmt(drop)} V drop on a ${fmt(voltage)} V circuit. Compare this result with the project voltage-drop limit.`,
    metrics: [
      { label: "Voltage drop", value: `${fmt(drop)} V` },
      { label: "Drop percentage", value: `${fmt(percent)}%` },
      { label: "Resistivity used", value: `${rho} ohm mm²/m` },
      { label: "Converted basis", value: `${fmt(current)} A, ${fmt(length)} m, ${fmt(area)} mm² total` },
      { label: "Formula basis", value: phase === "three" ? "Three-phase approximation" : "Two-wire path approximation" }
    ],
    recommendations: [
      percent > 5 ? "Consider a larger conductor, shorter route, or lower load current." : "Run cable ampacity and protection checks next.",
      "Check local voltage-drop limits for the application and market."
    ]
  };
}

function currentToAmps(value: number, unit: string) {
  if (unit === "mA") return value / 1000;
  if (unit === "kA") return value * 1000;
  return value;
}

function voltageToVolts(value: number, unit: string) {
  if (unit === "kV") return value * 1000;
  return value;
}

function lengthToMeters(value: number, unit: string) {
  if (unit === "ft") return value * 0.3048;
  return value;
}

function conductorAreaToMm2(value: number, unit: string) {
  if (unit === "AWG") return awgToMm2(value);
  if (unit === "kcmil") return value * 0.506707479;
  return value;
}

function awgToMm2(gauge: number) {
  const diameterInch = 0.005 * Math.pow(92, (36 - gauge) / 39);
  const diameterMm = diameterInch * 25.4;
  return Math.PI * Math.pow(diameterMm, 2) / 4;
}

function calculateCableSize(values: Values): CalculationResult {
  const current = positiveNumber(values.current, "Load current");
  const factor = positiveNumber(values.factor, "Sizing factor") / 100;
  const materialFactor = str(values.material) === "aluminum" ? 0.72 : 1;
  const install = str(values.installation);
  const derating = install === "hot" ? 0.7 : install === "enclosed" ? 0.82 : 1;
  const required = current * factor / derating / materialFactor;
  const row = conductorTable.find((item) => item.amps >= required) ?? conductorTable[conductorTable.length - 1];

  return {
    primary: fmt(row.mm2),
    unit: "mm²",
    severity: row === conductorTable[conductorTable.length - 1] && required > row.amps ? "warning" : "ok",
    summary: `Reference conductor size based on ${fmt(required)} A required ampacity after sizing and derating.`,
    metrics: [
      { label: "Load current", value: `${fmt(current)} A` },
      { label: "Required reference ampacity", value: `${fmt(required)} A` },
      { label: "Material factor", value: str(values.material) === "aluminum" ? "Aluminum estimate" : "Copper reference" },
      { label: "Installation derating", value: `${fmt(derating * 100)}%` }
    ],
    recommendations: [
      "Check the selected cable against the applicable ampacity table and installation method.",
      "Run voltage-drop and short-circuit withstand checks before finalizing the conductor."
    ]
  };
}

function calculateConduitFill(values: Values): CalculationResult {
  const conduitType = str(values.conduitType);
  const tradeSize = str(values.tradeSize);
  const runType = str(values.runType);
  const conduitId = conduitIdsInch[conduitType]?.[tradeSize];
  if (!conduitId) throw new Error("Select a valid conduit type and trade size.");

  const cableA = str(values.cableA);
  const cableB = str(values.cableB);
  const qtyA = Math.floor(positiveNumber(values.qtyA, "Cable A quantity"));
  const qtyB = cableB === "none" ? 0 : Math.floor(positiveNumber(values.qtyB, "Cable B quantity"));
  const odA = selectedCableOd(cableA, values.customOdA, "Cable A OD");
  const odB = cableB === "none" ? 0 : selectedCableOd(cableB, values.customOdB, "Cable B OD");
  const totalCount = qtyA + qtyB;
  const conduitArea = circleArea(conduitId);
  const cableArea = circleArea(odA) * qtyA + (odB > 0 ? circleArea(odB) * qtyB : 0);
  const fill = cableArea / conduitArea * 100;
  const limit = runType === "nipple" ? 60 : totalCount === 1 ? 53 : totalCount === 2 ? 31 : 40;
  const allowedArea = conduitArea * limit / 100;
  const spareArea = allowedArea - cableArea;
  const nextTradeSize = findPassingConduit(conduitType, tradeSize, cableArea, limit);
  const jamRatio = totalCount === 3 && qtyB === 0 ? conduitId / odA : null;
  const inJamRange = jamRatio !== null && jamRatio >= 2.8 && jamRatio <= 3.2;

  return {
    primary: fmt(fill),
    unit: "% fill",
    severity: fill > limit || inJamRange ? "warning" : fill > limit * 0.85 ? "caution" : "ok",
    summary: `${fmt(totalCount)} cable(s) occupy ${fmt(fill)}% of ${readable(conduitType)} ${tradeSize}. The applicable fill limit is ${fmt(limit)}%.`,
    metrics: [
      { label: "Conduit ID", value: `${fmt(conduitId)} in` },
      { label: "Conduit area", value: `${fmt(conduitArea)} in2` },
      { label: "Cable area", value: `${fmt(cableArea)} in2` },
      { label: "Spare area at limit", value: `${fmt(spareArea)} in2` }
    ],
    recommendations: [
      fill > limit ? `Increase pathway size. ${nextTradeSize ? `${nextTradeSize} is the first passing size in this conduit family.` : "A larger or parallel pathway is required."}` : "Fill is within the selected limit; still check pull length, bends, and future spare capacity.",
      inJamRange ? `Three equal cables have a conduit-ID/cable-OD ratio of ${fmt(jamRatio)}; this is in the common 2.8-3.2 cable-jam risk zone.` : "For long pulls, staying below the limit improves pulling tension and leaves expansion room."
    ]
  };
}

function calculateDcVoltageDrop(values: Values): CalculationResult {
  const current = positiveNumber(values.current, "Load current");
  const voltage = positiveNumber(values.voltage, "Source voltage");
  const length = positiveNumber(values.length, "One-way length");
  const maxDrop = positiveNumber(values.maxDrop, "Maximum voltage drop");
  const material = str(values.material);
  const conductor = awgConductor(str(values.awg));
  const tempF = finiteNumber(values.temperature, "Ambient temperature");
  const tempC = (tempF - 32) * 5 / 9;
  const resistance = awgResistanceOhmPerFt(conductor, material, tempC);
  const drop = 2 * current * resistance * length;
  const percent = drop / voltage * 100;
  const loadVoltage = voltage - drop;
  const next = awgConductors.find((item) => {
    const nextDrop = 2 * current * awgResistanceOhmPerFt(item, material, tempC) * length;
    return nextDrop / voltage * 100 <= maxDrop && ampacityFor(item, material) >= current;
  });

  return {
    primary: fmt(percent),
    unit: "% drop",
    severity: percent > maxDrop ? "warning" : percent > maxDrop * 0.85 ? "caution" : "ok",
    summary: `${fmt(drop)} V drop leaves about ${fmt(loadVoltage)} V at the load from a ${fmt(voltage)} V DC source.`,
    metrics: [
      { label: "Voltage drop", value: `${fmt(drop)} V` },
      { label: "Load voltage", value: `${fmt(loadVoltage)} V` },
      { label: "Resistance used", value: `${fmt(resistance * 1000)} ohm/1000 ft` },
      { label: "Threshold", value: `${fmt(maxDrop)}%` }
    ],
    recommendations: [
      percent > maxDrop ? `${next ? `Upsize to at least ${next.size} for the selected threshold.` : "Use a larger conductor, shorter run, higher source voltage, or lower current."}` : "The selected conductor passes the DC voltage-drop threshold.",
      material === "cca" ? "Copper-clad aluminum is not recommended for critical DC power or high-current battery circuits." : "Confirm terminal ratings, fuse protection, and equipment minimum input voltage."
    ]
  };
}

function calculateAwgWireSize(values: Values): CalculationResult {
  const circuit = str(values.circuit);
  const material = str(values.material);
  const current = positiveNumber(values.current, "Load current");
  const voltage = positiveNumber(values.voltage, "Voltage");
  const length = positiveNumber(values.length, "One-way length");
  const maxDrop = positiveNumber(values.maxDrop, "Maximum voltage drop");
  const continuousFactor = str(values.continuous) === "yes" ? 1.25 : 1;
  const conductorCount = Math.floor(positiveNumber(values.currentConductors, "Current-carrying conductors"));
  const bundlingDerate = conductorDerating(conductorCount);
  const requiredAmpacity = current * continuousFactor / bundlingDerate;

  const candidates = awgConductors.map((conductor) => {
    const ampacity = ampacityFor(conductor, material);
    const resistance = awgResistanceOhmPerFt(conductor, material, 30);
    const drop = circuit === "three"
      ? Math.sqrt(3) * current * resistance * length
      : 2 * current * resistance * length;
    const percent = drop / voltage * 100;
    return { conductor, ampacity, drop, percent, passesAmpacity: ampacity >= requiredAmpacity, passesDrop: percent <= maxDrop };
  }).filter((item) => item.ampacity > 0);

  const match = candidates.find((item) => item.passesAmpacity && item.passesDrop);
  if (!match) {
    return {
      primary: "Larger than 4/0",
      severity: "warning",
      summary: "No listed AWG conductor passes both ampacity and voltage-drop checks with the selected inputs.",
      metrics: [
        { label: "Required ampacity", value: `${fmt(requiredAmpacity)} A` },
        { label: "Derating", value: `${fmt(bundlingDerate * 100)}%` },
        { label: "Voltage-drop limit", value: `${fmt(maxDrop)}%` },
        { label: "Largest checked", value: "4/0 AWG" }
      ],
      recommendations: ["Use parallel conductors, a larger conductor table, shorter route, higher voltage, or lower load current.", "Verify the final conductor against the locally adopted wiring code."]
    };
  }

  return {
    primary: match.conductor.size,
    severity: match.percent > maxDrop * 0.85 || match.ampacity < requiredAmpacity * 1.1 ? "caution" : "ok",
    summary: `${match.conductor.size} is the smallest listed conductor that passes ${fmt(requiredAmpacity)} A required ampacity and ${fmt(maxDrop)}% voltage-drop limit.`,
    metrics: [
      { label: "Required ampacity", value: `${fmt(requiredAmpacity)} A` },
      { label: "Selected ampacity", value: `${fmt(match.ampacity)} A` },
      { label: "Voltage drop", value: `${fmt(match.drop)} V / ${fmt(match.percent)}%` },
      { label: "Derating applied", value: `${fmt(bundlingDerate * 100)}%` }
    ],
    recommendations: [
      "Use the selected size as a planning reference, then verify insulation, terminals, installation method, ambient correction, and local code.",
      match.percent > maxDrop * 0.85 ? "Voltage drop is close to the limit; consider upsizing one step for margin." : "Run breaker, conduit fill, and voltage-drop checks together before finalizing."
    ]
  };
}

function calculateBreakerSize(values: Values): CalculationResult {
  const phase = str(values.phase);
  const kw = positiveNumber(values.power, "Load power");
  const voltage = positiveNumber(values.voltage, "System voltage");
  const pf = phase === "dc" ? 1 : positiveNumber(values.pf, "Power factor");
  const factor = positiveNumber(values.factor, "Sizing factor") / 100;
  const loadCurrent = currentFromKw(kw, voltage, pf, phase, 1);
  const minimum = loadCurrent * factor;
  const recommended = nextSize(minimum, breakerSizes);
  const exceedsStandardRange = minimum > breakerSizes[breakerSizes.length - 1];

  return {
    primary: `${recommended}`,
    unit: "A",
    severity: exceedsStandardRange ? "warning" : recommended >= 630 ? "caution" : "ok",
    summary: `Calculated load current is ${fmt(loadCurrent)} A. Minimum breaker rating after sizing factor is ${fmt(minimum)} A.`,
    metrics: [
      { label: "Load current", value: `${fmt(loadCurrent)} A` },
      { label: "Sizing factor", value: `${fmt(factor * 100)}%` },
      { label: "Minimum rating", value: `${fmt(minimum)} A` },
      { label: "Rounded standard rating", value: `${recommended} A` }
    ],
    recommendations: [
      exceedsStandardRange ? "The calculated minimum exceeds the internal standard-rating list; use engineered parallel protection or a higher-rated assembly." : "Verify trip curve, breaking capacity, cable ampacity, and selectivity.",
      "For motors or transformers, check inrush and coordination before selecting the final device."
    ]
  };
}

function calculateTransformerSizing(values: Values): CalculationResult {
  const phase = str(values.phase);
  const mode = str(values.loadMode);
  const load = positiveNumber(values.load, "Connected load");
  const pf = mode === "kva" ? 1 : positiveNumber(values.pf, "Power factor");
  const efficiency = mode === "hp" ? positiveNumber(values.efficiency, "Motor efficiency") / 100 : 1;
  const demand = positiveNumber(values.demand, "Demand factor") / 100;
  const growth = nonNegativeNumber(values.growth, "Future growth") / 100;
  const loading = positiveNumber(values.loading, "Loading target") / 100;
  const ambient = finiteNumber(values.ambient, "Average ambient temperature");
  const voltage = positiveNumber(values.voltage, "Secondary voltage");
  const series = str(values.series);
  const connectedKva = mode === "kva"
    ? load
    : mode === "hp"
      ? load * 0.746 / efficiency / pf
      : load / pf;
  const demandKva = connectedKva * demand;
  const designKva = demandKva * (1 + growth);
  const ambientDerate = ambient > 30 ? Math.max(0.7, 1 - (ambient - 30) * 0.01) : 1;
  const requiredKva = designKva / loading / ambientDerate;
  const ratings = transformerRatings(series, phase);
  const recommended = nextSize(requiredKva, ratings);
  const exceedsStandardRange = requiredKva > ratings[ratings.length - 1];
  const secondaryCurrent = phase === "three"
    ? recommended * 1000 / (Math.sqrt(3) * voltage)
    : recommended * 1000 / voltage;

  return {
    primary: `${recommended}`,
    unit: "kVA",
    severity: exceedsStandardRange ? "warning" : recommended >= 1000 ? "caution" : "ok",
    summary: `Connected load is ${fmt(connectedKva)} kVA. After demand, growth, loading margin, and ambient derating, the required rating is ${fmt(requiredKva)} kVA.`,
    metrics: [
      { label: "Demand load", value: `${fmt(demandKva)} kVA` },
      { label: "Design load", value: `${fmt(designKva)} kVA` },
      { label: "Ambient derate", value: `${fmt(ambientDerate * 100)}%` },
      { label: "Secondary FLC", value: `${fmt(secondaryCurrent)} A` }
    ],
    recommendations: [
      exceedsStandardRange ? "The required capacity exceeds the selected standard series; use an engineered multi-transformer or larger-unit design." : "Use secondary current for first-pass breaker, cable, and busbar checks.",
      "Confirm transformer standard series, impedance, cooling class, harmonics, inrush, and local code before procurement."
    ]
  };
}

function calculateShortCircuit(values: Values): CalculationResult {
  const phase = str(values.phase);
  const kva = positiveNumber(values.kva, "Transformer rating");
  const impedance = positiveNumber(values.impedance, "Transformer impedance") / 100;
  const voltage = positiveNumber(values.voltage, "Secondary voltage");
  const utilityMva = Number(values.utilityMva);
  const fullLoadCurrent = phase === "three"
    ? kva * 1000 / (Math.sqrt(3) * voltage)
    : kva * 1000 / voltage;
  const sourcePu = Number.isFinite(utilityMva) && utilityMva > 0 ? kva / (utilityMva * 1000) : 0;
  const totalPu = impedance + sourcePu;
  const faultCurrent = fullLoadCurrent / totalPu;
  const faultKa = faultCurrent / 1000;
  const faultMva = phase === "three"
    ? Math.sqrt(3) * voltage * faultCurrent / 1_000_000
    : voltage * faultCurrent / 1_000_000;
  const interruptingRatings = [5, 10, 18, 25, 35, 42, 50, 65, 100, 150, 200];
  const rating = nextSize(faultKa, interruptingRatings);
  const exceedsRatingRange = faultKa > interruptingRatings[interruptingRatings.length - 1];

  return {
    primary: fmt(faultKa),
    unit: "kA",
    severity: faultKa > 65 ? "warning" : faultKa > 35 ? "caution" : "ok",
    summary: `Available fault current is estimated from transformer full-load current divided by total per-unit source impedance.`,
    metrics: [
      { label: "Full-load current", value: `${fmt(fullLoadCurrent)} A` },
      { label: "Transformer Z", value: `${fmt(impedance * 100)}%` },
      { label: "Source Z allowance", value: sourcePu > 0 ? `${fmt(sourcePu * 100)}%` : "Ignored" },
      { label: "Fault MVA", value: `${fmt(faultMva)} MVA` }
    ],
    recommendations: [
      exceedsRatingRange ? "The result exceeds the internal 200 kA reference range; a detailed engineered solution is required." : `Select protective equipment with interrupting capacity above the calculated value; next common reference is ${rating} kA.`,
      "Final short-circuit study should include upstream utility data, cable impedance, motors, X/R ratio, and applicable IEC 60909 or IEEE method."
    ]
  };
}

function calculatePowerConversion(values: Values): CalculationResult {
  const phase = str(values.phase);
  const kw = positiveNumber(values.power, "Power");
  const voltage = positiveNumber(values.voltage, "Voltage");
  const pf = phase === "dc" ? 1 : positiveNumber(values.pf, "Power factor");
  const efficiency = positiveNumber(values.efficiency, "Efficiency") / 100;
  const amps = currentFromKw(kw, voltage, pf, phase, efficiency);
  const inputKw = kw / efficiency;
  const kva = phase === "dc" ? inputKw : inputKw / pf;

  return {
    primary: fmt(amps),
    unit: "A",
    severity: "ok",
    summary: `${fmt(kw)} kW output requires approximately ${fmt(inputKw)} kW input and ${fmt(amps)} A for the selected system.`,
    metrics: [
      { label: "Output power", value: `${fmt(kw)} kW` },
      { label: "Input power", value: `${fmt(inputKw)} kW` },
      { label: "Apparent power", value: phase === "dc" ? "Not used for DC" : `${fmt(kva)} kVA` },
      { label: "Voltage", value: `${fmt(voltage)} V` },
      { label: "Formula basis", value: phase === "three" ? "sqrt(3) three-phase" : phase === "single" ? "Single-phase AC" : "DC" }
    ],
    recommendations: [
      "Use the calculated current for first-pass breaker, cable, and contactor sizing.",
      "Use equipment nameplate current when it is available."
    ]
  };
}

function calculateThreePhase(values: Values): CalculationResult {
  const mode = str(values.mode);
  const power = positiveNumber(values.power, "Power");
  const voltage = positiveNumber(values.voltage, "Line voltage");
  const pf = positiveNumber(values.pf, "Power factor");
  const efficiency = positiveNumber(values.efficiency, "Efficiency") / 100;
  const amps = mode === "kva"
    ? power * 1000 / (Math.sqrt(3) * voltage)
    : power * 1000 / (Math.sqrt(3) * voltage * pf * efficiency);
  const kva = mode === "kva" ? power : power / (pf * efficiency);

  return {
    primary: fmt(amps),
    unit: "A",
    severity: "ok",
    summary: `Balanced three-phase current is approximately ${fmt(amps)} A at ${fmt(voltage)} V line voltage.`,
    metrics: [
      { label: "Input", value: `${fmt(power)} ${mode}` },
      { label: "Equivalent kVA", value: `${fmt(kva)} kVA` },
      { label: "Line voltage", value: `${fmt(voltage)} V` },
      { label: "Power factor", value: mode === "kva" ? "Not required for kVA input" : fmt(pf) }
    ],
    recommendations: [
      "Use this current for preliminary feeder and protection checks.",
      "Check starting current separately for motors and transformer loads."
    ]
  };
}

function calculateMotorCurrent(values: Values): CalculationResult {
  const unit = str(values.unit);
  const inputPower = positiveNumber(values.power, "Motor power");
  const kw = unit === "hp" ? inputPower * 0.746 : inputPower;
  const voltage = positiveNumber(values.voltage, "Line voltage");
  const pf = positiveNumber(values.pf, "Power factor");
  const efficiency = positiveNumber(values.efficiency, "Efficiency") / 100;
  const serviceFactor = positiveNumber(values.serviceFactor, "Overload reference") / 100;
  const flc = kw * 1000 / (Math.sqrt(3) * voltage * pf * efficiency);
  const overload = flc * serviceFactor;

  return {
    primary: fmt(flc),
    unit: "A FLC",
    severity: "caution",
    summary: `Estimated motor full-load current is ${fmt(flc)} A. A ${fmt(serviceFactor * 100)}% reference gives ${fmt(overload)} A.`,
    metrics: [
      { label: "Motor output", value: `${fmt(kw)} kW` },
      { label: "Estimated FLC", value: `${fmt(flc)} A` },
      { label: "Overload reference", value: `${fmt(overload)} A` },
      { label: "Efficiency", value: `${fmt(efficiency * 100)}%` }
    ],
    recommendations: [
      "Use motor nameplate current for final overload relay setting.",
      "Select contactor by utilization category, voltage, duty, and coordination type."
    ]
  };
}

function calculateEvCharger(values: Values): CalculationResult {
  const phase = str(values.phase);
  const kw = positiveNumber(values.power, "Power per charger");
  const voltage = positiveNumber(values.voltage, "Voltage");
  const count = positiveInteger(values.count, "Number of chargers");
  const simultaneity = positiveNumber(values.simultaneity, "Simultaneity factor") / 100;
  const pf = positiveNumber(values.pf, "Power factor");
  const currentPerCharger = currentFromKw(kw, voltage, pf, phase, 1);
  const plannedCurrent = currentPerCharger * count * simultaneity;

  return {
    primary: fmt(plannedCurrent),
    unit: "A planned",
    severity: plannedCurrent > 250 ? "caution" : "ok",
    summary: `${fmt(count)} charger(s) at ${fmt(kw)} kW each create approximately ${fmt(plannedCurrent)} A planned load with simultaneity applied.`,
    metrics: [
      { label: "Current per charger", value: `${fmt(currentPerCharger)} A` },
      { label: "Installed power", value: `${fmt(kw * count)} kW` },
      { label: "Simultaneity", value: `${fmt(simultaneity * 100)}%` },
      { label: "Planned current", value: `${fmt(plannedCurrent)} A` }
    ],
    recommendations: [
      "Check load management, earthing system, residual-current protection, and local EV charging rules.",
      "Run cable sizing and voltage-drop checks for the feeder."
    ]
  };
}

function calculateCableGland(values: Values): CalculationResult {
  const diameter = positiveNumber(values.diameter, "Cable outer diameter");
  const environment = str(values.environment);
  const armored = str(values.armored);
  const ranges = [
    { max: 6, thread: "M12" },
    { max: 10, thread: "M16" },
    { max: 14, thread: "M20" },
    { max: 18, thread: "M25" },
    { max: 25, thread: "M32" },
    { max: 32, thread: "M40" },
    { max: 38, thread: "M50" },
    { max: 44, thread: "M63" },
    { max: 55, thread: "M75" },
    { max: 68, thread: "M90" }
  ];
  const match = ranges.find((range) => diameter <= range.max);
  const thread = match?.thread ?? "Custom size";
  const note = environment === "hazardous"
    ? "Use certified hazardous-area cable glands."
    : environment === "outdoor"
      ? "Prefer weatherproof sealing and verify IP rating."
      : "Verify sealing range on the product datasheet.";

  return {
    primary: thread,
    severity: environment === "hazardous" ? "warning" : "ok",
    summary: `Starting thread suggestion for ${fmt(diameter)} mm cable OD. ${note}`,
    metrics: [
      { label: "Cable OD", value: `${fmt(diameter)} mm` },
      { label: "Cable construction", value: armored === "armored" ? "Armored cable" : "Unarmored cable" },
      { label: "Environment", value: readable(environment) },
      { label: "Selection basis", value: "Typical metric gland range" }
    ],
    recommendations: [
      "Confirm actual sealing range, thread length, panel hole size, and material.",
      armored === "armored" ? "Use a gland designed to terminate and bond the cable armor." : "Check strain relief and sealing requirements for the application."
    ]
  };
}

function calculateBusbar(values: Values): CalculationResult {
  const width = positiveNumber(values.width, "Busbar width");
  const thickness = positiveNumber(values.thickness, "Busbar thickness");
  const density = positiveNumber(values.density, "Current density");
  const derating = positiveNumber(values.derating, "Derating factor") / 100;
  const materialFactor = str(values.material) === "aluminum" ? 0.65 : 1;
  const area = width * thickness;
  const amps = area * density * materialFactor * derating;

  return {
    primary: fmt(amps),
    unit: "A",
    severity: "caution",
    summary: `Estimated current from ${fmt(area)} mm² cross-section and ${fmt(density)} A/mm² current-density reference.`,
    metrics: [
      { label: "Cross-section", value: `${fmt(area)} mm²` },
      { label: "Material factor", value: str(values.material) === "aluminum" ? "0.65 aluminum estimate" : "1.00 copper reference" },
      { label: "Derating", value: `${fmt(derating * 100)}%` },
      { label: "Estimated rating", value: `${fmt(amps)} A` }
    ],
    recommendations: [
      "Verify temperature rise inside the actual enclosure.",
      "Check spacing, supports, plating, short-circuit forces, and applicable standard testing."
    ]
  };
}

function currentFromKw(kw: number, voltage: number, pf: number, phase: string, efficiency: number) {
  const watts = kw * 1000;
  if (phase === "dc") return watts / (voltage * efficiency);
  if (phase === "single") return watts / (voltage * pf * efficiency);
  return watts / (Math.sqrt(3) * voltage * pf * efficiency);
}

function nextSize(value: number, sizes: number[]) {
  return sizes.find((size) => size >= value) ?? sizes[sizes.length - 1];
}

function circleArea(diameter: number) {
  return Math.PI * Math.pow(diameter / 2, 2);
}

function selectedCableOd(type: string, customOd: unknown, label: string) {
  if (type === "custom") return positiveNumber(customOd, label);
  const od = cableOutsideDiametersInch[type];
  if (!od) throw new Error(`${label} is not available for the selected cable.`);
  return od;
}

function findPassingConduit(type: string, currentSize: string, cableArea: number, limit: number) {
  const entries = Object.entries(conduitIdsInch[type] ?? {});
  const currentIndex = entries.findIndex(([size]) => size === currentSize);
  return entries.slice(Math.max(0, currentIndex + 1)).find(([, id]) => cableArea / circleArea(id) * 100 <= limit)?.[0];
}

function awgConductor(key: string) {
  const conductor = awgConductors.find((item) => item.key === key);
  if (!conductor) throw new Error("Select a valid AWG conductor.");
  return conductor;
}

function awgResistanceOhmPerFt(conductor: (typeof awgConductors)[number], material: string, tempC: number) {
  const materialFactor = material === "aluminum" ? 1.64 : material === "cca" ? 1.6 : 1;
  const tempFactor = 1 + 0.00393 * (tempC - 20);
  return conductor.copperOhmPer1000Ft * materialFactor * tempFactor / 1000;
}

function ampacityFor(conductor: (typeof awgConductors)[number], material: string) {
  if (material === "aluminum") return conductor.aluminumAmpacity;
  if (material === "cca") return conductor.copperAmpacity * 0.6;
  return conductor.copperAmpacity;
}

function conductorDerating(count: number) {
  if (count <= 3) return 1;
  if (count <= 6) return 0.8;
  if (count <= 9) return 0.7;
  if (count <= 20) return 0.5;
  if (count <= 30) return 0.45;
  if (count <= 40) return 0.4;
  return 0.35;
}

function transformerRatings(series: string, phase: string) {
  if (series === "iec") return [50, 100, 160, 250, 315, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];
  if (phase === "single") return [5, 10, 15, 25, 37.5, 50, 75, 100, 167, 250, 333, 500];
  return [15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3750, 5000, 7500, 10000];
}

function positiveNumber(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
  return number;
}

function positiveInteger(value: unknown, label: string) {
  const number = positiveNumber(value, label);
  if (!Number.isInteger(number)) {
    throw new Error(`${label} must be a whole number.`);
  }
  return number;
}

function nonNegativeNumber(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${label} must be zero or greater.`);
  }
  return number;
}

function finiteNumber(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a valid number.`);
  }
  return number;
}

function str(value: unknown) {
  return String(value ?? "");
}

function fmt(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function readable(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
