import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js');

/**
 * Create a throwaway project. Keys are paths relative to the project root.
 * @param {Record<string, string>} files
 * @returns {string} project dir
 */
export function makeProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mini-astro-test-'));
  writeFiles(dir, files);
  return dir;
}

/** @param {string} dir @param {Record<string, string>} files */
export function writeFiles(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
}

/** @param {string} dir @param {string} rel */
export function read(dir, rel) {
  return fs.readFileSync(path.join(dir, rel), 'utf8');
}

/** @param {string} dir @param {string} rel */
export function exists(dir, rel) {
  return fs.existsSync(path.join(dir, rel));
}

/**
 * Run the CLI synchronously with stdin closed (non-TTY).
 * @param {string[]} args
 * @param {string} cwd
 */
export function runCli(args, cwd) {
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8', input: '' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** Minimal page + Base template, CSP off so output is easy to assert. */
export function basicProject(extra = {}) {
  return makeProject({
    'mini-astro.config.js': 'export default { security: { csp: false } };\n',
    'src/templates/Base.html': '<html><head><meta charset="utf-8"><title>{{ title }}</title></head><body><slot /></body></html>',
    ...extra,
  });
}
