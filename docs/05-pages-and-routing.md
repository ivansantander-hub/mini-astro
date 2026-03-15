# Pages and routing

mini-astro uses **file-based routing**: each HTML file in `src/pages/` (and its subfolders) becomes a route on the site.

## Route rules and build output (clean URLs)

The build produces **clean URLs** without `.html` in the browser bar:

| Source | Output in dist | URL |
|--------|----------------|-----|
| `src/pages/index.html` | `dist/index.html` | `/` |
| `src/pages/cookies.html` | `dist/cookies/index.html` | `/cookies` or `/cookies/` |
| `src/pages/blog/post.html` | `dist/blog/post/index.html` | `/blog/post` or `/blog/post/` |

Every non-root page is written as **`<route>/index.html`** (directory index resolution). So you navigate to `/cookies` instead of `/cookies.html`. The dev server and most static hosts (Nginx, Apache, Netlify, Vercel) serve that URL correctly.

There are no dynamic routes (`[slug].html`). Links generated in the scaffold point to clean routes (e.g. `/cookies`, `/privacy`).

For the concept behind this (directory index, server), see [Clean URLs and server resolution](05b-clean-urls.md).

## Page structure

Each page can have:

1. **Frontmatter** (optional): YAML block between `---` at the start.
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

- `layout` indicates which template from `src/templates/` to use. If omitted, **Base** is used.
- `title` (and any other key) is added to the context and can be used in the template or body with `{{ title }}`, `{{ site.xxx }}`, etc.

## Frontmatter

- **Format**: `key: value` lines between the first `---` and the second `---`. Value is trimmed; if wrapped in single or double quotes, quotes are removed.
- **Usage**: all frontmatter keys are available in the page context (template + body + included components). The `site` object (data from `src/data/*.json`) is also injected into the context.
- No special types: everything is string in frontmatter; numbers or booleans in `data/` JSON remain in `site`.

## Processing order (summary)

1. Frontmatter is parsed and the body is obtained.
2. The template indicated by `layout` (default Base) is loaded.
3. In the template, `{{ ... }}` is replaced with the context (frontmatter + `site`).
4. `<slot />` (or `<!-- @slot -->`) is replaced by the page body.
5. All `<mini-include ... />` in the resulting HTML are resolved (recursive).
6. A final `replaceVars` pass is done with the same context.
7. The final HTML is written to `dist/<route>/index.html` (or `dist/index.html` for the root).

## Build requirements

- The directory `src/pages/` must exist (from `srcDir` + `pages`).
- At least one template (default `Base`) must exist in `src/templates/` so pages using `layout: Base` (or no layout) build correctly.

## Next step

- [Clean URLs and server resolution](05b-clean-urls.md) — Why some URLs omit `.html` and how server resolution works.
- [Components](06-components.md) — Using `<mini-include>` and props.
