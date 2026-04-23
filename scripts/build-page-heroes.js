/**
 * Generate subtle branded hero-background SVG→PNG images for thin pages
 * that lack a visual anchor. Each is 1920×720, navy+gold palette, with
 * a generous radial gold aura + dotted texture + a page-specific glyph
 * watermark. Used as CSS background-image on each page's hero section.
 * Drop-in: client photography can replace via the same filename.
 *
 * Output: assets/images/sections/<page>/hero-bg.jpg
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'assets', 'images', 'sections');

const heroes = [
  {
    slug: 'about',
    palette: ['#0a1a2b', '#1a3a5c', '#0a1a2b'],
    glyph: `
      <g stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.18">
        <circle cx="0" cy="0" r="180"/>
        <circle cx="0" cy="0" r="240"/>
        <circle cx="0" cy="0" r="300"/>
        <path d="M-200 -80 Q0 -140 200 -80 Q0 80 -200 -80Z"/>
      </g>`
  },
  {
    slug: 'services',
    palette: ['#0c1f3b', '#1a2f4e', '#0c1f3b'],
    glyph: `
      <g stroke="currentColor" stroke-width="2" fill="none" opacity="0.14">
        <rect x="-180" y="-120" width="90" height="120" rx="4"/>
        <rect x="-70"  y="-160" width="90" height="160" rx="4"/>
        <rect x="40"   y="-100" width="90" height="100" rx="4"/>
        <line x1="-200" y1="20" x2="160" y2="20"/>
      </g>`
  },
  {
    slug: 'contact',
    palette: ['#0d1f36', '#14314f', '#0d1f36'],
    glyph: `
      <g stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.16" stroke-linecap="round">
        <path d="M-180 -30 L-60 -90 L0 -40 L120 -110 L200 -70"/>
        <circle cx="-180" cy="-30" r="6" fill="currentColor"/>
        <circle cx="-60"  cy="-90" r="6" fill="currentColor"/>
        <circle cx="0"    cy="-40" r="6" fill="currentColor"/>
        <circle cx="120"  cy="-110" r="6" fill="currentColor"/>
        <circle cx="200"  cy="-70" r="6" fill="currentColor"/>
        <path d="M-120 60 C-80 30 0 30 40 60 C80 30 160 30 180 70"/>
      </g>`
  },
  {
    slug: 'request-a-quote',
    palette: ['#0a1e35', '#163657', '#0a1e35'],
    glyph: `
      <g stroke="currentColor" stroke-width="2" fill="none" opacity="0.14" stroke-linecap="round">
        <rect x="-140" y="-130" width="200" height="260" rx="8"/>
        <line x1="-100" y1="-80" x2="20"  y2="-80"/>
        <line x1="-100" y1="-40" x2="20"  y2="-40"/>
        <line x1="-100" y1="0"   x2="20"  y2="0"/>
        <line x1="-100" y1="40"  x2="20"  y2="40"/>
        <line x1="-100" y1="80"  x2="-20" y2="80"/>
        <path d="M80 60 L150 -10 L180 20 L110 90 L80 100 Z" fill="currentColor" fill-opacity="0.12"/>
      </g>`
  },
  {
    slug: 'team',
    palette: ['#101f33', '#1d3a5e', '#101f33'],
    glyph: `
      <g stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.16">
        <circle cx="-140" cy="-30" r="40"/>
        <path d="M-200 80 C-200 40 -80 40 -80 80"/>
        <circle cx="0" cy="-50" r="50"/>
        <path d="M-70 110 C-70 60 70 60 70 110"/>
        <circle cx="140" cy="-30" r="40"/>
        <path d="M80 80 C80 40 200 40 200 80"/>
      </g>`
  }
];

function compose(h) {
  const W = 1920, H = 720;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${h.palette[0]}"/>
      <stop offset="50%"  stop-color="${h.palette[1]}"/>
      <stop offset="100%" stop-color="${h.palette[2]}"/>
    </linearGradient>
    <radialGradient id="aura" cx="0.85" cy="0.2" r="0.7">
      <stop offset="0%"  stop-color="#c9a961" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#c9a961" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura2" cx="0.12" cy="0.85" r="0.6">
      <stop offset="0%"  stop-color="#1a4a7a" stop-opacity="0.3"/>
      <stop offset="80%" stop-color="#1a4a7a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.028"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#aura2)"/>
  <rect width="${W}" height="${H}" fill="url(#aura)"/>
  <g transform="translate(${W*0.78},${H*0.45})" color="#c9a961">
    ${h.glyph}
  </g>
</svg>`;
}

(async () => {
  for (const h of heroes) {
    const dir = path.join(OUT, h.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const svg = compose(h);
    const out = path.join(dir, 'hero-bg.jpg');
    await sharp(Buffer.from(svg), { density: 110 })
      .resize(1920, 720)
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log('wrote', h.slug + '/hero-bg.jpg', kb + 'KB');
  }
})().catch(e => { console.error(e); process.exit(1); });
