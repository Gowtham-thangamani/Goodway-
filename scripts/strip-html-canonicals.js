/**
 * One-shot: rewrite every <link rel="canonical"> on the site so the
 * canonical URL is the extension-less form (matches the _redirects
 * 301 .html → clean rule). Run once after introducing the rewrite,
 * commit, then this script can be deleted or kept for safety re-runs.
 *
 *   index.html                       → https://goodway.ae/
 *   about.html                       → https://goodway.ae/about
 *   divisions/instrumentation.html   → https://goodway.ae/divisions/instrumentation
 *   contact.html#quote               → https://goodway.ae/contact#quote
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

  src = src.replace(
    /(<link\s+rel="canonical"\s+href="https:\/\/goodway\.ae\/)([^"]*)(")/g,
    (_m, lead, urlPath, tail) => {
      let p = urlPath;
      if (p === 'index.html') return lead + tail.slice(0); // → https://goodway.ae/"
      // strip .html suffix (preserve any trailing fragment/query)
      p = p.replace(/\.html(?=$|[#?])/, '');
      return lead + p + tail;
    }
  );

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    touched++;
    console.log('  ✓ ' + path.relative(ROOT, file));
  }
}
console.log('\n  ' + touched + ' file(s) updated.');
