import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runBuild, outputPathFor } from '../src/build.js';
import { DEFAULT_CSP } from '../src/loadConfig.js';
import { basicProject, makeProject, writeFiles, read, exists } from './helpers.js';

const build = (dir) => runBuild(dir, { quiet: true });

// ── Bug 1: components resolve against the configured srcDir ──────────────────
test('components are found under a custom srcDir', async () => {
  const dir = makeProject({
    'mini-astro.config.js': "export default { srcDir: 'app', dataDir: 'app/data', security: { csp: false } };",
    'app/atoms/Tag.html': '<b>tag</b>',
    'app/pages/index.html': '<mini-include src="Tag" />',
  });
  await build(dir);
  assert.equal(read(dir, 'dist/index.html'), '<b>tag</b>');
});

// ── Bug 2: components see site data and page frontmatter ─────────────────────
test('components receive site data, page frontmatter and their own props', async () => {
  const dir = basicProject({
    'src/data/meta.json': '{"name":"My Site"}',
    'src/atoms/Tag.html': '[{{ site.meta.name }}|{{ title }}|{{ label }}]',
    'src/pages/index.html': '---\ntitle: Home\n---\n<mini-include src="Tag" label="x" />',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /\[My Site\|Home\|x\]/);
});

test('component props override page frontmatter and can reference it', async () => {
  const dir = basicProject({
    'src/atoms/Link.html': '<a href="{{ href }}">{{ title }}</a>',
    'src/pages/index.html': '---\ntitle: Page\nbase: /docs\n---\n<mini-include src="Link" href="{{ base }}/intro" title="Intro" />',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<a href="\/docs\/intro">Intro<\/a>/);
});

test('nested includes inherit context; relative, prefixed and non-self-closing forms work', async () => {
  const dir = basicProject({
    'src/atoms/Dot.html': '<i>{{ color }}</i>',
    'src/molecules/Row.html': '<div><mini-include src="../atoms/Dot"></mini-include><mini-include src="atoms/Dot" color="blue" /></div>',
    'src/pages/index.html': '---\ncolor: red\n---\n<mini-include src="Row" />',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<div><i>red<\/i><i>blue<\/i><\/div>/);
});

test('hyphenated attributes are passed to the component', async () => {
  const dir = basicProject({
    'src/atoms/Btn.html': '<button data-id="{{ data-id }}">{{ aria-label }}</button>',
    'src/pages/index.html': '<mini-include src="Btn" data-id="7" aria-label="Close" />',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<button data-id="7">Close<\/button>/);
});

test('attribute values may contain ">" inside quotes', async () => {
  const dir = basicProject({
    'src/atoms/Q.html': '<q>{{ text }}</q>',
    'src/pages/index.html': '<mini-include src="Q" text="a > b" />',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<q>a &gt; b<\/q>/);
});

test('a missing component fails the build with the name and where it looked', async () => {
  const dir = basicProject({ 'src/pages/index.html': '<mini-include src="Nope" />' });
  await assert.rejects(build(dir), /Component "Nope" not found \(included from pages[\\/]index\.html\)\. Looked in: atoms[\\/]Nope\.html/);
});

test('quarks are not includable: the error says so explicitly by not finding them', async () => {
  const dir = basicProject({
    'src/quarks/Tokens.html': '<i>q</i>',
    'src/pages/index.html': '<mini-include src="Tokens" />',
  });
  await assert.rejects(build(dir), /Component "Tokens" not found/);
});

test('circular includes fail instead of looping', async () => {
  const dir = basicProject({
    'src/atoms/A.html': '<mini-include src="B" />',
    'src/atoms/B.html': '<mini-include src="A" />',
    'src/pages/index.html': '<mini-include src="A" />',
  });
  await assert.rejects(build(dir), /Circular <mini-include>: pages[\\/]index\.html → atoms[\\/]A\.html → atoms[\\/]B\.html → atoms[\\/]A\.html/);
});

// ── Bug 3: HTML escaping ──────────────────────────────────────────────────────
test('{{ var }} escapes HTML; {{{ var }}} inserts it raw', async () => {
  const dir = basicProject({
    'src/pages/index.html': `---\ntitle: <script>alert(1)</script>\nsnippet: <em>hi</em>\n---\n<p>{{ title }}</p>{{{ snippet }}}`,
  });
  await build(dir);
  const html = read(dir, 'dist/index.html');
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html, /<p>&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/p><em>hi<\/em>/);
  assert.match(html, /<title>&lt;script&gt;/);
});

test('values are rendered once: {{ }} inside data is not evaluated', async () => {
  const dir = basicProject({
    'src/data/d.json': '{"a":"{{ secret }}","secret":"leaked"}',
    'src/pages/index.html': '---\nsecret: leaked\n---\n{{{ site.d.a }}}',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<body>\{\{ secret \}\}<\/body>/);
});

test('page content with $& or $1 is inserted literally into the slot', async () => {
  const dir = basicProject({ 'src/pages/index.html': '<p>Price: $& and $1 and $$</p>' });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<p>Price: \$& and \$1 and \$\$<\/p>/);
});

test('undefined variables render empty; objects render as JSON', async () => {
  const dir = basicProject({
    'src/data/cfg.json': '{"list":[1,2]}',
    'src/pages/index.html': '[{{ nope }}][{{{ site.cfg.list }}}]',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /\[\]\[\[1,2\]\]/);
});

// ── Bug 4: template frontmatter ───────────────────────────────────────────────
test('template frontmatter is not output and acts as page defaults', async () => {
  const dir = makeProject({
    'mini-astro.config.js': 'export default { security: { csp: false } };',
    'src/templates/Base.html': '---\ntitle: Default title\nlang: en\n---\n<html lang="{{ lang }}"><head><title>{{ title }}</title></head><body><slot /></body></html>',
    'src/pages/index.html': '<p>home</p>',
    'src/pages/about.html': '---\ntitle: About\n---\n<p>about</p>',
  });
  await build(dir);
  const home = read(dir, 'dist/index.html');
  assert.ok(!home.includes('---'), home);
  assert.match(home, /^<html lang="en"><head><title>Default title<\/title>/);
  assert.match(read(dir, 'dist/about/index.html'), /<title>About<\/title>/);
});

test('an explicit layout that does not exist fails; no Base means a bare page', async () => {
  const dir = makeProject({
    'mini-astro.config.js': 'export default { security: { csp: false } };',
    'src/pages/index.html': '<p>bare</p>',
  });
  await build(dir);
  assert.equal(read(dir, 'dist/index.html'), '<p>bare</p>');

  writeFiles(dir, { 'src/pages/x.html': '---\nlayout: Blog\n---\n<p>x</p>' });
  await assert.rejects(build(dir), /Layout "Blog" not found for pages\/x\.html/);
});

test('a template without <slot /> fails the build', async () => {
  const dir = makeProject({
    'mini-astro.config.js': 'export default { security: { csp: false } };',
    'src/templates/Base.html': '<html><body>no slot</body></html>',
    'src/pages/index.html': '<p>x</p>',
  });
  await assert.rejects(build(dir), /Template Base\.html has no <slot \/>/);
});

// ── Bug 5: clean URLs for index.html in subdirectories ────────────────────────
test('outputPathFor maps pages to clean URLs', () => {
  assert.equal(outputPathFor('index.html'), 'index.html');
  assert.equal(outputPathFor('about.html'), 'about/index.html');
  assert.equal(outputPathFor('blog/index.html'), 'blog/index.html');
  assert.equal(outputPathFor('blog/post.html'), 'blog/post/index.html');
});

test('pages/blog/index.html builds to /blog/, not /blog/index/', async () => {
  const dir = basicProject({
    'src/pages/index.html': 'home',
    'src/pages/blog/index.html': 'blog',
    'src/pages/blog/post.html': 'post',
  });
  const { pages } = await build(dir);
  assert.deepEqual(pages.sort(), ['blog/index.html', 'blog/post/index.html', 'index.html']);
  assert.ok(!exists(dir, 'dist/blog/index/index.html'));
});

test('two pages that build to the same URL fail the build', async () => {
  const dir = basicProject({
    'src/pages/blog.html': 'a',
    'src/pages/blog/index.html': 'b',
  });
  await assert.rejects(build(dir), /Route collision: pages\/blog\.html and pages\/blog\/index\.html both build to blog\/index\.html/);
});

// ── security.csp is honoured by the build ─────────────────────────────────────
test('csp true injects the default policy after <meta charset>', async () => {
  const dir = makeProject({
    'src/templates/Base.html': '<html><head><meta charset="utf-8"><title>t</title></head><body><slot /></body></html>',
    'src/pages/index.html': 'x',
  });
  await build(dir);
  const html = read(dir, 'dist/index.html');
  assert.ok(html.includes(`<meta charset="utf-8">\n  <meta http-equiv="Content-Security-Policy" content="${DEFAULT_CSP}">`), html);
});

test('csp string uses that policy; csp false injects nothing; an existing CSP meta is kept', async () => {
  const withString = basicProject({ 'src/pages/index.html': 'x' });
  writeFiles(withString, { 'mini-astro.config.js': `export default { security: { csp: "default-src 'none'" } };` });
  await build(withString);
  assert.match(read(withString, 'dist/index.html'), /content="default-src 'none'"/);

  const off = basicProject({ 'src/pages/index.html': 'x' });
  await build(off);
  assert.ok(!/Content-Security-Policy/i.test(read(off, 'dist/index.html')));

  const own = makeProject({
    'src/templates/Base.html': `<html><head><meta http-equiv="Content-Security-Policy" content="img-src *"></head><body><slot /></body></html>`,
    'src/pages/index.html': 'x',
  });
  await build(own);
  const html = read(own, 'dist/index.html');
  assert.equal((html.match(/Content-Security-Policy/g) || []).length, 1);
  assert.match(html, /content="img-src \*"/);
});

test('csp is not added to fragments without <head>', async () => {
  const dir = makeProject({ 'src/pages/frag.html': '<p>fragment</p>' });
  await build(dir);
  assert.equal(read(dir, 'dist/frag/index.html'), '<p>fragment</p>');
});

// ── Stale output ──────────────────────────────────────────────────────────────
test('files written by a previous build and not rebuilt are removed; foreign files are kept', async () => {
  const dir = basicProject({
    'src/pages/index.html': 'home',
    'src/pages/old.html': 'old',
    'src/pages/docs/a.html': 'a',
    'public/css/old.css': 'x',
    'public/css/keep.css': 'y',
  });
  await build(dir);
  assert.ok(exists(dir, 'dist/old/index.html'));
  writeFiles(dir, { 'dist/foreign/model.bin': 'not ours' });

  fs.rmSync(path.join(dir, 'src/pages/old.html'));
  fs.rmSync(path.join(dir, 'src/pages/docs'), { recursive: true });
  fs.rmSync(path.join(dir, 'public/css/old.css'));
  const { removed } = await build(dir);

  assert.deepEqual(removed.sort(), ['css/old.css', 'docs/a/index.html', 'old/index.html']);
  assert.ok(!exists(dir, 'dist/old'), 'empty route dir removed');
  assert.ok(!exists(dir, 'dist/docs'), 'empty nested dirs removed');
  assert.ok(exists(dir, 'dist/css/keep.css'));
  assert.ok(exists(dir, 'dist/foreign/model.bin'), 'files mini-astro did not write are kept');
  assert.ok(exists(dir, 'dist/index.html'));
});

test('changing outDir does not delete files in the old outDir', async () => {
  const dir = basicProject({ 'src/pages/index.html': 'home', 'src/pages/a.html': 'a' });
  await build(dir);
  writeFiles(dir, { 'mini-astro.config.js': "export default { outDir: 'out', security: { csp: false } };" });
  fs.rmSync(path.join(dir, 'src/pages/a.html'));
  const { removed } = await build(dir);
  assert.deepEqual(removed, []);
  assert.ok(exists(dir, 'dist/a/index.html'));
  assert.ok(exists(dir, 'out/index.html'));
});

// ── Data files ────────────────────────────────────────────────────────────────
test('invalid JSON in dataDir fails with the file name', async () => {
  const dir = basicProject({ 'src/data/bad.json': '{ nope', 'src/pages/index.html': 'x' });
  await assert.rejects(build(dir), /Invalid JSON in .*bad\.json/);
});

test('data .js/.mjs files load objects and (async) functions', async () => {
  const dir = basicProject({
    'src/data/obj.mjs': 'export default { name: "obj" };',
    'src/data/fn.js': 'export default async () => ({ n: 42 });',
    'src/pages/index.html': '{{ site.obj.name }}-{{ site.fn.n }}',
  });
  await build(dir);
  assert.match(read(dir, 'dist/index.html'), /<body>obj-42<\/body>/);
});

test('a data .js file that throws fails the build with its path', async () => {
  const dir = basicProject({
    'src/data/boom.js': 'throw new Error("kaboom");',
    'src/pages/index.html': 'x',
  });
  await assert.rejects(build(dir), /Failed to load data file .*boom\.js: kaboom/);
});

// ── Portfolio-specific code is gone ───────────────────────────────────────────
test('title1/title2 attributes are plain props (no marquee generation)', async () => {
  const dir = basicProject({
    'src/molecules/Banner.html': '<p>{{ title1 }}/{{ title2 }}/{{ line1content }}</p>',
    'src/pages/index.html': '<mini-include src="Banner" title1="A" title2="B" />',
  });
  await build(dir);
  const html = read(dir, 'dist/index.html');
  assert.match(html, /<p>A\/B\/<\/p>/);
  assert.ok(!html.includes('PROJECTS'));
});
