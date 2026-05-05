/**
 * One-shot sweep for navigation + footer restructuring:
 *   1. Convert "Principals & Brands" flat link → dropdown listing
 *      All 11 Principals, HERMA, Fraste.
 *   2. Remove the HERMA + Fraste top-level nav links (now inside the
 *      Principals dropdown).
 *   3. Add "Journal" as a new top-level nav link between Industries
 *      and the Contact-Us pill.
 *   4. Add "Journal" to the footer Quick Links column.
 *
 * Path-prefix-aware (root vs. subdir vs. /principals/ siblings).
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

function ctxFor(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('principals/')) {
    return {
      principals: '../principals.html',
      herma: 'herma.html',
      fraste: 'fraste.html',
      journal: '../journal.html',
      isPrincipalsSubdir: true,
    };
  } else if (rel.includes('/')) {
    return {
      principals: '../principals.html',
      herma: '../principals/herma.html',
      fraste: '../principals/fraste.html',
      journal: '../journal.html',
      isPrincipalsSubdir: false,
    };
  }
  return {
    principals: 'principals.html',
    herma: 'principals/herma.html',
    fraste: 'principals/fraste.html',
    journal: 'journal.html',
    isPrincipalsSubdir: false,
  };
}

const files = walk(ROOT, []);
let touched = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  const ctx = ctxFor(file);
  const filename = path.basename(file);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');

  // Skip pages that don't carry the desktop nav.
  if (!src.includes('class="nav-menu w-nav-menu"')) continue;

  // Skip if the Principals dropdown is already in place.
  const alreadyDone = src.includes('aria-label="Principals">');
  if (alreadyDone) continue;

  // 1. Remove the standalone HERMA + Fraste top-level links (added in
  //    a previous sweep). The script tolerates either current/non-
  //    current variants.
  src = src.replace(
    /\n\s*<a href="[^"]*(?:principals\/)?herma\.html"[^>]*class="nav-link w-nav-link[^"]*"[^>]*>HERMA<\/a>/g,
    ''
  );
  src = src.replace(
    /\n\s*<a href="[^"]*(?:principals\/)?fraste\.html"[^>]*class="nav-link w-nav-link[^"]*"[^>]*>Fraste<\/a>/g,
    ''
  );

  // Detect current page so the dropdown / Journal link gets w--current
  // applied at the right level.
  const isPrincipalsHome = filename === 'principals.html' && !rel.includes('/');
  const isHermaPage = ctx.isPrincipalsSubdir && filename === 'herma.html';
  const isFrastePage = ctx.isPrincipalsSubdir && filename === 'fraste.html';
  const isJournalPage = filename === 'journal.html' || rel.startsWith('journal/');

  // The Principals dropdown toggle wears w--current when ANY page
  // beneath it is active (overview, herma or fraste).
  const principalsToggleCurrentAttrs =
    isPrincipalsHome || isHermaPage || isFrastePage
      ? ' aria-current="page"'
      : '';
  const principalsToggleCurrentClass =
    isPrincipalsHome || isHermaPage || isFrastePage
      ? ' w--current'
      : '';

  const hermaSubAttrs = isHermaPage ? ' aria-current="page"' : '';
  const hermaSubCurrent = isHermaPage ? ' w--current' : '';
  const frasteSubAttrs = isFrastePage ? ' aria-current="page"' : '';
  const frasteSubCurrent = isFrastePage ? ' w--current' : '';
  const overviewSubAttrs = isPrincipalsHome ? ' aria-current="page"' : '';
  const overviewSubCurrent = isPrincipalsHome ? ' w--current' : '';

  const principalsDropdown =
    `<div data-hover="false" data-delay="0" class="w-dropdown${principalsToggleCurrentClass}">\n` +
    `          <div${principalsToggleCurrentAttrs} class="w-dropdown-toggle"><div class="w-icon-dropdown-toggle"></div><div>Principals</div></div>\n` +
    `          <nav class="w-dropdown-list" aria-label="Principals">\n` +
    `            <a href="${ctx.principals}"${overviewSubAttrs} class="w-dropdown-link${overviewSubCurrent}">All 11 Principals</a>\n` +
    `            <a href="${ctx.herma}"${hermaSubAttrs} class="w-dropdown-link${hermaSubCurrent}">HERMA &middot; Germany</a>\n` +
    `            <a href="${ctx.fraste}"${frasteSubAttrs} class="w-dropdown-link${frasteSubCurrent}">Fraste &middot; Italy</a>\n` +
    `          </nav>\n` +
    `        </div>`;

  // 2. Replace the Principals & Brands flat link with the dropdown.
  src = src.replace(
    /<a href="[^"]*principals\.html"[^>]*class="nav-link w-nav-link[^"]*"[^>]*>Principals\s*&amp;\s*Brands<\/a>/,
    principalsDropdown
  );

  // 3. Insert Journal nav-link after the Industries link.
  const journalCurrentAttrs = isJournalPage ? ' aria-current="page"' : '';
  const journalCurrentClass = isJournalPage ? ' w--current' : '';
  const journalLink = `<a href="${ctx.journal}"${journalCurrentAttrs} class="nav-link w-nav-link${journalCurrentClass}">Journal</a>`;

  // Match the Industries link, then append Journal directly after.
  src = src.replace(
    /(<a href="[^"]*industries\.html"[^>]*class="nav-link w-nav-link[^"]*"[^>]*>Industries<\/a>)/,
    `$1\n        ${journalLink}`
  );

  // 4. Add Journal to the footer Quick Links column. Insert between
  //    "Industries" and "Contact" so the order matches the header.
  //    Skip if already present.
  if (!/<a href="[^"]*journal\.html"\s+class="footer-link">Journal<\/a>/.test(src)) {
    const journalFooterHref = ctx.journal;
    src = src.replace(
      /(<a href="[^"]*industries\.html"\s+class="footer-link">Industries<\/a>)(\s*<a href="[^"]*contact\.html"\s+class="footer-link">Contact<\/a>)/,
      `$1\n                <a href="${journalFooterHref}" class="footer-link">Journal</a>$2`
    );
  }

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    touched++;
    console.log('  ✓ ' + rel);
  }
}
console.log('\n  ' + touched + ' file(s) updated.');
