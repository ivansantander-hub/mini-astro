# CLI

El CLI de mini-astro se ejecuta con **`npx mini-astro`** o **`mini-astro`** si está instalado globalmente. Todos los comandos se ejecutan en el directorio actual salvo que se indique **`-C, --cwd`**.

## Opciones globales

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <path>` | Directorio del proyecto (donde está `mini-astro.config.js`). Por defecto: `process.cwd()`. |
| `-h, --help` | Muestra la ayuda y sale. |

## Comandos

### `init [nombre]`

- **Uso**: `mini-astro init` o `mini-astro init mi-sitio`
- **Descripción**: Inicialización interactiva. Pregunta por nombre del proyecto, banner de cookies estricto, generación de páginas de políticas (Cookies/Privacidad) e inyección de CSP. Con las respuestas llama a la misma lógica que **create** y genera el proyecto en `<cwd>/<nombre>`.
- Si pasas un nombre como argumento posicional, se usa como nombre del proyecto y no se pregunta por él.
- Al terminar sugiere: `cd <nombre>` y `npx mini-astro dev`.

### `create [nombre]`

- **Uso**: `mini-astro create` o `mini-astro create mi-sitio`
- **Descripción**:  
  - **Con nombre** (`create mi-sitio`): Crea el proyecto en `<cwd>/mi-sitio` sin preguntas, con opciones por defecto (cookies estrictas, policy pages, CSP).  
  - **Sin nombre** (`create`): Lanza el flujo **interactivo** igual que **init** (preguntas de nombre, cookies, políticas, CSP).
- Crea carpetas (src/atoms, molecules, organisms, templates, pages, data; public/css, js, img), Base.html, index.html, opcionalmente CookieConsentBar, cookies.html, privacidad.html, site.json, mini-astro.config.js, package.json. Si el directorio ya existe, lanza error.

### `new [nombre]`

- **Uso**: `mini-astro new` o `mini-astro new mi-sitio`
- Alias de **create**. Sin nombre usa por defecto `my-site` como nombre del proyecto (crea `<cwd>/my-site`).

### `build`

- **Uso**: `mini-astro build` (desde la raíz del proyecto o con `-C`).
- **Descripción**: Carga la config, carga datos de `dataDir`, copia `public/` a `outDir`, procesa todas las páginas de `src/pages/` (frontmatter, layout, slot, includes, vars) y escribe el resultado en `outDir`. Imprime el número de páginas generadas.

### `dev`

- **Uso**: `mini-astro dev`
- **Descripción**: Ejecuta un build y luego inicia un servidor HTTP que sirve `outDir` (por defecto `dist/`) en el puerto **3000**. Si está instalado **chokidar**, observa `srcDir` y al detectar cambios vuelve a hacer build y envía un evento de live reload a los clientes conectados a `/__mini_astro_live`. En cada respuesta HTML se inyecta un script que abre ese SSE y recarga la página al recibir el evento.
- Sin chokidar, el servidor sigue funcionando pero no hay recarga automática.

### `route <nombre>` / `add [page] <nombre>`

- **Uso**: `mini-astro route blog/post`, `mini-astro route about`, o `mini-astro add blog/post`
- **Descripción**: Crea un archivo de página en `src/pages/` que corresponde a la ruta indicada. Por ejemplo `route blog/post` crea `src/pages/blog/post.html` (y la carpeta `blog` si no existe). El contenido es un placeholder con frontmatter `layout: Base` y un título derivado del nombre del archivo.
- Con **add**, si el primer argumento es `page`, se ignora (ej. `add page contacto` crea `contacto.html`). **add** es alias de **route** (añadir página).

### `component <nombre> [capa]`

- **Uso**: `mini-astro component Card` o `mini-astro component Header organisms`
- **Descripción**: Crea un componente nuevo en la capa indicada (por defecto **molecules**). Opciones de capa: **atoms**, **molecules**, **organisms**. El archivo se crea como `src/<capa>/<nombre>.html` con un contenido mínimo (div con clase y comentario).

## Ejemplos

```bash
# Crear proyecto interactivo
npx mini-astro init
npx mini-astro init mi-portfolio

# Crear proyecto sin preguntas
npx mini-astro create mi-sitio

# Build y dev (desde la raíz del proyecto)
npx mini-astro build
npx mini-astro dev

# Crear página y componente
npx mini-astro route contacto
npx mini-astro route blog/entrada
npx mini-astro component Card
npx mini-astro component Header organisms
```

## Siguiente paso

- [Dev server](11-dev-server.md) — Detalles del servidor de desarrollo y live reload.
