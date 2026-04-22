/**
 * Builds a flat search index (search-index.json) from the 20 HTML pages.
 * Extracts: title, URL, description, first <h1>/<h2> text, visible body
 * snippet (up to ~500 chars). Run before deploy:  node scripts/build-search-index.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'search-index.json');
const PAGES = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.startsWith('4'))
  .concat(fs.readdirSync(path.join(ROOT, 'divisions')).map(f => 'divisions/' + f));

function strip(s) {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&[a-z]+;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
}
function pick(html, re) {
  const m = html.match(re);
  return m ? strip(m[1]) : '';
}

const index = PAGES.map(function (rel) {
  const full = path.join(ROOT, rel);
  const html = fs.readFileSync(full, 'utf8');
  const title = pick(html, /<title>([^<]+)<\/title>/) || rel;
  const desc  = pick(html, /<meta name="description" content="([^"]+)"/);
  const h1    = pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h2    = pick(html, /<h2[^>]*>([\s\S]*?)<\/h2>/);
  const body  = strip(
    (html.match(/<main[\s\S]*?<\/main>/) || [''])[0] || html
  ).slice(0, 500);
  return {
    url: '/' + rel,
    title: title.replace(/ \|.*$/, '').trim(),
    heading: h1 || h2,
    description: desc,
    body
  };
});

fs.writeFileSync(OUT, JSON.stringify(index, null, 2));
console.log('Wrote ' + index.length + ' entries → ' + path.relative(ROOT, OUT));
