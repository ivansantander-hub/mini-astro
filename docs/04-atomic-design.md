# Atomic Design

mini-astro organiza el proyecto siguiendo **Atomic Design** de forma estricta: **quarks → atoms → molecules → organisms → templates → pages**. Esta es la base de cómo trabajar en el proyecto.

## Jerarquía (de abajo hacia arriba)

| Nivel | Carpeta | Uso | CLI |
|-------|---------|-----|-----|
| **0. Quarks** | `src/quarks/` | Design tokens (colores, espaciado, tipografía). No son componentes UI. | `mini-astro quarks` (ver ruta) |
| **1. Atoms** | `src/atoms/` | Bloques mínimos: botones, inputs, iconos, etiquetas. | `mini-astro component <name> atom` |
| **2. Molecules** | `src/molecules/` | Agrupaciones de atoms: cards, formularios simples, CookieConsentBar. | `mini-astro component <name> molecule` |
| **3. Organisms** | `src/organisms/` | Secciones de página: header, footer, listas, galerías. | `mini-astro component <name> organism` |
| **4. Templates** | `src/templates/` | Layouts con `<slot />`; sin contenido final. | `mini-astro template <name>` |
| **5. Pages** | `src/pages/` | Páginas finales (file-based routing). | `mini-astro route <name>` |

Regla de composición: cada nivel solo usa niveles inferiores. Atoms usan quarks (tokens); molecules usan atoms; organisms usan molecules y atoms; templates usan organisms; pages usan templates y componentes.

## Estructura de carpetas

Dentro de `src/` (o el `srcDir` configurado):

```
src/
  quarks/      → tokens.json, README (design tokens)
  atoms/       → Button.html, Input.html, …
  molecules/   → CookieConsentBar.html, Card.html, …
  organisms/   → Header.html, Footer.html, …
  templates/   → Base.html, Blog.html, …
  pages/       → index.html, about.html, blog/post.html, …
  data/        → site.json (datos globales, expuestos como site)
```

## Quarks (nivel 0)

- **No son componentes**: son valores (colores, espaciado, tipografía, bordes, sombras).
- Fuente única de verdad para el diseño. En mini-astro se incluye `src/quarks/tokens.json` por defecto; tu `public/css/theme.css` puede reflejar esos tokens (variables CSS).
- Comando: `mini-astro quarks` muestra la ruta de `quarks/` y su contenido.

## Atoms, molecules, organisms

- Se referencian con `<mini-include src="Nombre" />` (o `atoms/Nombre`, `molecules/Nombre`, `organisms/Nombre`).
- **Resolución**: si no se indica capa, se busca en orden atoms → molecules → organisms; la primera coincidencia gana.
- **Nombres**: PascalCase, archivo `Nombre.html` (ej. `CookieConsentBar.html`).

## Templates y pages

- **Templates**: se eligen con `layout: Nombre` en el frontmatter de la página; el archivo es `src/templates/Nombre.html`. No se incluyen con `<mini-include>`.
- **Pages**: cada archivo en `src/pages/` genera una ruta (URLs limpias). Ver [Páginas y routing](05-paginas-y-routing.md).

## CLI y autocomplete

- Ver todos los comandos: `mini-astro help` o `mini-astro --help`.
- Ayuda por comando: `mini-astro help component`, `mini-astro component --help`, etc.
- Autocomplete en la terminal:
  - Bash: `source <(mini-astro completion bash)` (o añadir a `~/.bashrc`).
  - Zsh: `source <(mini-astro completion zsh)` (o añadir a `~/.zshrc`).

## Siguiente paso

- [Páginas y routing](05-paginas-y-routing.md) — Rutas basadas en archivos y frontmatter.
