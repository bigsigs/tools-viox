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
        : tool.slug === "electrical-unit-converter"
          ? "Choose Power, Energy, or Phase current. Power and Energy support conversion in either direction with category-specific units and a swap control; Phase current uses only the system, power, voltage, and power factor needed for the selected current formula."
        : tool.slug === "lighting-calculator"
          ? "Choose the space or task to load a broad starting illuminance value, or enter custom lux from the applicable project requirement. Add the room dimensions, utilization and maintenance factors, and the exact fixture lumen and watt ratings. The result connects the lighting requirement to fixture quantity and electrical circuit load."
        : tool.slug === "stationary-battery-sizing-calculator"
          ? "Choose a constant-load estimate or a duty-cycle screen. Define the DC voltage window and cell voltage first, then enter the load periods and explicit capacity factors. The result keeps energy capacity, peak-current capability, series cell count, parallel strings, charger recovery current, and DC protection reference separate."
        : tool.slug === "residential-electrical-load-calculator"
          ? "Choose the NEC 2023 optional-method screening workflow or general residential planning. Keep calculated demand separate from connected load, enter the larger applicable heating or cooling contribution, and add EV charging using the factor accepted for the project. The result compares calculated service current with the entered service rating."
        : tool.slug === "nema-ip-rating-converter"
          ? "Choose environment selection, NEMA-to-IP cross-reference, or IP decoding. Environment selection screens location, water, dust, corrosion, oil or coolant, and external ice. Cross-reference mode states the one-way minimum IP ingress comparison, while IP decoding explains both digits without claiming an equivalent NEMA Type."
        : `${tool.description} Start by choosing the operating mode, then enter values from nameplates, measurements, or project documents in the units shown. The result updates immediately and keeps intermediate quantities visible for review.`],
      steps: tool.slug === "ohms-law-calculator"
        ? ["Select two known quantities from V, I, R, and P.", "Enter both known values.", "Read the two calculated values in the result panel.", "Check all four quantities against component ratings."]
        : tool.slug === "watts-amps-volts-calculator"
          ? ["Choose DC, single-phase AC, or three-phase AC.", "Select two known quantities from P, I, and V.", "Enter the known values and AC power factor where applicable.", "Read the calculated third quantity in the result panel."]
        : tool.slug === "electrical-unit-converter"
          ? ["Choose Power, Energy, or Phase current.", "For a unit conversion, select two compatible units and type into either value field.", "Use the swap button to reverse the unit direction.", "For phase current, choose the supply system and enter active power, voltage, and AC power factor."]
        : tool.slug === "lighting-calculator"
          ? ["Choose a space preset or custom maintained illuminance.", "Enter room dimensions or illuminated area.", "Enter utilization and maintenance factors from project data.", "Enter rated lumens, watts, voltage, and power factor for one fixture.", "Review fixture quantity, achieved lux, connected load, current, and preliminary circuit count."]
        : tool.slug === "stationary-battery-sizing-calculator"
          ? ["Choose constant-load or duty-cycle screening.", "Enter nominal and minimum DC voltage plus cell end voltage.", "Enter continuous and additional load periods.", "Apply manufacturer or project temperature, aging, usable-capacity, and margin factors.", "Check corrected Ah, peak C-rate, strings, charger current, and DC protection reference against manufacturer data."]
        : tool.slug === "residential-electrical-load-calculator"
          ? ["Choose NEC optional-method screening or user-factor planning.", "Enter dwelling or connected-load information.", "Enter project-calculated range, dryer, HVAC, and EVSE contributions.", "Review demand kVA and service current.", "Compare with the existing service and complete conductor, panel, protection, and authority checks."]
        : tool.slug === "nema-ip-rating-converter"
          ? ["Choose environment, NEMA-to-IP, or IP decode mode.", "For environment mode, identify every relevant exposure.", "Read the starting NEMA Type and one-way IP reference separately.", "For an IP code, review solids and water protection independently.", "Verify the complete installed enclosure and certification against the required standard."]
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

expansionSeoGuides["nema-ip-rating-converter"] = {
  sections: [
    { title: "How to use the NEMA and IP rating tool", paragraphs: ["Use NEMA to IP when a verified NEMA enclosure Type is already specified. Use IP to NEMA only to decode an IEC 60529 IP code and understand why no NEMA Type can be derived from it. Use Industrial Sizing Engine for a separate environment-based NEMA screening when the installation conditions are known."], steps: ["Choose one of the three modes.", "Enter the known rating or environmental exposures.", "Read the primary rating and ingress cross-reference separately.", "Never reverse the NEMA-to-IP table.", "Verify the complete assembled product under the required certification system."] },
    { title: "NEMA to IP rating chart", paragraphs: ["The chart is a practical minimum ingress cross-reference, not a statement that the two classifications are equivalent. NEMA publishes the authoritative correlation and expressly limits its use to the NEMA-to-IP direction."], table: { headers: ["NEMA Type", "IP cross-reference", "Typical protection emphasis"], rows: [["1", "IP20", "Indoor contact and falling dirt"], ["2", "IP22", "Indoor dripping water"], ["3 / 3X", "IP55", "Outdoor weather and windblown dust; X adds corrosion resistance"], ["3R / 3RX", "IP24", "Outdoor rain and sleet; X adds corrosion resistance"], ["3S / 3SX", "IP55", "Type 3 duties plus ice-laden external mechanism operation; X adds corrosion resistance"], ["4", "IP66", "Indoor/outdoor dust and hose-directed water"], ["4X", "IP66", "Type 4 duties plus corrosion resistance"], ["5", "IP53", "Indoor settling airborne dust"], ["6", "IP67", "Temporary submersion"], ["6P", "IP68", "Prolonged submersion under specified conditions"], ["12 / 12K", "IP54", "Indoor dust and dripping non-corrosive liquids"], ["13", "IP54", "Indoor dust, spraying water, oil and coolant"]] } },
    { title: "IEC 60529 first digit: solids and access", paragraphs: ["The first characteristic numeral describes protection of persons against access to hazardous parts and protection against solid foreign objects. It does not describe corrosion, UV exposure, chemical compatibility, impact, or enclosure material."], table: { headers: ["Digit", "Solid-object / access meaning"], rows: [["0", "No rated protection"], ["1", "Objects 50 mm and larger"], ["2", "Objects 12.5 mm and larger; finger access protection"], ["3", "Objects 2.5 mm and larger"], ["4", "Objects 1.0 mm and larger"], ["5", "Dust protected; limited ingress may occur without harmful deposits"], ["6", "Dust-tight"]] } },
    { title: "IEC 60529 second digit: water", paragraphs: ["The second characteristic numeral describes water exposure under defined tests. IPX8 conditions are specified by agreement or the manufacturer and are not one universal depth or duration."], table: { headers: ["Digit", "Water protection"], rows: [["0", "No rated protection"], ["1", "Vertical dripping water"], ["2", "Dripping water with enclosure tilted up to 15 degrees"], ["3", "Spraying water"], ["4", "Splashing water"], ["5", "Water jets"], ["6", "Powerful water jets"], ["7", "Temporary immersion"], ["8", "Continuous immersion under specified conditions"], ["9", "High-pressure and high-temperature water jets"]] } },
    { title: "Why IP cannot be converted directly to NEMA", paragraphs: ["IEC IP digits focus on access, solid objects, and water ingress. NEMA Types can also address corrosion resistance, external icing, oil and coolant, construction details, and ready-for-use assembly conditions. Therefore an IP66 enclosure is not automatically Type 4 or Type 4X."], table: { headers: ["Capability", "IP66", "NEMA 4", "NEMA 4X"], rows: [["Dust ingress", "Covered", "Covered", "Covered"], ["Hose-directed water", "Ingress test basis", "Covered", "Covered"], ["Corrosion resistance", "Not expressed", "Not the 4X requirement", "Covered"], ["External icing", "Not expressed", "Considered by Type", "Considered by Type"], ["Oil / coolant", "Not expressed", "Not the defining duty", "Not the defining duty"], ["Equivalent certification", "No", "No", "No"]] } },
    { title: "Industrial enclosure sizing workflow", paragraphs: ["Location and water exposure establish the basic enclosure family. Dust can move an outdoor selection from Type 3R toward Type 3. Corrosion can require the X variant. Ice-laden mechanism operation can require Type 3S or 3SX. Indoor oil or coolant exposure can point toward Type 12 or 13."], bullets: ["Coastal and marine sites need material and hardware compatibility, not merely an X suffix assumption.", "Conductive dust may require heating, ventilation, purge, hazardous-location, or process-specific engineering beyond ingress rating.", "High-pressure wash requires verification of the exact test standard, temperature, pressure, distance, and product marking.", "Hazardous areas require separate certified protection for the exact gas or dust group and temperature class."] },
    { title: "Maintaining the enclosure rating after installation", paragraphs: ["The selected rating applies to the complete assembly. Cable entries, hinges, doors, windows, operators, fans, filters, drains, breathers, mounting holes, conduit fittings, and unused openings can reduce protection if they are not correctly rated and installed."], bullets: ["Use glands and fittings with a compatible rating and cable diameter range.", "Follow gasket compression, torque, mounting, and orientation instructions.", "Review condensation control rather than assuming a higher IP number prevents internal moisture.", "Verify UV, temperature, impact, fire behavior, EMC, and chemical resistance separately."] },
    { title: "NEMA and IP selection examples", paragraphs: ["A clean indoor control panel may begin with Type 1. An indoor machining area with dripping oil may point toward Type 12, while spraying coolant may point toward Type 13. Outdoor rain without windblown dust may point toward Type 3R. A corrosive food-processing washdown area may begin with Type 4X, subject to exact chemical and sanitation requirements."], callouts: ["IP66 does not automatically mean NEMA 4X", "NEMA Type 3R cross-reference is not the same as Type 3", "IPX8 depth and duration must be confirmed"] }
  ]
};
