# Templates

**Templates** are layouts that define the common structure of pages (doctype, head, body, header, footer, etc.) and leave a place for each page’s content via a **slot**.

## Location

- Directory: `src/templates/` (relative to `srcDir`).
- Each file is a layout: `Base.html`, `Blog.html`, etc. The page chooses the layout with frontmatter `layout: Base`.
- The scaffold generates a **Base** template with navbar (Home and, if applicable, Cookies and Privacy) so you can return to the home page from any page.

## Slot

In the template HTML, the page content is injected where you put:

- **`<slot />`**  
  or  
- **`<!-- @slot -->`** (case-insensitive)

Only the **first** occurrence is replaced. If you add more, only the first is substituted with the page body.

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

## Variables in templates

You can use **variables** with the syntax `{{ key }}` or `{{ site.key }}`:

- **Simple key**: comes from the page frontmatter (e.g. `{{ title }}`) or from the injected context (e.g. `site`).
- **With dot**: for nested properties, e.g. `{{ site.title }}`, `{{ site.description }}`. The engine resolves the “path” over the context object.

All substitutions use **pageContext** (frontmatter + `site`). There are no conditionals or loops in the template language; only string substitution.

## Build operation order

1. The template is loaded according to `layout`.
2. **replaceVars(template, pageContext)** on the template (replaces `{{ title }}`, `{{ site.xxx }}`, etc.).
3. **replaceSlot(template, body)** — `<slot />` is replaced by the page HTML.
4. **resolveIncludes(html)** — all `<mini-include>` are resolved (including those in the template or body).
5. **replaceVars(html, pageContext)** again on the full HTML.

So the template can contain both variables and components; the page body can too.

## Default template

If `layout` is not set in the frontmatter or the page has no frontmatter, the **Base** layout (`src/templates/Base.html`) is used. It must exist for the scaffold and most sites to work.

## Next step

- [Data](08-data.md) — Using `src/data/` and `site`.
