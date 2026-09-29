# Security

mini-astro includes default options focused on privacy and security: escaped output, a CSP injected by the build, and (in the scaffold) cookie consent and policy pages.

## Escaped output

`{{ var }}` HTML-escapes the value (`&`, `<`, `>`, `"`, `'`), so data and frontmatter cannot inject markup by accident. Use `{{{ var }}}` only for trusted values that intentionally contain HTML. Output is rendered in a single pass and never re-scanned, so `{{ }}` inside a data value is not evaluated.

## CSP (Content-Security-Policy)

- **Config**: `security.csp` in `mini-astro.config.js` (default `true`).
- **Applied by the build** to every page:
  - `true` → the default strict policy (`DEFAULT_CSP` in `src/loadConfig.js`):  
    `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`
  - a **string** → that policy, as-is.
  - `false` → no CSP meta.
- The `<meta http-equiv="Content-Security-Policy" …>` is inserted right after `<meta charset>` (or, if there is none, right after `<head>`). It is only added to documents that have a `<head>` and do **not** already declare a CSP meta, so a page or template with its own CSP meta keeps it.
- **Scaffold**: projects created with CSP enabled get their policy in `mini-astro.config.js` (not hardcoded in `Base.html`). It allows Google Fonts, used by the starter theme:  
  `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'`  
  If you answer “no” to CSP at `init`, the config gets `security: { csp: false }`.  
  Do not switch a scaffolded project to `csp: true`: the default policy blocks Google Fonts (`font-src 'self'`), so the starter theme would lose its fonts.
- `script-src 'self'` means no inline scripts: consent logic lives in `public/js/consent.js` and the dev server’s live reload uses an external script. For more scripts or domains, edit the policy string in the config.

## Cookies (consent banner)

- **Chosen at `create` / `init`** (“Strict cookie consent banner?”, default yes). It is not a config option: the build does not add or remove the banner; it is just files in your project.
- **Scaffold effect**: if enabled, the **CookieConsentBar** component (modal) is generated in `src/molecules/`, the logic in **`public/js/consent.js`** and the **`COOKIE_CONSENT.md`** doc at the root. `Base.html` includes the component and the script.
- **Modal**: overlay with centred card, short text, links to Cookie Policy and Privacy (only when policy pages are generated), and two actions: **Accept all** and **Decline optional**. On **policy pages** (`/cookies`, `/privacy`) the modal is not shown: the user can read the content and choose from a fixed, non-intrusive bar at the bottom (same Accept/Decline choice). This allows reading the policy before deciding.
- **Storage**: consent is **client-side** in `localStorage` (key `mini-astro-consent`, values `"accepted"` or `"declined"`). On a **static** site there is no server to write httpOnly cookies; the preference is used in the browser (`body.dataset.consent` and event `mini-astro-consent`). See `COOKIE_CONSENT.md` for use in your app and for contrast with server apps (session cookies, middleware).

## Policy pages

- **Chosen at `create` / `init`** (“Generate Cookies and Privacy pages?”, default yes). Not a config option.
- **Scaffold effect**: two pages are generated in `src/pages/`:
  - **cookies.html** — Cookie Policy (route `/cookies`).
  - **privacy.html** — Privacy Policy (route `/privacy`).
- Both use the Base layout and placeholder content you can edit. The header nav, the home page footer and the cookie banner link to these routes **only when the pages are generated**, so a project without them has no broken links.
- If you do not want these pages, answer “no” at `init` or delete the files (and their links) afterwards.

## Summary

| Setting | Where | Default | Effect |
|---------|-------|---------|--------|
| `security.csp` | `mini-astro.config.js` | `true` | CSP meta injected by every build. |
| Cookie consent banner | `create` / `init` | yes | CookieConsentBar, `consent.js` and `COOKIE_CONSENT.md` in the scaffold. |
| Policy pages | `create` / `init` | yes | `cookies.html`, `privacy.html` and links to them in the scaffold. |

Only `security.csp` affects later builds. The cookie banner and policy pages are scaffold choices; after creation you maintain or edit those files like any other.

## Next step

- [CLI](10-cli.md) — Commands and options.
