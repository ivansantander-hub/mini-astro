# Atomic Design

mini-astro organiza los componentes en capas inspiradas en **Atomic Design**: atoms → molecules → organisms. Los **templates** y las **pages** completan la jerarquía.

## Estructura de carpetas

Dentro de `src/` (o el `srcDir` configurado):

| Carpeta | Uso |
|---------|-----|
| `atoms/` | Componentes mínimos (botones, iconos, etiquetas). |
| `molecules/` | Agrupaciones pequeñas (CookieConsentBar, cards, formularios simples). |
| `organisms/` | Bloques de página (header, footer, listas de proyectos). |
| `templates/` | Layouts que definen la estructura de la página y contienen `<slot />`. |
| `pages/` | Páginas finales (file-based routing). |
| `data/` | JSON de datos globales (expuestos como `site`). |

No es obligatorio usar las tres capas; puedes tener solo molecules y organisms. Lo importante es que los componentes referenciados con `<mini-include src="Nombre" />` existan en una de esas carpetas (o se indique la capa: `organisms/Header`).

## Resolución de componentes

Cuando el build encuentra `<mini-include src="X" />`:

1. **Si `X` contiene `/`** (ej. `organisms/Header`):  
   Se busca solo en esa capa. La ruta es `src/<capa>/<nombre>.html` (ej. `src/organisms/Header.html`).

2. **Si `X` no contiene `/`**:  
   Se busca en este orden:
   - `src/atoms/X.html`
   - `src/molecules/X.html`
   - `src/organisms/X.html`

La primera coincidencia gana. El nombre del archivo debe coincidir con el `src` (case-sensitive en sistemas que lo son). Se añade `.html` automáticamente si no está en el atributo.

El directorio base para estas rutas es el **cwd** del proyecto (donde está `mini-astro.config.js`), no la carpeta del paquete mini-astro.

## Convenciones recomendadas

- **Nombres**: PascalCase para componentes (ej. `CookieConsentBar`, `ProjectCard`). El nombre del archivo debe ser el mismo: `CookieConsentBar.html`.
- **Atoms**: un solo elemento o un bloque muy pequeño, reutilizable en cualquier contexto.
- **Molecules**: varios atoms o contenido corto; por ejemplo barras de consentimiento, cards.
- **Organisms**: secciones completas de página (header con nav, listas de proyectos, galerías).

## Relación con templates y pages

- **Templates** no se incluyen con `<mini-include>`. Se eligen por el frontmatter `layout: Nombre` en la página; el archivo debe estar en `src/templates/Nombre.html`.
- **Pages** son el punto de entrada; cada archivo en `src/pages/` (y subcarpetas) genera una ruta. Ver [Páginas y routing](05-paginas-y-routing.md).

## Siguiente paso

- [Páginas y routing](05-paginas-y-routing.md) — Rutas basadas en archivos y frontmatter.
