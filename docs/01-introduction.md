# Introduction to mini-astro

## What is mini-astro

**mini-astro** is a static site generator (SSG) inspired by [Astro](https://astro.build), aimed at very simple sites. It produces static HTML from:

- Pages in `src/pages/` (file-based routing)
- Components organized by **Atomic Design** (atoms, molecules, organisms)
- Templates with slot and variables
- Global data in `src/data/`

There is no JS/CSS bundling: the build only resolves HTML (frontmatter, layouts, includes) and copies `public/` to the output. The result is static files you can deploy on any host.

## Pillars

1. **Security by default**  
   Strict cookie options (consent banner), CSP and policy pages. All can be relaxed or disabled in configuration.

2. **Speed**  
   No heavy compilation: the build is fast and the dev server starts quickly. Goal: sites with dozens of pages in seconds.

3. **Atomic Design**  
   Default structure: atoms → molecules → organisms → templates → pages. See [Atomic Design](04-atomic-design.md).

## Main features

| Feature | Description |
|--------|-------------|
| File-based routing | Each `src/pages/*.html` (and subfolders) becomes a route. |
| Frontmatter | YAML between `---` at the start of each page (layout, title, etc.). |
| Components | `<mini-include src="Name" />` with optional props. |
| Templates | Layouts with `<slot />` and variables `{{ title }}`, `{{ site.key }}`. |
| Default landing | Home page “Hello humans” with modern theme (Syne, DM Sans, dark) and `public/css/theme.css`. |
| Package manager | In `init` you choose **pnpm** (default), **yarn** or **npm**; the project is set up for the chosen one. |
| Global data | Files in `src/data/*.json` exposed as `site` in the context. |
| Cookies / CSP | Consent bar (clear Accept) and policy pages; configurable. |
| Dev server | HTTP server over `dist/`, watch on `src/` and live reload (with chokidar). |

## Limitations (v1)

- No dynamic routes (`[slug].html`).
- No Markdown/MDX; HTML only.
- No “islands” or framework hydration.
- No conditionals or loops in the template language; “loops” are done by repeating `<mini-include>` with different props.

## Requirements

- **Node.js** ≥ 18
- CLI usage: `npx mini-astro` or global/local package installation

## Next step

- [Architecture](02-architecture.md) — How the package is built internally.
