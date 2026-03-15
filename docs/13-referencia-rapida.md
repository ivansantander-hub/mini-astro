# Referencia rápida

## Sintaxis

| Elemento | Sintaxis | Ejemplo |
|----------|----------|---------|
| Variable | `{{ clave }}` o `{{ site.archivo.prop }}` | `{{ title }}`, `{{ site.site.description }}` |
| Slot (solo en template) | `<slot />` o `<!-- @slot -->` | Una sola sustitución por template |
| Componente | `<mini-include src="Nombre" />` con props opcionales | `<mini-include src="Card" title="Hola" />` |
| Componente en capa concreta | `src="capa/Nombre"` | `<mini-include src="organisms/Header" />` |
| Frontmatter | `---` / `key: value` / `---` | `layout: Base`, `title: Página` |

## Estructura de carpetas (src/)

```
src/
  atoms/       → componentes mínimos
  molecules/   → componentes pequeños
  organisms/   → bloques de página
  templates/   → layouts (Base.html, etc.)
  pages/       → file-based routing (*.html → misma ruta en dist)
  data/        → *.json → site.nombreArchivo
```

## Config (mini-astro.config.js)

- `srcDir`, `outDir`, `dataDir`, `atomicDesign`, `cookies.strict`, `security.csp`, `security.policyPages`.

## Comandos frecuentes

```bash
npx mini-astro init
npx mini-astro create mi-sitio
npx mini-astro build
npx mini-astro dev
npx mini-astro route blog/entrada
npx mini-astro component Card
npx mini-astro component Header organisms
```

## Limitaciones

- Sin rutas dinámicas (`[slug].html`).
- Sin Markdown/MDX.
- Un solo `<slot />` por template (solo la primera ocurrencia se reemplaza).
- Componentes: profundidad máxima 20 para `<mini-include>` anidados.
- Datos: solo JSON en `data/`; no hay `data.js`.
