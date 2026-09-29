# mini-astro

**Repository:** [github.com/ivansantander-hub/mini-astro](https://github.com/ivansantander-hub/mini-astro)

> **Alpha — development version.** The API and behavior may change. Use with that in mind and prefer pinning the version when installing. See [CHANGELOG.md](CHANGELOG.md) for breaking changes between versions.

---

Mini static site framework with **security-first defaults** and **Atomic Design**. No runtime in the browser—only HTML, CSS, and the scripts you add.

## Features

- **Atomic Design**: `src/atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`
- **File-based routing**: `src/pages/index.html` → `/`, `about.html` → `/about`, `blog/index.html` → `/blog`
- **Components**: `<mini-include src="Card" title="Hello" />` — props are attributes; values can reference the page context (`href="{{ base }}/x"`)
- **Layouts**: `templates/Base.html` with `<slot />` and `{{ title }}`
- **Safe output**: `{{ var }}` is HTML-escaped; `{{{ var }}}` inserts raw HTML
- **Default landing**: “Hello humans” hero with modern theme (Orbitron + DM Sans, dark UI). Cookie consent bar and policy pages when enabled.
- **Package manager**: Choose **pnpm** (default), **yarn**, or **npm** at project creation.
- **Security defaults**: CSP `<meta>` injected by the build, optional cookie consent banner and policy pages
- **Fast build** (stale output from previous builds is removed) and **dev server** with watch + live reload (chokidar)

## Quick start

mini-astro is not on the npm registry. Use it from GitHub:

```bash
npx github:ivansantander-hub/mini-astro init
# or create directly
npx github:ivansantander-hub/mini-astro create my-site
cd my-site
pnpm install    # or yarn / npm install (you choose at init)
pnpm dev
```

**Interactive init** asks for: project name, cookie banner, policy pages, CSP, dev server port and **package manager** (pnpm / yarn / npm). Default is **pnpm**. The new project includes a “Hello humans” landing and, if enabled, a cookie consent bar with a clear **Accept** action and links to Cookie and Privacy pages (only when policy pages are generated).

## Commands

| Command | Description |
|--------|-------------|
| `mini-astro init` | Interactive: project name, cookies, policies, CSP, port, package manager (pnpm/yarn/npm) |
| `mini-astro create [name]` | New project with optional name (default: pnpm) |
| `mini-astro build` | Build to `dist/` |
| `mini-astro dev` | Dev server (port 2323 by default) + watch + live reload |
| `mini-astro route <name>` | Add page `src/pages/<name>.html` |
| `mini-astro component <name> [atom\|molecule\|organism]` | Add component |
| `mini-astro add [type]` | Interactive: atom, molecule, organism, template or page (`add page <route>` creates the page directly) |

## Project structure

```
src/
  quarks/      # Design tokens (tokens.json) — not includable
  atoms/       # Buttons, links, inputs
  molecules/   # CookieConsentBar, cards
  organisms/   # Header, footer, sections
  templates/   # Base.html with <slot />
  pages/       # index.html, about.html, …
  data/        # site.json, *.js, …
public/        # Copied to dist as-is
```

## Config

`mini-astro.config.js`:

```js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  dev: { port: 2323 },
  security: { csp: true },
};
```

All keys are optional; nested objects are merged with the defaults. `security.csp` can be `true` (default strict policy), a policy string, or `false` (no CSP meta). A config file that fails to load or has invalid values stops the build with the reason. Cookie banner and policy pages are chosen at `create`/`init` time, not in the config.

## Tests

```bash
npm test   # node --test, no extra dependencies
```

## Documentation

Full technical documentation in **[docs/](docs/README.md)**: architecture, configuration, Atomic Design, components, templates, data, security, CLI, dev server and usage guide.

## License

MIT — see [LICENSE](LICENSE).
