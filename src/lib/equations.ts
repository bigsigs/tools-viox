import type { ToolEquation } from "./types";

export const equationsBySlug: Record<string, ToolEquation> = {
  "spd-calculator": {
    title: "SPD selection rule",
    intro: "This calculator uses a practical selection rule for the starting SPD type. It first checks whether the circuit is PV/DC, then checks lightning exposure and the installation point.",
    equations: [
      { label: "PV or DC system", expression: "T = DC/PV SPD" },
      { label: "High lightning exposure", expression: "T = Type 1+2 SPD when LPS = yes or supply = overhead/mixed" },
      { label: "Downstream sensitive equipment", expression: "T = upstream SPD + Type 3 local protection" }
    ],
    symbols: [
      { symbol: "T", meaning: "Recommended SPD type family" },
      { symbol: "LPS", meaning: "External lightning protection system status" },
      { symbol: "supply", meaning: "Incoming supply exposure, such as underground, overhead, or mixed" },
      { symbol: "Type 3", meaning: "Local fine protection for sensitive equipment" }
    ],
    conclusion: "The result is a product-family starting point. Final SPD selection still requires Uc, Up, In/Imax, earthing system, coordination distance, and local standard checks."
  },
  "voltage-drop-calculator": {
    title: "Voltage drop equation",
    intro: "You can estimate cable voltage drop from load current, route length, conductor material, and conductor cross-section.",
    equations: [
      {
        label: "DC or single-phase",
        expression: "Vd = 2 × I × ρ × L / S",
        mathml: `<math display="block" aria-label="V d equals two I rho L over S">
          <msub><mi>V</mi><mi>d</mi></msub>
          <mo>=</mo>
          <mfrac>
            <mrow><mn>2</mn><mi>I</mi><mi>ρ</mi><mi>L</mi></mrow>
            <mi>S</mi>
          </mfrac>
        </math>`
      },
      {
        label: "Three-phase",
        expression: "Vd = √3 × I × ρ × L / S",
        mathml: `<math display="block" aria-label="V d equals square root of three I rho L over S">
          <msub><mi>V</mi><mi>d</mi></msub>
          <mo>=</mo>
          <mfrac>
            <mrow><msqrt><mn>3</mn></msqrt><mi>I</mi><mi>ρ</mi><mi>L</mi></mrow>
            <mi>S</mi>
          </mfrac>
        </math>`
      },
      {
        label: "Voltage drop percentage",
        expression: "Vd% = Vd / Vn × 100",
        mathml: `<math display="block" aria-label="V d percent equals V d over V n times one hundred">
          <msub><mi>V</mi><mrow><mi>d</mi><mo>%</mo></mrow></msub>
          <mo>=</mo>
          <mfrac>
            <msub><mi>V</mi><mi>d</mi></msub>
            <msub><mi>V</mi><mi>n</mi></msub>
          </mfrac>
          <mo>×</mo>
          <mn>100</mn>
        </math>`
      }
    ],
    symbols: [
      { symbol: "Vd", meaning: "Voltage drop, measured in volts", unit: "V" },
      { symbol: "Vd%", meaning: "Voltage drop as a percentage of nominal voltage", unit: "%" },
      { symbol: "I", meaning: "Load current, measured in amperes", unit: "A" },
      { symbol: "ρ", meaning: "Conductor resistivity reference, measured in ohm square millimeters per meter", unit: "ohm mm2/m" },
      { symbol: "L", meaning: "One-way cable length, measured in meters", unit: "m" },
      { symbol: "S", meaning: "Conductor cross-sectional area, measured in square millimeters", unit: "mm2" },
      { symbol: "Vn", meaning: "Nominal system voltage, measured in volts", unit: "V" }
    ],
    conclusion: "The result excludes reactance, harmonics, operating temperature, and installation correction factors, so long feeder runs need a standards-based cable check."
  },
  "cable-size-calculator": {
    title: "Cable ampacity sizing equation",
    intro: "This calculator estimates the minimum reference ampacity a conductor should have after sizing and installation derating.",
    equations: [
      { expression: "Ireq = Iload × F / (Kd × Km)" },
      { expression: "Select the first conductor where Itable ≥ Ireq" }
    ],
    symbols: [
      { symbol: "Ireq", meaning: "Required reference ampacity after correction", unit: "A" },
      { symbol: "Iload", meaning: "Load current entered by the user", unit: "A" },
      { symbol: "F", meaning: "Sizing factor, such as 125% for additional margin" },
      { symbol: "Kd", meaning: "Installation derating factor" },
      { symbol: "Km", meaning: "Material factor for copper or aluminum" },
      { symbol: "Itable", meaning: "Ampacity from the internal reference conductor table", unit: "A" }
    ],
    conclusion: "Use the selected size as a starting point only; final cable selection depends on insulation, terminal temperature, grouping, ambient temperature, and the local wiring code."
  },
  "conduit-fill-calculator": {
    title: "Conduit fill equation",
    intro: "Conduit fill compares the total cable area against the internal area of the selected raceway.",
    equations: [
      { label: "Circular area", expression: "A = π × d² / 4" },
      { label: "Total cable area", expression: "Acables = Σ(n × Acable)" },
      { label: "Conduit fill", expression: "Fill% = Acables / Aconduit × 100" }
    ],
    symbols: [
      { symbol: "A", meaning: "Cross-sectional area of a circular cable or conduit", unit: "in2" },
      { symbol: "d", meaning: "Outside diameter for a cable, or inside diameter for a conduit", unit: "in" },
      { symbol: "n", meaning: "Quantity of cables in the selected cable group" },
      { symbol: "Acable", meaning: "Cross-sectional area of one cable", unit: "in2" },
      { symbol: "Acables", meaning: "Total area occupied by all selected cables", unit: "in2" },
      { symbol: "Aconduit", meaning: "Internal conduit area", unit: "in2" },
      { symbol: "Fill%", meaning: "Calculated conduit fill percentage", unit: "%" }
    ],
    conclusion: "The calculator compares the result with common 53%, 31%, 40%, and 60% fill limits, but pulling tension, bends, and current-carrying conductor derating still need separate review."
  },
  "dc-voltage-drop-calculator": {
    title: "DC voltage drop equation",
    intro: "For two-wire DC circuits, the voltage drop is calculated across both the outgoing and return conductors.",
    equations: [
      { expression: "Vd = 2 × I × Rft × L" },
      { expression: "Vload = Vsource - Vd" },
      { expression: "Vd% = Vd / Vsource × 100" },
      { label: "Temperature correction", expression: "Rft = R20 × M × (1 + alpha × (T - 20))" }
    ],
    symbols: [
      { symbol: "Vd", meaning: "DC voltage drop", unit: "V" },
      { symbol: "I", meaning: "Load current", unit: "A" },
      { symbol: "Rft", meaning: "Adjusted conductor resistance per foot", unit: "ohm/ft" },
      { symbol: "L", meaning: "One-way conductor length", unit: "ft" },
      { symbol: "Vload", meaning: "Estimated voltage available at the load", unit: "V" },
      { symbol: "Vsource", meaning: "Source voltage", unit: "V" },
      { symbol: "R20", meaning: "Copper conductor resistance at 20 C" },
      { symbol: "M", meaning: "Material multiplier for copper, aluminum, or CCA" },
      { symbol: "alpha", meaning: "Copper temperature coefficient used for approximation" },
      { symbol: "T", meaning: "Ambient temperature converted to Celsius", unit: "C" }
    ],
    conclusion: "Low-voltage DC circuits are sensitive to small absolute voltage losses, so equipment minimum input voltage and fuse protection should be checked after the calculation."
  },
  "awg-wire-size-calculator": {
    title: "AWG wire size equation",
    intro: "The calculator checks each AWG size from small to large and selects the first conductor that passes both ampacity and voltage-drop limits.",
    equations: [
      { label: "Required ampacity", expression: "Ireq = Iload × Fc / Kbundle" },
      { label: "DC or single-phase voltage drop", expression: "Vd = 2 × Iload × Rft × L" },
      { label: "Three-phase voltage drop", expression: "Vd = √3 × Iload × Rft × L" },
      { label: "Selection rule", expression: "Select first AWG where Iamp ≥ Ireq and Vd% ≤ Vlimit" }
    ],
    symbols: [
      { symbol: "Ireq", meaning: "Required conductor ampacity after continuous-load and bundling adjustment", unit: "A" },
      { symbol: "Iload", meaning: "Load current", unit: "A" },
      { symbol: "Fc", meaning: "Continuous-load factor, 1.25 when selected" },
      { symbol: "Kbundle", meaning: "Bundled current-carrying conductor derating factor" },
      { symbol: "Vd", meaning: "Voltage drop", unit: "V" },
      { symbol: "Rft", meaning: "AWG conductor resistance per foot after material adjustment", unit: "ohm/ft" },
      { symbol: "L", meaning: "One-way conductor length", unit: "ft" },
      { symbol: "Iamp", meaning: "Reference ampacity for the AWG conductor", unit: "A" },
      { symbol: "Vlimit", meaning: "Maximum allowed voltage drop", unit: "%" }
    ],
    conclusion: "The internal ampacity table is simplified for planning; final conductor sizing must follow the applicable NEC, IEC, BS, or local standard."
  },
  "circuit-breaker-size-calculator": {
    title: "Circuit breaker sizing equation",
    intro: "This calculator estimates the load current, applies a sizing factor, and rounds up to the next common breaker rating.",
    equations: [
      { label: "DC load current", expression: "I = P / V" },
      { label: "Single-phase AC load current", expression: "I = P / (V × PF)" },
      { label: "Three-phase AC load current", expression: "I = P / (√3 × V × PF)" },
      { label: "Minimum breaker rating", expression: "Ib,min = I × F" },
      { label: "Standard rating selection", expression: "Ib = next standard size ≥ Ib,min" }
    ],
    symbols: [
      { symbol: "I", meaning: "Calculated load current", unit: "A" },
      { symbol: "P", meaning: "Load power converted to watts", unit: "W" },
      { symbol: "V", meaning: "System voltage", unit: "V" },
      { symbol: "PF", meaning: "Power factor for AC loads" },
      { symbol: "F", meaning: "Sizing factor, entered as a percentage and converted to a multiplier" },
      { symbol: "Ib,min", meaning: "Minimum calculated breaker current rating", unit: "A" },
      { symbol: "Ib", meaning: "Recommended standard breaker current rating", unit: "A" }
    ],
    conclusion: "Current rating is only one part of breaker selection. Trip curve, short-circuit breaking capacity, cable protection, selectivity, and product standard must also be verified."
  },
  "transformer-sizing-calculator": {
    title: "Transformer kVA sizing equation",
    intro: "Transformer sizing starts by converting the connected load to kVA, then applies demand, growth, loading margin, and ambient derating.",
    equations: [
      { label: "kW input", expression: "Sconnected = P / PF" },
      { label: "hp motor input", expression: "Sconnected = hp × 0.746 / (η × PF)" },
      { label: "Design load", expression: "Sdesign = Sconnected × D × (1 + G)" },
      { label: "Required transformer rating", expression: "Sreq = Sdesign / (Ltarget × Kambient)" },
      { label: "Secondary full-load current", expression: "Isec = Sstd × 1000 / (√3 × Vsec)" }
    ],
    symbols: [
      { symbol: "Sconnected", meaning: "Connected apparent load", unit: "kVA" },
      { symbol: "P", meaning: "Connected real power", unit: "kW" },
      { symbol: "PF", meaning: "Power factor" },
      { symbol: "hp", meaning: "Motor horsepower input" },
      { symbol: "η", meaning: "Motor efficiency as a decimal" },
      { symbol: "D", meaning: "Demand factor as a decimal" },
      { symbol: "G", meaning: "Future growth allowance as a decimal" },
      { symbol: "Ltarget", meaning: "Target transformer loading as a decimal" },
      { symbol: "Kambient", meaning: "Ambient temperature derating factor" },
      { symbol: "Sreq", meaning: "Required transformer rating before standard rounding", unit: "kVA" },
      { symbol: "Sstd", meaning: "Selected standard transformer rating", unit: "kVA" },
      { symbol: "Isec", meaning: "Secondary full-load current", unit: "A" },
      { symbol: "Vsec", meaning: "Secondary voltage", unit: "V" }
    ],
    conclusion: "For single-phase transformers, the current equation removes √3. Final selection should also check impedance, inrush, harmonics, cooling class, and enclosure conditions."
  },
  "short-circuit-current-calculator": {
    title: "Short-circuit current equation",
    intro: "The available transformer secondary fault current is estimated from transformer full-load current and total per-unit source impedance.",
    equations: [
      { label: "Three-phase full-load current", expression: "IFL = S × 1000 / (√3 × V)" },
      { label: "Single-phase full-load current", expression: "IFL = S × 1000 / V" },
      { label: "Optional utility source impedance", expression: "Zsource,pu = S / (MVAutility × 1000)" },
      { label: "Available fault current", expression: "Isc = IFL / (Ztransformer,pu + Zsource,pu)" },
      { label: "Fault level", expression: "Isc,kA = Isc / 1000" }
    ],
    symbols: [
      { symbol: "IFL", meaning: "Transformer full-load current", unit: "A" },
      { symbol: "S", meaning: "Transformer rating", unit: "kVA" },
      { symbol: "V", meaning: "Secondary voltage", unit: "V" },
      { symbol: "Zsource,pu", meaning: "Optional upstream utility impedance on the transformer base" },
      { symbol: "MVAutility", meaning: "Available upstream utility fault contribution", unit: "MVA" },
      { symbol: "Ztransformer,pu", meaning: "Transformer impedance converted from percent impedance" },
      { symbol: "Isc", meaning: "Estimated available short-circuit current", unit: "A" },
      { symbol: "Isc,kA", meaning: "Estimated available short-circuit current", unit: "kA" }
    ],
    conclusion: "This is a first-pass estimate at the transformer secondary. A final study should include cable impedance, motors, X/R ratio, utility data, and the applicable IEC or IEEE method."
  },
  "kw-kva-amp-calculator": {
    title: "Power conversion equations",
    intro: "These equations convert real power, apparent power, and current for DC, single-phase AC, and balanced three-phase AC systems.",
    equations: [
      { label: "DC current", expression: "I = P / (V × η)" },
      { label: "Single-phase AC current", expression: "I = P / (V × PF × η)" },
      { label: "Three-phase AC current", expression: "I = P / (√3 × V × PF × η)" },
      { label: "Apparent power", expression: "S = P / PF" }
    ],
    symbols: [
      { symbol: "I", meaning: "Calculated current", unit: "A" },
      { symbol: "P", meaning: "Real power converted to watts", unit: "W" },
      { symbol: "V", meaning: "System voltage", unit: "V" },
      { symbol: "PF", meaning: "Power factor for AC systems" },
      { symbol: "η", meaning: "Efficiency as a decimal" },
      { symbol: "S", meaning: "Apparent power", unit: "kVA" }
    ],
    conclusion: "Use equipment nameplate current when available, especially for nonlinear loads, motor loads, or equipment with high starting current."
  },
  "three-phase-current-calculator": {
    title: "Three-phase current equation",
    intro: "For balanced three-phase systems, current can be calculated from either real power in kW or apparent power in kVA.",
    equations: [
      { label: "From kW", expression: "I = P × 1000 / (√3 × VL-L × PF × η)" },
      { label: "From kVA", expression: "I = S × 1000 / (√3 × VL-L)" }
    ],
    symbols: [
      { symbol: "I", meaning: "Balanced three-phase line current", unit: "A" },
      { symbol: "P", meaning: "Real power", unit: "kW" },
      { symbol: "S", meaning: "Apparent power", unit: "kVA" },
      { symbol: "VL-L", meaning: "Line-to-line voltage", unit: "V" },
      { symbol: "PF", meaning: "Power factor" },
      { symbol: "η", meaning: "Efficiency as a decimal" }
    ],
    conclusion: "The equation assumes a balanced load. Motor starting current, harmonics, and unbalanced phase loading require separate checks."
  },
  "motor-current-calculator": {
    title: "Motor current equation",
    intro: "This calculator estimates three-phase motor full-load current from output power, voltage, efficiency, and power factor.",
    equations: [
      { label: "Horsepower conversion", expression: "Pout = hp × 0.746" },
      { label: "Three-phase motor current", expression: "IFLC = Pout × 1000 / (√3 × V × PF × η)" },
      { label: "Overload reference", expression: "IOL = IFLC × Fol" }
    ],
    symbols: [
      { symbol: "Pout", meaning: "Motor output power", unit: "kW" },
      { symbol: "hp", meaning: "Motor horsepower" },
      { symbol: "IFLC", meaning: "Estimated motor full-load current", unit: "A" },
      { symbol: "V", meaning: "Line-to-line voltage", unit: "V" },
      { symbol: "PF", meaning: "Motor power factor" },
      { symbol: "η", meaning: "Motor efficiency as a decimal" },
      { symbol: "IOL", meaning: "Overload relay current reference", unit: "A" },
      { symbol: "Fol", meaning: "Selected overload reference factor" }
    ],
    conclusion: "Nameplate full-load current should override calculated current for final overload relay, contactor, and motor protection settings."
  },
  "ev-charger-load-calculator": {
    title: "EV charger load equation",
    intro: "This calculator estimates charger current and total planned feeder load after applying charger quantity and simultaneity.",
    equations: [
      { label: "Single-phase charger current", expression: "Icharger = P × 1000 / (V × PF)" },
      { label: "Three-phase charger current", expression: "Icharger = P × 1000 / (√3 × V × PF)" },
      { label: "Planned feeder current", expression: "Iplanned = Icharger × N × Ks" }
    ],
    symbols: [
      { symbol: "Icharger", meaning: "Current per charger", unit: "A" },
      { symbol: "P", meaning: "Power per charger", unit: "kW" },
      { symbol: "V", meaning: "Supply voltage", unit: "V" },
      { symbol: "PF", meaning: "Charger power factor" },
      { symbol: "N", meaning: "Number of chargers" },
      { symbol: "Ks", meaning: "Simultaneity factor as a decimal" },
      { symbol: "Iplanned", meaning: "Planned distribution load current", unit: "A" }
    ],
    conclusion: "Final EV charging design should also check load management, earthing system, RCD/RCBO type, SPD selection, and local EV charging rules."
  },
  "cable-gland-size-calculator": {
    title: "Cable gland selection rule",
    intro: "Cable gland size is selected by matching the measured cable outside diameter to a product sealing range and then checking the installation environment.",
    equations: [
      { label: "Diameter fit rule", expression: "ODmin ≤ ODcable ≤ ODmax" },
      { label: "Thread selection rule", expression: "Select the first metric thread range that contains ODcable" }
    ],
    symbols: [
      { symbol: "ODcable", meaning: "Measured outside diameter over the cable sheath", unit: "mm" },
      { symbol: "ODmin", meaning: "Minimum sealing diameter from the gland datasheet", unit: "mm" },
      { symbol: "ODmax", meaning: "Maximum sealing diameter from the gland datasheet", unit: "mm" },
      { symbol: "M", meaning: "Metric cable gland thread size, such as M20 or M25" }
    ],
    conclusion: "Thread size is not the same as sealing range. Final gland selection must verify material, IP rating, thread length, armor termination, and hazardous-area certification where applicable."
  },
  "busbar-current-rating-calculator": {
    title: "Busbar current rating equation",
    intro: "This calculator estimates busbar current from cross-sectional area, current-density reference, material factor, and derating factor.",
    equations: [
      { label: "Busbar area", expression: "A = W × T" },
      { label: "Estimated current", expression: "I = A × J × Km × Kd" }
    ],
    symbols: [
      { symbol: "A", meaning: "Busbar cross-sectional area", unit: "mm2" },
      { symbol: "W", meaning: "Busbar width", unit: "mm" },
      { symbol: "T", meaning: "Busbar thickness", unit: "mm" },
      { symbol: "I", meaning: "Estimated current rating", unit: "A" },
      { symbol: "J", meaning: "Selected current density reference", unit: "A/mm2" },
      { symbol: "Km", meaning: "Material factor for copper or aluminum" },
      { symbol: "Kd", meaning: "Derating factor for enclosure and installation conditions" }
    ],
    conclusion: "A real busbar rating depends on temperature rise, enclosure ventilation, spacing, plating, supports, and short-circuit withstand testing."
  }
};
