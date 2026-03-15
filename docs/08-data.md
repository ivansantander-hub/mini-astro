# Data

mini-astro loads global data from **JSON** files in the data directory and exposes it on all pages under the **`site`** object.

## Data directory

- Default: **`src/data`** (configurable with `dataDir` in `mini-astro.config.js`).
- Absolute path: `path.resolve(cwd, config.dataDir)`.
- Only **files** in that directory are read (no subfolders).
- Only files with extension **`.json`** are processed.

## Loading

- Each file `name.json` is parsed with `JSON.parse` and its content is assigned to **`site.name`** (base name without extension).
- Example: `site.json` → content is in **`site.site`**. If `site.json` is `{ "title": "My site" }`, in templates and pages you use `{{ site.site.title }}`.
- Another file `menu.json` → **`site.menu`** (array or object per the JSON).

There is no support for `data.js` or other formats in this version.

## Use in pages and templates

The `site` object is injected into **pageContext** together with the page frontmatter. You can use:

- **`{{ site.site.title }}`** — property of an object loaded from `site.json`.
- **`{{ site.menu }}`** — for lists/objects loaded from `menu.json` (serialized to string when substituting; for complex lists you typically use it in components by passing a prop).

Variables are resolved with **replaceVars**: the key can contain dots (e.g. `site.site.title`) and is resolved over the context. Values are stringified when substituted.

## Example structure

```
src/data/
  site.json    → site.site
  menu.json    → site.menu
```

**site.json:**

```json
{
  "title": "My portfolio",
  "description": "Welcome"
}
```

**In a template or page:**

```html
<title>{{ site.site.title }}</title>
<meta name="description" content="{{ site.site.description }}">
```

## Next step

- [Security](09-security.md) — Cookies, CSP and policy pages.
