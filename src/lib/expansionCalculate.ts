import type { CalculationResult } from "./types";
import { calculateArcFlash } from "./arcFlash";

type Values = Record<string, string | number>;
const breakerSizes = [1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];
const contactorSizes = [6, 9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630, 800];
const fuseSizes = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

export function calculateExpansionTool(slug: string, v: Values): CalculationResult {
  switch (slug) {
    case "ohms-law-calculator": return ohms(v);
    case "watts-amps-volts-calculator": return wattsAmpsVolts(v);
    case "ev-charging-time-cost-calculator": return evCharge(v);
    case "battery-charging-time-calculator": return batteryCharge(v);
    case "resistor-series-parallel-calculator": return resistors(v);
    case "electrical-unit-converter": return units(v);
    case "contactor-selection-calculator": return contactor(v);
    case "breaker-selectivity-calculator": return selectivity(v);
    case "lightning-risk-assessment-calculator": return lightning(v);
    case "enclosure-temperature-rise-calculator": return enclosure(v);
    case "panel-heat-loss-calculator": return panelHeat(v);
    case "pv-string-sizing-calculator": return pvString(v);
    case "off-grid-solar-system-calculator": return offGrid(v);
    case "spd-backup-fuse-calculator": return spdBackup(v);
    case "earth-fault-loop-impedance-calculator": return earthLoop(v);
    case "cable-derating-factor-calculator": return derating(v);
    case "maximum-demand-calculator": return maximumDemand(v);
    case "protective-conductor-size-calculator": return protectiveConductor(v);
    case "cable-short-circuit-thermal-calculator": return cableThermal(v);
    case "motor-starting-voltage-drop-calculator": return motorStart(v);
    case "vfd-sizing-protection-calculator": return vfdSizing(v);
    case "arc-flash-incident-energy-calculator": return arcFlash(v);
    default: throw new Error("Unknown calculator");
  }
}

function ohms(v: Values): CalculationResult {
  const mode = s(v.solveFrom);
  if (mode.length !== 2) throw new Error("Select two known quantities to calculate the other two.");
  const fields: Record<string, [string | number, string]> = {
    v: [v.voltage, "Voltage"], i: [v.current, "Current"], r: [v.resistance, "Resistance"], p: [v.power, "Power"]
  };
  const inputBySymbol = Object.fromEntries([...mode].map((symbol) => [symbol, pos(fields[symbol][0], fields[symbol][1])])) as Record<string, number>;
  const a = inputBySymbol[mode[0]], b = inputBySymbol[mode[1]];
  let V = 0, I = 0, R = 0, P = 0;
  if (mode === "vi") [V, I] = [a, b];
  if (mode === "vr") [V, R] = [a, b];
  if (mode === "vp") [V, P] = [a, b];
  if (mode === "ir") [I, R] = [a, b];
  if (mode === "ip") [I, P] = [a, b];
  if (mode === "rp") [R, P] = [a, b];
  if (mode === "vi") { R = V / I; P = V * I; }
  if (mode === "vr") { I = V / R; P = V * I; }
  if (mode === "vp") { I = P / V; R = V / I; }
  if (mode === "ir") { V = I * R; P = V * I; }
  if (mode === "ip") { V = P / I; R = V / I; }
  if (mode === "rp") { I = Math.sqrt(P / R); V = I * R; }
  const quantities: Record<string, string> = { v: `${f(V)} V`, i: `${f(I)} A`, r: `${f(R)} Ω`, p: `${f(P)} W` };
  const calculated = ["v", "i", "r", "p"].filter((symbol) => !mode.includes(symbol));
  return result(calculated.map((symbol) => quantities[symbol]).join(" · "), "ok", `Calculated from the selected ${mode.toUpperCase().split("").join(" and ")} values.`, [["Voltage", quantities.v], ["Current", quantities.i], ["Resistance", quantities.r], ["Power", quantities.p]], ["Check component voltage, current, and power ratings."]);
}

function phaseFactor(phase: string, pf: number) { return phase === "dc" ? 1 : phase === "three" ? Math.sqrt(3) * pf : pf; }
function wattsAmpsVolts(v: Values): CalculationResult {
  const mode = s(v.mode), phase = s(v.phase), pf = phase === "dc" ? 1 : bounded(v.powerFactor, "Power factor", 0.01, 1);
  let P = pos(v.power, "Power"), I = pos(v.current, "Current"), V = pos(v.voltage, "Voltage"); const k = phaseFactor(phase, pf);
  if (mode === "amps") I = P / (V * k); else if (mode === "watts") P = V * I * k; else V = P / (I * k);
  const primary = mode === "amps" ? `${f(I)} A` : mode === "watts" ? `${f(P)} W` : `${f(V)} V`;
  return result(primary, "ok", `${readable(phase)} conversion using the appropriate phase factor.`, [["Power", `${f(P)} W`], ["Current", `${f(I)} A`], ["Voltage", `${f(V)} V`], ["Power factor", f(pf)]], ["Use line-to-line voltage for three-phase calculations."]);
}

function evCharge(v: Values): CalculationResult {
  const cap = pos(v.capacity, "Battery capacity"), start = bounded(v.startSoc, "Starting SOC", 0, 100), target = bounded(v.targetSoc, "Target SOC", 0, 100);
  if (target <= start) throw new Error("Target SOC must be greater than starting SOC.");
  const power = pos(v.chargerPower, "Charging power"), eff = bounded(v.efficiency, "Efficiency", 1, 100) / 100, tariff = nonneg(v.tariff, "Electricity price");
  const delivered = cap * (target - start) / 100, wall = delivered / eff, time = wall / power, cost = wall * tariff;
  return result(`${f(time)} h`, "ok", `Charging from ${f(start)}% to ${f(target)}% requires about ${f(wall)} kWh from the supply.`, [["Battery energy added", `${f(delivered)} kWh`], ["Wall energy", `${f(wall)} kWh`], ["Estimated cost", `${f(cost)}`], ["Time", duration(time)]], ["Real charging power may taper near high SOC and vary with temperature."]);
}

function batteryCharge(v: Values): CalculationResult {
  const start = bounded(v.startSoc, "Starting SOC", 0, 100), target = bounded(v.targetSoc, "Target SOC", 0, 100), eff = bounded(v.efficiency, "Efficiency", 1, 100) / 100;
  if (target <= start) throw new Error("Target SOC must be greater than starting SOC."); const fraction = (target - start) / 100;
  let required: number, rate: number, unit: string;
  if (s(v.basis) === "ah") { required = pos(v.capacityAh, "Battery capacity") * fraction; rate = pos(v.current, "Charging current") * eff; unit = "Ah"; }
  else { required = pos(v.capacityKwh, "Battery energy") * fraction; rate = pos(v.power, "Charging power") * eff; unit = "kWh"; }
  const time = required / rate;
  return result(`${f(time)} h`, "ok", `The idealized ${f(target - start)}% SOC increase takes ${duration(time)} at the entered average rate.`, [["Required capacity", `${f(required)} ${unit}`], ["Effective charging rate", `${f(rate)} ${unit}/h`], ["Efficiency", `${f(eff * 100)}%`]], ["Allow additional time for current tapering, balancing, and charger control stages."]);
}

function resistors(v: Values): CalculationResult {
  const rs = [v.r1, v.r2, v.r3, v.r4].map((x, i) => pos(x, `R${i + 1}`)), voltage = pos(v.supplyVoltage, "Supply voltage"), parallel = s(v.connection) === "parallel";
  const req = parallel ? 1 / rs.reduce((sum, r) => sum + 1 / r, 0) : rs.reduce((sum, r) => sum + r, 0), totalI = voltage / req;
  const distribution = rs.map((r, i) => parallel ? `I${i + 1} ${f(voltage / r)} A` : `V${i + 1} ${f(totalI * r)} V`).join("; ");
  return result(`${f(req)} Ω`, "ok", `${parallel ? "Parallel" : "Series"} equivalent resistance for four entered resistors.`, [["Total current", `${f(totalI)} A`], [parallel ? "Branch currents" : "Voltage division", distribution], ["Total power", `${f(voltage * totalI)} W`]], ["Verify the power dissipated by every resistor against its rating."]);
}

const powerUnits: Record<string, number> = { w: 1, kw: 1e3, mw: 1e6, hp: 745.699872, btuh: 0.2930710702 };
const energyUnits: Record<string, number> = { j: 1, kj: 1e3, wh: 3600, kwh: 3.6e6, mwh: 3.6e9 };
function units(v: Values): CalculationResult {
  const value = nonneg(v.value, "Value"), from = s(v.fromUnit), to = s(v.toUnit), table = s(v.quantity) === "power" ? powerUnits : energyUnits;
  if (!table[from] || !table[to]) throw new Error(`Choose two ${s(v.quantity)} units.`);
  const converted = value * table[from] / table[to];
  const metrics: [string, string][] = [["Base-unit value", `${f(value * table[from])} ${s(v.quantity) === "power" ? "W" : "J"}`], ["Conversion factor", f(table[from] / table[to])]];
  if (s(v.quantity) === "power") {
    const watts = value * table[from], voltage = pos(v.voltage, "Voltage"), pf = bounded(v.powerFactor, "Power factor", 0.01, 1);
    metrics.push(["Single-phase current", `${f(watts / (voltage * pf))} A`], ["Three-phase current", `${f(watts / (Math.sqrt(3) * voltage * pf))} A`]);
  }
  return result(`${f(converted)} ${toLabel(to)}`, "ok", `${f(value)} ${toLabel(from)} equals ${f(converted)} ${toLabel(to)}.`, metrics, ["Do not convert power units to energy units without a duration."]);
}

function contactor(v: Values): CalculationResult {
  const power = pos(v.power, "Load power") * 1000, voltage = pos(v.voltage, "Voltage"), pf = bounded(v.powerFactor, "Power factor", 0.01, 1), eff = bounded(v.efficiency, "Efficiency", 1, 100) / 100;
  const type = s(v.loadType), current = type === "resistive" ? power / (Math.sqrt(3) * voltage) : power / (Math.sqrt(3) * voltage * pf * eff), operations = nonneg(v.operations, "Operations per hour");
  const category = type === "resistive" ? "AC-1" : type === "motor" ? "AC-3" : "Confirm category"; const margin = operations > 120 ? 1.25 : operations > 60 ? 1.15 : 1.1; const selected = next(current * margin, contactorSizes);
  return result(`${selected} A ${category}`, operations > 120 || type === "mixed" ? "caution" : "ok", `Estimated load current is ${f(current)} A and the preliminary utilization-category selection current is ${f(current * margin)} A.`, [["Load current", `${f(current)} A`], ["Duty margin", `${f(margin * 100)}%`], ["Operations per hour", f(operations)], ["Utilization category", category]], ["Verify the exact motor-kW table at voltage, AC duty, electrical life, and coordination type."]);
}

const curveBands: Record<string, [number, number]> = { b: [3, 5], c: [5, 10], d: [10, 20] };
function selectivity(v: Values): CalculationResult {
  const ur = pos(v.upstreamRating, "Upstream rating"), dr = pos(v.downstreamRating, "Downstream rating"), ub = pos(v.upstreamBreaking, "Upstream breaking capacity"), db = pos(v.downstreamBreaking, "Downstream breaking capacity"), fault = pos(v.faultCurrent, "Fault current");
  const uBand = curveBands[s(v.upstreamCurve)], dBand = curveBands[s(v.downstreamCurve)]; const capacityPass = ub >= fault && db >= fault; const ratio = ur / dr; const magneticSeparation = ur * uBand[0] > dr * dBand[1];
  const screened = capacityPass && ratio >= 1.6 && magneticSeparation;
  return result(screened ? "Promising screening" : "Coordination table required", screened ? "caution" : "warning", `Rating ratio is ${f(ratio)}:1; generic magnetic bands ${magneticSeparation ? "do not overlap" : "can overlap"}.`, [["Breaking-capacity check", capacityPass ? "Passes entered fault current" : "Fails entered fault current"], ["Upstream magnetic band", `${f(ur * uBand[0])}-${f(ur * uBand[1])} A`], ["Downstream magnetic band", `${f(dr * dBand[0])}-${f(dr * dBand[1])} A`], ["Rating ratio", f(ratio)]], ["Only the exact manufacturer selectivity/cascading table can confirm coordination."]);
}

function lightning(v: Values): CalculationResult {
  const L = pos(v.length, "Length"), W = pos(v.width, "Width"), H = pos(v.height, "Height"), td = nonneg(v.thunderDays, "Thunderstorm days");
  const ae = L * W + 6 * H * (L + W) + 9 * Math.PI * H * H, ng = 0.04 * Math.pow(td, 1.25); const loc = s(v.location) === "hill" ? 2 : s(v.location) === "isolated" ? 1.5 : 0.5; const line = s(v.powerLine) === "overhead" ? 1.6 : s(v.powerLine) === "mixed" ? 1.3 : 0.7; const consequence = s(v.consequence) === "critical" ? 1.5 : 1;
  const annual = ng * ae * 1e-6 * loc, score = annual * line * consequence; const level = score >= 0.02 ? "High exposure" : score >= 0.005 ? "Elevated exposure" : "Lower exposure";
  const spdDirection = score >= 0.02 || s(v.powerLine) === "overhead" || s(v.location) === "hill" ? "Screen Type 1+2 at origin" : score >= 0.005 ? "Screen Type 2; assess Type 1 need" : "Type 2 starting screen";
  return result(level, score >= 0.02 ? "warning" : score >= 0.005 ? "caution" : "ok", `Simplified annual direct-strike exposure is ${f(annual)} before line and consequence weighting.`, [["Equivalent collection area", `${f(ae)} m²`], ["Estimated ground flash density", `${f(ng)} /km²/year`], ["Weighted screening score", f(score)], ["SPD planning direction", spdDirection]], [score >= 0.005 ? "Complete a formal lightning-risk review and screen Type 1 or Type 1+2 SPD requirements." : "Still assess incoming-line surges and sensitive-equipment SPD requirements."]);
}

function enclosure(v: Values): CalculationResult {
  const W = pos(v.width, "Width") / 1000, H = pos(v.height, "Height") / 1000, D = pos(v.depth, "Depth") / 1000, heat = pos(v.heat, "Heat loss"), ambient = num(v.ambient, "Ambient"), airflow = nonneg(v.airflow, "Airflow");
  const totalArea = 2 * (W * H + W * D + H * D), factor = s(v.mounting) === "free" ? 0.9 : s(v.mounting) === "wall" ? 0.7 : 0.5, effectiveArea = totalArea * factor; const natural = heat / (5.5 * effectiveArea), forced = airflow > 0 ? heat / (0.33 * airflow) : Infinity; const rise = Math.min(natural, forced); const internal = ambient + rise;
  const cooling = internal > 55 ? "Active cooling review" : internal > 45 ? "Forced ventilation review" : "Natural cooling may be adequate";
  return result(`${f(internal)} °C`, internal > 50 ? "warning" : internal > 40 ? "caution" : "ok", `Estimated average internal temperature is ambient ${f(ambient)}°C plus ${f(rise)}°C rise.`, [["Effective surface area", `${f(effectiveArea)} m²`], ["Natural-cooling rise", `${f(natural)}°C`], ["Forced-air rise", airflow > 0 ? `${f(forced)}°C` : "Not applied"], ["Cooling direction", cooling], ["Internal heat", `${f(heat)} W`]], [internal > 40 ? "Review fan, heat-exchanger, or air-conditioning capacity and component derating." : "Check local hot spots and component-specific temperature limits."]);
}

function panelHeat(v: Values): CalculationResult {
  const entries = ["breakers", "contactors", "drives", "powerSupplies", "transformers", "other"].map(key => nonneg(v[key], key)); const connected = entries.reduce((a, b) => a + b, 0), diversity = bounded(v.diversity, "Simultaneous factor", 0, 100) / 100, heat = connected * diversity;
  return result(`${f(heat)} W`, "caution", `The simultaneous cabinet heat load is ${f(heat)} W from ${f(connected)} W entered losses.`, [["Entered component losses", `${f(connected)} W`], ["Simultaneous factor", `${f(diversity * 100)}%`], ["Drive share", `${f(entries[2] / connected * 100)}%`]], ["Use this heat result as the input to the enclosure temperature-rise calculator."]);
}

function pvString(v: Values): CalculationResult {
  const voc = pos(v.voc, "Voc"), vmpp = pos(v.vmpp, "Vmpp"), cvoc = num(v.vocCoeff, "Voc coefficient") / 100, cvmpp = num(v.vmppCoeff, "Vmpp coefficient") / 100, tmin = num(v.minTemp, "Minimum temperature"), tmax = num(v.maxTemp, "Maximum temperature");
  const coldVoc = voc * (1 + cvoc * (tmin - 25)), hotVmpp = vmpp * (1 + cvmpp * (tmax - 25)), coldVmpp = vmpp * (1 + cvmpp * (tmin - 25)); if (coldVoc <= 0 || hotVmpp <= 0) throw new Error("Temperature-corrected module voltage must be positive.");
  const maxAbsolute = Math.floor(pos(v.maxDcVoltage, "Maximum DC voltage") / coldVoc), maxMppt = Math.floor(pos(v.mpptMax, "MPPT maximum") / coldVmpp), minMppt = Math.ceil(pos(v.mpptMin, "MPPT minimum") / hotVmpp), max = Math.min(maxAbsolute, maxMppt);
  return result(minMppt <= max ? `${minMppt}-${max} modules` : "No valid string range", minMppt <= max ? "ok" : "warning", `Cold Voc limits the absolute series count to ${maxAbsolute}; the temperature-corrected MPPT window gives ${minMppt}-${maxMppt}.`, [["Cold module Voc", `${f(coldVoc)} V`], ["Hot module Vmpp", `${f(hotVmpp)} V`], ["Cold module Vmpp", `${f(coldVmpp)} V`], ["Recommended range", minMppt <= max ? `${minMppt}-${max}` : "None"]], ["Check inverter startup voltage, per-MPPT current, module tolerances, bifacial gain, and exact cell-temperature assumptions."]);
}

function offGrid(v: Values): CalculationResult {
  const daily = pos(v.dailyEnergy, "Daily energy"), sun = pos(v.sunHours, "Sun hours"), sysEff = bounded(v.systemEfficiency, "System efficiency", 1, 100) / 100, days = pos(v.autonomy, "Autonomy"), dod = bounded(v.dod, "Depth of discharge", 1, 100) / 100, battEff = bounded(v.batteryEfficiency, "Battery efficiency", 1, 100) / 100, voltage = pos(v.systemVoltage, "System voltage"), peak = pos(v.peakLoad, "Peak load"), surge = pos(v.surgeFactor, "Surge factor") / 100;
  const pv = daily / (sun * sysEff), modulePower = pos(v.modulePower, "Module power"), modules = Math.ceil(pv * 1000 / modulePower), battery = daily * days / (dod * battEff), ah = battery * 1000 / voltage, inverter = peak * surge;
  return result(`${f(pv)} kWp PV`, "caution", `Preliminary system requires ${f(pv)} kWp PV, ${modules} entered-size modules, ${f(battery)} kWh nominal battery, and at least ${f(inverter)} kW inverter capacity.`, [["PV module quantity", `${modules} × ${f(modulePower)} W`], ["Nominal battery", `${f(battery)} kWh`], ["Battery capacity", `${f(ah)} Ah at ${f(voltage)} V`], ["Inverter starting size", `${f(inverter)} kW`], ["Autonomy", `${f(days)} days`]], ["Run a seasonal hourly energy simulation and check surge loads before procurement."]);
}

function spdBackup(v: Values): CalculationResult {
  const max = pos(v.maxBackup, "Maximum backup protection"), upstream = pos(v.upstreamProtection, "Upstream protection"), fault = pos(v.faultCurrent, "Fault current"), breaking = pos(v.deviceBreaking, "Breaking capacity"); const needs = upstream > max; const selected = previous(max, fuseSizes); const capacity = breaking >= fault;
  return result(!capacity ? "Breaking capacity insufficient" : needs ? `${selected} A ${s(v.preferred) === "fuse" ? "gG fuse" : "approved breaker"}` : "Existing upstream device may suffice", !capacity ? "warning" : "caution", needs ? `Existing ${f(upstream)} A protection exceeds the SPD's ${f(max)} A maximum backup value.` : `Existing ${f(upstream)} A protection does not exceed the entered SPD maximum backup value.`, [["SPD maximum backup", `${f(max)} A`], ["Prospective fault current", `${f(fault)} kA`], ["Candidate breaking capacity", `${f(breaking)} kA`], ["External backup needed", needs ? "Yes, subject to datasheet" : "Not solely by rating"]], ["Use only the backup device type and rating approved in the exact SPD datasheet."]);
}

function earthLoop(v: Values): CalculationResult {
  const u0 = pos(v.voltageToEarth, "Voltage to earth"), rating = pos(v.deviceRating, "Device rating"), multiple = pos(v.instantMultiple, "Operating-current multiple"), ze = nonneg(v.ze, "Ze"), r1 = nonneg(v.r1, "R1"), r2 = nonneg(v.r2, "R2"), tf = pos(v.temperatureFactor, "Temperature factor"), table = pos(v.tabulatedMaxZs, "Tabulated maximum Zs");
  const actual = ze + tf * (r1 + r2), formulaMax = u0 / (rating * multiple), governing = Math.min(formulaMax, table), pass = actual <= governing, fault = u0 / actual;
  return result(pass ? "Pass" : "Fail", pass ? "ok" : "warning", `Calculated Zs is ${f(actual)} Ω versus the governing entered/formula limit of ${f(governing)} Ω.`, [["Protective device", readable(s(v.deviceType))], ["Required disconnection time", `${f(pos(v.disconnectionTime, "Disconnection time"))} s`], ["Calculated Zs", `${f(actual)} Ω`], ["Formula maximum U0/Ia", `${f(formulaMax)} Ω`], ["Entered tabulated maximum", `${f(table)} Ω`], ["Estimated earth-fault current", `${f(fault)} A`]], ["Confirm the required disconnection time and current standard table for the exact protective device."]);
}

function derating(v: Values): CalculationResult {
  const base = pos(v.baseAmpacity, "Reference ampacity"), ambient = num(v.ambient, "Ambient"), pvc = s(v.insulation) === "pvc", maxTemp = pvc ? 70 : 90, ref = 30; if (ambient >= maxTemp) throw new Error("Ambient temperature must be below the conductor temperature rating.");
  const ca = Math.min(1, Math.sqrt((maxTemp - ambient) / (maxTemp - ref))), n = Math.max(1, Math.round(pos(v.groupedCircuits, "Grouped circuits"))), cg = n === 1 ? 1 : n === 2 ? 0.8 : n === 3 ? 0.7 : n <= 6 ? 0.57 : n <= 9 ? 0.5 : 0.45; const installation = s(v.installation), ci = installation === "insulated" ? 0.5 : installation === "enclosed" ? 0.9 : 1; const cs = installation === "buried" ? Math.min(1.1, Math.sqrt(2.5 / pos(v.soilResistivity, "Soil resistivity"))) : 1; const total = ca * cg * ci * cs, corrected = base * total;
  return result(`${f(corrected)} A`, total < 0.6 ? "warning" : "caution", `Combined typical screening factor is ${f(total)}, reducing ${f(base)} A reference ampacity to ${f(corrected)} A.`, [["Ambient factor Ca", f(ca)], ["Grouping factor Cg", f(cg)], ["Installation factor Ci", f(ci)], ["Soil factor Cs", f(cs)]], ["Replace typical factors with the exact values from the adopted cable standard and installation method."]);
}

function maximumDemand(v: Values): CalculationResult {
  const groups: [string, string][] = [["lighting", "lightingFactor"], ["sockets", "socketFactor"], ["hvac", "hvacFactor"], ["motors", "motorFactor"], ["evOther", "evFactor"]]; const connected = groups.reduce((sum, [load]) => sum + nonneg(v[load], load), 0); const diversified = groups.reduce((sum, [load, factor]) => sum + nonneg(v[load], load) * bounded(v[factor], factor, 0, 100) / 100, 0); const demand = diversified * bounded(v.simultaneity, "Simultaneity", 0, 100) / 100; const voltage = pos(v.voltage, "Voltage"), pf = bounded(v.powerFactor, "Power factor", 0.01, 1), current = demand * 1000 / (Math.sqrt(3) * voltage * pf), breaker = next(current * 1.1, breakerSizes);
  return result(`${f(demand)} kW`, "caution", `Connected load ${f(connected)} kW becomes ${f(demand)} kW maximum demand after category and simultaneity factors.`, [["Demand current", `${f(current)} A`], ["Preliminary incomer", `${breaker} A`], ["Connected load", `${f(connected)} kW`], ["Overall diversity", `${f(demand / connected * 100)}%`]], ["Confirm category demand factors with measured data, the client brief, and applicable local guidance."]);
}

function protectiveConductor(v: Values): CalculationResult {
  const current = pos(v.faultCurrent, "Fault current") * 1000, time = pos(v.clearingTime, "Clearing time"), k = pos(v.k, "k value"), installed = pos(v.installedSize, "Installed size"), required = current * Math.sqrt(time) / k, pass = installed >= required;
  return result(pass ? "Pass" : "Increase PE size", pass ? "ok" : "warning", `Adiabatic minimum is ${f(required)} mm²; entered installed PE is ${f(installed)} mm².`, [["Required area", `${f(required)} mm²`], ["Installed area", `${f(installed)} mm²`], ["Fault I²t", `${f(current * current * time)} A²s`], ["Conductor capacity k²S²", `${f(k * k * installed * installed)} A²s`]], ["Select the next permitted standard conductor size and check mechanical minimums and terminals."]);
}

function cableThermal(v: Values): CalculationResult {
  const area = pos(v.area, "Area"), current = pos(v.faultCurrent, "Fault current") * 1000, time = pos(v.duration, "Duration"), k = pos(v.k, "k value"), required = current * Math.sqrt(time) / k, maxTime = Math.pow(k * area / current, 2), pass = area >= required;
  return result(pass ? "Pass" : "Fail", pass ? "ok" : "warning", `${f(area)} mm² conductor ${pass ? "meets" : "does not meet"} the ${f(required)} mm² adiabatic minimum.`, [["Required area", `${f(required)} mm²`], ["Maximum withstand time", `${f(maxTime)} s`], ["Fault I²t", `${f(current * current * time)} A²s`], ["Cable k²S²", `${f(k * k * area * area)} A²s`]], ["Confirm the k value, protective-device clearing time, parallel conductor sharing, and non-adiabatic limits."]);
}

function motorStart(v: Values): CalculationResult {
  const power = pos(v.motorPower, "Motor power") * 1000, voltage = pos(v.voltage, "Voltage"), eff = bounded(v.efficiency, "Efficiency", 1, 100) / 100, pf = bounded(v.powerFactor, "Power factor", 0.01, 1), flc = power / (Math.sqrt(3) * voltage * eff * pf), dol = pos(v.dolMultiple, "DOL multiple"); const method = s(v.method), factor = method === "star-delta" ? 1 / 3 : method === "soft" ? 0.5 : method === "vfd" ? 0.2 : 1, start = flc * dol * factor;
  const kva = pos(v.transformerKva, "Transformer rating") * 1000, tz = pos(v.transformerZ, "Transformer impedance") / 100, baseZ = voltage * voltage / kva, transformerZ = baseZ * tz, feederZ = nonneg(v.feederZ, "Feeder impedance"), phaseV = voltage / Math.sqrt(3), drop = start * (transformerZ + feederZ), percent = drop / phaseV * 100, remaining = Math.max(0, 100 - percent);
  return result(`${f(percent)}% dip`, percent > 15 ? "warning" : percent > 10 ? "caution" : "ok", `${readable(method)} starting current is approximately ${f(start)} A and leaves ${f(remaining)}% estimated bus voltage.`, [["Motor full-load current", `${f(flc)} A`], ["Starting current", `${f(start)} A`], ["Transformer impedance", `${f(transformerZ)} Ω/phase`], ["Total source-path impedance", `${f(transformerZ + feederZ)} Ω/phase`]], ["Use a complex-impedance and dynamic motor-start study where voltage-dip limits are critical."]);
}

const vfdKwSizes = [0.4, 0.75, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 185, 200, 220, 250, 280, 315, 355, 400, 500, 560, 630];
function vfdSizing(v: Values): CalculationResult {
  const power = pos(v.motorPower, "Motor power"), motorVoltage = pos(v.motorVoltage, "Motor voltage"), nameplate = pos(v.motorCurrent, "Motor nameplate current"), efficiency = bounded(v.motorEfficiency, "Motor efficiency", 1, 100) / 100, pf = bounded(v.motorPowerFactor, "Motor power factor", 0.01, 1);
  const calculated = power * 1000 / (Math.sqrt(3) * motorVoltage * efficiency * pf), baseCurrent = Math.max(nameplate, calculated), duty = s(v.loadType), dutyFactor = duty === "heavy" ? 1.2 : duty === "constant" ? 1.1 : 1, margin = 1 + bounded(v.designMargin, "Design margin", 0, 50) / 100;
  const ambient = num(v.ambient, "Ambient temperature"), altitude = nonneg(v.altitude, "Altitude"), tempFactor = Math.max(0.7, 1 - Math.max(0, ambient - 40) * 0.01), altitudeFactor = Math.max(0.7, 1 - Math.max(0, altitude - 1000) / 100 * 0.01), environmental = tempFactor * altitudeFactor;
  const requiredCurrent = baseCurrent * dutyFactor * margin / environmental, selectedKw = next(power * dutyFactor * margin / environmental, vfdKwSizes), overload = bounded(v.requiredOverload, "Required overload", 100, 250), supply = pos(v.supplyVoltage, "Supply voltage"), vfdEfficiency = bounded(v.vfdEfficiency, "VFD efficiency", 80, 100) / 100;
  const inputCurrent = power * 1000 / (Math.sqrt(3) * supply * efficiency * vfdEfficiency * Math.max(pf, 0.85)), breaker = next(inputCurrent * 1.25, breakerSizes), bypass = next(baseCurrent * 1.1, contactorSizes), heat = power * 1000 / efficiency * (1 / vfdEfficiency - 1), cable = nonneg(v.motorCableLength, "Motor cable length");
  const filter = cable > 100 ? "Sine-wave or dv/dt filter review" : cable > 50 ? "Output reactor / dv/dt review" : "Check VFD manual cable limit"; const braking = s(v.braking) === "yes" ? "Braking resistor or regenerative unit study" : "No special braking request"; const capacity = pos(v.candidateBreaking, "Breaking capacity") >= pos(v.faultCurrent, "Fault current");
  return result(`≥ ${f(requiredCurrent)} A output`, !capacity || duty === "heavy" ? "warning" : environmental < 0.9 ? "caution" : "ok", `Select a ${readable(duty)}-duty VFD whose continuous output rating is at least ${f(requiredCurrent)} A and whose overload curve meets ${f(overload)}% for the required manufacturer-specified duration.`, [["Calculated motor current", `${f(calculated)} A`], ["Current sizing basis", `${f(baseCurrent)} A`], ["Starting VFD power class", `${f(selectedKw)} kW`], ["Environmental factor", f(environmental)], ["Estimated VFD input current", `${f(inputCurrent)} A`], ["Input protection reference", `${breaker} A; exact VFD manual governs`], ["Breaking-capacity check", capacity ? "Passes entered fault current" : "Insufficient"], ["Bypass contactor reference", s(v.bypass) === "yes" ? `${bypass} A AC-3` : "No bypass selected"], ["Motor-cable treatment", filter], ["Braking direction", braking], ["Estimated VFD panel heat", `${f(heat)} W`]], ["Confirm the exact VFD normal/heavy-duty current table, overload duration, input fuse or breaker, SCCR, and environmental derating.", "Check RCD type, EMC filter leakage, SPD coordination, earthing, shield termination, output filter, braking resistor, and enclosure cooling against the VFD manual.", `Use ${f(heat)} W as a starting input to the enclosure temperature-rise calculator.`]);
}

function arcFlash(v: Values): CalculationResult {
  const output = calculateArcFlash({ voltage: pos(v.voltage, "Voltage"), boltedFaultCurrent: pos(v.faultCurrent, "Fault current"), electrodeConfiguration: s(v.electrode) as "VCB" | "VCBB" | "HCB" | "VOA" | "HOA", conductorGap: pos(v.gap, "Conductor gap"), workingDistance: pos(v.workingDistance, "Working distance"), enclosureWidth: pos(v.width, "Enclosure width"), enclosureHeight: pos(v.height, "Enclosure height"), enclosureDepth: pos(v.depth, "Enclosure depth"), normalClearingTime: pos(v.normalTime, "Normal clearing time"), reducedClearingTime: pos(v.reducedTime, "Reduced-current clearing time") });
  const threshold = output.worstEnergyCalCm2 < 1.2 ? "Below 1.2 cal/cm² at entered distance" : "At or above 1.2 cal/cm² at entered distance";
  return result(`${f(output.worstEnergyCalCm2)} cal/cm²`, output.worstEnergyCalCm2 >= 40 ? "warning" : output.worstEnergyCalCm2 >= 1.2 ? "caution" : "ok", `The ${output.worstCase}-current clearing-time scenario produces the higher predicted incident energy. This is an engineering calculation result, not a PPE category or permission for energized work.`, [["Normal arcing current", `${f(output.normal.arcingCurrent)} kA`], ["Reduced arcing current", `${f(output.reduced.arcingCurrent)} kA`], ["Normal-scenario energy", `${f(output.normal.incidentEnergyCalCm2)} cal/cm²`], ["Reduced-scenario energy", `${f(output.reduced.incidentEnergyCalCm2)} cal/cm²`], ["Worst-case boundary", `${f(output.worstBoundaryMm)} mm`], ["Thermal threshold status", threshold], ["Arcing-current variation VarCf", f(output.variationFactor)], ["Enclosure correction factor", f(output.enclosureCorrectionFactor)], ["Enclosure classification", output.enclosureType]], ["Read the exact upstream protective-device time-current curve at both displayed arcing currents and include relay plus breaker clearing time.", "Have a qualified engineer verify the short-circuit model, equipment geometry, electrode configuration, working distance, maintenance condition, and complete arc-flash study.", "Do not infer an NFPA 70E PPE category or energized-work authorization directly from this result."]);
}

function result(primary: string, severity: "ok" | "caution" | "warning", summary: string, metrics: [string, string][], recommendations: string[]): CalculationResult { return { primary, severity, summary, metrics: metrics.map(([label, value]) => ({ label, value })), recommendations }; }
function pos(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be greater than zero.`); return n; }
function nonneg(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be zero or greater.`); return n; }
function num(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n)) throw new Error(`${label} must be a valid number.`); return n; }
function bounded(value: unknown, label: string, min: number, max: number) { const n = num(value, label); if (n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`); return n; }
function next(value: number, sizes: number[]) { return sizes.find(x => x >= value) ?? sizes[sizes.length - 1]; }
function previous(value: number, sizes: number[]) { return [...sizes].reverse().find(x => x <= value) ?? sizes[0]; }
function s(value: unknown) { return String(value ?? ""); }
function f(value: number) { if (!Number.isFinite(value)) return "0"; if (Math.abs(value) >= 1000) return value.toFixed(0); if (Math.abs(value) >= 100) return value.toFixed(1); if (Math.abs(value) >= 10) return value.toFixed(2); return value.toFixed(3); }
function readable(value: string) { return value.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function duration(hours: number) { const h = Math.floor(hours), minutes = Math.round((hours - h) * 60); return `${h} h ${minutes} min`; }
function toLabel(unit: string) { return ({ w: "W", kw: "kW", mw: "MW", hp: "hp", btuh: "BTU/h", j: "J", kj: "kJ", wh: "Wh", kwh: "kWh", mwh: "MWh" } as Record<string, string>)[unit] ?? unit; }
