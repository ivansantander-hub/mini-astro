# Changelog

All notable changes to mini-astro are documented here.

## 0.2.0

### Breaking changes

- **`{{ var }}` now HTML-escapes** its value (`& < > " '`). New **`{{{ var }}}`** inserts raw HTML.  
  *Migrate:* use `{{{ var }}}` wherever a value intentionally contains HTML.
- **Template frontmatter is no longer output.** Its keys are now defaults for the pages that use the template (page frontmatter overrides them).
- **`pages/x/index.html` builds to `x/index.html`** (previously `x/index/index.html`). `pages/x.html` and `pages/x/index.html` together are now a build error (same URL).
- **Errors that were ignored now fail the build**: component not found, explicit `layout` not found, template without `<slot />` / `<!-- @slot -->`, `mini-astro.config.js` that fails to load / throws / does not export an object or has invalid values, invalid JSON (or failing `.js`) data files.
- **`security.csp` is applied by the build**: every page with a `<head>` and no CSP meta gets one (`true` = default strict policy, a string = that policy, `false` = none). Previously it only affected the scaffold. Set `security: { csp: false }` if you manage the CSP yourself, or remove your own meta to use the config.
- **Removed the SubBanner / marquee special case**: `title1` / `title2` no longer generate `line1content` / `line2content` (with " PROJECTS "); they are ordinary props.  
  *Migrate:* move anything that relied on that generation into the component itself or a build step.
- **Removed config keys** `atomicDesign`, `cookies.strict` and `security.policyPages`. They had no effect on the build; the cookie banner and policy pages are `create` / `init` choices only.

### Fixes

- Components resolve against the configured `srcDir` (previously always `<cwd>/src`); `./X` and `../layer/X` resolve relative to the including file.
- Single rendering pass with one context (template frontmatter < page frontmatter < `site`); components get that context plus their attributes. Output is never re-scanned, so `{{ }}` inside data values is not evaluated.
- `<mini-include>`: attributes with hyphens (`data-id`, `aria-label`), values containing `>` inside quotes, and `<mini-include …></mini-include>` form all work.
- Slot insertion keeps `$&` / `$1` in page content literal.
- Config: nested objects are deep-merged with the defaults; values are validated (`outDir` must not be the project root or overlap `srcDir`, valid `dev.port`, `security.csp` boolean or string).
- Stale output: files a previous build wrote (pages and copied public files) that were not written again are deleted, tracked in `.mini-astro/manifest.json`. Files mini-astro did not write are never touched; the first build after upgrading removes nothing.
- Dev server: watches `srcDir`, `public/`, `dataDir` and the config; rebuilds on add/change/delete (debounced, serialized). A failed build no longer stops the server: HTML requests get a 500 error page that auto-reloads when fixed; assets are still served. URLs are decoded, paths cannot escape `outDir`, and more MIME types are served (fonts, images, audio/video, gltf/glb, pdf…).
- CLI: `mini-astro add` / `add atom|molecule|organism|template|page` run the interactive flow (previously a duplicate case always created a route). `component` creates the layer directory if missing. Unknown flags print an error without a stack trace.
- Prompts share a single line reader: with piped stdin, `init` used to exit 0 without creating anything because the first readline interface swallowed all lines. Answers are now consumed in order and, once stdin ends, remaining questions use their defaults. Defaults are shown as `[Y]`.
- Scaffold: links to the policy pages (header, home footer, consent banner) are only generated when policy pages are generated.

### Added

- `{{{ var }}}` raw output; attribute values can reference context with `{{ var }}` (e.g. `href="{{ base }}/x"`).
- Data files `*.js` / `*.mjs` (default export object or (async) function returning one) → `site.<basename>`.
- `mini-astro add page <route>` creates the page directly.
- `PORT=0` picks a free port for `dev`.
- `init` can be scripted: `printf 'mysite\nn\nn\nn\n4321\nnpm\n' | mini-astro init`.
- Scaffold writes `.gitignore` (`node_modules/`, `dist/`, `.mini-astro/`) and puts its CSP (allowing Google Fonts) in `mini-astro.config.js` instead of hardcoding it in `Base.html`.
- Test suite: `npm test` runs `node --test` (no dependencies), 55 tests.
- `LICENSE` (MIT).

## 0.1.0

- Initial alpha release.
