# CLI

The mini-astro CLI is run with **`npx mini-astro`** or **`mini-astro`** if installed globally. All commands run in the current directory unless **`-C, --cwd`** is given.

## Global options

| Option | Description |
|--------|-------------|
| `-C, --cwd <path>` | Project directory (where `mini-astro.config.js` is). Default: `process.cwd()`. |
| `-h, --help` | Show help and exit. |

## Commands

### `init [name]`

- **Usage**: `mini-astro init` or `mini-astro init my-site`
- **Description**: Interactive setup. Prompts for:
  - Project name (or uses the argument if provided)
  - Strict cookie banner (Yes/No)
  - Generate policy pages (Cookies and Privacy)
  - Strict CSP by default
  - **Dev server port** (default **2323**); saved in `mini-astro.config.js` as `dev.port`
  - **Package manager**: **pnpm** (default), **yarn** or **npm**
- With your answers it calls **create** and generates the project. When done it prints the chosen port and the commands to install and start.

### `create [name]`

- **Usage**: `mini-astro create` or `mini-astro create my-site`
- **Description**:  
  - **With name** (`create my-site`): Creates the project in `<cwd>/my-site` without prompts. Uses default options (cookies, policy pages, CSP) and **pnpm** as package manager.  
  - **Without name** (`create`): Runs the **interactive** flow like **init** (name, cookies, policies, CSP, package manager).
- Generates: Atomic Design folders + public/css (incl. `theme.css`), Base.html, “Hello humans” landing in index.html, CookieConsentBar and policy pages if applicable, site.json, config, package.json (with `packageManager: "pnpm@9.0.0"` if pnpm). If the directory already exists, throws an error.

### `new [name]`

- **Usage**: `mini-astro new` or `mini-astro new my-site`
- Alias for **create**. Without name uses `my-site` as the default project name (creates `<cwd>/my-site`).

### `build`

- **Usage**: `mini-astro build` (from project root or with `-C`).
- **Description**: Loads config, loads data from `dataDir`, copies `public/` to `outDir`, processes all pages in `src/pages/` (frontmatter, layout, slot, includes, vars) and writes the result to `outDir`. Prints the number of pages generated.

### `dev`

- **Usage**: `mini-astro dev`
- **Description**: Runs a build and then starts an HTTP server that serves `outDir` (default `dist/`) on port **2323** (or `dev.port` from config, or `PORT` env). If **chokidar** is installed, it watches `srcDir` and on changes runs the build again and sends a live reload event to clients connected to `/__mini_astro_live`. Each HTML response injects a script that opens that SSE and reloads the page on event.
- Without chokidar, the server still runs but there is no automatic reload.

### `route <name>` / `page <name>` / `add [page] <name>`

- **Usage**: `mini-astro route about`, `mini-astro page blog/post`, `mini-astro add page contact`
- **Description**: Creates a page in `src/pages/` (Atomic: pages). `route blog/post` creates `src/pages/blog/post.html`; the URL will be `/blog/post`. Content: placeholder with `layout: Base` and title derived from the name. **page** and **add** are aliases of **route**; with **add**, if the first argument is `page` it is ignored.

### `quarks`

- **Usage**: `mini-astro quarks`
- **Description**: Shows the **quarks** path (design tokens) and lists files in `src/quarks/`. Atomic Design level 0; not UI components.

### `component <name> [layer]`

- **Usage**: `mini-astro component Button atom`, `mini-astro component Card molecule`, `mini-astro component Header organism`
- **Description**: Creates a component in the given layer (default **molecule**). Layers: **atom** | **molecule** | **organism** (or plural: atoms, molecules, organisms). Creates `src/<layer>/<name>.html`.

### `template <name>`

- **Usage**: `mini-astro template Blog`
- **Description**: Creates a layout in `src/templates/<name>.html` with minimal structure (html, head, body, `<slot />`). Pages use it with `layout: Name` in the frontmatter.

### `completion [bash|zsh]`

- **Usage**: `mini-astro completion bash` or `mini-astro completion zsh`
- **Description**: Writes the shell completion script to stdout. Installation:
  - **Bash**: `source <(mini-astro completion bash)` (or add to `~/.bashrc`).
  - **Zsh**: `source <(mini-astro completion zsh)` (or add to `~/.zshrc`).

### `add [type]`

- **Usage**: `mini-astro add` or `mini-astro add atom`
- **Description**: Interactive mode to create any Atomic Design level. If you do not pass **type**, it asks what to create (atom / molecule / organism / template / page). Then it asks for the **name** (and for pages, the default **layout**). Equivalent to running `component`, `template` or `route` without arguments so they prompt for the data.

### `help [command]`

- **Usage**: `mini-astro help`, `mini-astro help component`, `mini-astro component --help`
- **Description**: Shows general help or help for the given command.

## Examples

```bash
# Create project interactively
npx mini-astro init
npx mini-astro init my-portfolio

# Create project without prompts
npx mini-astro create my-site

# Build and dev (from project root)
npx mini-astro build
npx mini-astro dev

# Create page and component
npx mini-astro route contact
npx mini-astro route blog/post
npx mini-astro component Card
npx mini-astro component Header organism
```

## Next step

- [Dev server](11-dev-server.md) — Development server details and live reload.
