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

expansionSeoGuides["kw-to-hp-calculator"] = {
  sections: [
    {
      title: "How to convert kW to HP or HP to kW",
      paragraphs: ["Choose the conversion direction, enter the known power, and select the horsepower definition used by the source. Mechanical horsepower is the normal default for motors and industrial equipment unless the nameplate or document explicitly uses metric PS, CV, or electrical hp(E)."],
      steps: ["Choose kW to HP or HP to kW.", "Enter the known power value.", "Select mechanical, metric, or electrical horsepower.", "Read the main result and compare the other horsepower definitions.", "For motor current, continue with voltage, phase, efficiency, and power factor."]
    },
    {
      title: "kW to mechanical horsepower formula",
      paragraphs: ["Mechanical horsepower is based on 550 foot-pounds per second and equals exactly 745.69987158227022 watts. Because one kilowatt is 1000 watts, divide kW by 0.7456998716 to obtain mechanical horsepower. To convert mechanical horsepower back to kilowatts, multiply by the same factor."],
      callouts: ["1 kW = 1.34102209 mechanical hp", "1 mechanical hp = 0.7456998716 kW", "10 kW = 13.4102 mechanical hp"]
    },
    {
      title: "Mechanical hp, metric PS, and electrical hp",
      paragraphs: ["Horsepower is not one universal unit. Mechanical horsepower is common on US and international motor references. Metric horsepower is commonly marked PS, CV, pk, or ch depending on language and market. Electrical horsepower is defined as 746 watts and should only be selected when the source explicitly uses that definition."],
      table: { headers: ["Horsepower definition", "Watts per hp", "Kilowatts per hp", "1 kW equals"], rows: [["Mechanical hp", "745.6998716 W", "0.7456998716 kW", "1.341022 hp"], ["Metric PS / CV", "735.49875 W", "0.73549875 kW", "1.359622 PS"], ["Electrical hp(E)", "746 W", "0.746 kW", "1.340483 hp(E)"]] }
    },
    {
      title: "kW to HP conversion chart",
      paragraphs: ["The following reference values use mechanical horsepower. The calculator should be used when another horsepower definition or more precision is required."],
      table: { headers: ["Kilowatts", "Mechanical horsepower"], rows: [["1 kW", "1.341 hp"], ["2.2 kW", "2.950 hp"], ["5.5 kW", "7.376 hp"], ["7.5 kW", "10.058 hp"], ["11 kW", "14.751 hp"], ["15 kW", "20.115 hp"], ["18.5 kW", "24.808 hp"], ["22 kW", "29.503 hp"], ["30 kW", "40.231 hp"], ["37 kW", "49.617 hp"], ["45 kW", "60.346 hp"], ["55 kW", "73.756 hp"], ["75 kW", "100.577 hp"], ["90 kW", "120.692 hp"], ["110 kW", "147.512 hp"]] }
    },
    {
      title: "Motor kW, horsepower, efficiency, and current",
      paragraphs: ["A motor nameplate power in kW or hp usually identifies rated mechanical shaft output. It is not the same as electrical input power. Input kW is shaft-output kW divided by efficiency, while AC current also depends on supply voltage, phase arrangement, and power factor. A unit conversion alone cannot size a circuit breaker, contactor, cable, overload relay, or VFD."],
      bullets: ["Use the motor nameplate current when available.", "Do not apply efficiency twice when the entered kW is already electrical input.", "Service factor and overload capability do not change the unit conversion.", "Equipment selection must use the exact manufacturer rating table and operating duty."],
      links: [{ label: "Calculate motor current from kW or hp", href: "/motor-current-calculator/" }, { label: "Convert motor power and speed to torque", href: "/motor-torque-calculator/" }, { label: "Convert kW, kVA, and amps", href: "/kw-kva-amp-calculator/" }]
    }
  ]
};

expansionSeoGuides["afdd-selection-calculator"] = {
  sections: [
    { title: "How to use the AFDD selection calculator", paragraphs: ["Choose the project rules basis, premises, and circuit type, then enter the circuit voltage, design current, candidate rating, characteristic, residual sensitivity, and prospective short-circuit current. Read the local-rules status separately from the product-envelope check."], steps: ["Confirm whether the project is governed by IEC/EN, UK, EU, or another local adoption.", "Enter the circuit design current and fault level.", "Choose the required B or C characteristic and Type A sensitivity.", "Review every pass/fail line rather than relying only on the model-family result."] },
    { title: "What an AFDD protects against", paragraphs: ["An AFDD detects current signatures associated with hazardous arc faults. An integrated AFDD-RCBO can also provide residual-current, overload, and short-circuit functions, but each function retains its own marked rating and standard."], bullets: ["Series arc current may remain below a conventional breaker magnetic threshold.", "An RCD detects residual current but is not a general series-arc detector.", "AFDD application rules vary by jurisdiction, premises, circuit, and adopted standard edition."] },
    { title: "VIOX AFDD configuration screen", paragraphs: ["The product screen uses the published VAF1-40 and VAF3-40M envelope: 240 V AC, 1P+N, 6-40 A, B or C characteristic, Type A 10 or 30 mA, and 6 kA short-circuit rating. A pass means the entered values fit that envelope; it is not a declaration of legal compliance."], links: [{ label: "Check circuit breaker size", href: "/circuit-breaker-size-calculator/" }, { label: "Select an RCD or RCBO", href: "/rcd-rcbo-selector/" }, { label: "Calculate prospective fault current", href: "/short-circuit-current-calculator/" }] },
    { title: "AFDD selection example", paragraphs: ["For a 230 V residential socket circuit with 24 A design current, a 32 A C-curve, Type A 30 mA candidate can fit the published VIOX electrical envelope when prospective fault current remains below 6 kA. The project must still establish whether AFDD protection is required and whether every circuit and installation condition is acceptable."] }
  ]
};

expansionSeoGuides["dc-breaker-sizing-calculator"] = {
  sections: [
    { title: "How to size a DC circuit breaker", paragraphs: ["Enter load current directly or calculate it from DC power and voltage. Apply the project design factor, then compare the candidate breaker's current with corrected cable ampacity and separately verify its DC voltage and breaking capacity."], steps: ["Use the maximum operating current or power.", "Enter the highest circuit voltage, not only nominal voltage.", "Apply the required continuous-current factor.", "Check Ib <= In <= Iz.", "Verify DC voltage, pole wiring, and breaking capacity from the exact datasheet."] },
    { title: "Why DC breaker ratings differ from AC", paragraphs: ["A DC arc has no natural current zero every half-cycle, so interruption depends strongly on breaker construction, voltage, pole connection, source behavior, and current direction. An AC voltage or breaking rating cannot be assumed to apply on DC."], bullets: ["Use the documented DC voltage for the exact number of poles and connection diagram.", "Battery and PV sources have different available-fault-current behavior.", "Check bidirectional or polarized operation where current can flow in either direction."] },
    { title: "DC breaker selection checks", paragraphs: ["The current result is only the starting point. Final selection also includes cable protection, ambient derating, enclosure temperature, source time constant, isolation, selectivity, and application-specific PV or battery rules."], links: [{ label: "Size the connected cable", href: "/cable-size-calculator/" }, { label: "Calculate a PV combiner box", href: "/pv-combiner-box-sizing-calculator/" }, { label: "Check DC voltage drop", href: "/dc-voltage-drop-calculator/" }] },
    { title: "DC breaker sizing example", paragraphs: ["A 32 A continuous DC load with a 125% design factor requires 40 A. A 40 A candidate passes the current relationship only when corrected cable ampacity is at least 40 A; DC voltage and breaking capacity remain independent checks."] }
  ]
};

expansionSeoGuides["pv-dc-isolator-sizing-calculator"] = {
  sections: [
    { title: "How to size a PV DC isolator", paragraphs: ["Enter module Voc, its temperature coefficient, the lowest design cell temperature, modules per string, module Isc, and parallel-string count. The calculator derives cold array voltage and corrected current before checking the candidate isolator."], steps: ["Calculate cold-condition array Voc.", "Combine the current of every string passing through the isolator.", "Apply the required current factor.", "Choose isolation-only or operational load-switching duty.", "Verify voltage, current, utilization category, and pole wiring together."] },
    { title: "Cold Voc and DC-PV switching duty", paragraphs: ["PV open-circuit voltage normally rises as cell temperature falls. The isolator voltage screen therefore uses temperature-corrected Voc rather than nominal operating voltage. Operational switching also requires the correct IEC 60947-3 DC-PV utilization category for the application."], callouts: ["Voc,cold = N × Voc,STC × [1 + βVoc(Tmin − 25°C)]", "Idesign = Isc × parallel strings × current factor"] },
    { title: "Pole configuration and safe isolation", paragraphs: ["Many PV isolators obtain their declared DC voltage through a specific series-pole connection. The installation must disconnect every required live conductor and follow the manufacturer's polarity, wiring, mounting, and enclosure instructions."], links: [{ label: "Check PV string length", href: "/pv-string-sizing-calculator/" }, { label: "Size a PV combiner box", href: "/pv-combiner-box-sizing-calculator/" }, { label: "Select a DC breaker", href: "/dc-breaker-sizing-calculator/" }] },
    { title: "PV isolator sizing example", paragraphs: ["Eighteen modules with 49.5 V Voc and a -0.28%/°C coefficient reach about 978 V at -10°C. Two 13.7 A strings with a 125% factor require 34.25 A, pointing to a 40 A current class while the voltage and pole configuration require exact product verification."] }
  ]
};

expansionSeoGuides["acb-lsig-setting-calculator"] = {
  sections: [
    { title: "How to build an ACB LSIG worksheet", paragraphs: ["Enter feeder design current, corrected conductor ampacity, prospective fault current, candidate breaking capacity, and the desired pickup multiples. The result produces frame and pickup starting points for a later manufacturer-curve study."], steps: ["Choose a frame that can carry the design current.", "Keep long-time pickup between load current and protected-conductor ampacity.", "Enter short-time and instantaneous pickup multiples.", "Enter a ground-fault pickup starting point only when applicable.", "Complete time-delay and selectivity studies using exact curves."] },
    { title: "Meaning of L, S, I, and G", paragraphs: ["L is long-time overload protection, S is delayed short-time protection, I is instantaneous short-circuit protection, and G is ground-fault protection. Pickup current and operating delay are separate settings, and not every trip unit provides the same ranges or functions."], table: { headers: ["Function", "Pickup", "Main coordination purpose"], rows: [["Long time", "Ir", "Load and conductor overload protection"], ["Short time", "Isd", "Delayed fault clearing and downstream selectivity"], ["Instantaneous", "Ii", "Fast high-current fault clearing"], ["Ground fault", "Ig", "Ground-fault pickup and delayed clearing"]] } },
    { title: "Why final LSIG settings need a study", paragraphs: ["Generic multiples cannot establish coordination. Final settings require utility and transformer source data, minimum and maximum fault current, downstream protective-device curves, conductor damage limits, arc-flash implications, system earthing, and the exact ACB trip-unit manual."], links: [{ label: "Calculate short-circuit current", href: "/short-circuit-current-calculator/" }, { label: "Screen breaker selectivity", href: "/breaker-selectivity-calculator/" }, { label: "Check cable short-circuit withstand", href: "/cable-short-circuit-thermal-calculator/" }] },
    { title: "ACB LSIG worksheet example", paragraphs: ["For 800 A design current, 1000 A conductor ampacity, and 10% long-time margin, the worksheet proposes an 880 A Ir starting point within a 1000 A frame. Entered 6× and 10× multiples produce Isd and Ii references, but their delays and coordination remain unresolved until exact curves are studied."] }
  ]
};

expansionSeoGuides["ct-ratio-burden-calculator"] = {
  sections: [
    { title: "How to calculate CT ratio and burden", paragraphs: ["Enter the maximum primary current, desired ratio margin, 1 A or 5 A secondary, one-way copper lead length, conductor area, and all connected device burdens. The calculator selects a reference primary ratio and adds the complete lead-loop burden."], steps: ["Choose a ratio above the maximum intended primary current.", "Add both outgoing and return secondary lead resistance.", "Calculate lead VA at rated secondary current.", "Add meter, relay, and other burdens.", "Compare total burden with the CT rated burden."] },
    { title: "CT lead burden and the 1 A versus 5 A choice", paragraphs: ["Secondary wiring burden follows I squared R. At the same loop resistance, a 5 A CT produces 25 times the lead burden of a 1 A CT. This makes 1 A secondaries attractive for long cable runs, subject to the connected equipment and project standard."], callouts: ["Rlead = 2ρL/A", "VAlead = Is² × Rlead"] },
    { title: "Metering CT and protection CT limits", paragraphs: ["A VA burden pass alone does not establish suitability. Metering CTs need the required accuracy range and security behavior. Protection CTs need saturation analysis using class, accuracy limit factor or knee point, winding resistance, relay demand, maximum fault current, and system X/R ratio."], links: [{ label: "Calculate three-phase current", href: "/three-phase-current-calculator/" }, { label: "Calculate transformer current and size", href: "/transformer-sizing-calculator/" }, { label: "Calculate a DC current shunt", href: "/current-shunt-calculator/" }] },
    { title: "CT burden example", paragraphs: ["A 5 A CT connected through 20 m one-way of 2.5 mm² copper has about 0.28 ohm loop resistance and 7 VA lead burden. Adding 3.5 VA of instruments and relays creates 10.5 VA total burden, which fits a 15 VA CT before accuracy and saturation checks."] }
  ]
};

expansionSeoGuides["breaker-accessory-power-calculator"] = {
  sections: [
    { title: "How to calculate breaker accessory control power", paragraphs: ["Enter the exact operating and holding VA from each accessory datasheet. Choose whether all operating loads can coincide or only the largest credible event occurs, then add continuous loads and the supply margin."], steps: ["Confirm the common control voltage and AC/DC type.", "Enter shunt-trip operating VA.", "Enter undervoltage-release pickup and holding VA separately.", "Enter motor-operator and continuous auxiliary loads.", "Check both transient and continuous supply capability."] },
    { title: "Peak VA versus continuous VA", paragraphs: ["Shunt trips and motor operators usually create short operating demands, while undervoltage releases can impose continuous holding demand. A control transformer or DC power supply must support the governing event without excessive voltage dip and also carry the steady load thermally."], callouts: ["VAsupply >= max(VApeak, VAcontinuous) × design margin", "I = VA/V"] },
    { title: "Accessory compatibility checks", paragraphs: ["Matching voltage is not enough. The shunt trip, undervoltage release, motor operator, auxiliary contacts, mounting hardware, terminals, and wiring must be approved for the exact breaker series and frame."], links: [{ label: "Calculate panel heat loss", href: "/panel-heat-loss-calculator/" }, { label: "Build an ACB LSIG worksheet", href: "/acb-lsig-setting-calculator/" }, { label: "Size a transformer", href: "/transformer-sizing-calculator/" }] },
    { title: "Breaker accessory power example", paragraphs: ["If the combined trip and undervoltage pickup event is 200 VA while a motor operator needs 300 VA, largest-event mode uses 300 VA. A 125% margin produces a 375 VA supply reference, while the undervoltage holding coil and auxiliaries remain a separate continuous-load check."] }
  ]
};

expansionSeoGuides["pv-dc-ats-calculator"] = {
  sections: [
    { title: "How to size a PV or battery DC transfer switch", paragraphs: ["Enter transferred power or current and the highest voltage available from either source. Apply the continuous-current factor, choose the DC conductor arrangement and transition method, then check the candidate operational current, voltage, and poles."], steps: ["Use the highest source voltage under all operating conditions.", "Calculate maximum transferred load current.", "Apply the required continuous-current factor.", "Use open transition unless a purpose-designed source-paralleling system exists.", "Verify DC utilization category and pole wiring from the exact product data."] },
    { title: "Why a DC ATS is not an AC ATS", paragraphs: ["DC interruption lacks the regular current zero of AC. Contact spacing, arc control, polarity, number of series poles, voltage, current direction, and source characteristics all affect switching capability. An AC ATS label does not establish DC suitability."], bullets: ["Both sources require isolation and backfeed prevention.", "Battery sources can deliver high fault current.", "PV voltage varies with temperature and string configuration.", "Transfer logic must define source loss, recovery, delay, and failed-transfer behavior."] },
    { title: "Open transition and source interlocking", paragraphs: ["Break-before-make operation prevents the two DC sources from being connected together during ordinary transfer. Closed transition is not a simple timing option: it requires equipment designed for parallel operation, current sharing, protection, and the exact source technologies."], links: [{ label: "Size a general AC ATS", href: "/ats-selection-calculator/" }, { label: "Size a DC breaker", href: "/dc-breaker-sizing-calculator/" }, { label: "Size a PV DC isolator", href: "/pv-dc-isolator-sizing-calculator/" }] },
    { title: "PV DC ATS sizing example", paragraphs: ["A 20 kW load at 500 V draws 40 A. Applying a 125% continuous-current factor gives 50 A, so the current class must be at least 50 A. The candidate still needs a DC voltage rating above the maximum source voltage and documented switching duty for its exact pole arrangement."] }
  ]
};
