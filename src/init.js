import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import { runCreate } from './commands/create.js';

/**
 * Interactive init: prompt for name, cookies, policies, CSP, then scaffold
 * @param {string} cwd - current working dir (parent of new project)
 * @param {string} [projectName] - optional name (skip prompt)
 */
export async function runInit(cwd, projectName) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q, defaultVal = '') =>
    new Promise((res) => {
      const def = defaultVal ? ` (${defaultVal})` : '';
      rl.question(`${q}${def}: `, (a) => res(a.trim() || defaultVal));
    });

  const name = projectName || (await ask('Project name', 'my-site'));
  const cookiesStrict = (await ask('Strict cookie consent banner? [Y/n]', 'Y')).toLowerCase() !== 'n';
  const policyPages = (await ask('Generate Cookies and Privacy pages? [Y/n]', 'Y')).toLowerCase() !== 'n';
  const csp = (await ask('Inject strict CSP by default? [Y/n]', 'Y')).toLowerCase() !== 'n';

  rl.close();

  const opts = {
    cookiesStrict,
    policyPages,
    csp,
  };

  const projectDir = path.resolve(cwd, name);
  await runCreate(projectDir, name, opts);
  console.log(`\nDone. Run:\n  cd ${name}\n  npx mini-astro dev`);
}
