const KEY_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Parse frontmatter from HTML: ---\nkey: value\n---\n<body>
 *
 * The block must open on the first non-blank line and close with a line that is
 * exactly `---`, so a `---` inside a value does not end it. Values are strings;
 * a value wrapped in matching quotes has them removed. Blank lines and lines
 * starting with `#` are ignored.
 *
 * @param {string} raw
 * @returns {{ frontmatter: Record<string, string>, body: string }}
 */
export function parseFrontmatter(raw) {
  const lines = raw.replace(/^﻿/, '').split(/\r?\n/);

  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;
  if (lines[start]?.trim() !== '---') {
    return { frontmatter: {}, body: raw };
  }

  let end = start + 1;
  while (end < lines.length && lines[end].trim() !== '---') end++;
  if (end >= lines.length) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter = {};
  for (const line of lines.slice(start + 1, end)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    if (!KEY_REGEX.test(key)) continue;
    frontmatter[key] = unquote(trimmed.slice(colon + 1).trim());
  }

  let bodyStart = end + 1;
  while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart++;
  return { frontmatter, body: lines.slice(bodyStart).join('\n') };
}

/** @param {string} value */
function unquote(value) {
  const first = value[0];
  if (value.length >= 2 && (first === '"' || first === "'") && value.at(-1) === first) {
    return value.slice(1, -1);
  }
  return value;
}
