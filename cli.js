#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { runInit } from './src/init.js';
import { runBuild } from './src/build.js';
import { runDev } from './src/dev-server.js';
import { runRoute } from './src/commands/route.js';
import { runComponent } from './src/commands/component.js';
import { runTemplate } from './src/commands/template.js';
import { runAdd } from './src/commands/add.js';
import { runCreate } from './src/commands/create.js';
import { MAIN_HELP, COMMAND_HELP } from './src/help.js';
import { runCompletion } from './src/completion.js';

const { values, positionals } = parseArgs({
  options: {
    cwd: { type: 'string', short: 'C' },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
});

const [cmd, ...rest] = positionals || [];

function showHelp(subcommand) {
  if (subcommand && COMMAND_HELP[subcommand]) {
    console.log(COMMAND_HELP[subcommand]);
    return;
  }
  console.log(MAIN_HELP);
}

async function main() {
  const wantHelp = values.help || rest.includes('--help') || rest.includes('-h');
  const helpTarget = rest.find((x) => x !== '--help' && x !== '-h');

  if (cmd === 'help') {
    showHelp(helpTarget || rest[0]);
    process.exit(0);
  }

  if (wantHelp || !cmd) {
    showHelp(wantHelp ? cmd : null);
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === 'completion') {
    const shell = rest[0] || 'bash';
    process.stdout.write(runCompletion(shell));
    process.exit(0);
  }

  if (cmd === 'quarks') {
    const cwd = values.cwd ? path.resolve(process.cwd(), values.cwd) : process.cwd();
    const { loadConfig } = await import('./src/loadConfig.js');
    const config = await loadConfig(cwd);
    const quarksDir = path.resolve(cwd, config.srcDir || 'src', 'quarks');
    if (fs.existsSync(quarksDir)) {
      console.log('Quarks (design tokens):', quarksDir);
      try {
        const files = fs.readdirSync(quarksDir);
        files.forEach((f) => console.log('  ', f));
      } catch {
        console.log('  (empty)');
      }
    } else {
      console.log('No quarks directory. Run mini-astro create first or add src/quarks/ manually.');
    }
    process.exit(0);
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
      case 'page':
      case 'add':
        if (cmd === 'add' && rest[0] === 'page') rest.shift();
        await runRoute(cwd, rest[0]);
        break;
      case 'component':
        await runComponent(cwd, rest[0], rest[1]);
        break;
      case 'template':
        await runTemplate(cwd, rest[0]);
        break;
      case 'add':
        await runAdd(cwd, rest);
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        console.log('Run mini-astro help for usage.');
        process.exit(1);
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
