# Usage guide

Full flow to create a site with mini-astro, edit it and produce the build.

## Requirements

- Node.js ≥ 18
- **pnpm** (recommended), **yarn** or **npm**

## 1. Create the project

mini-astro is not on the npm registry. Use it from GitHub:

```bash
npx github:ivansantander-hub/mini-astro init
```

**Option A — Interactive (recommended the first time)**

When you run `init` you are asked:

- **Project name**
- **Strict cookie banner** (Yes/No): if enabled, the consent bar is generated and the user only has to click **Accept**; links to Cookie Policy and Privacy are included when policy pages are generated.
- **Policy pages** (Cookies and Privacy): Yes/No
- **Strict CSP by default**: Yes/No (stored as `security.csp` in `mini-astro.config.js`)
- **Dev server port**: default 2323
- **Package manager**: **pnpm** (default), **yarn** or **npm**. The project is created with scripts ready for the chosen manager.

The project is created in a subfolder. At the end you see the commands to install dependencies and start the dev server (e.g. `pnpm install` and `pnpm dev`). Answers can also be piped from a script; see [CLI](10-cli.md#init-name).

**Option B — Direct (no prompts)**

```bash
npx github:ivansantander-hub/mini-astro create my-site
cd my-site
pnpm install
pnpm dev
```

**pnpm** is used by default. Cookies, policies and CSP are enabled.

## 2. Generated structure

```
my-site/
  .gitignore            (node_modules/, dist/, .mini-astro/)
  mini-astro.config.js  (dirs, dev.port, security.csp)
  package.json          (build / dev scripts)
  COOKIE_CONSENT.md     (only if cookie banner)
  public/
    css/
      theme.css         (default theme: landing + cookie modal)
    js/
      consent.js        (modal logic; only if cookie banner)
      nav-active.js     (navbar active state)
    img/
  src/
    quarks/
      tokens.json       (design tokens)
    atoms/
      NavLink.html
    molecules/          (CookieConsentBar.html if cookie banner)
    organisms/
      SiteHeader.html   (navbar: Home, plus Cookies and Privacy if policy pages)
    templates/
      Base.html         (layout with the header)
    pages/
      index.html        (landing "Hello humans")
      cookies.html      (if policy pages)
      privacy.html      (if policy pages)
    data/
      site.json
```

The home page is a **modern landing** (“Hello humans”) with Orbitron + DM Sans typography and a dark theme. If you enabled cookies, a **consent modal** (Accept all / Decline optional) appears on load; the logic is in `public/js/consent.js` (CSP-compatible). See `COOKIE_CONSENT.md` for using the choice in your app.

## 3. Local development

```bash
pnpm dev
# or yarn dev / npm run dev depending on what you chose at create
```

- Open **http://localhost:2323** (or the port in your config).
- Edit files in `src/`, `public/`, `src/data/` or the config; the page reloads after each build. If a build fails, the browser shows the error until you fix it.

## 4. Add a page

Via CLI:

```bash
npx mini-astro route contact
npx mini-astro route blog/my-post
```

Or create by hand `src/pages/route.html` (or `src/pages/blog/my-post.html`; use `src/pages/blog/index.html` for `/blog`). A typical page:

```html
---
layout: Base
title: Page title
---
<main>
  <h1>{{ title }}</h1>
  <p>Content.</p>
</main>
```

## 5. Add a component

```bash
npx mini-astro component Card
npx mini-astro component Header organism
```

Then edit `src/molecules/Card.html` (or `src/organisms/Header.html`) and use it in a page or template:

```html
<mini-include src="Card" title="Hello" />
<mini-include src="organisms/Header" />
```

Components see the page context (frontmatter and `site`) plus their own attributes. `{{ title }}` inside the component is HTML-escaped; use `{{{ html }}}` for a trusted value that contains HTML.

## 6. Use global data

Edit `src/data/site.json`:

```json
{
  "title": "My site",
  "description": "Description"
}
```

In templates or pages:

```html
<title>{{ site.site.title }}</title>
```

(Assuming the file is named `site.json`, the key under `site` is `site`.)

## 7. Production build

```bash
pnpm build
# or yarn build / npm run build
```

Output goes to **`dist/`** (or your config’s `outDir`). You get all generated HTML (with the CSP meta from `security.csp`) and a copy of `public/` (css, js, img). Files from a previous build that no longer have a source (renamed or deleted pages, removed public files) are deleted; other files in `dist/` are left alone.

## 8. Deploy

Upload the contents of **`dist/`** to any static host (Netlify, Vercel, GitHub Pages, S3, etc.). No Node on the server; static files only.

---

For more technical detail, use the [documentation index](README.md).
