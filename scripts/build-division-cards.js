/**
 * Generate 480×320 illustrated card images for the 9 division cards on
 * services.html. Each card gets a division-specific gradient + a large
 * watermark number + a themed SVG glyph + the division title in Fraunces.
 * Output: assets/images/sections/divisions/<slug>/card-hero.png
 *
 * Client can replace any file with a real photograph at the same path.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_ROOT = path.resolve(__dirname, '..', 'assets', 'images', 'sections', 'divisions');

/*  Each division:
    - num        : large watermark number (01–09)
    - slug       : file path slug
    - title      : display title on the card
    - palette    : [top-color, bottom-color] linear gradient
    - accent     : gold glyph colour
    - glyph      : SVG inner markup (viewBox 0 0 120 120)
*/
const divisions = [
  {
    num: '01', slug: 'scientific-lab', title: 'Scientific & Lab',
    palette: ['#0e1a2b', '#1b3a5b'], accent: '#d7ba76',
    glyph: `
      <path d="M45 30 L45 55 L30 95 Q28 105 38 105 L82 105 Q92 105 90 95 L75 55 L75 30" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="40" y1="30" x2="80" y2="30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <line x1="35" y1="80" x2="85" y2="80" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="55" cy="90" r="3" fill="currentColor" opacity="0.6"/>
      <circle cx="70" cy="95" r="2" fill="currentColor" opacity="0.6"/>
      <circle cx="62" cy="85" r="2" fill="currentColor" opacity="0.6"/>`
  },
  {
    num: '02', slug: 'mechanical', title: 'Mechanical Items',
    palette: ['#1a2a3e', '#2c4256'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none">
        <circle cx="60" cy="60" r="22"/>
        <circle cx="60" cy="60" r="6" fill="currentColor"/>
        <path d="M60 28 L60 38 M60 82 L60 92 M28 60 L38 60 M82 60 L92 60
                 M38 38 L44 44 M76 76 L82 82 M82 38 L76 44 M38 82 L44 76"
              stroke-linecap="round"/>
      </g>`
  },
  {
    num: '03', slug: 'electrical', title: 'Electrical',
    palette: ['#10263f', '#1d3e60'], accent: '#f4c75b',
    glyph: `
      <path d="M62 20 L38 66 L56 66 L50 100 L80 50 L62 50 L68 20 Z"
            fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
  },
  {
    num: '04', slug: 'instrumentation', title: 'Instrumentation',
    palette: ['#0b2b3a', '#17475e'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none">
        <circle cx="60" cy="60" r="32"/>
        <line x1="60" y1="32" x2="60" y2="38" stroke-linecap="round"/>
        <line x1="60" y1="82" x2="60" y2="88" stroke-linecap="round"/>
        <line x1="32" y1="60" x2="38" y2="60" stroke-linecap="round"/>
        <line x1="82" y1="60" x2="88" y2="60" stroke-linecap="round"/>
        <line x1="60" y1="60" x2="78" y2="46" stroke-linecap="round" stroke-width="4"/>
        <circle cx="60" cy="60" r="3" fill="currentColor"/>
      </g>`
  },
  {
    num: '05', slug: 'building-material', title: 'Building Material',
    palette: ['#2a1e15', '#43301f'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none">
        <rect x="35" y="25" width="50" height="80" rx="2"/>
        <line x1="35" y1="55" x2="85" y2="55"/>
        <line x1="35" y1="75" x2="85" y2="75"/>
        <circle cx="76" cy="65" r="2.2" fill="currentColor"/>
      </g>`
  },
  {
    num: '06', slug: 'chemicals-power', title: 'Chemicals & Power',
    palette: ['#2b1018', '#4e1a24'], accent: '#f4c75b',
    glyph: `
      <g fill="currentColor">
        <path d="M40 25 C30 55 28 75 40 75 C52 75 50 55 40 25 Z" opacity="0.9"/>
        <path d="M60 45 C50 75 48 95 60 95 C72 95 70 75 60 45 Z"/>
        <path d="M80 25 C70 55 68 75 80 75 C92 75 90 55 80 25 Z" opacity="0.9"/>
      </g>`
  },
  {
    num: '07', slug: 'heavy-equipment', title: 'Heavy Equipment',
    palette: ['#1a1a1a', '#2f2f2f'], accent: '#f4c75b',
    glyph: `
      <g fill="currentColor">
        <rect x="22" y="62" width="76" height="18" rx="3"/>
        <rect x="42" y="40" width="34" height="22" rx="2"/>
        <circle cx="38" cy="86" r="8" fill="none" stroke="currentColor" stroke-width="3"/>
        <circle cx="82" cy="86" r="8" fill="none" stroke="currentColor" stroke-width="3"/>
        <path d="M48 40 L58 26 L74 26 L76 40" fill="none" stroke="currentColor" stroke-width="2"/>
      </g>`
  },
  {
    num: '08', slug: 'road-safety', title: 'Road & Industrial Safety',
    palette: ['#3d1a07', '#64290d'], accent: '#f4c75b',
    glyph: `
      <g fill="currentColor">
        <path d="M60 24 L38 96 L82 96 Z"/>
        <rect x="44" y="54" width="32" height="5" fill="#1a1a1a"/>
        <rect x="42" y="70" width="36" height="5" fill="#1a1a1a"/>
        <rect x="40" y="86" width="40" height="5" fill="#1a1a1a"/>
      </g>`
  },
  {
    num: '09', slug: 'office-equipment', title: 'Office Equipment & Stationery',
    palette: ['#0e1a2b', '#223655'], accent: '#d7ba76',
    glyph: `
      <g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
        <rect x="30" y="30" width="45" height="60" rx="2" fill="currentColor" fill-opacity="0.15"/>
        <line x1="38" y1="44" x2="65" y2="44"/>
        <line x1="38" y1="54" x2="65" y2="54"/>
        <line x1="38" y1="64" x2="55" y2="64"/>
        <path d="M70 82 L92 60 L86 54 L64 76 L62 84 Z" fill="currentColor" stroke="none"/>
      </g>`
  }
];

function xml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function compose(d) {
  const W = 480, H = 320;
  const titleXml = xml(d.title);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${d.palette[0]}"/>
      <stop offset="100%" stop-color="${d.palette[1]}"/>
    </linearGradient>
    <radialGradient id="aura" cx="0.85" cy="0.2" r="0.9">
      <stop offset="0%"  stop-color="${d.accent}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${d.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#aura)"/>
  <!-- subtle gold hairline bottom border -->
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="${d.accent}" fill-opacity="0.55"/>

  <!-- big watermark number -->
  <text x="${W - 30}" y="112" text-anchor="end"
        font-family="'Fraunces', Georgia, serif" font-weight="600"
        font-size="132" fill="${d.accent}" fill-opacity="0.12"
        letter-spacing="-0.02em">${d.num}</text>

  <!-- centered themed glyph in gold -->
  <g transform="translate(${W/2 - 60},${H/2 - 90})" color="${d.accent}">
    ${d.glyph}
  </g>

  <!-- division title bottom-left -->
  <text x="24" y="${H - 24}"
        font-family="'Plus Jakarta Sans','Segoe UI',Arial,sans-serif"
        font-weight="700" font-size="18" fill="#ffffff"
        letter-spacing="0.01em">${titleXml}</text>
  <text x="24" y="${H - 46}"
        font-family="'Plus Jakarta Sans','Segoe UI',Arial,sans-serif"
        font-weight="700" font-size="10" fill="${d.accent}"
        letter-spacing="0.24em">DIVISION ${d.num}</text>
</svg>`;
}

(async () => {
  for (const d of divisions) {
    const dir = path.join(OUT_ROOT, d.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const svg = compose(d);
    const out = path.join(dir, 'card-hero.png');
    await sharp(Buffer.from(svg), { density: 150 })
      .resize(480, 320)
      .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10, colors: 128 })
      .toFile(out);
    const size = Math.round(fs.statSync(out).size / 1024);
    console.log('wrote', d.slug + '/card-hero.png', size + 'KB');
  }
  console.log('\nGenerated ' + divisions.length + ' division card images.');
})().catch(e => { console.error(e); process.exit(1); });
