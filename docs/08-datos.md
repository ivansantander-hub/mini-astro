# Datos

mini-astro carga datos globales desde archivos **JSON** en el directorio de datos y los expone en todas las páginas bajo el objeto **`site`**.

## Directorio de datos

- Por defecto: **`src/data`** (configurable con `dataDir` en `mini-astro.config.js`).
- Ruta absoluta: `path.resolve(cwd, config.dataDir)`.
- Solo se leen **archivos** en ese directorio (no subcarpetas).
- Solo se procesan archivos con extensión **`.json`**.

## Carga

- Cada archivo `nombre.json` se parsea con `JSON.parse` y su contenido se asigna a **`site.nombre`**.
- Ejemplo: `site.json` → el contenido está en **`site.site`**. Si `site.json` es `{ "title": "Mi sitio" }`, en templates y páginas usarás `{{ site.site.title }}`.
- Otro archivo `menu.json` → **`site.menu`** (array u objeto según el JSON).

No hay soporte para `data.js` ni otros formatos en esta versión.

## Uso en páginas y templates

El objeto `site` se inyecta en el **pageContext** junto con el frontmatter de la página. Puedes usar:

- **`{{ site.site.title }}`** — propiedad de un objeto cargado desde `site.json`.
- **`{{ site.menu }}`** — para listas/objetos cargados desde `menu.json` (se serializa a string al sustituir; para listas complejas suele usarse en componentes pasando una prop).

Las variables se resuelven con **replaceVars**: la clave puede tener puntos (ej. `site.site.title`) y se resuelve sobre el contexto. Los valores se convierten a string al sustituir.

## Ejemplo de estructura

```
src/data/
  site.json    → site.site
  menu.json    → site.menu
```

**site.json:**

```json
{
  "title": "Mi portfolio",
  "description": "Bienvenido"
}
```

**En un template o página:**

```html
<title>{{ site.site.title }}</title>
<meta name="description" content="{{ site.site.description }}">
```

## Siguiente paso

- [Seguridad](09-seguridad.md) — Cookies, CSP y páginas de políticas.
