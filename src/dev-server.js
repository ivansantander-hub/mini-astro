import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import { runBuild } from './build.js';
import { loadConfig } from './loadConfig.js';

/** @returns {string | null} First non-internal IPv4 address for Network URL */
function getLocalNetworkAddress() {
  const ifaces = os.networkInterfaces();
  for (const addrs of Object.values(ifaces)) {
    if (!addrs) continue;
    for (const a of addrs) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return null;
}

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

  const c = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    silver: '\x1b[90m',
    magenta: '\x1b[35m',
  };
  console.log('');
  console.log(c.cyan + '       .     ');
  console.log(c.cyan + '       |     ');
  console.log(c.cyan + '       |     ');
  console.log(c.cyan + "    ,-'\"`-.   ");
  console.log(c.cyan + "  ,'       `. ");
  console.log(c.cyan + '  |  _____  | ' + c.reset + c.dim + '     .-( HEY baby,lets go out)');
  console.log(c.cyan + '  | (_o_o_) | ' + c.reset + c.dim + "   ,'    ( and kill all humans.)");
  console.log(c.cyan + "  |         | ,-'");
  console.log(c.cyan + '  | |HHHHH| | ');
  console.log(c.cyan + '  | |HHHHH| | ');
  console.log(c.cyan + "-'`-._____.-'`-" + c.reset);
  console.log('');
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

  const liveReloadScript = "(function(){var e=new EventSource('/__mini_astro_live');e.onmessage=function(){e.close();location.reload();};})();";

  const port = Number.parseInt(process.env.PORT || '2323', 10) || 2323;
  const host = '0.0.0.0';
  const server = http.createServer((req, res) => {
    const urlPath = req.url?.split('?')[0] || '/';

    if (urlPath === '/__mini_astro_live') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      clients.push(res);
      req.on('close', () => { const i = clients.indexOf(res); if (i !== -1) clients.splice(i, 1); });
      return;
    }

    if (urlPath === '/__mini_astro_reload.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store' });
      res.end(liveReloadScript);
      return;
    }

    let filePath = path.join(outDir, urlPath === '/' ? 'index.html' : urlPath);
    if (!path.relative(outDir, filePath).startsWith('..')) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        let data = fs.readFileSync(filePath);
        if (ext === '.html') {
          let html = data.toString('utf8');
          html = html.replace(/<script>\(function\(\)\{[^<]*EventSource[^<]*__mini_astro_live[^<]*<\/script>\s*/g, '');
          html = html.replace('</body>', '<script src="/__mini_astro_reload.js"></script></body>');
          data = Buffer.from(html, 'utf8');
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

  server.listen(port, host, () => {
    const relSrc = path.relative(cwd, srcDir).replace(/\\/g, '/') || 'src';
    const networkAddr = getLocalNetworkAddress();
    console.log(c.green + '  ◆\x1b[0m ' + c.bold + 'Local\x1b[0m   ' + c.cyan + 'http://localhost:' + port + c.reset);
    if (networkAddr) {
      console.log(c.green + '  ◆\x1b[0m ' + c.bold + 'Network\x1b[0m ' + c.cyan + 'http://' + networkAddr + ':' + port + c.reset);
    }
    console.log(c.silver + '  ◆\x1b[0m Watch    ' + c.reset + relSrc);
    console.log('');
    console.log(c.dim + '  Ready. Edit and save to reload.\x1b[0m');
    console.log('');
    console.log('  ' + c.bold + c.magenta + 'mini astro' + c.reset);
    console.log('');
  });
}
