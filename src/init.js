import path from 'node:path';
import { runCreate } from './commands/create.js';
import { ask } from './prompt.js';

/**
 * Interactive init: prompt for name, cookies, policies, CSP, then scaffold
 * @param {string} cwd - current working dir (parent of new project)
 * @param {string} [projectName] - optional name (skip prompt)
 */
export async function runInit(cwd, projectName) {
  const name = projectName || (await ask('Project name', 'my-site'));
  const cookiesStrict = (await ask('Strict cookie consent banner? (y/n)', 'Y')).toLowerCase() !== 'n';
  const policyPages = (await ask('Generate Cookies and Privacy pages? (y/n)', 'Y')).toLowerCase() !== 'n';
  const csp = (await ask('Inject strict CSP by default? (y/n)', 'Y')).toLowerCase() !== 'n';
  const portAnswer = (await ask('Dev server port', '2323')).trim();
  const devPort = portAnswer ? Number(portAnswer) || 2323 : 2323;
  const pmAnswer = (await ask('Package manager: pnpm / yarn / npm', 'pnpm')).trim().toLowerCase();
  const packageManager = ['pnpm', 'yarn', 'npm'].includes(pmAnswer) ? pmAnswer : 'pnpm';

  const opts = {
    cookiesStrict,
    policyPages,
    csp,
    packageManager,
    devPort,
  };

  const projectDir = path.resolve(cwd, name);
  await runCreate(projectDir, name, opts);
}
