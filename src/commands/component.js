import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../loadConfig.js';
import { ask, choose } from '../prompt.js';

const LAYERS = ['atoms', 'molecules', 'organisms'];
const LAYER_ALIASES = { atom: 'atoms', atoms: 'atoms', molecule: 'molecules', molecules: 'molecules', organism: 'organisms', organisms: 'organisms' };

/**
 * Add a new component (Atomic Design: atoms | molecules | organisms)
 * @param {string} cwd
 * @param {string} [name]
 * @param {string} [layer] - atom | atoms | molecule | molecules | organism | organisms
 */
export async function runComponent(cwd, name, layer = 'molecules') {
  if (process.stdin.isTTY && !name) {
    name = await ask('Component name (PascalCase)', '');
    if (!name) throw new Error('Name is required.');
    if (!layer || !LAYERS.includes(LAYER_ALIASES[layer?.toLowerCase()] || layer?.toLowerCase())) {
      layer = await choose('Layer', ['atom', 'molecule', 'organism'], 'molecule');
    }
  } else if (!name) {
    throw new Error('Usage: mini-astro component <name> [atom|molecule|organism]');
  }

  const key = (layer || 'molecule').toLowerCase();
  const l = LAYER_ALIASES[key] || key;
  if (!LAYERS.includes(l)) {
    throw new Error(`Layer must be one of: atom, molecule, organism (or atoms, molecules, organisms)`);
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
