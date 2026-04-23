/**
 * Generate 8 branded sector thumbnails for industries.html — same
 * pattern as division cards (palette + watermark + themed glyph +
 * sector name). Output: assets/images/sections/industries/<slug>/hero.png
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'assets', 'images', 'sections', 'industries');

const sectors = [
  {
    slug: 'oil-gas', title: 'Oil & Gas',
    palette: ['#0a1a2b', '#1f3a5c'], accent: '#f4c75b',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M30 95 L30 50 Q30 35 45 35 L50 35"/>
        <path d="M50 35 L50 95"/>
        <rect x="60" y="55" width="22" height="40" fill="currentColor" fill-opacity="0.15"/>
        <line x1="60" y1="65" x2="82" y2="65"/>
        <line x1="60" y1="75" x2="82" y2="75"/>
        <line x1="60" y1="85" x2="82" y2="85"/>
        <line x1="38" y1="25" x2="38" y2="35"/>
        <circle cx="38" cy="22" r="3" fill="currentColor"/>
      </g>`
  },
  {
    slug: 'petrochemical', title: 'Petrochemical',
    palette: ['#1a1008', '#3a251a'], accent: '#f4a858',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
        <rect x="25" y="60" width="70" height="40" rx="3" fill="currentColor" fill-opacity="0.1"/>
        <rect x="40" y="30" width="12" height="30"/>
        <rect x="68" y="20" width="12" height="40"/>
        <path d="M46 30 L46 22 L50 18 L50 22" stroke-linejoin="round"/>
        <path d="M74 20 L74 14 L78 10 L78 14" stroke-linejoin="round"/>
      </g>`
  },
  {
    slug: 'power', title: 'Power Generation',
    palette: ['#0d1e36', '#1a3a6b'], accent: '#f4c75b',
    glyph: `
      <g fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
        <path d="M55 15 L28 65 L48 65 L40 100 L75 45 L55 45 L60 15 Z"/>
      </g>`
  },
  {
    slug: 'water', title: 'Water & Wastewater',
    palette: ['#062336', '#0d3a58'], accent: '#79c4e5',
    glyph: `
      <g fill="currentColor" stroke="currentColor" stroke-width="2">
        <path d="M60 15 C45 40 35 60 35 75 C35 90 47 98 60 98 C73 98 85 90 85 75 C85 60 75 40 60 15 Z"
              fill="currentColor" fill-opacity="0.2"/>
        <path d="M55 70 Q60 60 65 70 Q70 80 65 85"
              fill="none" stroke-linecap="round"/>
      </g>`
  },
  {
    slug: 'government', title: 'Government & Civil Defence',
    palette: ['#1a0d1a', '#3a1f3a'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round">
        <path d="M60 15 L88 28 L88 55 Q88 80 60 100 Q32 80 32 55 L32 28 Z"
              fill="currentColor" fill-opacity="0.1"/>
        <path d="M48 58 L56 66 L74 48" stroke-width="4"/>
      </g>`
  },
  {
    slug: 'construction', title: 'Construction & Infrastructure',
    palette: ['#2a1a08', '#4e3220'], accent: '#f4c75b',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M25 95 L60 25 L95 95 Z" fill="currentColor" fill-opacity="0.15"/>
        <line x1="45" y1="65" x2="75" y2="65"/>
        <line x1="38" y1="80" x2="82" y2="80"/>
        <line x1="30" y1="95" x2="90" y2="95"/>
      </g>`
  },
  {
    slug: 'hospitality', title: 'Hospitality & Corporate',
    palette: ['#1a0d20', '#3a2850'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
        <rect x="25" y="30" width="70" height="65" rx="2" fill="currentColor" fill-opacity="0.1"/>
        <line x1="25" y1="48" x2="95" y2="48"/>
        <line x1="42" y1="30" x2="42" y2="95"/>
        <line x1="78" y1="30" x2="78" y2="95"/>
        <circle cx="35" cy="58" r="2" fill="currentColor"/>
        <circle cx="35" cy="72" r="2" fill="currentColor"/>
        <circle cx="35" cy="86" r="2" fill="currentColor"/>
      </g>`
  },
  {
    slug: 'manufacturing', title: 'Manufacturing & Industrial',
    palette: ['#181818', '#2c2c2c'], accent: '#f4c75b',
    glyph: `
      <g fill="currentColor" stroke="currentColor" stroke-width="2">
        <rect x="15" y="70" width="90" height="25"/>
        <path d="M18 70 L18 50 L38 60 L38 40 L58 50 L58 30 L78 40 L78 20 L98 30 L98 70 Z"
              fill="currentColor" fill-opacity="0.85"/>
      </g>`
  }
];

function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function compose(s, idx) {
  const W = 480, H = 320;
  const num = String(idx + 1).padStart(2, '0');
  const title = xml(s.title);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${s.palette[0]}"/>
      <stop offset="100%" stop-color="${s.palette[1]}"/>
    </linearGradient>
    <radialGradient id="aura" cx="0.82" cy="0.18" r="0.9">
      <stop offset="0%"  stop-color="${s.accent}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#aura)"/>
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="${s.accent}" fill-opacity="0.55"/>

  <!-- large watermark number bottom-right -->
  <text x="${W - 28}" y="${H - 18}" text-anchor="end"
        font-family="'Fraunces', Georgia, serif" font-weight="600"
        font-size="112" fill="${s.accent}" fill-opacity="0.10"
        letter-spacing="-0.02em">${num}</text>

  <!-- themed glyph centred -->
  <g transform="translate(${W/2 - 60},${H/2 - 90})" color="${s.accent}">
    ${s.glyph}
  </g>

  <!-- sector title bottom-left -->
  <text x="22" y="${H - 24}"
        font-family="'Plus Jakarta Sans','Segoe UI',Arial,sans-serif"
        font-weight="700" font-size="17" fill="#ffffff"
        letter-spacing="0.01em">${title}</text>
  <text x="22" y="${H - 46}"
        font-family="'Plus Jakarta Sans','Segoe UI',Arial,sans-serif"
        font-weight="700" font-size="10" fill="${s.accent}"
        letter-spacing="0.24em">SECTOR ${num}</text>
</svg>`;
}

(async () => {
  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i];
    const dir = path.join(OUT, s.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const svg = compose(s, i);
    const outPath = path.join(dir, 'hero.png');
    await sharp(Buffer.from(svg), { density: 150 })
      .resize(480, 320)
      .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10, colors: 128 })
      .toFile(outPath);
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log('wrote', s.slug + '/hero.png', kb + 'KB');
  }
  console.log('\nGenerated ' + sectors.length + ' sector thumbnails.');
})().catch(e => { console.error(e); process.exit(1); });
