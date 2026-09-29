# Data

mini-astro loads global data from **JSON** and **JavaScript** files in the data directory and exposes it on all pages under the **`site`** object.

## Data directory

- Default: **`src/data`** (configurable with `dataDir` in `mini-astro.config.js`).
- Absolute path: `path.resolve(cwd, config.dataDir)`.
- Only **files** in that directory are read (no subfolders).
- Files with extension **`.json`**, **`.js`** or **`.mjs`** are processed; other files are ignored.

## Loading

Each file becomes **`site.<name>`** (base name without extension):

- **`name.json`** — parsed with `JSON.parse`. Invalid JSON fails the build with an error naming the file.
- **`name.js` / `name.mjs`** — ES module whose default export is an object, or a function / async function that returns one. A file that fails to load fails the build naming the file.

Examples:

- `site.json` → content is in **`site.site`**. If `site.json` is `{ "title": "My site" }`, in templates and pages you use `{{ site.site.title }}`.
- `menu.json` → **`site.menu`** (array or object per the JSON).
- `build.js` → **`site.build`**:

```js
// src/data/build.js
export default async function () {
  return { year: new Date().getFullYear() };
}
```

```html
<footer>© {{ site.build.year }}</footer>
```

In `dev`, data files are watched and edits are picked up on the next rebuild.

## Use in pages and templates

The `site` object is injected into the context together with the template and page frontmatter. You can use:

- **`{{ site.site.title }}`** — property of an object loaded from `site.json`.
- **`{{ site.menu }}`** — lists/objects are serialized to JSON when substituted; for complex lists you typically pick values explicitly (`{{ site.menu.home }}`) or pass them to components as props.

The key can contain dots (e.g. `site.site.title`) and is resolved over the context. `{{ }}` escapes the value as HTML; use `{{{ site.x.html }}}` only for trusted values that intentionally contain HTML. Values are inserted as-is and never re-evaluated, so `{{ … }}` inside a data value appears literally in the output.

## Example structure

```
src/data/
  site.json    → site.site
  menu.json    → site.menu
  build.js     → site.build
```

**site.json:**

```json
{
  "title": "My site",
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
