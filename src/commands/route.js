import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../loadConfig.js';
import { ask } from '../prompt.js';

/**
 * Add a new page (Atomic Design: pages)
 * @param {string} cwd
 * @param {string} [name] - e.g. "about" or "blog/post"
 * @param {{ layout?: string }} [opts] - optional layout (default Base)
 */
export async function runRoute(cwd, name, opts = {}) {
  if (process.stdin.isTTY && !name) {
    name = await ask('Page route (e.g. about or blog/post)', '');
    if (!name) throw new Error('Route is required.');
    if (!opts.layout) {
      opts.layout = await ask('Layout', 'Base') || 'Base';
    }
  } else if (!name) {
    throw new Error('Usage: mini-astro route <name>');
  }

  const layout = opts.layout || 'Base';
  const config = await loadConfig(cwd);
  const pagesDir = path.resolve(cwd, config.srcDir, 'pages');
  const slug = name.replace(/^\//, '').replace(/\/$/, '');
  const filePath = path.join(pagesDir, slug.endsWith('.html') ? slug : `${slug}.html`);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (fs.existsSync(filePath)) {
    throw new Error(`Page already exists: ${filePath}`);
  }

  const title = path.basename(slug, '.html').replace(/-/g, ' ');
  const content = `---
layout: ${layout}
title: ${title}
---
<main>
  <h1>${title}</h1>
  <p>Content for ${slug}.</p>
</main>
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
}
