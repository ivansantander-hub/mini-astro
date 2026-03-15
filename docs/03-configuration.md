# Configuration

A project using mini-astro can define a **`mini-astro.config.js`** file at the root. It is an ESM module that exports a default options object. Any option not defined uses the framework default.

## Location and loading

- **Location**: project root (where you run `mini-astro build` or `mini-astro dev`, or the directory given with `-C, --cwd`).
- **Loading**: at runtime with `import(pathToFileURL(configPath).href)`. It must be a valid module (e.g. with `"type": "module"` in the project’s `package.json` or `.mjs` extension if applicable).

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `srcDir` | `string` | `'src'` | Source directory (contains `pages/`, `templates/`, `atoms/`, etc.). |
| `outDir` | `string` | `'dist'` | Build output directory. |
| `dataDir` | `string` | `'src/data'` | Directory from which JSON data is loaded (path relative to cwd). |
| `atomicDesign` | `boolean` | `true` | Respect Atomic Design structure (atoms, molecules, organisms). Does not disable resolution in those folders in the current implementation. |
| `dev` | `object` | `{ port: 2323 }` | Dev server port (used by `mini-astro dev` and shown in `init`). |
| `cookies` | `object` | `{ strict: true }` | If `strict` is `true`, the scaffold includes CookieConsentBar; it is not injected automatically into existing builds. Mainly for init/create. |
| `security` | `object` | `{ csp: true, policyPages: true }` | Security options: CSP and policy page generation in the scaffold. |

## Minimal example

```js
// mini-astro.config.js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
};
```

## Example with relaxed security

```js
// mini-astro.config.js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  dev: { port: 2323 },
  cookies: { strict: false },
  security: { csp: false, policyPages: false },
};
```

## Internal default values

Defined in `src/loadConfig.js`:

```js
const DEFAULT_CONFIG = {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  dev: { port: 2323 },
  cookies: { strict: true },
  security: { csp: true, policyPages: true },
};
```

If `mini-astro.config.js` does not exist, this object is used as-is. If it exists, a shallow merge is done: `{ ...DEFAULT_CONFIG, ...userConfig }`, so you do not need to repeat every key.

## Resolved paths

- **Pages directory**: `path.resolve(cwd, config.srcDir, 'pages')`
- **Templates directory**: `path.resolve(cwd, config.srcDir, 'templates')`
- **Data directory**: `path.resolve(cwd, config.dataDir)` (dataDir can be relative to cwd, e.g. `'src/data'`)
- **Output**: `path.resolve(cwd, config.outDir)`
- **Public**: `path.join(cwd, 'public')` (fixed; not configurable in the current version)

## Next step

- [Atomic Design](04-atomic-design.md) — Folder structure and component resolution.
