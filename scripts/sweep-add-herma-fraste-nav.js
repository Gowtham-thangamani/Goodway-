/**
 * One-shot sweep: add HERMA and Fraste as top-level header items on
 * every page, inserted between "Principals & Brands" and "Industries".
 *
 * Handles three path-prefix cases:
 *   - root pages (index.html, about.html, etc.)
 *       → principals/herma.html, principals/fraste.html
 *   - subdir pages (divisions/*, industries/*, journal/*)
 *       → ../principals/herma.html, ../principals/fraste.html
 *   - pages inside principals/ (herma.html, fraste.html)
 *       → herma.html, fraste.html (siblings)
 *
 * Also moves aria-current="page" + w--current to the right link on the
 * dedicated brand pages — herma.html marks HERMA current; fraste.html
 * marks Fraste current; principals.html keeps "Principals & Brands"
 * current as before.
 *
 * Idempotent — safe to re-run.
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

function relPathContext(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('principals/')) {
    // Sibling path inside /principals/
    return { hermaHref: 'herma.html', frasteHref: 'fraste.html', principalsHref: '../principals.html', isPrincipalsSubdir: true };
  } else if (rel.includes('/')) {
    // Any other subdir
    return { hermaHref: '../principals/herma.html', frasteHref: '../principals/fraste.html', principalsHref: '../principals.html', isPrincipalsSubdir: false };
  } else {
    // Root level
    return { hermaHref: 'principals/herma.html', frasteHref: 'principals/fraste.html', principalsHref: 'principals.html', isPrincipalsSubdir: false };
  }
}

const files = walk(ROOT, []);
let touched = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  const ctx = relPathContext(file);
  const filename = path.basename(file);

  // Skip pages that don't carry the desktop nav (request-a-quote stub).
  if (!src.includes('class="nav-menu w-nav-menu"')) continue;

  // Skip if HERMA + Fraste nav links are already present in the menu.
  if (src.includes('class="nav-link w-nav-link">HERMA<') || src.includes('class="nav-link w-nav-link w--current">HERMA<')) continue;

  const isHermaPage = ctx.isPrincipalsSubdir && filename === 'herma.html';
  const isFrastePage = ctx.isPrincipalsSubdir && filename === 'fraste.html';

  // Build the two new <a> nodes; mark the right one as current
  // when we are *on* its own brand page.
  const hermaLink = isHermaPage
    ? `<a href="${ctx.hermaHref}" aria-current="page" class="nav-link w-nav-link w--current">HERMA</a>`
    : `<a href="${ctx.hermaHref}" class="nav-link w-nav-link">HERMA</a>`;
  const frasteLink = isFrastePage
    ? `<a href="${ctx.frasteHref}" aria-current="page" class="nav-link w-nav-link w--current">Fraste</a>`
    : `<a href="${ctx.frasteHref}" class="nav-link w-nav-link">Fraste</a>`;

  // The Principals & Brands link in the nav. Match it loosely so the
  // aria-current variant + non-current variant both replace cleanly.
  // Then move aria-current OFF of it on herma.html / fraste.html.
  if (isHermaPage || isFrastePage) {
    src = src.replace(
      /<a href="[^"]*principals\.html"\s+aria-current="page"\s+class="nav-link w-nav-link w--current">Principals\s*&amp;\s*Brands<\/a>/,
      `<a href="${ctx.principalsHref}" class="nav-link w-nav-link">Principals &amp; Brands</a>`
    );
  }

  // Insert HERMA + Fraste right after the Principals & Brands nav link.
  // Keep the original line's whitespace/indent.
  src = src.replace(
    /(<a href="[^"]*principals\.html"[^>]*class="nav-link w-nav-link[^"]*"[^>]*>Principals\s*&amp;\s*Brands<\/a>)/,
    `$1\n        ${hermaLink}\n        ${frasteLink}`
  );

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    touched++;
    console.log('  ✓ ' + path.relative(ROOT, file));
  }
}
console.log('\n  ' + touched + ' file(s) updated.');
