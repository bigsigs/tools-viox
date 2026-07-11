import type { ToolDefinition } from "./types";

export const site = {
  name: "VIOX Electrical Tools",
  origin: "https://tools.viox.com",
  description: "VIOX Electrical Tools provides browser-based reference calculators for low-voltage protection, cable sizing, voltage drop, motor current, EV charging, and surge protection selection work.",
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
  }
};

export function toolTitle(tool: ToolDefinition) {
  return toolSeoMeta[tool.slug]?.title ?? `${tool.title} | VIOX Electrical Tools`;
}

export function toolDescription(tool: ToolDefinition) {
  return toolSeoMeta[tool.slug]?.description ?? tool.description;
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
