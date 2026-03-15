# Atomic Design

mini-astro organizes the project following **Atomic Design** strictly: **quarks → atoms → molecules → organisms → templates → pages**. This is the basis for how to work in the project.

## Hierarchy (bottom to top)

| Level | Folder | Use | CLI |
|-------|--------|-----|-----|
| **0. Quarks** | `src/quarks/` | Design tokens (colors, spacing, typography). Not UI components. | `mini-astro quarks` (show path) |
| **1. Atoms** | `src/atoms/` | Minimal blocks: buttons, inputs, icons, labels. | `mini-astro component <name> atom` |
| **2. Molecules** | `src/molecules/` | Groups of atoms: cards, simple forms, CookieConsentBar. | `mini-astro component <name> molecule` |
| **3. Organisms** | `src/organisms/` | Page sections: header, footer, lists, galleries. | `mini-astro component <name> organism` |
| **4. Templates** | `src/templates/` | Layouts with `<slot />`; no final content. | `mini-astro template <name>` |
| **5. Pages** | `src/pages/` | Final pages (file-based routing). | `mini-astro route <name>` |

Composition rule: each level only uses lower levels. Atoms use quarks (tokens); molecules use atoms; organisms use molecules and atoms; templates use organisms; pages use templates and components.

## Folder structure

Inside `src/` (or the configured `srcDir`):

```
src/
  quarks/      → tokens.json, README (design tokens)
  atoms/       → NavLink.html, Button.html, Input.html, …
  molecules/   → CookieConsentBar.html, Card.html, …
  organisms/   → SiteHeader.html, Footer.html, …
  templates/   → Base.html, Blog.html, …
  pages/       → index.html, about.html, blog/post.html, …
  data/        → site.json (global data, exposed as site)
```

The scaffold includes an example **atom** (`NavLink`) and an **organism** (`SiteHeader`). The Base template uses `<mini-include src="organisms/SiteHeader" />`; SiteHeader in turn uses `<mini-include src="atoms/NavLink" />` for each nav link.

## Quarks (level 0)

- **Not components**: they are values (colors, spacing, typography, borders, shadows).
- Single source of truth for design. mini-astro includes `src/quarks/tokens.json` by default; your `public/css/theme.css` can reflect those tokens (CSS variables).
- Command: `mini-astro quarks` shows the path to `quarks/` and its contents.

## Atoms, molecules, organisms

- Referenced with `<mini-include src="Name" />` (or `atoms/Name`, `molecules/Name`, `organisms/Name`).
- **Resolution**: if layer is not specified, search order is atoms → molecules → organisms; first match wins.
- **Names**: PascalCase, file `Name.html` (e.g. `CookieConsentBar.html`).

## Templates and pages

- **Templates**: chosen with `layout: Name` in the page frontmatter; the file is `src/templates/Name.html`. They are not included with `<mini-include>`.
- **Pages**: each file in `src/pages/` generates a route (clean URLs). See [Pages and routing](05-pages-and-routing.md).

## CLI and autocomplete

- List all commands: `mini-astro help` or `mini-astro --help`.
- Help per command: `mini-astro help component`, `mini-astro component --help`, etc.
- Terminal autocomplete:
  - Bash: `source <(mini-astro completion bash)` (or add to `~/.bashrc`).
  - Zsh: `source <(mini-astro completion zsh)` (or add to `~/.zshrc`).

## Next step

- [Pages and routing](05-pages-and-routing.md) — File-based routes and frontmatter.
