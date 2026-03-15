import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from './loadConfig.js';
import { loadData } from './data.js';
import { parseFrontmatter } from './frontmatter.js';
import { replaceSlot, replaceVars, resolveIncludes } from './resolve.js';

/**
 * Build static site
 * @param {string} cwd - project root
 */
export async function runBuild(cwd) {
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

  const siteData = loadData(dataDir);
  const contextBase = { site: siteData };

  // Ensure out dir
  fs.mkdirSync(outDir, { recursive: true });

  // Copy public
  const publicDir = path.join(cwd, 'public');
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, outDir);
  }

  // Collect all page files
  const pageFiles = collectPages(pagesDir, '');

  const templatesDir = path.join(srcDir, 'templates');

  for (const relPath of pageFiles) {
    const pagePath = path.join(pagesDir, relPath);
    let raw = fs.readFileSync(pagePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(raw);

    let html = body;
    const layout = frontmatter.layout || 'Base';
    const templatePath = path.join(templatesDir, `${layout}.html`);

    if (fs.existsSync(templatePath)) {
      let templateHtml = fs.readFileSync(templatePath, 'utf8');
      const pageContext = { ...frontmatter, ...contextBase };
      templateHtml = replaceVars(templateHtml, pageContext);
      html = replaceSlot(templateHtml, html);
    }

    html = resolveIncludes(html, cwd);
    const pageContext = { ...frontmatter, ...contextBase };
    html = replaceVars(html, pageContext);

    const outPath = path.join(outDir, relPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
  }

  console.log(`Built ${pageFiles.length} page(s) to ${outDir}`);
}

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function collectPages(dir, prefix) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      result.push(...collectPages(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.html')) {
      result.push(rel);
    }
  }
  return result;
}
