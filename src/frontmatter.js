/**
 * Parse frontmatter from HTML: ---\nkey: value\n---\n<body>
 * @param {string} raw
 * @returns {{ frontmatter: Record<string, string>, body: string }}
 */
export function parseFrontmatter(raw) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: raw };
  }

  const end = trimmed.indexOf('---', 3);
  if (end === -1) return { frontmatter: {}, body: raw };

  const fmStr = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 3).trimStart();

  const frontmatter = {};
  for (const line of fmStr.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}
