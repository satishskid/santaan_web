# Image optimization workflow (quality-safe)

This project uses Next.js image optimization and should keep images sharp while reducing transfer size.

## Core rules

- Keep source quality high; optimize delivery format and dimensions.
- Prefer AVIF/WebP for photos and complex illustrations.
- Prefer SVG for logos and icons.
- Avoid shipping large PNGs unless they are truly transparent UI assets.

## Quality-safe pipeline (recommended)

1. Start with an original high-quality image (the “source of truth”).
2. Export two derivatives:
   - `*.avif` for best compression.
   - `*.webp` as a strong fallback.
3. Keep visual quality high:
   - Photos: target AVIF/WebP quality around 70–85 depending on content.
   - Logos: SVG if possible; otherwise lossless WebP or a very small PNG.
4. Use `next/image` whenever possible:
   - Provide correct `sizes` so mobile downloads smaller variants.
   - Use `priority` only for the single LCP image on a page.

## Guardrails in this repo

Run:

- `npm run assets:check`
- `npm run assets:check:strict` (CI / pre-release)

The non-strict check reports oversize files. The strict variant fails if files in `public/assets` exceed thresholds. The goal is to prevent accidental 1–7MB images from being merged.

## How to update thresholds

Edit `src/scripts/check-public-assets.mjs`.

## Visual QA checklist

- Compare old vs new image on mobile and desktop:
  - Check faces, text edges, and gradients for banding.
  - Check for blocking artifacts in backgrounds.
- Ensure the image still looks good at the *actual* rendered size.
- Confirm the page’s LCP element is sharp and loads quickly.
