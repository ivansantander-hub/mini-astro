# Pages and routing

mini-astro uses **file-based routing**: each HTML file in `src/pages/` (and its subfolders) becomes a route on the site.

## Route rules and build output (clean URLs)

The build produces **clean URLs** without `.html` in the browser bar:

| Source | Output in dist | URL |
|--------|----------------|-----|
| `src/pages/index.html` | `dist/index.html` | `/` |
| `src/pages/cookies.html` | `dist/cookies/index.html` | `/cookies` or `/cookies/` |
| `src/pages/blog/index.html` | `dist/blog/index.html` | `/blog` or `/blog/` |
| `src/pages/blog/post.html` | `dist/blog/post/index.html` | `/blog/post` or `/blog/post/` |

Every page that is not already an `index.html` is written as **`<route>/index.html`** (directory index resolution). A file named `index.html` in any folder keeps its path (`blog/index.html` → `dist/blog/index.html`). So you navigate to `/cookies` instead of `/cookies.html`. The dev server and most static hosts (Nginx, Apache, Netlify, Vercel) serve that URL correctly.

Two pages that build to the same output are a **build error** — for example `src/pages/blog.html` and `src/pages/blog/index.html` (both → `dist/blog/index.html`). Keep only one of them.

There are no dynamic routes (`[slug].html`). Links generated in the scaffold point to clean routes (e.g. `/cookies`, `/privacy`).

For the concept behind this (directory index, server), see [Clean URLs and server resolution](05b-clean-urls.md).

## Page structure

Each page can have:

1. **Frontmatter** (optional): block between `---` lines at the start.
2. **Body**: the HTML that is injected into the layout’s `<slot />`.

Example:

```html
---
layout: Base
title: My page
---
<main>
  <h1>{{ title }}</h1>
  <p>Page content.</p>
</main>
```

- `layout` indicates which template from `src/templates/` to use. If omitted, **Base** is used when `src/templates/Base.html` exists; otherwise the page is output as-is (no template). A `layout` that does not exist is a build error.
- `title` (and any other key) is added to the context and can be used in the template, the body and included components with `{{ title }}`, `{{ site.xxx }}`, etc.

## Frontmatter

- **Format**: `key: value` lines between an opening `---` (first non-blank line of the file) and a closing line that is exactly `---`. Value is trimmed; if wrapped in matching single or double quotes, quotes are removed. Blank lines and lines starting with `#` are ignored. Keys may contain letters, digits, `_` and `-`.
- **Usage**: all frontmatter keys are available in the page context (template + body + included components). The `site` object (data from `src/data/`) is also injected into the context.
- No special types: everything is string in frontmatter; numbers or booleans in `data/` JSON remain in `site`.

## Context

A single context is used to render the page body, its template and every component:

1. **Template frontmatter** — defaults (e.g. a default `description`).
2. **Page frontmatter** — overrides the template defaults.
3. **`site`** — data from `dataDir` (always wins for the key `site`).

Components also receive their own attributes on top of that context (attributes override). See [Components](06-components.md).

## Processing order (summary)

1. Frontmatter is parsed and the body is obtained.
2. The template indicated by `layout` (default Base) is loaded and the context is built (template frontmatter < page frontmatter < `site`).
3. The page body is rendered: `{{ }}`, `{{{ }}}` and `<mini-include>` are resolved in a single pass.
4. The template body is rendered the same way.
5. `<slot />` (or `<!-- @slot -->`) in the rendered template is replaced by the rendered page body.
6. The CSP `<meta>` is added (per `security.csp`).
7. The final HTML is written to `dist/<route>/index.html` (or `dist/index.html` for the root).

Rendered output is never scanned again, so `{{ }}` that appears inside a data value or in the page body after insertion is not evaluated twice.

## Build requirements

- The directory `src/pages/` must exist (from `srcDir` + `pages`).
- Every template used must contain `<slot />` or `<!-- @slot -->`; otherwise the build fails.

## Stale output

The build records every file it writes (pages and copied `public/` files) in `.mini-astro/manifest.json` at the project root. On the next build, files listed there that were not written again (a renamed or deleted page, a removed public file) are deleted, along with directories left empty. Files mini-astro did not write are never touched. If `outDir` changes, the old output directory is left alone. The first build without a manifest removes nothing.

## Next step

- [Clean URLs and server resolution](05b-clean-urls.md) — Why some URLs omit `.html` and how server resolution works.
- [Components](06-components.md) — Using `<mini-include>` and props.
