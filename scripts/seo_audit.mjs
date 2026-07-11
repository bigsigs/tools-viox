import fs from "node:fs";
import path from "node:path";

const root = "dist";
const issues = [];
const sitemap = fs.readFileSync(path.join(root, "sitemap-0.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const titles = [];
const descriptions = [];

function fileFor(pathname) {
  if (pathname === "/") return path.join(root, "index.html");
  if (/\.[a-z0-9]+$/i.test(pathname)) return path.join(root, pathname.slice(1));
  return path.join(root, pathname.slice(1).replace(/\/$/, ""), "index.html");
}

for (const url of urls) {
  const pathname = new URL(url).pathname;
  const file = fileFor(pathname);
  if (!fs.existsSync(file)) {
    issues.push(`${pathname}: sitemap target is missing`);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="(.*?)"/s)?.[1] ?? "";
  const canonical = html.match(/<link rel="canonical" href="(.*?)"/s)?.[1] ?? "";
  titles.push([pathname, title]);
  descriptions.push([pathname, description]);

  if ((html.match(/<h1[ >]/g) ?? []).length !== 1) issues.push(`${pathname}: expected one H1`);
  if (canonical !== url) issues.push(`${pathname}: canonical does not match sitemap URL`);
  if (title.length < 30 || title.length > 65) issues.push(`${pathname}: title length is ${title.length}`);
  if (description.length < 110 || description.length > 165) issues.push(`${pathname}: description length is ${description.length}`);
  if (html.includes("noindex")) issues.push(`${pathname}: noindex URL appears in sitemap`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch {
      issues.push(`${pathname}: invalid JSON-LD`);
    }
  }
}

function duplicates(rows) {
  return rows.filter((row, index) => rows.findIndex((candidate) => candidate[1] === row[1]) !== index);
}

if (duplicates(titles).length) issues.push("Indexable pages contain duplicate titles");
if (duplicates(descriptions).length) issues.push("Indexable pages contain duplicate descriptions");

const embedRoot = path.join(root, "embed");
const embedSlugs = fs.readdirSync(embedRoot);
for (const slug of embedSlugs) {
  const html = fs.readFileSync(path.join(embedRoot, slug, "index.html"), "utf8");
  if (!html.includes('<meta name="robots" content="noindex, follow"')) issues.push(`/embed/${slug}/: missing noindex`);
  if (!html.includes(`https://tools.viox.com/${slug}/`)) issues.push(`/embed/${slug}/: missing full-page canonical`);
}

const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1].split("#")[0].split("?")[0];
    if (!href || href.startsWith("/_astro/")) continue;
    if (!fs.existsSync(fileFor(href))) issues.push(`${file}: broken internal link ${href}`);
  }
}

const uniqueIssues = [...new Set(issues)];
console.log(`SEO audit: ${urls.length} indexable URLs, ${embedSlugs.length} noindex embeds, ${htmlFiles.length} HTML pages.`);

if (uniqueIssues.length) {
  console.error(uniqueIssues.join("\n"));
  process.exit(1);
}

console.log("SEO audit passed: metadata, canonicals, sitemap, JSON-LD, H1s, and internal links are valid.");
