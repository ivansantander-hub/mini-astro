import { choose } from '../prompt.js';
import { runComponent } from './component.js';
import { runTemplate } from './template.js';
import { runRoute } from './route.js';

const TYPES = ['atom', 'molecule', 'organism', 'template', 'page'];

/**
 * Interactive: ask what to create (atom/molecule/organism/template/page) then delegate
 * @param {string} cwd
 * @param {string[]} rest - optional pre-filled args (e.g. from CLI)
 */
export async function runAdd(cwd, rest = []) {
  if (!process.stdin.isTTY) {
    throw new Error('Usage: mini-astro add (interactive). Or use: mini-astro component <name> [layer], template <name>, route <name>');
  }

  const type = rest[0] && TYPES.includes(rest[0].toLowerCase())
    ? rest[0].toLowerCase()
    : await choose('What to create?', TYPES, 'page');

  switch (type) {
    case 'atom':
    case 'molecule':
    case 'organism':
      await runComponent(cwd, undefined, type);
      break;
    case 'template':
      await runTemplate(cwd, undefined);
      break;
    case 'page':
      await runRoute(cwd, undefined);
      break;
    default:
      throw new Error(`Unknown type: ${type}. Use: ${TYPES.join(', ')}`);
  }
}
