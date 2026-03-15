import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, '../../templates');

/**
 * Create a new project (scaffold)
 * @param {string} projectDir - absolute path where to create
 * @param {string} [projectName] - name for package.json
 * @param {{ cookiesStrict?: boolean, policyPages?: boolean, csp?: boolean, packageManager?: 'pnpm'|'yarn'|'npm' }} [opts]
 */
export async function runCreate(projectDir, projectName, opts = {}) {
  const name = projectName || path.basename(projectDir);
  const cookiesStrict = opts.cookiesStrict !== false;
  const policyPages = opts.policyPages !== false;
  const csp = opts.csp !== false;
  const packageManager = ['pnpm', 'yarn', 'npm'].includes(opts.packageManager) ? opts.packageManager : 'pnpm';

  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory already exists: ${projectDir}`);
  }

  const dirs = [
    path.join(projectDir, 'src', 'quarks'),
    path.join(projectDir, 'src', 'atoms'),
    path.join(projectDir, 'src', 'molecules'),
    path.join(projectDir, 'src', 'organisms'),
    path.join(projectDir, 'src', 'templates'),
    path.join(projectDir, 'src', 'pages'),
    path.join(projectDir, 'src', 'data'),
    path.join(projectDir, 'public', 'css'),
    path.join(projectDir, 'public', 'js'),
    path.join(projectDir, 'public', 'img'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });

  // Quarks: design tokens (Atomic Design level 0)
  const tokensJson = {
    colors: {
      bg: '#0a0a0c',
      surface: '#141416',
      text: '#fafafa',
      textMuted: '#a1a1aa',
      accent: '#22d3ee',
      yellow: '#eab308',
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
    typography: { fontDisplay: 'Orbitron', fontBody: 'DM Sans' },
    radius: { sm: '8px', md: '14px', lg: '20px' },
  };
  fs.writeFileSync(path.join(projectDir, 'src', 'quarks', 'tokens.json'), JSON.stringify(tokensJson, null, 2), 'utf8');
  fs.writeFileSync(
    path.join(projectDir, 'src', 'quarks', 'README.md'),
    `# Quarks (design tokens)

Design tokens — colors, spacing, typography, radii. Single source of truth for the design language.

- \`tokens.json\` — consumed by your CSS (e.g. \`public/css/theme.css\`) or build step.
- Do not put UI components here; only token values.
`,
    'utf8'
  );

  // Default theme (landing + cookie bar)
  fs.writeFileSync(path.join(projectDir, 'public', 'css', 'theme.css'), getThemeCss(), 'utf8');

  // Atom: NavLink (Atomic Design level 1)
  fs.writeFileSync(path.join(projectDir, 'src', 'atoms', 'NavLink.html'), getNavLinkAtom(), 'utf8');
  // Organism: SiteHeader (Atomic Design level 3), uses NavLink
  fs.writeFileSync(path.join(projectDir, 'src', 'organisms', 'SiteHeader.html'), getSiteHeaderOrganism(cookiesStrict), 'utf8');

  // Base template (uses organism SiteHeader)
  const baseTemplate = getBaseTemplate(cookiesStrict, csp);
  fs.writeFileSync(path.join(projectDir, 'src', 'templates', 'Base.html'), baseTemplate, 'utf8');

  // index page
  const indexPage = getIndexPage(cookiesStrict);
  fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'index.html'), indexPage, 'utf8');

  // CookieConsentBar molecule + external script (CSP-safe) + developer doc
  if (cookiesStrict) {
    fs.writeFileSync(
      path.join(projectDir, 'src', 'molecules', 'CookieConsentBar.html'),
      getCookieConsentBar(),
      'utf8'
    );
    fs.writeFileSync(path.join(projectDir, 'public', 'js', 'consent.js'), getConsentJs(), 'utf8');
    fs.writeFileSync(
      path.join(projectDir, 'COOKIE_CONSENT.md'),
      getCookieConsentDoc(),
      'utf8'
    );
  }

  if (policyPages) {
    fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'cookies.html'), getCookiesPage(), 'utf8');
    fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'privacidad.html'), getPrivacidadPage(), 'utf8');
  }

  const siteJson = {
    title: name,
    repository: 'https://github.com/ivansantander-hub/mini-astro',
  };
  fs.writeFileSync(path.join(projectDir, 'src', 'data', 'site.json'), JSON.stringify(siteJson, null, 2), 'utf8');

  const devPort = opts.devPort != null ? Number(opts.devPort) : 2323;
  const config = `export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  dev: { port: ${devPort} },
  cookies: { strict: ${cookiesStrict} },
  security: { csp: ${csp}, policyPages: ${policyPages} },
};
`;
  fs.writeFileSync(path.join(projectDir, 'mini-astro.config.js'), config, 'utf8');

  const pkg = {
    name: name.replace(/\s+/g, '-').toLowerCase(),
    version: '0.0.1',
    private: true,
    type: 'module',
    scripts: {
      build: 'mini-astro build',
      dev: 'mini-astro dev',
    },
    dependencies: {
      'mini-astro': 'github:ivansantander-hub/mini-astro',
    },
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');

  const installCmd = packageManager === 'pnpm' ? 'pnpm install' : packageManager === 'yarn' ? 'yarn' : 'npm install';
  const devCmd = packageManager === 'pnpm' ? 'pnpm dev' : packageManager === 'yarn' ? 'yarn dev' : 'npm run dev';
  console.log(`\nCreated with ${packageManager}. Dev server port: ${devPort}`);
  console.log(`Run:\n  cd ${path.basename(projectDir)}\n  ${installCmd}\n  ${devCmd}`);
}

/** Atom: single nav link (Atomic Design level 1). Props: href, label */
function getNavLinkAtom() {
  return '<a href="{{ href }}" class="site-nav-link">{{ label }}</a>';
}

/** Organism: site header with nav (Atomic Design level 3). Uses atoms/NavLink */
function getSiteHeaderOrganism(cookiesStrict) {
  const links = [
    '<mini-include src="atoms/NavLink" href="/" label="Home" />',
  ];
  if (cookiesStrict) {
    links.push('<mini-include src="atoms/NavLink" href="/cookies" label="Cookies" />');
    links.push('<mini-include src="atoms/NavLink" href="/privacidad" label="Privacy" />');
  }
  return `<nav class="site-nav" aria-label="Main">
  ${links.join('\n  ')}
</nav>`;
}

function getBaseTemplate(cookiesStrict, csp) {
  let head = `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/theme.css">`;
  if (csp) {
    head += `\n  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; img-src 'self' data:;">`;
  }
  const cookieBar = cookiesStrict ? '\n  <mini-include src="CookieConsentBar" />' : '';
  const consentScript = cookiesStrict ? '\n  <script src="/js/consent.js"></script>' : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head}
</head>
<body>
  <div class="lava-bg" aria-hidden="true">
    <span class="lava-blob lava-blob-1"></span>
    <span class="lava-blob lava-blob-2"></span>
    <span class="lava-blob lava-blob-3"></span>
  </div>${cookieBar}
  <mini-include src="organisms/SiteHeader" />
  <slot />${consentScript}
</body>
</html>
`;
}

function getIndexPage(cookiesStrict) {
  const policyLinks = cookiesStrict
    ? '\n  <footer class="landing-footer"><a href="/cookies">Cookie Policy</a> · <a href="/privacidad">Privacy</a></footer>'
    : '';
  return `---
layout: Base
title: Home
---
<main class="landing">
  <div class="landing-hero">
    <h1 class="landing-title">Hello humans</h1>
    <p class="landing-tagline">A minimal start. Edit <code>src/pages/index.html</code> and make it yours.</p>
    <p class="landing-repo"><a href="{{ site.site.repository }}">Repository</a></p>
  </div>
  <section class="landing-demo" aria-label="Card example">
    <h2 class="landing-demo-title">Card</h2>
    <p class="landing-demo-desc">Hover for a subtle lift. Styled in <code>theme.css</code>.</p>
    <div class="demo-card">
      <p class="demo-card-text">Hover or focus to see the effect.</p>
    </div>
    <p class="landing-consent-hint" id="consent-hint">Cookie choice: <strong id="consent-value">—</strong></p>
  </section>${policyLinks}
</main>
`;
}

function getCookieConsentBar() {
  return `<!-- Cookie consent modal. Logic in /js/consent.js (CSP-safe). Use body.dataset.consent or event "mini-astro-consent". -->
<div class="cookie-consent-overlay" id="cookie-consent" role="dialog" aria-modal="true" aria-label="Cookie consent" aria-live="polite" hidden>
  <div class="cookie-consent-card">
    <h2 class="cookie-consent-title">We value your privacy</h2>
    <p class="cookie-consent-text">We use essential cookies to run the site. Optional cookies help us improve experience. You choose.</p>
    <p class="cookie-consent-links"><a href="/cookies">Cookie Policy</a> · <a href="/privacidad">Privacy</a></p>
    <div class="cookie-consent-actions">
      <button type="button" id="cookie-decline" class="cookie-consent-decline">Decline optional</button>
      <button type="button" id="cookie-accept" class="cookie-consent-accept">Accept all</button>
    </div>
  </div>
</div>`;
}

function getConsentJs() {
  return `/* mini-astro consent: modal + body.dataset.consent + event. No inline script (CSP script-src 'self'). */
(function(){
  var key = 'mini-astro-consent';
  var body = document.body;
  var path = window.location.pathname || '';
  var isPolicyPage = /\\/(cookies|privacidad)(\\.html)?$/i.test(path) || path.endsWith('/cookies') || path.endsWith('/privacidad');

  function setConsent(value) {
    try { localStorage.setItem(key, value); } catch (e) {}
    body.dataset.consent = value;
    try { body.dispatchEvent(new CustomEvent('mini-astro-consent', { detail: { consent: value } })); } catch (e) {}
  }
  function updateHint() {
    var v = document.getElementById('consent-value');
    if (v) v.textContent = body.dataset.consent || 'not set';
  }

  var stored = localStorage.getItem(key);
  if (stored === 'accepted' || stored === 'declined') {
    body.dataset.consent = stored;
    updateHint();
    return;
  }

  if (isPolicyPage) {
    body.dataset.consent = 'pending';
    updateHint();
    var bar = document.createElement('div');
    bar.className = 'cookie-consent-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<span class="cookie-consent-bar-label">Cookie choice pending.</span> <button type="button" class="cookie-consent-decline">Decline optional</button> <button type="button" class="cookie-consent-accept">Accept all</button>';
    body.appendChild(bar);
    bar.querySelector('.cookie-consent-accept').onclick = function(){ setConsent('accepted'); bar.remove(); updateHint(); };
    bar.querySelector('.cookie-consent-decline').onclick = function(){ setConsent('declined'); bar.remove(); updateHint(); };
    return;
  }

  var overlay = document.getElementById('cookie-consent');
  if (!overlay) return;
  overlay.hidden = false;
  document.getElementById('cookie-accept').onclick = function(){
    setConsent('accepted');
    overlay.hidden = true;
    updateHint();
  };
  document.getElementById('cookie-decline').onclick = function(){
    setConsent('declined');
    overlay.hidden = true;
    updateHint();
  };
  body.addEventListener('mini-astro-consent', updateHint);
  updateHint();
})();
`;
}

function getThemeCss() {
  return `/* mini-astro default theme — landing, cookie modal, demo component */
:root {
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --bg: #0a0a0c;
  --bg-gradient: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.08), transparent),
    radial-gradient(ellipse 50% 30% at 20% 60%, rgba(250, 204, 21, 0.1), transparent);
  --surface: #141416;
  --surface-elevated: #1c1c1f;
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --accent: #22d3ee;
  --accent-hover: #67e8f9;
  --accent-soft: rgba(34, 211, 238, 0.2);
  --yellow: #eab308;
  --yellow-hover: #facc15;
  --yellow-soft: rgba(234, 179, 8, 0.2);
  --radius: 14px;
  --radius-lg: 20px;
  --space: 1.5rem;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  background-image: var(--bg-gradient);
  min-height: 100vh;
  position: relative;
}

/* Lava lamp — blobs drift across screen (left/right, up/down, organic paths) */
.lava-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.lava-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  will-change: transform;
}
.lava-blob-1 {
  width: min(75vmax, 420px);
  height: min(75vmax, 420px);
  background: radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, transparent 65%);
  top: 10%;
  left: 5%;
}
.lava-blob-2 {
  width: min(65vmax, 380px);
  height: min(65vmax, 380px);
  background: radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 65%);
  top: 50%;
  left: 60%;
}
.lava-blob-3 {
  width: min(55vmax, 340px);
  height: min(55vmax, 340px);
  background: radial-gradient(circle, rgba(250, 204, 21, 0.18) 0%, transparent 65%);
  top: 70%;
  left: 20%;
}
@media (prefers-reduced-motion: no-preference) {
  .lava-blob-1 {
    animation: lava-drift-1 28s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
  .lava-blob-2 {
    animation: lava-drift-2 32s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    animation-delay: -8s;
  }
  .lava-blob-3 {
    animation: lava-drift-3 26s cubic-bezier(0.35, 0.1, 0.65, 0.9) infinite;
    animation-delay: -16s;
  }
}
/* Blob 1: drifts right → up → left → down (winding) */
@keyframes lava-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  12% { transform: translate(25%, -5%) scale(1.08); }
  25% { transform: translate(35%, -18%) scale(0.95); }
  38% { transform: translate(15%, -25%) scale(1.12); }
  50% { transform: translate(-20%, -15%) scale(0.92); }
  62% { transform: translate(-30%, 5%) scale(1.05); }
  75% { transform: translate(-15%, 20%) scale(0.98); }
  88% { transform: translate(5%, 10%) scale(1.1); }
}
/* Blob 2: left → down → right → up */
@keyframes lava-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  15% { transform: translate(-22%, 8%) scale(1.06); }
  30% { transform: translate(-28%, 22%) scale(0.93); }
  45% { transform: translate(-10%, 28%) scale(1.1); }
  60% { transform: translate(18%, 12%) scale(0.96); }
  75% { transform: translate(28%, -12%) scale(1.04); }
  90% { transform: translate(12%, -18%) scale(0.99); }
}
/* Blob 3: up → right → down → left */
@keyframes lava-drift-3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  20% { transform: translate(calc(-50% - 8%), calc(-50% - 25%)) scale(1.12); }
  40% { transform: translate(calc(-50% + 20%), calc(-50% - 15%)) scale(0.94); }
  60% { transform: translate(calc(-50% + 28%), calc(-50% + 15%)) scale(1.08); }
  80% { transform: translate(calc(-50% - 5%), calc(-50% + 20%)) scale(0.97); }
}

/* Site nav — layout for all pages */
.site-nav {
  position: relative;
  z-index: 1;
  padding: var(--space) 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  background: rgba(10,10,12,0.85);
  backdrop-filter: blur(8px);
}
.site-nav a {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
}
.site-nav a:hover,
.site-nav .site-nav-link:hover { color: var(--accent); }
.site-nav a[href="/"],
.site-nav .site-nav-link[href="/"] { color: var(--text); }
.site-nav a[href="/"]:hover,
.site-nav .site-nav-link[href="/"]:hover { color: var(--accent); }
.site-nav .site-nav-link { text-decoration: none; }

/* Landing — entrance animation */
.landing {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space);
  text-align: center;
}
.landing-hero {
  max-width: 42ch;
  overflow: visible;
  padding-right: 0.2em;
}
.landing-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.5rem, 11vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: 0.02em;
  margin: 0 0 0.4em;
  padding: 0 0.15em 0 0;
  overflow: visible;
  color: var(--text);
  text-shadow:
    0 0 20px var(--accent-soft),
    0 0 40px rgba(34, 211, 238, 0.15),
    0 2px 0 rgba(0,0,0,0.2);
  animation: landing-title-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
  transform: translateY(0.5em);
}
@keyframes landing-title-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.landing-tagline {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin: 0;
  animation: landing-tagline-in 0.6s 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
  transform: translateY(0.3em);
}
@keyframes landing-tagline-in {
  to { opacity: 1; transform: translateY(0); }
}
.landing-tagline code {
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: var(--surface-elevated);
  border-radius: 8px;
  color: var(--accent);
  border: 1px solid var(--accent-soft);
  box-shadow: 0 0 0 1px var(--yellow-soft);
}
.landing-repo {
  margin-top: 1rem;
  font-size: 0.9375rem;
}
.landing-repo a {
  color: var(--text-muted);
  text-decoration: none;
}
.landing-repo a:hover { color: var(--accent); }

/* Demo section + example component (vanilla CSS animation) */
.landing-demo {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  max-width: 36rem;
}
.landing-demo-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  margin: 0 0 0.25em;
  color: var(--text);
}
.landing-demo-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}
.demo-card {
  display: block;
  padding: 1.5rem;
  background: var(--surface-elevated);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.demo-card:hover,
.demo-card:focus-within {
  transform: translateY(-4px);
  border-color: var(--accent-soft);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px var(--accent-soft), 0 0 24px var(--yellow-soft);
}
.demo-card-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.demo-card-heading {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.35em;
}
.demo-card-text {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0;
}
.demo-card-text code {
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  background: var(--surface);
  border-radius: 4px;
  color: var(--accent);
}
.landing-consent-hint {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}
.landing-consent-hint strong { color: var(--accent); }

.landing-footer {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.875rem;
}
.landing-footer a {
  color: var(--text-muted);
  text-decoration: none;
}
.landing-footer a:hover { color: var(--accent); }

/* Cookie consent — modal overlay + card, Accept / Decline */
.cookie-consent-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space);
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  animation: cookie-overlay-in 0.3s ease;
}
.cookie-consent-overlay[hidden] {
  display: none !important;
}
@keyframes cookie-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.cookie-consent-card {
  background: var(--surface-elevated);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  max-width: 24rem;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
  animation: cookie-card-in 0.35s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes cookie-card-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.cookie-consent-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5em;
}
.cookie-consent-text {
  margin: 0 0 0.5em;
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.5;
}
.cookie-consent-links {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
}
.cookie-consent-links a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cookie-consent-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}
.cookie-consent-decline {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 0.55em 1.2em;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.cookie-consent-decline:hover {
  border-color: var(--text-muted);
  color: var(--text);
}
.cookie-consent-accept {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 0.55em 1.3em;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.cookie-consent-accept:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
.cookie-consent-accept:focus,
.cookie-consent-decline:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Policy pages: non-blocking bar so user can read first, then choose */
.cookie-consent-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem var(--space);
  background: var(--surface-elevated);
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 0.9375rem;
}
.cookie-consent-bar-label {
  color: var(--text-muted);
  margin-right: 0.25rem;
}

/* Inner pages (policy, etc.) */
main:not(.landing) {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem var(--space);
  padding-bottom: 4rem;
}
main:not(.landing) h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  margin-top: 0;
}
main:not(.landing) a { color: var(--accent); }
`;
}

function getCookieConsentDoc() {
  return `# Cookie consent — use in your app

The cookie modal stores the user choice and exposes it so you can adapt your app. **Script runs from \`/js/consent.js\`** (no inline script), so it works with strict CSP (\`script-src 'self'\`).

---

## Static site vs server: why we use localStorage

mini-astro builds **static HTML**. There is no server at request time, so we cannot:

- Set **httpOnly** cookies from the server
- Run **middleware** on each request
- Read cookies in layout/markup before sending HTML

So the **consent choice** is stored **client-side** in \`localStorage\` and reflected in \`body.dataset.consent\`. Your CSS and JS can branch on that. This is the same approach used by many static sites and is appropriate for:

- **Preference cookies** (consent, theme, language): stored in the browser, read by your scripts.
- **No session/auth** in the static build: if you add a backend or API later, you can set **httpOnly** session cookies from the server and keep consent as a separate, client-held preference.

When you **do** have a server (e.g. Astro with SSR, or an API), you would:

- Keep **session/auth** in **httpOnly, secure, sameSite** cookies set by the server.
- Use **middleware** to protect routes and attach the user to the request.
- Leave **consent** as a client preference (localStorage or a non-httpOnly cookie) unless you need to enforce it server-side.

---

## 1. \`body.dataset.consent\`

After the user clicks **Accept all** or **Decline optional**:

- \`document.body.dataset.consent\` is \`"accepted"\` or \`"declined"\`
- Set on every page load from \`localStorage\` (so you can branch in CSS/JS immediately).

**Example — hide optional content when declined:**

\`\`\`html
<div class="analytics-script" data-consent-only="accepted">...</div>
\`\`\`

\`\`\`css
[data-consent-only="accepted"] { display: none; }
body[data-consent="accepted"] [data-consent-only="accepted"] { display: block; }
\`\`\`

## 2. Custom event \`mini-astro-consent\`

When the user makes a choice, the page dispatches:

\`\`\`js
document.body.addEventListener('mini-astro-consent', function (e) {
  if (e.detail.consent === 'accepted') {
    // load optional scripts, enable analytics, etc.
  } else {
    // only essential behavior
  }
});
\`\`\`

## 3. localStorage

- Key: \`mini-astro-consent\`
- Value: \`"accepted"\` or \`"declined"\`

Use for cross-tab or persistence. Prefer \`body.dataset.consent\` and the event in the browser.
`;
}

function getCookiesPage() {
  return `---
layout: Base
title: Cookie Policy
---
<main>
  <h1>Cookie Policy</h1>
  <p>This site uses only essential cookies. Edit this page at <code>src/pages/cookies.html</code>.</p>
</main>
`;
}

function getPrivacidadPage() {
  return `---
layout: Base
title: Privacidad
---
<main>
  <h1>Privacidad</h1>
  <p>Describe tu política de privacidad aquí. Edit <code>src/pages/privacidad.html</code>.</p>
</main>
`;
}
