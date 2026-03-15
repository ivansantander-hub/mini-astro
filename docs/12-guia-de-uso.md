# Guía de uso

Flujo completo para crear un sitio con mini-astro, editarlo y generar el build.

## Requisitos

- Node.js ≥ 18
- **pnpm** (recomendado), **yarn** o **npm**

## 1. Crear el proyecto

mini-astro no está en el registry de npm. Úsalo desde GitHub:

```bash
npx github:ivansantander-hub/mini-astro init
```

**Opción A — Interactivo (recomendado la primera vez)**

Al ejecutar `init` se pregunta:

- **Nombre del proyecto**
- **Banner de cookies estricto** (Sí/No): si activas, se genera la barra de consentimiento y el usuario solo tiene que pulsar **Accept**; se incluyen enlaces a Cookie Policy y Privacidad.
- **Páginas de políticas** (Cookies y Privacidad): Sí/No
- **CSP estricta por defecto**: Sí/No
- **Package manager**: **pnpm** (por defecto), **yarn** o **npm**. El proyecto se crea con los scripts listos para el gestor elegido.

El proyecto se crea en una subcarpeta. Al final se muestran los comandos para instalar dependencias y arrancar el servidor de desarrollo (por ejemplo `pnpm install` y `pnpm dev`).

**Opción B — Directo (sin preguntas)**

```bash
npx github:ivansantander-hub/mini-astro create mi-sitio
cd mi-sitio
pnpm install
pnpm dev
```

Se usa **pnpm** por defecto. Cookies, políticas y CSP quedan activos.

## 2. Estructura generada

```
mi-sitio/
  mini-astro.config.js
  package.json          (con packageManager: "pnpm@9.0.0" si elegiste pnpm)
  public/
    css/
      theme.css         (tema por defecto: landing + modal de cookies)
    js/
      consent.js        (lógica del modal; solo si cookies strict)
    img/
  src/
    atoms/
    molecules/          (CookieConsentBar.html si cookies strict)
    organisms/
    templates/
      Base.html        (layout con navbar: Home, Cookies, Privacy)
    pages/
      index.html        (landing "Hello humans")
      cookies.html
      privacidad.html   (si policy pages)
    data/
      site.json
```

La página de inicio es una **landing moderna** (“Hello humans”) con tipografía Syne + DM Sans y tema oscuro. Si activaste cookies, un **modal de consentimiento** (Accept all / Decline optional) aparece al cargar; la lógica está en `public/js/consent.js` (compatible con CSP estricta). Ver `COOKIE_CONSENT.md` para usar la elección en tu app.

## 3. Desarrollo local

```bash
pnpm dev
# o yarn dev / npm run dev según lo elegido al crear
```

- Abre **http://localhost:3000**.
- Edita archivos en `src/`; si tienes chokidar instalado, la página se recargará sola tras cada build.

## 4. Añadir una página

Por CLI:

```bash
npx mini-astro route contacto
npx mini-astro route blog/mi-entrada
```

O crea a mano `src/pages/ruta.html` (o `src/pages/blog/mi-entrada.html`). Cada archivo debe tener al menos:

```html
---
layout: Base
title: Título de la página
---
<main>
  <h1>{{ title }}</h1>
  <p>Contenido.</p>
</main>
```

## 5. Añadir un componente

```bash
npx mini-astro component Card
npx mini-astro component Header organisms
```

Luego edita `src/molecules/Card.html` (o `src/organisms/Header.html`) y úsalo en una página o template:

```html
<mini-include src="Card" title="Hola" />
<mini-include src="organisms/Header" />
```

## 6. Usar datos globales

Edita `src/data/site.json`:

```json
{
  "title": "Mi sitio",
  "description": "Descripción"
}
```

En templates o páginas:

```html
<title>{{ site.site.title }}</title>
```

(Asumiendo que el archivo se llama `site.json`, la clave en `site` es `site`.)

## 7. Build para producción

```bash
pnpm build
# o yarn build / npm run build
```

La salida queda en **`dist/`** (o el `outDir` de tu config). Ahí tendrás todo el HTML generado y una copia de `public/` (css, js, img).

## 8. Desplegar

Sube el contenido de **`dist/`** a cualquier hosting estático (Netlify, Vercel, GitHub Pages, S3, etc.). No hace falta Node en el servidor; solo archivos estáticos.

---

Para más detalle técnico, usa el [índice de la documentación](README.md).
