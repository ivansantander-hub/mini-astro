# Referencia rápida

## Sintaxis

| Elemento | Sintaxis | Ejemplo |
|----------|----------|---------|
| Variable | `{{ clave }}` o `{{ site.archivo.prop }}` | `{{ title }}`, `{{ site.site.description }}` |
| Slot (solo en template) | `<slot />` o `<!-- @slot -->` | Una sola sustitución por template |
| Componente | `<mini-include src="Nombre" />` con props opcionales | `<mini-include src="Card" title="Hola" />` |
| Componente en capa concreta | `src="capa/Nombre"` | `<mini-include src="organisms/Header" />` |
| Frontmatter | `---` / `key: value` / `---` | `layout: Base`, `title: Página` |

## Estructura de carpetas (src/)

```
src/
  atoms/       → componentes mínimos
  molecules/   → componentes pequeños
  organisms/   → bloques de página
  templates/   → layouts (Base.html, etc.)
  pages/       → file-based routing (*.html → dist/<ruta>/index.html; URLs limpias sin .html)
  data/        → *.json → site.nombreArchivo
```

## Config (mini-astro.config.js)

- `srcDir`, `outDir`, `dataDir`, `atomicDesign`, `cookies.strict`, `security.csp`, `security.policyPages`.

## Comandos frecuentes

Desde GitHub (no está en npm):

```bash
npx github:ivansantander-hub/mini-astro init
npx github:ivansantander-hub/mini-astro create mi-sitio
npx github:ivansantander-hub/mini-astro build
npx github:ivansantander-hub/mini-astro dev
npx github:ivansantander-hub/mini-astro route blog/entrada
npx github:ivansantander-hub/mini-astro component Card
npx github:ivansantander-hub/mini-astro component Header organisms
```

Tras crear el proyecto: `pnpm install` (o yarn/npm) y `pnpm dev`. Por defecto se usa **pnpm**; en `init` puedes elegir yarn o npm.

## URLs y servidor

- Rutas: una por archivo en `src/pages/`; salida en `dist/` como `<ruta>/index.html` (p. ej. `cookies.html` → `dist/cookies/index.html` → URL `/cookies`). La raíz `/` es `dist/index.html`. Ver [05b-urls-limpias.md](05b-urls-limpias.md).

## Limitaciones

- Sin rutas dinámicas (`[slug].html`).
- Sin Markdown/MDX.
- Un solo `<slot />` por template (solo la primera ocurrencia se reemplaza).
- Componentes: profundidad máxima 20 para `<mini-include>` anidados.
- Datos: solo JSON en `data/`; no hay `data.js`.
