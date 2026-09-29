import readline from 'node:readline';

/**
 * One shared line reader for every prompt. Creating an interface per question
 * loses input when stdin is piped (the first interface buffers all lines), so
 * answers are queued here and handed out in order. Once stdin ends, every
 * remaining question gets its default.
 */
let rl = null;
const lines = [];
const waiters = [];
let closed = false;

function reader() {
  if (!rl) {
    closed = false;
    rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    rl.on('line', (line) => {
      const waiter = waiters.shift();
      if (waiter) waiter(line);
      else lines.push(line);
    });
    rl.on('close', () => {
      closed = true;
      while (waiters.length) waiters.shift()(null);
    });
  }
  return rl;
}

/** @returns {Promise<string | null>} next line, or null once stdin has ended */
function nextLine() {
  reader();
  if (lines.length) return Promise.resolve(lines.shift());
  if (closed) return Promise.resolve(null);
  return new Promise((resolve) => waiters.push(resolve));
}

/**
 * Ask a single question. Resolves with the trimmed answer or the default.
 * @param {string} question
 * @param {string} [defaultVal]
 * @returns {Promise<string>}
 */
export async function ask(question, defaultVal = '') {
  const def = defaultVal !== '' && defaultVal !== undefined ? ` [${defaultVal}]` : '';
  reader();
  process.stdout.write(`${question}${def}: `);
  const answer = await nextLine();
  if (answer === null || !process.stdin.isTTY) process.stdout.write('\n');
  return (answer ?? '').trim() || (defaultVal ?? '');
}

/**
 * Ask and return a value from a list. Default is first option.
 * @param {string} question
 * @param {string[]} options
 * @param {string} [defaultVal] - default if user presses Enter
 * @returns {Promise<string>}
 */
export async function choose(question, options, defaultVal) {
  const def = defaultVal ?? options[0];
  const a = await ask(`${question} (${options.join(' / ')})`, def);
  const lower = a.toLowerCase();
  return options.find((o) => o.toLowerCase() === lower || o.toLowerCase().startsWith(lower)) ?? def;
}

/** Release stdin so the process can exit. Safe to call when no prompt was used. */
export function closePrompts() {
  rl?.close();
  rl = null;
  lines.length = 0;
}
