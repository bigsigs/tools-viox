# VIOX Electrical Tools

Static Astro site for `tools.viox.com`, with electrical calculators for preliminary low-voltage product selection and WordPress-friendly embed pages.

## Stack

- Astro static output
- React calculator islands
- TypeScript
- Vitest
- Cloudflare Pages

## Local Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run smoke:routes
```

## Cloudflare Pages

Use these build settings:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank when the repository root contains `package.json`
- Environment variable, only if the build image needs it: `NODE_VERSION=22`

## Custom Domain

After the first Pages deployment is created, add `tools.viox.com` as a custom domain in Cloudflare Pages.

Typical DNS record:

- Type: `CNAME`
- Name: `tools`
- Target: the Pages hostname, usually `tools-viox.pages.dev`
- Proxy status: Proxied
- TTL: Auto

Use the exact Pages hostname shown by Cloudflare if it differs.

## WordPress Embeds

Every calculator has a clean embed route that removes the full site header and footer:

```html
<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);">
  <iframe
    src="https://tools.viox.com/embed/spd-calculator/"
    width="100%"
    height="760"
    loading="lazy"
    frameborder="0"
    style="display:block;width:100%;border:0;">
  </iframe>
</div>
```

Change the slug for other tools, for example `/embed/voltage-drop-calculator/`.

## Notes

Calculator results are preliminary engineering references only. Final product selection must follow local codes, applicable standards, manufacturer data, and qualified engineering review.
