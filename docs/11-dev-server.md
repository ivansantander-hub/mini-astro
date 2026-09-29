# Dev server

The **`mini-astro dev`** command starts a development server that serves the built site and reloads the browser when files change.

## Behaviour

1. **Initial build**  
   Runs `runBuild(cwd)` once. The result is in `outDir` (default `dist/`). If this build fails, the server still starts (see *Build errors* below).

2. **Watch**  
   With **chokidar**, the server watches `srcDir` (default `src/`), `public/`, `dataDir` (default `src/data`) and `mini-astro.config.js` — those that exist when the server starts. Adding, changing or deleting a file triggers a rebuild. Rebuilds are **debounced** (a burst of saves produces one build) and **serialized** (a change during a build queues one more build after it; builds never overlap). After each build a **broadcast** is sent to live reload clients. `outDir` and `.mini-astro/` are ignored.

3. **HTTP server**  
   Listens on port **2323** by default (config `dev.port`; the `PORT` env variable overrides it) and on **0.0.0.0** for access on the local network. It serves static files from `outDir`:
   - Request to `/` → serves `dist/index.html`.
   - **Clean URLs**: `/cookies` or `/cookies/` resolve to `dist/cookies/index.html` (or to `dist/cookies.html` if that file exists instead). A path is tried as the file itself, then `<path>/index.html`, then `<path>.html`.
   - URLs are **decoded** (`/my%20page` → `my page/index.html`). A path that would resolve outside `outDir` (e.g. `/../secret`) is never served; malformed encodings return 404.
   - MIME types for HTML, CSS, JS/MJS, JSON, source maps, text, XML, web manifests, images (ico, png, jpg, gif, svg, webp, avif), fonts (woff, woff2, ttf, otf), audio/video (mp3, wav, mp4, webm), PDF and 3D models (gltf, glb). Unknown extensions are served as `application/octet-stream`.
   - Files are served with `Cache-Control: no-store`.
   - The console shows **Local** (`http://localhost:PORT`) and **Network** (`http://<local-IP>:PORT`) URLs when a network interface is available.

4. **Live reload**  
   - Route **`/__mini_astro_live`**: Server-Sent Events; the client receives a `reload` event after each build.
   - Route **`/__mini_astro_reload.js`**: external script that opens `EventSource('/__mini_astro_live')` and reloads the page on event. Each HTML response injects `<script src="/__mini_astro_reload.js"></script>` before `</body>` (no inline script), so CSP `script-src 'self'` is not violated.

## Build errors

A failed build does not stop the server. The error is printed in the terminal and, until the next successful build:

- **HTML requests** (pages and extensionless URLs) get a **500** page showing the error message. That page includes the live reload script, so it reloads by itself once you fix the file and the build succeeds (the terminal prints “Build fixed.”).
- **Assets** (CSS, JS, images…) that exist in `outDir` are still served.

## Dependency

- **chokidar** is a dependency of mini-astro and is used for watching. If it cannot be loaded, the server still runs but there is no watch or reload; run the build manually and reload the browser yourself.

## Port and network

- **Default port**: 2323, from `mini-astro.config.js` `dev.port`, overridden by env `PORT` (e.g. `PORT=3000 mini-astro dev`).
- **`PORT=0`** picks a free port; the chosen port is shown in the **Local** / **Network** URLs.
- **Host**: the server listens on `0.0.0.0`, so the site is reachable from other machines on the local network via the IP shown as **Network** when starting.

For the concept of clean URLs and how the server resolves `/` vs routes with `.html`, see [Clean URLs and server resolution](05b-clean-urls.md).

## Next step

- [Usage guide](12-usage-guide.md) — Full flow from scratch to build and deploy.
