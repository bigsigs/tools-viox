import type { ToolLink } from "./types";

type Resources = Record<string, { articles: ToolLink[]; products: ToolLink[] }>;
const resource = (articleLabel: string, article: string, productLabel: string, product: string) => ({ articles: [{ label: articleLabel, href: article }], products: [{ label: productLabel, href: product }] });

export const expansionResources: Resources = {
  "three-phase-power-calculator": resource("Single-phase and three-phase power systems", "https://viox.com/the-technical-nuances-of-single-phase-and-three-phase-power-systems/", "VIOX contactors", "https://viox.com/ac-contactor/"),
  "battery-capacity-converter": resource("Battery energy and power units guide", "https://viox.com/kwh-vs-mwh-vs-mw-battery-energy-storage/", "VIOX DC circuit breakers", "https://viox.com/dc-mcb/"),
  "power-energy-time-calculator": resource("kW and kWh difference explained", "https://viox.com/kw-vs-kwh-difference/", "VIOX electrical protection products", "https://viox.com/products/"),
  "voltage-divider-calculator": resource("Low-voltage electrical formulas guide", "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/", "VIOX terminal blocks", "https://viox.com/terminal-block/"),
  "clearance-creepage-calculator": resource("Low-voltage panel design and electrical formulas", "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/", "VIOX terminal blocks", "https://viox.com/terminal-block/"),
  "ohms-law-calculator": resource("Low-voltage electrical formulas guide", "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/", "VIOX electrical terminal blocks", "https://viox.com/terminal-block/"),
  "watts-amps-volts-calculator": resource("Single-phase and three-phase power guide", "https://viox.com/the-technical-nuances-of-single-phase-and-three-phase-power-systems/", "VIOX miniature circuit breakers", "https://viox.com/mcb/"),
  "ev-charging-time-cost-calculator": resource("EV charger circuit protection guide", "https://viox.com/ev-charger-circuit-breaker-sizing-guide-7kw-22kw/", "VIOX EV charger protection products", "https://viox.com/rcbo/"),
  "battery-charging-time-calculator": resource("Battery power and energy unit guide", "https://viox.com/kwh-vs-mwh-vs-mw-battery-energy-storage/", "VIOX DC circuit breakers", "https://viox.com/dc-mcb/"),
  "resistor-series-parallel-calculator": resource("Low-voltage electrical formulas guide", "https://viox.com/electrical-formulas-low-voltage-panel-design-maintenance/", "VIOX terminal block products", "https://viox.com/terminal-block/"),
  "electrical-unit-converter": resource("kW and kWh difference explained", "https://viox.com/kw-vs-kwh-difference/", "VIOX electrical protection products", "https://viox.com/products/"),
  "contactor-selection-calculator": resource("Motor contactor selection guide", "https://viox.com/how-to-select-contactors-and-circuit-breakers-based-on-motor-power/", "VIOX AC contactor products", "https://viox.com/ac-contactor/"),
  "breaker-selectivity-calculator": resource("Circuit breaker selection guide", "https://viox.com/standard-breaker-sizes/", "VIOX MCB and MCCB products", "https://viox.com/mccb/"),
  "lightning-risk-assessment-calculator": resource("SPD Type 1, Type 2 and Type 3 guide", "https://viox.com/surge-protective-device-type-1-vs-type-2-vs-type-3/", "VIOX surge protective devices", "https://viox.com/spd/"),
  "enclosure-temperature-rise-calculator": resource("Control panel thermal design guide", "https://viox.com/terminal-block-overheating-control-panels/", "VIOX electrical enclosure products", "https://viox.com/enclosures/"),
  "panel-heat-loss-calculator": resource("Control panel temperature and heating guide", "https://viox.com/terminal-block-overheating-control-panels/", "VIOX low-voltage panel components", "https://viox.com/products/"),
  "pv-string-sizing-calculator": resource("Solar combiner box sizing guide", "https://viox.com/solar-combiner-box-sizing-guide-expansion/", "VIOX PV combiner boxes", "https://viox.com/combiner-box/"),
  "off-grid-solar-system-calculator": resource("Battery storage power and energy guide", "https://viox.com/kwh-vs-mwh-vs-mw-battery-energy-storage/", "VIOX solar DC protection products", "https://viox.com/dc-mcb/"),
  "spd-backup-fuse-calculator": resource("How to read an SPD datasheet", "https://viox.com/how-to-read-spd-datasheet/", "VIOX SPD and fuse products", "https://viox.com/fuse/"),
  "earth-fault-loop-impedance-calculator": resource("Circuit breaker and wire sizing guide", "https://viox.com/wire-gauge-vs-circuit-breaker-sizing-chart/", "VIOX miniature circuit breakers", "https://viox.com/mcb/"),
  "cable-derating-factor-calculator": resource("IEC cable sizing and voltage-drop guide", "https://viox.com/iec-60204-1-cable-sizing-formulas-voltage-drop-trunking-capacity-tables/", "VIOX cable connection products", "https://viox.com/cable-lug/"),
  "maximum-demand-calculator": resource("Circuit breaker load calculation guide", "https://viox.com/homeowners-guide-to-circuit-breaker-sizing-and-load-calculation/", "VIOX molded case circuit breakers", "https://viox.com/mccb/"),
  "protective-conductor-size-calculator": resource("IEC cable sizing formulas guide", "https://viox.com/iec-60204-1-cable-sizing-formulas-voltage-drop-trunking-capacity-tables/", "VIOX cable lugs and terminals", "https://viox.com/cable-lug/"),
  "cable-short-circuit-thermal-calculator": resource("Short-circuit current calculation guide", "https://viox.com/how-to-calculate-short-circuit-current-for-mcb/", "VIOX cable connection products", "https://viox.com/cable-lug/"),
  "motor-starting-voltage-drop-calculator": resource("Motor starter types and selection guide", "https://viox.com/types-of-motor-starters-selection-guide/", "VIOX motor contactors and starters", "https://viox.com/ac-contactor/"),
  "vfd-sizing-protection-calculator": resource("VFD circuit protection and selection support", "https://viox.com/how-to-select-contactors-and-circuit-breakers-based-on-motor-power/", "VIOX MCCB and contactor products", "https://viox.com/mccb/"),
  "arc-flash-incident-energy-calculator": resource("Short-circuit current calculation guide", "https://viox.com/how-to-calculate-short-circuit-current-for-mcb/", "VIOX MCCB and ACB protection products", "https://viox.com/mccb/"),
  "lighting-calculator": resource("Circuit breaker load calculation guide", "https://viox.com/homeowners-guide-to-circuit-breaker-sizing-and-load-calculation/", "VIOX lighting circuit breakers", "https://viox.com/mcb/"),
  "cable-tray-fill-calculator": resource("IEC cable sizing and installation guide", "https://viox.com/iec-60204-1-cable-sizing-formulas-voltage-drop-trunking-capacity-tables/", "VIOX cable glands", "https://viox.com/cable-gland/"),
  "stationary-battery-sizing-calculator": resource("BESS DC, AC and signal surge protection guide", "https://viox.com/bess-surge-protection-dc-ac-signal-spd-selection-guide/", "VIOX DC circuit breakers", "https://viox.com/dc-mcb/"),
  "residential-electrical-load-calculator": resource("Circuit breaker load and wire sizing guide", "https://viox.com/homeowners-guide-to-circuit-breaker-sizing-and-load-calculation/", "VIOX residential RCBOs", "https://viox.com/rcbo/"),
  "nema-ip-rating-converter": resource("IP rating selection guide", "https://viox.com/ip-rating-chart/", "VIOX electrical enclosures", "https://viox.com/enclosures/")
};
