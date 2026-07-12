import { expansionTools } from "./expansionTools";
import type { SeoGuide } from "./seoGuides";

export const expansionSeoGuides = Object.fromEntries(expansionTools.map((tool) => [tool.slug, {
  sections: [
    {
      title: `How to use the ${tool.title}`,
      paragraphs: [tool.slug === "ohms-law-calculator"
        ? "Voltage, current, resistance, and power are shown together. Select any two quantities as known inputs and enter their values in the units shown; the other two values update immediately in the result panel."
        : tool.slug === "watts-amps-volts-calculator"
          ? "Power, current, and voltage are shown together. Select the electrical system, choose any two quantities as known inputs, and enter their values; the remaining quantity updates immediately in the result panel."
        : `${tool.description} Start by choosing the operating mode, then enter values from nameplates, measurements, or project documents in the units shown. The result updates immediately and keeps intermediate quantities visible for review.`],
      steps: tool.slug === "ohms-law-calculator"
        ? ["Select two known quantities from V, I, R, and P.", "Enter both known values.", "Read the two calculated values in the result panel.", "Check all four quantities against component ratings."]
        : tool.slug === "watts-amps-volts-calculator"
          ? ["Choose DC, single-phase AC, or three-phase AC.", "Select two known quantities from P, I, and V.", "Enter the known values and AC power factor where applicable.", "Read the calculated third quantity in the result panel."]
        : ["Confirm the system and calculation mode.", "Enter measured or manufacturer-rated values.", "Review the primary result and intermediate metrics.", "Continue with the related protection or equipment-selection checks."]
    },
    {
      title: `${tool.shortTitle ?? tool.title} formula and method`,
      paragraphs: [`The calculator uses this transparent relationship: ${tool.formula} Inputs are validated before calculation so zero, negative, incompatible, or physically impossible combinations are flagged instead of silently producing a misleading number.`],
      callouts: [tool.formula]
    },
    {
      title: "How to interpret the result",
      paragraphs: [`Use the main result as a starting value and read every supporting metric. ${tool.assumptions.join(" ")} A passing or recommended result means the entered mathematical conditions are satisfied; it does not certify the complete installation or a particular product combination.`],
      bullets: tool.assumptions
    },
    {
      title: "Selection limits and next checks",
      paragraphs: [`${tool.warnings.join(" ")} Compare the output with the current applicable standard, local rules, exact VIOX product datasheet, environmental conditions, protection coordination, and the engineer's project requirements before procurement or installation.`],
      links: tool.relatedTools.slice(0, 3).map((slug) => ({ label: `Continue with ${slug.replace(/-/g, " ")}`, href: `/${slug}/` }))
    }
  ]
} satisfies SeoGuide])) as Record<string, SeoGuide>;
