import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../loadConfig.js';

const LAYERS = ['atoms', 'molecules', 'organisms'];

/**
 * Add a new component
 * @param {string} cwd
 * @param {string} [name]
 * @param {string} [layer] - atoms | molecules | organisms
 */
export async function runComponent(cwd, name, layer = 'molecules') {
  if (!name) throw new Error('Usage: mini-astro component <name> [atoms|molecules|organisms]');

  const l = layer.toLowerCase();
  if (!LAYERS.includes(l)) {
    throw new Error(`Layer must be one of: ${LAYERS.join(', ')}`);
  }

  const config = await loadConfig(cwd);
  const srcDir = path.resolve(cwd, config.srcDir);
  const compDir = path.join(srcDir, l);
  const fileName = name.endsWith('.html') ? name : `${name}.html`;
  const filePath = path.join(compDir, fileName);

  if (fs.existsSync(filePath)) {
    throw new Error(`Component already exists: ${filePath}`);
  }

  const tagName = name.replace(/\.html$/, '').replace(/-/g, '');
  const content = `<div class="${tagName.toLowerCase()}">
  <!-- ${l}/${fileName} -->
</div>
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
}
