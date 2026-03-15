# Dev server

El comando **`mini-astro dev`** inicia un servidor de desarrollo que sirve el sitio generado y opcionalmente recarga el navegador al cambiar archivos.

## Comportamiento

1. **Build inicial**  
   Ejecuta `runBuild(cwd)` una vez. El resultado queda en `outDir` (por defecto `dist/`).

2. **Watch (opcional)**  
   Si el paquete **chokidar** está disponible, se observa el directorio `srcDir` (por defecto `src/`). En cada cambio se vuelve a ejecutar el build y se hace **broadcast** a los clientes de live reload.

3. **Servidor HTTP**  
   Escucha en el puerto **3000** y sirve archivos estáticos desde `outDir`:
   - Petición a `/` → sirve `dist/index.html`.
   - Cualquier otra ruta se resuelve a un archivo bajo `dist/` (sin salir del directorio por seguridad). Se usan tipos MIME habituales (HTML, CSS, JS, imágenes, etc.).

4. **Live reload**  
   - Ruta especial **`/__mini_astro_live`**: responde con `Content-Type: text/event-stream` y mantiene la conexión (Server-Sent Events). Cada cliente que se conecte recibe un evento `reload` cuando hay un cambio.
   - En cada respuesta **HTML** se inyecta antes de `</body>` un script que:
     - Abre `EventSource('/__mini_astro_live')`.
     - Al recibir un mensaje, cierra la conexión y ejecuta `location.reload()`.

Si **chokidar** no está instalado, el servidor sigue funcionando pero no hay watch ni eventos de reload; tendrás que hacer build manual y recargar el navegador a mano.

## Dependencia opcional

- **chokidar**: para watch del directorio `src/` y notificación de cambios. Instalación en el proyecto: `npm install chokidar` (o añadirlo como dependencia del proyecto que usa mini-astro). El paquete mini-astro puede listarlo como optionalDependency.

## Puerto

- Fijo **3000**. No es configurable por opción de CLI ni por `mini-astro.config.js` en la versión actual.

## Siguiente paso

- [Guía de uso](12-guia-de-uso.md) — Flujo completo desde cero hasta build y despliegue.
