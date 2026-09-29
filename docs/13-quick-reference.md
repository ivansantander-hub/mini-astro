# Quick reference

## Syntax

| Element | Syntax | Example |
|--------|--------|---------|
| Variable (escaped) | `{{ key }}` or `{{ site.file.prop }}` | `{{ title }}`, `{{ site.site.description }}` |
| Raw HTML | `{{{ key }}}` | `{{{ site.snippets.banner }}}` (trusted values only) |
| Slot (template only, required) | `<slot />` or `<!-- @slot -->` | Single substitution per template |
| Component | `<mini-include src="Name" />` or `<mini-include src="Name"></mini-include>` | `<mini-include src="Card" title="Hello" />` |
| Component in specific layer | `src="layer/Name"` | `<mini-include src="organisms/Header" />` |
| Component relative to file | `src="./Name"` / `src="../layer/Name"` | `<mini-include src="../atoms/Icon" />` |
| Prop from context | `attr="{{ var }}"` | `<mini-include src="NavLink" href="{{ base }}/about" />` |
| Frontmatter | `---` / `key: value` / `---` | `layout: Base`, `title: Page` |

- Context: template frontmatter (defaults) < page frontmatter < `site`; components add their attributes on top.
- Undefined variable → empty string; objects/arrays → JSON. Names: letters, digits, `_`, `-`, `.`.

## Folder structure (src/)

```
src/
  quarks/      → design tokens (not includable)
  atoms/       → minimal components
  molecules/   → small components
  organisms/   → page blocks
  templates/   → layouts (Base.html, etc.)
  pages/       → file-based routing (x.html → dist/x/index.html; x/index.html → dist/x/index.html)
  data/        → *.json, *.js, *.mjs → site.fileName
```

## Config (mini-astro.config.js)

- `srcDir` (`'src'`), `outDir` (`'dist'`), `dataDir` (`'src/data'`), `dev.port` (`2323`, `PORT` env overrides), `security.csp` (`true` | policy string | `false`).
- Deep-merged with defaults and validated; a config that fails to load or is invalid stops the build.

## Common commands

From GitHub (not on npm):

```bash
npx github:ivansantander-hub/mini-astro init
npx github:ivansantander-hub/mini-astro create my-site
npx github:ivansantander-hub/mini-astro build
npx github:ivansantander-hub/mini-astro dev
npx github:ivansantander-hub/mini-astro route blog/post
npx github:ivansantander-hub/mini-astro add page contact
npx github:ivansantander-hub/mini-astro component Card
npx github:ivansantander-hub/mini-astro component Header organism
```

After creating the project: `pnpm install` (or yarn/npm) and `pnpm dev`. **pnpm** is the default; in `init` you can choose yarn or npm.

## URLs and server

- Routes: one per file in `src/pages/`; output in `dist/` as `<route>/index.html` (e.g. `cookies.html` → `dist/cookies/index.html` → URL `/cookies`; `blog/index.html` → `dist/blog/index.html` → `/blog`). Root `/` is `dist/index.html`. See [05b-clean-urls.md](05b-clean-urls.md).
- Two pages with the same output (`blog.html` + `blog/index.html`) → build error.
- Stale files from the previous build are removed (tracked in `.mini-astro/manifest.json`).

## Build errors

Invalid config, invalid data file, component not found, circular include, explicit `layout` not found, template without slot, route collision.

## Limitations

- No dynamic routes (`[slug].html`).
- No Markdown/MDX.
- No conditionals or loops in templates.
- One `<slot />` per template (only the first occurrence is replaced).
- Components: maximum depth 20 for nested `<mini-include>`.
- Data: only files directly in `dataDir` (no subfolders).
