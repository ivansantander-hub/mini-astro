# Dev server

El comando **`mini-astro dev`** inicia un servidor de desarrollo que sirve el sitio generado y opcionalmente recarga el navegador al cambiar archivos.

## Comportamiento

1. **Build inicial**  
   Ejecuta `runBuild(cwd)` una vez. El resultado queda en `outDir` (por defecto `dist/`).

2. **Watch (opcional)**  
   Si el paquete **chokidar** está disponible, se observa el directorio `srcDir` (por defecto `src/`). En cada cambio se vuelve a ejecutar el build y se hace **broadcast** a los clientes de live reload.

3. **Servidor HTTP**  
   Escucha en el puerto **2323** por defecto (configurable con la variable de entorno `PORT`) y en **0.0.0.0** para acceso en la red local. Sirve archivos estáticos desde `outDir`:
   - Petición a `/` → sirve `dist/index.html` (resolución de índice).
   - Cualquier otra ruta se resuelve de forma **literal** a un archivo bajo `dist/` (p. ej. `/cookies.html` → `dist/cookies.html`). No hay reescritura de URLs; el path solicitado debe coincidir con el archivo (sin salir del directorio por seguridad). Se usan tipos MIME habituales (HTML, CSS, JS, imágenes, etc.).
   - En la consola se muestran las URLs **Local** (`http://localhost:PORT`) y **Network** (`http://<IP-local>:PORT`) cuando hay una interfaz de red disponible.

4. **Live reload**  
   - Ruta **`/__mini_astro_live`**: Server-Sent Events; el cliente recibe un evento `reload` cuando hay un cambio.
   - Ruta **`/__mini_astro_reload.js`**: script externo que abre `EventSource('/__mini_astro_live')` y recarga la página al recibir el evento. En cada respuesta HTML se inyecta `<script src="/__mini_astro_reload.js"></script>` (sin script inline), para no violar CSP `script-src 'self'`.

Si **chokidar** no está instalado, el servidor sigue funcionando pero no hay watch ni eventos de reload; tendrás que hacer build manual y recargar el navegador a mano.

## Dependencia opcional

- **chokidar**: para watch del directorio `src/` y notificación de cambios. Instalación en el proyecto: `npm install chokidar` (o añadirlo como dependencia del proyecto que usa mini-astro). El paquete mini-astro puede listarlo como optionalDependency.

## Puerto y red

- **Puerto por defecto**: 2323. Se puede cambiar con la variable de entorno `PORT` (p. ej. `PORT=3000 mini-astro dev`).
- **Host**: el servidor escucha en `0.0.0.0`, así que el sitio es accesible desde otras máquinas de la red local mediante la IP que se muestra como **Network** al arrancar.

Para el concepto de URLs limpias y cómo el servidor resuelve `/` frente a rutas con `.html`, ver [URLs limpias y resolución en el servidor](05b-urls-limpias.md).

## Siguiente paso

- [Guía de uso](12-guia-de-uso.md) — Flujo completo desde cero hasta build y despliegue.
