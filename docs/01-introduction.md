# Introduction to mini-astro

## What is mini-astro

**mini-astro** is a static site generator (SSG) inspired by [Astro](https://astro.build), aimed at very simple sites. It produces static HTML from:

- Pages in `src/pages/` (file-based routing)
- Components organized by **Atomic Design** (atoms, molecules, organisms)
- Templates with slot and variables
- Global data in `src/data/`

There is no JS/CSS bundling: the build only resolves HTML (frontmatter, layouts, includes), injects the CSP meta and copies `public/` to the output. The result is static files you can deploy on any host.

## Pillars

1. **Security by default**  
   `{{ }}` output is HTML-escaped and the build injects a strict CSP `<meta>` (configurable with `security.csp`). The scaffold can add a cookie consent banner and policy pages (chosen at `create`/`init`).

2. **Speed**  
   No heavy compilation: the build is fast and the dev server starts quickly. Goal: sites with dozens of pages in seconds.

3. **Atomic Design**  
   Default structure: atoms → molecules → organisms → templates → pages. See [Atomic Design](04-atomic-design.md).

## Main features

| Feature | Description |
|--------|-------------|
| File-based routing | Each `src/pages/*.html` (and subfolders) becomes a route. |
| Frontmatter | YAML between `---` at the start of each page (layout, title, etc.). |
| Components | `<mini-include src="Name" />` with optional props; they see the page context plus their props. |
| Templates | Layouts with `<slot />` and variables `{{ title }}`, `{{ site.key }}`. |
| Escaping | `{{ var }}` is HTML-escaped; `{{{ var }}}` inserts raw HTML. |
| Default landing | Home page “Hello humans” with modern theme (Orbitron, DM Sans, dark) and `public/css/theme.css`. |
| Package manager | In `init` you choose **pnpm** (default), **yarn** or **npm**; the project is set up for the chosen one. |
| Global data | Files in `src/data/` (`*.json`, `*.js`, `*.mjs`) exposed as `site` in the context. |
| CSP | Injected by the build into every page (`security.csp`). |
| Cookies / policies | Consent bar (clear Accept) and policy pages, chosen when the project is created. |
| Dev server | HTTP server over `dist/`, watch on sources, data, `public/` and config, live reload (with chokidar). |

## Limitations

- No dynamic routes (`[slug].html`).
- No Markdown/MDX; HTML only.
- No “islands” or framework hydration.
- No conditionals or loops in the template language; “loops” are done by repeating `<mini-include>` with different props.

## Requirements

- **Node.js** ≥ 18
- CLI usage: `npx github:ivansantander-hub/mini-astro` or global/local package installation

## Next step

- [Architecture](02-architecture.md) — How the package is built internally.
