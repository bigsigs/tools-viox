import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const expectedCategories = new Set(["electrical-fundamentals", "solar-storage", "surge-protection", "circuit-protection", "cable-wire", "cable-management", "motor-control", "ev-charging", "power-distribution"]);

if (!existsSync(join(dist, "index.html")) || !existsSync(join(dist, "robots.txt"))) {
  console.error("Build output is missing index.html or robots.txt. Run npm run build first.");
  process.exit(1);
}

const directories = readdirSync(dist, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const nonRouteDirectories = new Set(["category", "embed", "images"]);
const toolSlugs = directories.filter((name) => !name.startsWith("_") && !nonRouteDirectories.has(name));
const categorySlugs = readdirSync(join(dist, "category"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const embedSlugs = readdirSync(join(dist, "embed"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const missingHtml = [...toolSlugs.map((slug) => `${slug}/index.html`), ...categorySlugs.map((slug) => `category/${slug}/index.html`), ...embedSlugs.map((slug) => `embed/${slug}/index.html`)].filter((route) => !existsSync(join(dist, route)));
const missingEmbeds = toolSlugs.filter((slug) => !embedSlugs.includes(slug));
const unexpectedCategories = categorySlugs.filter((slug) => !expectedCategories.has(slug));
const missingCategories = [...expectedCategories].filter((slug) => !categorySlugs.includes(slug));

if (!toolSlugs.length || toolSlugs.length !== embedSlugs.length || categorySlugs.length !== 9 || missingHtml.length || missingEmbeds.length || unexpectedCategories.length || missingCategories.length) {
  console.error("Route verification failed:", { toolCount: toolSlugs.length, embedCount: embedSlugs.length, categoryCount: categorySlugs.length, missingHtml, missingEmbeds, unexpectedCategories, missingCategories });
  process.exit(1);
}

console.log(`Route check passed: ${toolSlugs.length} calculators, ${embedSlugs.length} embeds, and ${categorySlugs.length} category pages found.`);
