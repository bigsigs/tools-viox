import type { ToolCategory } from "./types";

type CategoryDefinition = {
  slug: ToolCategory;
  title: string;
  deck: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  overviewTitle: string;
  overview: string[];
};

export const categories: Record<ToolCategory, CategoryDefinition> = {
  "electrical-fundamentals": {
    slug: "electrical-fundamentals", title: "Electrical Fundamentals & Conversion", deck: "Core formulas, phase power, resistance, and unit conversion",
    description: "Everyday calculators for voltage, current, resistance, power, energy, power factor, lighting, and electrical units.",
    seoTitle: "Electrical Formula & Power Conversion Calculators | VIOX",
    seoDescription: "Use Ohm's law, watts-to-amps, three-phase power, power factor, resistor, lighting, energy, and electrical unit conversion calculators.",
    overviewTitle: "Start with the electrical quantities you know",
    overview: ["These tools connect voltage, current, resistance, active and apparent power, energy, time, and common engineering units.", "Use the result as an input to the appropriate cable, protection, motor, battery, or distribution workflow rather than as final equipment selection."]
  },
  "cable-wire": {
    slug: "cable-wire", title: "Cable, Wire & Voltage Drop Tools", deck: "Conductor size, ampacity, voltage drop, and fault withstand",
    description: "Engineering calculators for cable sizing, AC and DC voltage drop, derating, AWG conversion, PE conductors, and thermal withstand.",
    seoTitle: "Cable Size, Voltage Drop & Wire Gauge Calculators | VIOX",
    seoDescription: "Calculate cable size, AC or DC voltage drop, cable derating, AWG and mm² conversion, protective conductor size, and fault withstand.",
    overviewTitle: "Check conductor performance from load to fault duty",
    overview: ["Conductor selection combines load current, installation derating, voltage drop, material, insulation, route length, and short-circuit thermal duty.", "Verify the final conductor against the adopted wiring standard, terminal temperature, installation method, grouping, ambient conditions, and protective-device clearing time."]
  },
  "cable-management": {
    slug: "cable-management", title: "Cable Management & Termination Tools", deck: "Conduit, tray, glands, lugs, and cable entry",
    description: "Practical tools for conduit and cable tray fill, cable gland selection, cable lugs, and termination planning.",
    seoTitle: "Cable Gland, Lug, Conduit & Tray Fill Calculators | VIOX",
    seoDescription: "Select cable glands and lugs and calculate conduit or cable tray fill for practical cable routing, entry, and termination planning.",
    overviewTitle: "Move from selected conductor to installed termination",
    overview: ["Cable outside diameter, construction, quantity, route system, entry thread, sealing duty, conductor area, material, and stud size determine the installation hardware.", "Confirm exact manufacturer clamping ranges, listed fittings, fill rules, bend radius, pulling limits, crimp tooling, ingress rating, and environmental compatibility."]
  },
  "circuit-protection": {
    slug: "circuit-protection", title: "Circuit Protection & Fault Tools", deck: "Breakers, fuses, fault current, selectivity, and arc flash",
    description: "Tools for breaker, fuse, RCD and RCBO selection, fault current, loop impedance, inrush, coordination, and arc-flash screening.",
    seoTitle: "Circuit Breaker, Fuse & Fault Calculators | VIOX",
    seoDescription: "Calculate breaker and fuse size, fault current, loop impedance, MCB inrush, selectivity, RCD or RCBO selection, and arc-flash energy.",
    overviewTitle: "Coordinate load, trip behavior, and fault duty",
    overview: ["Protective-device selection must coordinate design current, conductor capacity, overload behavior, instantaneous operation, fault current, breaking capacity, and disconnection time.", "Use exact manufacturer curves and coordination tables plus the applicable installation and arc-flash methods for final engineering decisions."]
  },
  "power-distribution": {
    slug: "power-distribution", title: "Power Distribution & Panel Tools", deck: "Transformers, demand, ATS, busbars, enclosures, and thermal checks",
    description: "Distribution and panel calculators for transformer capacity, demand, ATS, busbars, terminals, heat, insulation spacing, and enclosures.",
    seoTitle: "Power Distribution & Electrical Panel Calculators | VIOX",
    seoDescription: "Calculate transformer size, maximum demand, ATS rating, busbar duty, panel heat, terminal loss, clearance, creepage, and enclosure ratings.",
    overviewTitle: "Design the distribution assembly as one system",
    overview: ["Power distribution joins source capacity, demand, switching, busbars, short-circuit forces, connections, temperature rise, insulation coordination, and enclosure conditions.", "Final verification applies to the complete assembly, including supports, joints, ventilation, protective devices, clearances, entries, and the relevant switchgear standard."]
  },
  "motor-control": {
    slug: "motor-control", title: "Motors, Contactors & Drives", deck: "Motor current, starting, contactors, voltage quality, and VFDs",
    description: "Tools for motor current, starter and contactor selection, starting voltage drop, voltage unbalance, and VFD sizing.",
    seoTitle: "Motor, Contactor, Starter & VFD Calculators | VIOX",
    seoDescription: "Calculate motor current, starter and contactor size, starting voltage drop, voltage unbalance, overload range, and VFD requirements.",
    overviewTitle: "Size the complete motor operating path",
    overview: ["Motor circuits depend on full-load and starting current, duty, acceleration, load torque, utilization category, voltage quality, and drive environment.", "Confirm the exact motor nameplate and manufacturer coordination tables for the contactor, overload relay, breaker, starter, and VFD."]
  },
  "solar-storage": {
    slug: "solar-storage", title: "Solar, Battery & Energy Tools", deck: "PV strings, batteries, off-grid systems, charging, and energy",
    description: "Calculators for PV strings and combiners, off-grid solar, battery capacity, C-rate, charging time, stationary systems, and energy cost.",
    seoTitle: "Solar PV, Battery & Energy Calculators | VIOX",
    seoDescription: "Calculate PV string and combiner size, off-grid solar, battery capacity, C-rate, runtime, charging time, stationary DC systems, and energy cost.",
    overviewTitle: "Connect generation, storage, load, and protection",
    overview: ["Solar and battery planning links temperature-corrected PV voltage, daily energy, array output, battery capacity, operating limits, charge rate, runtime, and DC protection.", "Final selection requires exact module, inverter, battery, charger, BMS, protective-device, and local installation data."]
  },
  "surge-protection": {
    slug: "surge-protection", title: "Surge & Lightning Protection Tools", deck: "Lightning exposure, SPD selection, coordination, and backup protection",
    description: "Tools for lightning-risk screening and AC, DC, and PV SPD type, voltage, coordination, and backup-fuse selection.",
    seoTitle: "Surge & Lightning Protection Calculators | VIOX",
    seoDescription: "Screen lightning exposure and select Type 1, Type 2, Type 3, AC, DC, or PV SPDs, coordination, voltage ratings, and backup protection.",
    overviewTitle: "Plan exposure, SPD duty, and coordination",
    overview: ["Start with lightning exposure, supply route, installation point, earthing arrangement, equipment withstand, and prospective fault current.", "Final selection must use the applicable lightning and SPD standards with exact device ratings, backup protection, wiring, and coordination distance."]
  },
  "ev-charging": {
    slug: "ev-charging", title: "EV Charging Tools", deck: "Charging time, cost, current, demand, and feeder planning",
    description: "Calculators for EV charging current, charging duration and cost, multiple-charger demand, and feeder planning.",
    seoTitle: "EV Charging Time, Cost & Load Calculators | VIOX",
    seoDescription: "Calculate EV charging time and cost, charger current, multiple-charger demand, simultaneity, feeder load, and preliminary protection needs.",
    overviewTitle: "Connect the vehicle charging session to the installation",
    overview: ["EV planning combines battery energy, charging power, efficiency, tariff, phase arrangement, charger quantity, simultaneity, and distribution capacity.", "Continue with the related breaker, RCD or RCBO, SPD, cable, voltage-drop, and fault-current checks required by the charger instructions and local rules."]
  }
};
