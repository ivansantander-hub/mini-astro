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
- **Descripción**: Inicialización interactiva. Pregunta por:
  - Nombre del proyecto (o usa el argumento si lo pasas)
  - Banner de cookies estricto (Sí/No)
  - Generación de páginas de políticas (Cookies y Privacidad)
  - CSP estricta por defecto
  - **Puerto del dev server** (por defecto **2323**); se guarda en `mini-astro.config.js` como `dev.port`
  - **Package manager**: **pnpm** (por defecto), **yarn** o **npm**
- Con las respuestas llama a **create** y genera el proyecto. Al terminar imprime el puerto elegido y los comandos para instalar y arrancar.

### `create [nombre]`

- **Uso**: `mini-astro create` o `mini-astro create mi-sitio`
- **Descripción**:  
  - **Con nombre** (`create mi-sitio`): Crea el proyecto en `<cwd>/mi-sitio` sin preguntas. Usa opciones por defecto (cookies, policy pages, CSP) y **pnpm** como package manager.  
  - **Sin nombre** (`create`): Lanza el flujo **interactivo** igual que **init** (nombre, cookies, políticas, CSP, package manager).
- Genera: carpetas Atomic Design + public/css (incl. `theme.css`), Base.html, landing **“Hello humans”** en index.html, CookieConsentBar y páginas de políticas si aplica, site.json, config, package.json (con `packageManager: "pnpm@9.0.0"` si es pnpm). Si el directorio ya existe, lanza error.

### `new [nombre]`

- **Uso**: `mini-astro new` o `mini-astro new mi-sitio`
- Alias de **create**. Sin nombre usa por defecto `my-site` como nombre del proyecto (crea `<cwd>/my-site`).

### `build`

- **Uso**: `mini-astro build` (desde la raíz del proyecto o con `-C`).
- **Descripción**: Carga la config, carga datos de `dataDir`, copia `public/` a `outDir`, procesa todas las páginas de `src/pages/` (frontmatter, layout, slot, includes, vars) y escribe el resultado en `outDir`. Imprime el número de páginas generadas.

### `dev`

- **Uso**: `mini-astro dev`
- **Descripción**: Ejecuta un build y luego inicia un servidor HTTP que sirve `outDir` (por defecto `dist/`) en el puerto **2323** (o `PORT`). Si está instalado **chokidar**, observa `srcDir` y al detectar cambios vuelve a hacer build y envía un evento de live reload a los clientes conectados a `/__mini_astro_live`. En cada respuesta HTML se inyecta un script que abre ese SSE y recarga la página al recibir el evento.
- Sin chokidar, el servidor sigue funcionando pero no hay recarga automática.

### `route <nombre>` / `page <nombre>` / `add [page] <nombre>`

- **Uso**: `mini-astro route about`, `mini-astro page blog/post`, `mini-astro add page contacto`
- **Descripción**: Crea una página en `src/pages/` (Atomic: pages). `route blog/post` crea `src/pages/blog/post.html`; la URL será `/blog/post`. Contenido: placeholder con `layout: Base` y título derivado del nombre. **page** y **add** son alias de **route**; con **add**, si el primer argumento es `page` se ignora.

### `quarks`

- **Uso**: `mini-astro quarks`
- **Descripción**: Muestra la ruta de **quarks** (design tokens) y lista los archivos en `src/quarks/`. Nivel 0 de Atomic Design; no son componentes UI.

### `component <nombre> [capa]`

- **Uso**: `mini-astro component Button atom`, `mini-astro component Card molecule`, `mini-astro component Header organism`
- **Descripción**: Crea un componente en la capa indicada (por defecto **molecule**). Capas: **atom** | **molecule** | **organism** (o en plural: atoms, molecules, organisms). Crea `src/<capa>/<nombre>.html`.

### `template <nombre>`

- **Uso**: `mini-astro template Blog`
- **Descripción**: Crea un layout en `src/templates/<nombre>.html` con estructura mínima (html, head, body, `<slot />`). Las páginas lo usan con `layout: Nombre` en el frontmatter.


### `completion [bash|zsh]`

- **Uso**: `mini-astro completion bash` o `mini-astro completion zsh`
- **Descripción**: Escribe en stdout el script de autocompletado para la shell. Instalación:
  - **Bash**: `source <(mini-astro completion bash)` (o añadir a `~/.bashrc`).
  - **Zsh**: `source <(mini-astro completion zsh)` (o añadir a `~/.zshrc`).

### `add [type]`

- **Uso**: `mini-astro add` o `mini-astro add atom`
- **Descripción**: Modo interactivo para crear cualquier nivel de Atomic Design. Si no pasas **type**, pregunta qué crear (atom / molecule / organism / template / page). Luego pide el **nombre** (y para páginas, el **layout** por defecto). Equivalente a ejecutar `component`, `template` o `route` sin argumentos para que pidan los datos.

### `help [comando]`

- **Uso**: `mini-astro help`, `mini-astro help component`, `mini-astro component --help`
- **Descripción**: Muestra la ayuda general o la ayuda del comando indicado.

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
