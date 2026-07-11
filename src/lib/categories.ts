import type { ToolCategory } from "./types";

export const categories: Record<ToolCategory, {
  slug: ToolCategory;
  title: string;
  deck: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  overviewTitle: string;
  overview: string[];
}> = {
  "surge-protection": {
    slug: "surge-protection",
    title: "Surge Protection Tools",
    deck: "SPD selection and coordination",
    description: "Calculators for AC, DC, and PV surge protection selection workflows.",
    seoTitle: "Surge Protection Calculators & SPD Selection Tools | VIOX",
    seoDescription: "Use free SPD calculators to screen Type 1, Type 2, Type 3, AC, DC, and PV surge protection by exposure, earthing, voltage, and installation point.",
    overviewTitle: "Plan SPD type, voltage, and coordination",
    overview: ["Start with the installation origin, lightning exposure, supply route, earthing arrangement, and equipment withstand level. The tools then narrow the SPD type, connection arrangement, continuous operating voltage, and coordination checks.", "Calculator results are screening references. Final selection must use the applicable IEC or local standard and the exact VIOX SPD datasheet, backup protection, short-circuit rating, and wiring diagram."]
  },
  "circuit-protection": {
    slug: "circuit-protection",
    title: "Circuit Protection Tools",
    deck: "Breaker sizing and protection checks",
    description: "Tools for estimating MCB, MCCB, RCBO, fuse, and load protection requirements.",
    seoTitle: "Circuit Breaker, Fuse & RCBO Calculators | VIOX",
    seoDescription: "Calculate breaker and fuse size, fault current, MCB inrush compatibility, and RCD or RCBO selection for low-voltage circuit protection planning.",
    overviewTitle: "Coordinate load, conductor, trip curve, and fault duty",
    overview: ["Protective-device selection is more than rounding load current to the next rating. The circuit must coordinate design current, conductor ampacity, overload behavior, magnetic or instantaneous operation, prospective fault current, and breaking capacity.", "Use these calculators together, then verify disconnection time, selectivity, backup protection, ambient derating, and the exact VIOX MCB, MCCB, RCBO, or fuse product data."]
  },
  "cable-wiring": {
    slug: "cable-wiring",
    title: "Cable and Wiring Tools",
    deck: "Cable sizing, voltage drop, and entry planning",
    description: "Practical calculators for conductor sizing, voltage drop, AWG conversion, conduit fill, cable lugs, and cable gland selection.",
    seoTitle: "Cable Size, Voltage Drop & AWG Calculators | VIOX",
    seoDescription: "Calculate cable size, AC or DC voltage drop, AWG wire size, mm² conversion, conduit fill, cable gland size, and cable lug selection online.",
    overviewTitle: "Move from conductor calculation to termination",
    overview: ["Cable planning combines ampacity, voltage drop, installation derating, conductor material, route length, raceway fill, and termination compatibility. Metric and AWG sizes also require careful comparison because their nominal areas do not match exactly.", "After finding a preliminary conductor, verify the applicable wiring standard, insulation and terminal temperature, short-circuit withstand, cable outside diameter, gland clamping range, and approved lug or crimp system."]
  },
  "motor-control": {
    slug: "motor-control",
    title: "Motor Control Tools",
    deck: "Motor current and starter selection",
    description: "Tools for estimating motor full-load current, contactor duty, starter method, overload range, and phase-voltage conditions.",
    seoTitle: "Motor Current & Starter Selection Calculators | VIOX",
    seoDescription: "Calculate three-phase motor current, starter and contactor size, overload range, starting method, and voltage unbalance for motor-control planning.",
    overviewTitle: "Size the complete motor starting path",
    overview: ["Motor control begins with full-load current but also depends on starting current, duty, starts per hour, acceleration time, load torque, utilization category, and voltage quality. The calculators screen these inputs together.", "Confirm the final contactor, overload relay, motor protection circuit breaker, starter coordination type, enclosure, and manufacturer performance tables before procurement."]
  },
  "ev-charging": {
    slug: "ev-charging",
    title: "EV Charging Tools",
    deck: "EV charger load planning",
    description: "Calculators for EV charging current, simultaneity, feeder demand, breaker sizing, and residual-current protection planning.",
    seoTitle: "EV Charger Load & Protection Calculators | VIOX",
    seoDescription: "Calculate EV charger current and feeder demand, then screen breaker, RCBO, RCD type, 6 mA DC detection, poles, and breaking-capacity requirements.",
    overviewTitle: "Plan EV demand and protective devices together",
    overview: ["EV charging design must account for charger power, phase arrangement, quantity, simultaneity or load management, feeder capacity, and prospective fault current. Residual-current waveform protection is a separate decision from overcurrent protection.", "Verify the charger instructions, local EV installation rules, upstream distribution capacity, SPD coordination, DC leakage detection, RCD or RCBO type, and enclosure conditions."]
  },
  "power-conversion": {
    slug: "power-conversion",
    title: "Power Conversion Tools",
    deck: "kW, kVA, amps, and phase conversions",
    description: "Electrical conversion calculators for kW, kVA, amps, phase current, transformer loading, battery runtime, and energy cost.",
    seoTitle: "kW, kVA, Amps & Electrical Conversion Calculators | VIOX",
    seoDescription: "Convert kW, kVA, and amps; calculate three-phase current, transformer kVA, battery C-rate and runtime, and daily or annual electricity cost.",
    overviewTitle: "Keep real power, apparent power, current, and energy distinct",
    overview: ["Electrical calculations must distinguish kW from kVA, power from energy, line voltage from phase voltage, and output power from electrical input. Power factor and efficiency determine the current that equipment and protection must carry.", "Use the conversion results as inputs to the related breaker, cable, contactor, transformer, battery, and energy-planning workflows rather than treating a converted number as final equipment selection."]
  },
  "panel-design": {
    slug: "panel-design",
    title: "Panel Design Tools",
    deck: "Busbar and enclosure planning",
    description: "Reference tools for busbar current, short-circuit force, terminal heating, cable entry, and low-voltage panel design tasks.",
    seoTitle: "Busbar, Terminal & Panel Design Calculators | VIOX",
    seoDescription: "Calculate busbar current and short-circuit force, terminal I²R heating, cable entry, and supporting low-voltage switchboard design checks online.",
    overviewTitle: "Check electrical and mechanical panel limits",
    overview: ["Panel design joins current capacity, temperature rise, clearances, creepage, short-circuit withstand, busbar support loading, connection resistance, enclosure conditions, and protective-device coordination.", "Simplified calculations cannot replace verification of the complete assembly. Confirm material properties, joint design, supports, fasteners, terminals, airflow, enclosure temperature, and the applicable switchgear or assembly standard."]
  }
};
