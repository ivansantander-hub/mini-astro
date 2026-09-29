/**
 * CLI help texts (Atomic Design aligned)
 */

export const MAIN_HELP = `
mini-astro — Static site framework (security-first, Atomic Design)

Atomic Design hierarchy (quarks → atoms → molecules → organisms → templates → pages)

Usage:
  mini-astro init                    Interactive: create new project
  mini-astro create [name]           Create project (optional name)
  mini-astro new [name]              Alias for create
  mini-astro build                   Build to dist/
  mini-astro dev                     Dev server (PORT=2323) + live reload

  mini-astro quarks                  Show quarks (design tokens) path / info
  mini-astro component <name> [layer]  Add atom | molecule | organism
  mini-astro template <name>         Add template (layout)
  mini-astro route <name>            Add page (file-based routing)
  mini-astro page <name>             Alias for route
  mini-astro add [type]              Interactive: atom|molecule|organism|template|page

  mini-astro completion [bash|zsh]   Print shell completion script
  mini-astro help [command]          Help for a command

Options:
  -C, --cwd <dir>   Run in directory
  -h, --help        Show help

Examples:
  mini-astro component Button atom
  mini-astro component SearchForm molecule
  mini-astro component Header organism
  mini-astro template Blog
  mini-astro route about
  mini-astro route blog/post
  mini-astro add                  # interactive: asks type then name
  mini-astro add atom             # interactive: asks component name
`.trim();

export const COMMAND_HELP = {
  init: `
mini-astro init — Create project interactively

  Asks: project name, cookie banner, policy pages, CSP, package manager.
`.trim(),
  create: `
mini-astro create [name] — Create new project

  name   Optional. Default: my-site (or directory name)
`.trim(),
  build: `
mini-astro build — Build static site to dist/

  Uses mini-astro.config.js (srcDir, outDir, dataDir, security.csp).
  Output: clean URLs — pages/about.html → about/index.html, pages/blog/index.html → blog/index.html.
  {{ var }} is HTML-escaped; {{{ var }}} inserts raw HTML.
  Files written by the previous build that were not written again are removed
  (tracked in .mini-astro/manifest.json).
`.trim(),
  dev: `
mini-astro dev — Dev server + optional live reload

  Port: dev.port in mini-astro.config.js (default 2323), or PORT env. Host: 0.0.0.0.
  Watches srcDir, public/, dataDir and the config; rebuilds on add, change and delete.
  A failed build keeps the server running and shows the error in the browser.
`.trim(),
  quarks: `
mini-astro quarks — Design tokens (Atomic level 0)

  Quarks live in src/quarks/ (e.g. tokens.json). Not UI components; only tokens (colors, spacing, typography).
  They cannot be used with <mini-include>; consume them from CSS or a build step.
`.trim(),
  component: `
mini-astro component <name> [layer] — Add component (atoms | molecules | organisms)

  name   Component name (PascalCase), e.g. Button, CookieConsentBar
  layer  atom | molecule | organism  (default: molecule)

  Creates src/<layer>/<Name>.html. Use <mini-include src="Name" /> in pages/templates.
  Components see the page context (frontmatter + site) plus their own attributes.
`.trim(),
  template: `
mini-astro template <name> — Add template (Atomic: layouts)

  name   Template name, e.g. Base, Blog, Auth

  Creates src/templates/<name>.html. Use in pages: layout: Name in frontmatter.
`.trim(),
  route: `
mini-astro route <name> — Add page (Atomic: pages, file-based routing)

  name   Route path, e.g. about → src/pages/about.html, blog/post → src/pages/blog/post.html

  URL will be /about, /blog/post (clean URLs).
`.trim(),
  page: 'Same as route. mini-astro page <name>',
  add: `
mini-astro add [type] — Interactive: create any Atomic level

  type   Optional. atom | molecule | organism | template | page
  If omitted, asks what to create. Then asks name (and layer for components, layout for pages).
  mini-astro add page <route>   creates the page without prompts.
`.trim(),
  completion: `
mini-astro completion [bash|zsh] — Shell autocomplete

  Prints a completion script. Install:

    # Bash
    source <(mini-astro completion bash)
    # or add to ~/.bashrc

    # Zsh
    source <(mini-astro completion zsh)
    # or add to ~/.zshrc
`.trim(),
};
