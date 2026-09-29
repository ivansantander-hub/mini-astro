import path from 'node:path';
import fs from 'node:fs';

const SLOT_REGEX = /<slot\s*\/>|<!--\s*@slot\s*-->/i;
const LAYERS = ['atoms', 'molecules', 'organisms'];
const MAX_DEPTH = 20;

/**
 * One pass over: {{{ raw }}} | {{ escaped }} | <mini-include … /> | <mini-include …></mini-include>
 * Attribute values may contain `>` inside quotes.
 */
const TOKEN_REGEX =
  /\{\{\{\s*([\w.-]+)\s*\}\}\}|\{\{\s*([\w.-]+)\s*\}\}|<mini-include\b((?:[^>"']|"[^"]*"|'[^']*')*?)\s*(?:\/>|>\s*<\/mini-include\s*>)/gi;
const ATTR_REGEX = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const INLINE_VAR_REGEX = /\{\{\{?\s*([\w.-]+)\s*\}?\}\}/g;

/** @param {string} value */
export function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param {Record<string, unknown>} context
 * @param {string} key - e.g. "title" or "site.meta.name"
 */
function lookup(context, key) {
  let v = context;
  for (const part of key.split('.')) {
    v = v != null && typeof v === 'object' ? v[part] : undefined;
  }
  return v;
}

/** @param {unknown} v */
function toText(v) {
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Parse `key="value"` attributes of a <mini-include>. Values may reference the
 * parent context with {{ var }}; they are interpolated as plain text (the
 * component escapes them when it outputs them with {{ }}).
 * @param {string} attrsStr
 * @param {Record<string, unknown>} context
 */
function parseAttrs(attrsStr, context) {
  /** @type {Record<string, string>} */
  const props = {};
  for (const m of attrsStr.matchAll(ATTR_REGEX)) {
    const raw = m[2] ?? m[3] ?? '';
    props[m[1]] = raw.replace(INLINE_VAR_REGEX, (_, key) => toText(lookup(context, key)));
  }
  return props;
}

/**
 * Find a component file.
 * - "./X" or "../atoms/X": relative to the file that includes it
 * - "atoms/X": relative to srcDir
 * - "X": searched in atoms, molecules, organisms (in that order)
 * @param {string} src
 * @param {string} srcDir - absolute
 * @param {string} fromFile - absolute path of the including file
 * @returns {{ found: string | null, tried: string[] }}
 */
function findComponentPath(src, srcDir, fromFile) {
  const name = src.endsWith('.html') ? src : `${src}.html`;
  let candidates;
  if (src.startsWith('./') || src.startsWith('../')) {
    candidates = [path.resolve(path.dirname(fromFile), name)];
  } else if (src.includes('/')) {
    candidates = [path.join(srcDir, name)];
  } else {
    candidates = LAYERS.map((layer) => path.join(srcDir, layer, name));
  }
  const found = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
  return { found, tried: candidates };
}

/**
 * Render {{ }}, {{{ }}} and <mini-include> in a single pass. Output is never
 * scanned again, so values that contain `{{ … }}` are not evaluated.
 * @param {string} html
 * @param {Record<string, unknown>} context
 * @param {{ srcDir: string, fromFile: string, stack?: string[] }} opts
 * @returns {string}
 */
export function render(html, context, opts) {
  const stack = opts.stack ?? [opts.fromFile];

  return html.replace(TOKEN_REGEX, (full, rawKey, key, attrsStr) => {
    if (rawKey) return toText(lookup(context, rawKey));
    if (key) return escapeHtml(toText(lookup(context, key)));

    const where = path.relative(opts.srcDir, opts.fromFile) || opts.fromFile;
    const { src, ...props } = parseAttrs(attrsStr, context);
    if (!src) {
      throw new Error(`<mini-include> without src in ${where}: ${full}`);
    }

    const { found, tried } = findComponentPath(src, opts.srcDir, opts.fromFile);
    if (!found) {
      const list = tried.map((t) => path.relative(opts.srcDir, t)).join(', ');
      throw new Error(`Component "${src}" not found (included from ${where}). Looked in: ${list}`);
    }
    if (stack.includes(found)) {
      const chain = [...stack, found].map((f) => path.relative(opts.srcDir, f)).join(' → ');
      throw new Error(`Circular <mini-include>: ${chain}`);
    }
    if (stack.length > MAX_DEPTH) {
      throw new Error(`<mini-include> nested more than ${MAX_DEPTH} levels (in ${where})`);
    }

    const compHtml = fs.readFileSync(found, 'utf8');
    return render(compHtml, { ...context, ...props }, {
      srcDir: opts.srcDir,
      fromFile: found,
      stack: [...stack, found],
    });
  });
}

/**
 * Insert content into the template's <slot /> (or <!-- @slot -->).
 * Uses a replacer function so `$&`, `$1`… in the content stay literal.
 * @param {string} templateHtml
 * @param {string} content
 * @param {string} templateName - for the error message
 */
export function replaceSlot(templateHtml, content, templateName = 'template') {
  if (!SLOT_REGEX.test(templateHtml)) {
    throw new Error(`Template ${templateName} has no <slot /> for the page content`);
  }
  return templateHtml.replace(SLOT_REGEX, () => content);
}
