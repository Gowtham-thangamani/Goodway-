/**
 * Branded filler images for every empty slot the site still carries after
 * the client photography drop.  Each image is SVG-rendered on a navy gradient
 * with gold accents, a subtle dot pattern and a topic-specific glyph, plus a
 * small "Goodway" wordmark so the placeholder looks intentional rather than
 * missing.
 *
 * When the client commissions real photography, drop the photo in at the
 * same path and filename — the HTML references will pick it up unchanged.
 *
 * Output tree:
 *   assets/images/sections/home/*.jpg
 *   assets/images/sections/about/*.jpg
 *   assets/images/sections/principals/*.jpg
 *   assets/images/sections/services/*.jpg
 *   assets/images/sections/divisions/<slug>/detail.jpg
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'assets', 'images', 'sections');

const PALETTE = {
  navyDark:  '#0a1a2b',
  navyMid:   '#15304c',
  navyBlue:  '#1d3f63',
  gold:      '#c9a961',
  ivory:     '#faf6ec'
};

/* ---- glyph vocabulary --------------------------------------------------- */
const G = {
  // electrical – motor coils + bolt
  electrical: `
    <circle cx="0" cy="-30" r="80" stroke="currentColor" stroke-width="3" fill="none"/>
    <circle cx="0" cy="-30" r="55" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
    <circle cx="0" cy="-30" r="30" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
    <path d="M-10 -70 L-30 -20 L-5 -20 L-20 30 L25 -30 L0 -30 L15 -70 Z" fill="currentColor" opacity="0.9"/>
    <path d="M-100 70 L100 70" stroke="currentColor" stroke-width="4" opacity="0.7"/>
    <circle cx="-70" cy="70" r="5" fill="currentColor"/>
    <circle cx="70"  cy="70" r="5" fill="currentColor"/>`,
  // mechanical – gear
  mechanical: `
    <g stroke="currentColor" stroke-width="3" fill="none">
      <circle cx="0" cy="0" r="55"/>
      <circle cx="0" cy="0" r="22"/>
    </g>
    <g fill="currentColor" opacity="0.9">
      ${Array.from({length: 12}).map((_,i)=>{const a=i*30*Math.PI/180;const x=Math.cos(a)*70;const y=Math.sin(a)*70;return `<rect x="${x-8}" y="${y-8}" width="16" height="16" transform="rotate(${i*30} ${x} ${y})"/>`;}).join('')}
    </g>`,
  // instrumentation – gauge + waveform
  instrumentation: `
    <path d="M-80 30 A 80 80 0 0 1 80 30" stroke="currentColor" stroke-width="4" fill="none"/>
    <line x1="0" y1="30" x2="50" y2="-30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <circle cx="0" cy="30" r="6" fill="currentColor"/>
    <path d="M-100 80 L-60 80 L-40 60 L-20 100 L0 40 L20 80 L60 80 L100 80" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.6"/>`,
  // scientific-lab – flask + drop
  'scientific-lab': `
    <path d="M-30 -80 L-30 -20 L-70 60 L70 60 L30 -20 L30 -80 Z" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M-30 -80 L30 -80" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <path d="M-50 20 L50 20" stroke="currentColor" stroke-width="2" opacity="0.6"/>
    <path d="M-55 40 L55 40 L35 70 L-35 70 Z" fill="currentColor" opacity="0.25"/>
    <circle cx="0" cy="0" r="4" fill="currentColor"/>
    <circle cx="-15" cy="10" r="3" fill="currentColor" opacity="0.6"/>
    <circle cx="15" cy="5" r="3" fill="currentColor" opacity="0.6"/>`,
  // heavy-equipment – excavator bucket
  'heavy-equipment': `
    <path d="M-80 50 L-20 50 L-20 -40 L20 -40 L20 50 L80 50 L80 80 L-80 80 Z" stroke="currentColor" stroke-width="3" fill="none"/>
    <circle cx="-50" cy="65" r="18" stroke="currentColor" stroke-width="3" fill="none"/>
    <circle cx="50"  cy="65" r="18" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M30 -30 L90 -80 L100 -60 L40 -10 Z" fill="currentColor" opacity="0.7"/>`,
  // building-material – steel door
  'building-material': `
    <rect x="-55" y="-80" width="110" height="160" stroke="currentColor" stroke-width="3" fill="none"/>
    <rect x="-40" y="-65" width="80"  height="45"  stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    <rect x="-40" y="-10" width="80"  height="45"  stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    <circle cx="38" cy="10" r="5" fill="currentColor"/>
    <text x="0" y="60" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="800" fill="currentColor" opacity="0.7">FD60</text>`,
  // chemicals-power – barrel + bolt
  'chemicals-power': `
    <ellipse cx="-40" cy="-45" rx="32" ry="10" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <path d="M-72 -45 L-72 60 A 32 10 0 0 0 -8 60 L-8 -45" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <path d="M-72 -15 A 32 10 0 0 0 -8 -15" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M-72 15 A 32 10 0 0 0 -8 15" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M30 -60 L50 -10 L70 -10 L55 20 L75 40 L55 70 L60 40 L40 40 L55 0 L35 0 Z" fill="currentColor" opacity="0.9"/>`,
  // road-safety – cone + harness
  'road-safety': `
    <path d="M-30 60 L-10 -70 L10 -70 L30 60 Z" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M-22 20 L22 20" stroke="currentColor" stroke-width="4"/>
    <path d="M-17 -10 L17 -10" stroke="currentColor" stroke-width="3" opacity="0.6"/>
    <rect x="-60" y="55" width="120" height="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="65" cy="-40" r="18" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <path d="M83 -40 L95 -25 L75 -10" stroke="currentColor" stroke-width="2.5" fill="none"/>`,
  // office-equipment – printer
  'office-equipment': `
    <rect x="-70" y="-20" width="140" height="50" rx="4" stroke="currentColor" stroke-width="3" fill="none"/>
    <rect x="-55" y="-60" width="110" height="40" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    <rect x="-45" y="30"  width="90"  height="45" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8"/>
    <line x1="-42" y1="45" x2="42" y2="45" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <line x1="-42" y1="55" x2="42" y2="55" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <circle cx="55" cy="5" r="4" fill="currentColor"/>`,
  // about – UAE rising-sun wordmark glyph
  about: `
    <path d="M-100 50 Q -100 -30 0 -30 Q 100 -30 100 50" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M-80 50 Q -80 -10 0 -10 Q 80 -10 80 50" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
    <rect x="-110" y="50" width="220" height="20" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <circle cx="0" cy="-60" r="8" fill="currentColor"/>
    <path d="M-90 60 L-90 80" stroke="currentColor" stroke-width="2"/>
    <path d="M90  60 L90  80" stroke="currentColor" stroke-width="2"/>`,
  // principals – globe with dots
  principals: `
    <circle cx="0" cy="0" r="80" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M-80 0 Q 0 -50 80 0 Q 0 50 -80 0" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M0 -80 L0 80" stroke="currentColor" stroke-width="2"/>
    <path d="M-80 0 L80 0" stroke="currentColor" stroke-width="2"/>
    <circle cx="-40" cy="-30" r="5" fill="currentColor"/>
    <circle cx="30"  cy="-35" r="5" fill="currentColor"/>
    <circle cx="45"  cy="20" r="5" fill="currentColor"/>
    <circle cx="-25" cy="30" r="5" fill="currentColor"/>`,
  // services – warehouse boxes
  services: `
    <rect x="-90" y="0" width="60" height="60" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <rect x="-30" y="-40" width="60" height="100" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <rect x="30"  y="-20" width="60" height="80" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <path d="M-90 60 L90 60" stroke="currentColor" stroke-width="3"/>
    <path d="M-90 0 L-30 0" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <path d="M-30 -40 L30 -40" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <path d="M30 -20 L90 -20" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>`,
  // operations – checklist + shield
  operations: `
    <rect x="-60" y="-70" width="90" height="140" rx="8" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M-40 -40 L-20 -40 M-40 -10 L-20 -10 M-40 20 L-20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-12 -42 L-5 -35 L8 -48" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M-12 -12 L-5 -5 L8 -18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M45 -30 L90 -30 L90 20 Q 90 50 67 65 Q 45 50 45 20 Z" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M58 5 L65 12 L78 -5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  // process – flow of dots
  process: `
    <circle cx="-80" cy="0" r="22" stroke="currentColor" stroke-width="3" fill="none"/>
    <circle cx="0"   cy="0" r="22" stroke="currentColor" stroke-width="3" fill="none"/>
    <circle cx="80"  cy="0" r="22" stroke="currentColor" stroke-width="3" fill="none"/>
    <line x1="-58" y1="0" x2="-22" y2="0" stroke="currentColor" stroke-width="2"/>
    <line x1="22"  y1="0" x2="58"  y2="0" stroke="currentColor" stroke-width="2"/>
    <circle cx="-80" cy="0" r="6" fill="currentColor"/>
    <circle cx="0"   cy="0" r="6" fill="currentColor"/>
    <circle cx="80"  cy="0" r="6" fill="currentColor"/>
    <text x="0" y="60" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="currentColor" opacity="0.7">RFQ → OFFER → DELIVERY</text>`,
  // industries – sector grid
  industries: `
    <g stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.8">
      <rect x="-90" y="-90" width="50" height="50" rx="4"/>
      <rect x="-25" y="-90" width="50" height="50" rx="4"/>
      <rect x="40"  y="-90" width="50" height="50" rx="4"/>
      <rect x="-90" y="-25" width="50" height="50" rx="4"/>
      <rect x="-25" y="-25" width="50" height="50" rx="4"/>
      <rect x="40"  y="-25" width="50" height="50" rx="4"/>
      <rect x="-90" y="40"  width="50" height="50" rx="4"/>
      <rect x="-25" y="40"  width="50" height="50" rx="4"/>
      <rect x="40"  y="40"  width="50" height="50" rx="4"/>
    </g>
    <circle cx="0"   cy="0"   r="8" fill="currentColor"/>
    <circle cx="-65" cy="-65" r="5" fill="currentColor"/>
    <circle cx="65"  cy="65"  r="5" fill="currentColor"/>
    <circle cx="-65" cy="65"  r="5" fill="currentColor" opacity="0.5"/>
    <circle cx="65"  cy="-65" r="5" fill="currentColor" opacity="0.5"/>`
};

/* ---- compose ------------------------------------------------------------ */
function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function compose({ w, h, glyph, label, orient = 'right' }) {
  const cx = orient === 'right' ? w * 0.8 : w * 0.5;
  const cy = h * 0.5;
  const safeLabel = xml(String(label).toUpperCase());
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${PALETTE.navyDark}"/>
      <stop offset="55%"  stop-color="${PALETTE.navyMid}"/>
      <stop offset="100%" stop-color="${PALETTE.navyBlue}"/>
    </linearGradient>
    <radialGradient id="aura" cx="${orient === 'right' ? 0.8 : 0.5}" cy="0.5" r="0.7">
      <stop offset="0%"  stop-color="${PALETTE.gold}" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="${PALETTE.gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aura2" cx="0.1" cy="0.85" r="0.55">
      <stop offset="0%"  stop-color="#1a4a7a" stop-opacity="0.28"/>
      <stop offset="80%" stop-color="#1a4a7a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>
  <rect width="${w}" height="${h}" fill="url(#aura2)"/>
  <rect width="${w}" height="${h}" fill="url(#aura)"/>

  <!-- glyph -->
  <g transform="translate(${cx},${cy}) scale(${Math.min(w,h)/380})" color="${PALETTE.gold}" opacity="0.78">
    ${glyph}
  </g>

  <!-- wordmark bottom-left -->
  <g font-family="'Plus Jakarta Sans', sans-serif" fill="${PALETTE.ivory}">
    <text x="${Math.max(24, w*0.04)}" y="${h - 32}" font-size="${Math.max(12, Math.round(h*0.028))}" font-weight="800" letter-spacing="2">GOODWAY</text>
    <text x="${Math.max(24, w*0.04)}" y="${h - 14}" font-size="${Math.max(10, Math.round(h*0.018))}" font-weight="400" letter-spacing="1.4" opacity="0.75">${safeLabel}</text>
  </g>

  <!-- gold hairline bottom -->
  <rect x="0" y="${h - 3}" width="${w}" height="3" fill="${PALETTE.gold}" opacity="0.9"/>
</svg>`;
}

/* ---- jobs --------------------------------------------------------------- */
const jobs = [
  /* 9 division "detail" companions (slot-B) */
  ...[
    ['electrical',        G.electrical,        'Electrical division — motors · switchgear'],
    ['mechanical',        G.mechanical,        'Mechanical division — compressors · rotating parts'],
    ['instrumentation',   G.instrumentation,   'Instrumentation & meteorological'],
    ['scientific-lab',    G['scientific-lab'], 'Scientific & laboratory instrumentation'],
    ['heavy-equipment',   G['heavy-equipment'],'Heavy equipment & spares'],
    ['building-material', G['building-material'],'Building material — fire-rated doors'],
    ['chemicals-power',   G['chemicals-power'],'Chemicals & power supplies'],
    ['road-safety',       G['road-safety'],    'Road safety & personal protection'],
    ['office-equipment',  G['office-equipment'],'Office & stationery'],
  ].map(([slug, glyph, label]) => ({
    dir: path.join(OUT, 'divisions', slug),
    file: 'detail.jpg',
    w: 900, h: 700, glyph, label
  })),

  /* about whoweare */
  { dir: path.join(OUT, 'about'), file: 'whoweare-a.jpg', w: 900, h: 900, glyph: G.about,       label: 'National establishment · since 2014' },
  { dir: path.join(OUT, 'about'), file: 'whoweare-b.jpg', w: 800, h: 640, glyph: G.operations,  label: 'Licensed · compliant · insured' },

  /* principals whoweare */
  { dir: path.join(OUT, 'principals'), file: 'whoweare-a.jpg', w: 900, h: 900, glyph: G.principals, label: '12 international principals' },
  { dir: path.join(OUT, 'principals'), file: 'whoweare-b.jpg', w: 800, h: 640, glyph: G.about,      label: 'Authorised distribution' },

  /* services whoweare */
  { dir: path.join(OUT, 'services'), file: 'whoweare-a.jpg', w: 900, h: 900, glyph: G.services,  label: 'One supplier · every division' },
  { dir: path.join(OUT, 'services'), file: 'whoweare-b.jpg', w: 800, h: 640, glyph: G.industries,label: 'Oil & gas · power · water · construction' },

  /* homepage */
  { dir: path.join(OUT, 'home'), file: 'benefit-ops.jpg',      w: 1600, h: 900, glyph: G.operations,  label: 'Authorised trading partner', orient: 'right' },
  { dir: path.join(OUT, 'home'), file: 'industries-tall.jpg',  w: 700,  h: 1000,glyph: G.industries, label: 'Industries we serve',          orient: 'center' },
  { dir: path.join(OUT, 'home'), file: 'our-work-01.jpg',      w: 700,  h: 1000,glyph: G.process,    label: 'RFQ intake · mapping',         orient: 'center' },
  { dir: path.join(OUT, 'home'), file: 'our-work-02.jpg',      w: 700,  h: 700, glyph: G.services,   label: 'Warehouse · quality check',   orient: 'center' },
  { dir: path.join(OUT, 'home'), file: 'our-work-03.jpg',      w: 700,  h: 700, glyph: G.about,      label: 'UAE delivery · after-sales',  orient: 'center' },
  { dir: path.join(OUT, 'home'), file: 'gallery-services.jpg', w: 700,  h: 700, glyph: G.services,   label: 'Services & logistics',        orient: 'center' },
];

(async () => {
  for (const j of jobs) {
    if (!fs.existsSync(j.dir)) fs.mkdirSync(j.dir, { recursive: true });
    const svg = compose(j);
    const out = path.join(j.dir, j.file);
    await sharp(Buffer.from(svg), { density: 140 })
      .resize(j.w, j.h)
      .jpeg({ quality: 84, mozjpeg: true, progressive: true })
      .toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log('wrote', path.relative(OUT, out), kb + 'KB');
  }
})().catch(e => { console.error(e); process.exit(1); });
