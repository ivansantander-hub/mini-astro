# mini-astro

**Repository:** [github.com/ivansantander-hub/mini-astro](https://github.com/ivansantander-hub/mini-astro)

> **Alpha — development version.** The API and behavior may change. Use with that in mind and prefer pinning the version when installing.

---

Mini static site framework with **security-first defaults** and **Atomic Design**. No runtime in the browser—only HTML, CSS, and the scripts you add.

## Features

- **Atomic Design**: `src/atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`
- **File-based routing**: `src/pages/index.html` → `/`, `about.html` → `/about`
- **Components**: `<mini-include src="Header" />` with optional props (`title1="..."`)
- **Layouts**: `templates/Base.html` with `<slot />` and `{{ title }}`
- **Default landing**: “Hello humans” hero with modern theme (Syne + DM Sans, dark UI). Cookie consent bar and policy pages when enabled.
- **Package manager**: Choose **pnpm** (default), **yarn**, or **npm** at project creation.
- **Security defaults**: Cookie consent banner (optional), CSP, policy pages (configurable)
- **Fast build** and **dev server** with optional live reload (chokidar)

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

**Interactive init** asks for: project name, cookie banner, policy pages, CSP, and **package manager** (pnpm / yarn / npm). Default is **pnpm**. The new project includes a “Hello humans” landing and, if enabled, a cookie consent bar with a clear **Accept** action and links to Cookie and Privacy pages.

## Commands

| Command | Description |
|--------|-------------|
| `mini-astro init` | Interactive: project name, cookies, policies, CSP, package manager (pnpm/yarn/npm) |
| `mini-astro create [name]` | New project with optional name (default: pnpm) |
| `mini-astro build` | Build to `dist/` |
| `mini-astro dev` | Dev server (port 2323 by default) + watch + live reload |
| `mini-astro route <name>` | Add page `src/pages/<name>.html` |
| `mini-astro component <name> [atoms\|molecules\|organisms]` | Add component |

## Project structure

```
src/
  atoms/       # Buttons, links, inputs
  molecules/   # CookieConsentBar, cards
  organisms/   # Header, SubBanner, sections
  templates/   # Base.html with <slot />
  pages/       # index.html, about.html, …
  data/        # site.json, …
public/        # Copied to dist as-is
```

## Config

`mini-astro.config.js`:

```js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: true },
  security: { csp: true, policyPages: true },
};
```

Set `cookies.strict: false` or `security.csp: false` to relax defaults.

## Documentation

Full technical documentation in **[docs/](docs/README.md)**: architecture, configuration, Atomic Design, components, templates, data, security, CLI, dev server and usage guide.

## License

MIT
