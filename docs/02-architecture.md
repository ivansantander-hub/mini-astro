# mini-astro technical architecture

## Package structure

```
mini-astro/
├── package.json           # name, bin, type: "module", dependencies, "test": "node --test"
├── cli.js                 # CLI entry point (shebang + main)
├── mini-astro.config.js   # Example config (not used at runtime from here)
├── LICENSE                # MIT
├── src/
│   ├── loadConfig.js      # Loads + validates mini-astro.config.js from project cwd; DEFAULT_CSP
│   ├── data.js            # Loads dataDir: *.json, *.js, *.mjs
│   ├── frontmatter.js     # Parses --- key: value ---
│   ├── resolve.js         # render (vars + includes, single pass), replaceSlot, escapeHtml
│   ├── build.js           # runBuild: build orchestration, CSP injection, stale output cleanup
│   ├── init.js            # runInit: interactive prompts and call to runCreate
│   ├── dev-server.js      # runDev: build + watch + HTTP server + live reload
│   ├── help.js            # Help texts
│   ├── completion.js      # Shell completion scripts
│   ├── prompt.js          # ask / choose helpers
│   └── commands/
│       ├── create.js      # runCreate: project scaffold
│       ├── route.js       # runRoute: create page in src/pages/
│       ├── component.js   # runComponent: create component in atoms|molecules|organisms
│       ├── template.js    # runTemplate: create template
│       └── add.js         # runAdd: interactive add
├── test/                  # node:test suites (build, config, frontmatter, dev server, CLI)
└── templates/             # .gitkeep; scaffold content is generated in create.js
```

- The **CLI** (`cli.js`) uses `node:util` `parseArgs` to read command and options (`--cwd`, `--help`). Commands are delegated to modules in `src/` and `src/commands/`. Unknown options print the error and a usage hint (no stack trace) and exit with code 1.
- **Configuration** is loaded from the project directory (cwd), not from the package folder. See [Configuration](03-configuration.md).
- **Build** and **dev** always run in the project **cwd** (where `mini-astro.config.js` is or where the user specifies with `-C`).

## Build data flow

1. **loadConfig(cwd)**  
   Reads `mini-astro.config.js` (if present), deep-merges it with the defaults and validates it. Returns `srcDir`, `outDir`, `dataDir`, `dev`, `security`. A config that fails to load or is invalid throws.

2. **loadData(dataDir)**  
   Reads every `.json`, `.js` and `.mjs` in `dataDir` and returns an object `{ fileName: content }` (no extension). That object is exposed as `site` in the page context.

3. **Copy `public/` → `outDir`**  
   Done before processing pages so `outDir` contains both generated HTML and static assets (css, js, img, etc.). Every copied file is recorded.

4. **For each file in `<srcDir>/pages/**/*.html`** (sorted):
   - The output path is computed (`outputPathFor`, clean URLs). Two pages with the same output path fail the build.
   - **parseFrontmatter(raw)** returns `{ frontmatter, body }`.
   - The **template** is chosen from `frontmatter.layout` (default `Base`) and loaded from `<srcDir>/templates/<layout>.html`. An explicit `layout` that does not exist fails the build; if there is no `layout` and no `Base.html`, the page is output without a template.
   - **Context** = template frontmatter (defaults) < page frontmatter < `{ site }`.
   - **render(body, context)** resolves `{{ }}`, `{{{ }}}` and `<mini-include>` in the page body.
   - **render(template, context)** does the same for the template, then **replaceSlot** inserts the rendered body at `<slot />` / `<!-- @slot -->`.
   - **applyCsp** adds the CSP `<meta>` according to `security.csp`.
   - The final HTML is written to `outDir/<output path>` and recorded.

5. **removeStaleOutput**  
   Files listed in `.mini-astro/manifest.json` by the previous build that were not written this time are deleted (plus directories left empty). The manifest is then rewritten with this build's files.

## Modules in detail

### loadConfig.js

- Looks for `mini-astro.config.js` in `cwd`. If missing, the defaults are used.
- If present, imports it (with a cache-busting query so edits are picked up in `dev`). A load error, a thrown error or a default export that is not a plain object is reported as an error with the reason; there is no silent fallback to the defaults.
- Deep-merges the user config over `DEFAULT_CONFIG` and validates it (see [Configuration](03-configuration.md)).
- Exports `DEFAULT_CSP`, the policy used when `security.csp` is `true`.

### data.js

- Lists files in `dataDir` (sorted); subfolders are ignored.
- `.json` → `JSON.parse`; invalid JSON fails the build naming the file.
- `.js` / `.mjs` → default export: an object, or a function / async function that returns one. Load errors fail the build naming the file.
- Each result is assigned to `site[baseName]`.

### frontmatter.js

- The block must open with `---` on the first non-blank line and close with a line that is exactly `---` (so a `---` inside a value does not end it). Otherwise returns `{ frontmatter: {}, body: raw }`.
- Parses `key: value` lines (keys: letters, digits, `_`, `-`). Values are strings; matching surrounding quotes are removed. Blank lines and lines starting with `#` are ignored.
- The body is everything after the closing `---` (leading blank lines removed).

### resolve.js

- **render(html, context, { srcDir, fromFile })**  
  One regex pass over `{{{ key }}}`, `{{ key }}` and `<mini-include … />` / `<mini-include …></mini-include>`:
  - `{{ key }}` → value HTML-escaped (`& < > " '`); `{{{ key }}}` → raw value. Keys may contain letters, digits, `_`, `-` and `.` (dot = nested lookup, e.g. `site.site.title`). Undefined → empty string; objects/arrays → JSON.
  - `<mini-include>`: attributes are parsed (names may contain `-`; values in single or double quotes may contain `>`; `{{ var }}` in values is interpolated from the current context). The component is found (see below), then rendered recursively with `{ ...context, ...props }`.
  - Output is never scanned again, so `{{ }}` that appears inside a data value is not evaluated.
- **findComponentPath(src, srcDir, fromFile)**
  - `./X` or `../atoms/X` → relative to the including file.
  - `atoms/X` (contains `/`) → `<srcDir>/atoms/X.html`.
  - `X` → `<srcDir>/atoms`, `molecules`, `organisms` in that order; first match wins.
  - Not found → build error listing the paths tried. Circular includes and nesting deeper than 20 levels are errors.
- **replaceSlot(templateHtml, content, templateName)**  
  Replaces the first `<slot />` or `<!-- @slot -->` (case-insensitive) with `content` using a replacer function, so `$&` / `$1` in the content stay literal. A template without a slot is a build error.
- **escapeHtml(value)** — also used by the dev server error page.

### build.js

- Does not transform JS/CSS; only reads/writes HTML and copies `public/`.
- `collectPages(pagesDir, prefix)` walks the tree and returns relative paths of all `.html` (e.g. `index.html`, `blog/post.html`).
- `outputPathFor(relPath)` maps them to clean URLs: `index.html` and any `…/index.html` are kept; `x.html` → `x/index.html`.
- `applyCsp` inserts the CSP `<meta>` after `<meta charset>` (or after `<head>`) only in documents that have a head and no CSP meta yet.
- `removeStaleOutput` uses `.mini-astro/manifest.json` (at the project root) to delete only files a previous build wrote. If `outDir` changed since that build, nothing is deleted from the old directory.

### dev-server.js

- Runs `runBuild(cwd)` once.
- With **chokidar**, watches `srcDir`, `public/`, `dataDir` and `mini-astro.config.js` (those that exist at startup). Any add/change/delete triggers a debounced rebuild; rebuilds never overlap (a change during a build queues one more build). Clients connected to `/__mini_astro_live` (Server-Sent Events) are told to reload.
- A failed build is logged and kept as the current error; HTML requests get a 500 page with the message (it reloads when the build is fixed). Assets are still served.
- Creates an HTTP server serving files from `outDir` (URL-decoded, never outside `outDir`). HTML responses get `<script src="/__mini_astro_reload.js"></script>` injected before `</body>`.
- Port: env `PORT`, otherwise config `dev.port` (default 2323). `PORT=0` picks a free port.

### commands/create.js

- Creates all scaffold directories (src/quarks, atoms, molecules, organisms, templates, pages, data; public/css, js, img).
- Writes `Base.html`, `index.html`, `NavLink.html`, `SiteHeader.html`, optionally `CookieConsentBar.html` + `public/js/consent.js` + `COOKIE_CONSENT.md`, optionally `cookies.html` + `privacy.html`, `site.json`, `tokens.json`, `mini-astro.config.js`, `package.json`, `.gitignore` and `public/js/nav-active.js`.
- Links to the policy pages (header, home footer, consent banner) are only generated when policy pages are generated.
- The CSP policy (allowing Google Fonts, used by the starter theme) goes in `security.csp` of the generated config, not in `Base.html`.
- Does not use the package’s `templates/` folder; file content is generated in internal functions (`getBaseTemplate`, `getIndexPage`, etc.).

## Dependencies

- **chokidar**: only used for watch in `dev`. If it cannot be loaded, the dev server runs but there is no watch or live reload.
- Node.js built-in modules only for the rest: `path`, `fs`, `http`, `os`, `readline`, `node:util` (`parseArgs`), `node:url` (`pathToFileURL`, `fileURLToPath`).
- Tests use `node:test` (`npm test`), no extra dependencies.

## Next step

- [Configuration](03-configuration.md) — `mini-astro.config.js` options.
