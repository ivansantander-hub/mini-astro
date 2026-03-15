# Components

Components are reusable HTML fragments included with the **`<mini-include>`** tag and optionally receive props.

## Basic syntax

```html
<mini-include src="ComponentName" />
```

- **`src`** (required): component name. Matches the file name without extension in `atoms/`, `molecules/` or `organisms/`. If you include the layer, only that layer is searched: `organisms/Header`.
- Closing: always self-closing `/>`.

## Props (attributes)

Any other attribute is passed as a prop to the component:

```html
<mini-include src="Card" title="Title" subtitle="Subtitle" />
```

Inside the component, props are available as variables with the same name:

```html
<!-- molecules/Card.html -->
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ subtitle }}</p>
</div>
```

- Attribute names are normalized to lowercase in the attribute parser (in practice, use lowercase names or the same name as in the HTML).
- If a prop is not passed, `{{ name }}` is left empty or unchanged depending on implementation (replaceVars usually leaves the literal string if the key does not exist).

## Recursive resolution

- Inside a component you can use another `<mini-include>`. Resolution is recursive with a **depth limit of 20** to avoid infinite loops.
- Variables `{{ }}` inside the component are replaced with the context formed by that include’s **props** (not the page context). To use global data you would need to pass something like `siteTitle="{{ site.title }}"` explicitly from the page or from a template.

## Special case: SubBanner / marquee

The `resolve.js` module has specific logic for components that use **title1** and **title2**:

- If the parsed attributes include `title1` and `title2`, `line1content` and `line2content` are computed via a `repeatMarquee(title, withProjects)` function (text fill for marquee effect).
- Useful for an organism like a “banner” with two repeated text lines. The component should use `{{ line1content }}` and `{{ line2content }}` in its HTML.

## Where to use components

- In **templates**: e.g. `<mini-include src="CookieConsentBar" />` in Base.html.
- In **pages**: in the body of any page.
- In **other components**: inside atoms, molecules or organisms.

## No slots in components

Components do not have their own slot; they are a single HTML fragment. The only slot substitution is in the **template** (the page body replaces `<slot />`). To vary a component’s content, use props.

## Next step

- [Templates](07-templates.md) — Layouts, slot and variables.
