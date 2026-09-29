import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/loadConfig.js';
import { makeProject, runCli } from './helpers.js';

test('defaults when there is no config file', async () => {
  const dir = makeProject({});
  const config = await loadConfig(dir);
  assert.equal(config.srcDir, 'src');
  assert.equal(config.outDir, 'dist');
  assert.equal(config.dataDir, 'src/data');
  assert.equal(config.dev.port, 2323);
  assert.equal(config.security.csp, true);
});

test('nested objects are merged, not replaced', async () => {
  const dir = makeProject({ 'mini-astro.config.js': 'export default { dev: {}, security: { csp: false } };' });
  const config = await loadConfig(dir);
  assert.equal(config.dev.port, 2323);
  assert.equal(config.security.csp, false);
});

test('a config with a syntax error fails with the reason instead of using defaults', async () => {
  const dir = makeProject({ 'mini-astro.config.js': 'export default { outDir: "x", ' });
  await assert.rejects(loadConfig(dir), /Failed to load .*mini-astro\.config\.js: /);

  const r = runCli(['build'], dir);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Failed to load .*mini-astro\.config\.js/);
  assert.doesNotMatch(r.stderr, /Source directory not found/);
});

test('a config that throws or exports a non-object fails', async () => {
  const throws = makeProject({ 'mini-astro.config.js': 'throw new Error("nope"); export default {};' });
  await assert.rejects(loadConfig(throws), /Failed to load .*: nope/);

  const notObject = makeProject({ 'mini-astro.config.js': 'export default 42;' });
  await assert.rejects(loadConfig(notObject), /must export a config object/);
});

test('outDir may not be the project root or overlap srcDir', async () => {
  for (const cfg of ["{ outDir: '.' }", "{ outDir: 'src' }", "{ outDir: 'src/out' }", "{ srcDir: 'dist/src' }"]) {
    const dir = makeProject({ 'mini-astro.config.js': `export default ${cfg};` });
    await assert.rejects(loadConfig(dir), /outDir .* must not be the project root or overlap srcDir/, cfg);
  }
});

test('invalid types are rejected', async () => {
  const cases = [
    ["{ srcDir: '' }", /"srcDir" must be a non-empty string/],
    ['{ dev: { port: "abc" } }', /dev\.port must be a port number/],
    ['{ security: { csp: 1 } }', /security\.csp must be true, false or a policy string/],
  ];
  for (const [cfg, re] of cases) {
    const dir = makeProject({ 'mini-astro.config.js': `export default ${cfg};` });
    await assert.rejects(loadConfig(dir), re, cfg);
  }
});

test('edits to the config file are picked up in the same process', async () => {
  const dir = makeProject({ 'mini-astro.config.js': "export default { outDir: 'a' };" });
  assert.equal((await loadConfig(dir)).outDir, 'a');
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`${dir}/mini-astro.config.js`, "export default { outDir: 'bb' };");
  assert.equal((await loadConfig(dir)).outDir, 'bb');
});
