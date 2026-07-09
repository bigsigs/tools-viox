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

export function calculateTool(slug: string, values: Values): CalculationResult {
  switch (slug) {
    case "spd-calculator":
      return calculateSpd(values);
    case "voltage-drop-calculator":
      return calculateVoltageDrop(values);
    case "cable-size-calculator":
      return calculateCableSize(values);
    case "circuit-breaker-size-calculator":
      return calculateBreakerSize(values);
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
  const current = positiveNumber(values.current, "Load current");
  const voltage = positiveNumber(values.voltage, "System voltage");
  const length = positiveNumber(values.length, "Cable length");
  const area = positiveNumber(values.area, "Conductor size");
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
      { label: "Resistivity used", value: `${rho} ohm mm2/m` },
      { label: "Formula basis", value: phase === "three" ? "Three-phase approximation" : "Two-wire path approximation" }
    ],
    recommendations: [
      percent > 5 ? "Consider a larger conductor, shorter route, or lower load current." : "Run cable ampacity and protection checks next.",
      "Check local voltage-drop limits for the application and market."
    ]
  };
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
    unit: "mm2",
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

function calculateBreakerSize(values: Values): CalculationResult {
  const phase = str(values.phase);
  const kw = positiveNumber(values.power, "Load power");
  const voltage = positiveNumber(values.voltage, "System voltage");
  const pf = phase === "dc" ? 1 : positiveNumber(values.pf, "Power factor");
  const factor = positiveNumber(values.factor, "Sizing factor") / 100;
  const loadCurrent = currentFromKw(kw, voltage, pf, phase, 1);
  const minimum = loadCurrent * factor;
  const recommended = nextSize(minimum, breakerSizes);

  return {
    primary: `${recommended}`,
    unit: "A",
    severity: recommended >= 630 ? "caution" : "ok",
    summary: `Calculated load current is ${fmt(loadCurrent)} A. Minimum breaker rating after sizing factor is ${fmt(minimum)} A.`,
    metrics: [
      { label: "Load current", value: `${fmt(loadCurrent)} A` },
      { label: "Sizing factor", value: `${fmt(factor * 100)}%` },
      { label: "Minimum rating", value: `${fmt(minimum)} A` },
      { label: "Rounded standard rating", value: `${recommended} A` }
    ],
    recommendations: [
      "Verify trip curve, breaking capacity, cable ampacity, and selectivity.",
      "For motors or transformers, check inrush and coordination before selecting the final device."
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
  const kva = phase === "dc" ? kw : kw / pf;

  return {
    primary: fmt(amps),
    unit: "A",
    severity: "ok",
    summary: `${fmt(kw)} kW equals approximately ${fmt(kva)} kVA and ${fmt(amps)} A for the selected system.`,
    metrics: [
      { label: "Real power", value: `${fmt(kw)} kW` },
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
  const kva = mode === "kva" ? power : power / pf;

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
  const count = positiveNumber(values.count, "Number of chargers");
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
    summary: `Estimated current from ${fmt(area)} mm2 cross-section and ${fmt(density)} A/mm2 current-density reference.`,
    metrics: [
      { label: "Cross-section", value: `${fmt(area)} mm2` },
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

function positiveNumber(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} must be greater than zero.`);
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
