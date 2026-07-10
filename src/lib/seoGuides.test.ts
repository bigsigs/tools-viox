import { describe, expect, it } from "vitest";
import { toolDescription, toolTitle } from "./seo";
import { seoGuidesBySlug } from "./seoGuides";
import { tools } from "./tools";

describe("calculator SEO guides", () => {
  it("provides a substantial guide for every calculator", () => {
    for (const tool of tools) {
      const guide = seoGuidesBySlug[tool.slug];

      expect(guide, tool.slug).toBeDefined();
      expect(guide.sections.length, tool.slug).toBeGreaterThanOrEqual(4);

      for (const section of guide.sections) {
        expect(section.title, tool.slug).toBeTruthy();
        expect(section.paragraphs.length, `${tool.slug}: ${section.title}`).toBeGreaterThan(0);
      }
    }
  });

  it("uses unique, useful titles and meta descriptions", () => {
    const titles = tools.map(toolTitle);
    const descriptions = tools.map(toolDescription);

    expect(new Set(titles).size).toBe(tools.length);
    expect(new Set(descriptions).size).toBe(tools.length);

    for (const title of titles) {
      expect(title.length, title).toBeGreaterThanOrEqual(30);
      expect(title.length, title).toBeLessThanOrEqual(65);
    }

    for (const description of descriptions) {
      expect(description.length, description).toBeGreaterThanOrEqual(110);
      expect(description.length, description).toBeLessThanOrEqual(165);
    }
  });

  it("only links to existing internal calculator routes", () => {
    const routes = new Set(tools.map((tool) => `/${tool.slug}/`));

    for (const [slug, guide] of Object.entries(seoGuidesBySlug)) {
      for (const section of guide.sections) {
        for (const link of section.links ?? []) {
          if (link.href.startsWith("/")) {
            expect(routes.has(link.href), `${slug}: ${link.href}`).toBe(true);
          }
        }
      }
    }
  });
});
