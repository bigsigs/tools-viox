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
      title: "Calculation method and validation",
      paragraphs: ["The equations and symbol definitions above show the complete calculation basis. Inputs are checked before calculation so zero, negative, incompatible, or physically impossible combinations are flagged instead of silently producing a misleading result."]
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

expansionSeoGuides["pcb-conductor-spacing-calculator"] = {
  sections: [
    {
      title: "How to use the PCB conductor spacing calculator",
      paragraphs: ["Choose whether to calculate minimum spacing from voltage or reverse an available edge-to-edge spacing into a reference voltage. Select the conductor environment carefully because an internal trace, an exposed external trace, a polymer-coated conductor, and a component lead use different lookup columns."],
      steps: ["Choose voltage-to-spacing or spacing-to-voltage mode.", "Enter DC, AC peak, or AC RMS voltage between adjacent conductors.", "Select the PCB or assembly conductor environment.", "Enter a fabrication and design margin.", "Review both millimetres and mils, then verify the current IPC edition and applicable product standard."]
    },
    {
      title: "IPC PCB conductor categories",
      paragraphs: ["The construction category is part of the calculation, not a cosmetic label. Coated categories should only be used when the material and completed process meet the required construction definition."],
      table: {
        headers: ["Category", "Conductor condition", "Typical interpretation"],
        rows: [["B1", "Internal conductors", "Copper features separated within the PCB dielectric"], ["B2", "External, uncoated, up to 3050 m", "Exposed outer-layer conductors at normal and moderate altitude"], ["B3", "External, uncoated, above 3050 m", "Exposed outer-layer conductors at higher altitude"], ["B4", "Permanent polymer coating", "External PCB conductor with qualifying permanent polymer coating"], ["A5", "Conformal-coated assembly", "External conductor on the completed coated assembly"], ["A6", "Component lead, uncoated", "Exposed component lead or termination"], ["A7", "Component lead, conformal coated", "Coated component lead or termination"]]
      }
    },
    {
      title: "Voltage basis: DC, AC peak, and AC RMS",
      paragraphs: ["The legacy IPC spacing table is indexed by DC voltage or AC peak voltage between conductors. When only a sinusoidal AC RMS value is known, the calculator uses Vpeak = √2 × Vrms. For example, 230 V RMS corresponds to approximately 325 V peak and therefore falls in the 301–500 V lookup band."],
      callouts: ["230 V AC RMS → approximately 325 V peak", "400 V AC RMS → approximately 566 V peak", "Use the maximum repetitive or applicable transient voltage required by the governing design method"]
    },
    {
      title: "Spacing above 500 volts",
      paragraphs: ["For voltage above 500 V, the legacy method adds a category-specific distance for every volt above 500 V. The calculator shows the table value before margin and the final design spacing separately so the source of the result remains visible."],
      table: {
        headers: ["Category", "Spacing at 500 V", "Additional spacing above 500 V"],
        rows: [["B1", "0.25 mm", "0.0025 mm/V"], ["B2", "2.50 mm", "0.0050 mm/V"], ["B3", "12.50 mm", "0.0250 mm/V"], ["B4", "0.80 mm", "0.00305 mm/V"], ["A5", "0.80 mm", "0.00305 mm/V"], ["A6", "1.50 mm", "0.00305 mm/V"], ["A7", "0.80 mm", "0.00305 mm/V"]]
      }
    },
    {
      title: "PCB spacing versus clearance and creepage",
      paragraphs: ["PCB conductor spacing is a layout and manufacturability reference. Safety clearance is the shortest path through air, while creepage is the shortest path along an insulating surface. Equipment standards may also require pollution degree, material group, overvoltage category, altitude correction, reinforced insulation, slots, barriers, or dielectric testing."],
      links: [{ label: "Use the IEC 60664-1 Clearance & Creepage Calculator", href: "/clearance-creepage-calculator/" }]
    },
    {
      title: "PCB layout and manufacturing checks",
      paragraphs: ["The number produced by a spacing calculator is not automatically the CAD rule to release. Add the board fabricator's conductor-position and etching tolerances, then inspect pads, vias, component leads, test points, board edges, slots, mounting hardware, and coating keep-out areas."],
      bullets: ["Measure spacing between conductor edges, not centre lines.", "Use net classes and design-rule checks for every relevant voltage domain.", "Do not assume ordinary solder mask is certified safety insulation.", "Review humidity, contamination, condensation, altitude, and coating process capability.", "Apply the product-specific IEC, UL, or other safety standard when isolation protects users or accessible circuits."]
    }
  ]
};

expansionSeoGuides["nema-ip-rating-converter"] = {
  sections: [
    { title: "How to use the NEMA and IP rating tool", paragraphs: ["Use NEMA to IP when a verified NEMA enclosure Type is already specified. Use IP to NEMA to find common NEMA Types whose published ingress cross-reference matches or exceeds the selected IP digits; this does not establish equivalence. Use Industrial Sizing Engine to evaluate the environmental characteristics that IP does not express."], steps: ["Choose one of the three modes.", "Enter the known rating or environmental exposures.", "Read the ingress reference and equivalence warning together.", "Use Industrial Sizing for corrosion, icing, oil and site conditions.", "Verify the complete assembled product under the required certification system."] },
    { title: "NEMA to IP rating chart", paragraphs: ["The chart is a practical ingress cross-reference, not a statement that the two classifications are equivalent. In IP to NEMA mode, matching rows are only common ingress references; final NEMA Type selection requires all additional NEMA conditions and certification."], table: { headers: ["NEMA Type", "IP cross-reference", "Typical protection emphasis"], rows: [["NEMA 1", "IP20", "Indoor contact and falling dirt"], ["NEMA 2", "IP22", "Indoor dripping water"], ["NEMA 3 / NEMA 3X", "IP55", "Outdoor weather and windblown dust; X adds corrosion resistance"], ["NEMA 3R / NEMA 3RX", "IP24", "Outdoor rain and sleet; X adds corrosion resistance"], ["NEMA 3S / NEMA 3SX", "IP55", "Type 3 duties plus ice-laden external mechanism operation; X adds corrosion resistance"], ["NEMA 4", "IP66", "Indoor/outdoor dust and hose-directed water"], ["NEMA 4X", "IP66", "Type 4 duties plus corrosion resistance"], ["NEMA 5", "IP53", "Indoor settling airborne dust"], ["NEMA 6", "IP67", "Temporary submersion"], ["NEMA 6P", "IP68", "Prolonged submersion under specified conditions"], ["NEMA 12 / NEMA 12K", "IP54", "Indoor dust and dripping non-corrosive liquids"], ["NEMA 13", "IP54", "Indoor dust, spraying water, oil and coolant"]] } },
    { title: "IEC 60529 first digit: solids and access", paragraphs: ["The first characteristic numeral describes protection of persons against access to hazardous parts and protection against solid foreign objects. It does not describe corrosion, UV exposure, chemical compatibility, impact, or enclosure material."], table: { headers: ["Digit", "Solid-object / access meaning"], rows: [["0", "No rated protection"], ["1", "Objects 50 mm and larger"], ["2", "Objects 12.5 mm and larger; finger access protection"], ["3", "Objects 2.5 mm and larger"], ["4", "Objects 1.0 mm and larger"], ["5", "Dust protected; limited ingress may occur without harmful deposits"], ["6", "Dust-tight"]] } },
    { title: "IEC 60529 second digit: water", paragraphs: ["The second characteristic numeral describes water exposure under defined tests. IPX8 conditions are specified by agreement or the manufacturer and are not one universal depth or duration."], table: { headers: ["Digit", "Water protection"], rows: [["0", "No rated protection"], ["1", "Vertical dripping water"], ["2", "Dripping water with enclosure tilted up to 15 degrees"], ["3", "Spraying water"], ["4", "Splashing water"], ["5", "Water jets"], ["6", "Powerful water jets"], ["7", "Temporary immersion"], ["8", "Continuous immersion under specified conditions"], ["9", "High-pressure and high-temperature water jets"]] } },
    { title: "Why IP cannot be converted directly to NEMA", paragraphs: ["IEC IP digits focus on access, solid objects, and water ingress. NEMA Types can also address corrosion resistance, external icing, oil and coolant, construction details, and ready-for-use assembly conditions. Therefore an IP66 enclosure is not automatically Type 4 or Type 4X."], table: { headers: ["Capability", "IP66", "NEMA 4", "NEMA 4X"], rows: [["Dust ingress", "Covered", "Covered", "Covered"], ["Hose-directed water", "Ingress test basis", "Covered", "Covered"], ["Corrosion resistance", "Not expressed", "Not the 4X requirement", "Covered"], ["External icing", "Not expressed", "Considered by Type", "Considered by Type"], ["Oil / coolant", "Not expressed", "Not the defining duty", "Not the defining duty"], ["Equivalent certification", "No", "No", "No"]] } },
    { title: "Industrial enclosure sizing workflow", paragraphs: ["Location and water exposure establish the basic enclosure family. Dust can move an outdoor selection from Type 3R toward Type 3. Corrosion can require the X variant. Ice-laden mechanism operation can require Type 3S or 3SX. Indoor oil or coolant exposure can point toward Type 12 or 13."], bullets: ["Coastal and marine sites need material and hardware compatibility, not merely an X suffix assumption.", "Conductive dust may require heating, ventilation, purge, hazardous-location, or process-specific engineering beyond ingress rating.", "High-pressure wash requires verification of the exact test standard, temperature, pressure, distance, and product marking.", "Hazardous areas require separate certified protection for the exact gas or dust group and temperature class."] },
    { title: "Maintaining the enclosure rating after installation", paragraphs: ["The selected rating applies to the complete assembly. Cable entries, hinges, doors, windows, operators, fans, filters, drains, breathers, mounting holes, conduit fittings, and unused openings can reduce protection if they are not correctly rated and installed."], bullets: ["Use glands and fittings with a compatible rating and cable diameter range.", "Follow gasket compression, torque, mounting, and orientation instructions.", "Review condensation control rather than assuming a higher IP number prevents internal moisture.", "Verify UV, temperature, impact, fire behavior, EMC, and chemical resistance separately."] },
    { title: "NEMA and IP selection examples", paragraphs: ["A clean indoor control panel may begin with Type 1. An indoor machining area with dripping oil may point toward Type 12, while spraying coolant may point toward Type 13. Outdoor rain without windblown dust may point toward Type 3R. A corrosive food-processing washdown area may begin with Type 4X, subject to exact chemical and sanitation requirements."], callouts: ["IP66 does not automatically mean NEMA 4X", "NEMA Type 3R cross-reference is not the same as Type 3", "IPX8 depth and duration must be confirmed"] }
  ]
};
