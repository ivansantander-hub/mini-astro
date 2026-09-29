import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import { runBuild } from './build.js';
import { loadConfig } from './loadConfig.js';
import { escapeHtml } from './resolve.js';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

const LIVE_RELOAD_SCRIPT =
  "(function(){var e=new EventSource('/__mini_astro_live');e.onmessage=function(){e.close();location.reload();};})();";
const RELOAD_TAG = '<script src="/__mini_astro_reload.js"></script>';

/** @returns {string | null} First non-internal IPv4 address for Network URL */
function getLocalNetworkAddress() {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return null;
}

/**
 * Resolve a URL path to a file inside outDir: /about → about/index.html or
 * about.html; /css/a.css → css/a.css. Never resolves outside outDir.
 * @param {string} outDir - absolute
 * @param {string} urlPath - e.g. '/' or '/cookies' or '/cookies/'
 * @returns {string | null} absolute file path, or null
 */
export function resolveCleanUrl(outDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const clean = decoded.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const candidates = clean
    ? [clean, `${clean}/index.html`, clean.endsWith('.html') ? null : `${clean}.html`]
    : ['index.html'];

  for (const rel of candidates) {
    if (!rel) continue;
    const full = path.resolve(outDir, rel);
    if (full !== outDir && !full.startsWith(outDir + path.sep)) return null;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

/** @param {string} html */
function injectReload(html) {
  const i = html.toLowerCase().lastIndexOf('</body>');
  return i === -1 ? html + RELOAD_TAG : html.slice(0, i) + RELOAD_TAG + html.slice(i);
}

/** @param {Error} err */
function errorPage(err) {
  return injectReload(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Build error</title></head>` +
      `<body style="font:14px/1.5 ui-monospace,monospace;padding:2rem;background:#1a0d0d;color:#fecaca">` +
      `<h1 style="font-size:1rem">mini-astro build failed</h1><pre style="white-space:pre-wrap">${escapeHtml(
        String(err?.message ?? err)
      )}</pre><p style="color:#a1a1aa">Fix the file and save; the page reloads.</p></body></html>`
  );
}

function printBanner() {
  const c = { reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m' };
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
}

/**
 * Start dev server: build, watch sources, serve outDir with live reload.
 * A failed build does not stop the server: HTML requests show the error until
 * the next successful build.
 * @param {string} cwd
 * @returns {Promise<{ server: http.Server, port: number, close: () => Promise<void> }>}
 */
export async function runDev(cwd) {
  const config = await loadConfig(cwd);
  const outDir = path.resolve(cwd, config.outDir);
  const srcDir = path.resolve(cwd, config.srcDir);
  const publicDir = path.join(cwd, 'public');
  const dataDir = path.resolve(cwd, config.dataDir);
  const configPath = path.join(cwd, 'mini-astro.config.js');

  printBanner();

  /** @type {Error | null} */
  let lastError = null;
  /** @type {http.ServerResponse[]} */
  const clients = [];
  const broadcastReload = () => {
    for (const r of clients) {
      try {
        r.write('data: reload\n\n');
      } catch {}
    }
  };

  let building = false;
  let pending = false;
  async function rebuild() {
    if (building) {
      pending = true;
      return;
    }
    building = true;
    try {
      await runBuild(cwd);
      if (lastError) console.log('\x1b[32m  Build fixed.\x1b[0m');
      lastError = null;
    } catch (err) {
      lastError = err;
      console.error(`\x1b[31m  Build failed:\x1b[0m ${err.message}`);
    } finally {
      building = false;
    }
    if (pending) {
      pending = false;
      await rebuild();
    } else {
      broadcastReload();
    }
  }

  await rebuild();

  let watcher = null;
  try {
    const chokidar = (await import('chokidar')).default;
    const targets = [srcDir, publicDir, dataDir, configPath].filter((p) => fs.existsSync(p));
    watcher = chokidar.watch(targets, {
      ignoreInitial: true,
      ignored: (p) => p === outDir || p.startsWith(outDir + path.sep) || p.includes(`${path.sep}.mini-astro`),
    });
    let timer = null;
    watcher.on('all', () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 50);
    });
  } catch {
    console.log('Tip: install chokidar for watch/live reload');
  }

  const server = http.createServer((req, res) => {
    const urlPath = (req.url ?? '/').split('?')[0] || '/';

    if (urlPath === '/__mini_astro_live') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(': connected\n\n');
      clients.push(res);
      req.on('close', () => {
        const i = clients.indexOf(res);
        if (i !== -1) clients.splice(i, 1);
      });
      return;
    }

    if (urlPath === '/__mini_astro_reload.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(LIVE_RELOAD_SCRIPT);
      return;
    }

    const filePath = resolveCleanUrl(outDir, urlPath);
    const wantsHtml = !filePath ? !path.extname(urlPath) : filePath.endsWith('.html');

    if (lastError && wantsHtml) {
      res.writeHead(500, { 'Content-Type': MIME_TYPES['.html'], 'Cache-Control': 'no-store' });
      res.end(errorPage(lastError));
      return;
    }

    if (!filePath) {
      res.writeHead(404, { 'Content-Type': MIME_TYPES['.txt'] });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (ext === '.html') {
      res.end(injectReload(fs.readFileSync(filePath, 'utf8')));
    } else {
      fs.createReadStream(filePath).pipe(res);
    }
  });

  const port = Number.parseInt(String(process.env.PORT || config.dev.port), 10);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', resolve);
  });
  const actualPort = /** @type {import('node:net').AddressInfo} */ (server.address()).port;

  const c = { reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m', cyan: '\x1b[36m', green: '\x1b[32m', silver: '\x1b[90m', magenta: '\x1b[35m' };
  const relSrc = path.relative(cwd, srcDir).replace(/\\/g, '/') || '.';
  const networkAddr = getLocalNetworkAddress();
  console.log(c.green + '  ◆' + c.reset + ' ' + c.bold + 'Local' + c.reset + '   ' + c.cyan + 'http://localhost:' + actualPort + c.reset);
  if (networkAddr) {
    console.log(c.green + '  ◆' + c.reset + ' ' + c.bold + 'Network' + c.reset + ' ' + c.cyan + 'http://' + networkAddr + ':' + actualPort + c.reset);
  }
  console.log(c.silver + '  ◆' + c.reset + ' Watch    ' + relSrc + (fs.existsSync(publicDir) ? ', public' : ''));
  console.log('');
  console.log(c.dim + '  Ready. Edit and save to reload.' + c.reset);
  console.log('');
  console.log('  ' + c.bold + c.magenta + 'mini astro' + c.reset);
  console.log('');

  return {
    server,
    port: actualPort,
    close: async () => {
      await watcher?.close();
      for (const r of clients) r.end();
      await new Promise((resolve) => server.close(() => resolve()));
    },
  };
}
