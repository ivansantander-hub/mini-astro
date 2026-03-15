# Seguridad

mini-astro incluye opciones por defecto orientadas a privacidad y seguridad: consentimiento de cookies, CSP y páginas de políticas. Todo es configurable.

## Cookies (strict)

- **Config**: `cookies.strict` en `mini-astro.config.js` (por defecto `true`).
- **Efecto en el scaffold**: si `strict` es true, al crear proyecto con `init` o `create` se genera el componente **CookieConsentBar** en `src/molecules/` y se incluye en el template Base con `<mini-include src="CookieConsentBar" />`.
- El banner guarda el consentimiento en `localStorage` (clave `mini-astro-consent`) y muestra enlaces a las páginas de Cookies y Privacidad. No inyecta cookies de terceros; es solo un aviso y un botón “Accept”.
- Si creas un proyecto sin estas opciones o modificas el Base, puedes quitar el include o desactivar el banner en tu propio HTML/JS.

## CSP (Content-Security-Policy)

- **Config**: `security.csp` en `mini-astro.config.js` (por defecto `true`).
- **Efecto en el scaffold**: en el template Base generado por `create` se añade una meta tag:

  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
  ```

- Política estricta: solo recursos del mismo origen; estilos permiten `'unsafe-inline'` para facilitar estilos inline. Si usas scripts o estilos externos, tendrás que relajar la CSP en tu template (no hay opción en el config para ajustar la cadena; se edita el HTML).
- Si creas el proyecto con `csp: false`, el template Base no incluye esta meta.

## Páginas de políticas

- **Config**: `security.policyPages` (por defecto `true`).
- **Efecto en el scaffold**: se generan dos páginas en `src/pages/`:
  - **cookies.html** — Cookie Policy (ruta `/cookies.html`).
  - **privacidad.html** — Privacidad (ruta `/privacidad.html`).
- Ambas usan layout Base y un contenido placeholder que puedes editar. El banner de cookies enlaza a estas rutas.
- Si no quieres estas páginas, crea el proyecto con `policyPages: false` o borra/edita los archivos después.

## Resumen de configuración

| Opción | Default | Efecto |
|--------|---------|--------|
| `cookies.strict` | `true` | Incluir CookieConsentBar y enlaces en el Base generado. |
| `security.csp` | `true` | Inyectar meta CSP en el head del Base generado. |
| `security.policyPages` | `true` | Generar cookies.html y privacidad.html en el scaffold. |

Estas opciones solo afectan al **scaffold** (init/create). Un build posterior no vuelve a inyectar ni borrar nada; tú mantienes o editas el HTML de templates y páginas.

## Siguiente paso

- [CLI](10-cli.md) — Comandos y opciones.
