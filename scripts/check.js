/**
 * Local equivalent of the CI checks. Run with `npm run check`.
 * Exits non-zero on any failure.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let fails = 0;
function check(label, fn) {
  try { fn(); console.log('  ✓ ' + label); }
  catch (e) { console.error('  ✗ ' + label + ' — ' + e.message); fails++; }
}

console.log('Running site checks...\n');

check('JS syntax (goodway-enhance.js)', function () {
  execSync('node --check "' + path.join(ROOT, 'js/goodway-enhance.js') + '"', { stdio: 'ignore' });
});

check('CSS braces balanced', function () {
  for (const f of ['css/goodway-enhance.css', 'css/goodway-brand.css']) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const o = (s.match(/{/g) || []).length, c = (s.match(/}/g) || []).length;
    if (o !== c) throw new Error(f + ' ' + o + ' / ' + c);
  }
});

const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))
  .concat(fs.readdirSync(path.join(ROOT, 'divisions')).map(f => 'divisions/' + f))
  .concat(fs.readdirSync(path.join(ROOT, 'industries')).filter(f => f.endsWith('.html')).map(f => 'industries/' + f))
  .concat(fs.readdirSync(path.join(ROOT, 'journal')).filter(f => f.endsWith('.html')).map(f => 'journal/' + f))
  .concat(fs.existsSync(path.join(ROOT, 'principals')) ? fs.readdirSync(path.join(ROOT, 'principals')).filter(f => f.endsWith('.html')).map(f => 'principals/' + f) : []);

check('Every HTML has canonical + og:image + no w-form', function () {
  for (const f of htmlFiles) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/<link rel="canonical"/.test(s)) throw new Error(f + ' missing canonical');
    if (!/property="og:image"/.test(s)) throw new Error(f + ' missing og:image');
    if (/class="newsletter-form w-form"/.test(s)) throw new Error(f + ' still has w-form class');
  }
});

check('No reintroduction of jQuery or webflow.js', function () {
  /* Both were removed in the P1/P2 cleanup (2026-04-24). If anyone
     re-adds them via a future Webflow export, the site gets 220KB
     heavier and TBT regresses ~100-200ms on mid-range Android. */
  for (const f of htmlFiles) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (s.includes('jquery-3.5.1')) throw new Error(f + ' reintroduces jQuery');
    if (/src="[^"]*webflow\.js/.test(s)) throw new Error(f + ' reintroduces webflow.js');
  }
});

check('No empty or # placeholder hrefs', function () {
  for (const f of htmlFiles) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/href=""/.test(s)) throw new Error(f + ' has empty href');
    if (/href="#"/.test(s)) throw new Error(f + ' has # href');
  }
});

check('Principals + industries markers present', function () {
  const p = fs.readFileSync(path.join(ROOT, 'principals.html'), 'utf8');
  const i = fs.readFileSync(path.join(ROOT, 'industries.html'), 'utf8');
  if (!p.includes('GW-PRINCIPALS-START') || !p.includes('GW-PRINCIPALS-END')) throw new Error('principals markers missing');
  if (!i.includes('GW-INDUSTRIES-START') || !i.includes('GW-INDUSTRIES-END')) throw new Error('industries markers missing');
});

console.log('\n' + (fails ? fails + ' checks failed.' : 'All checks passed on ' + htmlFiles.length + ' pages.'));
process.exit(fails ? 1 : 0);
