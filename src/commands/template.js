import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../loadConfig.js';

/**
 * Add a new template (Atomic Design: templates level)
 * @param {string} cwd
 * @param {string} [name]
 */
export async function runTemplate(cwd, name) {
  if (!name) throw new Error('Usage: mini-astro template <name>');

  const config = await loadConfig(cwd);
  const srcDir = path.resolve(cwd, config.srcDir);
  const templatesDir = path.join(srcDir, 'templates');
  const fileName = name.endsWith('.html') ? name : `${name}.html`;
  const filePath = path.join(templatesDir, fileName);

  if (!fs.existsSync(templatesDir)) {
    throw new Error(`Templates directory not found: ${templatesDir}. Run this inside a mini-astro project.`);
  }

  if (fs.existsSync(filePath)) {
    throw new Error(`Template already exists: ${filePath}`);
  }

  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
  <link rel="stylesheet" href="/css/theme.css">
</head>
<body>
  <slot />
</body>
</html>
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
}
