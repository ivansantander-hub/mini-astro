# Components

Components are reusable HTML fragments included with the **`<mini-include>`** tag and optionally receive props.

## Basic syntax

```html
<mini-include src="ComponentName" />
<!-- or -->
<mini-include src="ComponentName"></mini-include>
```

- **`src`** (required): which component to include. A missing `src` is a build error.
- Closing: self-closing `/>` or an explicit `</mini-include>` (with nothing in between).

## Resolution

Components are resolved against the configured **`srcDir`** (default `src`):

| `src` value | File looked up |
|-------------|----------------|
| `Card` | `<srcDir>/atoms/Card.html`, then `molecules/Card.html`, then `organisms/Card.html` (first match wins) |
| `organisms/Header` | `<srcDir>/organisms/Header.html` |
| `./Icon` or `../atoms/Icon` | Relative to the file that contains the `<mini-include>` |

The `.html` extension is optional. If no file is found, the build fails with the list of paths tried. Quarks (`src/quarks/`) are design tokens, not components, and are not included this way.

## Props (attributes)

Any other attribute is passed as a prop to the component:

```html
<mini-include src="Card" title="Title" subtitle="Subtitle" data-id="42" aria-label="Featured card" />
```

Inside the component, props are available as variables with the same name:

```html
<!-- molecules/Card.html -->
<div class="card" data-id="{{ data-id }}" aria-label="{{ aria-label }}">
  <h3>{{ title }}</h3>
  <p>{{ subtitle }}</p>
</div>
```

- Attribute names may contain letters, digits, `_` and `-` (`data-id`, `aria-label`). Values go in double or single quotes and may contain `>` (e.g. `label="a > b"`).
- Attribute values can reference the current context with `{{ var }}`, e.g. `href="{{ base }}/about"` or `title="{{ site.site.title }}"`. The value is inserted as plain text; the component escapes it when it outputs it with `{{ }}`.
- If a variable is not defined, `{{ name }}` renders as an empty string.

## Context

A component is rendered with the **page context** (template frontmatter < page frontmatter < `site`) plus its own attributes; **attributes override** context keys with the same name. So a component can use `{{ site.site.title }}` or `{{ title }}` from the page without passing them explicitly. Nested components receive the context of the component that includes them (including its props).

## Variables and escaping

| Syntax | Output |
|--------|--------|
| `{{ var }}` | Value HTML-escaped (`&`, `<`, `>`, `"`, `'`) |
| `{{{ var }}}` | Value inserted as raw HTML |

- Names may contain letters, digits, `_`, `-` and `.` (dot for nested values: `{{ site.menu.home }}`).
- Undefined values render as an empty string; objects and arrays render as JSON.
- Use `{{{ var }}}` only when the value is trusted and intentionally contains HTML.
- Rendering is a single pass: output is never scanned again, so `{{ }}` inside a data value or prop value is not evaluated.

## Recursive resolution

- Inside a component you can use another `<mini-include>`. Resolution is recursive with a **depth limit of 20**.
- A component that includes itself (directly or through others) is a build error showing the include chain.

## Where to use components

- In **templates**: e.g. `<mini-include src="CookieConsentBar" />` in Base.html.
- In **pages**: in the body of any page.
- In **other components**: inside atoms, molecules or organisms.

## No slots in components

Components do not have their own slot; they are a single HTML fragment. The only slot substitution is in the **template** (the page body replaces `<slot />`). To vary a component’s content, use props (and `{{{ }}}` for a prop that carries trusted HTML).

## Next step

- [Templates](07-templates.md) — Layouts, slot and variables.
