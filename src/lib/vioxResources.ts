import type { ToolLink } from "./types";

type VioxResourceSet = {
  articles: ToolLink[];
  products: ToolLink[];
};

export const vioxResourcesByTool: Record<string, VioxResourceSet> = {
  "spd-calculator": {
    articles: [{ label: "Type 1 vs Type 2 vs Type 3 SPD guide", href: "https://viox.com/surge-protective-device-type-1-vs-type-2-vs-type-3/" }],
    products: [{ label: "VIOX surge protective devices", href: "https://viox.com/spd/" }]
  },
  "voltage-drop-calculator": {
    articles: [{ label: "IEC cable sizing and voltage drop formulas", href: "https://viox.com/iec-60204-1-cable-sizing-formulas-voltage-drop-trunking-capacity-tables/" }],
    products: [{ label: "VIOX cable lugs", href: "https://viox.com/cable-lug/" }]
  },
  "cable-size-calculator": {
    articles: [{ label: "Wire gauge and circuit breaker sizing chart", href: "https://viox.com/wire-gauge-vs-circuit-breaker-sizing-chart/" }],
    products: [{ label: "VIOX cable lugs", href: "https://viox.com/cable-lug/" }]
  },
  "conduit-fill-calculator": {
    articles: [{ label: "Complete cable gland selection guide", href: "https://viox.com/a-full-guide-to-cable-gland/" }],
    products: [{ label: "VIOX cable glands", href: "https://viox.com/cable-gland/" }]
  },
  "dc-voltage-drop-calculator": {
    articles: [{ label: "Metric, AWG, and BS cable size guide", href: "https://viox.com/cable-size-types-mm-awg-bs-conversion-guide/" }],
    products: [{ label: "VIOX DC miniature circuit breakers", href: "https://viox.com/dc-mcb/" }]
  },
  "awg-wire-size-calculator": {
    articles: [{ label: "Wire gauge and breaker sizing chart", href: "https://viox.com/wire-gauge-vs-circuit-breaker-sizing-chart/" }],
    products: [{ label: "VIOX cable lugs", href: "https://viox.com/cable-lug/" }]
  },
  "mm2-to-awg-converter": {
    articles: [{ label: "mm², AWG, and BS cable conversion guide", href: "https://viox.com/cable-size-types-mm-awg-bs-conversion-guide/" }],
    products: [{ label: "VIOX metric and AWG cable lugs", href: "https://viox.com/cable-lug/" }]
  },
  "circuit-breaker-size-calculator": {
    articles: [{ label: "Standard circuit breaker sizes", href: "https://viox.com/standard-breaker-sizes/" }],
    products: [
      { label: "VIOX miniature circuit breakers", href: "https://viox.com/mcb/" },
      { label: "VIOX molded case circuit breakers", href: "https://viox.com/mccb/" }
    ]
  },
  "transformer-sizing-calculator": {
    articles: [{ label: "Transformer kVA rating explained", href: "https://viox.com/transformer-kva-rating-explained/" }],
    products: [{ label: "VIOX molded case circuit breakers", href: "https://viox.com/mccb/" }]
  },
  "short-circuit-current-calculator": {
    articles: [{ label: "How to calculate short-circuit current", href: "https://viox.com/how-to-calculate-short-circuit-current-for-mcb/" }],
    products: [{ label: "VIOX high-breaking-capacity MCCBs", href: "https://viox.com/mccb/" }]
  },
  "kw-kva-amp-calculator": {
    articles: [{ label: "Single-phase vs three-phase power systems", href: "https://viox.com/the-technical-nuances-of-single-phase-and-three-phase-power-systems/" }],
    products: [{ label: "VIOX miniature circuit breakers", href: "https://viox.com/mcb/" }]
  },
  "three-phase-current-calculator": {
    articles: [{ label: "Single-phase vs three-phase power systems", href: "https://viox.com/the-technical-nuances-of-single-phase-and-three-phase-power-systems/" }],
    products: [{ label: "VIOX AC contactors", href: "https://viox.com/ac-contactor/" }]
  },
  "motor-current-calculator": {
    articles: [{ label: "Motor contactor and breaker selection guide", href: "https://viox.com/how-to-select-contactors-and-circuit-breakers-based-on-motor-power/" }],
    products: [{ label: "VIOX AC contactors", href: "https://viox.com/ac-contactor/" }]
  },
  "ev-charger-load-calculator": {
    articles: [{ label: "7 kW and 22 kW EV charger breaker sizing", href: "https://viox.com/ev-charger-circuit-breaker-sizing-guide-7kw-22kw/" }],
    products: [{ label: "VIOX RCBO protection", href: "https://viox.com/rcbo/" }]
  },
  "cable-gland-size-calculator": {
    articles: [{ label: "Complete cable gland selection guide", href: "https://viox.com/a-full-guide-to-cable-gland/" }],
    products: [{ label: "VIOX cable glands", href: "https://viox.com/cable-gland/" }]
  },
  "busbar-current-rating-calculator": {
    articles: [{ label: "Copper busbar selection and plating guide", href: "https://viox.com/busbar-selection-guide-copper-tin-silver-plating-comparison/" }],
    products: [{ label: "VIOX electrical busbars", href: "https://viox.com/busbar/" }]
  },
  "fuse-sizing-calculator": {
    articles: [{ label: "IEC 60269 gG, aM, and NH fuse selection", href: "https://viox.com/iec-60269-low-voltage-fuse-selection-guide-gg-am-nh/" }],
    products: [{ label: "VIOX low-voltage fuses", href: "https://viox.com/fuse/" }]
  },
  "power-factor-correction-calculator": {
    articles: [{ label: "Low-voltage electrical formulas", href: "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/" }],
    products: [{ label: "VIOX AC contactors", href: "https://viox.com/ac-contactor/" }]
  },
  "motor-starter-selection-calculator": {
    articles: [{ label: "Motor starter types and selection guide", href: "https://viox.com/types-of-motor-starters-selection-guide/" }],
    products: [{ label: "VIOX AC contactors", href: "https://viox.com/ac-contactor/" }]
  },
  "three-phase-voltage-unbalance-calculator": {
    articles: [{ label: "Three-phase voltage monitoring relay guide", href: "https://viox.com/three-phase-voltage-monitoring-relay-fcp18-selection-guide/" }],
    products: [{ label: "VIOX FCP18 three-phase voltage relay", href: "https://viox.com/product/viox-fcp18-three-phase-voltage-relay/" }]
  },
  "pv-combiner-box-sizing-calculator": {
    articles: [{ label: "Solar combiner box sizing guide", href: "https://viox.com/solar-combiner-box-sizing-guide-expansion/" }],
    products: [{ label: "VIOX PV combiner boxes", href: "https://viox.com/combiner-box/" }]
  },
  "advanced-spd-selection-calculator": {
    articles: [{ label: "How to read an SPD datasheet", href: "https://viox.com/how-to-read-spd-datasheet/" }],
    products: [{ label: "VIOX AC and PV surge protective devices", href: "https://viox.com/spd/" }]
  },
  "mcb-inrush-compatibility-checker": {
    articles: [{ label: "What is inrush current?", href: "https://viox.com/what-is-inrush-current/" }],
    products: [{ label: "VIOX B, C, and D curve MCBs", href: "https://viox.com/mcb/" }]
  },
  "rcd-rcbo-selector": {
    articles: [{ label: "RCBO Type AC, A, F, and B comparison", href: "https://viox.com/rcbo-type-a-vs-type-ac-vs-type-f-vs-type-b/" }],
    products: [{ label: "VIOX residual-current circuit breakers", href: "https://viox.com/rcbo/" }]
  },
  "ats-selection-calculator": {
    articles: [{ label: "PC class vs CB class ATS selection", href: "https://viox.com/pc-class-vs-cb-class-ats-selection-guide/" }],
    products: [{ label: "VIOX automatic transfer switches", href: "https://viox.com/ats/" }]
  },
  "cable-lug-selector": {
    articles: [{ label: "Complete cable lug selection guide", href: "https://viox.com/the-complete-guide-to-cable-lugs/" }],
    products: [{ label: "VIOX copper and bimetallic cable lugs", href: "https://viox.com/cable-lug/" }]
  },
  "battery-c-rate-runtime-calculator": {
    articles: [{ label: "kW, kWh, MW, and MWh for battery storage", href: "https://viox.com/kwh-vs-mwh-vs-mw-battery-energy-storage/" }],
    products: [{ label: "VIOX DC circuit breakers", href: "https://viox.com/dc-mcb/" }]
  },
  "energy-cost-calculator": {
    articles: [{ label: "kW vs kWh explained", href: "https://viox.com/kw-vs-kwh-difference/" }],
    products: [{ label: "VIOX modular contactors for load control", href: "https://viox.com/modular-contactor/" }]
  },
  "terminal-heating-calculator": {
    articles: [{ label: "Terminal block overheating in control panels", href: "https://viox.com/terminal-block-overheating-control-panels/" }],
    products: [{ label: "VIOX terminal blocks", href: "https://viox.com/terminal-block/" }]
  },
  "busbar-short-circuit-force-calculator": {
    articles: [{ label: "Busbar insulator selection guide", href: "https://viox.com/busbar-insulator-selection-guide/" }],
    products: [{ label: "VIOX busbar insulators", href: "https://viox.com/busbar-insulator/" }]
  }
};
