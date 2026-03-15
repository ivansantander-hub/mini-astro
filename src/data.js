import path from 'node:path';
import fs from 'node:fs';

/**
 * Load site data from src/data/*.json or data.js
 * @param {string} dataDir - absolute path to data dir
 * @returns {Record<string, unknown>}
 */
export function loadData(dataDir) {
  const site = {};
  if (!fs.existsSync(dataDir)) return site;

  const files = fs.readdirSync(dataDir);
  for (const f of files) {
    const full = path.join(dataDir, f);
    if (fs.statSync(full).isDirectory()) continue;
    const base = path.basename(f, path.extname(f));
    if (f.endsWith('.json')) {
      try {
        site[base] = JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch {
        // ignore invalid json
      }
    }
  }

  return site;
}
