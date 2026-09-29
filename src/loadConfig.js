import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

/** Policy injected when `security.csp` is `true`. */
export const DEFAULT_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";

const DEFAULT_CONFIG = {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  dev: { port: 2323 },
  security: { csp: true },
};

/** @param {unknown} v */
function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Merge nested objects key by key, so `security: { csp: false }` keeps the
 * other defaults instead of replacing the whole `security` object.
 * @param {Record<string, any>} base
 * @param {Record<string, any>} override
 */
function deepMerge(base, override) {
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = isPlainObject(v) && isPlainObject(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out;
}

/**
 * @param {Record<string, any>} config
 * @param {string} cwd
 */
function validate(config, cwd) {
  for (const key of ['srcDir', 'outDir', 'dataDir']) {
    if (typeof config[key] !== 'string' || !config[key].trim()) {
      throw new Error(`mini-astro.config.js: "${key}" must be a non-empty string`);
    }
  }
  const root = path.resolve(cwd);
  const srcDir = path.resolve(cwd, config.srcDir);
  const outDir = path.resolve(cwd, config.outDir);
  const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);
  if (outDir === root || inside(srcDir, outDir) || inside(outDir, srcDir)) {
    throw new Error(
      `mini-astro.config.js: outDir (${config.outDir}) must not be the project root or overlap srcDir (${config.srcDir})`
    );
  }
  const port = config.dev?.port;
  if (port != null && (!Number.isInteger(Number(port)) || Number(port) < 0 || Number(port) > 65535)) {
    throw new Error(`mini-astro.config.js: dev.port must be a port number, got ${JSON.stringify(port)}`);
  }
  const csp = config.security?.csp;
  if (typeof csp !== 'boolean' && typeof csp !== 'string') {
    throw new Error('mini-astro.config.js: security.csp must be true, false or a policy string');
  }
}

/**
 * Load mini-astro.config.js from cwd, merged over the defaults.
 * A config file that exists but cannot be loaded is an error: silently falling
 * back to defaults would build from/to the wrong directories.
 * @param {string} cwd
 * @returns {Promise<typeof DEFAULT_CONFIG & Record<string, any>>}
 */
export async function loadConfig(cwd) {
  const configPath = path.join(cwd, 'mini-astro.config.js');
  let userConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      const { mtimeMs, size } = fs.statSync(configPath);
      // Query string busts the ESM cache so edits are picked up (dev, tests).
      const mod = await import(`${pathToFileURL(configPath).href}?t=${mtimeMs}-${size}`);
      userConfig = mod.default ?? {};
    } catch (err) {
      throw new Error(`Failed to load ${configPath}: ${err.message}`);
    }
    if (!isPlainObject(userConfig)) {
      throw new Error(`${configPath} must export a config object (export default { … })`);
    }
  }
  const config = deepMerge(DEFAULT_CONFIG, userConfig);
  validate(config, cwd);
  return config;
}
