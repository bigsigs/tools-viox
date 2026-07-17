import type { CalculationResult } from "./types";
import { calculateArcFlash } from "./arcFlash";

type Values = Record<string, string | number>;
const breakerSizes = [1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];
const contactorSizes = [6, 9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630, 800];
const fuseSizes = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

export function calculateExpansionTool(slug: string, v: Values): CalculationResult {
  switch (slug) {
    case "rc-circuit-time-constant-calculator": return rcCircuit(v);
    case "rlc-impedance-resonance-calculator": return rlcCircuit(v);
    case "current-divider-calculator": return currentDivider(v);
    case "capacitor-reactance-energy-calculator": return capacitorCalc(v);
    case "inductor-reactance-energy-calculator": return inductorCalc(v);
    case "current-shunt-calculator": return currentShunt(v);
    case "emergency-lighting-battery-calculator": return emergencyLighting(v);
    case "lighting-circuit-load-calculator": return lightingCircuit(v);
    case "branch-circuit-count-calculator": return branchCircuitCount(v);
    case "electrical-panel-load-spare-capacity-calculator": return panelLoadCapacity(v);
    case "transformer-impedance-calculator": return transformerImpedance(v);
    case "generator-sizing-calculator": return generatorSizing(v);
    case "harmonic-thd-calculator": return harmonicThd(v);
    case "ups-backup-time-calculator": return upsRuntime(v);
    case "inverter-sizing-calculator": return inverterSizing(v);
    case "grounding-resistance-calculator": return groundingResistance(v);
    case "insulation-resistance-temperature-correction-calculator": return insulationCorrection(v);
    case "cable-pulling-tension-calculator": return cablePulling(v);
    case "motor-torque-calculator": return motorTorque(v);
    case "motor-control-panel-load-calculator": return motorPanelLoad(v);
    case "three-phase-power-calculator": return threePhasePower(v);
    case "battery-capacity-converter": return batteryCapacityConverter(v);
    case "power-energy-time-calculator": return powerEnergyTime(v);
    case "voltage-divider-calculator": return voltageDivider(v);
    case "clearance-creepage-calculator": return clearanceCreepage(v);
    case "pcb-conductor-spacing-calculator": return pcbConductorSpacing(v);
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
    case "lighting-calculator": return lighting(v);
    case "cable-tray-fill-calculator": return cableTray(v);
    case "stationary-battery-sizing-calculator": return stationaryBattery(v);
    case "residential-electrical-load-calculator": return residentialLoad(v);
    case "nema-ip-rating-converter": return nemaIp(v);
    default: throw new Error("Unknown calculator");
  }
}

function rcCircuit(v: Values): CalculationResult {
  const r=pos(v.resistance,"Resistance")*1000, c=pos(v.capacitance,"Capacitance")*1e-6, vs=nonneg(v.voltage,"Voltage"), t=nonneg(v.time,"Time"), hz=pos(v.frequency,"Frequency"), tau=r*c, fc=1/(2*Math.PI*tau), charge=vs*(1-Math.exp(-t/tau)), discharge=vs*Math.exp(-t/tau), xc=1/(2*Math.PI*hz*c), z=Math.hypot(r,xc), gain=1/Math.sqrt(1+(hz/fc)**2), phase=-Math.atan(hz/fc)*180/Math.PI;
  return result(`${f(tau*1000)} ms`, "ok", `The RC time constant is ${f(tau*1000)} ms and the first-order cutoff frequency is ${f(fc)} Hz.`, [["Time constant τ",`${f(tau)} s`],["Cutoff frequency",`${f(fc)} Hz`],["Charging voltage at entered time",`${f(charge)} V`],["Discharging voltage at entered time",`${f(discharge)} V`],["Capacitive reactance",`${f(xc)} Ω`],["Series impedance magnitude",`${f(z)} Ω`],["Low-pass gain",f(gain)],["Low-pass phase",`${f(phase)}°`]], ["Verify capacitor tolerance, leakage, ESR, voltage and temperature rating.", "Use manufacturer application data for snubbers, relay delays and mains-connected networks.", "A first-order model excludes source and load impedance unless included in R."]);
}

function rlcCircuit(v: Values): CalculationResult {
  const mode=s(v.mode), voltage=pos(v.voltage,"Voltage"), hz=pos(v.frequency,"Frequency"), r=pos(v.resistance,"Resistance"), l=pos(v.inductance,"Inductance")/1000, c=pos(v.capacitance,"Capacitance")*1e-6, xl=2*Math.PI*hz*l, xc=1/(2*Math.PI*hz*c), f0=1/(2*Math.PI*Math.sqrt(l*c)); let zMag:number, angle:number, current:number, pf:number, q:number;
  if(mode==="series"){const x=xl-xc; zMag=Math.hypot(r,x); angle=Math.atan2(x,r)*180/Math.PI; current=voltage/zMag; pf=r/zMag; q=Math.sqrt(l/c)/r;} else {const g=1/r,b=1/xc-1/xl,y=Math.hypot(g,b);zMag=1/y; angle=-Math.atan2(b,g)*180/Math.PI;current=voltage*y;pf=Math.abs(Math.cos(angle*Math.PI/180));q=r*Math.sqrt(c/l);}
  return result(`${f(zMag)} Ω`, Math.abs(hz-f0)/f0<0.05?"caution":"ok", `${readable(mode)} RLC impedance is ${f(zMag)} Ω at ${f(hz)} Hz with ${f(angle)}° phase angle.`, [["Inductive reactance",`${f(xl)} Ω`],["Capacitive reactance",`${f(xc)} Ω`],["Impedance magnitude",`${f(zMag)} Ω`],["Line current",`${f(current)} A`],["Phase angle",`${f(angle)}°`],["Power factor magnitude",f(pf)],["Ideal resonance frequency",`${f(f0)} Hz`],["Idealized Q factor",f(q)]], ["Near resonance, real current and component voltage depend strongly on ESR, winding resistance and source impedance.", "Verify capacitor RMS current and voltage plus inductor saturation, core loss and temperature.", "Use a frequency sweep or circuit simulation when broadband behavior matters."]);
}

function currentDivider(v: Values): CalculationResult {
  const total=pos(v.totalCurrent,"Total current"), rs=[v.r1,v.r2,v.r3,v.r4,v.r5,v.r6].map(Number).filter(x=>Number.isFinite(x)&&x>0); if(rs.length<2) throw new Error("Enter at least two positive branch resistances."); const req=1/rs.reduce((a,x)=>a+1/x,0), voltage=total*req, currents=rs.map(x=>total*req/x), powers=currents.map((x,i)=>x*x*rs[i]), sum=currents.reduce((a,x)=>a+x,0), metrics:[string,string][]=[["Equivalent resistance",`${f(req)} Ω`],["Common branch voltage",`${f(voltage)} V`],["KCL current sum",`${f(sum)} A`],["KCL error",`${f(Math.abs(sum-total))} A`]]; currents.forEach((x,i)=>{metrics.push([`Branch ${i+1} current`,`${f(x)} A`]);metrics.push([`Branch ${i+1} power`,`${f(powers[i])} W`]);});
  return result(`${f(currents[0])} A in R1`, "ok", `${f(total)} A splits across ${rs.length} resistive branches; the lower-resistance branches carry more current.`, metrics, ["Use complex impedance and phasor current division for reactive AC branches.", "Check each resistor voltage, power, pulse and temperature rating.", "This is not a current-sharing model for parallel cables or semiconductor devices."]);
}

function capacitorCalc(v: Values): CalculationResult {
  const c=pos(v.capacitance,"Capacitance")*1e-6,c2=pos(v.c2,"Second capacitance")*1e-6,hz=pos(v.frequency,"Frequency"),voltage=nonneg(v.voltage,"Voltage"),xc=1/(2*Math.PI*hz*c),current=voltage/xc,energy=.5*c*voltage*voltage,charge=c*voltage,eq=s(v.connection)==="parallel"?c+c2:c*c2/(c+c2),kvar=voltage*current/1000;
  return result(`${f(xc)} Ω`, "ok", `${f(c*1e6)} µF has ${f(xc)} Ω reactance at ${f(hz)} Hz and stores ${f(energy)} J at ${f(voltage)} V.`, [["Capacitive reactance",`${f(xc)} Ω`],["Ideal RMS current",`${f(current)} A`],["Ideal reactive power",`${f(kvar)} kvar`],["Stored energy",`${f(energy)} J`],["Stored charge",`${f(charge)} C`],["Two-capacitor equivalent",`${f(eq*1e6)} µF`]], ["Stored energy requires a verified discharge path and safe discharge time.", "Verify voltage derating, tolerance, ESR, ripple current, temperature and lifetime.", "Power-factor capacitors require harmonic resonance and switching-duty checks."]);
}

function inductorCalc(v: Values): CalculationResult {
  const l=pos(v.inductance,"Inductance")/1000,l2=pos(v.l2,"Second inductance")/1000,hz=pos(v.frequency,"Frequency"),voltage=nonneg(v.voltage,"Voltage"),enteredI=nonneg(v.current,"Current"),r=pos(v.resistance,"Resistance"),xl=2*Math.PI*hz*l,z=Math.hypot(r,xl),acI=voltage/z,energy=.5*l*enteredI*enteredI,tau=l/r,eq=s(v.connection)==="series"?l+l2:l*l2/(l+l2);
  return result(`${f(xl)} Ω`, "ok", `${f(l*1000)} mH has ${f(xl)} Ω ideal reactance at ${f(hz)} Hz and stores ${f(energy)} J at ${f(enteredI)} A.`, [["Inductive reactance",`${f(xl)} Ω`],["R-L impedance magnitude",`${f(z)} Ω`],["Idealized AC current",`${f(acI)} A`],["Stored magnetic energy",`${f(energy)} J`],["R-L time constant",`${f(tau*1000)} ms`],["Two-inductor equivalent",`${f(eq*1000)} mH`]], ["Verify saturation current, incremental inductance and core loss at the actual waveform.", "Include winding temperature rise, insulation and switching overvoltage.", "Parallel/series result assumes no mutual coupling."]);
}

function currentShunt(v: Values): CalculationResult {
  const rated=pos(v.ratedCurrent,"Rated current"),drop=pos(v.ratedDrop,"Rated drop")/1000,actual=nonneg(v.actualCurrent,"Actual current"),meter=pos(v.meterFullScale,"Meter full scale")/1000,limit=bounded(v.continuousFactor,"Continuous limit",1,100)/100,r=drop/rated,pRated=rated*rated*r,pActual=actual*actual*r,vActual=actual*r,indicated=vActual/meter*rated,util=actual/(rated*limit)*100;
  return result(`${f(r*1e6)} µΩ`, util>100?"warning":"ok", `A ${f(rated)} A / ${f(drop*1000)} mV shunt requires ${f(r*1e6)} µΩ and dissipates ${f(pRated)} W at rated current.`, [["Shunt resistance",`${f(r*1e6)} µΩ`],["Rated power loss",`${f(pRated)} W`],["Actual shunt voltage",`${f(vActual*1000)} mV`],["Actual power loss",`${f(pActual)} W`],["Indicated current with entered meter",`${f(indicated)} A`],["Continuous-limit utilization",`${f(util)}%`]], ["Use Kelvin sense leads and observe polarity.", "Confirm accuracy class, temperature coefficient, overload and cooling requirements.", "Provide meter isolation appropriate to the shunt circuit potential."]);
}

function emergencyLighting(v: Values): CalculationResult {
  const p=pos(v.fixturePower,"Fixture power"),n=integerAtLeast(v.quantity,"Quantity",1),hours=pos(v.duration,"Duration"),vb=pos(v.batteryVoltage,"Battery voltage"),eff=bounded(v.efficiency,"Efficiency",1,100)/100,dod=bounded(v.dod,"Depth of discharge",1,100)/100,aging=bounded(v.aging,"Aging factor",1,100)/100,temp=bounded(v.temperature,"Temperature factor",1,100)/100,margin=1+nonneg(v.margin,"Margin")/100,load=p*n,loadWh=load*hours,battWh=loadWh*margin/(eff*dod*aging*temp),ah=battWh/vb,dcI=load/(vb*eff);
  return result(`${f(ah)} Ah at ${f(vb)} V`, "caution", `${n} fixtures require ${f(loadWh)} Wh at the load and ${f(battWh)} Wh nominal battery capacity after entered factors.`, [["Emergency connected load",`${f(load)} W`],["Required load energy",`${f(loadWh)} Wh`],["Corrected battery energy",`${f(battWh)} Wh`],["Required battery capacity",`${f(ah)} Ah`],["Estimated DC operating current",`${f(dcI)} A`],["Required duration",`${f(hours)} h`]], ["Verify maintained emergency illuminance, spacing, escape-route coverage and local duration rules separately.", "Use listed emergency drivers/luminaires and manufacturer discharge data at minimum temperature and end of life.", "Include testing, monitoring, recharge, battery protection and isolation requirements."]);
}

function lightingCircuit(v: Values): CalculationResult {
  const p=pos(v.fixturePower,"Fixture power"),n=integerAtLeast(v.quantity,"Quantity",1),voltage=pos(v.voltage,"Voltage"),pf=bounded(v.powerFactor,"Power factor",.1,1),breaker=pos(v.breaker,"Breaker"),loading=bounded(v.maxLoading,"Loading",1,100)/100,inrush=nonneg(v.inrushPerFixture,"Inrush"),sim=bounded(v.simultaneousInrush,"Simultaneous inrush",0,100)/100,hours=nonneg(v.hours,"Hours"),watts=p*n,va=watts/pf,current=va/voltage,capacity=breaker*loading,circuits=Math.ceil(current/capacity),per=Math.ceil(n/circuits),peak=inrush*n*sim,energy=watts*hours/1000;
  return result(`${circuits} circuit${circuits===1?"":"s"}`, peak>breaker*10?"caution":"ok", `${n} fixtures total ${f(watts)} W / ${f(va)} VA and draw ${f(current)} A steady state.`, [["Connected active power",`${f(watts)} W`],["Apparent power",`${f(va)} VA`],["Steady-state current",`${f(current)} A`],["Planned capacity per circuit",`${f(capacity)} A`],["Preliminary circuit quantity",`${circuits}`],["Approximate fixtures per circuit",`${per}`],["Entered simultaneous peak inrush",`${f(peak)} A`],["Daily energy",`${f(energy)} kWh/day`]], ["Use driver manufacturer maximum-device tables or inrush magnitude and duration with breaker curves.", "Verify conductor size, voltage drop, harmonics, neutral current and switching-device duty.", "Separate normal, emergency, maintained and control circuits as required."]);
}

function branchCircuitCount(v: Values): CalculationResult {
  const mode=s(v.mode),area=pos(v.area,"Area"),voltage=pos(v.voltage,"Voltage"),rating=pos(v.rating,"Rating"),loading=bounded(v.loading,"Loading",1,100)/100,dedicated=integerNonneg(v.dedicated,"Dedicated circuits"); let generalVa:number,mandatory=0,method:string;
  if(mode==="nec-dwelling"){generalVa=area*10.7639104*3; mandatory=integerAtLeast(v.smallAppliance,"Small-appliance circuits",2)+integerAtLeast(v.laundry,"Laundry circuits",1)+integerAtLeast(v.bathroom,"Bathroom circuits",1);method="NEC dwelling screening";}else{generalVa=area*pos(v.loadDensity,"Load density");method="User-entered load-density planning";}
  const vaPer=voltage*rating*loading,general=Math.ceil(generalVa/vaPer),total=general+mandatory+dedicated;
  return result(`${total} circuits`, "caution", `${method} gives ${general} general-load circuits plus ${mandatory} entered mandatory and ${dedicated} other dedicated circuits.`, [["General load basis",`${f(generalVa)} VA`],["Planned VA per general circuit",`${f(vaPer)} VA`],["General-load circuits",`${general}`],["Entered mandatory circuits",`${mandatory}`],["Other dedicated circuits",`${dedicated}`],["Total planning count",`${total}`]], ["Build the final panel schedule from the actual room, receptacle, appliance, HVAC, lighting and equipment plan.", "Apply the adopted code's dedicated-circuit, AFCI/GFCI, load, phase-balance and spare-way requirements.", "NEC mode is a screening aid only and requires the adopted edition and local amendments."]);
}

function panelLoadCapacity(v: Values): CalculationResult {
  const three=s(v.phase)==="three",voltage=pos(v.voltage,"Voltage"),main=pos(v.mainRating,"Main rating"),connected=pos(v.connectedKw,"Connected load"),demand=bounded(v.demandFactor,"Demand factor",0,100)/100,pf=bounded(v.powerFactor,"Power factor",.1,1),future=nonneg(v.futureKw,"Future load"),pDemand=connected*demand,current=pDemand*1000/(voltage*pf*(three?Math.sqrt(3):1)),futureI=future*1000/(voltage*pf*(three?Math.sqrt(3):1)),after=current+futureI,spare=main-current,spareAfter=main-after,util=current/main*100,utilAfter=after/main*100, phases=[nonneg(v.phaseA,"Phase A"),nonneg(v.phaseB,"Phase B"),nonneg(v.phaseC,"Phase C")],avg=phases.reduce((a,x)=>a+x,0)/3,unbalance=three&&avg>0?Math.max(...phases.map(x=>Math.abs(x-avg)))/avg*100:0,spareKva=Math.max(0,spare)*voltage*(three?Math.sqrt(3):1)/1000;
  return result(`${f(utilAfter)}% after addition`, utilAfter>100?"warning":utilAfter>80?"caution":"ok", `Calculated demand is ${f(current)} A now and ${f(after)} A after the entered ${f(future)} kW addition.`, [["Calculated demand power",`${f(pDemand)} kW`],["Current demand",`${f(current)} A`],["Current utilization",`${f(util)}%`],["Current spare amperes",`${f(spare)} A`],["Approximate spare apparent power",`${f(spareKva)} kVA`],["Added-load current",`${f(futureI)} A`],["Current after addition",`${f(after)} A`],["Spare after addition",`${f(spareAfter)} A`],["Utilization after addition",`${f(utilAfter)}%`],["Measured phase-current unbalance",three?`${f(unbalance)}%`:"Not applicable"]], ["Confirm demand using the method accepted by the utility, authority and project designer.", "Verify feeder and busbar ampacity, main-device rating, continuous loads, fault duty, neutral, harmonics and phase balance.", "A positive spare-current result does not by itself approve the added load."]);
}

function transformerImpedance(v: Values): CalculationResult {
  const kva = pos(v.kva, "Transformer rating"), voltage = pos(v.voltage, "Secondary voltage"), zPct = pos(v.percentZ, "Percent impedance"), xr = nonneg(v.xr, "X/R ratio"), three = s(v.phase) === "three";
  const va = kva * 1000, ifl = va / (voltage * (three ? Math.sqrt(3) : 1)), zBase = voltage * voltage / va, z = zBase * zPct / 100, r = z / Math.sqrt(1 + xr * xr), x = r * xr, isc = ifl * 100 / zPct, faultMva = kva / zPct * 100 / 1000;
  return result(`${f(isc / 1000)} kA`, "caution", `Infinite-bus secondary fault current is ${f(isc / 1000)} kA from ${f(ifl)} A full-load current and ${f(zPct)}% nameplate impedance.`, [["Full-load current", `${f(ifl)} A`], ["Base impedance", `${f(zBase)} Ω`], ["Transformer impedance", `${f(z)} Ω`], ["Resistance component", `${f(r)} Ω`], ["Reactance component", `${f(x)} Ω`], ["X/R ratio", f(xr)], ["Fault MVA", `${f(faultMva)} MVA`]], ["Add upstream source and feeder impedance for a location-specific fault current.", "Use X/R in asymmetrical peak, making-duty, and short-time withstand studies.", "Confirm MCCB, ACB, busbar and assembly SCCR above the calculated duty."]);
}

function generatorSizing(v: Values): CalculationResult {
  const run = pos(v.runningKw, "Running load"), pf = bounded(v.powerFactor, "Power factor", 0.1, 1), step = nonneg(v.startingKw, "Starting step"), reserve = 1 + nonneg(v.reserve, "Reserve") / 100, growth = 1 + nonneg(v.growth, "Growth") / 100, altitude = nonneg(v.altitude, "Altitude"), temp = num(v.temperature, "Ambient temperature");
  const steady = run * reserve * growth, transient = run + step, designKw = Math.max(steady, transient), kAlt = Math.max(0.5, 1 - Math.max(0, altitude - 1000) / 500 * 0.03), kTemp = Math.max(0.5, 1 - Math.max(0, temp - 40) / 5 * 0.01), ratedKw = designKw / (kAlt * kTemp), ratedKva = ratedKw / pf;
  return result(`${f(ratedKva)} kVA`, ratedKva > run / pf * 1.5 ? "caution" : "ok", `The governing screen is ${transient >= steady ? "the entered starting step" : "running load with reserve and growth"}; after generic environmental derating the reference is ${f(ratedKw)} kW / ${f(ratedKva)} kVA.`, [["Steady-state design load", `${f(steady)} kW`], ["Starting-step load", `${f(transient)} kW`], ["Governing site output", `${f(designKw)} kW`], ["Altitude factor", f(kAlt)], ["Temperature factor", f(kTemp)], ["Reference generator kW", `${f(ratedKw)} kW`], ["Reference generator kVA", `${f(ratedKva)} kVA`]], ["Replace generic derating with the exact engine-alternator manufacturer's site-rating data.", "Submit the load sequence and largest motor/UPS step for transient voltage and frequency analysis.", "Coordinate ATS poles, neutral, SCCR, protection, fuel runtime, ventilation, exhaust and load-bank testing."]);
}

function harmonicThd(v: Values): CalculationResult {
  const q = s(v.quantity), h1 = pos(v.h1, "Fundamental"), hs = [3,5,7,9,11,13].map(n => [n, nonneg(v[`h${n}`], `H${n}`)] as const), harmonicSq = hs.reduce((a,[,x]) => a + x*x, 0), thd = Math.sqrt(harmonicSq) / h1 * 100, rms = Math.sqrt(h1*h1 + harmonicSq), triplen = Math.sqrt(hs.filter(([n]) => n % 3 === 0).reduce((a,[,x]) => a+x*x,0)), neutralScreen = q === "current" ? 3 * triplen : 0, dominant = hs.reduce((a,b) => b[1] > a[1] ? b : a);
  return result(`${f(thd)}% THD`, thd > (q === "voltage" ? 8 : 35) ? "warning" : thd > (q === "voltage" ? 5 : 20) ? "caution" : "ok", `${q === "current" ? "THDi" : "THDv"} is ${f(thd)}% and total RMS is ${f(rms)} in the entered unit.`, [["Fundamental RMS", f(h1)], ["Harmonic RSS", f(Math.sqrt(harmonicSq))], ["Total RMS", f(rms)], ["THD", `${f(thd)}%`], ["Dominant entered harmonic", `H${dominant[0]} at ${f(dominant[1] / h1 * 100)}%`], ["Triplen harmonic RSS", f(triplen)], ["Worst-case triplen neutral screen", q === "current" ? f(neutralScreen) : "Current data required"]], ["Do not claim IEEE 519 compliance without PCC voltage, Isc/IL, demand current and individual limits.", "Use phase-resolved magnitude and angle measurements for exact neutral current.", "Review VFD, UPS, EV charger, transformer K-factor, capacitor resonance and conductor heating."]);
}

function upsRuntime(v: Values): CalculationResult {
  const load = pos(v.load, "Load"), vb = pos(v.batteryVoltage, "Battery voltage"), ah = pos(v.ah, "Battery capacity"), ns = integerAtLeast(v.series, "Series count", 1), np = integerAtLeast(v.parallel, "Parallel count", 1), eff = bounded(v.efficiency, "Efficiency", 1, 100)/100, aging = bounded(v.aging, "Remaining capacity", 1, 100)/100, dod = bounded(v.dod, "Depth of discharge", 1, 100)/100;
  const bankV=vb*ns, bankAh=ah*np, nominal=bankV*bankAh, usable=nominal*eff*aging*dod, hours=usable/load, dcCurrent=load/(bankV*eff), cRate=dcCurrent/bankAh;
  return result(duration(hours), cRate > 0.5 ? "warning" : cRate > 0.2 ? "caution" : "ok", `The energy-method estimate provides ${f(usable/1000)} kWh delivered and approximately ${duration(hours)} at ${f(load)} W.`, [["Bank voltage", `${f(bankV)} VDC`], ["Bank capacity", `${f(bankAh)} Ah`], ["Nominal energy", `${f(nominal/1000)} kWh`], ["Usable delivered energy", `${f(usable/1000)} kWh`], ["Estimated DC current", `${f(dcCurrent)} A`], ["Approximate discharge rate", `${f(cRate)} C`], ["Energy-method runtime", duration(hours)]], ["Use manufacturer constant-power discharge data at the UPS cutoff voltage and minimum temperature.", "Include UPS standby loss, battery tolerance, aging requirement and required end-of-life runtime.", "Verify string protection, DC fault current, cable drop, ventilation and recharge time."]);
}

function inverterSizing(v: Values): CalculationResult {
  const load=pos(v.loadKw,"AC load"), pf=bounded(v.powerFactor,"Power factor",0.1,1), surge=pos(v.surgeKw,"Surge load"), margin=1+nonneg(v.margin,"Margin")/100, vdc=pos(v.dcVoltage,"DC voltage"), eff=bounded(v.efficiency,"Efficiency",1,100)/100, vac=pos(v.acVoltage,"AC voltage"), ratio=bounded(v.dcAcRatio,"DC/AC ratio",0.1,2);
  const continuous=load*margin, kva=continuous/pf, surgeRef=Math.max(surge,continuous), idc=continuous*1000/(vdc*eff), iac=continuous*1000/(vac*pf), pv=continuous*ratio;
  return result(`${f(continuous)} kW / ${f(kva)} kVA`, surge > continuous*2 ? "caution":"ok", `Continuous inverter reference is ${f(continuous)} kW (${f(kva)} kVA), with at least ${f(surgeRef)} kW entered surge capability.`, [["Continuous active-power reference",`${f(continuous)} kW`],["Continuous apparent-power reference",`${f(kva)} kVA`],["Minimum entered surge reference",`${f(surgeRef)} kW`],["DC input current at nominal voltage",`${f(idc)} A`],["Single-phase AC output current",`${f(iac)} A`],["PV array DC reference",`${f(pv)} kWp`]], ["Recalculate maximum DC current at the inverter minimum operating voltage.", "Verify surge duration and load type against the exact inverter overload curve.", "Complete PV string voltage, MPPT current, battery C-rate, DC protection, isolation and SPD checks."]);
}

function groundingResistance(v: Values): CalculationResult {
  const rho=pos(v.rho,"Soil resistivity"), l=pos(v.length,"Rod length"), d=pos(v.diameter,"Rod diameter")/1000, n=integerAtLeast(v.count,"Rod count",1), spacing=pos(v.spacing,"Rod spacing"), target=pos(v.target,"Target resistance"); if(l/d < 10) throw new Error("Rod length must be much greater than rod diameter for this approximation.");
  const single=rho/(2*Math.PI*l)*(Math.log(4*l/d)-1), ratio=spacing/l, efficiency=n===1?1:Math.min(1, Math.max(0.45, 0.55+0.15*Math.min(ratio,3))), combined=single/(n*efficiency);
  return result(`${f(combined)} Ω`, combined>target?"warning":"ok", `Uniform-soil screening gives ${f(single)} Ω per rod and approximately ${f(combined)} Ω for ${n} rod${n===1?"":"s"}.`, [["Single-rod resistance",`${f(single)} Ω`],["Spacing-to-length ratio",f(ratio)],["Generic array efficiency",`${f(efficiency*100)}%`],["Multiple-rod estimate",`${f(combined)} Ω`],["Entered project target",`${f(target)} Ω`],["Target screen",combined<=target?"At or below target":"Above target"]], ["Measure the installed electrode system with an accepted fall-of-potential, clamp, or selective method as applicable.", "Use layered-soil modeling for critical sites, substations, lightning systems and touch/step voltage studies.", "Check bonding, conductor sizing, corrosion, seasonal moisture and local electrode requirements separately."]);
}

function insulationCorrection(v: Values): CalculationResult {
  const r=pos(v.measured,"Measured resistance"), tm=num(v.measuredTemp,"Measured temperature"), tr=num(v.referenceTemp,"Reference temperature"), interval=pos(v.doubling,"Doubling interval"), test=pos(v.testVoltage,"Test voltage"), factor=Math.pow(2,(tm-tr)/interval), corrected=r*factor;
  return result(`${f(corrected)} MΩ at ${f(tr)}°C`, "caution", `${f(r)} MΩ measured at ${f(tm)}°C corrects to ${f(corrected)} MΩ at ${f(tr)}°C using a ${f(interval)}°C doubling interval.`, [["Measured resistance",`${f(r)} MΩ`],["Measured temperature",`${f(tm)}°C`],["Reference temperature",`${f(tr)}°C`],["Correction factor",f(factor)],["Corrected resistance",`${f(corrected)} MΩ`],["DC test voltage",`${f(test)} VDC`]], ["Use the equipment or insulation manufacturer's correction curve when available.", "Trend readings only when test voltage, duration, connection, temperature and asset condition are comparable.", "Apply the relevant acceptance criterion; this calculator does not pass or fail the insulation."]);
}

function cablePulling(v: Values): CalculationResult {
  const w=pos(v.weight,"Cable weight"), l=pos(v.length,"Length"), mu=nonneg(v.friction,"Friction"), t0=nonneg(v.entryTension,"Entry tension"), angle=nonneg(v.bendAngle,"Bend angle")*Math.PI/180, radius=pos(v.bendRadius,"Bend radius"), allow=pos(v.allowable,"Allowable tension"), swpLimit=pos(v.swpLimit,"Sidewall pressure limit"), straight=t0+mu*w*9.80665*l, out=straight*Math.exp(mu*angle), swp=out/radius, tUse=out/allow*100, sUse=swp/swpLimit*100;
  return result(`${f(out)} N exit tension`, tUse>100||sUse>100?"warning":tUse>80||sUse>80?"caution":"ok", `The simplified straight-plus-bend route produces ${f(out)} N exit tension and ${f(swp)} N/m sidewall pressure.`, [["Straight-section exit tension",`${f(straight)} N`],["Bend angle",`${f(angle)} rad`],["Capstan tension multiplier",f(Math.exp(mu*angle))],["Final pulling tension",`${f(out)} N`],["Tension utilization",`${f(tUse)}%`],["Sidewall pressure",`${f(swp)} N/m`],["SWP utilization",`${f(sUse)}%`]], ["Model real routes segment by segment in the actual pulling direction.", "Use manufacturer maximum pulling tension, sidewall pressure and bend-radius limits for the exact cable.", "Review conduit fill, jam ratio, lubricant compatibility, pulling eye, reel setup and communication plan."]);
}

function motorTorque(v: Values): CalculationResult {
  const p=pos(v.power,"Power"), mode=s(v.powerUnit), rpm=pos(v.rpm,"Speed"), eff=bounded(v.efficiency,"Efficiency",1,100)/100; let outKw=mode==="hp-output"?p*0.745699872:mode==="kw-input"?p*eff:p; const inKw=outKw/eff, nm=9550*outKw/rpm, lbft=nm*0.737562149, omega=2*Math.PI*rpm/60;
  return result(`${f(nm)} N·m`, "ok", `${f(outKw)} kW shaft output at ${f(rpm)} rpm corresponds to ${f(nm)} N·m (${f(lbft)} lb-ft).`, [["Shaft output power",`${f(outKw)} kW`],["Electrical input reference",`${f(inKw)} kW`],["Shaft speed",`${f(rpm)} rpm`],["Angular speed",`${f(omega)} rad/s`],["Torque",`${f(nm)} N·m`],["Torque",`${f(lbft)} lb-ft`]], ["Use the motor torque-speed curve for starting, pull-up, breakdown and accelerating torque.", "Add gearbox efficiency, ratio and driven-load torque separately.", "Confirm shaft, coupling and mechanical service factor with the equipment manufacturer."]);
}

function motorPanelLoad(v: Values): CalculationResult {
  const largest=pos(v.largestMotor,"Largest motor current"), others=nonneg(v.otherMotors,"Other motor currents"), demand=bounded(v.motorDemand,"Motor demand",0,100)/100, kva=nonneg(v.nonMotorKva,"Non-motor load"), voltage=pos(v.voltage,"Voltage"), spare=1+nonneg(v.spare,"Spare")/100, main=pos(v.mainRating,"Main rating"), nonMotorA=kva*1000/(Math.sqrt(3)*voltage), base=1.25*largest+others*demand+nonMotorA, design=base*spare, utilization=design/main*100;
  return result(`${f(design)} A feeder reference`, design>main?"warning":utilization>80?"caution":"ok", `The entered load basis gives ${f(base)} A before spare and ${f(design)} A after ${f((spare-1)*100)}% planning spare.`, [["125% largest motor contribution",`${f(1.25*largest)} A`],["Other motor contribution",`${f(others*demand)} A`],["Non-motor contribution",`${f(nonMotorA)} A`],["Base feeder ampacity screen",`${f(base)} A`],["With planning spare",`${f(design)} A`],["Entered main rating",`${f(main)} A`],["Main-rating utilization",`${f(utilization)}%`]], ["Verify the adopted motor-feeder rule and whether any entered demand factor is permitted.", "Select the main device only after fault current, breaking capacity, coordination and motor-starting checks.", "Complete busbar, SCCR, neutral, heat, enclosure, starter, overload and conductor verification for the assembled panel."]);
}

function threePhasePower(v: Values): CalculationResult {
  const mode = s(v.mode), voltage = pos(v.voltage, "Line-to-line voltage"), pf = bounded(v.powerFactor, "Power factor", 0.01, 1), targetPf = bounded(v.targetPf, "Target power factor", 0.01, 1);
  let current: number, apparent: number, active: number;
  if (mode === "measured") { current = pos(v.current, "Line current"); apparent = Math.sqrt(3) * voltage * current / 1000; active = apparent * pf; }
  else if (mode === "kw-current") { active = pos(v.activePower, "Active power"); current = active * 1000 / (Math.sqrt(3) * voltage * pf); apparent = active / pf; }
  else if (mode === "kva-current") { apparent = pos(v.apparentPower, "Apparent power"); current = apparent * 1000 / (Math.sqrt(3) * voltage); active = apparent * pf; }
  else throw new Error("Select a valid three-phase power calculation mode.");
  const angle = Math.acos(pf), sign = s(v.loadType) === "capacitive" ? -1 : 1;
  const reactive = sign * apparent * Math.sin(angle);
  const targetCurrent = active * 1000 / (Math.sqrt(3) * voltage * targetPf);
  const targetReactive = active * Math.tan(Math.acos(targetPf));
  const compensation = sign > 0 ? Math.max(0, Math.abs(reactive) - targetReactive) : 0;
  const currentReduction = current - targetCurrent;
  return result(`${f(active)} kW`, targetPf < pf ? "caution" : "ok", `${f(voltage)} V line-to-line at ${f(current)} A and PF ${f(pf)} corresponds to ${f(active)} kW, ${f(apparent)} kVA, and ${f(reactive)} kvar.`, [["Active power P", `${f(active)} kW`], ["Apparent power S", `${f(apparent)} kVA`], ["Reactive power Q", `${f(reactive)} kvar`], ["Line current", `${f(current)} A`], ["Power factor", `${f(pf)} ${sign > 0 ? "lagging" : "leading"}`], ["Phase angle", `${f(angle * 180 / Math.PI)}°`], ["Current at target PF", targetPf >= pf ? `${f(targetCurrent)} A` : "Target PF is below present PF"], ["Potential current reduction", targetPf >= pf ? `${f(Math.max(0, currentReduction))} A` : "Not applicable"], ["Correction to target PF", sign > 0 && targetPf > pf ? `${f(compensation)} kvar capacitive` : sign < 0 ? "Leading load — do not add capacitors from this result" : "No increase requested"]], ["Use true measured power factor when harmonics are significant; displacement PF alone may understate current and losses.", "Run conductor, voltage-drop, breaker, fault-current, and thermal checks using the actual operating and starting currents.", targetPf > pf && sign > 0 ? "Confirm capacitor-bank steps, switching duty, harmonic detuning, resonance risk, voltage, and applicable utility limits before selection." : "No capacitive correction recommendation is produced for an already-leading load or a target below the present PF."]);
}

function batteryCapacityConverter(v: Values): CalculationResult {
  const mode = s(v.mode), dod = bounded(v.dod, "Depth of discharge", 1, 100) / 100, efficiency = bounded(v.efficiency, "Efficiency", 1, 100) / 100;
  let packV: number, packAh: number, nominalWh: number, series = 1, parallel = 1;
  if (mode === "capacity-to-energy") {
    const entered = pos(v.capacity, "Battery capacity"), unitAh = s(v.capacityUnit) === "mah" ? entered / 1000 : entered;
    const unitV = pos(v.voltage, "Unit voltage"); series = integerAtLeast(v.series, "Series count", 1); parallel = integerAtLeast(v.parallel, "Parallel count", 1);
    packV = unitV * series; packAh = unitAh * parallel; nominalWh = packV * packAh;
  } else if (mode === "energy-to-capacity") {
    const entered = pos(v.energy, "Battery energy"); nominalWh = s(v.energyUnit) === "kwh" ? entered * 1000 : entered;
    packV = pos(v.packVoltage, "Pack voltage"); packAh = nominalWh / packV;
  } else throw new Error("Select a valid battery conversion direction.");
  const usableBatteryWh = nominalWh * dod, deliveredWh = usableBatteryWh * efficiency;
  return result(mode === "capacity-to-energy" ? `${f(nominalWh / 1000)} kWh` : `${f(packAh)} Ah`, "ok", `${f(packV)} V × ${f(packAh)} Ah = ${f(nominalWh)} Wh nominal battery energy.`, [["Pack voltage", `${f(packV)} V`], ["Pack capacity (Ah)", `${f(packAh)} Ah`], ["Pack capacity (mAh)", `${f(packAh * 1000)} mAh`], ["Nominal energy (Wh)", `${f(nominalWh)} Wh`], ["Nominal energy (kWh)", `${f(nominalWh / 1000)} kWh`], ["Energy within selected DOD", `${f(usableBatteryWh / 1000)} kWh`], ["Estimated delivered energy", `${f(deliveredWh / 1000)} kWh`], ["Series units", `${series}`], ["Parallel strings", `${parallel}`], ["DOD / efficiency", `${f(dod * 100)}% / ${f(efficiency * 100)}%`]], ["Verify nominal and usable capacity against the exact chemistry, BMS voltage window, temperature, aging, and discharge-rate curves.", "Use the C-rate and runtime calculator for load duration, then verify DC protection, conductor ampacity, switching, isolation, and fault current."]);
}

function powerEnergyTime(v: Values): CalculationResult {
  const solve = s(v.solve), powerFactors: Record<string, number> = { w: 1, kw: 1e3, mw: 1e6 }, energyFactors: Record<string, number> = { j: 1, kj: 1e3, mj: 1e6, wh: 3600, kwh: 3.6e6, mwh: 3.6e9 }, timeFactors: Record<string, number> = { s: 1, min: 60, h: 3600, day: 86400 };
  const pu = s(v.powerUnit), eu = s(v.energyUnit), tu = s(v.timeUnit); if (!powerFactors[pu] || !energyFactors[eu] || !timeFactors[tu]) throw new Error("Select valid units.");
  let watts = Number(v.power) * powerFactors[pu], joules = Number(v.energy) * energyFactors[eu], seconds = Number(v.time) * timeFactors[tu];
  if (solve === "energy") { watts = pos(v.power, "Power") * powerFactors[pu]; seconds = pos(v.time, "Time") * timeFactors[tu]; joules = watts * seconds; }
  else if (solve === "power") { joules = pos(v.energy, "Energy") * energyFactors[eu]; seconds = pos(v.time, "Time") * timeFactors[tu]; watts = joules / seconds; }
  else if (solve === "time") { joules = pos(v.energy, "Energy") * energyFactors[eu]; watts = pos(v.power, "Power") * powerFactors[pu]; seconds = joules / watts; }
  else throw new Error("Select power, energy, or time to calculate.");
  const display = solve === "energy" ? `${f(joules / energyFactors[eu])} ${toLabel(eu)}` : solve === "power" ? `${f(watts / powerFactors[pu])} ${toLabel(pu)}` : `${f(seconds / timeFactors[tu])} ${tu === "day" ? "days" : tu}`;
  return result(display, "ok", `${f(watts)} W operating for ${f(seconds)} seconds corresponds to ${f(joules)} joules.`, [["Power", `${f(watts)} W`], ["Power", `${f(watts / 1000)} kW`], ["Energy", `${f(joules)} J`], ["Energy", `${f(joules / 3600)} Wh`], ["Energy", `${f(joules / 3.6e6)} kWh`], ["Time", `${f(seconds)} s`], ["Time", `${f(seconds / 60)} min`], ["Time", `${f(seconds / 3600)} h`], ["Time", `${f(seconds / 86400)} days`]], ["Use average real power for energy and runtime calculations; separately verify peak power and starting demand.", "Apply charger, inverter, cable, battery, and standby losses when estimating utility input or usable battery runtime."]);
}

function voltageDivider(v: Values): CalculationResult {
  const mode = s(v.mode), vin = pos(v.vin, "Input voltage"), target = Number(v.target);
  let r1 = pos(v.r1, "R1"), r2 = pos(v.r2, "R2"), load = Infinity;
  if (mode === "resistor") {
    if (!Number.isFinite(target) || target <= 0 || target >= vin) throw new Error("Target output voltage must be greater than zero and lower than input voltage.");
    if (s(v.solve) === "r1") r1 = r2 * (vin / target - 1);
    else r2 = target * r1 / (vin - target);
  } else if (mode === "loaded") load = pos(v.load, "Load resistance");
  else if (mode !== "output") throw new Error("Select a valid voltage-divider mode.");
  const lower = Number.isFinite(load) ? r2 * load / (r2 + load) : r2;
  const currentMa = vin / (r1 + lower);
  const vout = vin * lower / (r1 + lower);
  const unloaded = vin * r2 / (r1 + r2);
  const p1Mw = currentMa * currentMa * r1;
  const r2CurrentMa = vout / r2, p2Mw = r2CurrentMa * r2CurrentMa * r2;
  const loadCurrentMa = Number.isFinite(load) ? vout / load : 0;
  const loadingError = (vout - unloaded) / unloaded * 100;
  const preferred = s(v.series);
  const bases = preferred === "e12" ? [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82] : [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
  const nearestPreferred = (value: number) => {
    const exponent = Math.floor(Math.log10(value)) - 1, scale = 10 ** exponent;
    const candidates = [-1, 0, 1].flatMap(offset => bases.map(base => base * scale * 10 ** offset));
    return candidates.reduce((best, item) => Math.abs(item - value) < Math.abs(best - value) ? item : best);
  };
  const stdR1 = preferred === "none" ? r1 : nearestPreferred(r1), stdR2 = preferred === "none" ? r2 : nearestPreferred(r2);
  const stdOut = vin * stdR2 / (stdR1 + stdR2);
  return result(`${f(vout)} V`, mode === "loaded" && Math.abs(loadingError) > 5 ? "caution" : "ok", `${f(vin)} V applied to R1 = ${f(r1)} kΩ and R2 = ${f(r2)} kΩ produces ${f(vout)} V${mode === "loaded" ? " with the entered load" : " at no load"}.`, [["Output voltage", `${f(vout)} V`], ["Unloaded output", `${f(unloaded)} V`], ["Divider source current", `${f(currentMa)} mA`], ["R1 power", `${f(p1Mw)} mW`], ["R2 power", `${f(p2Mw)} mW`], ["Load current", `${f(loadCurrentMa)} mA`], ["Effective lower resistance", `${f(lower)} kΩ`], ["Loading error", `${f(loadingError)}%`], ["Calculated R1", `${f(r1)} kΩ`], ["Calculated R2", `${f(r2)} kΩ`], ["Nearest standard pair", preferred === "none" ? "Not requested" : `${f(stdR1)} kΩ / ${f(stdR2)} kΩ (${preferred.toUpperCase()})`], ["Standard-pair output", preferred === "none" ? "Not requested" : `${f(stdOut)} V`]], ["Keep divider current comfortably above input leakage and bias current, while staying within the allowed source loading and resistor power limits.", "Use resistor voltage ratings and series strings appropriate for high input voltage; verify clearance, creepage, surge, and isolation separately.", mode === "loaded" && Math.abs(loadingError) > 1 ? "Loading materially changes the output. Increase the load resistance, reduce divider resistance, or buffer the divider output." : "Confirm tolerance and temperature drift against the receiving circuit's allowable input error."]);
}

function clearanceCreepage(v: Values): CalculationResult {
  const system = bounded(v.systemVoltage, "Rated system voltage", 1, 600);
  const working = bounded(v.workingVoltage, "Working voltage", 63, 1000);
  const pollution = s(v.pollution), material = s(v.material), insulation = s(v.insulation);
  const altitude = bounded(v.altitude, "Operating altitude", 0, 10000);
  const margin = bounded(v.margin, "Design margin", 0, 100) / 100;
  if (!["1", "2"].includes(pollution)) throw new Error("This verified release supports pollution degree 1 or 2 only.");

  const voltageBand = system <= 50 ? 0 : system <= 150 ? 1 : system <= 300 ? 2 : 3;
  const impulseTable = [[0.33, 0.5, 0.8, 1.5], [0.8, 1.5, 2.5, 4], [1.5, 2.5, 4, 6], [2.5, 4, 6, 8]];
  const ovcIndex = ["i", "ii", "iii", "iv"].indexOf(s(v.ovc));
  if (ovcIndex < 0) throw new Error("Select a valid overvoltage category.");
  let impulse = impulseTable[voltageBand][ovcIndex];
  const impulseSteps = [0.33, 0.5, 0.8, 1.5, 2.5, 4, 6];
  if (impulse > 6) throw new Error("The derived impulse voltage is above this calculator's verified 6 kV lookup range. Use the complete applicable standard.");
  const basicImpulse = impulse;
  if (insulation === "reinforced") impulse = impulseSteps[impulseSteps.indexOf(impulse) + 1] ?? NaN;
  if (!Number.isFinite(impulse) || impulse > 6) throw new Error("Reinforced clearance is above this calculator's verified lookup range. Use the complete applicable standard.");

  const clearances: Record<number, Record<string, number>> = {
    0.33: { "1": 0.01, "2": 0.2 }, 0.5: { "1": 0.04, "2": 0.2 }, 0.8: { "1": 0.1, "2": 0.2 },
    1.5: { "1": 0.5, "2": 0.5 }, 2.5: { "1": 1.5, "2": 1.5 }, 4: { "1": 3, "2": 3 }, 6: { "1": 5.5, "2": 5.5 }
  };
  const altitudePoints = [[2000, 1], [3000, 1.14], [4000, 1.29], [5000, 1.48], [6000, 1.7], [10000, 3.02]] as const;
  const interpolate = (x: number, points: readonly (readonly [number, number])[]) => {
    if (x <= points[0][0]) return points[0][1];
    const upper = points.findIndex(([px]) => px >= x); if (upper < 0) return points[points.length - 1][1];
    const [x1, y1] = points[upper - 1], [x2, y2] = points[upper]; return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  };
  const altitudeFactor = interpolate(altitude, altitudePoints);
  const basicClearance = clearances[impulse][pollution];
  const correctedClearance = basicClearance * altitudeFactor;

  const creepRows: Record<string, readonly (readonly [number, number])[]> = pollution === "1" ? {
    i: [[63, .2], [400, 1], [800, 2.4], [1000, 3.2]], ii: [[63, .2], [400, 1], [800, 2.4], [1000, 3.2]], iiia: [[63, .2], [400, 1], [800, 2.4], [1000, 3.2]], iiib: [[63, .2], [400, 1], [800, 2.4], [1000, 3.2]]
  } : {
    i: [[63, .63], [400, 2], [800, 4], [1000, 5]], ii: [[63, .9], [400, 2.8], [800, 5.6], [1000, 7.1]], iiia: [[63, 1.25], [400, 4], [800, 8], [1000, 10]], iiib: [[63, 1.25], [400, 4], [800, 8], [1000, 10]]
  };
  if (!creepRows[material]) throw new Error("Select a valid CTI material group.");
  const basicCreepage = interpolate(working, creepRows[material]);
  const insulationFactor = insulation === "reinforced" ? 2 : 1;
  const creepage = basicCreepage * insulationFactor;
  const designClearance = correctedClearance * (1 + margin), designCreepage = creepage * (1 + margin);
  const governing = designCreepage >= designClearance ? "Creepage" : "Clearance";
  return result(`${f(designCreepage)} mm creepage`, insulation === "functional" ? "caution" : "ok", `IEC 60664-1 planning result: maintain at least ${f(designClearance)} mm clearance through air and ${f(designCreepage)} mm creepage along the insulating surface, including the entered margin.`, [["Minimum clearance before margin", `${f(correctedClearance)} mm`], ["Minimum creepage before margin", `${f(creepage)} mm`], ["Design clearance", `${f(designClearance)} mm`], ["Design creepage", `${f(designCreepage)} mm`], ["Rated impulse voltage", `${f(basicImpulse)} kV`], ["Clearance impulse step used", `${f(impulse)} kV`], ["Altitude correction factor", `${f(altitudeFactor)} ×`], ["Pollution degree", `PD${pollution}`], ["Material group", material.toUpperCase()], ["Insulation level", readable(insulation)], ["Governing distance", governing]], ["Verify the result against the product-specific safety standard and the current complete IEC 60664-1 edition before releasing the design.", "Confirm CTI from the exact insulating-material datasheet; do not assume every FR-4 laminate belongs to the same material group.", "Account for manufacturing tolerance, conductor geometry, slots and ribs, contamination, coating qualification, solid insulation, dielectric tests, and the shortest measured path on the finished assembly."]);
}

const pcbSpacingRows = [
  { max: 15, values: [0.05, 0.1, 0.1, 0.05, 0.13, 0.13, 0.13] },
  { max: 30, values: [0.05, 0.1, 0.1, 0.05, 0.13, 0.25, 0.13] },
  { max: 50, values: [0.1, 0.6, 0.6, 0.13, 0.13, 0.4, 0.13] },
  { max: 100, values: [0.1, 0.6, 1.5, 0.13, 0.13, 0.5, 0.13] },
  { max: 150, values: [0.2, 0.6, 3.2, 0.4, 0.4, 0.8, 0.4] },
  { max: 170, values: [0.2, 1.25, 3.2, 0.4, 0.4, 0.8, 0.4] },
  { max: 250, values: [0.2, 1.25, 6.4, 0.4, 0.4, 0.8, 0.4] },
  { max: 300, values: [0.2, 1.25, 12.5, 0.4, 0.4, 0.8, 0.8] },
  { max: 500, values: [0.25, 2.5, 12.5, 0.8, 0.8, 1.5, 0.8] }
] as const;
const pcbSpacingColumns = ["b1", "b2", "b3", "b4", "a5", "a6", "a7"] as const;
const pcbSpacingIncrements = [0.0025, 0.005, 0.025, 0.00305, 0.00305, 0.00305, 0.00305] as const;
const pcbSpacingLabels: Record<string, string> = {
  b1: "B1 internal conductors", b2: "B2 external uncoated, up to 3050 m", b3: "B3 external uncoated, above 3050 m",
  b4: "B4 permanent polymer coating", a5: "A5 conformal-coated assembly", a6: "A6 uncoated component leads", a7: "A7 conformal-coated component leads"
};

function pcbConductorSpacing(v: Values): CalculationResult {
  const environment = s(v.environment);
  const column = pcbSpacingColumns.indexOf(environment as typeof pcbSpacingColumns[number]);
  if (column < 0) throw new Error("Select a valid conductor environment.");
  const margin = bounded(v.margin, "Design margin", 0, 200) / 100;
  const base500 = pcbSpacingRows[pcbSpacingRows.length - 1].values[column];
  const increment = pcbSpacingIncrements[column];
  const lookupSpacing = (voltage: number) => voltage <= 500
    ? pcbSpacingRows.find((row) => voltage <= row.max)!.values[column]
    : base500 + (voltage - 500) * increment;

  if (s(v.mode) === "voltage") {
    const entered = pos(v.spacing, "Available spacing");
    const availableMm = s(v.spacingUnit) === "mil" ? entered * 0.0254 : entered;
    const effectiveMm = availableMm / (1 + margin);
    const first = pcbSpacingRows[0].values[column];
    if (effectiveMm < first) throw new Error(`Available spacing after margin is below the ${f(first)} mm minimum lookup value for this category.`);
    let maxVoltage: number;
    if (effectiveMm >= base500) maxVoltage = 500 + (effectiveMm - base500) / increment;
    else maxVoltage = pcbSpacingRows.filter((row) => row.values[column] <= effectiveMm).at(-1)?.max ?? 0;
    const limited = Math.min(maxVoltage, 10000);
    const severity = maxVoltage > 10000 ? "warning" : "caution";
    return result(`${f(limited)} V DC / AC peak`, severity, `${f(availableMm)} mm available spacing in ${pcbSpacingLabels[environment]} supports a legacy-table reference of ${f(limited)} V DC or AC peak after the entered margin.`, [["Available spacing (mm)", `${f(availableMm)} mm`], ["Available spacing (mil)", `${f(availableMm / 0.0254)} mil`], ["Spacing used for reverse lookup", `${f(effectiveMm)} mm`], ["Maximum DC / AC peak reference", `${f(limited)} V`], ["Approximate equivalent AC RMS", `${f(limited / Math.sqrt(2))} V`], ["Design margin", `${f(margin * 100)}%`], ["Conductor category", pcbSpacingLabels[environment]], ["Data basis", "IPC-2221B legacy Table 6-1"]], ["Verify the result against IPC-2221C and the exact PCB construction before release.", "Do not use the reverse result as an equipment working-voltage or safety-isolation rating.", maxVoltage > 10000 ? "The mathematical result exceeds this tool's 10 kV reporting range; use a dedicated high-voltage design review." : "Include fabrication tolerances so the manufactured edge-to-edge spacing does not fall below the required value."]);
  }

  const enteredVoltage = pos(v.voltage, "Voltage");
  const volts = s(v.voltageUnit) === "kV" ? enteredVoltage * 1000 : enteredVoltage;
  const peakVoltage = s(v.voltageBasis) === "ac-rms" ? volts * Math.sqrt(2) : volts;
  if (peakVoltage > 10000) throw new Error("This screening calculator is limited to 10 kV DC or AC peak.");
  const tableMm = lookupSpacing(peakVoltage);
  const designMm = tableMm * (1 + margin);
  const severity = peakVoltage > 500 || environment === "b3" ? "caution" : "ok";
  return result(`${f(designMm)} mm`, severity, `${f(peakVoltage)} V DC or AC peak in ${pcbSpacingLabels[environment]} gives ${f(tableMm)} mm from the legacy lookup and ${f(designMm)} mm after the entered margin.`, [["Entered voltage", `${f(volts)} V ${s(v.voltageBasis) === "ac-rms" ? "AC RMS" : "DC / AC peak"}`], ["Lookup voltage", `${f(peakVoltage)} V DC / AC peak`], ["Legacy table spacing", `${f(tableMm)} mm`], ["Spacing with margin (mm)", `${f(designMm)} mm`], ["Spacing with margin (mil)", `${f(designMm / 0.0254)} mil`], ["Additional design margin", `${f(margin * 100)}%`], ["Conductor category", pcbSpacingLabels[environment]], ["Data basis", "IPC-2221B legacy Table 6-1"]], ["Verify the result against IPC-2221C and the exact PCB construction before release.", "Apply the applicable IEC, UL, or product standard separately when the spacing provides safety isolation.", "Account for etched-conductor tolerance, pad geometry, vias, board edges, contamination, humidity, coating quality, and manufacturing capability."]);
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
  const known = s(v.knownQuantities);
  if (known.length !== 2) throw new Error("Select two known quantities to calculate the third.");
  const phase = s(v.phase), pf = phase === "dc" ? 1 : bounded(v.powerFactor, "Power factor", 0.01, 1), k = phaseFactor(phase, pf);
  let P = known.includes("p") ? pos(v.power, "Power") : 0;
  let I = known.includes("i") ? pos(v.current, "Current") : 0;
  let V = known.includes("v") ? pos(v.voltage, "Voltage") : 0;
  if (!known.includes("i")) I = P / (V * k);
  else if (!known.includes("p")) P = V * I * k;
  else V = P / (I * k);
  const target = !known.includes("p") ? "Power" : !known.includes("i") ? "Current" : "Voltage";
  const systemLabel = phase === "dc" ? "DC" : phase === "three" ? "three-phase AC" : "single-phase AC";
  const primary = target === "Power" ? `${f(P)} W` : target === "Current" ? `${f(I)} A` : `${f(V)} V`;
  return result(primary, "ok", `${target} calculated for a ${systemLabel} system using the entered known values.`, [["Power", `${f(P)} W`], ["Current", `${f(I)} A`], ["Voltage", `${f(V)} V`], ["Power factor", f(pf)]], [phase === "three" ? "Use line-to-line voltage for three-phase calculations." : "Confirm that the selected system matches the actual supply."]);
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
const energyUnits: Record<string, number> = { j: 1, kj: 1e3, mj: 1e6, wh: 3600, kwh: 3.6e6, mwh: 3.6e9 };
function units(v: Values): CalculationResult {
  const quantity = s(v.quantity);
  if (quantity === "current") {
    const watts = pos(v.phasePower, "Power") * (powerUnits[s(v.phasePowerUnit)] ?? 0);
    if (!watts) throw new Error("Choose a valid power unit.");
    const phase = s(v.phase), voltage = pos(v.voltage, "Voltage"), pf = phase === "dc" ? 1 : bounded(v.powerFactor, "Power factor", 0.01, 1);
    const factor = phase === "three" ? Math.sqrt(3) * pf : phase === "single" ? pf : 1;
    const current = watts / (voltage * factor);
    const system = phase === "three" ? "Three-phase AC" : phase === "single" ? "Single-phase AC" : "DC";
    return result(`${f(current)} A`, "ok", `${system} current calculated from active power and voltage.`, [["Active power", `${f(watts)} W`], ["Voltage", `${f(voltage)} V`], ["Power factor", f(pf)], ["System", system]], [phase === "three" ? "Use line-to-line voltage for three-phase calculations." : "Confirm the entered voltage at the load terminals."]);
  }
  const table = quantity === "power" ? powerUnits : energyUnits, from = s(v.fromUnit), to = s(v.toUnit), inputSide = s(v.inputSide);
  if (!table[from] || !table[to]) throw new Error(`Choose two valid ${quantity} units.`);
  const source = nonneg(inputSide === "right" ? v.rightValue : v.leftValue, "Value");
  const sourceUnit = inputSide === "right" ? to : from, targetUnit = inputSide === "right" ? from : to;
  const converted = source * table[sourceUnit] / table[targetUnit];
  return result(`${f(converted)} ${toLabel(targetUnit)}`, "ok", `${f(source)} ${toLabel(sourceUnit)} equals ${f(converted)} ${toLabel(targetUnit)}.`, [["Base-unit value", `${f(source * table[sourceUnit])} ${quantity === "power" ? "W" : "J"}`], ["Conversion factor", f(table[sourceUnit] / table[targetUnit])]], ["Power and energy are different quantities; converting between them requires a duration."]);
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
  const enteredPower = pos(v.motorPower, "Motor power"), power = s(v.motorPowerUnit || "kw") === "hp" ? enteredPower * 0.745699872 : enteredPower, motorVoltage = pos(v.motorVoltage, "Motor voltage"), nameplate = pos(v.motorCurrent, "Motor nameplate current"), efficiency = bounded(v.motorEfficiency, "Motor efficiency", 1, 100) / 100, pf = bounded(v.motorPowerFactor, "Motor power factor", 0.01, 1);
  const serviceFactor = s(v.includeServiceFactor) === "yes" ? bounded(v.serviceFactor ?? 1.15, "Service factor", 1, 1.25) : 1;
  const calculated = power * 1000 / (Math.sqrt(3) * motorVoltage * efficiency * pf), baseCurrent = Math.max(nameplate, calculated) * serviceFactor, duty = s(v.loadType), dutyFactor = duty === "heavy" ? 1.2 : duty === "constant" ? 1.1 : 1, margin = 1 + bounded(v.designMargin, "Design margin", 0, 50) / 100;
  const ambient = num(v.ambient, "Ambient temperature"), altitude = nonneg(v.altitude, "Altitude"), tempFactor = Math.max(0.7, 1 - Math.max(0, ambient - 40) * 0.01), altitudeFactor = Math.max(0.7, 1 - Math.max(0, altitude - 1000) / 100 * 0.01), environmental = tempFactor * altitudeFactor;
  const requiredCurrent = baseCurrent * dutyFactor * margin / environmental, selectedKw = next(power * serviceFactor * dutyFactor * margin / environmental, vfdKwSizes), overload = bounded(v.requiredOverload, "Required overload", 100, 250), supply = pos(v.supplyVoltage, "Supply voltage"), vfdEfficiency = bounded(v.vfdEfficiency, "VFD efficiency", 80, 100) / 100;
  const inputCurrent = power * 1000 / (Math.sqrt(3) * supply * efficiency * vfdEfficiency * Math.max(pf, 0.85)), breaker = next(inputCurrent * 1.25, breakerSizes), bypass = next(baseCurrent * 1.1, contactorSizes), heat = power * 1000 / efficiency * (1 / vfdEfficiency - 1), cable = nonneg(v.motorCableLength, "Motor cable length");
  const filter = cable > 100 ? "Sine-wave or dv/dt filter review" : cable > 50 ? "Output reactor / dv/dt review" : "Check VFD manual cable limit"; const braking = s(v.braking) === "yes" ? "Braking resistor or regenerative unit study" : "No special braking request"; const capacity = pos(v.candidateBreaking, "Breaking capacity") >= pos(v.faultCurrent, "Fault current");
  const region = s(v.region || "international"), regionNote = region === "north-america" ? "North America: check NEC Article 430, UL 61800-5-1, SCCR, branch protection, and inverter-duty motor requirements." : region === "eu" ? "European Union: check IEC/EN 61800 safety and EMC requirements, machinery safety, STO, shielded cable, and earthing." : region === "au-nz" ? "Australia / New Zealand: check AS/NZS wiring, drive-system, EMC, isolation, and protection requirements." : region === "china" ? "China: check applicable GB/T 12668 drive-system and GB/T 5226.1 machinery electrical requirements." : region === "other" ? "Project-specific region: identify local installation, machinery, EMC, and product-certification rules." : "International / IEC: check IEC 61800 safety and EMC requirements, IEC 60204-1 machinery electrical requirements, STO, cable shielding, and earthing.";
  return result(`≥ ${f(requiredCurrent)} A output`, !capacity || duty === "heavy" ? "warning" : environmental < 0.9 ? "caution" : "ok", `Select a ${readable(duty)}-duty VFD whose continuous output rating is at least ${f(requiredCurrent)} A and whose overload curve meets ${f(overload)}% for the required manufacturer-specified duration.`, [["Calculated motor current", `${f(calculated)} A`], ["Service-factor loading", s(v.includeServiceFactor) === "yes" ? `Included at ${f(serviceFactor)}` : "Not included"], ["Current sizing basis", `${f(baseCurrent)} A`], ["Starting VFD power class", `${f(selectedKw)} kW`], ["Environmental factor", f(environmental)], ["Estimated VFD input current", `${f(inputCurrent)} A`], ["Input protection reference", `${breaker} A; exact VFD manual governs`], ["Breaking-capacity check", capacity ? "Passes entered fault current" : "Insufficient"], ["Bypass contactor reference", s(v.bypass) === "yes" ? `${bypass} A AC-3` : "No bypass selected"], ["Motor-cable treatment", filter], ["Braking direction", braking], ["Estimated VFD panel heat", `${f(heat)} W`], ["Regional checklist", regionNote]], ["Confirm the exact VFD normal/heavy-duty current table, overload duration, input fuse or breaker, SCCR, and environmental derating.", regionNote, "Check RCD type, EMC filter leakage, SPD coordination, earthing, shield termination, output filter, braking resistor, and enclosure cooling against the VFD manual.", `Use ${f(heat)} W as a starting input to the enclosure temperature-rise calculator.`]);
}

function arcFlash(v: Values): CalculationResult {
  const output = calculateArcFlash({ voltage: pos(v.voltage, "Voltage"), boltedFaultCurrent: pos(v.faultCurrent, "Fault current"), electrodeConfiguration: s(v.electrode) as "VCB" | "VCBB" | "HCB" | "VOA" | "HOA", conductorGap: pos(v.gap, "Conductor gap"), workingDistance: pos(v.workingDistance, "Working distance"), enclosureWidth: pos(v.width, "Enclosure width"), enclosureHeight: pos(v.height, "Enclosure height"), enclosureDepth: pos(v.depth, "Enclosure depth"), normalClearingTime: pos(v.normalTime, "Normal clearing time"), reducedClearingTime: pos(v.reducedTime, "Reduced-current clearing time") });
  const threshold = output.worstEnergyCalCm2 < 1.2 ? "Below 1.2 cal/cm² at entered distance" : "At or above 1.2 cal/cm² at entered distance";
  return result(`${f(output.worstEnergyCalCm2)} cal/cm²`, output.worstEnergyCalCm2 >= 40 ? "warning" : output.worstEnergyCalCm2 >= 1.2 ? "caution" : "ok", `The ${output.worstCase}-current clearing-time scenario produces the higher predicted incident energy. This is an engineering calculation result, not a PPE category or permission for energized work.`, [["Normal arcing current", `${f(output.normal.arcingCurrent)} kA`], ["Reduced arcing current", `${f(output.reduced.arcingCurrent)} kA`], ["Normal-scenario energy", `${f(output.normal.incidentEnergyCalCm2)} cal/cm²`], ["Reduced-scenario energy", `${f(output.reduced.incidentEnergyCalCm2)} cal/cm²`], ["Worst-case boundary", `${f(output.worstBoundaryMm)} mm`], ["Thermal threshold status", threshold], ["Arcing-current variation VarCf", f(output.variationFactor)], ["Enclosure correction factor", f(output.enclosureCorrectionFactor)], ["Enclosure classification", output.enclosureType]], ["Read the exact upstream protective-device time-current curve at both displayed arcing currents and include relay plus breaker clearing time.", "Have a qualified engineer verify the short-circuit model, equipment geometry, electrode configuration, working distance, maintenance condition, and complete arc-flash study.", "Do not infer an NFPA 70E PPE category or energized-work authorization directly from this result."]);
}

function lighting(v: Values): CalculationResult {
  const luxByApplication: Record<string, number> = { corridor: 100, parking: 75, warehouse: 200, classroom: 300, retail: 300, office: 500, workshop: 500, inspection: 750 };
  const application = s(v.application), targetLux = application === "custom" ? pos(v.customLux, "Required illuminance") : luxByApplication[application];
  if (!targetLux) throw new Error("Select a valid space or enter a custom illuminance.");
  const area = s(v.areaMode) === "area" ? pos(v.area, "Illuminated area") : pos(v.length, "Room length") * pos(v.width, "Room width");
  const utilization = bounded(v.utilization, "Utilization factor", 1, 100) / 100, maintenance = bounded(v.maintenance, "Maintenance factor", 1, 100) / 100;
  const fixtureLumens = pos(v.fixtureLumens, "Lumens per fixture"), fixturePower = pos(v.fixturePower, "Power per fixture"), voltage = pos(v.voltage, "Lighting circuit voltage"), pf = bounded(v.powerFactor, "Fixture power factor", 0.01, 1), maxCurrent = pos(v.maxCircuitCurrent, "Planned current per circuit");
  const requiredLumens = targetLux * area / (utilization * maintenance), fixtures = Math.ceil(requiredLumens / fixtureLumens), installedLumens = fixtures * fixtureLumens, achievedLux = installedLumens * utilization * maintenance / area;
  const totalPower = fixtures * fixturePower, current = totalPower / (voltage * pf), circuits = Math.max(1, Math.ceil(current / maxCurrent)), efficacy = fixtureLumens / fixturePower;
  return result(`${fixtures} fixtures`, "ok", `${fixtures} fixtures rated ${f(fixtureLumens)} lm each provide approximately ${f(achievedLux)} lx maintained average illuminance under the entered factors.`, [["Target illuminance", `${f(targetLux)} lx`], ["Illuminated area", `${f(area)} m²`], ["Required fixture lumens", `${f(requiredLumens)} lm`], ["Installed fixture lumens", `${f(installedLumens)} lm`], ["Estimated maintained illuminance", `${f(achievedLux)} lx`], ["Connected lighting load", `${f(totalPower)} W`], ["Steady-state current", `${f(current)} A`], ["Preliminary circuit count", `${circuits}`], ["Fixture luminous efficacy", `${f(efficacy)} lm/W`]], ["Verify uniformity, glare, mounting height, spacing, reflectance, daylight, emergency lighting, and the working-plane requirement with a photometric layout.", "Treat the circuit count as a steady-state planning result; LED-driver inrush and the manufacturer's maximum drivers per MCB may require more circuits.", "Continue with the MCB inrush checker, cable sizing, voltage-drop, and energy-cost calculations before final selection."]);
}

function cableTray(v: Values): CalculationResult {
  const method = s(v.method), width = pos(v.trayWidth, "Usable tray width"), groups = [1, 2, 3].map((index) => ({ od: pos(v[`od${index}`], `Cable group ${index} outside diameter`), qty: integerNonneg(v[`qty${index}`], `Cable group ${index} quantity`), weight: nonneg(v[`weight${index}`], `Cable group ${index} weight`) }));
  if (groups.reduce((sum, group) => sum + group.qty, 0) === 0) throw new Error("Enter at least one cable.");
  const cableArea = groups.reduce((sum, group) => sum + group.qty * Math.PI * group.od ** 2 / 4, 0), occupiedWidth = groups.reduce((sum, group) => sum + group.qty * group.od, 0), totalWeight = groups.reduce((sum, group) => sum + group.qty * group.weight, 0), loadRating = pos(v.trayLoadRating, "Tray safe working load"), loadPass = totalWeight <= loadRating;
  if (method === "single-layer") {
    const fill = occupiedWidth / width * 100, remaining = width - occupiedWidth, pass = occupiedWidth <= width, requiredWidth = occupiedWidth;
    return result(pass && loadPass ? "Pass" : "Review required", !pass || !loadPass ? "warning" : "ok", `The entered cables require ${f(requiredWidth)} mm of side-by-side width in a ${f(width)} mm usable tray.`, [["Cable count", `${groups.reduce((sum, group) => sum + group.qty, 0)}`], ["Required single-layer width", `${f(requiredWidth)} mm`], ["Tray width used", `${f(fill)}%`], ["Remaining width", `${f(Math.max(0, remaining))} mm`], ["Cable load", `${f(totalWeight)} kg/m`], ["Load-rating check", loadPass ? "Pass" : "Exceeds entered rating"]], ["Confirm that the adopted rule allows this cable category and size in a single layer.", "Add required spacing, barriers, bending clearance, and manufacturer installation tolerances to the calculated width.", "Check tray support span and fitting load ratings, not only straight-section kg/m."]);
  }
  const depth = pos(v.trayDepth, "Usable cable depth"), trayArea = width * depth;
  const allowedArea = method === "nec-area" ? pos(v.allowableArea, "Allowable NEC fill area") : trayArea * bounded(v.fillLimit, "Project maximum area fill", 1, 100) / 100;
  const reserve = bounded(v.reserve, "Future reserve", 0, 90) / 100, designArea = allowedArea * (1 - reserve), usedAllowed = cableArea / allowedArea * 100, designUsed = cableArea / designArea * 100, geometricFill = cableArea / trayArea * 100, pass = cableArea <= designArea;
  const areaPerWidth = designArea / width, requiredWidth = cableArea / Math.max(0.0001, areaPerWidth), smallestOd = Math.min(...groups.filter((group) => group.qty > 0).map((group) => group.od)), remainingSame = Math.max(0, Math.floor((designArea - cableArea) / (Math.PI * smallestOd ** 2 / 4)));
  return result(pass && loadPass ? "Pass" : "Review required", !pass || !loadPass ? "warning" : designUsed > 90 ? "caution" : "ok", `${f(cableArea)} mm² of cable area uses ${f(usedAllowed)}% of the entered allowed capacity and ${f(designUsed)}% after reserve.`, [["Total cable area", `${f(cableArea)} mm²`], ["Geometric tray fill", `${f(geometricFill)}%`], ["Allowed fill area", `${f(allowedArea)} mm²`], ["Design capacity after reserve", `${f(designArea)} mm²`], ["Design capacity used", `${f(designUsed)}%`], ["Remaining design area", `${f(Math.max(0, designArea - cableArea))} mm²`], ["Same-size additions", `${remainingSame} at ${f(smallestOd)} mm OD`], ["Equivalent minimum width", `${f(requiredWidth)} mm at entered depth/limit`], ["Cable load", `${f(totalWeight)} kg/m`], ["Load-rating check", loadPass ? "Pass" : "Exceeds entered rating"]], [method === "nec-area" ? "Verify that the entered allowable area comes from the exact NEC edition, cable category, voltage, tray type, and tray width." : "The entered fill limit is a project planning value, not a universal NEC or IEC limit.", "Check ampacity and adjustment factors separately; area fill alone does not establish thermal compliance.", "Review power/control separation, fire barriers, grounding and bonding, support spacing, fitting loads, bend radius, and future access."]);
}

function stationaryBattery(v: Values): CalculationResult {
  const mode = s(v.mode), systemVoltage = pos(v.systemVoltage, "Nominal DC system voltage"), minimumVoltage = pos(v.minimumVoltage, "Minimum permitted DC voltage"), cellVoltage = pos(v.cellVoltage, "Nominal cell voltage"), eodv = pos(v.eodv, "End-of-discharge voltage"), efficiency = bounded(v.efficiency, "Efficiency", 1, 100) / 100, usable = bounded(v.usableCapacity, "Maximum usable capacity", 1, 100) / 100, temperature = bounded(v.temperatureFactor, "Temperature capacity factor", 0.1, 1), aging = bounded(v.agingFactor, "Aging factor", 1, 2), margin = 1 + bounded(v.designMargin, "Design margin", 0, 100) / 100;
  const nominalCells = Math.ceil(systemVoltage / cellVoltage), minimumCells = Math.ceil(minimumVoltage / eodv), cells = Math.max(nominalCells, minimumCells), bankVoltage = cells * cellVoltage, endVoltage = cells * eodv;
  let baseAh = 0, peakCurrent = 0, duration = 0, continuous = 0;
  if (mode === "basic") {
    const load = pos(v.basicLoad, "Constant DC load"), hours = pos(v.autonomy, "Backup time");
    continuous = load / minimumVoltage; peakCurrent = continuous; duration = hours; baseAh = continuous * hours;
  } else {
    const initial = nonneg(v.initialLoad, "Initial high load"), initialHours = nonneg(v.initialMinutes, "Initial duration") / 60, run = pos(v.continuousLoad, "Continuous load"), hours = pos(v.dutyHours, "Duty-cycle duration"), intermittent = nonneg(v.intermittentLoad, "Intermittent load"), intermittentHours = nonneg(v.intermittentMinutes, "Intermittent duration") / 60, final = nonneg(v.finalLoad, "Final high load"), finalHours = nonneg(v.finalMinutes, "Final duration") / 60;
    if (initialHours + finalHours > hours) throw new Error("Initial and final high-load durations cannot exceed the total duty-cycle duration.");
    continuous = run; duration = hours; baseAh = run * hours + initial * initialHours + intermittent * intermittentHours + final * finalHours; peakCurrent = Math.max(run + initial, run + intermittent, run + final);
  }
  const requiredAh = baseAh * aging * margin / (efficiency * usable * temperature), candidate = pos(v.candidateAh, "Candidate capacity"), strings = Math.max(1, Math.ceil(requiredAh / candidate)), installedAh = strings * candidate, installedKwh = installedAh * bankVoltage / 1000, peakC = peakCurrent / installedAh, allowedC = pos(v.maxDischargeRate, "Allowed peak discharge rate"), peakPass = peakC <= allowedC, capacityPass = installedAh >= requiredAh;
  const recharge = pos(v.rechargeHours, "Recharge time"), chargerLoad = nonneg(v.chargerContinuousLoad, "Charging-time continuous load"), recoveryCurrent = requiredAh / recharge, chargerCurrent = chargerLoad + recoveryCurrent, protectionCurrent = Math.max(peakCurrent, chargerCurrent) * 1.25;
  return result(capacityPass && peakPass ? `${f(requiredAh)} Ah required` : "Review required", !capacityPass || !peakPass ? "warning" : strings > 2 ? "caution" : "ok", `The preliminary ${mode === "basic" ? "constant-load" : "duty-cycle"} screen requires ${f(requiredAh)} Ah; ${strings} parallel ${f(candidate)} Ah string${strings === 1 ? "" : "s"} provide ${f(installedAh)} Ah.`, [["Series cells or blocks", `${cells}`], ["Nominal bank voltage", `${f(bankVoltage)} VDC`], ["End-of-discharge bank voltage", `${f(endVoltage)} VDC`], ["Integrated base capacity", `${f(baseAh)} Ah`], ["Corrected required capacity", `${f(requiredAh)} Ah`], ["Parallel strings", `${strings}`], ["Installed bank capacity", `${f(installedAh)} Ah`], ["Installed nominal energy", `${f(installedKwh)} kWh`], ["Peak DC load", `${f(peakCurrent)} A`], ["Peak discharge rate", `${f(peakC)} C`], ["Peak-rate check", peakPass ? "Passes entered C-rate" : "Exceeds entered C-rate"], ["Capacity recovery current", `${f(recoveryCurrent)} A`], ["Preliminary charger current", `${f(chargerCurrent)} A`], ["DC protection design-current reference", `${f(protectionCurrent)} A`], ["Duty duration", `${f(duration)} h`]], ["Use the exact battery manufacturer's discharge table or Kt data at the selected end voltage, minimum temperature, and each duty-cycle period before choosing a cell model.", "Verify maximum and minimum DC bus voltage, float/equalize limits, charger redundancy and ripple, battery short-circuit current, DC protection selectivity, cable voltage drop, ventilation, enclosure, and maintenance access.", strings > 1 ? "Parallel battery strings require current sharing, individual string protection and isolation, monitoring, and maintenance procedures." : "Confirm the candidate battery can supply the peak current at end-of-discharge voltage, not only at nominal voltage."]);
}

const residentialServiceSizes = [60, 100, 125, 150, 175, 200, 225, 250, 300, 320, 350, 400, 500, 600, 800, 1000, 1200];
function residentialLoad(v: Values): CalculationResult {
  const method = s(v.method), voltage = pos(v.voltage, "Service voltage"), existing = pos(v.existingService, "Existing service rating"), margin = 1 + bounded(v.designMargin, "Planning margin", 0, 100) / 100, cooling = nonneg(v.coolingLoad, "Cooling load"), heating = nonneg(v.heatingLoad, "Heating load"), hvac = Math.max(cooling, heating), ev = nonneg(v.evPower, "EV charger power") * 1000 * bounded(v.evFactor, "EVSE contribution factor", 0, 200) / 100;
  let connected = 0, baseDemand = 0, breakdown = "";
  if (method === "nec-optional") {
    const area = pos(v.floorArea, "Dwelling floor area"), small = integerAtLeast(v.smallApplianceCircuits, "Small-appliance circuits", 2), laundry = integerAtLeast(v.laundryCircuits, "Laundry circuits", 1), fixed = nonneg(v.fixedAppliances, "Fixed appliance load"), fixedCount = integerNonneg(v.fixedApplianceCount, "Fixed appliance count");
    const fixedFactor = s(v.applyApplianceDemand) === "yes" && fixedCount >= 4 ? 0.75 : 1, general = area * 3 + small * 1500 + laundry * 1500 + fixed * fixedFactor + nonneg(v.rangeDemand, "Range demand") + nonneg(v.dryerDemand, "Dryer demand") + nonneg(v.otherGeneralLoad, "Other general load");
    baseDemand = Math.min(general, 10000) + Math.max(0, general - 10000) * 0.4; connected = area * 3 + small * 1500 + laundry * 1500 + fixed + nonneg(v.rangeDemand, "Range demand") + nonneg(v.dryerDemand, "Dryer demand") + nonneg(v.otherGeneralLoad, "Other general load") + cooling + heating + ev;
    breakdown = `The optional-method screening general load is ${f(general)} VA before the first-10-kVA and 40% demand step.`;
  } else {
    const general = nonneg(v.planningGeneral, "General connected load") * 1000, kitchen = nonneg(v.planningKitchen, "Kitchen connected load") * 1000, other = nonneg(v.planningOther, "Other connected load") * 1000;
    baseDemand = general * bounded(v.planningGeneralFactor, "General demand factor", 0, 100) / 100 + kitchen * bounded(v.planningKitchenFactor, "Kitchen demand factor", 0, 100) / 100 + other * bounded(v.planningOtherFactor, "Other demand factor", 0, 100) / 100; connected = general + kitchen + other + cooling + heating + ev;
    breakdown = "Demand factors are user-entered planning assumptions, not code defaults.";
  }
  const demandVa = (baseDemand + hvac + ev) * margin, current = demandVa / voltage, service = next(current, residentialServiceSizes), spare = existing - current, utilization = current / existing * 100;
  return result(`${f(current)} A demand`, current > existing ? "warning" : utilization > 80 ? "caution" : "ok", `${f(demandVa / 1000)} kVA corresponds to ${f(current)} A at ${f(voltage)} V. ${breakdown}`, [["Connected load reference", `${f(connected / 1000)} kVA`], ["Demand before margin", `${f((baseDemand + hvac + ev) / 1000)} kVA`], ["HVAC contribution", `${f(hvac / 1000)} kVA`], ["EVSE contribution", `${f(ev / 1000)} kVA`], ["Demand after margin", `${f(demandVa / 1000)} kVA`], ["Calculated service current", `${f(current)} A`], ["Next listed service reference", `${service} A`], ["Existing service utilization", `${f(utilization)}%`], ["Remaining calculated capacity", spare >= 0 ? `${f(spare)} A` : `${f(Math.abs(spare))} A over entered service`]], [method === "nec-optional" ? "Verify eligibility for the NEC 2023 optional method and every range, dryer, appliance, heating, cooling, EVSE, and local amendment input against the adopted code and authority worksheet." : "Replace every planning demand factor with values accepted by the local utility, national rules, and project designer.", "Do not select the main breaker or service conductors from current alone; verify service-equipment rating, conductor ampacity, temperature, installation, neutral loading, fault current, grounding, SPD, and utility limits.", current > existing ? "The calculated demand exceeds the entered service. Review service upgrade, permitted load management, or a qualified measured-demand method before adding load." : "The entered service exceeds the calculated demand, but this screening result does not by itself approve added equipment."]);
}

const nemaData: Record<string, { ip: string; use: string; extras: string }> = {
  "1": { ip: "IP20", use: "Indoor general purpose", extras: "Contact and falling dirt" }, "2": { ip: "IP22", use: "Indoor dripping water", extras: "Falling dirt and dripping water" },
  "3": { ip: "IP55", use: "Outdoor rain, sleet and windblown dust", extras: "External ice formation does not damage enclosure" }, "3r": { ip: "IP24", use: "Outdoor rain and sleet", extras: "Not the Type 3 windblown-dust level" }, "3s": { ip: "IP55", use: "Outdoor dust, rain and sleet", extras: "External mechanisms remain operable when ice-laden" },
  "3x": { ip: "IP55", use: "Corrosive outdoor dust and weather", extras: "Type 3 environmental duties plus corrosion resistance" }, "3rx": { ip: "IP24", use: "Corrosive outdoor rain and sleet", extras: "Type 3R duties plus corrosion resistance" }, "3sx": { ip: "IP55", use: "Corrosive outdoor dust and weather", extras: "Type 3S duties plus corrosion resistance" },
  "4": { ip: "IP66", use: "Indoor or outdoor hose-directed water", extras: "Dust, rain, sleet, splashing and hose-directed water" }, "4x": { ip: "IP66", use: "Corrosive washdown or outdoor service", extras: "Type 4 duties plus corrosion resistance" }, "5": { ip: "IP53", use: "Indoor dust exposure", extras: "Settling airborne dust, lint and fibers" },
  "6": { ip: "IP67", use: "Temporary submersion", extras: "Check exact NEMA test and application limits" }, "6p": { ip: "IP68", use: "Prolonged submersion", extras: "Check exact depth, duration and corrosion requirement" }, "12": { ip: "IP54", use: "Indoor industrial dust and dripping liquids", extras: "Non-corrosive dripping liquids" }, "12k": { ip: "IP54", use: "Indoor industrial enclosure with knockouts", extras: "Type 12 duties with knockouts" }, "13": { ip: "IP54", use: "Indoor dust, spray, oil and coolant", extras: "Spraying water, oil and non-corrosive coolant" }
};
function nemaIp(v: Values): CalculationResult {
  const mode = s(v.mode);
  if (mode === "nema-to-ip") {
    const type = s(v.nemaType), data = nemaData[type]; if (!data) throw new Error("Select a supported NEMA enclosure Type.");
    return result(`Type ${type.toUpperCase()} → ${data.ip}`, "ok", `NEMA Type ${type.toUpperCase()} meets or exceeds the shown IEC ingress cross-reference; this is not an equivalent certification.`, [["NEMA Type", type.toUpperCase()], ["Ingress cross-reference", data.ip], ["Typical application", data.use], ["NEMA-specific considerations", data.extras], ["Conversion direction", "NEMA to IP only"]], ["Use the current official NEMA 250 correlation table and exact product certification for specification.", "Do not infer that a product marked only with the IP code has this NEMA Type.", "Verify all installed accessories and openings preserve the enclosure rating."]);
  }
  if (mode === "ip-to-nema") {
    const solid = Number(s(v.solidDigit)), water = Number(s(v.waterDigit)); if (!Number.isInteger(solid) || solid < 0 || solid > 6 || !Number.isInteger(water) || water < 0 || water > 9) throw new Error("Select valid IP digits.");
    const solidText = ["No rated solid-object protection", "Objects 50 mm and larger", "Objects 12.5 mm and larger and finger access", "Objects 2.5 mm and larger", "Objects 1.0 mm and larger", "Dust protected; limited ingress permitted", "Dust-tight"][solid];
    const waterText = ["No rated water protection", "Vertical dripping water", "Dripping water with enclosure tilted 15°", "Spraying water", "Splashing water", "Water jets", "Powerful water jets", "Temporary immersion", "Continuous immersion under specified conditions", "High-pressure, high-temperature water jets"][water];
    const references = Object.entries(nemaData).map(([type, data]) => ({ type: `NEMA ${type.toUpperCase()}`, solid: Number(data.ip[2]), water: Number(data.ip[3]) }));
    const exact = references.filter((item) => item.solid === solid && item.water === water);
    const candidates = exact.length ? exact : references.filter((item) => item.solid >= solid && item.water >= water);
    const candidateText = candidates.length ? candidates.map((item) => item.type).join(" / ") : "No common NEMA ingress reference";
    return result(candidateText, "caution", `For ingress only, ${candidateText} ${candidates.length === 1 ? "is" : "are"} the closest common cross-reference for IP${solid}${water}. This is not an equivalent conversion or certification.`, [["Entered IP rating", `IP${solid}${water}`], ["Solids / access digit", `${solid} – ${solidText}`], ["Water digit", `${water} – ${waterText}`], ["Common NEMA ingress reference", candidateText], ["Equivalent NEMA Type", "Not established"], ["Still not covered by IP", "Corrosion, icing, oil/coolant and construction requirements"], ["Required next step", "Use Industrial Sizing Engine and verify certification"]], [water === 8 ? "Obtain the manufacturer's exact IPX8 depth, duration, orientation, and installation conditions." : "Confirm the exact IEC 60529 test and product marking for the application.", "Use this only to identify NEMA Types whose published ingress cross-reference may satisfy the selected IP digits. Do not describe the result as an equivalent NEMA rating.", "Use Industrial Sizing Engine to evaluate the missing environment conditions, then verify the exact enclosure and installed assembly under NEMA 250, UL 50E, CSA, or the required certification."]);
  }
  const location = s(v.location), water = s(v.waterExposure), dust = s(v.dust), corrosion = s(v.corrosion) === "yes" || location === "coastal", oil = s(v.oilCoolant), ice = s(v.iceOperation), hazardous = s(v.hazardous) === "yes", condensation = s(v.condensation) === "yes";
  let type = "1";
  if (water === "prolonged") type = "6p"; else if (water === "temporary") type = "6"; else if (water === "hose" || water === "high-pressure") type = corrosion ? "4x" : "4"; else if (["outdoor", "coastal", "sheltered"].includes(location)) { if (ice === "operable") type = corrosion ? "3sx" : "3s"; else if (["heavy", "conductive"].includes(dust)) type = corrosion ? "3x" : "3"; else type = corrosion ? "3rx" : "3r"; } else if (oil === "spray") type = "13"; else if (oil === "drip" || dust !== "low") type = "12"; else if (water === "drip" || water === "rain") type = "2";
  const data = nemaData[type];
  return result(`NEMA Type ${type.toUpperCase()}`, hazardous || type === "6p" || corrosion ? "caution" : "ok", `${data.use}; ${data.ip} is the one-way minimum ingress cross-reference shown for comparison.`, [["Starting NEMA Type", type.toUpperCase()], ["Ingress cross-reference", data.ip], ["Location", readable(location)], ["Water exposure", readable(water)], ["Dust exposure", readable(dust)], ["Corrosion requirement", corrosion ? "Required" : "Not selected"], ["Oil / coolant", readable(oil)], ["External ice", readable(ice)], ["Condensation control", condensation ? "Review heater, drain, breather or climate control" : "No special risk selected"], ["Hazardous location", hazardous ? "Separate certified protection required" : "Not selected"], ["Additional Type considerations", data.extras]], ["Treat this as a product-family starting point, not a certification or permission to substitute ratings.", hazardous ? "A NEMA or IP ingress rating does not provide hazardous-location certification. Select separately certified equipment for the exact zone/division, gas, dust, group and temperature class." : corrosion ? "Confirm the enclosure material, coating, gasket, hardware, cable glands, and chemical compatibility for the actual corrosive agent." : "Confirm whether corrosion resistance is required by the site or product specification.", "Verify solar/UV exposure, temperature, condensation, drainage, impact, fire behavior, EMC, and every installed opening or accessory."]);
}

function result(primary: string, severity: "ok" | "caution" | "warning", summary: string, metrics: [string, string][], recommendations: string[]): CalculationResult { return { primary, severity, summary, metrics: metrics.map(([label, value]) => ({ label, value })), recommendations }; }
function pos(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be greater than zero.`); return n; }
function nonneg(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be zero or greater.`); return n; }
function integerNonneg(value: unknown, label: string) { const n = nonneg(value, label); if (!Number.isInteger(n)) throw new Error(`${label} must be a whole number.`); return n; }
function integerAtLeast(value: unknown, label: string, min: number) { const n = integerNonneg(value, label); if (n < min) throw new Error(`${label} must be at least ${min}.`); return n; }
function num(value: unknown, label: string) { const n = Number(value); if (!Number.isFinite(n)) throw new Error(`${label} must be a valid number.`); return n; }
function bounded(value: unknown, label: string, min: number, max: number) { const n = num(value, label); if (n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`); return n; }
function next(value: number, sizes: number[]) { return sizes.find(x => x >= value) ?? sizes[sizes.length - 1]; }
function previous(value: number, sizes: number[]) { return [...sizes].reverse().find(x => x <= value) ?? sizes[0]; }
function s(value: unknown) { return String(value ?? ""); }
function f(value: number) { if (!Number.isFinite(value)) return "0"; if (Math.abs(value) >= 1000) return value.toFixed(0); if (Math.abs(value) >= 100) return value.toFixed(1); if (Math.abs(value) >= 10) return value.toFixed(2); return value.toFixed(3); }
function readable(value: string) { return value.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function duration(hours: number) { const h = Math.floor(hours), minutes = Math.round((hours - h) * 60); return `${h} h ${minutes} min`; }
function toLabel(unit: string) { return ({ w: "W", kw: "kW", mw: "MW", hp: "hp", btuh: "BTU/h", j: "J", kj: "kJ", mj: "MJ", wh: "Wh", kwh: "kWh", mwh: "MWh" } as Record<string, string>)[unit] ?? unit; }
