# Configuration

A project using mini-astro can define a **`mini-astro.config.js`** file at the root. It is an ESM module that exports a default options object. Any option not defined uses the framework default.

## Location and loading

- **Location**: project root (where you run `mini-astro build` or `mini-astro dev`, or the directory given with `-C, --cwd`).
- **Loading**: at runtime with `import(pathToFileURL(configPath).href)`. It must be a valid ES module (e.g. with `"type": "module"` in the project’s `package.json`) whose default export is an object (`export default { … }`).
- **Errors**: if the file exists but cannot be loaded, throws while loading, or does not export an object, the build (and `dev`) fails with the reason. There is no silent fallback to the defaults, which would build from or to the wrong directories.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `srcDir` | `string` | `'src'` | Source directory (contains `pages/`, `templates/`, `atoms/`, `molecules/`, `organisms/`). Components are resolved against it. |
| `outDir` | `string` | `'dist'` | Build output directory. Must not be the project root or overlap `srcDir`. |
| `dataDir` | `string` | `'src/data'` | Directory from which data is loaded (`*.json`, `*.js`, `*.mjs`; path relative to cwd). |
| `dev.port` | `number` | `2323` | Dev server port. The `PORT` env variable overrides it. |
| `security.csp` | `boolean \| string` | `true` | CSP `<meta>` injected by the build: `true` = default strict policy, a string = that policy, `false` = none. See [Security](09-security.md). |

The cookie consent banner and the policy pages are **not** config options: they are chosen when the project is created (`create` / `init`) and are just files in your project afterwards.

## Validation

After merging, the config is validated; an invalid value fails the build with a message naming the key:

- `srcDir`, `outDir`, `dataDir`: non-empty strings.
- `outDir`: must not be the project root, and must not contain or be inside `srcDir` (the stale-output cleanup and the dev watcher rely on this).
- `dev.port`: an integer from 0 to 65535.
- `security.csp`: `true`, `false` or a policy string.

## Minimal example

```js
// mini-astro.config.js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
};
```

## Example with a custom CSP and port

```js
// mini-astro.config.js
export default {
  dev: { port: 3000 },
  security: {
    csp: "default-src 'self'; img-src 'self' data: https://images.example.com",
  },
};
```

Set `security: { csp: false }` to disable the CSP meta.

## Internal default values

Defined in `src/loadConfig.js`:

```js
const DEFAULT_CONFIG = {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  dev: { port: 2323 },
  security: { csp: true },
};
```

If `mini-astro.config.js` does not exist, this object is used as-is. If it exists, it is **deep-merged**: nested objects are merged key by key, so `security: { csp: false }` or `dev: { port: 3000 }` keeps the other defaults and you do not need to repeat every key.

## Resolved paths

- **Pages directory**: `path.resolve(cwd, config.srcDir, 'pages')`
- **Templates directory**: `path.resolve(cwd, config.srcDir, 'templates')`
- **Components**: `path.resolve(cwd, config.srcDir, 'atoms' | 'molecules' | 'organisms')`
- **Data directory**: `path.resolve(cwd, config.dataDir)` (dataDir can be relative to cwd, e.g. `'src/data'`)
- **Output**: `path.resolve(cwd, config.outDir)`
- **Public**: `path.join(cwd, 'public')` (fixed; not configurable in the current version)
- **Build state**: `path.join(cwd, '.mini-astro')` (manifest of written files; add it to `.gitignore`)

## Next step

- [Atomic Design](04-atomic-design.md) — Folder structure and component resolution.
