# CLI

The mini-astro CLI is run with **`npx mini-astro`** or **`mini-astro`** if installed globally. All commands run in the current directory unless **`-C, --cwd`** is given.

## Global options

| Option | Description |
|--------|-------------|
| `-C, --cwd <path>` | Project directory (where `mini-astro.config.js` is). Default: `process.cwd()`. |
| `-h, --help` | Show help and exit. |

An unknown option prints the error and `Run mini-astro help for usage.` and exits with code 1 (no stack trace). Errors from commands (e.g. a failed build) are printed as a single message and exit with code 1.

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
- Defaults are shown in brackets (e.g. `(y/n) [Y]`, `[2323]`); press Enter to accept them. For the yes/no questions only `n` means no.
- With your answers it calls **create** and generates the project. When done it prints the chosen port and the commands to install and start.
- **Scriptable**: answers are read from stdin in order, so `init` works with piped input (scripts, CI). Order: project name, cookie banner, policy pages, CSP, dev port, package manager. Once stdin ends, every remaining question uses its default.

  ```bash
  printf 'mysite\nn\nn\nn\n4321\nnpm\n' | mini-astro init
  ```

  If you pass the name as an argument (`init mysite`), the name question is skipped and the first line answers the cookie banner question.

### `create [name]`

- **Usage**: `mini-astro create` or `mini-astro create my-site`
- **Description**:  
  - **With name** (`create my-site`): Creates the project in `<cwd>/my-site` without prompts. Uses default options (cookies, policy pages, CSP) and **pnpm** as package manager.  
  - **Without name** (`create`): Runs the **interactive** flow like **init** (name, cookies, policies, CSP, package manager).
- Generates: Atomic Design folders (incl. `src/quarks/tokens.json`) + public/css (incl. `theme.css`), Base.html, “Hello humans” landing in index.html, CookieConsentBar and policy pages if applicable (links to the policy pages only when they are generated), site.json, `mini-astro.config.js` (with the CSP policy in `security.csp`), package.json and a `.gitignore` (`node_modules/`, `dist/`, `.mini-astro/`). If the directory already exists, throws an error.

### `new [name]`

- **Usage**: `mini-astro new` or `mini-astro new my-site`
- Alias for **create**. Without name uses `my-site` as the default project name (creates `<cwd>/my-site`).

### `build`

- **Usage**: `mini-astro build` (from project root or with `-C`).
- **Description**: Loads and validates config, loads data from `dataDir`, copies `public/` to `outDir`, processes all pages in `src/pages/` (frontmatter, layout, variables, includes, slot, CSP) and writes the result to `outDir`. Then removes files a previous build wrote that were not written again (tracked in `.mini-astro/manifest.json`). Prints the number of pages generated and, if any, the number of stale files removed.
- Fails (exit code 1) on: invalid config, invalid data file, missing component, missing explicit layout, template without slot, two pages with the same output path.

### `dev`

- **Usage**: `mini-astro dev`
- **Description**: Runs a build and then starts an HTTP server that serves `outDir` (default `dist/`) on port **2323** (or `dev.port` from config; the `PORT` env overrides both; `PORT=0` picks a free port). With **chokidar**, it watches `srcDir`, `public/`, `dataDir` and the config file, rebuilds on add/change/delete and sends a live reload event to clients connected to `/__mini_astro_live`. Each HTML response injects a script that opens that SSE and reloads the page on event.
- A failed build does not stop the server: HTML requests show the error until the next successful build. See [Dev server](11-dev-server.md).

### `route <name>` / `page <name>` / `add page <name>`

- **Usage**: `mini-astro route about`, `mini-astro page blog/post`, `mini-astro add page contact`
- **Description**: Creates a page in `src/pages/` (Atomic: pages). `route blog/post` creates `src/pages/blog/post.html`; the URL will be `/blog/post`. Content: placeholder with `layout: Base` and title derived from the name. **page** is an alias of **route**; `add page <name>` creates the page directly as well. If the page already exists, throws an error.

### `quarks`

- **Usage**: `mini-astro quarks`
- **Description**: Shows the **quarks** path (design tokens) and lists files in `src/quarks/`. Atomic Design level 0; not UI components.

### `component <name> [layer]`

- **Usage**: `mini-astro component Button atom`, `mini-astro component Card molecule`, `mini-astro component Header organism`
- **Description**: Creates a component in the given layer (default **molecule**). Layers: **atom** | **molecule** | **organism** (or plural: atoms, molecules, organisms). Creates `<srcDir>/<layer>/<name>.html`, creating the layer directory if it does not exist.

### `template <name>`

- **Usage**: `mini-astro template Blog`
- **Description**: Creates a layout in `src/templates/<name>.html` with minimal structure (html, head, body, `<slot />`). Pages use it with `layout: Name` in the frontmatter.

### `completion [bash|zsh]`

- **Usage**: `mini-astro completion bash` or `mini-astro completion zsh`
- **Description**: Writes the shell completion script to stdout. Installation:
  - **Bash**: `source <(mini-astro completion bash)` (or add to `~/.bashrc`).
  - **Zsh**: `source <(mini-astro completion zsh)` (or add to `~/.zshrc`).

### `add [type]`

- **Usage**: `mini-astro add`, `mini-astro add atom`, `mini-astro add template`, `mini-astro add page`
- **Description**: Interactive mode to create any Atomic Design level. If you do not pass **type** (atom / molecule / organism / template / page), it asks what to create. Then it asks for the **name** (and for pages, the **layout**). Equivalent to running `component`, `template` or `route` without arguments so they prompt for the data. Requires an interactive terminal.
- `mini-astro add page <route>` is the exception: it creates the page directly, without prompts (same as `route <route>`).

### `help [command]`

- **Usage**: `mini-astro help`, `mini-astro help component`, `mini-astro component --help`
- **Description**: Shows general help or help for the given command.

## Examples

```bash
# Create project interactively
npx mini-astro init
npx mini-astro init my-site

# Create project from a script (answers piped in order)
printf 'mysite\nn\nn\nn\n4321\nnpm\n' | npx mini-astro init

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
