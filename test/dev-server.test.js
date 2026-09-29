import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { CLI, makeProject, writeFiles } from './helpers.js';

let dir;
let child;
let base;
let output = '';

/** Raw GET that does not normalise the path (fetch would resolve "..") */
function rawGet(port, rawPath) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path: rawPath }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

/** Poll until fn() resolves truthy or time runs out. */
async function waitFor(fn, what, timeout = 8000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    last = await fn().catch((e) => e);
    if (last === true) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.fail(`Timed out waiting for ${what}. Last: ${last}. Server output:\n${output}`);
}

async function get(p) {
  const res = await fetch(base + p);
  return { status: res.status, type: res.headers.get('content-type'), body: await res.text() };
}

before(async () => {
  dir = makeProject({
    'mini-astro.config.js': 'export default { security: { csp: false } };',
    'src/templates/Base.html': '<html><head><title>{{ title }}</title></head><body><slot /></body></html>',
    'src/pages/index.html': '---\ntitle: Home\n---\n<p>v1</p>',
    'src/pages/about.html': '<p>about</p>',
    'public/css/a.css': 'body{}',
    'public/fonts/f.woff2': 'woff2',
    'public/a b.txt': 'spaced',
    'secret.txt': 'outside dist',
  });
  child = spawn(process.execPath, [CLI, 'dev'], { cwd: dir, env: { ...process.env, PORT: '0' } });
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));
  await waitFor(async () => {
    const m = output.replace(/\x1b\[[0-9;]*m/g, '').match(/Local\s+http:\/\/localhost:(\d+)/);
    if (m) base = `http://127.0.0.1:${m[1]}`;
    return Boolean(m);
  }, 'dev server to start');
});

after(() => {
  child?.kill();
});

test('serves pages with clean URLs and injects the live-reload script', async () => {
  const home = await get('/');
  assert.equal(home.status, 200);
  assert.match(home.type, /text\/html/);
  assert.match(home.body, /<p>v1<\/p><script src="\/__mini_astro_reload\.js"><\/script><\/body>/);
  for (const p of ['/about', '/about/', '/about/index.html']) {
    assert.match((await get(p)).body, /<p>about<\/p>/, p);
  }
  assert.equal((await get('/missing')).status, 404);
});

test('content types for assets, and URL-encoded names', async () => {
  assert.match((await get('/css/a.css')).type, /text\/css/);
  assert.equal((await get('/fonts/f.woff2')).type, 'font/woff2');
  const spaced = await get('/a%20b.txt');
  assert.equal(spaced.status, 200);
  assert.equal(spaced.body, 'spaced');
});

test('requests cannot escape outDir', async () => {
  const port = new URL(base).port;
  for (const p of ['/../secret.txt', '/..%2fsecret.txt', '/%2e%2e/secret.txt', '/css/../../secret.txt']) {
    const r = await rawGet(port, p);
    assert.equal(r.status, 404, p);
    assert.doesNotMatch(r.body, /outside dist/, p);
  }
});

test('rebuilds on change, add and delete, and notifies live-reload clients', async () => {
  const ac = new AbortController();
  const events = await fetch(`${base}/__mini_astro_live`, { signal: ac.signal });
  const reader = events.body.getReader();
  let sse = '';
  const readLoop = (async () => {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        sse += new TextDecoder().decode(value);
      }
    } catch {}
  })();

  writeFiles(dir, { 'src/pages/index.html': '---\ntitle: Home\n---\n<p>v2</p>' });
  await waitFor(async () => /<p>v2<\/p>/.test((await get('/')).body), 'change to rebuild');
  await waitFor(async () => sse.includes('data: reload'), 'reload event');

  writeFiles(dir, { 'src/pages/new.html': '<p>new</p>' });
  await waitFor(async () => (await get('/new')).status === 200, 'added page to be served');

  fs.rmSync(path.join(dir, 'src/pages/new.html'));
  await waitFor(async () => (await get('/new')).status === 404, 'deleted page to disappear');

  writeFiles(dir, { 'public/css/b.css': 'p{}' });
  await waitFor(async () => (await get('/css/b.css')).status === 200, 'public/ changes to be copied');

  ac.abort();
  await readLoop;
});

test('a failed build keeps the server up, shows the error, and recovers', async () => {
  writeFiles(dir, { 'src/pages/index.html': '<mini-include src="Broken" />' });
  await waitFor(async () => (await get('/')).status === 500, 'error page');

  const err = await get('/');
  assert.match(err.body, /mini-astro build failed/);
  assert.match(err.body, /Component &quot;Broken&quot; not found/);
  assert.match(err.body, /__mini_astro_reload\.js/, 'error page reloads itself when fixed');
  assert.equal((await get('/css/a.css')).status, 200, 'assets are still served');

  writeFiles(dir, { 'src/pages/index.html': '<p>fixed</p>' });
  await waitFor(async () => {
    const r = await get('/');
    return r.status === 200 && /<p>fixed<\/p>/.test(r.body);
  }, 'recovery after fix');
  assert.equal(child.exitCode, null, 'dev server still running');
});
