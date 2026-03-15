#!/usr/bin/env node

import path from 'node:path';
import { parseArgs } from 'node:util';
import { runInit } from './src/init.js';
import { runBuild } from './src/build.js';
import { runDev } from './src/dev-server.js';
import { runRoute } from './src/commands/route.js';
import { runComponent } from './src/commands/component.js';
import { runCreate } from './src/commands/create.js';

const { values, positionals } = parseArgs({
  options: {
    cwd: { type: 'string', short: 'C' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
});

const [cmd, ...rest] = positionals || [];

async function main() {
  if (values.help || !cmd) {
    console.log(`
mini-astro - Static site framework (security-first, Atomic Design)

Usage:
  mini-astro init              Create a new project (interactive)
  mini-astro create [name]     Create project with optional name
  mini-astro build             Build static site
  mini-astro dev               Start dev server with live reload
  mini-astro route <name>      Add a new page
  mini-astro component <name> [atoms|molecules|organisms]  Add component
  mini-astro new [name]         Alias for create

Options:
  -C, --cwd <dir>   Run in directory
  -h, --help        Show this help
`);
    process.exit(cmd ? 0 : 1);
  }

  const cwd = values.cwd ? path.resolve(process.cwd(), values.cwd) : process.cwd();

  try {
    switch (cmd) {
      case 'init':
      case 'create':
        if (cmd === 'init' || rest.length === 0) {
          await runInit(cwd, rest[0]);
        } else {
          await runCreate(path.join(cwd, rest[0]), rest[0]);
        }
        break;
      case 'new':
        await runCreate(path.join(cwd, rest[0] || 'my-site'), rest[0] || 'my-site');
        break;
      case 'build':
        await runBuild(cwd);
        break;
      case 'dev':
        await runDev(cwd);
        break;
      case 'route':
      case 'add':
        if (cmd === 'add' && rest[0] === 'page') rest.shift();
        await runRoute(cwd, rest[0]);
        break;
      case 'component':
        await runComponent(cwd, rest[0], rest[1]);
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
