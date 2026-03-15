# Quick reference

## Syntax

| Element | Syntax | Example |
|--------|--------|---------|
| Variable | `{{ key }}` or `{{ site.file.prop }}` | `{{ title }}`, `{{ site.site.description }}` |
| Slot (template only) | `<slot />` or `<!-- @slot -->` | Single substitution per template |
| Component | `<mini-include src="Name" />` with optional props | `<mini-include src="Card" title="Hello" />` |
| Component in specific layer | `src="layer/Name"` | `<mini-include src="organisms/Header" />` |
| Frontmatter | `---` / `key: value` / `---` | `layout: Base`, `title: Page` |

## Folder structure (src/)

```
src/
  atoms/       → minimal components
  molecules/   → small components
  organisms/   → page blocks
  templates/   → layouts (Base.html, etc.)
  pages/       → file-based routing (*.html → dist/<route>/index.html; clean URLs without .html)
  data/        → *.json → site.fileName
```

## Config (mini-astro.config.js)

- `srcDir`, `outDir`, `dataDir`, `atomicDesign`, `cookies.strict`, `security.csp`, `security.policyPages`, `dev.port`.

## Common commands

From GitHub (not on npm):

```bash
npx github:ivansantander-hub/mini-astro init
npx github:ivansantander-hub/mini-astro create my-site
npx github:ivansantander-hub/mini-astro build
npx github:ivansantander-hub/mini-astro dev
npx github:ivansantander-hub/mini-astro route blog/post
npx github:ivansantander-hub/mini-astro component Card
npx github:ivansantander-hub/mini-astro component Header organism
```

After creating the project: `pnpm install` (or yarn/npm) and `pnpm dev`. **pnpm** is the default; in `init` you can choose yarn or npm.

## URLs and server

- Routes: one per file in `src/pages/`; output in `dist/` as `<route>/index.html` (e.g. `cookies.html` → `dist/cookies/index.html` → URL `/cookies`). Root `/` is `dist/index.html`. See [05b-clean-urls.md](05b-clean-urls.md).

## Limitations

- No dynamic routes (`[slug].html`).
- No Markdown/MDX.
- One `<slot />` per template (only the first occurrence is replaced).
- Components: maximum depth 20 for nested `<mini-include>`.
- Data: JSON only in `data/`; no `data.js`.
