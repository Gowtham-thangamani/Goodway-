/**
 * One-shot sweep:
 *   1. Add Portable Cabins entry to the Divisions dropdown in every page.
 *   2. Update the footer address line to include Mussafah Industrial Area, M-14.
 *
 * Idempotent — safe to re-run after build:pages regenerates pages.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, out) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name === 'node_modules' || f.name.startsWith('.')) continue;
      walk(p, out);
    } else if (f.isFile() && f.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(ROOT, []);
let touched = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  const isInSubdir = path.dirname(file) !== ROOT;
  // Subdir pages reference sibling division pages with a bare filename
  // (e.g. `office-equipment.html`), root pages prefix with `divisions/`.
  const cabinHref = isInSubdir ? 'portable-cabins.html' : 'divisions/portable-cabins.html';
  const officeHref = isInSubdir ? 'office-equipment.html' : 'divisions/office-equipment.html';

  // 1) Inject the Portable Cabins entry after Office Equipment in the
  //    dropdown — only if not already present.
  if (!src.includes(cabinHref)) {
    const officeRow = new RegExp(
      `(<a\\s+href="${officeHref.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}"[^>]*class="w-dropdown-link[^"]*"[^>]*>Office Equipment[^<]*</a>)`
    );
    if (officeRow.test(src)) {
      src = src.replace(
        officeRow,
        `$1\n            <a href="${cabinHref}" class="w-dropdown-link">Portable Cabins &amp; Site Containers</a>`
      );
    }
  }

  // 2) Footer address — replace the legacy "Abu Dhabi, UAE" head-office
  //    line with the Mussafah Industrial Area, M-14 address. The string
  //    appears identically in every page's footer.
  src = src.replace(
    /<strong>Head Office:<\/strong> Abu Dhabi, UAE/g,
    '<strong>Yard &amp; Office:</strong> Mussafah Industrial Area, M-14, Abu Dhabi, UAE'
  );

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    touched++;
    console.log('  ✓ ' + path.relative(ROOT, file));
  }
}
console.log('\n  ' + touched + ' file(s) updated.');
