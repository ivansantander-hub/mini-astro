# Componentes

Los componentes son fragmentos de HTML reutilizables que se incluyen con la etiqueta **`<mini-include>`** y opcionalmente reciben props.

## Sintaxis básica

```html
<mini-include src="NombreDelComponente" />
```

- **`src`** (obligatorio): nombre del componente. Coincide con el nombre del archivo sin extensión en `atoms/`, `molecules/` u `organisms/`. Si incluyes la capa, solo se busca ahí: `organisms/Header`.
- Cierre: siempre en forma de autocierre `/>`.

## Props (atributos)

Cualquier otro atributo se pasa como prop al componente:

```html
<mini-include src="Card" title="Título" subtitle="Subtítulo" />
```

Dentro del componente, las props están disponibles como variables con el mismo nombre:

```html
<!-- molecules/Card.html -->
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ subtitle }}</p>
</div>
```

- Los nombres de atributos se normalizan a minúsculas en el parser de atributos (en la práctica, usa nombres en minúsculas o el mismo nombre que en el HTML).
- Si una prop no se pasa, `{{ nombre }}` queda vacío o sin sustituir según la implementación (replaceVars suele dejar la cadena literal si la clave no existe).

## Resolución recursiva

- Dentro de un componente puedes usar otro `<mini-include>`. La resolución es recursiva con un **límite de profundidad de 20** para evitar bucles infinitos.
- Las variables `{{ }}` dentro del componente se sustituyen con el contexto formado por las **props** de ese include (no el contexto de la página). Para acceder a datos globales necesitarías pasar explícitamente algo como `siteTitle="{{ site.title }}"` desde la página o desde un template.

## Caso especial: SubBanner / marquee

El módulo `resolve.js` tiene lógica específica para componentes que usan **title1** y **title2**:

- Si entre los atributos parseados existen `title1` y `title2`, se calculan `line1content` y `line2content` mediante una función `repeatMarquee(title, withProjects)` (relleno de texto para efecto marquee).
- Útil para un organismo tipo “banner” con dos líneas de texto repetido. El componente debe usar `{{ line1content }}` y `{{ line2content }}` en su HTML.

## Dónde usar componentes

- En **templates**: por ejemplo `<mini-include src="CookieConsentBar" />` en Base.html.
- En **páginas**: en el body de cualquier página.
- En **otros componentes**: dentro de atoms, molecules u organisms.

## Sin slots en componentes

Los componentes no tienen slot propio; son un único fragmento de HTML. La única sustitución de slot es en el **template** (el body de la página reemplaza `<slot />`). Para variar el contenido de un componente, usa props.

## Siguiente paso

- [Templates](07-templates.md) — Layouts, slot y variables.
