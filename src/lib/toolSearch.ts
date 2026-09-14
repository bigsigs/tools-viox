export type SearchableTool = {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  keywords: string[];
  categoryTitle: string;
};

const aliases: Record<string, string[]> = {
  "voltage-drop-calculator": ["vd", "voltage loss", "cable voltage drop", "caida de tension", "caida de voltaje"],
  "dc-voltage-drop-calculator": ["dc vd", "battery cable voltage loss", "caida de tension cc"],
  "cable-size-calculator": ["wire size", "conductor size", "mm2", "mm²", "seccion de cable", "tamano de conductor"],
  "awg-wire-size-calculator": ["wire gauge", "american wire gauge"],
  "mm2-to-awg-converter": ["mm2 awg", "metric wire conversion", "wire gauge conversion"],
  "circuit-breaker-size-calculator": ["breaker", "breaker size", "mcb", "mccb", "circuit protection", "disyuntor", "interruptor automatico"],
  "short-circuit-current-calculator": ["fault current", "ka", "transformer fault", "corriente de falla", "cortocircuito"],
  "spd-calculator": ["surge", "lightning", "surge protective device", "sobretension", "rayo"],
  "advanced-spd-selection-calculator": ["surge protection", "spd type", "type 1 type 2"],
  "fuse-sizing-calculator": ["fuse", "fuse size", "gg", "am", "gpv", "fusible"],
  "ohms-law-calculator": ["ohm", "voltage current resistance", "vir", "v i r", "ley de ohm", "resistencia"],
  "watts-amps-volts-calculator": ["watts amps", "amps volts", "power current"],
  "kw-kva-amp-calculator": ["kw amps", "kva amps", "power conversion"],
  "power-factor-correction-calculator": ["power factor", "capacitor bank", "kvar"],
  "motor-current-calculator": ["motor amps", "flc", "fla", "corriente de motor", "amperios motor"],
  "vfd-sizing-protection-calculator": ["drive", "variable frequency drive", "inverter drive"],
  "ev-charger-load-calculator": ["evse", "car charger", "charger current", "cargador vehiculo electrico"],
  "cable-gland-size-calculator": ["gland", "cable entry", "metric gland", "npt gland", "prensaestopas"],
  "pv-string-sizing-calculator": ["solar string", "module string", "mppt", "cadena fotovoltaica"],
  "grounding-resistance-calculator": ["earthing", "earth resistance", "ground rod", "puesta a tierra", "resistencia de tierra"],
  "clearance-creepage-calculator": ["creepage", "clearance", "insulation distance", "distancia de fuga", "distancia de aislamiento"],
  "nema-ip-rating-converter": ["ip rating", "nema rating", "enclosure rating"]
};

export const popularToolSlugs = [
  "voltage-drop-calculator",
  "cable-size-calculator",
  "circuit-breaker-size-calculator",
  "ohms-law-calculator",
  "spd-calculator",
  "kw-kva-amp-calculator"
];

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/²/g, "2")
    .replace(/[^a-zA-Z0-9%]+/g, " ")
    .trim()
    .toLowerCase();
}

function editDistanceAtMostOne(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return false;
  if (left.length === right.length) {
    const mismatches = [...left].reduce<number[]>((items, character, index) => character === right[index] ? items : [...items, index], []);
    if (mismatches.length === 2) {
      const [first, second] = mismatches;
      if (second === first + 1 && left[first] === right[second] && left[second] === right[first]) return true;
    }
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) i += 1;
    else if (right.length > left.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + Number(i < left.length || j < right.length) <= 1;
}

function fieldScore(field: string, token: string, weight: number) {
  if (!field) return 0;
  if (field === token) return weight + 28;
  if (field.startsWith(token)) return weight + 18;
  if (field.split(" ").some((word) => word.startsWith(token))) return weight + 12;
  if (field.includes(token)) return weight;
  if (token.length >= 4 && field.split(" ").some((word) => editDistanceAtMostOne(word, token))) return Math.round(weight * 0.55);
  return 0;
}

export function searchTools(tools: SearchableTool[], query: string, limit = 6) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return popularToolSlugs
      .map((slug) => tools.find((tool) => tool.slug === slug))
      .filter((tool): tool is SearchableTool => Boolean(tool))
      .slice(0, limit);
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return tools
    .map((tool, index) => {
      const title = normalizeSearchText(tool.title);
      const shortTitle = normalizeSearchText(tool.shortTitle ?? "");
      const keywordText = normalizeSearchText(tool.keywords.join(" "));
      const description = normalizeSearchText(tool.description);
      const category = normalizeSearchText(tool.categoryTitle);
      const aliasText = normalizeSearchText((aliases[tool.slug] ?? []).join(" "));
      const searchable = [title, shortTitle, keywordText, description, category, aliasText].join(" ");
      if (!tokens.every((token) => searchable.includes(token) || (token.length >= 4 && searchable.split(" ").some((word) => editDistanceAtMostOne(word, token))))) {
        return { tool, index, score: 0 };
      }

      let score = title === normalizedQuery ? 600 : title.startsWith(normalizedQuery) ? 430 : 0;
      const popularIndex = popularToolSlugs.indexOf(tool.slug);
      if (popularIndex >= 0) score += 60 - popularIndex * 8;
      if (shortTitle === normalizedQuery) score += 520;
      if (aliasText.split(" ").includes(normalizedQuery)) score += 480;
      for (const token of tokens) {
        score += fieldScore(title, token, 120);
        score += fieldScore(shortTitle, token, 105);
        score += fieldScore(aliasText, token, 95);
        score += fieldScore(keywordText, token, 58);
        score += fieldScore(category, token, 30);
        score += fieldScore(description, token, 18);
      }
      return { tool, index, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ tool }) => tool);
}
