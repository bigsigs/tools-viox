import type { ToolDefinition } from "./types";

export const site = {
  name: "VIOX Electrical Tools",
  origin: "https://tools.viox.com",
  description: "Use 57 free electrical calculators for voltage, cable, enclosures, lighting, MCB, MCCB, SPD, motors, VFDs, solar, batteries, EV charging, and panel design.",
  logo: "https://viox.com/wp-content/uploads/2021/05/VIOX-NEW-LOGO.png"
};

const toolSeoMeta: Record<string, { title: string; description: string }> = {
  "spd-calculator": {
    title: "SPD Calculator & Selection Guide | VIOX",
    description: "Choose a starting Type 1, Type 2, Type 3, or DC/PV surge protective device based on lightning exposure, supply, board location, and system."
  },
  "voltage-drop-calculator": {
    title: "Voltage Drop Calculator & Formula | VIOX",
    description: "Calculate voltage drop in volts and percent for DC, single-phase, and three-phase circuits using current, cable length, material, and conductor size."
  },
  "cable-size-calculator": {
    title: "Cable Size Calculator & Ampacity Guide | VIOX",
    description: "Estimate a metric cable size from load current, sizing factor, conductor material, and installation derating, then review voltage drop and protection."
  },
  "conduit-fill-calculator": {
    title: "Conduit Fill Calculator & Fill Guide | VIOX",
    description: "Calculate conduit fill percentage for EMT, RMC, and PVC using cable outside diameter, quantity, raceway size, and common fill limits."
  },
  "dc-voltage-drop-calculator": {
    title: "DC Voltage Drop Calculator & Wire Guide | VIOX",
    description: "Calculate DC voltage drop, load-end voltage, and percent loss from source voltage, current, one-way length, AWG size, material, and temperature."
  },
  "awg-wire-size-calculator": {
    title: "AWG Wire Size Calculator: Ampacity & Drop | VIOX",
    description: "Find the smallest listed AWG wire size that passes reference ampacity, continuous-load, conductor bundling, and voltage-drop checks."
  },
  "mm2-to-awg-converter": {
    title: "Free mm² to AWG and AWG to mm² Converter + Chart | VIOX",
    description: "Free mm² to AWG and AWG to mm² converter with a full chart. Compare exact area, nearest gauge, not-smaller size, diameter, and conversion error."
  },
  "circuit-breaker-size-calculator": {
    title: "Circuit Breaker Size Calculator | VIOX",
    description: "Estimate a standard breaker current rating from load power, voltage, phase, power factor, and sizing factor for preliminary MCB or MCCB selection."
  },
  "transformer-sizing-calculator": {
    title: "Transformer Sizing Calculator (kVA) | VIOX",
    description: "Estimate transformer kVA from connected load, power factor, demand, growth, target loading, ambient derating, phase, and standard rating series."
  },
  "short-circuit-current-calculator": {
    title: "Short Circuit Current Calculator | VIOX",
    description: "Estimate transformer secondary fault current from transformer kVA, percent impedance, voltage, phase, and optional utility fault contribution."
  },
  "kw-kva-amp-calculator": {
    title: "kW to Amps & kVA Calculator | VIOX",
    description: "Convert output kW to input kW, kVA, and current for DC, single-phase, or three-phase systems using voltage, power factor, and efficiency."
  },
  "three-phase-current-calculator": {
    title: "Three Phase Current Calculator | VIOX",
    description: "Calculate balanced three-phase line current from kW or kVA, line voltage, power factor, and efficiency with formulas and worked examples."
  },
  "motor-current-calculator": {
    title: "Motor Current Calculator & FLC Formula | VIOX",
    description: "Estimate three-phase motor full-load current and an overload reference from motor kW or hp, line voltage, power factor, and efficiency."
  },
  "ev-charger-load-calculator": {
    title: "EV Charger Load Calculator | VIOX",
    description: "Estimate current per EV charger and planned feeder demand from charger power, voltage, phase, quantity, power factor, and simultaneity."
  },
  "cable-gland-size-calculator": {
    title: "Cable Gland Size Calculator | VIOX",
    description: "Find a starting metric cable gland thread from cable outside diameter, armored or unarmored construction, and indoor, outdoor, or hazardous service."
  },
  "busbar-current-rating-calculator": {
    title: "Busbar Current Rating Calculator | VIOX",
    description: "Estimate copper or aluminum busbar current from width, thickness, current density, material factor, and installation derating."
  },
  "fuse-sizing-calculator": {
    title: "Fuse Size Calculator: gG, aM & gPV | VIOX",
    description: "Estimate a preliminary gG, aM, or gPV fuse size and check load current, cable or module limits, starting duty, voltage, and breaking capacity."
  },
  "power-factor-correction-calculator": {
    title: "Power Factor Calculator: P, Q, S & kVAR | VIOX",
    description: "Calculate power factor, phase angle, real, reactive and apparent power, line current, or the capacitor-bank kVAR required for power factor correction."
  },
  "lighting-calculator": {
    title: "Lighting Calculator: Lux, Lumens & LED Fixtures | VIOX",
    description: "Calculate required lumens, LED fixture quantity, maintained lux, lighting watts, current, and preliminary circuit count from room size and lighting factors."
  },
  "cable-tray-fill-calculator": {
    title: "Cable Tray Fill & Sizing Calculator | VIOX",
    description: "Calculate cable tray area fill, reserve capacity, single-layer width, remaining cable capacity, load per metre, and preliminary tray width."
  },
  "stationary-battery-sizing-calculator": {
    title: "Stationary Battery & DC System Sizing Calculator | VIOX",
    description: "Estimate stationary battery Ah, series cells, parallel strings, peak C-rate, bank kWh, charger current, and DC protection current from a load duty cycle."
  },
  "residential-electrical-load-calculator": {
    title: "Residential Electrical Load & Service Size Calculator | VIOX",
    description: "Estimate dwelling demand, service amps, standard service size, remaining capacity, HVAC contribution, and EV charger impact using transparent load methods."
  },
  "nema-ip-rating-converter": {
    title: "NEMA to IP Rating Converter & Enclosure Selector | VIOX",
    description: "Cross-reference NEMA enclosure Types to IP ratings, decode IP digits, and select a starting enclosure Type for water, dust, corrosion, oil, ice, and immersion."
  },
  "motor-starter-selection-calculator": {
    title: "Motor Starter Selection Calculator | VIOX",
    description: "Estimate motor current and select a starting contactor, overload relay range, starter method, and short-circuit protection path from motor and load data."
  },
  "three-phase-voltage-unbalance-calculator": {
    title: "Three Phase Voltage Unbalance Calculator | VIOX",
    description: "Calculate maximum three-phase voltage unbalance from three line-to-line readings and screen a starting phase-monitoring relay configuration."
  },
  "pv-combiner-box-sizing-calculator": {
    title: "PV Combiner Box Sizing Calculator | VIOX",
    description: "Estimate PV string voltage, combined current, string fuse basis, output protection, SPD voltage screen, and enclosure requirements for a combiner box."
  },
  "advanced-spd-selection-calculator": {
    title: "Advanced SPD Selection Calculator: Uc & Up | VIOX",
    description: "Screen SPD Type, connection arrangement, Uc or Ucpv, protection level, lead allowance, short-circuit duty, and backup protection requirements."
  },
  "mcb-inrush-compatibility-checker": {
    title: "MCB Inrush Current & Trip Curve Checker | VIOX",
    description: "Compare equipment inrush with B, C, and D magnetic-trip bands, check nuisance-trip risk, fault-current threshold, and MCB breaking capacity."
  },
  "rcd-rcbo-selector": {
    title: "RCD & RCBO Selection Calculator | VIOX",
    description: "Select a starting RCD or RCBO type, sensitivity, poles, rated current, overcurrent curve, and breaking capacity for EV, VFD, PV, and general loads."
  },
  "ats-selection-calculator": {
    title: "ATS Selection & Sizing Calculator | VIOX",
    description: "Estimate ATS current rating, PC or CB class, 2P, 3P, or 4P arrangement, transfer architecture, load ride-through, and fault-rating requirements."
  },
  "cable-lug-selector": {
    title: "Cable Lug Size & Type Selector | VIOX",
    description: "Choose a starting cable lug by mm², AWG or kcmil size, conductor and terminal metals, stud hole, palm pattern, environment, and termination method."
  },
  "battery-c-rate-runtime-calculator": {
    title: "Battery C-Rate & Runtime Calculator | VIOX",
    description: "Calculate battery C-rate or BESS P-rate, usable energy, SOC window, DOD, SOH, efficiency, and estimated runtime from Ah, Wh, MW, or MWh inputs."
  },
  "energy-cost-calculator": {
    title: "Energy Cost Calculator: kWh Cost | VIOX",
    description: "Calculate daily, monthly, and annual electricity use and cost from equipment power, quantity, load factor, operating hours, calendar, and energy tariff."
  },
  "terminal-heating-calculator": {
    title: "Terminal Heating Calculator: I²R Loss | VIOX",
    description: "Calculate terminal contact power loss, voltage drop, daily heat energy, resistance increase, and an optional temperature-rise sensitivity estimate."
  },
  "busbar-short-circuit-force-calculator": {
    title: "Busbar Short-Circuit Force Calculator | VIOX",
    description: "Estimate peak electrodynamic force between parallel busbars from short-circuit current, peak factor, conductor spacing, support span, and support rating."
  }
};

export function toolTitle(tool: ToolDefinition) {
  return toolSeoMeta[tool.slug]?.title ?? `${tool.shortTitle ?? tool.title} Calculator & Guide | VIOX`;
}

export function toolDescription(tool: ToolDefinition) {
  if (toolSeoMeta[tool.slug]?.description) return toolSeoMeta[tool.slug].description;
  const text = `${tool.description} ${tool.intent}`;
  if (text.length <= 165) return text;
  return `${text.slice(0, 161).replace(/\s+\S*$/, "")}...`;
}

export function toolUrl(tool: ToolDefinition) {
  return `${site.origin}/${tool.slug}/`;
}

export function softwareSchema(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "EngineeringApplication",
    operatingSystem: "Web",
    url: toolUrl(tool),
    description: tool.description,
    publisher: {
      "@type": "Organization",
      name: "VIOX",
      url: "https://viox.com/",
      logo: site.logo
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
