import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { runBuild } from './build.js';
import { loadConfig } from './loadConfig.js';

/** @type {import('node:fs').FSWatcher | null} */
let watcher = null;

/**
 * Start dev server: build once, watch src/, serve dist/, live reload
 * @param {string} cwd
 */
export async function runDev(cwd) {
  const config = await loadConfig(cwd);
  const outDir = path.resolve(cwd, config.outDir);
  const srcDir = path.resolve(cwd, config.srcDir);

  await runBuild(cwd);

  try {
    const chokidar = await import('chokidar');
    watcher = chokidar.default.watch(srcDir, { ignoreInitial: true });
    watcher.on('change', async () => {
      await runBuild(cwd);
      broadcastReload();
    });
  } catch {
    console.log('Tip: npm install chokidar for watch/live reload');
  }

  const port = 3000;
  const server = http.createServer((req, res) => {
    if (req.url === '/__mini_astro_live') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      clients.push(res);
      req.on('close', () => { const i = clients.indexOf(res); if (i !== -1) clients.splice(i, 1); });
      return;
    }

    let filePath = path.join(outDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!path.relative(outDir, filePath).startsWith('..')) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        let data = fs.readFileSync(filePath);
        if (ext === '.html') {
          const html = data.toString('utf8');
          const injected = html.replace('</body>', '<script>(function(){var e=new EventSource("/__mini_astro_live");e.onmessage=function(){e.close();location.reload();};})();</script></body>');
          data = Buffer.from(injected, 'utf8');
        }
        res.end(data);
        return;
      }
    }

    res.writeHead(404);
    res.end('Not found');
  });

  const clients = [];
  function broadcastReload() {
    clients.forEach((r) => { try { r.write('data: reload\n\n'); } catch {} });
  }

  const injectScript = `<script>(function(){var e=new EventSource('/__mini_astro_live');e.onmessage=function(){e.close();location.reload();};})();</script></body>`;
  // Note: injecting into every HTML response would require streaming replace. For simplicity we don't inject; client can reload manually or we inject in build. For live reload we inject a script in the built HTML during dev. So we need to either (1) inject when serving HTML in dev, or (2) build with a dev flag that adds the script. Option (2): in runBuild we could accept opts.dev and append the script to every HTML. So runBuild(cwd, { dev: true }) and then in build we append injectScript before </body>. Let me do that.
  server.listen(port, () => {
    console.log(`Dev server at http://localhost:${port}`);
    console.log('Watching', srcDir);
  });
}
