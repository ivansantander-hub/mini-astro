# Templates

**Templates** are layouts that define the common structure of pages (doctype, head, body, header, footer, etc.) and leave a place for each page’s content via a **slot**.

## Location

- Directory: `src/templates/` (relative to `srcDir`).
- Each file is a layout: `Base.html`, `Blog.html`, etc. The page chooses the layout with frontmatter `layout: Base`.
- The scaffold generates a **Base** template with navbar (Home and, if policy pages were generated, Cookies and Privacy) so you can return to the home page from any page.

## Slot

In the template HTML, the page content is injected where you put:

- **`<slot />`**  
  or  
- **`<!-- @slot -->`** (case-insensitive)

A template **must** contain one of them; a template without a slot is a build error. Only the **first** occurrence is replaced. If you add more, only the first is substituted with the page body. The page content is inserted literally (sequences such as `$&` or `$1` in the page are kept as-is).

Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
</head>
<body>
  <header>...</header>
  <slot />
  <footer>...</footer>
</body>
</html>
```

## Template frontmatter (defaults)

A template can start with a frontmatter block. It is **not output**; its keys are **defaults** for every page that uses the template, and page frontmatter overrides them:

```html
---
description: A static site built with mini-astro
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
  <meta name="description" content="{{ description }}">
</head>
<body>
  <slot />
</body>
</html>
```

## Variables in templates

You can use **variables** with the syntax `{{ key }}` or `{{ site.key }}`:

- **Simple key**: comes from the page frontmatter (e.g. `{{ title }}`), the template frontmatter defaults, or the injected context (e.g. `site`).
- **With dot**: for nested properties, e.g. `{{ site.site.title }}`. The engine resolves the “path” over the context object.
- `{{ key }}` is HTML-escaped; `{{{ key }}}` inserts the value as raw HTML.

All substitutions use the same context: template frontmatter < page frontmatter < `site`. There are no conditionals or loops in the template language; only string substitution.

## Build operation order

1. The template is loaded according to `layout`.
2. The page body is rendered with the context (variables and `<mini-include>` in one pass).
3. The template body is rendered with the same context.
4. **replaceSlot** — `<slot />` in the rendered template is replaced by the rendered page body.

So the template can contain both variables and components; the page body can too. Nothing is rendered twice.

## Default template

If `layout` is not set in the frontmatter or the page has no frontmatter, the **Base** layout (`src/templates/Base.html`) is used when it exists. If it does not exist, the page is output as-is, without a template. An explicit `layout: Name` whose file does not exist is a build error.

## Next step

- [Data](08-data.md) — Using `src/data/` and `site`.
