import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Load site data from dataDir. Each file becomes `site.<basename>`:
 * - *.json  → parsed JSON
 * - *.js / *.mjs → default export (an object, or a function / async function
 *   that returns one)
 * Invalid files fail the build with the file name instead of being skipped.
 * @param {string} dataDir - absolute path to data dir
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadData(dataDir) {
  const site = {};
  if (!fs.existsSync(dataDir)) return site;

  for (const f of fs.readdirSync(dataDir).sort()) {
    const full = path.join(dataDir, f);
    if (fs.statSync(full).isDirectory()) continue;
    const ext = path.extname(f);
    const base = path.basename(f, ext);

    if (ext === '.json') {
      try {
        site[base] = JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch (err) {
        throw new Error(`Invalid JSON in ${full}: ${err.message}`);
      }
    } else if (ext === '.js' || ext === '.mjs') {
      try {
        // Query string busts the ESM cache so `dev` picks up edits.
        const { mtimeMs, size } = fs.statSync(full);
        const mod = await import(`${pathToFileURL(full).href}?t=${mtimeMs}-${size}`);
        const value = mod.default ?? mod;
        site[base] = typeof value === 'function' ? await value() : value;
      } catch (err) {
        throw new Error(`Failed to load data file ${full}: ${err.message}`);
      }
    }
  }

  return site;
}
