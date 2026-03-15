import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

const DEFAULT_CONFIG = {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: true },
  security: { csp: true, policyPages: true },
};

/**
 * @param {string} cwd
 * @returns {Promise<import('../mini-astro.config.js').default>}
 */
export async function loadConfig(cwd) {
  const configPath = path.join(cwd, 'mini-astro.config.js');
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const mod = await import(pathToFileURL(configPath).href);
    return { ...DEFAULT_CONFIG, ...(mod.default || mod) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
