/**
 * @typedef {Object} MiniAstroConfig
 * @property {string} [srcDir='src'] - Source directory (pages/, templates/, atoms/, molecules/, organisms/)
 * @property {string} [outDir='dist'] - Output directory. Must not be the project root or overlap srcDir.
 * @property {string} [dataDir='src/data'] - Data directory (relative to cwd): *.json, *.js, *.mjs
 * @property {{ port?: number }} [dev] - Dev server options (PORT env overrides port)
 * @property {Object} [security]
 * @property {boolean | string} [security.csp=true] - CSP <meta> injected into pages that lack one:
 *   true = default strict policy, false = none, string = that policy
 */

/** @type {MiniAstroConfig} */
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  dev: { port: 2323 },
  security: { csp: true },
};
