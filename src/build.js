import path from 'node:path';
import fs from 'node:fs';
import { loadConfig, DEFAULT_CSP } from './loadConfig.js';
import { loadData } from './data.js';
import { parseFrontmatter } from './frontmatter.js';
import { render, replaceSlot } from './resolve.js';

const STATE_DIR = '.mini-astro';
const MANIFEST = 'manifest.json';
const CSP_META_REGEX = /<meta\s[^>]*http-equiv\s*=\s*["']?content-security-policy/i;

/**
 * Build static site
 * @param {string} cwd - project root
 * @param {{ quiet?: boolean }} [opts]
 * @returns {Promise<{ pages: string[], removed: string[] }>} output paths relative to outDir
 */
export async function runBuild(cwd, opts = {}) {
  const config = await loadConfig(cwd);
  const srcDir = path.resolve(cwd, config.srcDir);
  const outDir = path.resolve(cwd, config.outDir);
  const dataDir = path.resolve(cwd, config.dataDir);

  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source directory not found: ${srcDir}`);
  }
  const pagesDir = path.join(srcDir, 'pages');
  if (!fs.existsSync(pagesDir)) {
    throw new Error(`pages directory not found: ${pagesDir}`);
  }

  const site = await loadData(dataDir);
  const templatesDir = path.join(srcDir, 'templates');
  const templates = new Map();
  /** @type {Set<string>} every file this build wrote, relative to outDir */
  const written = new Set();

  fs.mkdirSync(outDir, { recursive: true });

  const publicDir = path.join(cwd, 'public');
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, outDir, '', written);
  }

  const routes = new Map();
  const pages = [];
  for (const relPath of collectPages(pagesDir, '')) {
    const outRel = outputPathFor(relPath);
    if (routes.has(outRel)) {
      throw new Error(`Route collision: pages/${routes.get(outRel)} and pages/${relPath} both build to ${outRel}`);
    }
    routes.set(outRel, relPath);

    const pagePath = path.join(pagesDir, relPath);
    const { frontmatter, body } = parseFrontmatter(fs.readFileSync(pagePath, 'utf8'));

    const layout = frontmatter.layout || 'Base';
    const template = loadTemplate(templatesDir, layout, templates);
    if (!template && frontmatter.layout) {
      throw new Error(`Layout "${layout}" not found for pages/${relPath} (expected ${path.join(templatesDir, `${layout}.html`)})`);
    }

    const context = { ...template?.frontmatter, ...frontmatter, site };
    let html = render(body, context, { srcDir, fromFile: pagePath });
    if (template) {
      const shell = render(template.body, context, { srcDir, fromFile: template.path });
      html = replaceSlot(shell, html, `${layout}.html`);
    }
    html = applyCsp(html, config.security.csp);

    const outPath = path.join(outDir, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    written.add(outRel);
    pages.push(outRel);
  }

  const removed = removeStaleOutput(cwd, outDir, written);

  if (!opts.quiet) {
    const outRelative = path.relative(process.cwd(), outDir).replace(/\\/g, '/') || '.';
    const pruned = removed.length ? ` \x1b[90m(${removed.length} stale file(s) removed)\x1b[0m` : '';
    console.log(`  \x1b[90m${pages.length} page(s)\x1b[0m → \x1b[36m${outRelative}\x1b[0m${pruned}`);
  }
  return { pages, removed };
}

/**
 * Clean URLs: pages/index.html → index.html, pages/about.html → about/index.html,
 * pages/blog/index.html → blog/index.html (not blog/index/index.html).
 * @param {string} relPath - path under pages/, with forward slashes
 */
export function outputPathFor(relPath) {
  if (relPath === 'index.html' || relPath.endsWith('/index.html')) return relPath;
  return relPath.replace(/\.html$/i, '') + '/index.html';
}

/**
 * @param {string} templatesDir
 * @param {string} layout
 * @param {Map<string, { path: string, frontmatter: Record<string, string>, body: string } | null>} cache
 */
function loadTemplate(templatesDir, layout, cache) {
  if (!cache.has(layout)) {
    const templatePath = path.join(templatesDir, `${layout}.html`);
    if (fs.existsSync(templatePath)) {
      const { frontmatter, body } = parseFrontmatter(fs.readFileSync(templatePath, 'utf8'));
      cache.set(layout, { path: templatePath, frontmatter, body });
    } else {
      cache.set(layout, null);
    }
  }
  return cache.get(layout);
}

/**
 * Add a CSP <meta> to full documents that do not declare one already.
 * @param {string} html
 * @param {boolean | string} csp - false: off; true: DEFAULT_CSP; string: that policy
 */
function applyCsp(html, csp) {
  if (csp === false || CSP_META_REGEX.test(html)) return html;
  const policy = csp === true ? DEFAULT_CSP : csp;
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy.replace(/"/g, '&quot;')}">`;
  const charset = html.match(/<meta\s+charset=[^>]*>/i);
  if (charset) return html.replace(charset[0], () => `${charset[0]}\n  ${meta}`);
  const head = html.match(/<head(\s[^>]*)?>/i);
  if (head) return html.replace(head[0], () => `${head[0]}\n  ${meta}`);
  return html;
}

/**
 * Delete files that a previous build wrote and this one did not (renamed or
 * removed pages, deleted public files). Only files listed in the previous
 * manifest are touched, so anything else in outDir is left alone.
 * @param {string} cwd
 * @param {string} outDir
 * @param {Set<string>} written
 * @returns {string[]} removed paths, relative to outDir
 */
function removeStaleOutput(cwd, outDir, written) {
  const stateDir = path.join(cwd, STATE_DIR);
  const manifestPath = path.join(stateDir, MANIFEST);
  const outKey = path.relative(cwd, outDir).replace(/\\/g, '/');
  const removed = [];

  let previous = null;
  if (fs.existsSync(manifestPath)) {
    try {
      previous = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      previous = null;
    }
  }

  if (previous?.outDir === outKey && Array.isArray(previous.files)) {
    for (const rel of previous.files) {
      if (written.has(rel)) continue;
      const full = path.resolve(outDir, rel);
      if (!full.startsWith(outDir + path.sep)) continue;
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        fs.unlinkSync(full);
        removed.push(rel);
        removeEmptyDirs(path.dirname(full), outDir);
      }
    }
  }

  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify({ outDir: outKey, files: [...written].sort() }, null, 2), 'utf8');
  return removed;
}

/** Remove dir and its empty parents, stopping at (and keeping) root. */
function removeEmptyDirs(dir, root) {
  while (dir.startsWith(root + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
    dir = path.dirname(dir);
  }
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {string} prefix - path relative to the public root
 * @param {Set<string>} written
 */
function copyDir(src, dest, prefix, written) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d, rel, written);
    } else {
      fs.copyFileSync(s, d);
      written.add(rel);
    }
  }
}

/** @returns {string[]} page paths relative to pagesDir, with forward slashes */
function collectPages(dir, prefix) {
  const result = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      result.push(...collectPages(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.html')) {
      result.push(rel);
    }
  }
  return result.sort();
}
