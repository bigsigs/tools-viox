import type { ToolDefinition } from "./types";

export const site = {
  name: "VIOX Electrical Tools",
  origin: "https://tools.viox.com",
  description: "VIOX Electrical Tools provides browser-based reference calculators for low-voltage protection, cable sizing, voltage drop, motor current, EV charging, and surge protection selection work.",
  logo: "https://viox.com/wp-content/uploads/2021/05/VIOX-NEW-LOGO.png"
};

export function toolTitle(tool: ToolDefinition) {
  return `${tool.title} | VIOX Electrical Tools`;
}

export function toolUrl(tool: ToolDefinition) {
  return `${site.origin}/${tool.slug}/`;
}

export function softwareSchema(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "EngineeringApplication",
    operatingSystem: "Web",
    url: toolUrl(tool),
    description: tool.description,
    publisher: {
      "@type": "Organization",
      name: "VIOX",
      url: "https://viox.com/",
      logo: site.logo
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
