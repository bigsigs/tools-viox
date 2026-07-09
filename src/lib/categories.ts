import type { ToolCategory } from "./types";

export const categories: Record<ToolCategory, {
  slug: ToolCategory;
  title: string;
  deck: string;
  description: string;
}> = {
  "surge-protection": {
    slug: "surge-protection",
    title: "Surge Protection Tools",
    deck: "SPD selection and coordination",
    description: "Calculators for AC, DC, and PV surge protection selection workflows."
  },
  "circuit-protection": {
    slug: "circuit-protection",
    title: "Circuit Protection Tools",
    deck: "Breaker sizing and protection checks",
    description: "Tools for estimating MCB, MCCB, RCBO, and load protection requirements."
  },
  "cable-wiring": {
    slug: "cable-wiring",
    title: "Cable and Wiring Tools",
    deck: "Cable sizing, voltage drop, and entry planning",
    description: "Practical calculators for conductor sizing, voltage drop, and cable gland selection."
  },
  "motor-control": {
    slug: "motor-control",
    title: "Motor Control Tools",
    deck: "Motor current and starter selection",
    description: "Tools for estimating motor full-load current and starter protection needs."
  },
  "ev-charging": {
    slug: "ev-charging",
    title: "EV Charging Tools",
    deck: "EV charger load planning",
    description: "Calculators for EV charging current, simultaneity, and distribution planning."
  },
  "power-conversion": {
    slug: "power-conversion",
    title: "Power Conversion Tools",
    deck: "kW, kVA, amps, and phase conversions",
    description: "Quick electrical conversion calculators for low-voltage engineering work."
  },
  "panel-design": {
    slug: "panel-design",
    title: "Panel Design Tools",
    deck: "Busbar and enclosure planning",
    description: "Reference tools for panel builders and low-voltage cabinet design tasks."
  }
};
