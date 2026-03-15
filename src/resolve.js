import path from 'node:path';
import fs from 'node:fs';

const SLOT_REGEX = /<slot\s*\/>|<!--\s*@slot\s*-->/i;
const INCLUDE_REGEX = /<mini-include\s+([^>]+)\s*\/>/gi;
const VAR_REGEX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

/**
 * Resolve {{ key }} and {{ site.key }} in HTML with context
 * @param {string} html
 * @param {Record<string, unknown>} context - { ...page, site }
 */
export function replaceVars(html, context = {}) {
  return html.replace(VAR_REGEX, (_, key) => {
    const parts = key.trim().split('.');
    let v = context;
    for (const p of parts) {
      v = v != null && typeof v === 'object' ? v[p] : undefined;
    }
    return v != null ? String(v) : '';
  });
}

/**
 * Find component file in atoms, molecules, organisms
 * @param {string} srcDir - project src dir (absolute)
 * @param {string} name - component name (e.g. "Header" or "organisms/Header")
 */
function findComponentPath(srcDir, name) {
  const base = path.join(srcDir, 'src');
  const withPrefix = name.includes('/');
  const layers = withPrefix ? [name.split('/')[0]] : ['atoms', 'molecules', 'organisms'];
  const fileName = withPrefix ? name.split('/').pop() : name;
  const baseName = fileName.endsWith('.html') ? fileName : `${fileName}.html`;

  for (const layer of layers) {
    const full = path.join(base, layer, baseName);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/**
 * Generate repeated marquee line content for SubBanner-style components
 * @param {string} title
 * @param {boolean} withProjects
 */
function repeatMarquee(title, withProjects = true) {
  const segment = `<span>${title}</span> ${title} `;
  const block = segment.repeat(4) + (withProjects ? ' <span> PROJECTS </span> ' : ' ') + segment.repeat(4);
  return (block.repeat(6)).trim();
}

/**
 * Parse attributes from mini-include tag: src="Header" title1="..."
 * @param {string} attrsStr
 */
function parseAttrs(attrsStr) {
  const props = {};
  const srcMatch = attrsStr.match(/\bsrc=["']([^"']+)["']/);
  if (srcMatch) props.src = srcMatch[1].trim();
  const rest = attrsStr.replace(/\bsrc=["'][^"']*["']/g, '').trim();
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  let m;
  while ((m = attrRegex.exec(rest)) !== null) {
    props[m[1]] = m[2];
  }
  if (props.title1 != null && props.title2 != null) {
    props.line1content = repeatMarquee(props.title1);
    props.line2content = repeatMarquee(props.title2, props.title1 !== props.title2);
  }
  return props;
}

/**
 * Resolve all <mini-include src="..." [props] /> in html (recursively)
 * @param {string} html
 * @param {string} srcDir - project src dir (absolute)
 * @param {string} fromFile - path of file containing this html (for relative resolution)
 * @param {number} depth - prevent infinite recursion
 */
export function resolveIncludes(html, srcDir, fromFile = '', depth = 0) {
  if (depth > 20) return html;

  return html.replace(INCLUDE_REGEX, (full, attrsStr) => {
    const attrs = parseAttrs(attrsStr);
    const src = attrs.src;
    if (!src) return full;

    const compPath = findComponentPath(srcDir, src);
    if (!compPath) return full;

    let compHtml = fs.readFileSync(compPath, 'utf8');
    const props = { ...attrs };
    delete props.src;
    compHtml = replaceVars(compHtml, props);
    compHtml = resolveIncludes(compHtml, srcDir, compPath, depth + 1);
    return compHtml;
  });
}

/**
 * Replace <slot /> or <!-- @slot --> with content
 */
export function replaceSlot(templateHtml, content) {
  return templateHtml.replace(SLOT_REGEX, content);
}
