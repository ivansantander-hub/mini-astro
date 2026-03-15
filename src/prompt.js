import readline from 'node:readline';

/**
 * Ask a single question (interactive). Resolves with trimmed answer or default.
 * @param {string} question
 * @param {string} [defaultVal]
 * @returns {Promise<string>}
 */
export function ask(question, defaultVal = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const def = defaultVal !== '' && defaultVal !== undefined ? ` [${defaultVal}]` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${def}: `, (answer) => {
      rl.close();
      resolve((answer && answer.trim()) || (defaultVal ?? ''));
    });
  });
}

/**
 * Ask and return a value from a list. Default is first option.
 * @param {string} question
 * @param {string[]} options
 * @param {string} [defaultVal] - default if user presses Enter
 * @returns {Promise<string>}
 */
export function choose(question, options, defaultVal) {
  const def = defaultVal ?? options[0];
  const opts = options.join(' / ');
  return ask(`${question} (${opts})`, def).then((a) => {
    const lower = a.toLowerCase();
    const match = options.find((o) => o.toLowerCase() === lower || o.toLowerCase().startsWith(lower));
    return match ?? def;
  });
}
