# Guía de uso

Flujo completo para crear un sitio con mini-astro, editarlo y generar el build.

## Requisitos

- Node.js ≥ 18
- npm o similar

## 1. Crear el proyecto

**Opción A — Interactivo (recomendado la primera vez)**

```bash
npx mini-astro init
```

Responder a las preguntas (nombre, cookies, políticas, CSP). El proyecto se crea en una subcarpeta con el nombre indicado.

**Opción B — Directo**

```bash
npx mini-astro create mi-sitio
cd mi-sitio
```

Esto crea la estructura con opciones por defecto (cookies estrictas, CSP, páginas de políticas).

## 2. Estructura generada

```
mi-sitio/
  mini-astro.config.js
  package.json
  public/
    css/ js/ img/
  src/
    atoms/
    molecules/     (CookieConsentBar.html si cookies strict)
    organisms/
    templates/
      Base.html
    pages/
      index.html
      cookies.html
      privacidad.html   (si policy pages)
    data/
      site.json
```

## 3. Desarrollo local

```bash
npm run dev
# o
npx mini-astro dev
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
npm run build
# o
npx mini-astro build
```

La salida queda en **`dist/`** (o el `outDir` de tu config). Ahí tendrás todo el HTML generado y una copia de `public/` (css, js, img).

## 8. Desplegar

Sube el contenido de **`dist/`** a cualquier hosting estático (Netlify, Vercel, GitHub Pages, S3, etc.). No hace falta Node en el servidor; solo archivos estáticos.

---

Para más detalle técnico, usa el [índice de la documentación](README.md).
