import type { ToolDefinition } from "./types";

const phaseOptions = [
  { value: "dc", label: "DC" },
  { value: "single", label: "Single-phase AC" },
  { value: "three", label: "Three-phase AC" }
];

const conduitTypeOptions = [
  { value: "emt", label: "EMT" },
  { value: "rmc", label: "RMC / GRC" },
  { value: "pvc40", label: "PVC Schedule 40" },
  { value: "pvc80", label: "PVC Schedule 80" }
];

const conduitTradeSizeOptions = ["1/2", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", "3", "3-1/2", "4"].map((size) => ({ value: size, label: `${size}\"` }));

const conduitCableOptions = [
  { value: "cat6", label: "Cat6 UTP, 0.236 in OD" },
  { value: "cat6a-utp", label: "Cat6A UTP, 0.315 in OD" },
  { value: "cat6a-stp", label: "Cat6A STP, 0.276 in OD" },
  { value: "fire-18-2", label: "18/2 fire alarm, 0.157 in OD" },
  { value: "fire-18-4", label: "18/4 fire alarm, 0.177 in OD" },
  { value: "control-22-4", label: "22/4 control, 0.138 in OD" },
  { value: "coax-rg6", label: "RG6 coax, 0.275 in OD" },
  { value: "fiber-armored", label: "Armored fiber, 0.492 in OD" },
  { value: "thhn-12", label: "12 AWG THHN, 0.130 in OD" },
  { value: "thhn-10", label: "10 AWG THHN, 0.164 in OD" },
  { value: "custom", label: "Custom OD" }
];

const optionalConduitCableOptions = [
  { value: "none", label: "None" },
  ...conduitCableOptions
];

const awgOptions = ["18", "16", "14", "12", "10", "8", "6", "4", "3", "2", "1", "1/0", "2/0", "3/0", "4/0"].map((size) => ({ value: size, label: `${size} AWG` }));

const currentUnitOptions = [
  { value: "A", label: "A" },
  { value: "mA", label: "mA" },
  { value: "kA", label: "kA" }
];

const voltageUnitOptions = [
  { value: "V", label: "V" },
  { value: "kV", label: "kV" }
];

const lengthUnitOptions = [
  { value: "m", label: "m" },
  { value: "ft", label: "ft" }
];

const conductorSizeUnitOptions = [
  { value: "mm2", label: "mm²" },
  { value: "AWG", label: "AWG" },
  { value: "kcmil", label: "kcmil" }
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
      { id: "current", label: "Load current", type: "number", defaultValue: 32, unit: "A", defaultUnit: "A", unitOptions: currentUnitOptions, min: 0 },
      { id: "voltage", label: "System voltage", type: "number", defaultValue: 400, unit: "V", defaultUnit: "V", unitOptions: voltageUnitOptions, min: 0 },
      { id: "length", label: "One-way cable length", type: "number", defaultValue: 50, unit: "m", defaultUnit: "m", unitOptions: lengthUnitOptions, min: 0 },
      { id: "area", label: "Conductor size", type: "number", defaultValue: 10, unit: "mm²", defaultUnit: "mm2", unitOptions: conductorSizeUnitOptions, min: 0 },
      { id: "conductors", label: "Parallel conductors", type: "number", defaultValue: 1, unit: "runs", min: 1, step: 1 }
    ],
    formula: "For DC and single-phase circuits, Vd = 2 x I x rho x L / (S x n). For three-phase circuits, Vd = sqrt(3) x I x rho x L / (S x n).",
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
    keywords: ["voltage drop calculator", "voltage drop formula", "voltage drop equation", "how to calculate voltage drop", "single phase voltage drop formula", "three phase voltage drop formula", "voltage drop percentage"]
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
    slug: "conduit-fill-calculator",
    title: "Conduit Fill Calculator",
    shortTitle: "Conduit Fill",
    category: "cable-wiring",
    description: "Calculate conduit fill percentage from pathway type, trade size, cable outside diameter, and cable quantity.",
    intent: "Pathway planning for panel entrances, low-voltage wiring, data cable, control cable, and mixed cable runs.",
    fields: [
      { id: "conduitType", label: "Conduit type", type: "select", defaultValue: "emt", options: conduitTypeOptions },
      { id: "tradeSize", label: "Trade size", type: "select", defaultValue: "1", options: conduitTradeSizeOptions },
      { id: "runType", label: "Run type", type: "select", defaultValue: "normal", options: [
        { value: "normal", label: "Normal raceway run" },
        { value: "nipple", label: "Short nipple, 24 in or less" }
      ] },
      { id: "cableA", label: "Cable group A", type: "select", defaultValue: "cat6", options: conduitCableOptions },
      { id: "qtyA", label: "Cable A quantity", type: "number", defaultValue: 12, min: 1, step: 1 },
      { id: "customOdA", label: "Custom OD A", type: "number", defaultValue: 0.25, unit: "in", min: 0, step: 0.001, help: "Used only when Cable group A is Custom OD." },
      { id: "cableB", label: "Cable group B", type: "select", defaultValue: "none", options: optionalConduitCableOptions },
      { id: "qtyB", label: "Cable B quantity", type: "number", defaultValue: 1, min: 1, step: 1 },
      { id: "customOdB", label: "Custom OD B", type: "number", defaultValue: 0.25, unit: "in", min: 0, step: 0.001, help: "Used only when Cable group B is Custom OD." }
    ],
    formula: "Fill percentage = total cable cross-sectional area / conduit internal cross-sectional area x 100. Limit is 53% for one cable, 31% for two, 40% for three or more, and 60% for short nipples.",
    assumptions: ["Uses typical NEC Chapter 9 Table 4 internal diameters for EMT, RMC, PVC Schedule 40, and PVC Schedule 80", "Cable OD values are planning references; manufacturer OD wins", "Mixed cable fill is calculated by summing each cable group's cross-sectional area"],
    warnings: ["Conduit fill is not the same as ampacity derating; current-carrying conductor derating must be checked separately.", "Long pulls, bends, and exactly three equal cables can create pull-tension or cable-jam issues even below the fill limit."],
    faqs: [
      { question: "Why use outside diameter instead of conductor size?", answer: "Conduit fill is based on the physical area occupied by the complete insulated cable or conductor, so the outer jacket diameter is the important dimension." },
      { question: "Can I mix cable types?", answer: "Yes. The calculator adds the area of Cable group A and Cable group B before comparing the total against the selected conduit area." }
    ],
    relatedTools: ["cable-gland-size-calculator", "awg-wire-size-calculator", "dc-voltage-drop-calculator"],
    relatedProducts: [
      { label: "VIOX cable gland support", href: "https://viox.com/contact" },
      { label: "Cable gland guide", href: "https://viox.com/a-full-guide-to-cable-gland/" }
    ],
    keywords: ["conduit fill calculator", "raceway fill calculator", "cat6 conduit fill", "emt conduit fill"]
  },
  {
    slug: "dc-voltage-drop-calculator",
    title: "DC Voltage Drop Calculator",
    shortTitle: "DC Voltage Drop",
    category: "cable-wiring",
    description: "Check DC voltage drop for 12 V, 24 V, 48 V, control, LED, battery, and PV accessory circuits using AWG conductor resistance.",
    intent: "Low-voltage DC wiring check where a small voltage loss can become a large percentage of source voltage.",
    fields: [
      { id: "voltage", label: "Source voltage", type: "number", defaultValue: 24, unit: "V DC", min: 0 },
      { id: "current", label: "Load current", type: "number", defaultValue: 3, unit: "A", min: 0 },
      { id: "length", label: "One-way length", type: "number", defaultValue: 100, unit: "ft", min: 0 },
      { id: "awg", label: "Conductor size", type: "select", defaultValue: "14", options: awgOptions },
      { id: "material", label: "Conductor material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" },
        { value: "cca", label: "Copper-clad aluminum estimate" }
      ] },
      { id: "temperature", label: "Ambient temperature", type: "number", defaultValue: 75, unit: "F", min: -40 },
      { id: "maxDrop", label: "Max voltage drop", type: "number", defaultValue: 5, unit: "%", min: 0.1, step: 0.1 }
    ],
    formula: "DC voltage drop = 2 x current x conductor resistance per foot x one-way length. Percent drop = voltage drop / source voltage x 100. Resistance is adjusted for material and ambient temperature.",
    assumptions: ["Two-wire DC circuit with one positive and one return conductor", "AWG resistance references are based on copper at 20 C with temperature correction", "CCA is modeled as a high-resistance estimate, not as a recommended conductor"],
    warnings: ["Always check equipment minimum input voltage, fuse protection, terminal ratings, and installation temperature.", "Do not use copper-clad aluminum for critical high-current DC circuits."],
    faqs: [
      { question: "Why does 24 V fail sooner than 230 V?", answer: "The same absolute voltage loss is a much larger percentage of a low DC source voltage." },
      { question: "Should I enter round-trip distance?", answer: "No. Enter one-way physical length; the calculator multiplies by two for the outbound and return conductors." }
    ],
    relatedTools: ["awg-wire-size-calculator", "voltage-drop-calculator", "conduit-fill-calculator"],
    relatedProducts: [
      { label: "VIOX DC and panel wiring support", href: "https://viox.com/contact" }
    ],
    keywords: ["dc voltage drop calculator", "12v voltage drop", "24v wire size calculator", "awg voltage drop"]
  },
  {
    slug: "awg-wire-size-calculator",
    title: "AWG Wire Size Calculator",
    shortTitle: "AWG Wire Size",
    category: "cable-wiring",
    description: "Find the smallest AWG conductor that passes both reference ampacity and voltage-drop checks.",
    intent: "US-market wire sizing reference for low-voltage DC, single-phase AC, and three-phase AC discussions.",
    fields: [
      { id: "circuit", label: "Circuit type", type: "select", defaultValue: "single", options: [
        { value: "dc", label: "DC / two-wire" },
        { value: "single", label: "Single-phase AC" },
        { value: "three", label: "Three-phase AC" }
      ] },
      { id: "material", label: "Conductor material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" },
        { value: "cca", label: "CCA estimate" }
      ] },
      { id: "current", label: "Load current", type: "number", defaultValue: 20, unit: "A", min: 0 },
      { id: "voltage", label: "Voltage", type: "number", defaultValue: 120, unit: "V", min: 0 },
      { id: "length", label: "One-way length", type: "number", defaultValue: 100, unit: "ft", min: 0 },
      { id: "maxDrop", label: "Max voltage drop", type: "number", defaultValue: 3, unit: "%", min: 0.1, step: 0.1 },
      { id: "continuous", label: "Continuous load", type: "select", defaultValue: "no", options: [
        { value: "no", label: "No" },
        { value: "yes", label: "Yes, apply 125%" }
      ] },
      { id: "currentConductors", label: "Current-carrying conductors", type: "number", defaultValue: 3, min: 1, step: 1 }
    ],
    formula: "The calculator iterates through AWG sizes from small to large. A size passes when derated ampacity is at least the required current and calculated voltage drop is below the selected limit.",
    assumptions: ["Reference ampacity table is simplified for planning", "Bundling derating follows common 4-6, 7-9, and 10-20 conductor adjustment bands", "Voltage drop uses copper resistance with material factor"],
    warnings: ["Final conductor sizing must follow the locally adopted NEC/IEC/BS standard, insulation rating, terminal temperature, ambient correction, and installation method.", "Small-signal conductors may have product-specific limits not captured by building-wire ampacity tables."],
    faqs: [
      { question: "Why can voltage drop force a larger wire than ampacity?", answer: "Long routes can pass current capacity but lose too much voltage before the load, especially on low-voltage circuits." },
      { question: "Why does continuous load change the result?", answer: "Continuous loads are commonly sized at 125%, so the conductor must have more ampacity headroom." }
    ],
    relatedTools: ["dc-voltage-drop-calculator", "conduit-fill-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX selection support", href: "https://viox.com/contact" }
    ],
    keywords: ["awg wire size calculator", "wire gauge calculator", "nec wire size", "awg voltage drop"]
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
    slug: "transformer-sizing-calculator",
    title: "Transformer Sizing Calculator",
    shortTitle: "Transformer Size",
    category: "panel-design",
    description: "Estimate transformer kVA from connected load, demand factor, future growth, loading margin, ambient derating, and standard rating series.",
    intent: "Distribution transformer planning before feeder, breaker, cable, and busbar sizing.",
    fields: [
      { id: "series", label: "Standard rating series", type: "select", defaultValue: "iec", options: [
        { value: "iec", label: "IEC 60076 reference" },
        { value: "ansi", label: "ANSI / IEEE reference" }
      ] },
      { id: "phase", label: "Phase", type: "select", defaultValue: "three", options: [
        { value: "three", label: "Three-phase" },
        { value: "single", label: "Single-phase" }
      ] },
      { id: "loadMode", label: "Connected load unit", type: "select", defaultValue: "kw", options: [
        { value: "kw", label: "kW" },
        { value: "kva", label: "kVA" },
        { value: "hp", label: "hp motor load" }
      ] },
      { id: "load", label: "Connected load", type: "number", defaultValue: 200, unit: "kW/kVA/hp", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.85, min: 0.1, max: 1, step: 0.01 },
      { id: "efficiency", label: "Motor efficiency", type: "number", defaultValue: 90, unit: "%", min: 1, max: 100 },
      { id: "demand", label: "Demand factor", type: "number", defaultValue: 70, unit: "%", min: 1, max: 100 },
      { id: "growth", label: "Future growth", type: "number", defaultValue: 20, unit: "%", min: 0 },
      { id: "loading", label: "Target loading", type: "number", defaultValue: 80, unit: "%", min: 1, max: 100 },
      { id: "ambient", label: "Average ambient", type: "number", defaultValue: 30, unit: "C", min: -20 },
      { id: "voltage", label: "Secondary voltage", type: "number", defaultValue: 400, unit: "V", min: 0 }
    ],
    formula: "Connected kVA is converted from kW or hp when needed. Required kVA = connected kVA x demand x (1 + growth) / (loading target x ambient derate). The result is rounded up to the selected IEC or ANSI standard rating.",
    assumptions: ["Ambient derate uses an approximate 1% capacity reduction per C above 30 C", "Target loading represents normal operating margin, commonly 75-80%", "Standard rating series is a planning reference"],
    warnings: ["Final transformer selection must check inrush, impedance, harmonics, cooling class, enclosure, temperature rise, and applicable standards.", "Do not use this as a certified transformer specification."],
    faqs: [
      { question: "Why divide by target loading?", answer: "A transformer intended to run at 80% normal loading needs a nameplate rating larger than the design load." },
      { question: "Why does ambient temperature increase the size?", answer: "Hot ambient conditions reduce transformer cooling capacity, so the required nameplate kVA increases." }
    ],
    relatedTools: ["short-circuit-current-calculator", "circuit-breaker-size-calculator", "busbar-current-rating-calculator"],
    relatedProducts: [
      { label: "VIOX panel and breaker support", href: "https://viox.com/contact" },
      { label: "VIOX breaker guide", href: "https://viox.com/what-is-the-difference-between-mcb-mccb-rcb-rcd-rccb-and-rcbo/" }
    ],
    keywords: ["transformer sizing calculator", "kva transformer calculator", "transformer full load current"]
  },
  {
    slug: "short-circuit-current-calculator",
    title: "Short Circuit Current Calculator",
    shortTitle: "Fault Current",
    category: "circuit-protection",
    description: "Estimate available transformer secondary fault current from transformer kVA, impedance, voltage, phase, and optional utility fault contribution.",
    intent: "First-pass interrupting-capacity check for MCB, MCCB, switchgear, busbar, and panel discussions.",
    fields: [
      { id: "phase", label: "System", type: "select", defaultValue: "three", options: [
        { value: "three", label: "Three-phase" },
        { value: "single", label: "Single-phase" }
      ] },
      { id: "kva", label: "Transformer rating", type: "number", defaultValue: 500, unit: "kVA", min: 0 },
      { id: "impedance", label: "Transformer impedance", type: "number", defaultValue: 5.75, unit: "%Z", min: 0.1, step: 0.01 },
      { id: "voltage", label: "Secondary voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "utilityMva", label: "Utility fault contribution", type: "number", defaultValue: 0, unit: "MVA", min: 0, help: "Optional. Use 0 for an infinite-bus transformer-only estimate." }
    ],
    formula: "Full-load current is calculated from transformer kVA and voltage. Available fault current = full-load current / total per-unit impedance, where total impedance includes transformer %Z and optional utility source impedance on the transformer base.",
    assumptions: ["Transformer-secondary estimate only", "Cable impedance and motor contribution are not included", "Utility MVA is optional and treated as upstream source impedance"],
    warnings: ["Final interrupting capacity must be based on a complete short-circuit study including upstream utility data, feeder impedance, motors, X/R ratio, and the applicable IEC or IEEE method.", "Always select protective devices with interrupting rating above the available fault current at the installation point."],
    faqs: [
      { question: "Why does lower transformer impedance increase fault current?", answer: "Short-circuit current is inversely proportional to source impedance. A lower %Z transformer can deliver more fault current." },
      { question: "Can this choose a breaker model?", answer: "No. It gives a first-pass kA level. Final breaker selection also needs voltage, poles, trip unit, coordination, standard, and enclosure conditions." }
    ],
    relatedTools: ["transformer-sizing-calculator", "circuit-breaker-size-calculator", "busbar-current-rating-calculator"],
    relatedProducts: [
      { label: "VIOX MCCB support", href: "https://viox.com/contact" },
      { label: "MCB vs MCCB guide", href: "https://viox.com/what-is-the-difference-between-mcb-mccb-rcb-rcd-rccb-and-rcbo/" }
    ],
    keywords: ["short circuit current calculator", "fault current calculator", "transformer fault current", "breaker ka rating"]
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
      { id: "power", label: "Output power", type: "number", defaultValue: 15, unit: "kW", min: 0 },
      { id: "voltage", label: "Voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.9, min: 0.1, max: 1, step: 0.01 },
      { id: "efficiency", label: "Efficiency", type: "number", defaultValue: 100, unit: "%", min: 1, max: 100 }
    ],
    formula: "DC: I = Pout / (V x efficiency). Single-phase: I = Pout / (V x PF x efficiency). Three-phase: I = Pout / (sqrt(3) x V x PF x efficiency).",
    assumptions: ["Entered kW is output power", "Balanced three-phase load", "Power factor applies to AC systems only", "Efficiency converts output power to required input power"],
    warnings: ["Use nameplate data when available.", "Nonlinear loads, harmonics, and starting current are not included."],
    faqs: [
      { question: "What is the difference between kW and kVA?", answer: "kW is real power and kVA is apparent power. This calculator treats entered kW as output power, converts it to input kW using efficiency, then divides input kW by power factor for kVA." },
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
      { id: "density", label: "Current density", type: "number", defaultValue: 1.2, unit: "A/mm²", min: 0, step: 0.1 },
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
