import { describe, expect, it } from "vitest";
import { categories } from "./categories";
import { site, toolDescription, toolTitle } from "./seo";
import { seoGuidesBySlug } from "./seoGuides";
import { tools } from "./tools";
import { vioxResourcesByTool } from "./vioxResources";

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

    for (const tool of tools) {
      expect(toolTitle(tool), tool.slug).not.toBe(`${tool.title} | VIOX Electrical Tools`);
    }

    expect(site.description.length).toBeGreaterThanOrEqual(110);
    expect(site.description.length).toBeLessThanOrEqual(165);
  });

  it("gives every calculator contextual VIOX article and product links", () => {
    expect(Object.keys(vioxResourcesByTool).sort()).toEqual(tools.map((tool) => tool.slug).sort());

    for (const tool of tools) {
      const resources = vioxResourcesByTool[tool.slug];
      expect(resources.articles.length, `${tool.slug}: articles`).toBeGreaterThan(0);
      expect(resources.products.length, `${tool.slug}: products`).toBeGreaterThan(0);

      for (const link of [...resources.articles, ...resources.products]) {
        expect(link.href, `${tool.slug}: ${link.label}`).toMatch(/^https:\/\/viox\.com\//);
        expect(link.href, `${tool.slug}: ${link.label}`).not.toBe("https://viox.com/contact");
        expect(link.label.length, tool.slug).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it("provides unique category metadata and useful hub copy", () => {
    const categoryList = Object.values(categories);
    expect(new Set(categoryList.map((category) => category.seoTitle)).size).toBe(categoryList.length);
    expect(new Set(categoryList.map((category) => category.seoDescription)).size).toBe(categoryList.length);

    for (const category of categoryList) {
      expect(category.seoTitle.length, category.slug).toBeGreaterThanOrEqual(30);
      expect(category.seoTitle.length, category.slug).toBeLessThanOrEqual(65);
      expect(category.seoDescription.length, category.slug).toBeGreaterThanOrEqual(110);
      expect(category.seoDescription.length, category.slug).toBeLessThanOrEqual(165);
      expect(category.overview.length, category.slug).toBeGreaterThanOrEqual(2);
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
