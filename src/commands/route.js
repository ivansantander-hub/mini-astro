import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../loadConfig.js';

/**
 * Add a new page
 * @param {string} cwd
 * @param {string} [name] - e.g. "about" or "blog/post"
 */
export async function runRoute(cwd, name) {
  if (!name) throw new Error('Usage: mini-astro route <name>');

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
layout: Base
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
