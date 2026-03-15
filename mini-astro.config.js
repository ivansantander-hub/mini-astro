/**
 * @typedef {Object} MiniAstroConfig
 * @property {string} [srcDir='src'] - Source directory
 * @property {string} [outDir='dist'] - Output directory
 * @property {string} [dataDir='src/data'] - Data directory (relative to cwd)
 * @property {boolean} [atomicDesign=true] - Use atoms/molecules/organisms structure
 * @property {Object} [cookies] - Cookie consent settings
 * @property {boolean} [cookies.strict=true] - Inject cookie consent banner (strict by default)
 * @property {Object} [security] - Security headers / CSP
 * @property {boolean} [security.csp=true] - Inject strict CSP meta tag
 * @property {boolean} [security.policyPages=true] - Generate cookies/privacidad pages
 */

/** @type {MiniAstroConfig} */
export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: true },
  security: { csp: true, policyPages: true },
};
