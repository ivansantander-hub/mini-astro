# Seguridad

mini-astro incluye opciones por defecto orientadas a privacidad y seguridad: consentimiento de cookies, CSP y páginas de políticas. Todo es configurable.

## Cookies (strict)

- **Config**: `cookies.strict` en `mini-astro.config.js` (por defecto `true`).
- **Efecto en el scaffold**: si `strict` es true, se genera el componente **CookieConsentBar** (modal) en `src/molecules/`, la lógica en **`public/js/consent.js`** y el doc **`COOKIE_CONSENT.md`** en la raíz.
- **Modal**: overlay con tarjeta centrada, texto breve, enlaces a Cookie Policy y Privacidad, y dos acciones: **Accept all** y **Decline optional**. En las **páginas de políticas** (`/cookies.html`, `/privacidad.html`) el modal no se muestra: el usuario puede leer el contenido y elegir desde una barra fija no intrusiva en la parte inferior (misma elección Accept/Decline). Así se puede leer la política antes de decidir.
- **Almacenamiento**: el consentimiento es **client-side** en `localStorage` (clave `mini-astro-consent`, valores `"accepted"` o `"declined"`). En un sitio **estático** no hay servidor que pueda escribir cookies httpOnly; la preferencia se usa en el navegador (`body.dataset.consent` y evento `mini-astro-consent`). Ver `COOKIE_CONSENT.md` para uso en tu app y para el contraste con apps con servidor (session cookies, middleware).
- **CSP**: la lógica del modal está en `/js/consent.js` (sin scripts inline), compatible con `script-src 'self'`.

## CSP (Content-Security-Policy)

- **Config**: `security.csp` en `mini-astro.config.js` (por defecto `true`).
- **Efecto en el scaffold**: en el template Base se añade una meta tag con `script-src 'self'` (solo scripts desde tu origen; **no** `'unsafe-inline'`). La lógica de consentimiento va en `public/js/consent.js` para cumplir la CSP.
- Política: `default-src 'self'`; `script-src 'self'`; `style-src 'self' 'unsafe-inline'` y fuentes Google Fonts; `font-src` y `img-src` según necesidad. Para más scripts o dominios, edita la meta en el template.
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
