# Security

mini-astro includes default options focused on privacy and security: cookie consent, CSP and policy pages. All are configurable.

## Cookies (strict)

- **Config**: `cookies.strict` in `mini-astro.config.js` (default `true`).
- **Scaffold effect**: if `strict` is true, the **CookieConsentBar** component (modal) is generated in `src/molecules/`, the logic in **`public/js/consent.js`** and the **`COOKIE_CONSENT.md`** doc at the root.
- **Modal**: overlay with centred card, short text, links to Cookie Policy and Privacy, and two actions: **Accept all** and **Decline optional**. On **policy pages** (`/cookies`, `/privacy`) the modal is not shown: the user can read the content and choose from a fixed, non-intrusive bar at the bottom (same Accept/Decline choice). This allows reading the policy before deciding.
- **Storage**: consent is **client-side** in `localStorage` (key `mini-astro-consent`, values `"accepted"` or `"declined"`). On a **static** site there is no server to write httpOnly cookies; the preference is used in the browser (`body.dataset.consent` and event `mini-astro-consent`). See `COOKIE_CONSENT.md` for use in your app and for contrast with server apps (session cookies, middleware).
- **CSP**: the modal logic lives in `/js/consent.js` (no inline scripts), compatible with `script-src 'self'`.

## CSP (Content-Security-Policy)

- **Config**: `security.csp` in `mini-astro.config.js` (default `true`).
- **Scaffold effect**: the Base template gets a meta tag with `script-src 'self'` (only scripts from your origin; **no** `'unsafe-inline'`). Consent logic goes in `public/js/consent.js` to comply with CSP.
- Policy: `default-src 'self'`; `script-src 'self'`; `style-src 'self' 'unsafe-inline'` and Google Fonts; `font-src` and `img-src` as needed. For more scripts or domains, edit the meta in the template.
- If you create the project with `csp: false`, the Base template does not include this meta.

## Policy pages

- **Config**: `security.policyPages` (default `true`).
- **Scaffold effect**: two pages are generated in `src/pages/`:
  - **cookies.html** — Cookie Policy (route `/cookies`).
  - **privacy.html** — Privacy Policy (route `/privacy`).
- Both use the Base layout and placeholder content you can edit. The cookie banner links to these routes.
- If you do not want these pages, create the project with `policyPages: false` or delete/edit the files afterwards.

## Configuration summary

| Option | Default | Effect |
|--------|---------|--------|
| `cookies.strict` | `true` | Include CookieConsentBar and links in the generated Base. |
| `security.csp` | `true` | Inject CSP meta in the generated Base head. |
| `security.policyPages` | `true` | Generate cookies.html and privacy.html in the scaffold. |

These options only affect the **scaffold** (init/create). A later build does not re-inject or remove anything; you maintain or edit the HTML of templates and pages.

## Next step

- [CLI](10-cli.md) — Commands and options.
