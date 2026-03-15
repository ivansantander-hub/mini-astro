import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, '../../templates');

/**
 * Create a new project (scaffold)
 * @param {string} projectDir - absolute path where to create
 * @param {string} [projectName] - name for package.json
 * @param {{ cookiesStrict?: boolean, policyPages?: boolean, csp?: boolean }} [opts]
 */
export async function runCreate(projectDir, projectName, opts = {}) {
  const name = projectName || path.basename(projectDir);
  const cookiesStrict = opts.cookiesStrict !== false;
  const policyPages = opts.policyPages !== false;
  const csp = opts.csp !== false;

  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory already exists: ${projectDir}`);
  }

  const dirs = [
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

  // Base template
  const baseTemplate = getBaseTemplate(cookiesStrict, csp);
  fs.writeFileSync(path.join(projectDir, 'src', 'templates', 'Base.html'), baseTemplate, 'utf8');

  // index page
  const indexPage = getIndexPage(cookiesStrict);
  fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'index.html'), indexPage, 'utf8');

  // CookieConsentBar molecule
  if (cookiesStrict) {
    fs.writeFileSync(
      path.join(projectDir, 'src', 'molecules', 'CookieConsentBar.html'),
      getCookieConsentBar(),
      'utf8'
    );
  }

  if (policyPages) {
    fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'cookies.html'), getCookiesPage(), 'utf8');
    fs.writeFileSync(path.join(projectDir, 'src', 'pages', 'privacidad.html'), getPrivacidadPage(), 'utf8');
  }

  fs.writeFileSync(path.join(projectDir, 'src', 'data', 'site.json'), '{\n  "title": "' + name + '"\n}\n', 'utf8');

  const config = `export default {
  srcDir: 'src',
  outDir: 'dist',
  dataDir: 'src/data',
  atomicDesign: true,
  cookies: { strict: ${cookiesStrict} },
  security: { csp: ${csp}, policyPages: ${policyPages} },
};
`;
  fs.writeFileSync(path.join(projectDir, 'mini-astro.config.js'), config, 'utf8');

  const pkg = {
    name: name.replace(/\s+/g, '-').toLowerCase(),
    version: '0.0.1',
    private: true,
    scripts: {
      build: 'mini-astro build',
      dev: 'mini-astro dev',
    },
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
}

function getBaseTemplate(cookiesStrict, csp) {
  let head = `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>`;
  if (csp) {
    head += `\n  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">`;
  }
  const cookieBar = cookiesStrict ? '\n  <mini-include src="CookieConsentBar" />' : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head}
</head>
<body>${cookieBar}
  <slot />
</body>
</html>
`;
}

function getIndexPage(cookiesStrict) {
  return `---
layout: Base
title: Home
---
<main>
  <h1>Welcome</h1>
  <p>Edit <code>src/pages/index.html</code>.</p>
  ${cookiesStrict ? '<p><a href="/cookies.html">Cookies</a> · <a href="/privacidad.html">Privacidad</a></p>' : ''}
</main>
`;
}

function getCookieConsentBar() {
  return `<div class="cookie-consent" id="cookie-consent" role="dialog" aria-label="Cookie consent" hidden>
  <p>We use essential cookies only. By continuing you accept our <a href="/cookies.html">Cookie Policy</a> and <a href="/privacidad.html">Privacy</a>.</p>
  <button type="button" id="cookie-accept">Accept</button>
</div>
<script>
(function(){
  var key = 'mini-astro-consent';
  if (localStorage.getItem(key)) { return; }
  var bar = document.getElementById('cookie-consent');
  if (!bar) return;
  bar.hidden = false;
  document.getElementById('cookie-accept').onclick = function(){
    localStorage.setItem(key, 'true');
    bar.hidden = true;
  };
})();
</script>`;
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
