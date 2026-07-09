import type { ToolDefinition } from "./types";

const phaseOptions = [
  { value: "dc", label: "DC" },
  { value: "single", label: "Single-phase AC" },
  { value: "three", label: "Three-phase AC" }
];

export const tools: ToolDefinition[] = [
  {
    slug: "spd-calculator",
    title: "SPD Calculator",
    shortTitle: "SPD",
    category: "surge-protection",
    description: "Choose a starting surge protective device type for AC, DC, or PV systems based on exposure, installation point, and system earthing.",
    intent: "Initial SPD type selection before checking IEC 61643 requirements, local code, and manufacturer data.",
    fields: [
      { id: "building", label: "External lightning protection", type: "select", defaultValue: "no", options: [
        { value: "yes", label: "External LPS present" },
        { value: "no", label: "No external LPS" },
        { value: "unknown", label: "Unknown" }
      ] },
      { id: "supply", label: "Supply exposure", type: "select", defaultValue: "underground", options: [
        { value: "underground", label: "Underground service" },
        { value: "overhead", label: "Overhead service" },
        { value: "mixed", label: "Mixed / rural exposure" }
      ] },
      { id: "location", label: "Installation point", type: "select", defaultValue: "main", options: [
        { value: "main", label: "Main distribution board" },
        { value: "sub", label: "Sub distribution board" },
        { value: "equipment", label: "Sensitive equipment panel" }
      ] },
      { id: "system", label: "System type", type: "select", defaultValue: "tn", options: [
        { value: "tn", label: "TN-S / TN-C-S" },
        { value: "tt", label: "TT" },
        { value: "it", label: "IT" },
        { value: "pv", label: "DC / PV array" }
      ] }
    ],
    formula: "The calculator uses a rule-based selection matrix: higher lightning exposure points to Type 1+2 protection, downstream distribution points normally start with Type 2, and sensitive equipment may need Type 3 coordination.",
    assumptions: ["Low-voltage power system", "Preliminary product family selection only", "Final SPD rating must match system voltage, earthing, short-circuit conditions, and installation standard"],
    warnings: ["Do not use this output as proof of IEC 61643 compliance.", "PV and DC SPDs must be DC-rated and selected against maximum array voltage."],
    faqs: [
      { question: "Is Type 1+2 always required for overhead supply?", answer: "Not always, but overhead supply increases lightning exposure. Use the result as a prompt to check the project risk assessment and local requirements." },
      { question: "Can this calculator choose Uc, Up, In, or Imax?", answer: "This first version chooses the SPD type family. Voltage and discharge-current ratings still need project and product datasheet verification." }
    ],
    relatedTools: ["voltage-drop-calculator", "ev-charger-load-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX SPD support", href: "https://viox.com/contact" },
      { label: "Surge protection guide", href: "https://viox.com/what-is-a-surge-protective-device/" }
    ],
    keywords: ["spd calculator", "surge protection calculator", "type 1 type 2 spd selection"]
  },
  {
    slug: "voltage-drop-calculator",
    title: "Voltage Drop Calculator",
    shortTitle: "Voltage Drop",
    category: "cable-wiring",
    description: "Estimate voltage drop by current, conductor length, material, cross-section, and phase system.",
    intent: "Quick voltage drop check for cable and panel design discussions.",
    fields: [
      { id: "phase", label: "Circuit type", type: "select", defaultValue: "three", options: phaseOptions },
      { id: "material", label: "Conductor material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" }
      ] },
      { id: "current", label: "Load current", type: "number", defaultValue: 32, unit: "A", min: 0 },
      { id: "voltage", label: "System voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "length", label: "One-way cable length", type: "number", defaultValue: 50, unit: "m", min: 0 },
      { id: "area", label: "Conductor size", type: "number", defaultValue: 10, unit: "mm2", min: 0 }
    ],
    formula: "For DC and single-phase circuits, Vd = 2 x I x rho x L / S. For three-phase circuits, Vd = sqrt(3) x I x rho x L / S.",
    assumptions: ["Approximate conductor resistivity at normal temperature", "Reactance and installation temperature effects are not included", "One-way length is used"],
    warnings: ["Use project voltage-drop limits and local electrical code for final design.", "Long runs, high temperature, and grouped cables need additional derating."],
    faqs: [
      { question: "Why does the tool ask for one-way length?", answer: "The formula adds the return path internally for DC and single-phase circuits. Enter the physical one-way cable run." },
      { question: "Does this replace a full cable sizing calculation?", answer: "No. It checks voltage drop only. You still need ampacity, protection coordination, installation method, and fault-current checks." }
    ],
    relatedTools: ["cable-size-calculator", "circuit-breaker-size-calculator", "kw-kva-amp-calculator"],
    relatedProducts: [
      { label: "Cable gland selection support", href: "https://viox.com/contact" },
      { label: "Cable and wiring articles", href: "https://viox.com/a-full-guide-to-cable-gland/" }
    ],
    keywords: ["voltage drop calculator", "cable voltage drop", "three phase voltage drop calculator"]
  },
  {
    slug: "cable-size-calculator",
    title: "Cable Size Calculator",
    shortTitle: "Cable Size",
    category: "cable-wiring",
    description: "Find a reference conductor size from load current, sizing factor, conductor material, and installation severity.",
    intent: "Early-stage conductor sizing before standards-based cable selection.",
    fields: [
      { id: "current", label: "Load current", type: "number", defaultValue: 32, unit: "A", min: 0 },
      { id: "factor", label: "Sizing factor", type: "number", defaultValue: 125, unit: "%", min: 100 },
      { id: "material", label: "Conductor material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" }
      ] },
      { id: "installation", label: "Installation condition", type: "select", defaultValue: "normal", options: [
        { value: "normal", label: "Normal / open air reference" },
        { value: "enclosed", label: "Enclosed panel or trunking" },
        { value: "hot", label: "High ambient / grouped cables" }
      ] }
    ],
    formula: "Required ampacity = load current x sizing factor / installation derating. The result is mapped to a reference conductor table.",
    assumptions: ["Reference copper ampacity table for preliminary sizing", "Aluminum is estimated with a reduced ampacity factor", "Local cable standard is not embedded in this first version"],
    warnings: ["Final cable size must be checked against IEC, NEC, BS, or the applicable local standard.", "Voltage drop and short-circuit withstand must be verified separately."],
    faqs: [
      { question: "Why is this called a reference size?", answer: "Cable sizing depends on insulation, installation method, ambient temperature, grouping, and local code tables. This tool gives a starting point only." },
      { question: "Should I also run the voltage drop calculator?", answer: "Yes. A cable can pass ampacity but fail voltage-drop requirements on a long run." }
    ],
    relatedTools: ["voltage-drop-calculator", "cable-gland-size-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX cable gland support", href: "https://viox.com/contact" },
      { label: "Cable gland guide", href: "https://viox.com/a-full-guide-to-cable-gland/" }
    ],
    keywords: ["cable size calculator", "wire size calculator", "electrical cable sizing"]
  },
  {
    slug: "circuit-breaker-size-calculator",
    title: "Circuit Breaker Size Calculator",
    shortTitle: "Breaker Size",
    category: "circuit-protection",
    description: "Estimate a standard MCB or MCCB current rating from load power, voltage, phase, power factor, and sizing factor.",
    intent: "Preliminary overcurrent protective device sizing for low-voltage loads.",
    fields: [
      { id: "phase", label: "System type", type: "select", defaultValue: "three", options: phaseOptions },
      { id: "power", label: "Load power", type: "number", defaultValue: 15, unit: "kW", min: 0 },
      { id: "voltage", label: "System voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.9, min: 0.1, max: 1, step: 0.01 },
      { id: "factor", label: "Sizing factor", type: "number", defaultValue: 125, unit: "%", min: 100 }
    ],
    formula: "Current is calculated from kW and voltage, then multiplied by the sizing factor and rounded up to the next common breaker rating.",
    assumptions: ["Standard rating list is used for preliminary selection", "Trip curve, breaking capacity, coordination, and local code are not selected automatically"],
    warnings: ["Do not select a breaker from current alone. Verify cable ampacity, short-circuit current, trip curve, and equipment standard.", "Continuous-load rules differ by market and application."],
    faqs: [
      { question: "Why does the calculator round up?", answer: "Protective devices are sold in standard current ratings. The tool rounds the calculated minimum to the next common rating." },
      { question: "Does this choose MCB or MCCB?", answer: "No. It estimates current rating only. The product family depends on breaking capacity, setting range, application, and standard." }
    ],
    relatedTools: ["kw-kva-amp-calculator", "cable-size-calculator", "voltage-drop-calculator"],
    relatedProducts: [
      { label: "VIOX breaker support", href: "https://viox.com/contact" },
      { label: "MCB vs MCCB guide", href: "https://viox.com/what-is-the-difference-between-mcb-mccb-rcb-rcd-rccb-and-rcbo/" }
    ],
    keywords: ["circuit breaker size calculator", "breaker sizing calculator", "mcb size calculator"]
  },
  {
    slug: "kw-kva-amp-calculator",
    title: "kW, kVA and Amp Calculator",
    shortTitle: "kW/kVA/Amp",
    category: "power-conversion",
    description: "Convert between kW, kVA, and current for DC, single-phase AC, and three-phase AC systems.",
    intent: "Fast electrical power conversion before equipment sizing.",
    fields: [
      { id: "phase", label: "System type", type: "select", defaultValue: "three", options: phaseOptions },
      { id: "power", label: "Real power", type: "number", defaultValue: 15, unit: "kW", min: 0 },
      { id: "voltage", label: "Voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.9, min: 0.1, max: 1, step: 0.01 },
      { id: "efficiency", label: "Efficiency", type: "number", defaultValue: 100, unit: "%", min: 1, max: 100 }
    ],
    formula: "DC: I = P / V. Single-phase: I = P / (V x PF). Three-phase: I = P / (sqrt(3) x V x PF). Efficiency is applied when entered below 100%.",
    assumptions: ["Balanced three-phase load", "Power factor applies to AC systems only", "Efficiency is treated as input-side correction"],
    warnings: ["Use nameplate data when available.", "Nonlinear loads, harmonics, and starting current are not included."],
    faqs: [
      { question: "What is the difference between kW and kVA?", answer: "kW is real power. kVA is apparent power. For AC systems, kW = kVA x power factor." },
      { question: "Can I use this for motors?", answer: "Yes for a first estimate, but the motor current calculator is better because it includes efficiency and overload context." }
    ],
    relatedTools: ["three-phase-current-calculator", "motor-current-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX selection support", href: "https://viox.com/contact" }
    ],
    keywords: ["kw to amps calculator", "kva to amps calculator", "three phase amps calculator"]
  },
  {
    slug: "three-phase-current-calculator",
    title: "Three Phase Current Calculator",
    shortTitle: "3-Phase Current",
    category: "power-conversion",
    description: "Calculate three-phase current from kW or kVA, line voltage, power factor, and efficiency.",
    intent: "Current estimate for balanced three-phase loads.",
    fields: [
      { id: "mode", label: "Power input", type: "select", defaultValue: "kw", options: [
        { value: "kw", label: "kW" },
        { value: "kva", label: "kVA" }
      ] },
      { id: "power", label: "Power", type: "number", defaultValue: 30, unit: "kW/kVA", min: 0 },
      { id: "voltage", label: "Line voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.9, min: 0.1, max: 1, step: 0.01 },
      { id: "efficiency", label: "Efficiency", type: "number", defaultValue: 100, unit: "%", min: 1, max: 100 }
    ],
    formula: "For kW input, I = kW x 1000 / (sqrt(3) x V x PF x efficiency). For kVA input, I = kVA x 1000 / (sqrt(3) x V).",
    assumptions: ["Balanced three-phase load", "Line-to-line voltage input"],
    warnings: ["Starting current and harmonics are not included.", "Use actual equipment nameplate data for final selection."],
    faqs: [
      { question: "Should I enter phase voltage or line voltage?", answer: "Enter line-to-line voltage, such as 400 V, 480 V, or 690 V." },
      { question: "Why is power factor ignored for kVA?", answer: "kVA is apparent power, so current can be calculated directly from apparent power and voltage." }
    ],
    relatedTools: ["kw-kva-amp-calculator", "motor-current-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX industrial product support", href: "https://viox.com/contact" }
    ],
    keywords: ["three phase current calculator", "3 phase amps calculator", "three phase kva to amps"]
  },
  {
    slug: "motor-current-calculator",
    title: "Motor Current Calculator",
    shortTitle: "Motor Current",
    category: "motor-control",
    description: "Estimate motor full-load current and a starting overload relay setting range from motor power, voltage, efficiency, and power factor.",
    intent: "Motor control sizing support for contactor, overload relay, and breaker discussions.",
    fields: [
      { id: "unit", label: "Motor power unit", type: "select", defaultValue: "kw", options: [
        { value: "kw", label: "kW" },
        { value: "hp", label: "hp" }
      ] },
      { id: "power", label: "Motor power", type: "number", defaultValue: 7.5, unit: "kW/hp", min: 0 },
      { id: "voltage", label: "Line voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.86, min: 0.1, max: 1, step: 0.01 },
      { id: "efficiency", label: "Efficiency", type: "number", defaultValue: 90, unit: "%", min: 1, max: 100 },
      { id: "serviceFactor", label: "Overload reference", type: "select", defaultValue: "115", options: [
        { value: "100", label: "100% of FLC" },
        { value: "115", label: "115% of FLC" },
        { value: "125", label: "125% of FLC" }
      ] }
    ],
    formula: "Three-phase motor FLC = output power / (sqrt(3) x voltage x power factor x efficiency). Horsepower is converted to watts before calculation.",
    assumptions: ["Three-phase motor", "Nameplate data is not available", "Overload setting is a starting reference only"],
    warnings: ["Motor protection settings must follow the motor nameplate, starter type, duty, and applicable standard.", "Starting current, utilization category, and coordination are not selected here."],
    faqs: [
      { question: "Can this select a contactor size?", answer: "It provides a current estimate. Contactor selection also needs utilization category, voltage, duty, and coordination requirements." },
      { question: "Should overload relay setting equal breaker size?", answer: "No. Overload protection and short-circuit protection have different jobs and are selected differently." }
    ],
    relatedTools: ["three-phase-current-calculator", "circuit-breaker-size-calculator", "kw-kva-amp-calculator"],
    relatedProducts: [
      { label: "VIOX contactor and overload support", href: "https://viox.com/contact" },
      { label: "Contactor selection guide", href: "https://viox.com/how-to-select-contactors-overload-relays-circuit-breakers-motor-power/" }
    ],
    keywords: ["motor current calculator", "motor full load current calculator", "overload relay setting calculator"]
  },
  {
    slug: "ev-charger-load-calculator",
    title: "EV Charger Load Calculator",
    shortTitle: "EV Charger Load",
    category: "ev-charging",
    description: "Estimate EV charger current and total distribution load from charger power, phase, quantity, and simultaneity.",
    intent: "Preliminary load planning for EV charging distribution boards.",
    fields: [
      { id: "phase", label: "Charger phase", type: "select", defaultValue: "three", options: [
        { value: "single", label: "Single-phase AC" },
        { value: "three", label: "Three-phase AC" }
      ] },
      { id: "power", label: "Power per charger", type: "number", defaultValue: 11, unit: "kW", min: 0 },
      { id: "voltage", label: "Voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "count", label: "Number of chargers", type: "number", defaultValue: 4, min: 1 },
      { id: "simultaneity", label: "Simultaneity factor", type: "number", defaultValue: 80, unit: "%", min: 1, max: 100 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.98, min: 0.1, max: 1, step: 0.01 }
    ],
    formula: "Current per charger is calculated from kW, voltage, phase, and power factor. Total planned current is multiplied by charger quantity and simultaneity.",
    assumptions: ["AC chargers", "Balanced three-phase loading when three-phase is selected", "Demand management is represented by simultaneity factor"],
    warnings: ["Final EV charging design must check IEC 61851, local code, RCD/RCBO requirements, earthing system, and load management.", "DC fast chargers require a more detailed system study."],
    faqs: [
      { question: "What is simultaneity factor?", answer: "It estimates how much of the installed charging power is used at the same time. Use project-specific demand management data when available." },
      { question: "Does this choose RCD or RCBO type?", answer: "No. EV charging residual-current protection depends on charger design, DC leakage handling, local rules, and manufacturer instructions." }
    ],
    relatedTools: ["circuit-breaker-size-calculator", "cable-size-calculator", "spd-calculator"],
    relatedProducts: [
      { label: "VIOX EV charging support", href: "https://viox.com/contact" },
      { label: "RCCB for EV charger guide", href: "https://viox.com/rccb-for-ev-charger-type-b-type-f-type-a-6ma-dc-protection/" }
    ],
    keywords: ["ev charger load calculator", "ev charging current calculator", "ev charger breaker size"]
  },
  {
    slug: "cable-gland-size-calculator",
    title: "Cable Gland Size Calculator",
    shortTitle: "Cable Gland",
    category: "cable-wiring",
    description: "Find a starting metric cable gland thread size from cable outer diameter, cable type, and environment.",
    intent: "Cable entry planning for panels, enclosures, and industrial equipment.",
    fields: [
      { id: "diameter", label: "Cable outer diameter", type: "number", defaultValue: 18, unit: "mm", min: 0 },
      { id: "armored", label: "Cable type", type: "select", defaultValue: "unarmored", options: [
        { value: "unarmored", label: "Unarmored" },
        { value: "armored", label: "Armored" }
      ] },
      { id: "environment", label: "Environment", type: "select", defaultValue: "industrial", options: [
        { value: "indoor", label: "Indoor panel" },
        { value: "industrial", label: "Industrial" },
        { value: "outdoor", label: "Outdoor / wet" },
        { value: "hazardous", label: "Hazardous area" }
      ] }
    ],
    formula: "The cable outer diameter is matched to a typical metric gland thread range. The environment adds a sealing and certification note.",
    assumptions: ["Metric gland reference ranges", "Exact sealing range depends on product series", "Cable OD is measured over the outer sheath"],
    warnings: ["Always verify the cable gland datasheet sealing range, thread, IP rating, material, and certification.", "Hazardous areas require properly certified glands and installation practices."],
    faqs: [
      { question: "Is cable gland thread size the same as sealing range?", answer: "No. A thread size can support different sealing ranges depending on gland design." },
      { question: "Should armored cable use a different gland?", answer: "Yes. Armored cables normally require glands designed to terminate and bond the armor correctly." }
    ],
    relatedTools: ["cable-size-calculator", "voltage-drop-calculator", "busbar-current-rating-calculator"],
    relatedProducts: [
      { label: "VIOX cable gland support", href: "https://viox.com/contact" },
      { label: "Cable gland guide", href: "https://viox.com/a-full-guide-to-cable-gland/" }
    ],
    keywords: ["cable gland size calculator", "cable gland thread size", "metric cable gland calculator"]
  },
  {
    slug: "busbar-current-rating-calculator",
    title: "Busbar Current Rating Calculator",
    shortTitle: "Busbar Rating",
    category: "panel-design",
    description: "Estimate busbar current from width, thickness, material, current-density reference, and derating factor.",
    intent: "Early panel design estimate before thermal testing and standard verification.",
    fields: [
      { id: "width", label: "Busbar width", type: "number", defaultValue: 30, unit: "mm", min: 0 },
      { id: "thickness", label: "Busbar thickness", type: "number", defaultValue: 5, unit: "mm", min: 0 },
      { id: "density", label: "Current density", type: "number", defaultValue: 1.2, unit: "A/mm2", min: 0, step: 0.1 },
      { id: "material", label: "Material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" }
      ] },
      { id: "derating", label: "Derating factor", type: "number", defaultValue: 80, unit: "%", min: 1, max: 100 }
    ],
    formula: "Estimated current = width x thickness x current density x material factor x derating factor.",
    assumptions: ["Simple cross-section based estimate", "Copper reference unless aluminum is selected", "Temperature rise testing is not included"],
    warnings: ["Final busbar rating depends on enclosure, spacing, ventilation, plating, temperature rise, and standard testing.", "Do not use this estimate as a certified rating."],
    faqs: [
      { question: "Why does enclosure design matter?", answer: "The same copper bar can run hotter in a sealed cabinet than in open air. Heat dissipation changes the practical current rating." },
      { question: "Can this size a busbar for short-circuit withstand?", answer: "No. Short-circuit thermal and mechanical withstand require separate calculations and tests." }
    ],
    relatedTools: ["circuit-breaker-size-calculator", "cable-size-calculator", "voltage-drop-calculator"],
    relatedProducts: [
      { label: "VIOX busbar support", href: "https://viox.com/contact" },
      { label: "Busbar insulator guide", href: "https://viox.com/what-is-a-busbar-insulator/" }
    ],
    keywords: ["busbar current rating calculator", "copper busbar ampacity", "busbar size calculator"]
  }
];

export const toolsBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool])) as Record<string, ToolDefinition>;

export function getToolsByCategory(category: string) {
  return tools.filter((tool) => tool.category === category);
}
