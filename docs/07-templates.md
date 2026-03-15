# Templates

Los **templates** son layouts que definen la estructura común de las páginas (doctype, head, body, cabecera, pie, etc.) y dejan un hueco para el contenido de cada página mediante un **slot**.

## Ubicación

- Directorio: `src/templates/` (relativo al `srcDir`).
- Cada archivo es un layout: `Base.html`, `Blog.html`, etc. La página elige el layout con el frontmatter `layout: Base`.
- El scaffold genera un **Base** con navbar (Home y, si aplica, Cookies y Privacy) para poder volver al inicio desde cualquier página.

## Slot

En el HTML del template, el contenido de la página se inyecta donde pongas:

- **`<slot />`**  
  o  
- **`<!-- @slot -->`** (insensible a mayúsculas)

Solo se reemplaza la **primera** ocurrencia. Si pones varios, solo el primero se sustituye por el body de la página.

Ejemplo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
</head>
<body>
  <header>...</header>
  <slot />
  <footer>...</footer>
</body>
</html>
```

## Variables en templates

Puedes usar **variables** con la sintaxis `{{ clave }}` o `{{ site.clave }}`:

- **Clave simple**: proviene del frontmatter de la página (ej. `{{ title }}`) o del contexto inyectado (ej. `site`).
- **Con punto**: para propiedades anidadas, por ejemplo `{{ site.title }}`, `{{ site.description }}`. El motor resuelve el “path” sobre el objeto contexto.

Todas las sustituciones usan el **pageContext** (frontmatter + `site`). No hay condicionales ni bucles en el lenguaje de templates; solo sustitución de cadenas.

## Orden de operaciones en el build

1. Se carga el template según `layout`.
2. **replaceVars(template, pageContext)** en el template (sustituye `{{ title }}`, `{{ site.xxx }}`, etc.).
3. **replaceSlot(template, body)** — se reemplaza `<slot />` por el HTML de la página.
4. **resolveIncludes(html)** — se resuelven todos los `<mini-include>` (incluidos los que estén en el template o en el body).
5. **replaceVars(html, pageContext)** de nuevo sobre el HTML completo.

Así, el template puede contener tanto variables como componentes; el body de la página también.

## Template por defecto

Si en el frontmatter no se pone `layout` o la página no tiene frontmatter, se usa el layout **Base** (`src/templates/Base.html`). Debe existir para que el scaffold y la mayoría de sitios funcionen.

## Siguiente paso

- [Datos](08-datos.md) — Uso de `src/data/` y `site`.
