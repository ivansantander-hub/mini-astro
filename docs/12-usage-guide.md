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
- **Strict cookie banner** (Yes/No): if enabled, the consent bar is generated and the user only has to click **Accept**; links to Cookie Policy and Privacy are included.
- **Policy pages** (Cookies and Privacy): Yes/No
- **Strict CSP by default**: Yes/No
- **Package manager**: **pnpm** (default), **yarn** or **npm**. The project is created with scripts ready for the chosen manager.

The project is created in a subfolder. At the end you see the commands to install dependencies and start the dev server (e.g. `pnpm install` and `pnpm dev`).

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
  mini-astro.config.js
  package.json          (with packageManager: "pnpm@9.0.0" if you chose pnpm)
  public/
    css/
      theme.css         (default theme: landing + cookie modal)
    js/
      consent.js        (modal logic; only if cookies strict)
      nav-active.js     (navbar active state)
    img/
  src/
    atoms/
    molecules/          (CookieConsentBar.html if cookies strict)
    organisms/
    templates/
      Base.html        (layout with navbar: Home, Cookies, Privacy)
    pages/
      index.html        (landing "Hello humans")
      cookies.html
      privacy.html      (if policy pages)
    data/
      site.json
```

The home page is a **modern landing** (“Hello humans”) with Syne + DM Sans typography and a dark theme. If you enabled cookies, a **consent modal** (Accept all / Decline optional) appears on load; the logic is in `public/js/consent.js` (CSP-compatible). See `COOKIE_CONSENT.md` for using the choice in your app.

## 3. Local development

```bash
pnpm dev
# or yarn dev / npm run dev depending on what you chose at create
```

- Open **http://localhost:2323** (or the port in your config).
- Edit files in `src/`; if chokidar is installed, the page will reload after each build.

## 4. Add a page

Via CLI:

```bash
npx mini-astro route contact
npx mini-astro route blog/my-post
```

Or create by hand `src/pages/route.html` (or `src/pages/blog/my-post.html`). Each file must have at least:

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

Output goes to **`dist/`** (or your config’s `outDir`). You get all generated HTML and a copy of `public/` (css, js, img).

## 8. Deploy

Upload the contents of **`dist/`** to any static host (Netlify, Vercel, GitHub Pages, S3, etc.). No Node on the server; static files only.

---

For more technical detail, use the [documentation index](README.md).
