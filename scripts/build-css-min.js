/**
 * Minify the 5 CSS files in place → /css/<name>.min.css.
 * Source files stay untouched as the editable origin.  HTML is rewired
 * to load .min.css variants (see scripts/rewire-css-links.js).
 *
 * Strategy: whitespace + comment strip only. NO purging, NO reordering —
 * the cascade stays byte-identical to the source files in the order
 * they're linked from HTML.  Safer than PurgeCSS, which would require
 * a runtime-class safelist for .is-visible / .w--open / .is-leaving
 * etc. and carries real regression risk without a visual-diff harness.
 */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.resolve(__dirname, '..', 'css');
const inputs = [
  'normalize.css',
  'webflow.css',
  'green-crescent-consultant.webflow.css',
  'goodway-brand.css',
  'goodway-enhance.css'
];

/** Minify one CSS string. Safe for all standard selectors. */
function minify(css) {
  return css
    /* 1. Remove /* ... *\/ comments (single pass, non-greedy) */
    .replace(/\/\*[\s\S]*?\*\//g, '')
    /* 2. Collapse all runs of whitespace (newlines, tabs, spaces) into one space */
    .replace(/\s+/g, ' ')
    /* 3. Remove whitespace around braces, semicolons, colons, commas */
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    /* 4. Remove the final semicolon before a closing brace */
    .replace(/;}/g, '}')
    /* 5. Strip leading/trailing whitespace */
    .trim();
}

let totalIn = 0, totalOut = 0;
for (const f of inputs) {
  const inPath = path.join(CSS_DIR, f);
  const outPath = path.join(CSS_DIR, f.replace(/\.css$/, '.min.css'));
  const src = fs.readFileSync(inPath, 'utf8');
  const out = minify(src);
  fs.writeFileSync(outPath, out);
  const inKB = (src.length / 1024).toFixed(1);
  const outKB = (out.length / 1024).toFixed(1);
  const pct = ((1 - out.length / src.length) * 100).toFixed(0);
  totalIn += src.length;
  totalOut += out.length;
  console.log('  ✓', f.padEnd(40), inKB + ' KB → ' + outKB + ' KB (-' + pct + '%)');
}
const totalPct = ((1 - totalOut / totalIn) * 100).toFixed(0);
console.log('\n  total: ' + (totalIn / 1024).toFixed(1) + ' KB → ' +
  (totalOut / 1024).toFixed(1) + ' KB (-' + totalPct + '%)');
