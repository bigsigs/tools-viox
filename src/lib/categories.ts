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
    slug: "electrical-fundamentals", title: "Electrical Fundamentals & Circuit Analysis", deck: "Core formulas, phase power, resistance, circuits, and units",
    description: "Everyday calculators for voltage, current, resistance, power, energy, passive circuits, power factor, and electrical units.",
    seoTitle: "Electrical Formula & Power Conversion Calculators | VIOX",
    seoDescription: "Use Ohm's law, watts-to-amps, three-phase power, power factor, resistor network, circuit analysis, energy, and electrical unit calculators.",
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
    slug: "cable-management", title: "Cable Management & Installation", deck: "Conduit, tray, glands, lugs, routing, and cable entry",
    description: "Practical tools for conduit and cable tray fill, cable gland selection, cable lugs, routing, pulling, and installation planning.",
    seoTitle: "Cable Gland, Lug, Conduit & Tray Fill Calculators | VIOX",
    seoDescription: "Select cable glands and lugs and calculate conduit or cable tray fill for practical cable routing, entry, and termination planning.",
    overviewTitle: "Move from selected conductor to installed termination",
    overview: ["Cable outside diameter, construction, quantity, route system, entry thread, sealing duty, conductor area, material, and stud size determine the installation hardware.", "Confirm exact manufacturer clamping ranges, listed fittings, fill rules, bend radius, pulling limits, crimp tooling, ingress rating, and environmental compatibility."]
  },
  "circuit-protection": {
    slug: "circuit-protection", title: "Circuit Protection & Grounding", deck: "Breakers, fuses, fault current, grounding, and arc flash",
    description: "Tools for breaker, fuse, RCD and RCBO selection, fault current, grounding and loop impedance, coordination, and arc-flash screening.",
    seoTitle: "Circuit Breaker, Fuse & Fault Calculators | VIOX",
    seoDescription: "Calculate breaker and fuse size, fault current, loop impedance, MCB inrush, selectivity, RCD or RCBO selection, and arc-flash energy.",
    overviewTitle: "Coordinate load, trip behavior, and fault duty",
    overview: ["Protective-device selection must coordinate design current, conductor capacity, overload behavior, instantaneous operation, fault current, breaking capacity, and disconnection time.", "Use exact manufacturer curves and coordination tables plus the applicable installation and arc-flash methods for final engineering decisions."]
  },
  "power-distribution": {
    slug: "power-distribution", title: "Power Systems & Distribution", deck: "Transformers, demand, ATS, busbars, power quality, and generators",
    description: "Power-system calculators for transformer capacity, demand, ATS selection, busbar duty, generators, harmonics, and distribution planning.",
    seoTitle: "Power Systems & Distribution Calculators | VIOX",
    seoDescription: "Calculate transformer size and impedance, maximum demand, ATS and generator ratings, busbar duty, power factor, harmonics, and distribution loads.",
    overviewTitle: "Design the source and distribution path as one system",
    overview: ["Power-system planning joins source capacity, demand, switching, transformers, generators, busbars, fault duty, power factor, and waveform quality.", "Final verification requires utility and source data, exact equipment ratings, protection studies, operating scenarios, and the applicable distribution standard."]
  },
  "panels-enclosures": {
    slug: "panels-enclosures", title: "Panels, Enclosures & Thermal", deck: "Panel heat, terminals, clearances, creepage, and enclosure ratings",
    description: "Control-panel calculators for heat loss, temperature rise, terminal heating, insulation spacing, ventilation, and enclosure selection.",
    seoTitle: "Electrical Panel, Enclosure & Thermal Calculators | VIOX",
    seoDescription: "Calculate panel heat loss, enclosure temperature rise, terminal heating, clearance and creepage, ventilation needs, and NEMA or IP ratings.",
    overviewTitle: "Verify the conditions inside the assembled panel",
    overview: ["Panel reliability depends on component losses, connection resistance, enclosure surface and airflow, ambient conditions, insulation spacing, and ingress protection.", "Confirm the complete assembly with exact component loss data, thermal limits, production tolerances, ventilation hardware, enclosure construction, and the relevant panel standard."]
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
    slug: "solar-storage", title: "Solar, Battery & Backup Power", deck: "PV strings, batteries, inverters, UPS, charging, and backup energy",
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
  },
  "lighting-design": {
    slug: "lighting-design", title: "Lighting Design", deck: "Lux, lumens, fixtures, circuits, efficiency, and emergency lighting",
    description: "Lighting calculators for illuminance, lumen output, fixture quantity, connected load, LED energy, and emergency backup planning.",
    seoTitle: "Lighting Design, Lux, Lumen & Fixture Calculators | VIOX",
    seoDescription: "Calculate lux, lumens, fixture quantity, lighting circuit load, LED energy use, voltage drop, and emergency-lighting battery requirements.",
    overviewTitle: "Connect the lighting target to the electrical circuit",
    overview: ["A preliminary lighting design starts with the space, maintained illuminance, fixture output, utilization, maintenance, mounting, and operating schedule.", "Complete design still requires photometric files, glare and uniformity review, emergency-lighting rules, driver inrush, circuit protection, controls, and field verification."]
  }
};
