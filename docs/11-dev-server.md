# Dev server

The **`mini-astro dev`** command starts a development server that serves the built site and optionally reloads the browser when files change.

## Behaviour

1. **Initial build**  
   Runs `runBuild(cwd)` once. The result is in `outDir` (default `dist/`).

2. **Watch (optional)**  
   If the **chokidar** package is available, the `srcDir` directory (default `src/`) is watched. On each change the build runs again and a **broadcast** is sent to live reload clients.

3. **HTTP server**  
   Listens on port **2323** by default (from config `dev.port`, then env `PORT`) and on **0.0.0.0** for access on the local network. It serves static files from `outDir`:
   - Request to `/` → serves `dist/index.html`.
   - **Clean URLs**: `/cookies` or `/cookies/` resolve to `dist/cookies/index.html` (or, in older builds, to `dist/cookies.html`). Any path without extension is tried first as `<path>/index.html` then as `<path>.html`. Other paths resolve to files under `dist/` (without leaving the directory). Common MIME types are used (HTML, CSS, JS, images, etc.).
   - The console shows **Local** (`http://localhost:PORT`) and **Network** (`http://<local-IP>:PORT`) URLs when a network interface is available.

4. **Live reload**  
   - Route **`/__mini_astro_live`**: Server-Sent Events; the client receives a `reload` event when there is a change.
   - Route **`/__mini_astro_reload.js`**: external script that opens `EventSource('/__mini_astro_live')` and reloads the page on event. Each HTML response injects `<script src="/__mini_astro_reload.js"></script>` (no inline script), so CSP `script-src 'self'` is not violated.

If **chokidar** is not installed, the server still runs but there is no watch or reload; you must run the build manually and reload the browser yourself.

## Optional dependency

- **chokidar**: for watching the `src/` directory and change notification. Install in the project: `npm install chokidar` (or add it as a dependency of the project that uses mini-astro). The mini-astro package can list it as an optionalDependency.

## Port and network

- **Default port**: 2323 (from `mini-astro.config.js` `dev.port` at create, or env `PORT`, e.g. `PORT=3000 mini-astro dev`).
- **Host**: the server listens on `0.0.0.0`, so the site is reachable from other machines on the local network via the IP shown as **Network** when starting.

For the concept of clean URLs and how the server resolves `/` vs routes with `.html`, see [Clean URLs and server resolution](05b-clean-urls.md).

## Next step

- [Usage guide](12-usage-guide.md) — Full flow from scratch to build and deploy.
