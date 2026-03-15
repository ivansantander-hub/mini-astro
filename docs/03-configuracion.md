# Configuración

El proyecto que usa mini-astro puede definir un archivo **`mini-astro.config.js`** en la raíz. Es un módulo ESM que exporta por defecto un objeto de opciones. Las que no se definan usarán los valores por defecto del framework.

## Ubicación y carga

- **Ubicación**: raíz del proyecto (donde se ejecuta `mini-astro build` o `mini-astro dev`, o el directorio indicado con `-C, --cwd`).
- **Carga**: en tiempo de ejecución con `import(pathToFileURL(configPath).href)`. Debe ser un módulo válido (por ejemplo, con `"type": "module"` en el `package.json` del proyecto o extensión `.mjs` si aplica).

## Opciones

| Opción | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `srcDir` | `string` | `'src'` | Directorio fuente (contiene `pages/`, `templates/`, `atoms/`, etc.). |
| `outDir` | `string` | `'dist'` | Directorio de salida del build. |
| `dataDir` | `string` | `'src/data'` | Directorio desde el que se cargan los JSON de datos (path relativo al cwd). |
| `atomicDesign` | `boolean` | `true` | Respetar estructura Atomic Design (atoms, molecules, organisms). No desactiva la resolución en esas carpetas en la implementación actual. |
| `cookies` | `object` | `{ strict: true }` | Si `strict` es `true`, el scaffold incluye CookieConsentBar; no se inyecta automáticamente en builds ya existentes. Sirve sobre todo para el init/create. |
| `security` | `object` | `{ csp: true, policyPages: true }` | Opciones de seguridad: CSP y generación de páginas de políticas en el scaffold. |

## Ejemplo mínimo

```js
// mini-astro.config.js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
};
```

## Ejemplo con seguridad relajada

```js
// mini-astro.config.js
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: false },
  security: { csp: false, policyPages: false },
};
```

## Valores por defecto internos

Definidos en `src/loadConfig.js`:

```js
const DEFAULT_CONFIG = {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: true },
  security: { csp: true, policyPages: true },
};
```

Si no existe `mini-astro.config.js`, se usa exactamente este objeto. Si existe, se hace un merge superficial: `{ ...DEFAULT_CONFIG, ...userConfig }`, así que no hace falta repetir todas las claves.

## Rutas resueltas

- **Directorio de páginas**: `path.resolve(cwd, config.srcDir, 'pages')`
- **Directorio de templates**: `path.resolve(cwd, config.srcDir, 'templates')`
- **Directorio de datos**: `path.resolve(cwd, config.dataDir)` (dataDir puede ser relativo al cwd, ej. `'src/data'`)
- **Salida**: `path.resolve(cwd, config.outDir)`
- **Public**: `path.join(cwd, 'public')` (fijo; no configurable en la versión actual)

## Siguiente paso

- [Atomic Design](04-atomic-design.md) — Estructura de carpetas y resolución de componentes.
