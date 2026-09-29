import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runCreate } from '../src/commands/create.js';
import { runBuild } from '../src/build.js';
import { CLI, makeProject, runCli, read, exists } from './helpers.js';

test('`add` reaches the interactive flow (it used to fall through to route)', () => {
  const dir = makeProject({ 'src/pages/index.html': 'x' });
  for (const args of [['add'], ['add', 'atom']]) {
    const r = runCli(args, dir);
    assert.equal(r.code, 1, args.join(' '));
    assert.match(r.stderr, /Usage: mini-astro add \(interactive\)/, args.join(' '));
    assert.ok(!exists(dir, 'src/pages/atom.html'), 'must not create a page called "atom"');
  }
});

test('`add page <route>` and `route <route>` create the page', () => {
  const dir = makeProject({ 'src/pages/index.html': 'x' });
  assert.equal(runCli(['add', 'page', 'about'], dir).code, 0);
  assert.match(read(dir, 'src/pages/about.html'), /title: about/);
  assert.equal(runCli(['route', 'blog/post'], dir).code, 0);
  assert.ok(exists(dir, 'src/pages/blog/post.html'));
});

test('`component` creates the layer directory when it does not exist', () => {
  const dir = makeProject({ 'src/pages/index.html': 'x' });
  const r = runCli(['component', 'Button', 'atom'], dir);
  assert.equal(r.code, 0, r.stderr);
  assert.ok(exists(dir, 'src/atoms/Button.html'));
});

test('unknown flags print an error, not a stack trace', () => {
  const r = runCli(['build', '--nope'], makeProject({}));
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Unknown option '--nope'/);
  assert.doesNotMatch(r.stderr, /at .*\.js:\d+/);
});

test('build errors exit with code 1 and a readable message', () => {
  const dir = makeProject({ 'src/pages/index.html': '<mini-include src="Missing" />' });
  const r = runCli(['build'], dir);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Component "Missing" not found/);
});

test('`create` scaffolds a project that builds, with CSP from config and a .gitignore', async () => {
  const parent = makeProject({});
  const r = runCli(['create', 'site'], parent);
  assert.equal(r.code, 0, r.stderr);
  const dir = path.join(parent, 'site');

  const config = read(dir, 'mini-astro.config.js');
  assert.doesNotMatch(config, /atomicDesign|cookies|policyPages/);
  assert.match(config, /security: \{ csp: "default-src 'self';/);
  assert.match(read(dir, '.gitignore'), /\.mini-astro\//);
  assert.doesNotMatch(read(dir, 'src/templates/Base.html'), /Content-Security-Policy/);

  const b = runCli(['build'], dir);
  assert.equal(b.code, 0, b.stderr);
  for (const page of ['index.html', 'cookies/index.html', 'privacy/index.html']) {
    const html = read(dir, `dist/${page}`);
    assert.equal((html.match(/Content-Security-Policy/g) || []).length, 1, page);
    assert.match(html, /https:\/\/fonts\.googleapis\.com/, page);
    assert.doesNotMatch(html, /<mini-include|\{\{/, page);
  }
  assert.match(read(dir, 'dist/index.html'), /class="site-nav-link">Home</);
  assert.match(read(dir, 'dist/index.html'), /href="https:\/\/github\.com\/ivansantander-hub\/mini-astro"/);
});

test('create without policy pages does not link to /cookies or /privacy', async () => {
  const parent = makeProject({});
  const dir = path.join(parent, 'nopolicy');
  const log = console.log;
  console.log = () => {};
  try {
    await runCreate(dir, 'nopolicy', { cookiesStrict: true, policyPages: false, csp: false });
  } finally {
    console.log = log;
  }
  await runBuild(dir, { quiet: true });
  assert.ok(!exists(dir, 'dist/cookies'));
  const html = read(dir, 'dist/index.html');
  assert.doesNotMatch(html, /href="\/cookies"|href="\/privacy"/);
  assert.doesNotMatch(html, /Content-Security-Policy/);
  assert.match(html, /id="cookie-consent"/, 'consent bar still rendered');
  assert.match(read(dir, 'mini-astro.config.js'), /security: \{ csp: false \}/);
  assert.ok(fs.existsSync(path.join(dir, 'public/js/consent.js')));
});

test('`init` answers flow through to the scaffold (port, CSP, policy pages)', () => {
  const parent = makeProject({});
  // name, cookie banner, policy pages, CSP, port, package manager
  const r = spawnSync(process.execPath, [CLI, 'init'], {
    cwd: parent,
    encoding: 'utf8',
    input: 'mysite\nn\nn\nn\n4321\nnpm\n',
  });
  assert.equal(r.status, 0, r.stderr);
  const dir = path.join(parent, 'mysite');
  const config = read(dir, 'mini-astro.config.js');
  assert.match(config, /dev: \{ port: 4321 \}/);
  assert.match(config, /security: \{ csp: false \}/);
  assert.ok(!exists(dir, 'src/pages/cookies.html'));
  assert.ok(!exists(dir, 'src/molecules/CookieConsentBar.html'));
  assert.equal(runCli(['build'], dir).code, 0);
  assert.doesNotMatch(read(dir, 'dist/index.html'), /cookie-consent|href="\/cookies"/);
});
