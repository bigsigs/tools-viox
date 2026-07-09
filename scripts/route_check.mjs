import { existsSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const routes = [
  "index.html",
  "spd-calculator/index.html",
  "voltage-drop-calculator/index.html",
  "cable-size-calculator/index.html",
  "conduit-fill-calculator/index.html",
  "dc-voltage-drop-calculator/index.html",
  "awg-wire-size-calculator/index.html",
  "circuit-breaker-size-calculator/index.html",
  "transformer-sizing-calculator/index.html",
  "short-circuit-current-calculator/index.html",
  "kw-kva-amp-calculator/index.html",
  "three-phase-current-calculator/index.html",
  "motor-current-calculator/index.html",
  "ev-charger-load-calculator/index.html",
  "cable-gland-size-calculator/index.html",
  "busbar-current-rating-calculator/index.html",
  "category/surge-protection/index.html",
  "category/circuit-protection/index.html",
  "category/cable-wiring/index.html",
  "category/motor-control/index.html",
  "category/ev-charging/index.html",
  "category/power-conversion/index.html",
  "category/panel-design/index.html",
  "embed/spd-calculator/index.html",
  "embed/voltage-drop-calculator/index.html",
  "embed/cable-size-calculator/index.html",
  "embed/conduit-fill-calculator/index.html",
  "embed/dc-voltage-drop-calculator/index.html",
  "embed/awg-wire-size-calculator/index.html",
  "embed/circuit-breaker-size-calculator/index.html",
  "embed/transformer-sizing-calculator/index.html",
  "embed/short-circuit-current-calculator/index.html",
  "embed/kw-kva-amp-calculator/index.html",
  "embed/three-phase-current-calculator/index.html",
  "embed/motor-current-calculator/index.html",
  "embed/ev-charger-load-calculator/index.html",
  "embed/cable-gland-size-calculator/index.html",
  "embed/busbar-current-rating-calculator/index.html",
  "robots.txt"
];

const missing = routes.filter((route) => !existsSync(join(dist, route)));

if (missing.length > 0) {
  console.error("Missing built routes:");
  for (const route of missing) console.error(`- ${route}`);
  process.exit(1);
}

console.log(`Route check passed: ${routes.length} routes found.`);
