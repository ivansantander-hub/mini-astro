# Páginas y routing

mini-astro usa **file-based routing**: cada archivo HTML en `src/pages/` (y sus subcarpetas) se convierte en una ruta en el sitio.

## Reglas de rutas y salida del build

El build escribe en `outDir` (por defecto `dist/`) **la misma ruta relativa** que el archivo tiene en `src/pages/`:

| Origen | Salida en dist | URL servida (por defecto) |
|--------|----------------|---------------------------|
| `src/pages/index.html` | `dist/index.html` | `/` (resuelta por el servidor como índice) |
| `src/pages/foo.html` | `dist/foo.html` | `/foo.html` |
| `src/pages/blog/post.html` | `dist/blog/post.html` | `/blog/post.html` |

No hay rutas dinámicas (`[slug].html`) ni reescritura de extensiones en el build. La URL coincide con la ruta relativa del archivo; por tanto, las URLs incluyen `.html` salvo la raíz.

Para entender **por qué** algunas URLs pueden verse “limpias” (sin `.html`) y cómo conseguirlo con reglas del servidor, ver [URLs limpias y resolución en el servidor](05b-urls-limpias.md).

## Estructura de una página

Cada página puede tener:

1. **Frontmatter** (opcional): bloque YAML entre `---` al inicio.
2. **Body**: el HTML que se inyecta en el `<slot />` del layout.

Ejemplo:

```html
---
layout: Base
title: Mi página
---
<main>
  <h1>{{ title }}</h1>
  <p>Contenido de la página.</p>
</main>
```

- `layout` indica qué template de `src/templates/` usar. Si se omite, se usa **Base**.
- `title` (y cualquier otra clave) se añade al contexto y se puede usar en el template o en el body con `{{ title }}`, `{{ site.xxx }}`, etc.

## Frontmatter

- **Formato**: líneas `clave: valor` entre el primer `---` y el segundo `---`. El valor se recorta; si está entre comillas simples o dobles, se quitan.
- **Uso**: todas las claves del frontmatter están disponibles en el contexto de la página (template + body + componentes incluidos en la página). Además, el objeto `site` (datos de `src/data/*.json`) se inyecta en el contexto.
- No hay tipos especiales: todo es string en el frontmatter; los números o booleanos en JSON de `data/` se mantienen en `site`.

## Orden de procesamiento (resumen)

1. Se parsea el frontmatter y se obtiene el body.
2. Se carga el template indicado por `layout` (por defecto Base).
3. En el template se sustituyen `{{ ... }}` con el contexto (frontmatter + `site`).
4. Se reemplaza `<slot />` (o `<!-- @slot -->`) por el body de la página.
5. Se resuelven todos los `<mini-include ... />` en el HTML resultante (recursivo).
6. Se hace una última pasada de `replaceVars` con el mismo contexto.
7. El HTML final se escribe en `dist/<ruta>.html` (misma ruta relativa que en `src/pages/`).

## Requisitos del build

- Debe existir el directorio `src/pages/` (definido por `srcDir` + `pages`).
- Debe existir al menos un template (por defecto `Base`) en `src/templates/` para que las páginas que usen `layout: Base` (o sin layout) construyan bien.

## Siguiente paso

- [URLs limpias y resolución en el servidor](05b-urls-limpias.md) — Por qué algunas URLs no llevan `.html` y cómo funciona la resolución en el servidor.
- [Componentes](06-componentes.md) — Uso de `<mini-include>` y props.
