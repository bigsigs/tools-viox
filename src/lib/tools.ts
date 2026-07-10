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
      { id: "phase", label: "Transformer phase", type: "select", defaultValue: "three", help: "Three-phase uses S = √3 × V × I with line-to-line voltage. Single-phase uses S = V × I.", options: [
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
  },
  {
    slug: "fuse-sizing-calculator",
    title: "Fuse Sizing & Selection Calculator",
    shortTitle: "Fuse Sizing",
    category: "circuit-protection",
    description: "Size a preliminary gG, aM, or gPV fuse and check load current, cable ampacity, breaking capacity, motor starting duty, or PV module limits.",
    intent: "First-pass IEC fuse selection before checking the exact fuse curve, holder, temperature derating, and manufacturer coordination data.",
    fields: [
      { id: "application", label: "Application", type: "select", defaultValue: "general", options: [
        { value: "general", label: "Cable / general load (gG)" },
        { value: "motor", label: "Motor short-circuit protection (aM)" },
        { value: "pv", label: "Solar PV string (gPV)" }
      ] },
      { id: "loadCurrent", label: "Design load current", type: "number", defaultValue: 32, unit: "A", min: 0, showWhen: { field: "application", values: ["general"] } },
      { id: "continuousFactor", label: "Design factor", type: "number", defaultValue: 125, unit: "%", min: 100, max: 200, showWhen: { field: "application", values: ["general"] }, help: "Use the factor required by the applicable installation rules." },
      { id: "cableAmpacity", label: "Corrected cable ampacity", type: "number", defaultValue: 50, unit: "A", min: 0, showWhen: { field: "application", values: ["general"] } },
      { id: "motorCurrent", label: "Motor nameplate current", type: "number", defaultValue: 14.2, unit: "A", min: 0, showWhen: { field: "application", values: ["motor"] } },
      { id: "motorFuseFactor", label: "aM fuse current factor", type: "number", defaultValue: 160, unit: "%", min: 100, max: 300, showWhen: { field: "application", values: ["motor"] }, help: "Starting reference only. Replace it with the factor or coordinated rating required by the selected fuse manufacturer's motor table." },
      { id: "startMultiple", label: "Starting current", type: "number", defaultValue: 6, unit: "× FLC", min: 1, max: 20, step: 0.1, showWhen: { field: "application", values: ["motor"] } },
      { id: "startTime", label: "Starting time", type: "number", defaultValue: 3, unit: "s", min: 0.1, step: 0.1, showWhen: { field: "application", values: ["motor"] } },
      { id: "moduleIsc", label: "Module short-circuit current", type: "number", defaultValue: 13.7, unit: "A", min: 0, showWhen: { field: "application", values: ["pv"] } },
      { id: "pvFactor", label: "PV current factor", type: "number", defaultValue: 125, unit: "%", min: 100, max: 200, showWhen: { field: "application", values: ["pv"] }, help: "Confirm the required factor with the adopted code and module data." },
      { id: "parallelStrings", label: "Parallel strings", type: "number", defaultValue: 4, unit: "strings", min: 1, step: 1, showWhen: { field: "application", values: ["pv"] } },
      { id: "maxSeriesFuse", label: "Module max series fuse", type: "number", defaultValue: 25, unit: "A", min: 0, showWhen: { field: "application", values: ["pv"] } },
      { id: "systemVoltage", label: "System voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "faultCurrent", label: "Prospective fault current", type: "number", defaultValue: 10, unit: "kA", min: 0 }
    ],
    formula: "The selected fuse rating must carry the corrected design current, remain within the protected conductor or module limit, and have breaking capacity above the prospective fault current. Motor aM selection also requires a manufacturer time-current curve check.",
    assumptions: ["IEC-style utilization categories", "Standard current ratings are used for preliminary rounding", "PV reverse-current contribution is approximated from the other parallel strings"],
    warnings: ["Do not treat the calculated rating as proof that a fuse will ride through a motor start; verify the actual aM curve at the stated current and time.", "The fuse voltage rating, DC capability, breaking capacity, holder, size, power dissipation, ambient temperature, and manufacturer data must all match."],
    faqs: [
      { question: "What is the difference between gG, aM, and gPV?", answer: "gG is a full-range general-purpose fuse commonly used for cable and feeder protection. aM provides motor short-circuit protection and requires separate overload protection. gPV is designed for photovoltaic DC string protection." },
      { question: "Why can the calculator reject a standard fuse size?", answer: "A rounded fuse may exceed the corrected cable ampacity or the PV module maximum series fuse rating. In that case the conductor, load design, or protection arrangement must be reviewed." },
      { question: "Does the result predict clearing time?", answer: "No. Clearing time and I²t depend on the exact fuse family, current level, voltage, and manufacturer curve." }
    ],
    relatedTools: ["short-circuit-current-calculator", "cable-size-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX fuse selection support", href: "https://viox.com/contact" },
      { label: "IEC 60269 fuse selection guide", href: "https://viox.com/iec-60269-low-voltage-fuse-selection-guide-gg-am-nh/" }
    ],
    keywords: ["fuse sizing calculator", "fuse size calculator", "gG fuse calculator", "aM motor fuse selection", "gPV fuse calculator"]
  },
  {
    slug: "power-factor-correction-calculator",
    title: "Power Factor Correction Calculator",
    shortTitle: "Power Factor",
    category: "power-conversion",
    description: "Calculate the capacitor-bank kvar needed to improve power factor and compare line current before and after correction.",
    intent: "Preliminary capacitor-bank sizing for balanced AC loads before harmonic, switching-step, and equipment checks.",
    fields: [
      { id: "phase", label: "System", type: "select", defaultValue: "three", options: [
        { value: "single", label: "Single-phase AC" },
        { value: "three", label: "Three-phase AC" }
      ] },
      { id: "power", label: "Active power", type: "number", defaultValue: 100, unit: "kW", min: 0 },
      { id: "voltage", label: "System voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "initialPf", label: "Existing power factor", type: "number", defaultValue: 0.75, min: 0.01, max: 1, step: 0.01 },
      { id: "targetPf", label: "Target power factor", type: "number", defaultValue: 0.95, min: 0.01, max: 1, step: 0.01 },
      { id: "frequency", label: "Frequency", type: "select", defaultValue: "50", options: [
        { value: "50", label: "50 Hz" },
        { value: "60", label: "60 Hz" }
      ] },
      { id: "harmonics", label: "Power-electronic loads", type: "select", defaultValue: "moderate", options: [
        { value: "low", label: "Low / mainly linear loads" },
        { value: "moderate", label: "Moderate VFD, UPS, or rectifier load" },
        { value: "high", label: "High harmonic loading" }
      ] }
    ],
    formula: "Required compensation is Qc = P x (tan(arccos PF1) - tan(arccos PF2)). Line current is calculated from active power, voltage, phase, and power factor.",
    assumptions: ["Balanced steady-state AC load", "Active power remains constant after correction", "Capacitor steps and harmonic resonance are not modeled"],
    warnings: ["Do not raise the target above the utility or project requirement; overcorrection can create leading power factor and overvoltage.", "Sites with VFDs, UPS systems, rectifiers, or significant harmonics require harmonic measurement and detuned or filtered capacitor-bank review."],
    faqs: [
      { question: "What target power factor should I use?", answer: "A target around 0.95 is a common planning value, but the correct target depends on utility penalties, load variation, harmonics, and project requirements." },
      { question: "Why does correction reduce current?", answer: "For the same useful kW, improving power factor reduces apparent power and therefore reduces line current, cable loss, and transformer loading." },
      { question: "Is the calculated kvar a final capacitor-bank specification?", answer: "No. Round to a practical stepped bank only after checking load variation, switching frequency, harmonics, voltage, temperature, and capacitor tolerances." }
    ],
    relatedTools: ["kw-kva-amp-calculator", "three-phase-current-calculator", "transformer-sizing-calculator"],
    relatedProducts: [
      { label: "VIOX compensation panel support", href: "https://viox.com/contact" },
      { label: "Low-voltage electrical formulas", href: "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/" }
    ],
    keywords: ["power factor correction calculator", "capacitor bank sizing calculator", "kvar calculator", "power factor capacitor calculator"]
  },
  {
    slug: "motor-starter-selection-calculator",
    title: "Motor Starter Selection Calculator",
    shortTitle: "Motor Starter",
    category: "motor-control",
    description: "Estimate motor current, starting current, contactor duty, overload-relay range, and preliminary short-circuit protection for a motor starter.",
    intent: "Build a preliminary IEC motor-starter specification before checking motor nameplate and coordinated manufacturer tables.",
    fields: [
      { id: "inputMode", label: "Motor data", type: "select", defaultValue: "power", options: [
        { value: "power", label: "Calculate from motor power" },
        { value: "nameplate", label: "Use nameplate current" }
      ] },
      { id: "power", label: "Motor output power", type: "number", defaultValue: 7.5, unit: "kW", min: 0, showWhen: { field: "inputMode", values: ["power"] } },
      { id: "nameplateCurrent", label: "Nameplate full-load current", type: "number", defaultValue: 14.2, unit: "A", min: 0, showWhen: { field: "inputMode", values: ["nameplate"] } },
      { id: "voltage", label: "Line voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "pf", label: "Power factor", type: "number", defaultValue: 0.85, min: 0.1, max: 1, step: 0.01, showWhen: { field: "inputMode", values: ["power"] } },
      { id: "efficiency", label: "Efficiency", type: "number", defaultValue: 90, unit: "%", min: 1, max: 100, showWhen: { field: "inputMode", values: ["power"] } },
      { id: "duty", label: "Contactor duty", type: "select", defaultValue: "ac3", options: [
        { value: "ac3", label: "AC-3 normal start / stop" },
        { value: "ac4", label: "AC-4 inching / plugging / reversing" }
      ] },
      { id: "startMethod", label: "Starting method", type: "select", defaultValue: "dol", options: [
        { value: "dol", label: "Direct-on-line" },
        { value: "star-delta", label: "Star-delta" },
        { value: "soft", label: "Soft starter" },
        { value: "vfd", label: "Variable-frequency drive" }
      ] },
      { id: "startTime", label: "Acceleration time", type: "number", defaultValue: 3, unit: "s", min: 0.1, step: 0.1 },
      { id: "tripClass", label: "Overload trip class", type: "select", defaultValue: "10", options: [
        { value: "10", label: "Class 10 / normal starting" },
        { value: "20", label: "Class 20 / longer acceleration" },
        { value: "30", label: "Class 30 / heavy starting" }
      ] },
      { id: "protection", label: "Short-circuit protection", type: "select", defaultValue: "mpcb", options: [
        { value: "mpcb", label: "MPCB / motor circuit breaker" },
        { value: "breaker", label: "MCB or MCCB + overload relay" },
        { value: "fuse", label: "aM fuse + overload relay" }
      ] }
    ],
    formula: "Three-phase motor current is I = P / (sqrt(3) x V x PF x efficiency). Starter components are then screened against nameplate current, utilization category, starting method, acceleration time, and overload trip class.",
    assumptions: ["Balanced three-phase squirrel-cage motor", "Calculated current is an estimate when nameplate current is unavailable", "Starting-current multiples are planning references by starting method"],
    warnings: ["Use the actual motor nameplate current for final overload adjustment and manufacturer motor-coordination tables for contactor and protective-device selection.", "AC-4, reversing, plugging, high cycling, high inertia, VFD output switching, and safety functions require application-specific review."],
    faqs: [
      { question: "Why is AC-3 different from AC-4?", answer: "AC-3 covers normal squirrel-cage motor starting and opening after the motor reaches speed. AC-4 includes severe inching, plugging, and reversing duty and usually needs a larger or specially rated contactor." },
      { question: "Should the overload relay be set to the calculated current?", answer: "Final adjustment should follow the motor nameplate, service factor, ambient conditions, local rules, and relay instructions. The calculator only identifies a suitable adjustable range." },
      { question: "Does an aM fuse replace the overload relay?", answer: "No. An aM fuse is intended for motor short-circuit protection and must be paired with overload protection." }
    ],
    relatedTools: ["motor-current-calculator", "fuse-sizing-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX motor-control support", href: "https://viox.com/contact" },
      { label: "Motor starter selection guide", href: "https://viox.com/how-to-select-contactors-overload-relays-circuit-breakers-motor-power/" }
    ],
    keywords: ["motor starter selection calculator", "contactor sizing calculator", "overload relay calculator", "motor protection calculator"]
  },
  {
    slug: "three-phase-voltage-unbalance-calculator",
    title: "Three-Phase Voltage Unbalance Calculator",
    shortTitle: "Voltage Unbalance",
    category: "motor-control",
    description: "Calculate three-phase voltage unbalance, voltage-window thresholds, and select a starting VIOX FCP18 monitoring-relay function.",
    intent: "Check measured phase-voltage deviation and match the required monitoring functions to the FCP18 family.",
    fields: [
      { id: "wiring", label: "Measurement system", type: "select", defaultValue: "three-wire", options: [
        { value: "three-wire", label: "Three-phase, three-wire (L-L)" },
        { value: "four-wire", label: "Three-phase, four-wire (L-N)" }
      ] },
      { id: "v1", label: "Voltage 1", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "v2", label: "Voltage 2", type: "number", defaultValue: 392, unit: "V", min: 0 },
      { id: "v3", label: "Voltage 3", type: "number", defaultValue: 408, unit: "V", min: 0 },
      { id: "nominal", label: "Nominal voltage", type: "number", defaultValue: 400, unit: "V", min: 0 },
      { id: "overSetting", label: "Overvoltage setting", type: "number", defaultValue: 10, unit: "%", min: 1, max: 30 },
      { id: "underSetting", label: "Undervoltage setting", type: "number", defaultValue: 10, unit: "%", min: 1, max: 30 },
      { id: "asymSetting", label: "Asymmetry threshold", type: "number", defaultValue: 8, unit: "%", min: 1, max: 20 },
      { id: "monitoring", label: "Required monitoring", type: "select", defaultValue: "full-delay", options: [
        { value: "phase", label: "Phase loss and phase sequence only" },
        { value: "voltage", label: "Overvoltage and undervoltage" },
        { value: "full-delay", label: "Full monitoring + adjustable delay" },
        { value: "full-asym", label: "Full monitoring + adjustable asymmetry" },
        { value: "asym", label: "Asymmetry + adjustable delay" },
        { value: "fixed", label: "Fixed full monitoring for OEM panels" }
      ] }
    ],
    formula: "FCP18-style asymmetry % = (maximum voltage - minimum voltage) / average x 100. The calculator also reports maximum-deviation unbalance separately. Voltage-window thresholds are Uhigh = Un x (1 + setting) and Ulow = Un x (1 - setting).",
    assumptions: ["The three entered values use the same measurement basis", "The percentage is a maximum-deviation-from-average calculation", "FCP18 selection follows the function comparison described in the VIOX product guide"],
    warnings: ["Do not mix line-to-line and line-to-neutral readings in one calculation.", "Acceptable voltage unbalance depends on the motor or equipment manufacturer; even modest voltage unbalance can produce much larger current unbalance."],
    faqs: [
      { question: "How is voltage asymmetry calculated?", answer: "For the FCP18 selection result, subtract the minimum reading from the maximum reading, divide by the three-reading average, and multiply by 100. The page also shows the maximum-deviation method as a separate metric." },
      { question: "What is the difference between FCP18-03 and FCP18-04?", answer: "FCP18-03 provides full monitoring with adjustable delay and fixed 8% asymmetry. FCP18-04 provides full monitoring with adjustable 5-15% asymmetry and fixed delay." },
      { question: "Does the relay replace overload or surge protection?", answer: "No. It supervises sustained supply-voltage conditions. Motor overload protection and transient surge protection are separate functions." }
    ],
    relatedTools: ["motor-starter-selection-calculator", "three-phase-current-calculator", "motor-current-calculator"],
    relatedProducts: [
      { label: "VIOX FCP18 selection support", href: "https://viox.com/contact" },
      { label: "FCP18 selection guide", href: "https://viox.com/three-phase-voltage-monitoring-relay-fcp18-selection-guide/" }
    ],
    keywords: ["three phase voltage unbalance calculator", "voltage imbalance calculator", "phase monitoring relay selector", "FCP18 selection"]
  },
  {
    slug: "pv-combiner-box-sizing-calculator",
    title: "PV Combiner Box Sizing Calculator",
    shortTitle: "PV Combiner Box",
    category: "panel-design",
    description: "Size key PV combiner-box ratings from module Voc, Isc, temperature coefficient, series modules, parallel strings, cable ampacity, and lightning exposure.",
    intent: "Coordinate preliminary gPV fuse, output current, isolator or breaker, DC SPD, voltage class, and enclosure requirements.",
    fields: [
      { id: "moduleVoc", label: "Module open-circuit voltage", type: "number", defaultValue: 49.5, unit: "V", min: 0 },
      { id: "vocTempCoeff", label: "Voc temperature coefficient", type: "number", defaultValue: -0.28, unit: "%/°C", max: 0, step: 0.01 },
      { id: "minimumTemp", label: "Minimum design temperature", type: "number", defaultValue: -10, unit: "°C", step: 1 },
      { id: "seriesModules", label: "Modules in series", type: "number", defaultValue: 18, unit: "modules", min: 1, step: 1 },
      { id: "moduleIsc", label: "Module short-circuit current", type: "number", defaultValue: 13.7, unit: "A", min: 0 },
      { id: "parallelStrings", label: "Parallel strings", type: "number", defaultValue: 6, unit: "strings", min: 1, step: 1 },
      { id: "currentFactor", label: "PV current factor", type: "number", defaultValue: 125, unit: "%", min: 100, max: 200 },
      { id: "maxSeriesFuse", label: "Module max series fuse", type: "number", defaultValue: 25, unit: "A", min: 0 },
      { id: "outputCableAmpacity", label: "Corrected output cable ampacity", type: "number", defaultValue: 125, unit: "A", min: 0 },
      { id: "inverterMaxVoltage", label: "Inverter max DC input", type: "number", defaultValue: 1000, unit: "V DC", min: 0 },
      { id: "lightning", label: "Lightning exposure", type: "select", defaultValue: "normal", options: [
        { value: "high", label: "External LPS / high exposure" },
        { value: "normal", label: "Normal exposed PV array" },
        { value: "low", label: "Lower exposure / coordinated upstream protection" }
      ] },
      { id: "environment", label: "Installation environment", type: "select", defaultValue: "outdoor", options: [
        { value: "indoor", label: "Indoor protected location" },
        { value: "outdoor", label: "Outdoor exposed location" },
        { value: "coastal", label: "Coastal / corrosive environment" }
      ] }
    ],
    formula: "Cold string Voc = module Voc x modules in series x [1 + |temperature coefficient| x (25°C - minimum temperature)]. Design current is module Isc x the selected current factor; combined output current also multiplies by parallel-string count.",
    assumptions: ["Module ratings are entered at STC", "Voc coefficient is entered as a negative percent per degree Celsius", "All parallel strings use matching modules and orientation", "Current and voltage factors must be confirmed against the adopted code and module instructions"],
    warnings: ["Cold string Voc must remain below the inverter, isolator, breaker, fuse holder, SPD, terminal, and enclosure system voltage ratings.", "This tool does not replace IEC 62548, IEC 60364-7-712, NEC Article 690, project-specific protection studies, or manufacturer instructions."],
    faqs: [
      { question: "Why does PV voltage increase in cold weather?", answer: "Module open-circuit voltage normally rises as cell temperature falls. The cold-temperature correction prevents a series string from exceeding the inverter or DC component voltage rating." },
      { question: "When are string fuses important?", answer: "They become especially important when other parallel strings can feed damaging reverse current into a faulted string. The final need and rating depend on module limits, string count, conductor protection, inverter design, and local rules." },
      { question: "Can a DC isolator replace a DC breaker?", answer: "Only when overcurrent protection is provided elsewhere and the device is needed solely for rated switching and isolation. An isolator does not automatically provide overcurrent or short-circuit protection." }
    ],
    relatedTools: ["fuse-sizing-calculator", "advanced-spd-selection-calculator", "dc-voltage-drop-calculator"],
    relatedProducts: [
      { label: "VIOX PV combiner support", href: "https://viox.com/contact" },
      { label: "PV combiner protection guide", href: "https://viox.com/solar-combiner-box-protection-design-fuses-breakers-spds/" }
    ],
    keywords: ["pv combiner box sizing calculator", "solar combiner box calculator", "pv string fuse calculator", "solar string voltage calculator"]
  },
  {
    slug: "advanced-spd-selection-calculator",
    title: "Advanced SPD Selection Calculator",
    shortTitle: "Advanced SPD",
    category: "surge-protection",
    description: "Select a preliminary SPD type, connection arrangement, Uc or Ucpv range, discharge-duty level, and backup-protection checks.",
    intent: "Detailed AC or PV SPD screening by voltage, earthing, installation point, external lightning protection, supply exposure, and fault level.",
    fields: [
      { id: "system", label: "System", type: "select", defaultValue: "ac-three", options: [
        { value: "ac-single", label: "Single-phase AC" },
        { value: "ac-three", label: "Three-phase AC" },
        { value: "pv", label: "Solar PV DC" }
      ] },
      { id: "nominalVoltage", label: "Nominal working voltage", type: "number", defaultValue: 230, unit: "V", min: 0, help: "For AC, enter the voltage across each SPD protection mode, normally L-N. For PV, enter maximum corrected array Voc." },
      { id: "earthing", label: "Earthing arrangement", type: "select", defaultValue: "tns", options: [
        { value: "tns", label: "TN-S / TN-C-S" },
        { value: "tt", label: "TT" },
        { value: "it", label: "IT" },
        { value: "dc", label: "PV / DC arrangement" }
      ] },
      { id: "location", label: "Installation point", type: "select", defaultValue: "main", options: [
        { value: "origin", label: "Service entrance / installation origin" },
        { value: "main", label: "Main distribution board" },
        { value: "sub", label: "Sub-distribution board" },
        { value: "equipment", label: "Sensitive equipment panel" }
      ] },
      { id: "externalLps", label: "External lightning protection", type: "select", defaultValue: "no", options: [
        { value: "yes", label: "Present / direct lightning-current risk" },
        { value: "no", label: "Not present" },
        { value: "unknown", label: "Unknown" }
      ] },
      { id: "supply", label: "Supply or cable exposure", type: "select", defaultValue: "underground", options: [
        { value: "overhead", label: "Overhead / highly exposed" },
        { value: "underground", label: "Underground / normal exposure" },
        { value: "long", label: "Long outdoor feeder or PV cable" }
      ] },
      { id: "faultCurrent", label: "Prospective short-circuit current", type: "number", defaultValue: 10, unit: "kA", min: 0 },
      { id: "equipmentWithstand", label: "Equipment impulse withstand", type: "select", defaultValue: "2.5", options: [
        { value: "1.5", label: "1.5 kV sensitive electronics" },
        { value: "2.5", label: "2.5 kV distribution equipment" },
        { value: "4", label: "4 kV robust equipment" },
        { value: "6", label: "6 kV installation-origin equipment" }
      ] }
    ],
    formula: "SPD type is selected from lightning exposure and installation position. The minimum continuous operating voltage basis is rounded above the working voltage with operating margin; the final Uc, Ucpv, Up, In, Imax, Iimp, and backup device must come from a compatible manufacturer selection table.",
    assumptions: ["The entered voltage is across the SPD protection mode, not automatically the system line-to-line label", "AC frequency is 50 or 60 Hz", "The output is a product-family screening result rather than an IEC compliance certificate"],
    warnings: ["TT, IT, PV, and special neutral arrangements require the exact manufacturer connection diagram and failure-mode coordination.", "Lead length can add substantial residual voltage; keep SPD connections short and follow the manufacturer's routing instructions."],
    faqs: [
      { question: "Why should I not select an SPD by kA alone?", answer: "SPD type, Uc or Ucpv, Up, earthing arrangement, installation point, backup protection, short-circuit conditions, and lead length can be more important than a headline maximum-discharge-current value." },
      { question: "What is the difference between In, Imax, and Iimp?", answer: "In is a nominal discharge-current test reference, Imax is a maximum discharge-current rating for Type 2 context, and Iimp is an impulse-current rating associated with Type 1 lightning-current duty." },
      { question: "What does 3+1 mean for an SPD?", answer: "It normally describes phase-to-neutral protection modules plus a separate neutral-to-PE spark-gap or protection path, commonly considered for TT arrangements according to the product design." }
    ],
    relatedTools: ["spd-calculator", "pv-combiner-box-sizing-calculator", "short-circuit-current-calculator"],
    relatedProducts: [
      { label: "VIOX SPD engineering support", href: "https://viox.com/contact" },
      { label: "How to read an SPD datasheet", href: "https://viox.com/how-to-read-spd-datasheet-uc-up-in-imax-iimp-type-backup-fuse/" }
    ],
    keywords: ["advanced spd selection calculator", "surge protection device sizing", "Uc SPD calculator", "Type 1 Type 2 SPD selector"]
  },
  {
    slug: "mcb-inrush-compatibility-checker",
    title: "MCB Inrush Compatibility Checker",
    shortTitle: "MCB Inrush",
    category: "circuit-protection",
    description: "Compare equipment inrush current with IEC-style B, C, or D magnetic-trip bands and check whether available fault current supports instantaneous operation.",
    intent: "Screen nuisance-trip risk without claiming an exact cross-brand trip time.",
    fields: [
      { id: "rating", label: "MCB rated current", type: "number", defaultValue: 16, unit: "A", min: 0 },
      { id: "curve", label: "Selected curve", type: "select", defaultValue: "c", options: [
        { value: "b", label: "B curve (3-5 × In)" },
        { value: "c", label: "C curve (5-10 × In)" },
        { value: "d", label: "D curve (10-20 × In)" }
      ] },
      { id: "inrush", label: "Peak inrush current", type: "number", defaultValue: 90, unit: "A", min: 0 },
      { id: "duration", label: "Inrush duration", type: "number", defaultValue: 100, unit: "ms", min: 0 },
      { id: "faultCurrent", label: "Available fault current", type: "number", defaultValue: 500, unit: "A", min: 0 },
      { id: "breakingCapacity", label: "MCB breaking capacity", type: "number", defaultValue: 6, unit: "kA", min: 0 }
    ],
    formula: "Inrush multiple = peak inrush current / MCB rated current. The result is compared with B: 3-5 × In, C: 5-10 × In, or D: 10-20 × In. Available fault current is checked against the upper magnetic threshold and breaking capacity.",
    assumptions: ["IEC-style B, C, and D magnetic bands", "Peak inrush and available fault current are known or reasonably estimated", "Thermal-memory and manufacturer-specific curve tolerances are not modeled"],
    warnings: ["The checker cannot predict exact trip time across brands; use the selected manufacturer's time-current curve and equipment inrush waveform.", "A curve that rides through inrush may still fail required fault-disconnection time if loop impedance is too high."],
    faqs: [
      { question: "What happens inside the magnetic band?", answer: "Operation is uncertain because the band represents product tolerance. The breaker may trip magnetically, so the actual manufacturer curve and inrush waveform must be checked." },
      { question: "Does a D curve always solve nuisance tripping?", answer: "No. It tolerates more inrush but needs substantially more fault current for guaranteed magnetic operation." },
      { question: "Why is inrush duration included?", answer: "B/C/D thresholds describe the instantaneous region, but longer pulses can interact with thermal operation and product-specific curves." }
    ],
    relatedTools: ["circuit-breaker-size-calculator", "short-circuit-current-calculator", "motor-starter-selection-calculator"],
    relatedProducts: [
      { label: "VIOX MCB selection support", href: "https://viox.com/contact" },
      { label: "B, C, and D curve guide", href: "https://viox.com/mcb-b-c-d-curves-explained-how-to-choose-based-on-inrush-current/" }
    ],
    keywords: ["mcb inrush calculator", "b c d curve checker", "breaker nuisance tripping calculator"]
  },
  {
    slug: "rcd-rcbo-selector",
    title: "RCD & RCBO Selection Calculator",
    shortTitle: "RCD / RCBO",
    category: "circuit-protection",
    description: "Select a starting residual-current type, sensitivity, poles, rated current, overcurrent curve, and breaking capacity for common loads.",
    intent: "Rule-based RCD or RCBO screening for EV, PV, VFD, heat-pump, appliance, wet-area, and distribution circuits.",
    fields: [
      { id: "application", label: "Application", type: "select", defaultValue: "general", options: [
        { value: "general", label: "General sockets / modern loads" },
        { value: "lighting", label: "Lighting circuit" },
        { value: "appliance", label: "Inverter appliance / heat pump" },
        { value: "ev", label: "EV charger" },
        { value: "pv", label: "PV inverter AC side" },
        { value: "vfd", label: "VFD / frequency converter" },
        { value: "wet", label: "Wet / outdoor final circuit" },
        { value: "upstream", label: "Upstream distribution protection" }
      ] },
      { id: "device", label: "Device function", type: "select", defaultValue: "rcbo", options: [
        { value: "rcbo", label: "RCBO: residual + overcurrent" },
        { value: "rcd", label: "RCD/RCCB: residual only" }
      ] },
      { id: "system", label: "Supply conductors", type: "select", defaultValue: "single", options: [
        { value: "single", label: "Single-phase with neutral" },
        { value: "three", label: "Three-phase without neutral" },
        { value: "three-neutral", label: "Three-phase with neutral" }
      ] },
      { id: "loadCurrent", label: "Design current", type: "number", defaultValue: 26, unit: "A", min: 0 },
      { id: "cableAmpacity", label: "Corrected cable ampacity", type: "number", defaultValue: 40, unit: "A", min: 0 },
      { id: "inrushMultiple", label: "Inrush multiple", type: "number", defaultValue: 2, unit: "× In", min: 1, max: 30, step: 0.1, showWhen: { field: "device", values: ["rcbo"] } },
      { id: "faultCurrent", label: "Prospective fault current", type: "number", defaultValue: 5, unit: "kA", min: 0, showWhen: { field: "device", values: ["rcbo"] } },
      { id: "dcDetection", label: "Verified 6 mA DC detection", type: "select", defaultValue: "no", options: [
        { value: "yes", label: "Built into equipment / RDC-DD" },
        { value: "no", label: "Not provided or unknown" }
      ], showWhen: { field: "application", values: ["ev"] } },
      { id: "upstreamRole", label: "Upstream protection role", type: "select", defaultValue: "selective", options: [
        { value: "selective", label: "Selective upstream protection" },
        { value: "fire", label: "Fire-risk protection" }
      ], showWhen: { field: "application", values: ["upstream"] } }
    ],
    formula: "The selector applies an application matrix for residual-current type and sensitivity, then checks Ib ≤ In ≤ Iz. RCBO curve uses inrush screening and breaking capacity is rounded above prospective fault current.",
    assumptions: ["IEC-style final and distribution circuits", "Type and sensitivity are starting recommendations", "Equipment manufacturer instructions and local wiring rules take precedence"],
    warnings: ["EV, PV, VFD, medical, TT, and special installations require product and jurisdiction-specific verification.", "Do not confuse Type B residual-current detection with a B-curve overcurrent trip characteristic."],
    faqs: [
      { question: "When can an EV charger use Type A?", answer: "A Type A device may be a starting option only when verified 6 mA DC residual-current detection is provided and the charger instructions and local rules permit it; otherwise Type B or an approved equivalent is commonly required." },
      { question: "Why are 100 mA and 300 mA not normal final-circuit choices?", answer: "They are commonly used upstream for selectivity or fire-risk protection and do not normally replace 30 mA additional personal protection where required." },
      { question: "Does an RCCB protect against overload?", answer: "No. An RCCB/RCD needs coordinated overcurrent protection. An RCBO combines residual-current and overcurrent functions." }
    ],
    relatedTools: ["mcb-inrush-compatibility-checker", "circuit-breaker-size-calculator", "ev-charger-load-calculator"],
    relatedProducts: [
      { label: "VIOX RCD and RCBO support", href: "https://viox.com/contact" },
      { label: "RCBO selection guide", href: "https://viox.com/how-to-choose-an-rcbo-type-sensitivity-curve-poles-breaking-capacity/" }
    ],
    keywords: ["rcbo selector", "rcd type selector", "type a f b rcd calculator", "ev charger rcbo selection"]
  },
  {
    slug: "ats-selection-calculator",
    title: "ATS Selection Calculator",
    shortTitle: "ATS Selection",
    category: "circuit-protection",
    description: "Select a preliminary ATS current rating, PC or CB class, pole arrangement, transfer-speed category, and UPS or STS requirement.",
    intent: "ATS screening by load current, source type, integrated protection, connected-load ride-through, and available fault current.",
    fields: [
      { id: "loadCurrent", label: "Maximum load current", type: "number", defaultValue: 125, unit: "A", min: 0 },
      { id: "designFactor", label: "ATS design factor", type: "number", defaultValue: 125, unit: "%", min: 100, max: 200 },
      { id: "system", label: "Supply system", type: "select", defaultValue: "three-neutral", options: [
        { value: "single", label: "Single-phase with neutral" },
        { value: "three", label: "Three-phase without neutral" },
        { value: "three-neutral", label: "Three-phase with neutral" }
      ] },
      { id: "neutralSwitching", label: "Neutral switching", type: "select", defaultValue: "required", options: [
        { value: "required", label: "Required by earthing / source design" },
        { value: "not-required", label: "Not required after engineering review" }
      ] },
      { id: "integratedProtection", label: "Integrated fault protection", type: "select", defaultValue: "no", options: [
        { value: "no", label: "No, coordinated upstream protection" },
        { value: "yes", label: "Yes, breaker-based protection required" }
      ] },
      { id: "source", label: "Alternate source", type: "select", defaultValue: "generator", options: [
        { value: "generator", label: "Standby generator" },
        { value: "live", label: "Second continuously available source" }
      ] },
      { id: "loadType", label: "Load ride-through need", type: "select", defaultValue: "general", options: [
        { value: "general", label: "Lighting / HVAC / general distribution" },
        { value: "motor", label: "Motors and pumps" },
        { value: "control", label: "PLC / controls / sensitive electronics" },
        { value: "it", label: "IT / data / critical electronics" },
        { value: "nobreak", label: "No-break process or life-safety continuity" }
      ] },
      { id: "faultCurrent", label: "Available fault current", type: "number", defaultValue: 25, unit: "kA", min: 0 }
    ],
    formula: "Required ATS current = maximum load current × design factor. PC class is selected when upstream protection handles faults; CB class is selected when breaker-based protection is required. Pole and ride-through logic are rule-based.",
    assumptions: ["Low-voltage open-transition ATS is the normal starting architecture", "Maximum load current already reflects realistic demand", "WCR/SCCR and protective-device coordination are checked from product data"],
    warnings: ["Switching time is not total outage time; generator start and stabilization usually dominate restoration time.", "Closed transition, source paralleling, neutral switching, WCR/SCCR, and selective coordination require engineered approval."],
    faqs: [
      { question: "What is the difference between PC and CB class ATS?", answer: "PC class transfers and withstands short-circuit current but normally relies on upstream protection to clear it. CB class uses breaker-based switching and can provide fault interruption within its ratings." },
      { question: "Can a mechanical ATS provide no-break power?", answer: "Not by itself during source loss. Critical loads normally need UPS, energy storage, or an STS between continuously available sources." },
      { question: "Why might a four-pole ATS be required?", answer: "Neutral switching depends on source bonding, earthing arrangement, separately derived source rules, residual-current protection, and local requirements." }
    ],
    relatedTools: ["transformer-sizing-calculator", "short-circuit-current-calculator", "circuit-breaker-size-calculator"],
    relatedProducts: [
      { label: "VIOX ATS selection support", href: "https://viox.com/contact" },
      { label: "PC vs CB class ATS guide", href: "https://viox.com/pc-class-vs-cb-class-ats-selection-guide/" }
    ],
    keywords: ["ats sizing calculator", "automatic transfer switch selector", "pc class cb class ats", "ats pole selection"]
  },
  {
    slug: "cable-lug-selector",
    title: "Cable Lug Selection Calculator",
    shortTitle: "Cable Lug",
    category: "cable-wiring",
    description: "Select a preliminary cable-lug material, conductor marking, stud hole, palm style, finish, and connection method.",
    intent: "Screen copper, tinned-copper, aluminum-rated, or bimetallic lugs before checking the manufacturer crimp system.",
    fields: [
      { id: "sizeSystem", label: "Conductor size system", type: "select", defaultValue: "metric", options: [
        { value: "metric", label: "Metric mm²" },
        { value: "awg", label: "AWG / kcmil" }
      ] },
      { id: "metricSize", label: "Metric conductor size", type: "select", defaultValue: "50", options: ["1.5","2.5","4","6","10","16","25","35","50","70","95","120","150","185","240","300"].map((value) => ({ value, label: `${value} mm²` })), showWhen: { field: "sizeSystem", values: ["metric"] } },
      { id: "awgSize", label: "AWG conductor size", type: "select", defaultValue: "1/0", options: ["14","12","10","8","6","4","2","1","1/0","2/0","3/0","4/0","250","350","400"].map((value) => ({ value, label: Number(value) >= 250 ? `${value} kcmil` : `${value} AWG` })), showWhen: { field: "sizeSystem", values: ["awg"] } },
      { id: "conductorMaterial", label: "Conductor material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper" },
        { value: "aluminum", label: "Aluminum" }
      ] },
      { id: "terminalMaterial", label: "Equipment terminal material", type: "select", defaultValue: "copper", options: [
        { value: "copper", label: "Copper busbar / terminal" },
        { value: "aluminum", label: "Aluminum busbar / terminal" }
      ] },
      { id: "stud", label: "Stud or bolt size", type: "select", defaultValue: "M10", options: ["M5","M6","M8","M10","M12","M14","M16"].map((value) => ({ value, label: value })) },
      { id: "holes", label: "Palm fixing", type: "select", defaultValue: "one", options: [
        { value: "one", label: "One-hole palm" },
        { value: "two", label: "Two-hole anti-rotation palm" }
      ] },
      { id: "environment", label: "Environment", type: "select", defaultValue: "indoor", options: [
        { value: "indoor", label: "Dry indoor panel" },
        { value: "humid", label: "Humid / outdoor" },
        { value: "marine", label: "Marine / corrosive" },
        { value: "battery", label: "Battery / high-current DC" },
        { value: "vibration", label: "High vibration" }
      ] },
      { id: "termination", label: "Termination method", type: "select", defaultValue: "compression", options: [
        { value: "compression", label: "Compression crimp" },
        { value: "mechanical", label: "Mechanical / shear-bolt" }
      ] }
    ],
    formula: "AWG conductor area is converted to an approximate mm² reference. Material, terminal metal, environment, stud size, and anti-rotation requirement determine the starting lug construction.",
    assumptions: ["Conductor size is taken from cable marking, not measured cable diameter", "AWG-to-mm² values are conversion references only", "The exact barrel and die come from the lug manufacturer"],
    warnings: ["Do not install a standard copper lug directly on aluminum conductor unless it is explicitly rated for that use.", "A lug, conductor strand class, die, tool, crimp count, palm, bolt, torque, and terminal pad must be approved as one connection system."],
    faqs: [
      { question: "Is 1/0 AWG exactly the same as 50 mm²?", answer: "No. 1/0 AWG is approximately 53.5 mm². Use the exact conductor marking and the lug manufacturer's chart rather than treating the sizes as interchangeable." },
      { question: "When should I choose tinned copper?", answer: "It is a common starting choice for humid, outdoor, marine, battery, or corrosion-prone environments, but it still requires correct crimping and compatible mating surfaces." },
      { question: "Why use a two-hole lug?", answer: "Two-hole palms improve anti-rotation support for busbars, switchgear, grounding, and vibration-prone connections when the terminal pad matches the hole spacing." }
    ],
    relatedTools: ["cable-size-calculator", "awg-wire-size-calculator", "terminal-heating-calculator"],
    relatedProducts: [
      { label: "VIOX cable-lug support", href: "https://viox.com/contact" },
      { label: "Copper lug selection guide", href: "https://viox.com/copper-lug-size-chart-types-awg-mm2-selection-guide/" }
    ],
    keywords: ["cable lug selector", "copper lug size calculator", "awg lug size", "bimetallic lug selection"]
  },
  {
    slug: "battery-c-rate-runtime-calculator",
    title: "Battery C-Rate & Runtime Calculator",
    shortTitle: "Battery Runtime",
    category: "power-conversion",
    description: "Calculate battery C-rate, P-rate, nominal and usable energy, discharge current, and estimated runtime for packs or BESS projects.",
    intent: "Compare cell/pack Ah calculations with project-level MW and MWh duration while accounting for SOC window, SOH, and efficiency.",
    fields: [
      { id: "level", label: "Calculation level", type: "select", defaultValue: "pack", options: [
        { value: "pack", label: "Battery pack: V, Ah, A" },
        { value: "project", label: "BESS project: MW, MWh" }
      ] },
      { id: "voltage", label: "Nominal pack voltage", type: "number", defaultValue: 48, unit: "V", min: 0, showWhen: { field: "level", values: ["pack"] } },
      { id: "capacityAh", label: "Rated capacity", type: "number", defaultValue: 200, unit: "Ah", min: 0, showWhen: { field: "level", values: ["pack"] } },
      { id: "current", label: "Discharge current", type: "number", defaultValue: 100, unit: "A", min: 0, showWhen: { field: "level", values: ["pack"] } },
      { id: "energyMwh", label: "Rated energy", type: "number", defaultValue: 200, unit: "MWh", min: 0, showWhen: { field: "level", values: ["project"] } },
      { id: "powerMw", label: "Discharge power", type: "number", defaultValue: 50, unit: "MW", min: 0, showWhen: { field: "level", values: ["project"] } },
      { id: "socHigh", label: "Upper SOC limit", type: "number", defaultValue: 90, unit: "%", min: 0, max: 100 },
      { id: "socLow", label: "Lower SOC limit", type: "number", defaultValue: 10, unit: "%", min: 0, max: 100 },
      { id: "soh", label: "State of health", type: "number", defaultValue: 100, unit: "%", min: 1, max: 100 },
      { id: "efficiency", label: "Discharge efficiency", type: "number", defaultValue: 95, unit: "%", min: 1, max: 100 }
    ],
    formula: "Pack energy = V × Ah. C-rate = A / Ah. Project P-rate = MW / MWh. Usable energy = rated energy × SOC window × SOH × efficiency; runtime = usable energy / discharge power.",
    assumptions: ["Constant discharge current or power", "SOC, SOH, and efficiency are independent planning factors", "Voltage sag, auxiliary consumption, temperature, and BMS cutoff dynamics are not modeled"],
    warnings: ["Battery runtime is not perfectly linear at all C-rates, temperatures, chemistries, or ages.", "Use BMS limits, cell data, warranty conditions, PCS efficiency curves, and guaranteed usable-energy definitions for final design."],
    faqs: [
      { question: "What does 1C mean?", answer: "A current equal to rated Ah capacity, such as 100 A from a 100 Ah battery. Idealized runtime is about one hour before operating-window and loss adjustments." },
      { question: "What is the difference between C-rate and P-rate?", answer: "C-rate compares current with Ah capacity at cell or pack level. P-rate compares MW with MWh at project level." },
      { question: "Why is usable energy below nameplate energy?", answer: "SOC limits, degradation, conversion loss, auxiliary loads, temperature, and warranty reserve reduce energy available to the load." }
    ],
    relatedTools: ["kw-kva-amp-calculator", "energy-cost-calculator", "dc-voltage-drop-calculator"],
    relatedProducts: [
      { label: "VIOX BESS protection support", href: "https://viox.com/contact" },
      { label: "Battery energy and C-rate guide", href: "https://viox.com/kwh-vs-mwh-vs-mw-battery-energy-storage-c-rate-p-rate-soc-soh-dod/" }
    ],
    keywords: ["battery c rate calculator", "battery runtime calculator", "mwh duration calculator", "bess p rate"]
  },
  {
    slug: "energy-cost-calculator",
    title: "Electrical Energy Cost Calculator",
    shortTitle: "Energy Cost",
    category: "power-conversion",
    description: "Calculate daily, monthly, and annual electricity consumption and operating cost from power, runtime, quantity, load factor, and tariff.",
    intent: "Estimate operating energy and cost for motors, HVAC, lighting, chargers, and industrial equipment.",
    fields: [
      { id: "power", label: "Rated input power", type: "number", defaultValue: 7.5, unit: "kW", min: 0 },
      { id: "quantity", label: "Equipment quantity", type: "number", defaultValue: 1, unit: "units", min: 1, step: 1 },
      { id: "loadFactor", label: "Average load factor", type: "number", defaultValue: 80, unit: "%", min: 0.1, max: 100 },
      { id: "hoursPerDay", label: "Operating time", type: "number", defaultValue: 10, unit: "h/day", min: 0.1, max: 24 },
      { id: "daysPerMonth", label: "Operating days", type: "number", defaultValue: 26, unit: "days/month", min: 1, max: 31, step: 1 },
      { id: "monthsPerYear", label: "Operating months", type: "number", defaultValue: 12, unit: "months/year", min: 1, max: 12, step: 1 },
      { id: "tariff", label: "Energy tariff", type: "number", defaultValue: 0.12, unit: "/kWh", min: 0, step: 0.001 },
      { id: "currency", label: "Currency", type: "select", defaultValue: "USD", options: ["USD","CNY","EUR","GBP","AUD"].map((value) => ({ value, label: value })) }
    ],
    formula: "Energy = rated kW × quantity × load factor × operating hours. Cost = energy × tariff. Monthly and annual values use entered operating days and months.",
    assumptions: ["Average load factor represents the operating profile", "Tariff is a flat energy charge", "Demand charges, time-of-use pricing, taxes, and fixed fees are excluded"],
    warnings: ["Use measured average input power when available; nameplate output power can understate electrical consumption.", "Industrial bills may include peak-demand, reactive-energy, capacity, and time-of-use charges not represented here."],
    faqs: [
      { question: "What is load factor here?", answer: "It is the average operating power divided by rated input power during running hours. A 7.5 kW machine at 80% load is modeled at 6 kW average." },
      { question: "Does the result include demand charges?", answer: "No. It includes only kWh multiplied by a flat tariff." },
      { question: "Why use input power?", answer: "The electricity meter records electrical input. Motor shaft output or useful thermal output does not include equipment losses." }
    ],
    relatedTools: ["battery-c-rate-runtime-calculator", "kw-kva-amp-calculator", "motor-current-calculator"],
    relatedProducts: [
      { label: "VIOX energy-management support", href: "https://viox.com/contact" },
      { label: "Low-voltage electrical formulas", href: "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/" }
    ],
    keywords: ["electricity cost calculator", "kwh cost calculator", "industrial energy cost", "motor operating cost"]
  },
  {
    slug: "terminal-heating-calculator",
    title: "Electrical Terminal Heating Calculator",
    shortTitle: "Terminal Heating",
    category: "panel-design",
    description: "Calculate contact power loss, voltage drop, daily heat energy, and optional temperature-rise estimate from current and contact resistance.",
    intent: "Quantify why a small increase in terminal or joint resistance creates dangerous I²R heating.",
    fields: [
      { id: "current", label: "Load current", type: "number", defaultValue: 200, unit: "A", min: 0 },
      { id: "resistance", label: "Contact resistance", type: "number", defaultValue: 100, defaultUnit: "uohm", unitOptions: [
        { value: "uohm", label: "µΩ" },
        { value: "mohm", label: "mΩ" },
        { value: "ohm", label: "Ω" }
      ], min: 0 },
      { id: "referenceResistance", label: "Healthy reference resistance", type: "number", defaultValue: 25, defaultUnit: "uohm", unitOptions: [
        { value: "uohm", label: "µΩ" },
        { value: "mohm", label: "mΩ" },
        { value: "ohm", label: "Ω" }
      ], min: 0 },
      { id: "hours", label: "Loaded time", type: "number", defaultValue: 12, unit: "h/day", min: 0, max: 24 },
      { id: "thermalResistance", label: "Estimated thermal resistance", type: "number", defaultValue: 8, unit: "K/W", min: 0, help: "Optional engineering estimate. Actual value depends on terminal geometry, conductor, enclosure, airflow, and mounting." },
      { id: "ambient", label: "Ambient temperature", type: "number", defaultValue: 35, unit: "°C", min: -50, max: 150 }
    ],
    formula: "Contact loss P = I²R. Contact voltage drop V = IR. Daily heat energy = P × hours. Optional temperature rise = P × thermal resistance.",
    assumptions: ["Current and contact resistance remain constant", "Resistance is the complete measured connection resistance", "Thermal resistance is an optional lumped estimate, not a tested terminal characteristic"],
    warnings: ["Calculated temperature is not a certified terminal temperature; real heating depends on conductor heat sinking, cycling, airflow, enclosure, oxidation, and measurement method.", "Hot, discolored, loose, arcing, or damaged terminals require de-energized qualified inspection and corrective action."],
    faqs: [
      { question: "Why does terminal heating rise so quickly?", answer: "Power is proportional to current squared. Doubling current produces four times the heat at the same resistance." },
      { question: "Can a tiny resistance matter?", answer: "Yes. At hundreds of amperes, tens or hundreds of micro-ohms can create several watts at one small contact area." },
      { question: "Can this predict exact terminal temperature?", answer: "Only if a validated thermal resistance is known for the actual assembly. Otherwise the temperature result is a sensitivity estimate." }
    ],
    relatedTools: ["cable-lug-selector", "busbar-current-rating-calculator", "three-phase-voltage-unbalance-calculator"],
    relatedProducts: [
      { label: "VIOX connection support", href: "https://viox.com/contact" },
      { label: "Low-voltage maintenance formulas", href: "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/" }
    ],
    keywords: ["terminal heating calculator", "i2r heating calculator", "contact resistance heat", "electrical joint temperature rise"]
  },
  {
    slug: "busbar-short-circuit-force-calculator",
    title: "Busbar Short-Circuit Force Calculator",
    shortTitle: "Busbar Force",
    category: "panel-design",
    description: "Estimate electrodynamic force between parallel busbars from peak short-circuit current, conductor spacing, and unsupported support span.",
    intent: "Screen busbar-support mechanical duty before complete assembly verification and testing.",
    fields: [
      { id: "currentBasis", label: "Fault-current input", type: "select", defaultValue: "rms", options: [
        { value: "rms", label: "RMS symmetrical short-circuit current" },
        { value: "peak", label: "Peak short-circuit current" }
      ] },
      { id: "faultCurrent", label: "Short-circuit current", type: "number", defaultValue: 50, unit: "kA", min: 0 },
      { id: "peakFactor", label: "RMS-to-peak factor", type: "number", defaultValue: 2.2, min: 1.414, max: 3, step: 0.01, showWhen: { field: "currentBasis", values: ["rms"] }, help: "Use the project or standard-derived peak factor when known; it depends on X/R ratio and system method." },
      { id: "spacing", label: "Busbar center spacing", type: "number", defaultValue: 100, unit: "mm", min: 0 },
      { id: "span", label: "Unsupported span", type: "number", defaultValue: 500, unit: "mm", min: 0 },
      { id: "supportRating", label: "Support mechanical rating", type: "number", defaultValue: 15000, unit: "N", min: 0 }
    ],
    formula: "For long parallel conductors, F = μ0/(2π) × ip²/a × l = 2 × 10⁻⁷ × ip² × l/a, using amperes and metres.",
    assumptions: ["Two long straight parallel conductor paths", "Uniform spacing and current distribution", "Peak current and unsupported length represent the critical section", "End effects, multi-phase geometry, bar flexibility, resonance, and enclosure structure are excluded"],
    warnings: ["This simplified force is not IEC 61439 assembly verification or a complete mechanical stress calculation.", "Actual design must include phase geometry, number of bars, current sharing, support layout, fasteners, material stress, dynamic response, and tested withstand data."],
    faqs: [
      { question: "Why use peak current instead of RMS current?", answer: "Mechanical force follows instantaneous current squared, so the first asymmetrical peak is critical. RMS current must be converted using an appropriate peak factor." },
      { question: "What happens if spacing is halved?", answer: "The simplified force doubles because force is inversely proportional to conductor spacing." },
      { question: "What happens if fault current doubles?", answer: "Force increases approximately four times because it is proportional to peak current squared." }
    ],
    relatedTools: ["short-circuit-current-calculator", "busbar-current-rating-calculator", "terminal-heating-calculator"],
    relatedProducts: [
      { label: "VIOX busbar-support engineering", href: "https://viox.com/contact" },
      { label: "Busbar insulator selection guide", href: "https://viox.com/busbar-insulator-selection-guide/" }
    ],
    keywords: ["busbar short circuit force calculator", "electrodynamic force busbar", "busbar support spacing", "peak fault current force"]
  }
];

export const toolsBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool])) as Record<string, ToolDefinition>;

export function getToolsByCategory(category: string) {
  return tools.filter((tool) => tool.category === category);
}
