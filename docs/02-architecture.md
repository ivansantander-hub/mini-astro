# mini-astro technical architecture

## Package structure

```
mini-astro/
├── package.json           # name, bin, type: "module", dependencies
├── cli.js                 # CLI entry point (shebang + main)
├── mini-astro.config.js   # Example config (not used at runtime from here)
├── src/
│   ├── loadConfig.js      # Loads mini-astro.config.js from project cwd
│   ├── data.js            # Loads src/data/*.json
│   ├── frontmatter.js     # Parses --- key: value ---
│   ├── resolve.js         # replaceVars, replaceSlot, resolveIncludes, findComponentPath
│   ├── build.js           # runBuild: build orchestration
│   ├── init.js            # runInit: interactive prompts and call to runCreate
│   ├── dev-server.js      # runDev: build + watch + HTTP server + live reload
│   └── commands/
│       ├── create.js      # runCreate: project scaffold
│       ├── route.js       # runRoute: create page in src/pages/
│       ├── component.js   # runComponent: create component in atoms|molecules|organisms
│       ├── template.js    # runTemplate: create template
│       └── add.js         # runAdd: interactive add
└── templates/             # .gitkeep; scaffold content is generated in create.js
```

- The **CLI** (`cli.js`) uses `node:util` `parseArgs` to read command and options (`--cwd`, `--help`). Commands are delegated to modules in `src/` and `src/commands/`.
- **Configuration** is loaded from the project directory (cwd), not from the package folder. See [Configuration](03-configuration.md).
- **Build** and **dev** always run in the project **cwd** (where `mini-astro.config.js` is or where the user specifies with `-C`).

## Build data flow

1. **loadConfig(cwd)**  
   Reads `mini-astro.config.js` (if present) and merges with defaults. Returns `srcDir`, `outDir`, `dataDir`, `cookies`, `security`, `dev`, etc.

2. **loadData(dataDir)**  
   Reads all `.json` in `src/data/` and returns an object `{ fileName: content }` (no extension). That object is exposed as `site` in the page context.

3. **For each file in `src/pages/**/*.html`:**
   - **parseFrontmatter(raw)**  
     Detects `---` … `---` block at the start, parses `key: value` lines and returns `{ frontmatter, body }`.
   - **Template** is chosen from `frontmatter.layout` (default `Base`). Loads `src/templates/<layout>.html`.
   - **replaceVars(templateHtml, pageContext)**  
     Replaces `{{ key }}` and `{{ site.key }}` in the template. `pageContext` = frontmatter + `{ site: siteData }`.
   - **replaceSlot(templateHtml, body)**  
     Replaces the first `<slot />` or `<!-- @slot -->` with the page body.
   - **resolveIncludes(html, cwd)**  
     Replaces each `<mini-include src="..." [attrs] />` with the component content from atoms/molecules/organisms, injecting props and resolving recursively (depth limit 20).
   - **replaceVars(html, pageContext)**  
     Second pass of variables for body or components that use `{{ }}`.
   - Final HTML is written to `dist/<relative-path>`.

4. **Copy `public/` → `dist/`**  
   Done before processing pages so `dist` contains both generated HTML and static assets (css, js, img, etc.).

## Modules in detail

### loadConfig.js

- Looks for `mini-astro.config.js` in `cwd`.
- If missing, returns `DEFAULT_CONFIG`.
- If present, does `import(pathToFileURL(configPath).href)` and merges `mod.default` with `DEFAULT_CONFIG` (file values take precedence).

### data.js

- Lists files in `dataDir`; only files are processed (no subfolders).
- For each `.json`, runs `JSON.parse` and assigns the result to `site[baseName]`.
- No support for `data.js` in this version; JSON only.

### frontmatter.js

- If content does not start with `---`, returns `{ frontmatter: {}, body: raw }`.
- If it starts with `---`, finds the second `---`; between them parses `key: value` lines (unquoted or stripped quotes).
- The body is everything after the second `---`.

### resolve.js

- **replaceVars(html, context)**  
  Regex `\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}`. For each key, resolves a “path” with `.` (e.g. `site.title`) over `context`. Result is stringified.
- **replaceSlot(templateHtml, content)**  
  Replaces `<slot />` or `<!-- @slot -->` (case-insensitive) with `content`.
- **findComponentPath(srcDir, name)**  
  - `srcDir` here is the project **cwd** (site root).
  - If `name` contains `/` (e.g. `organisms/Header`), only that layer is searched.
  - Otherwise search order: `atoms`, `molecules`, `organisms`. Base path is `path.join(srcDir, 'src', layer, fileName)` with `fileName` = `name` + `.html` if needed.
- **parseAttrs(attrsStr)**  
  Extracts `src="..."` and other `key="value"` attributes. If `title1` and `title2` exist, computes `line1content` and `line2content` with `repeatMarquee()` (for SubBanner/marquee).
- **resolveIncludes(html, srcDir, fromFile, depth)**  
  Global regex for `<mini-include ... />`. For each match, parses attributes, finds component, reads HTML, applies `replaceVars` with props and calls `resolveIncludes` recursively (max depth 20).

### build.js

- Does not transform JS/CSS; only reads/writes HTML and copies `public/`.
- `collectPages(pagesDir, prefix)` walks the tree and returns relative paths of all `.html` (e.g. `index.html`, `blog/post.html`). Those paths determine the URL and output path in `dist/`.

### dev-server.js

- Runs `runBuild(cwd)` once.
- If **chokidar** is available, watches `srcDir`; on each change runs `runBuild` again and broadcasts to clients connected to `/__mini_astro_live` (Server-Sent Events).
- Creates an HTTP server serving files from `outDir`. For HTML requests, injects before `</body>` a script that opens an `EventSource` to `/__mini_astro_live` and reloads the page on event.
- Default port: from config `dev.port`, then `process.env.PORT`, then 2323.

### commands/create.js

- Creates all scaffold directories (src/atoms, molecules, organisms, templates, pages, data; public/css, js, img).
- Writes `Base.html`, `index.html`, optionally `CookieConsentBar.html`, `cookies.html`, `privacy.html`, `site.json`, `mini-astro.config.js`, `package.json` and `public/js/nav-active.js`.
- Does not use the package’s `templates/` folder; file content is generated in internal functions (`getBaseTemplate`, `getIndexPage`, etc.).

## Dependencies

- **chokidar**: optional; only for watch in `dev`. If not installed, the dev server runs but there is no live reload.
- Node.js built-in modules only for the rest: `path`, `fs`, `http`, `readline`, `node:util` (`parseArgs`), `node:url` (`pathToFileURL`, `fileURLToPath`).

## Next step

- [Configuration](03-configuration.md) — `mini-astro.config.js` options.
