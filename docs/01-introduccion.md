# Introducción a mini-astro

## Qué es mini-astro

**mini-astro** es un generador de sitios estáticos (SSG) inspirado en [Astro](https://astro.build), pensado para sitios muy simples. Genera HTML estático a partir de:

- Páginas en `src/pages/` (file-based routing)
- Componentes organizados por **Atomic Design** (atoms, molecules, organisms)
- Templates con slot y variables
- Datos globales en `src/data/`

No hay bundling de JS/CSS: el build solo resuelve HTML (frontmatter, layouts, includes) y copia `public/` a la salida. El resultado son archivos estáticos que puedes desplegar en cualquier hosting.

## Pilares

1. **Seguridad por defecto**  
   Opciones estrictas de cookies (banner de consentimiento), CSP y páginas de políticas. Todo se puede relajar o desactivar en la configuración.

2. **Velocidad**  
   Sin compilación pesada: el build es rápido y el dev server arranca en poco tiempo. Objetivo: sitios de decenas de páginas en segundos.

3. **Atomic Design**  
   Estructura por defecto: atoms → molecules → organisms → templates → pages. Ver [Atomic Design](04-atomic-design.md).

## Características principales

| Característica | Descripción |
|----------------|-------------|
| File-based routing | Cada `src/pages/*.html` (y subcarpetas) se convierte en una ruta. |
| Frontmatter | YAML entre `---` al inicio de cada página (layout, title, etc.). |
| Componentes | `<mini-include src="Nombre" />` con props opcionales. |
| Templates | Layouts con `<slot />` y variables `{{ title }}`, `{{ site.key }}`. |
| Landing por defecto | Página de inicio “Hello humans” con tema moderno (Syne, DM Sans, oscuro) y `public/css/theme.css`. |
| Package manager | En `init` eliges **pnpm** (por defecto), **yarn** o **npm**; el proyecto queda configurado para el elegido. |
| Datos globales | Archivos en `src/data/*.json` expuestos como `site` en el contexto. |
| Cookies / CSP | Barra de consentimiento (Accept claro) y páginas de políticas; configurables. |
| Dev server | Servidor HTTP sobre `dist/`, watch en `src/` y live reload (con chokidar). |

## Limitaciones (v1)

- Sin rutas dinámicas (`[slug].html`).
- Sin Markdown/MDX; solo HTML.
- Sin “islands” ni hidratación de frameworks.
- Sin condicionales ni bucles en el lenguaje de templates; los “bucles” se hacen repitiendo `<mini-include>` con distintos props.

## Requisitos

- **Node.js** ≥ 18
- Uso del CLI: `npx mini-astro` o instalación global/local del paquete

## Siguiente paso

- [Arquitectura](02-arquitectura.md) — Cómo está construido el paquete por dentro.
