export type SeoGuideTable = {
  headers: string[];
  rows: string[][];
};

export type SeoGuideSection = {
  title: string;
  paragraphs: string[];
  callouts?: string[];
  steps?: string[];
  bullets?: string[];
  table?: SeoGuideTable;
  links?: Array<{ label: string; href: string }>;
};

export type SeoGuide = {
  sections: SeoGuideSection[];
};

export const seoGuidesBySlug: Record<string, SeoGuide> = {
  "voltage-drop-calculator": {
    sections: [
      {
        title: "How to calculate voltage drop",
        paragraphs: [
          "Start with the load current, nominal system voltage, one-way cable length, conductor material, and conductor cross-sectional area. The calculator converts the selected units, applies the appropriate single-phase or three-phase path factor, and divides the result by nominal voltage to find the percentage drop."
        ],
        steps: [
          "Select DC, single-phase AC, or three-phase AC.",
          "Enter load current and nominal system voltage.",
          "Enter the physical one-way cable length.",
          "Select copper or aluminum and enter the conductor size.",
          "Add the number of parallel conductors per polarity or phase."
        ]
      },
      {
        title: "Voltage drop calculation example",
        paragraphs: [
          "Consider a balanced three-phase 400 V circuit carrying 32 A through a 50 m copper cable with a 10 mm² conductor and one conductor per phase. Using the simplified resistive equation:"
        ],
        callouts: [
          "Vd = √3 × 32 × 0.0175 × 50 / 10 = 4.85 V",
          "Vd% = 4.85 / 400 × 100 = 1.21%"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["System", "Three-phase AC"],
            ["Load current", "32 A"],
            ["One-way length", "50 m"],
            ["Copper conductor", "10 mm²"],
            ["Voltage drop", "4.85 V"],
            ["Voltage drop percentage", "1.21%"]
          ]
        }
      },
      {
        title: "Single-phase vs. three-phase voltage drop",
        paragraphs: [
          "DC and single-phase calculations use twice the one-way length because current travels to the load and returns through another conductor. A balanced three-phase calculation uses the √3 factor and the one-way phase-conductor length."
        ],
        table: {
          headers: ["Circuit", "Simplified formula", "Length entered"],
          rows: [
            ["DC / single-phase", "Vd = 2 × I × ρ × L / (S × n)", "One-way length"],
            ["Balanced three-phase", "Vd = √3 × I × ρ × L / (S × n)", "One-way length"]
          ]
        }
      },
      {
        title: "What is an acceptable voltage drop?",
        paragraphs: [
          "There is no single percentage that applies to every country, circuit, or load. The allowable voltage drop must come from the locally adopted wiring rules, project specification, and equipment voltage tolerance. This tool marks results above 3% for review and above 5% as a warning, but those thresholds are design references rather than a declaration of code compliance.",
          "Motors, electronic controls, low-voltage DC equipment, EV charging circuits, and long feeders may need tighter limits. Always check the voltage required at the equipment terminals under normal operating load."
        ]
      },
      {
        title: "How to reduce voltage drop",
        paragraphs: ["Voltage drop can be reduced by changing the conductor, route, current, or system design."],
        bullets: [
          "Increase conductor cross-sectional area.",
          "Shorten the cable route where practical.",
          "Use parallel conductors when the installation and code permit.",
          "Reduce circuit current or distribute the load across additional feeders.",
          "Use a higher distribution voltage where the equipment and system design allow it.",
          "Check terminals and joints for unwanted resistance."
        ]
      },
      {
        title: "Voltage drop and cable size",
        paragraphs: [
          "Voltage drop is only one cable-selection check. A conductor must also pass ampacity, installation derating, terminal-temperature, short-circuit withstand, and protective-device coordination requirements. Continue with the related sizing tools before finalizing a conductor."
        ],
        links: [
          { label: "Cable Size Calculator", href: "/cable-size-calculator/" },
          { label: "AWG Wire Size Calculator", href: "/awg-wire-size-calculator/" }
        ]
      }
    ]
  },
  "spd-calculator": {
    sections: [
      {
        title: "How to select an SPD type",
        paragraphs: [
          "Surge protective device selection begins with the source of surge exposure and the installation point. Type 1 devices are intended for the service entrance or locations exposed to partial lightning current, Type 2 devices are commonly used in distribution boards, and Type 3 devices provide coordinated fine protection close to sensitive equipment."
        ],
        steps: [
          "Identify whether the system is AC, DC, or photovoltaic.",
          "Confirm whether an external lightning protection system is present.",
          "Assess overhead, underground, or mixed supply exposure.",
          "Choose the incoming board, sub-board, or equipment panel location.",
          "Verify voltage, discharge-current ratings, earthing system, and coordination using product data."
        ]
      },
      {
        title: "SPD selection example",
        paragraphs: [
          "For a building with an external lightning protection system and an overhead supply, the calculator starts with a Type 1+2 SPD at the main distribution board. If a sensitive equipment panel is downstream, coordinated Type 3 protection may also be appropriate near the equipment."
        ],
        table: {
          headers: ["Installation condition", "Starting SPD family"],
          rows: [
            ["Incoming board with higher lightning exposure", "Type 1+2"],
            ["Normal downstream distribution board", "Type 2"],
            ["Sensitive equipment near point of use", "Coordinated Type 3"],
            ["PV array or DC circuit", "DC/PV-rated SPD"]
          ]
        }
      },
      {
        title: "Type 1 vs. Type 2 vs. Type 3 SPD",
        paragraphs: [
          "SPD types describe different test duties and installation roles; they are not interchangeable labels for stronger and weaker products. A coordinated installation can use more than one type so that high-energy surges are handled upstream and residual voltage is limited closer to equipment."
        ],
        bullets: [
          "Type 1: incoming locations exposed to lightning-current duty.",
          "Type 2: distribution-level transient overvoltage protection.",
          "Type 3: local protection coordinated with upstream SPDs.",
          "Type 1+2: combined duties in one tested device family."
        ]
      },
      {
        title: "Ratings to check after choosing the SPD type",
        paragraphs: [
          "The type result is only the first selection step. Final selection must match the maximum continuous operating voltage, voltage protection level, nominal or maximum discharge current, impulse current where applicable, prospective short-circuit conditions, protective backup device, earthing arrangement, and installation conductor length."
        ]
      },
      {
        title: "Coordinate surge protection with the installation",
        paragraphs: [
          "Check the SPD together with the distribution board, upstream protective device, downstream equipment withstand, and local lightning-risk assessment. Product-family support can follow after the electrical conditions are known."
        ],
        links: [
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Contact VIOX", href: "https://viox.com/contact" }
        ]
      }
    ]
  },
  "cable-size-calculator": {
    sections: [
      {
        title: "How to calculate cable size",
        paragraphs: [
          "Cable sizing starts with the design current and then applies the project sizing factor, conductor material, and installation derating. The selected cross-section must have a reference ampacity at least equal to the corrected current."
        ],
        steps: [
          "Determine the normal load current.",
          "Apply the required continuous-load or design margin.",
          "Select copper or aluminum.",
          "Apply installation, ambient, and grouping correction factors.",
          "Verify voltage drop, short-circuit withstand, and protective-device coordination."
        ]
      },
      {
        title: "Cable sizing example",
        paragraphs: [
          "A 32 A copper load with a 125% sizing factor requires a 40 A reference ampacity before any additional installation derating. In the calculator's simplified table, the first listed conductor that reaches this reference is 10 mm²."
        ],
        callouts: ["Ireq = 32 A × 1.25 = 40 A"],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Load current", "32 A"],
            ["Sizing factor", "125%"],
            ["Installation", "Normal reference"],
            ["Required reference ampacity", "40 A"],
            ["Preliminary conductor", "10 mm² copper"]
          ]
        }
      },
      {
        title: "Cable ampacity vs. cable cross-section",
        paragraphs: [
          "Cross-sectional area alone does not define ampacity. Insulation temperature rating, number of loaded conductors, installation method, ambient temperature, grouping, soil conditions, terminal ratings, and local tables can change the allowable current for the same conductor size."
        ]
      },
      {
        title: "Why aluminum cable usually needs a larger size",
        paragraphs: [
          "Aluminum has higher electrical resistivity than copper, so an aluminum conductor normally needs a larger cross-section for a comparable current and voltage-drop target. Terminals, joint preparation, mechanical properties, and approved conductor material must also be checked."
        ]
      },
      {
        title: "Checks required after cable sizing",
        paragraphs: [
          "Treat this result as a starting size. A final design must verify the adopted ampacity table, voltage drop at normal and starting conditions, fault-loop performance, short-circuit thermal withstand, neutral loading, harmonics, and compatibility with the selected protective device."
        ],
        links: [
          { label: "Voltage Drop Calculator", href: "/voltage-drop-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Cable Gland Size Calculator", href: "/cable-gland-size-calculator/" }
        ]
      }
    ]
  },
  "conduit-fill-calculator": {
    sections: [
      {
        title: "How to calculate conduit fill",
        paragraphs: [
          "Conduit fill is the total cross-sectional area of all installed cables divided by the internal cross-sectional area of the raceway. The calculation uses actual cable outside diameter, not conductor cross-section, because insulation and jackets occupy pathway space."
        ],
        steps: [
          "Select the conduit family and trade size.",
          "Select each cable type or enter its measured outside diameter.",
          "Enter the quantity in each cable group.",
          "Compare total cable area with the applicable fill limit.",
          "Review pulling tension, bends, jamming risk, and future capacity separately."
        ]
      },
      {
        title: "Conduit fill calculation example",
        paragraphs: [
          "Twelve Cat6 cables with a 0.236 in outside diameter in 1 in EMT occupy about 60.7% of the conduit area. Because three or more cables use a 40% reference limit in this calculator, this combination requires a larger pathway."
        ],
        callouts: ["Fill% = total cable area / conduit internal area × 100"],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Conduit", "1 in EMT"],
            ["Cable", "Cat6, 0.236 in OD"],
            ["Quantity", "12"],
            ["Calculated fill", "60.7%"],
            ["Reference limit", "40% for three or more cables"]
          ]
        }
      },
      {
        title: "Conduit fill limits by cable count",
        paragraphs: [
          "The calculator applies the common NEC Chapter 9 area limits shown below. These are pathway fill limits and do not replace conductor ampacity adjustment rules."
        ],
        table: {
          headers: ["Cable count or run", "Maximum fill reference"],
          rows: [
            ["One cable", "53%"],
            ["Two cables", "31%"],
            ["Three or more cables", "40%"],
            ["Short nipple condition", "60%"]
          ]
        }
      },
      {
        title: "Cable jamming and pulling considerations",
        paragraphs: [
          "A fill result below the limit does not guarantee an easy or damage-free pull. Conduit bends, pull length, sidewall pressure, cable stiffness, and the diameter ratio of three similar cables can control the installation. Use manufacturer pulling data for long or high-tension routes."
        ]
      },
      {
        title: "Conduit fill and wire sizing are separate checks",
        paragraphs: [
          "Conduit fill answers whether cables physically fit within the pathway area. Cable ampacity, current-carrying conductor derating, voltage drop, and protective-device sizing remain separate electrical checks."
        ],
        links: [
          { label: "AWG Wire Size Calculator", href: "/awg-wire-size-calculator/" },
          { label: "Cable Size Calculator", href: "/cable-size-calculator/" }
        ]
      }
    ]
  },
  "dc-voltage-drop-calculator": {
    sections: [
      {
        title: "How to calculate DC voltage drop",
        paragraphs: [
          "A two-wire DC circuit loses voltage in both the positive and return conductors. Enter the physical one-way distance; the calculator doubles that length internally, adjusts conductor resistance for material and temperature, and compares the loss with source voltage."
        ],
        steps: [
          "Enter source voltage and load current.",
          "Enter the one-way cable length.",
          "Select AWG size and conductor material.",
          "Enter ambient temperature and the project drop limit.",
          "Check load-end voltage as well as percentage drop."
        ]
      },
      {
        title: "DC voltage drop example",
        paragraphs: [
          "For a 24 V DC load drawing 3 A through 100 ft of 14 AWG copper at 75°F, the simplified calculation gives about 1.54 V drop, or approximately 6.4%. The estimated voltage at the load is about 22.5 V."
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Source voltage", "24 V DC"],
            ["Load current", "3 A"],
            ["One-way length", "100 ft"],
            ["Conductor", "14 AWG copper"],
            ["Voltage drop", "About 1.54 V / 6.4%"],
            ["Load voltage", "About 22.5 V"]
          ]
        }
      },
      {
        title: "Why low-voltage DC circuits are sensitive to cable loss",
        paragraphs: [
          "The same absolute loss is a much larger percentage of a 12 V or 24 V supply than of a 230 V circuit. Battery systems, controls, LED loads, solar circuits, and communications equipment can stop operating correctly even when conductor ampacity is adequate."
        ]
      },
      {
        title: "Copper vs. aluminum vs. CCA wire",
        paragraphs: [
          "Copper provides the lowest resistance among the options in this simplified model. Aluminum and copper-clad aluminum require additional attention to conductor size, terminals, joining methods, mechanical strength, and product approval. CCA should not be treated as a direct copper substitute for critical high-current circuits."
        ]
      },
      {
        title: "How to reduce DC voltage drop",
        paragraphs: ["Improve load-end voltage by reducing total circuit resistance or current."],
        bullets: [
          "Increase wire size.",
          "Shorten the positive and return path.",
          "Raise system voltage when the equipment permits it.",
          "Use parallel conductors only where the installation rules allow.",
          "Check fuse, terminals, connectors, and joints for additional resistance."
        ],
        links: [
          { label: "AWG Wire Size Calculator", href: "/awg-wire-size-calculator/" },
          { label: "Voltage Drop Calculator", href: "/voltage-drop-calculator/" }
        ]
      }
    ]
  },
  "awg-wire-size-calculator": {
    sections: [
      {
        title: "How to calculate AWG wire size",
        paragraphs: [
          "AWG wire sizing must satisfy both current capacity and voltage drop. The calculator applies a continuous-load factor when selected, adjusts reference ampacity for the number of current-carrying conductors, and checks each listed gauge against the chosen voltage-drop limit."
        ],
        steps: [
          "Select DC, single-phase, or balanced three-phase.",
          "Enter current, voltage, and one-way length.",
          "Select conductor material and continuous-load treatment.",
          "Enter the number of current-carrying conductors for bundling adjustment.",
          "Choose the first gauge that passes both ampacity and voltage-drop checks."
        ]
      },
      {
        title: "AWG wire size example",
        paragraphs: [
          "For a 20 A, 120 V single-phase circuit with a 100 ft one-way run, copper conductors, a 3% voltage-drop limit, and three current-carrying conductors, 8 AWG is the smallest size in the calculator's reference table that passes both checks."
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Circuit", "120 V single-phase"],
            ["Load current", "20 A"],
            ["One-way length", "100 ft"],
            ["Conductor", "Copper"],
            ["Maximum voltage drop", "3%"],
            ["Preliminary result", "8 AWG"]
          ]
        }
      },
      {
        title: "Ampacity vs. voltage drop when choosing wire gauge",
        paragraphs: [
          "Short circuits often select wire size by ampacity, while long or low-voltage circuits may require a much larger conductor because of voltage drop. The governing gauge is the larger size required by either condition."
        ],
        table: {
          headers: ["Check", "What controls the result"],
          rows: [
            ["Ampacity", "Load current, continuous duty, conductor material, bundling, terminals, insulation, and installation method"],
            ["Voltage drop", "Current, voltage, one-way distance, conductor resistance, material, and circuit type"],
            ["Final design", "The larger compliant conductor after all applicable checks"]
          ]
        }
      },
      {
        title: "How current-carrying conductors affect wire size",
        paragraphs: [
          "Multiple loaded conductors in the same raceway or cable can retain heat and reduce allowable ampacity. The calculator uses simplified adjustment bands as a planning aid; final derating must follow the adopted code and the actual conductor temperature rating."
        ]
      },
      {
        title: "Complete the wire sizing check",
        paragraphs: [
          "After selecting an AWG size, verify terminal ratings, insulation type, ambient temperature, raceway fill, equipment grounding conductor, overcurrent protection, and short-circuit performance."
        ],
        links: [
          { label: "Conduit Fill Calculator", href: "/conduit-fill-calculator/" },
          { label: "DC Voltage Drop Calculator", href: "/dc-voltage-drop-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" }
        ]
      }
    ]
  },
  "circuit-breaker-size-calculator": {
    sections: [
      {
        title: "How to calculate circuit breaker size",
        paragraphs: [
          "Breaker current sizing begins by converting load power to current for DC, single-phase AC, or three-phase AC. The calculator multiplies load current by the selected sizing factor and rounds upward to the next listed standard current rating."
        ],
        steps: [
          "Select the electrical system type.",
          "Enter load power, voltage, and AC power factor.",
          "Apply the project sizing or continuous-load factor.",
          "Round up to a standard breaker current rating.",
          "Verify cable protection, trip characteristic, breaking capacity, and selectivity."
        ]
      },
      {
        title: "Circuit breaker sizing example",
        paragraphs: [
          "A balanced three-phase 15 kW load at 400 V and 0.85 power factor draws about 25.5 A. Applying a 125% sizing factor gives a minimum rating of about 31.8 A, so the calculator selects the next listed size of 32 A."
        ],
        callouts: [
          "I = 15,000 / (√3 × 400 × 0.85) = 25.5 A",
          "Ib,min = 25.5 × 1.25 = 31.8 A → 32 A"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Load", "15 kW three-phase"],
            ["Voltage", "400 V"],
            ["Power factor", "0.85"],
            ["Sizing factor", "125%"],
            ["Recommended current rating", "32 A"]
          ]
        }
      },
      {
        title: "Breaker current rating is not breaking capacity",
        paragraphs: [
          "The ampere rating describes normal-current and overload behavior. Breaking capacity describes the prospective short-circuit current the device can interrupt at a stated voltage and standard. Both must be adequate, and they cannot be inferred from each other."
        ],
        table: {
          headers: ["Breaker characteristic", "Selection question"],
          rows: [
            ["Rated current or setting", "Can it carry the load and protect the conductor?"],
            ["Trip curve or protection settings", "Will it coordinate with starting current and downstream devices?"],
            ["Breaking capacity", "Can it interrupt the available fault current?"],
            ["Poles and voltage", "Does it match the circuit and isolation requirements?"]
          ]
        }
      },
      {
        title: "MCB vs. MCCB selection after sizing",
        paragraphs: [
          "Current alone does not decide whether a miniature circuit breaker or molded-case circuit breaker is appropriate. Required breaking capacity, adjustable protection, frame size, coordination, mounting, standard, and application determine the product family."
        ]
      },
      {
        title: "Coordinate breaker and cable sizing",
        paragraphs: [
          "The selected breaker must protect the downstream conductor while carrying the design load. Confirm the relationship between design current, breaker rating or setting, and corrected cable ampacity, then check available fault current."
        ],
        links: [
          { label: "Cable Size Calculator", href: "/cable-size-calculator/" },
          { label: "Short Circuit Current Calculator", href: "/short-circuit-current-calculator/" },
          { label: "Contact VIOX", href: "https://viox.com/contact" }
        ]
      }
    ]
  },
  "transformer-sizing-calculator": {
    sections: [
      {
        title: "How to calculate transformer size",
        paragraphs: [
          "Transformer sizing converts the connected load to apparent power in kVA, applies demand and future-growth allowances, divides by the target loading and ambient derating factors, and then rounds up to a listed standard transformer rating."
        ],
        steps: [
          "Choose single-phase or three-phase and the preferred rating series.",
          "Enter connected load in kW, kVA, or motor horsepower.",
          "Apply power factor and motor efficiency where required.",
          "Apply demand, growth, target loading, and ambient conditions.",
          "Check inrush, harmonics, impedance, cooling, and protection before procurement."
        ]
      },
      {
        title: "Transformer sizing example",
        paragraphs: [
          "For a 200 kW three-phase load at 0.85 power factor, 70% demand, 20% growth, 80% target loading, and a 40°C ambient assumption using the calculator's simplified derating, the required capacity is about 275 kVA. The next ANSI reference rating is 300 kVA."
        ],
        callouts: [
          "Sconnected = 200 / 0.85 = 235.3 kVA",
          "Sreq = 235.3 × 0.70 × 1.20 / (0.80 × 0.90) = 274.5 kVA → 300 kVA"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Connected load", "200 kW"],
            ["Power factor", "0.85"],
            ["Demand / growth", "70% / 20%"],
            ["Target loading", "80%"],
            ["Preliminary rating", "300 kVA ANSI reference"]
          ]
        }
      },
      {
        title: "kW vs. kVA in transformer sizing",
        paragraphs: [
          "Transformers are rated in kVA because their thermal loading depends on voltage and current rather than load power factor alone. A kW load must therefore be converted to input kVA using power factor and, for mechanical motor output, efficiency."
        ],
        table: {
          headers: ["Load input", "Conversion basis"],
          rows: [
            ["kVA", "Use apparent power directly"],
            ["kW", "Divide by power factor"],
            ["Motor hp", "Convert hp to kW, then divide by efficiency and power factor"]
          ]
        }
      },
      {
        title: "Transformer sizing factors that need engineering review",
        paragraphs: [
          "Load diversity, motor starting, cyclic duty, harmonic currents, nonlinear loads, future expansion, cooling class, enclosure, altitude, ambient temperature, voltage taps, impedance, and redundancy strategy can all change the final transformer selection."
        ]
      },
      {
        title: "Use transformer current for downstream design",
        paragraphs: [
          "After selecting a preliminary kVA rating, calculate secondary full-load current and available short-circuit current. These values are starting inputs for breaker, cable, busbar, and panel checks."
        ],
        links: [
          { label: "Short Circuit Current Calculator", href: "/short-circuit-current-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Busbar Current Rating Calculator", href: "/busbar-current-rating-calculator/" }
        ]
      }
    ]
  },
  "short-circuit-current-calculator": {
    sections: [
      {
        title: "How to calculate transformer fault current",
        paragraphs: [
          "A first-pass transformer secondary fault-current estimate divides transformer full-load current by total per-unit source impedance. Transformer percent impedance is always included; optional utility fault MVA adds an upstream source-impedance allowance on the transformer base."
        ],
        steps: [
          "Enter transformer kVA, phase, and secondary voltage.",
          "Enter the transformer nameplate percent impedance.",
          "Add utility fault MVA when reliable source data is available.",
          "Calculate secondary full-load current and divide by total per-unit impedance.",
          "Select equipment with verified interrupting and withstand ratings above the complete study result."
        ]
      },
      {
        title: "Short-circuit current example",
        paragraphs: [
          "A 500 kVA, 400 V three-phase transformer with 5.75% impedance has a full-load current of about 722 A. With an infinite-bus assumption and no downstream cable impedance, the estimated secondary terminal fault current is about 12.6 kA."
        ],
        callouts: [
          "IFL = 500,000 / (√3 × 400) = 721.7 A",
          "Isc = 721.7 / 0.0575 = 12.55 kA"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Transformer", "500 kVA, three-phase"],
            ["Secondary voltage", "400 V"],
            ["Transformer impedance", "5.75%"],
            ["Utility contribution", "Ignored / infinite-bus estimate"],
            ["Estimated fault current", "12.6 kA"]
          ]
        }
      },
      {
        title: "Why transformer impedance changes fault current",
        paragraphs: [
          "Fault current is inversely related to source impedance. A lower percent-impedance transformer can deliver more secondary fault current, while added utility, transformer, and conductor impedance reduces the current available at downstream points."
        ]
      },
      {
        title: "Transformer-only estimate vs. complete short-circuit study",
        paragraphs: [
          "This calculator is useful at the transformer terminals, but a complete study includes utility source data, cable and busbar impedance, generators, motor contribution, transformer tolerance, voltage factor, X/R ratio, fault type, and the applicable IEC or IEEE calculation method."
        ],
        table: {
          headers: ["Included here", "Required in a detailed study"],
          rows: [
            ["Transformer kVA and %Z", "Transformer tolerance and R/X components"],
            ["Optional utility fault MVA", "Verified utility source model"],
            ["Terminal fault estimate", "Cable, busbar, motors, generators, and fault location"]
          ]
        }
      },
      {
        title: "Use fault current to check protective equipment",
        paragraphs: [
          "Circuit breakers, fuses, switchgear, busbars, and panels must have suitable interrupting or withstand performance at their installation point. Do not use current rating as a substitute for short-circuit rating."
        ],
        links: [
          { label: "Transformer Sizing Calculator", href: "/transformer-sizing-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Busbar Current Rating Calculator", href: "/busbar-current-rating-calculator/" }
        ]
      }
    ]
  },
  "kw-kva-amp-calculator": {
    sections: [
      {
        title: "How to convert kW, kVA, and amps",
        paragraphs: [
          "Power conversion depends on system phase, voltage, power factor, and efficiency. The calculator treats entered kW as output power, converts it to required input kW using efficiency, then calculates apparent power and current."
        ],
        steps: [
          "Select DC, single-phase AC, or three-phase AC.",
          "Enter output power and system voltage.",
          "Enter power factor for AC loads.",
          "Enter efficiency when output power differs from electrical input power.",
          "Use the calculated current for preliminary feeder and protection checks."
        ]
      },
      {
        title: "kW to amps calculation example",
        paragraphs: [
          "A 15 kW three-phase output at 400 V, 0.90 power factor, and 90% efficiency requires about 16.7 kW input, 18.5 kVA, and 26.7 A line current."
        ],
        callouts: [
          "Pinput = 15 / 0.90 = 16.7 kW",
          "S = 16.7 / 0.90 = 18.5 kVA",
          "I = 15,000 / (√3 × 400 × 0.90 × 0.90) = 26.7 A"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Output power", "15 kW"],
            ["Voltage", "400 V three-phase"],
            ["Power factor / efficiency", "0.90 / 90%"],
            ["Input power", "16.7 kW"],
            ["Apparent power", "18.5 kVA"],
            ["Line current", "26.7 A"]
          ]
        }
      },
      {
        title: "kW vs. kVA",
        paragraphs: [
          "Kilowatts measure real power, while kilovolt-amperes measure apparent power. For an AC load, input kW equals kVA multiplied by power factor. If entered power is mechanical or useful output, efficiency is also needed to find electrical input power."
        ],
        table: {
          headers: ["Quantity", "Meaning", "Typical use"],
          rows: [
            ["kW", "Real power", "Useful output or electrical energy converted to work and heat"],
            ["kVA", "Apparent power", "Transformer, generator, and system loading"],
            ["A", "Current", "Cable, breaker, contactor, and busbar planning"]
          ]
        }
      },
      {
        title: "Single-phase vs. three-phase current conversion",
        paragraphs: [
          "Single-phase current uses voltage directly in the denominator. Balanced three-phase current uses line-to-line voltage and the √3 factor. DC conversion does not use AC power factor."
        ]
      },
      {
        title: "Use nameplate current for final equipment selection",
        paragraphs: [
          "Calculated current is an estimate for balanced steady-state conditions. Motors, transformers, rectifiers, variable-speed drives, chargers, and nonlinear loads may have starting current, harmonics, duty cycles, or manufacturer ratings that control final selection."
        ],
        links: [
          { label: "Three Phase Current Calculator", href: "/three-phase-current-calculator/" },
          { label: "Motor Current Calculator", href: "/motor-current-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" }
        ]
      }
    ]
  },
  "three-phase-current-calculator": {
    sections: [
      {
        title: "How to calculate three-phase current",
        paragraphs: [
          "Balanced three-phase current can be calculated from real power in kW or apparent power in kVA. A kW input requires line voltage, power factor, and efficiency; a kVA input requires only line voltage because apparent power already represents voltage-current loading."
        ],
        steps: [
          "Choose whether the known power is kW or kVA.",
          "Enter line-to-line voltage.",
          "For kW, enter power factor and efficiency.",
          "Calculate line current using the √3 three-phase relationship.",
          "Check nameplate current, starting duty, and phase balance before final sizing."
        ]
      },
      {
        title: "Three-phase current calculation example",
        paragraphs: [
          "A 30 kW balanced load at 400 V, 0.85 power factor, and 92% efficiency draws approximately 55.4 A. The corresponding input apparent power is about 38.4 kVA."
        ],
        callouts: [
          "I = 30,000 / (√3 × 400 × 0.85 × 0.92) = 55.4 A",
          "S = 30 / (0.85 × 0.92) = 38.4 kVA"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Output power", "30 kW"],
            ["Line voltage", "400 V"],
            ["Power factor", "0.85"],
            ["Efficiency", "92%"],
            ["Line current", "55.4 A"]
          ]
        }
      },
      {
        title: "Three-phase amps from kW vs. kVA",
        paragraphs: [
          "When power is entered in kW, current increases as power factor or efficiency decreases. When power is entered in kVA, do not divide by power factor again because kVA already represents apparent input power."
        ],
        table: {
          headers: ["Known value", "Current equation"],
          rows: [
            ["Output kW", "I = kW × 1000 / (√3 × V × PF × η)"],
            ["Input kVA", "I = kVA × 1000 / (√3 × V)"]
          ]
        }
      },
      {
        title: "Line voltage and phase voltage",
        paragraphs: [
          "This calculator expects line-to-line voltage, such as 400 V or 480 V. Do not substitute phase-to-neutral voltage unless the formula and load connection are changed accordingly."
        ]
      },
      {
        title: "Apply three-phase current to equipment sizing",
        paragraphs: [
          "Use the result for preliminary cable, breaker, contactor, and busbar checks. Starting current, unbalance, harmonics, cyclic loading, ambient temperature, and equipment nameplate data may require a different final rating."
        ],
        links: [
          { label: "kW, kVA and Amp Calculator", href: "/kw-kva-amp-calculator/" },
          { label: "Motor Current Calculator", href: "/motor-current-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" }
        ]
      }
    ]
  },
  "motor-current-calculator": {
    sections: [
      {
        title: "How to calculate motor full-load current",
        paragraphs: [
          "The calculator estimates three-phase motor current from shaft output power, line voltage, power factor, and efficiency. Horsepower is first converted to kilowatts, then electrical input current is calculated using the balanced three-phase relationship."
        ],
        steps: [
          "Enter motor output in kW or horsepower.",
          "Enter line-to-line voltage.",
          "Enter expected full-load power factor and efficiency.",
          "Calculate estimated full-load current.",
          "Use the motor nameplate and starter coordination data for final protection settings."
        ]
      },
      {
        title: "Motor current calculation example",
        paragraphs: [
          "A 7.5 kW three-phase motor at 400 V, 0.86 power factor, and 90% efficiency has an estimated full-load current of 14.0 A. A 115% overload reference corresponds to about 16.1 A, but the final relay setting must follow the motor nameplate and applicable protection rules."
        ],
        callouts: [
          "IFL = 7,500 / (√3 × 400 × 0.86 × 0.90) = 14.0 A",
          "Ioverload,ref = 14.0 × 1.15 = 16.1 A"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Motor output", "7.5 kW"],
            ["Line voltage", "400 V"],
            ["Power factor / efficiency", "0.86 / 90%"],
            ["Estimated full-load current", "14.0 A"],
            ["115% overload reference", "16.1 A"]
          ]
        }
      },
      {
        title: "Motor kW vs. horsepower",
        paragraphs: [
          "Motor kW and horsepower normally describe mechanical output, not electrical input. The calculator uses 1 hp = 0.746 kW before dividing by efficiency and power factor to estimate supply current."
        ]
      },
      {
        title: "Motor current vs. starting current",
        paragraphs: [
          "Full-load current is not the same as starting current. Direct-on-line, star-delta, soft-starter, and variable-frequency-drive starting methods produce different current and torque behavior. Breaker, contactor, overload relay, and cable selection must account for the actual starting method and duty."
        ],
        table: {
          headers: ["Selection item", "Main information required"],
          rows: [
            ["Contactor", "Utilization category, operational current, voltage, and duty"],
            ["Overload relay", "Motor nameplate current, service factor, class, and start time"],
            ["Breaker or fuse", "Starting current, short-circuit coordination, and breaking capacity"],
            ["Cable", "Nameplate current, installation derating, starting voltage drop, and fault withstand"]
          ]
        }
      },
      {
        title: "Use nameplate data for final motor protection",
        paragraphs: [
          "Manufacturer nameplate current and starter coordination tables take priority over a formula estimate. Confirm phase, frequency, duty, efficiency class, ambient conditions, starting method, and required Type 1 or Type 2 coordination where applicable."
        ],
        links: [
          { label: "Three Phase Current Calculator", href: "/three-phase-current-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Contact VIOX", href: "https://viox.com/contact" }
        ]
      }
    ]
  },
  "ev-charger-load-calculator": {
    sections: [
      {
        title: "How to calculate EV charger load",
        paragraphs: [
          "EV charging load planning starts with power per charger, supply phase, voltage, charger quantity, power factor, and the expected simultaneity or load-management factor. The result estimates current per charger and the planned coincident feeder current."
        ],
        steps: [
          "Select single-phase or three-phase AC charging.",
          "Enter rated input power and supply voltage per charger.",
          "Enter charger quantity and power factor.",
          "Apply a project-specific simultaneity factor or controlled-load limit.",
          "Verify feeder, protection, earthing, residual-current protection, and voltage drop."
        ]
      },
      {
        title: "EV charger load calculation example",
        paragraphs: [
          "Four 11 kW three-phase chargers at 400 V and 0.98 power factor each draw about 16.2 A. With an 80% simultaneity factor, the planned coincident feeder current is approximately 51.8 A."
        ],
        callouts: [
          "Icharger = 11,000 / (√3 × 400 × 0.98) = 16.2 A",
          "Iplanned = 16.2 × 4 × 0.80 = 51.8 A"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Chargers", "4 × 11 kW"],
            ["Supply", "400 V three-phase"],
            ["Power factor", "0.98"],
            ["Simultaneity", "80%"],
            ["Current per charger", "16.2 A"],
            ["Planned feeder current", "51.8 A"]
          ]
        }
      },
      {
        title: "Installed EV charging power vs. coincident demand",
        paragraphs: [
          "Installed power is the sum of charger nameplate ratings. Coincident demand is the load expected at the same time after load management or diversity. The simultaneity factor should come from the charging strategy, site operating profile, utility limit, or energy-management design rather than a generic assumption."
        ],
        table: {
          headers: ["Quantity", "Meaning"],
          rows: [
            ["Installed power", "Maximum combined nameplate charging power"],
            ["Simultaneity", "Expected or controlled fraction operating together"],
            ["Planned demand", "Feeder load used for preliminary distribution planning"]
          ]
        }
      },
      {
        title: "Protection checks for EV charging circuits",
        paragraphs: [
          "Final EV supply equipment design must follow manufacturer instructions and locally adopted installation rules. Check overcurrent protection, residual-current protection and DC leakage handling, earthing arrangement, surge protection, isolation, cable thermal loading, voltage drop, and load management. DC fast charging needs a more detailed input and power-quality study."
        ]
      },
      {
        title: "Complete the EV feeder design",
        paragraphs: [
          "Use planned current as an input to cable and breaker checks, then confirm actual charger input current and protective-device requirements from the equipment documentation."
        ],
        links: [
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Cable Size Calculator", href: "/cable-size-calculator/" },
          { label: "SPD Calculator", href: "/spd-calculator/" }
        ]
      }
    ]
  },
  "cable-gland-size-calculator": {
    sections: [
      {
        title: "How to choose cable gland size",
        paragraphs: [
          "Cable gland selection starts with the measured outside diameter of the finished cable, not conductor cross-section. The cable diameter must fall inside the manufacturer's sealing range, while the entry thread must match the enclosure opening or approved adaptor."
        ],
        steps: [
          "Measure cable outside diameter over the outer sheath.",
          "Identify armored or unarmored cable construction.",
          "Choose indoor, outdoor, or hazardous-area service.",
          "Match cable OD to the gland sealing range.",
          "Verify thread, material, IP or environmental rating, armor termination, and certification."
        ]
      },
      {
        title: "Cable gland size example",
        paragraphs: [
          "For an 18 mm cable outside diameter, the calculator gives M25 as a starting metric thread reference. This does not mean every M25 gland will seal an 18 mm cable; the exact clamping and sealing range must be confirmed on the selected product datasheet."
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Cable outside diameter", "18 mm"],
            ["Starting metric thread", "M25"],
            ["Armored cable", "Use an armor-terminating gland"],
            ["Hazardous area", "Use correctly certified equipment and installation practice"]
          ]
        }
      },
      {
        title: "Cable gland thread size vs. sealing range",
        paragraphs: [
          "Thread size describes the enclosure entry connection. Sealing range describes the cable diameters that the gland can clamp and seal. Different gland designs can use the same thread while offering different cable ranges, so thread size alone is not enough for selection."
        ],
        table: {
          headers: ["Dimension", "What it must match"],
          rows: [
            ["Cable sealing range", "Measured cable outside diameter"],
            ["Entry thread", "Enclosure hole, threaded entry, or adaptor"],
            ["Thread length", "Wall thickness and locknut engagement"],
            ["Armor range", "Actual armor type and dimensions"]
          ]
        }
      },
      {
        title: "Armored vs. unarmored cable glands",
        paragraphs: [
          "Unarmored glands primarily provide sealing and strain relief. Armored cable glands must also terminate and, where required, bond the armor correctly. Cable construction such as steel wire armor, tape armor, braid, or screened cable changes the suitable gland design."
        ]
      },
      {
        title: "Information needed before ordering cable glands",
        paragraphs: [
          "Record cable OD, cable construction, armor dimensions, enclosure entry thread, required material, environmental exposure, temperature range, ingress protection, earthing or bonding need, and any hazardous-area classification. Final selection must use the gland manufacturer's certified range and installation instructions."
        ],
        links: [
          { label: "Cable Size Calculator", href: "/cable-size-calculator/" },
          { label: "Contact VIOX", href: "https://viox.com/contact" }
        ]
      }
    ]
  },
  "busbar-current-rating-calculator": {
    sections: [
      {
        title: "How to estimate busbar current rating",
        paragraphs: [
          "This calculator multiplies busbar width and thickness to find cross-sectional area, then applies a selected current-density reference, material factor, and installation derating. It is a preliminary thermal estimate rather than a certified busbar rating."
        ],
        steps: [
          "Enter bar width and thickness.",
          "Select copper or aluminum.",
          "Choose a justified current-density reference.",
          "Apply an enclosure or installation derating factor.",
          "Verify temperature rise, joints, spacing, supports, harmonics, and short-circuit withstand."
        ]
      },
      {
        title: "Busbar current calculation example",
        paragraphs: [
          "A 30 mm × 5 mm copper bar has a 150 mm² cross-section. At a 1.2 A/mm² reference and 80% derating, the simplified estimate is 144 A."
        ],
        callouts: [
          "A = 30 × 5 = 150 mm²",
          "I = 150 × 1.2 × 1.00 × 0.80 = 144 A"
        ],
        table: {
          headers: ["Input or result", "Value"],
          rows: [
            ["Busbar", "30 mm × 5 mm copper"],
            ["Cross-section", "150 mm²"],
            ["Current-density reference", "1.2 A/mm²"],
            ["Derating", "80%"],
            ["Estimated current", "144 A"]
          ]
        }
      },
      {
        title: "Copper vs. aluminum busbar",
        paragraphs: [
          "Copper and aluminum differ in conductivity, density, thermal expansion, joint behavior, plating needs, and mechanical strength. The calculator's material factor is only a planning approximation; final dimensions should follow tested assemblies, manufacturer design data, or a validated thermal model."
        ],
        table: {
          headers: ["Selection factor", "Why it matters"],
          rows: [
            ["Conductivity", "Changes resistance and heat generation"],
            ["Joint design", "Controls contact resistance and long-term stability"],
            ["Mass and support", "Affects enclosure structure and mechanical loading"],
            ["Surface treatment", "Can affect oxidation control and connection performance"]
          ]
        }
      },
      {
        title: "Why enclosure conditions change busbar ampacity",
        paragraphs: [
          "Temperature rise depends on ambient temperature, ventilation, bar orientation, spacing, number of bars per phase, enclosure size, nearby heat sources, joints, and harmonic current. A current-density shortcut cannot capture all of these effects."
        ]
      },
      {
        title: "Busbar short-circuit withstand is a separate check",
        paragraphs: [
          "Normal-current thermal capacity does not prove short-circuit performance. The assembly must withstand short-time thermal stress and peak electrodynamic force, with suitable supports, spacing, connections, and coordination with the protective device."
        ],
        links: [
          { label: "Short Circuit Current Calculator", href: "/short-circuit-current-calculator/" },
          { label: "Circuit Breaker Size Calculator", href: "/circuit-breaker-size-calculator/" },
          { label: "Transformer Sizing Calculator", href: "/transformer-sizing-calculator/" }
        ]
      }
    ]
  }
};
