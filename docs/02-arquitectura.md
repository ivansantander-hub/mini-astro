# Arquitectura técnica de mini-astro

## Estructura del paquete

```
mini-astro/
├── package.json           # name, bin, type: "module", dependencies
├── cli.js                 # Punto de entrada del CLI (shebang + main)
├── mini-astro.config.js   # Config de ejemplo (no se usa en runtime desde aquí)
├── src/
│   ├── loadConfig.js      # Carga mini-astro.config.js desde el cwd del proyecto
│   ├── data.js            # Carga de src/data/*.json
│   ├── frontmatter.js     # Parseo de --- key: value ---
│   ├── resolve.js         # replaceVars, replaceSlot, resolveIncludes, findComponentPath
│   ├── build.js           # runBuild: orquestación del build
│   ├── init.js            # runInit: prompts interactivos y llamada a runCreate
│   ├── dev-server.js      # runDev: build + watch + HTTP server + live reload
│   └── commands/
│       ├── create.js      # runCreate: scaffold del proyecto
│       ├── route.js       # runRoute: crear página en src/pages/
│       └── component.js   # runComponent: crear componente en atoms|molecules|organisms
└── templates/             # .gitkeep; el scaffold se genera en create.js
```

- El **CLI** (`cli.js`) usa `node:util` `parseArgs` para leer comando y opciones (`--cwd`, `--help`). Los comandos se delegan a los módulos de `src/` y `src/commands/`.
- La **configuración** se carga desde el directorio del proyecto (cwd), no desde la carpeta del paquete. Ver [Configuración](03-configuracion.md).
- **Build** y **dev** siempre se ejecutan en el **cwd** del proyecto (donde está `mini-astro.config.js` o donde el usuario indica con `-C`).

## Flujo de datos del build

1. **loadConfig(cwd)**  
   Lee `mini-astro.config.js` (si existe) y mezcla con valores por defecto. Devuelve `srcDir`, `outDir`, `dataDir`, `cookies`, `security`, etc.

2. **loadData(dataDir)**  
   Lee todos los `.json` en `src/data/` y devuelve un objeto `{ nombreArchivo: contenido }` (sin extensión). Ese objeto se expone como `site` en el contexto de las páginas.

3. **Por cada archivo en `src/pages/**/*.html`:**
   - **parseFrontmatter(raw)**  
     Detecta bloque `---` … `---` al inicio, parsea líneas `key: value` y devuelve `{ frontmatter, body }`.
   - Se elige el **template** según `frontmatter.layout` (por defecto `Base`). Se carga `src/templates/<layout>.html`.
   - **replaceVars(templateHtml, pageContext)**  
     Sustituye `{{ key }}` y `{{ site.key }}` en el template. `pageContext` = frontmatter + `{ site: siteData }`.
   - **replaceSlot(templateHtml, body)**  
     Sustituye la primera ocurrencia de `<slot />` o `<!-- @slot -->` por el cuerpo de la página.
   - **resolveIncludes(html, cwd)**  
     Sustituye cada `<mini-include src="..." [attrs] />` por el contenido del componente encontrado en atoms/molecules/organisms, inyectando props y resolviendo recursivamente (límite de profundidad 20).
   - **replaceVars(html, pageContext)**  
     Segunda pasada de variables por si el body o los componentes tenían `{{ }}`.
   - Se escribe el HTML final en `dist/<ruta-relativa>`.

4. **Copiar `public/` → `dist/`**  
   Se hace antes de procesar páginas; así `dist` contiene tanto el HTML generado como los estáticos (css, js, img, etc.).

## Módulos en detalle

### loadConfig.js

- Busca `mini-astro.config.js` en `cwd`.
- Si no existe, devuelve `DEFAULT_CONFIG`.
- Si existe, hace `import(pathToFileURL(configPath).href)` y fusiona `mod.default` con `DEFAULT_CONFIG` (los valores del archivo prevalecen).

### data.js

- Lista archivos en `dataDir`; solo procesa archivos (no subcarpetas).
- Por cada `.json`, hace `JSON.parse` y asigna el resultado a `site[nombreSinExtension]`.
- No hay soporte para `data.js` en esta versión; solo JSON.

### frontmatter.js

- Si el contenido no empieza por `---`, devuelve `{ frontmatter: {}, body: raw }`.
- Si empieza por `---`, busca el segundo `---`; entre ambos se parsean líneas `key: value` (valor sin comillas o quitando comillas simples/dobles al inicio/final).
- El body es todo lo que va después del segundo `---`.

### resolve.js

- **replaceVars(html, context)**  
  Regex `\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}`. Para cada clave se hace un “path” con `.` (ej. `site.title`) y se resuelve sobre `context`. El resultado se convierte a string.
- **replaceSlot(templateHtml, content)**  
  Reemplaza `<slot />` o `<!-- @slot -->` (insensible a mayúsculas) por `content`.
- **findComponentPath(srcDir, name)**  
  - `srcDir` aquí es el **cwd** del proyecto (raíz del sitio).
  - Si `name` contiene `/` (ej. `organisms/Header`), solo se busca en esa capa.
  - Si no, se busca en orden: `atoms`, `molecules`, `organisms`. La ruta base es `path.join(srcDir, 'src', layer, fileName)` con `fileName` = `name` + `.html` si hace falta.
- **parseAttrs(attrsStr)**  
  Extrae `src="..."` y el resto de atributos `key="value"`. Si existen `title1` y `title2`, se calculan `line1content` y `line2content` con `repeatMarquee()` (para el caso SubBanner/marquee).
- **resolveIncludes(html, srcDir, fromFile, depth)**  
  Regex global para `<mini-include ... />`. Para cada match se parsean atributos, se busca el componente, se lee su HTML, se aplica `replaceVars` con las props y se llama recursivamente a `resolveIncludes` (con `depth` máx. 20).

### build.js

- No transforma JS/CSS; solo lee/escribe HTML y copia `public/`.
- `collectPages(pagesDir, prefix)` recorre recursivamente y devuelve rutas relativas de todos los `.html` (ej. `index.html`, `blog/post.html`). Esas rutas determinan la URL y el path de salida en `dist/`.

### dev-server.js

- Ejecuta `runBuild(cwd)` una vez.
- Si está disponible `chokidar`, observa `srcDir`; en cada cambio vuelve a ejecutar `runBuild` y hace `broadcastReload()` a los clientes conectados a `/__mini_astro_live` (Server-Sent Events).
- Crea un servidor HTTP que sirve archivos desde `outDir`. Para peticiones a HTML, inyecta antes de `</body>` un script que abre un `EventSource` a `/__mini_astro_live` y recarga la página al recibir el evento.
- Puerto por defecto: 3000.

### commands/create.js

- Crea todas las carpetas del scaffold (src/atoms, molecules, organisms, templates, pages, data; public/css, js, img).
- Escribe `Base.html`, `index.html`, opcionalmente `CookieConsentBar.html`, `cookies.html`, `privacidad.html`, `site.json`, `mini-astro.config.js` y `package.json`.
- No usa la carpeta `templates/` del paquete; el contenido de los archivos está generado en funciones internas (`getBaseTemplate`, `getIndexPage`, etc.).

## Dependencias

- **chokidar**: opcional; solo para watch en `dev`. Si no está instalado, el dev server funciona pero no hay live reload.
- Solo módulos de Node.js estándar para el resto: `path`, `fs`, `http`, `readline`, `node:util` (`parseArgs`), `node:url` (`pathToFileURL`, `fileURLToPath`).

## Siguiente paso

- [Configuración](03-configuracion.md) — Opciones de `mini-astro.config.js`.
