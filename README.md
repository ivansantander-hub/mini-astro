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
- **Security defaults**: Cookie consent banner (optional), CSP, policy pages (configurable)
- **Fast build** and **dev server** with optional live reload (chokidar)

## Quick start

```bash
npx mini-astro init
# or
npx mini-astro create my-site
cd my-site
npm run dev
```

## Commands

| Command | Description |
|--------|-------------|
| `mini-astro init` | Interactive: project name, cookies, policies, CSP |
| `mini-astro create [name]` | New project with optional name |
| `mini-astro build` | Build to `dist/` |
| `mini-astro dev` | Dev server (port 3000) + watch + live reload |
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

## Documentación

Documentación técnica completa en **[docs/](docs/README.md)**: arquitectura, configuración, Atomic Design, componentes, templates, datos, seguridad, CLI, dev server y guía de uso.

## License

MIT
