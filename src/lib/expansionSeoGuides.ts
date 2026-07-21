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

expansionSeoGuides["solid-state-relay-calculator"] = {
  sections: [
    {
      title: "How to use the solid state relay calculator",
      paragraphs: ["Choose the workflow that matches the information available. Select an SSR converts load power or current into an electrical rating screen. Size a heatsink calculates conduction loss and the required thermal path. Check an existing SSR compares one candidate with current, voltage, surge, I²t, fuse, leakage, and minimum-load data entered from its datasheet."],
      steps: ["Choose SSR selection, heatsink sizing, or existing SSR verification.", "Identify AC or DC output and the real load type.", "Use measured load and inrush current whenever available.", "Enter worst-case datasheet values rather than typical values.", "Review every thermal and protection metric, not only the primary result.", "Verify the result against the exact VIOX or manufacturer datasheet before ordering."]
    },
    {
      title: "AC SSR, DC SSR, and load compatibility",
      paragraphs: ["An AC-output SSR commonly uses a TRIAC or antiparallel thyristors and depends on AC current passing through zero to turn off. A DC-output SSR commonly uses a transistor or MOSFET. The output technology must match the load circuit; an ordinary AC TRIAC SSR is not a substitute for a DC-output SSR."],
      table: { headers: ["Application", "Starting output choice", "Switching consideration"], rows: [["Resistive heater", "AC TRIAC/SCR SSR", "Zero-cross is commonly preferred for simple on/off temperature control"], ["DC heater or valve", "DC MOSFET/transistor SSR", "Check polarity, RDS(on), and inductive suppression"], ["Motor or compressor", "Motor-rated AC or DC SSR", "Starting current, cycling, stall, phase loss, and bypass may govern"], ["Transformer", "Transformer-load-rated SSR", "Asymmetric magnetizing inrush and turn-on point require special review"], ["Incandescent or infrared lamp", "Load-compatible SSR", "Cold-filament inrush can greatly exceed steady current"], ["LED driver or capacitive input", "Load-compatible SSR", "Short charging pulses, minimum load, and leakage can govern"]] }
    },
    {
      title: "SSR current rating and temperature derating",
      paragraphs: ["The current printed on an SSR is conditional. Allowable continuous current depends on ambient or case temperature, heatsink, mounting orientation, spacing, airflow, thermal interface, and load category. The calculator therefore asks for an allowed datasheet current utilization instead of applying a universal two-times or six-times multiplier."],
      callouts: ["Use the allowable-current curve at the real ambient temperature", "Headline current is not automatically the installed current", "Adjacent SSRs and enclosed panels can require additional derating"]
    },
    {
      title: "SSR power loss and heatsink calculation",
      paragraphs: ["For an AC TRIAC or SCR output, a first thermal estimate uses on-state voltage multiplied by RMS load current. For a DC MOSFET output, conduction loss is current squared multiplied by maximum on resistance at operating temperature. The junction-to-case, interface, and heatsink thermal resistances then consume the available temperature rise from local air to maximum junction temperature."],
      table: { headers: ["Thermal term", "Meaning", "Selection note"], rows: [["RθJC", "Junction to SSR case", "Use the exact datasheet maximum"], ["RθCS", "Case through pad or compound to heatsink", "Depends on interface material, flatness, pressure, and mounting"], ["RθSA", "Heatsink to surrounding air", "Depends on heatsink, orientation, airflow, altitude, and enclosure"], ["TJ,max", "Maximum permitted semiconductor junction temperature", "A design target may need margin below absolute maximum"], ["TA", "Air immediately around the heatsink", "Use internal panel temperature when mounted in an enclosure"]] }
    },
    {
      title: "SSR surge current and I²t verification",
      paragraphs: ["Motors, transformers, lamps, solenoids, and capacitive power supplies can have inrush far above continuous current. Compare the actual peak and duration with the SSR's non-repetitive and repetitive surge curves. I²t values are comparable only when waveform, duration, line frequency, repetition, and initial junction temperature use the same basis."],
      bullets: ["Use measured inrush or load-manufacturer data when possible.", "Do not treat a one-cycle surge rating as a repetitive cycling rating.", "A rectangular I²t estimate is not identical to a half-sine datasheet test.", "Check commutating dv/dt and transient-voltage suppression for inductive loads.", "Verify the permitted switching frequency and thermal cycling duty."]
    },
    {
      title: "Semiconductor fuse and short-circuit coordination",
      paragraphs: ["An upstream breaker or general-purpose fuse may protect wiring without protecting an SSR semiconductor junction. The fuse total-clearing I²t must be coordinated with the SSR withstand using the manufacturer's approved table, voltage, prospective fault current, and safety margin. A simple fuse-I²t-below-SSR-I²t comparison is only an early screen."],
      links: [{ label: "Continue with the fuse sizing calculator", href: "/fuse-sizing-calculator/" }]
    },
    {
      title: "Off-state leakage, minimum load, and safe isolation",
      paragraphs: ["An SSR is not an open mechanical contact. Off-state leakage can cause LED lamps to glow, sensitive loads to move or remain energized, and hazardous voltage to appear at the output. Many AC SSRs also require a minimum holding or load current. Most SSR failures are short-circuit failures, so the control system must define a safe response and provide mechanical isolation where required."],
      bullets: ["Do not use an SSR as the sole maintenance disconnect.", "Check leakage at maximum load voltage and temperature.", "Confirm the smallest connected load exceeds the specified minimum current.", "Use manufacturer-approved snubbers or bleeders when needed.", "Design diagnostics and shutdown behavior for a shorted SSR output."]
    },
    {
      title: "Control panel thermal workflow",
      paragraphs: ["The SSR heatsink result supplies the heat released into the cabinet. Add that value to breakers, power supplies, drives, transformers, and other losses, then check enclosure temperature and cooling. The heatsink air temperature may be substantially higher than the room temperature."],
      links: [{ label: "Add SSR loss to panel heat", href: "/panel-heat-loss-calculator/" }, { label: "Calculate enclosure cooling", href: "/enclosure-temperature-rise-calculator/" }, { label: "Compare mechanical contactor sizing", href: "/contactor-selection-calculator/" }]
    }
  ]
};

expansionSeoGuides["enclosure-temperature-rise-calculator"] = {
  sections: [
    {
      title: "How to use the enclosure cooling calculator",
      paragraphs: ["Choose the result you need first: estimated internal temperature, required delivered airflow, or active cooling capacity. Enter enclosure dimensions, exposed surfaces, material, component heat loss, and the worst expected ambient condition. Outdoor projects can add a separately established solar heat allowance."],
      steps: ["Choose Internal temperature, Required airflow, or Cooling capacity.", "Enter cabinet dimensions and select which surfaces are exposed to ambient air.", "Enter component losses as heat, not total connected load.", "Set maximum ambient and the permitted internal target temperature.", "Choose the air condition and whether open-loop airflow is allowed.", "Review the heat balance, cooling method screen, and every selection warning."]
    },
    {
      title: "Enclosure heat-balance method",
      paragraphs: ["The steady-state model adds component heat and the entered solar allowance, then accounts for heat transfer through exposed enclosure surfaces. When the cabinet is hotter than ambient, the wall rejects heat and reduces the active cooling load. When ambient is hotter than the target, heat enters through the wall and increases the required cooling capacity."],
      table: { headers: ["Quantity", "Calculation role", "Important input rule"], rows: [["Internal heat", "Breaker, contactor, drive, power-supply, transformer, and other losses", "Use manufacturer loss data at the expected operating point"], ["Wall heat transfer", "Effective U-value × exposed area × temperature difference", "Exclude surfaces blocked by a wall or adjacent cabinets"], ["Solar allowance", "Additional outdoor heat entering the enclosure", "Use a project-derived value; do not assume zero in direct sun"], ["Airflow heat removal", "Approximately 0.33 × delivered m³/h × temperature rise", "Use airflow after filter and pressure losses"], ["Design margin", "Added to required airflow or cooling capacity", "It does not replace accurate heat-loss inputs"]] }
    },
    {
      title: "Natural cooling, fan, heat exchanger, or air conditioner",
      paragraphs: ["Natural cooling can be adequate when exposed wall area can reject the generated heat at the permitted internal temperature. A filter fan is an open-loop option for clean air when the target remains above ambient. Closed-loop heat exchangers preserve separation from dirty or wet ambient air but also require a positive temperature difference. An enclosure air conditioner or another refrigeration system is required when the target is at or below ambient."],
      table: { headers: ["Cooling approach", "Best starting condition", "Key limitation"], rows: [["Natural convection", "Low heat load and useful exposed area", "Average temperature can hide internal hot spots"], ["Filtered fan", "Clean ambient and target above ambient", "Cannot cool below ambient; delivered airflow falls as filters load"], ["Closed-loop heat exchanger", "Sealed cabinet and target above ambient", "Capacity is governed by W/K and available temperature difference"], ["Enclosure air conditioner", "Target at or below ambient, or high heat load", "Use capacity at actual ambient/internal temperatures, not nominal rating alone"], ["Certified hazardous cooling", "Classified gas or dust location", "Ingress protection alone is not hazardous-location certification"]] }
    },
    {
      title: "Fan airflow in CFM and cubic metres per hour",
      paragraphs: ["The airflow result is the delivered airflow needed through the enclosure. A fan's free-air catalog rating is normally higher than its operating airflow because filters, grilles, louvers, ducts, altitude, and contamination add resistance. Use the manufacturer's pressure-flow curve and include the exhaust path when selecting the fan and filter combination."],
      callouts: ["1 CFM ≈ 1.699 m³/h", "Ventilation requires target temperature above ambient", "Select from the pressure-flow curve, not free-air CFM alone"]
    },
    {
      title: "Worked enclosure cooling example",
      paragraphs: ["Consider an 800 × 1200 × 300 mm painted-steel wall-mounted enclosure with 250 W of internal loss, 35°C maximum ambient, and a 45°C target. The simplified exposed area is 2.16 m² and the wall can reject about 118.8 W at the 10°C temperature difference. After a 15% design margin, the remaining heat requires approximately 45.7 m³/h, or 26.9 CFM, of delivered airflow."],
      bullets: ["Internal component heat: 250 W", "Passive wall heat rejection at target: approximately 118.8 W", "Net load before margin: approximately 131.2 W", "Required delivered airflow with 15% margin: approximately 45.7 m³/h or 26.9 CFM"]
    },
    {
      title: "Thermal design limits and final checks",
      paragraphs: ["This calculator estimates average steady-state behavior. It is not a full IEC 60890 verification, computational fluid-dynamics study, or substitute for the exact cooling-equipment selection software. Component spacing, internal circulation, hot spots, transient duty, humidity, condensation, altitude, filter loading, direct sun, surface finish, and component derating can govern the real design."],
      bullets: ["Use the lowest relevant component temperature limit after derating.", "Confirm outdoor solar load, shade, color, and orientation for the installation.", "Check condensation risk when active cooling can take surfaces below dew point.", "Preserve the required NEMA or IP rating at fans, filters, drains, glands, and doors.", "Verify cooler capacity and electrical data from the exact manufacturer performance table."],
      links: [{ label: "Build the internal heat load", href: "/panel-heat-loss-calculator/" }, { label: "Check enclosure NEMA and IP requirements", href: "/nema-ip-rating-converter/" }, { label: "Review VFD sizing and panel heat", href: "/vfd-sizing-protection-calculator/" }]
    }
  ]
};

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
