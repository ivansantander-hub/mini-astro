# URLs limpias y resolución en el servidor

Este documento explica **por qué** algunas URLs no muestran la extensión `.html` y cómo se relaciona con el build estático y el servidor web. Es una explicación de concepto, no magia: convención de archivos + reglas del servidor.

## Lo esencial: mini-astro genera HTML real

Si tienes este archivo:

```
src/pages/about.html
```

mini-astro construirá:

```
dist/about.html
```

La ruta en disco coincide con la ruta relativa dentro de `src/pages/`. La URL con la que se sirve esa página, por defecto, es la **literal**: `/about.html`.

## Cómo se obtienen URLs “limpias” (sin .html)

Las **URLs limpias** (por ejemplo `/about` en lugar de `/about.html`) no son un invento de los frameworks modernos. Se apoyan en un comportamiento estándar de los servidores web desde hace décadas.

### Resolución de índice de directorio (directory index)

Muchos servidores (Apache, Nginx, etc.) entienden que cuando alguien pide:

```
/about/
```

o, según configuración:

```
/about
```

el servidor debe buscar automáticamente un archivo índice en ese camino, típicamente:

```
/about/index.html
```

Ese comportamiento se llama **directory index resolution**. En la práctica:

1. El navegador pide: `https://site.com/about`
2. El servidor responde con el contenido de `/about/index.html` (o `/about/` → `index.html` dentro de esa ruta).
3. La URL visible en el navegador sigue siendo `/about` (o `/about/`).

La extensión `.html` no aparece en la barra de direcciones.

### Dos formas típicas de generar ese resultado

- **Carpetas con `index.html`**  
  El build escribe `dist/about/index.html`. La URL `/about` o `/about/` se resuelve a ese archivo gracias a la regla de índice de directorio.

- **Archivo plano y reescritura**  
  El build escribe `dist/about.html` y el servidor tiene una regla de reescritura: “cuando pidan `/about`, sirve `about.html`”. La URL sigue siendo `/about`.

En ambos casos, la “limpieza” de la URL es una **combinación de qué genera el build y cómo está configurado el servidor**.

## Comportamiento actual de mini-astro

Hoy, mini-astro:

- Genera **un archivo HTML por página** con la misma ruta relativa: `src/pages/foo.html` → `dist/foo.html`, `src/pages/blog/post.html` → `dist/blog/post.html`.
- La raíz `/` se sirve con `dist/index.html` (el dev server y la mayoría de servidores hacen esta asignación explícita).
- **No** genera por defecto carpetas `nombre/index.html` para cada página; por tanto, las URLs son **literales**: `/foo.html`, `/blog/post.html`.

Para obtener URLs sin `.html` en producción tienes dos caminos:

1. **Configurar el servidor** (Nginx, Apache, Vercel, Netlify, etc.) para que reescriba `/about` → `about.html`, o para que `/about/` busque `about/index.html` si en el futuro el build generara esa estructura.
2. **Usar una opción de build** (si mini-astro la incorpora) que escriba `dist/about/index.html` en lugar de `dist/about.html`; entonces un servidor con directory index serviría `/about/` sin extensión.

Nada sobrenatural: misma idea que en Astro, Next.js o Nuxt — convención de archivos más comportamiento del servidor.

## Por qué importan las URLs limpias

- **Estética**: `/about` suele percibirse más limpio que `/about.html`.
- **Aspecto de “ruta de aplicación”**: coherente con SPAs y frameworks que ocultan la extensión.
- **Independencia de la tecnología**: la URL no delata si la página es `.html`, `.astro` o se generó con otro motor. Si cambias el backend o el generador, puedes mantener las mismas URLs y no romper enlaces.

Eso hace que las URLs limpias sean una **propiedad arquitectónica** útil cuando el proyecto crece o migra de stack.

## Resumen del flujo

```
archivo en src/pages (p. ej. about.html)
        ↓
   mini-astro build
        ↓
   HTML estático (dist/about.html)
        ↓
   Servidor: / → index.html; /ruta → según reglas (literal o reescritura/directory index)
        ↓
   URL visible: con o sin .html según build + servidor
```

La web es curiosa: muchas “innovaciones modernas” en URLs son trucos antiguos bien empaquetados.

## Relación con otros documentos

- [Páginas y routing](05-paginas-y-routing.md) — Reglas exactas de rutas y salida en `dist/`.
- [Dev server](11-dev-server.md) — Cómo el servidor de desarrollo resuelve `/` y el resto de rutas.

## Siguiente paso

- [Componentes](06-componentes.md) — Uso de `<mini-include>` y props.
