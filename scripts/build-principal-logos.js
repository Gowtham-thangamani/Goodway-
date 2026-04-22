/**
 * Generate hand-crafted SVG placeholders for each principal, mirroring
 * the brand's visual identity (glyph + typography + palette) as closely
 * as possible with inline SVG. Drop-in official logos at the same path
 * to replace.
 *
 * Run:  node scripts/build-principal-logos.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'assets', 'images', 'principals');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function wrap(body, viewW = 320, viewH = 120, bg = 'transparent') {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + viewW + ' ' + viewH + '" width="' + viewW + '" height="' + viewH + '" role="img">',
    bg !== 'transparent' ? '  <rect width="' + viewW + '" height="' + viewH + '" fill="' + bg + '"/>' : '',
    body,
    '</svg>'
  ].filter(Boolean).join('\n');
}

const JK = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
const FR = "'Fraunces', Georgia, serif";

const logos = {
  /* AEES — thin swoosh above wide-tracked "AEES" */
  'aees': wrap(`
    <title>AEES</title>
    <path d="M40 52 Q 90 30 160 40 T 280 52" stroke="#0a1f3f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="42" cy="52" r="3.4" fill="#d94a3a"/>
    <text x="160" y="92" text-anchor="middle" font-family="${JK}" font-size="36" font-weight="700" fill="#0a1f3f" letter-spacing="0.32em">AEES</text>
    <text x="160" y="112" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">FRANCE</text>
  `),

  /* REP — stylized circular "rep" (Recherche Exploitation Produits) */
  'rep': wrap(`
    <title>REP · Recherche Exploitation Produits</title>
    <g transform="translate(24,18)">
      <circle cx="36" cy="36" r="34" fill="none" stroke="#1a2a4a" stroke-width="2"/>
      <text x="36" y="50" text-anchor="middle" font-family="${FR}" font-size="34" font-weight="700" font-style="italic" fill="#c0392b">rep</text>
    </g>
    <g transform="translate(115,30)">
      <text font-family="${JK}" font-size="15" font-weight="700" fill="#1a2a4a" letter-spacing="0.04em">Recherche</text>
      <text y="20" font-family="${JK}" font-size="15" font-weight="700" fill="#1a2a4a" letter-spacing="0.04em">Exploitation</text>
      <text y="40" font-family="${JK}" font-size="15" font-weight="700" fill="#1a2a4a" letter-spacing="0.04em">Produits</text>
      <text y="62" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">FRANCE</text>
    </g>
  `),

  /* Arbochim N.V. — three red droplets above bold wordmark */
  'arbochim': wrap(`
    <title>Arbochim N.V.</title>
    <g transform="translate(112,14)" fill="#d93a2a">
      <path d="M 14 0 C 6 18 0 30 14 32 C 28 30 22 18 14 0 Z"/>
      <path d="M 48 0 C 40 18 34 30 48 32 C 62 30 56 18 48 0 Z"/>
      <path d="M 82 0 C 74 18 68 30 82 32 C 96 30 90 18 82 0 Z"/>
    </g>
    <text x="160" y="85" text-anchor="middle" font-family="${JK}" font-size="28" font-weight="900" fill="#1a1a1a" letter-spacing="0.04em">ARBOCHIM</text>
    <text x="270" y="85" text-anchor="start" font-family="${JK}" font-size="16" font-weight="700" fill="#6b7488"> N.V.</text>
    <text x="160" y="106" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">BELGIUM</text>
  `),

  /* Lütze — stylised wordmark with angled "Z" arrow */
  'lutze': wrap(`
    <title>Lütze · Systematic Technology</title>
    <g transform="translate(40,28)">
      <text font-family="${JK}" font-size="36" font-weight="800" fill="#004080" letter-spacing="0.06em">LÜTZE</text>
      <path d="M 164 4 L 178 22 L 164 40 L 172 22 Z" fill="#e30613"/>
    </g>
    <text x="160" y="98" text-anchor="middle" font-family="${JK}" font-size="11" font-weight="600" fill="#004080" letter-spacing="0.08em" font-style="italic">Systematic Technology</text>
    <text x="160" y="112" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">GERMANY</text>
  `),

  /* Fisher Scientific — circled F + italic wordmark */
  'fisher-scientific': wrap(`
    <title>Fisher Scientific</title>
    <g transform="translate(34,38)">
      <circle cx="22" cy="22" r="22" fill="none" stroke="#0c4da2" stroke-width="2.4"/>
      <text x="22" y="31" text-anchor="middle" font-family="${FR}" font-size="28" font-weight="700" font-style="italic" fill="#0c4da2">f</text>
    </g>
    <text x="90" y="62" font-family="${FR}" font-size="22" font-weight="700" font-style="italic" fill="#0c4da2" letter-spacing="0.01em">Fisher Scientific</text>
    <text x="90" y="80" font-family="${JK}" font-size="8" font-weight="600" fill="#fbc02d" letter-spacing="0.22em">UNITED KINGDOM</text>
  `),

  /* MERCK — blocky modern wordmark with cyan slab */
  'merck': wrap(`
    <title>Merck</title>
    <rect x="24" y="40" width="6" height="40" fill="#ea5b2f"/>
    <text x="44" y="77" font-family="${JK}" font-size="42" font-weight="800" fill="#0093b2" letter-spacing="0.02em">MERCK</text>
    <text x="44" y="96" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">GERMANY</text>
  `),

  /* Cooper Crouse-Hinds — bold COOPER + small Crouse-Hinds */
  'cooper-crouse-hinds': wrap(`
    <title>Cooper Crouse-Hinds</title>
    <text x="160" y="60" text-anchor="middle" font-family="${JK}" font-size="30" font-weight="900" fill="#c8102e" letter-spacing="0.04em">COOPER</text>
    <line x1="60" y1="72" x2="260" y2="72" stroke="#1a1a1a" stroke-width="1.2"/>
    <text x="160" y="92" text-anchor="middle" font-family="${JK}" font-size="14" font-weight="500" fill="#1a1a1a" letter-spacing="0.06em">Crouse-Hinds</text>
    <text x="160" y="108" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">USA</text>
  `),

  /* Yuasa — bold black block with red accent stripes */
  'yuasa': wrap(`
    <title>Yuasa</title>
    <g transform="translate(70,24)">
      <rect x="0" y="0" width="18" height="40" fill="#1a1a1a"/>
      <rect x="22" y="0" width="18" height="40" fill="#1a1a1a"/>
      <rect x="44" y="0" width="18" height="40" fill="#1a1a1a"/>
      <path d="M 4 4 L 14 4 L 14 14 L 4 14 Z M 26 4 L 36 4 L 36 14 L 26 14 Z M 48 4 L 58 4 L 58 14 L 48 14 Z" fill="#e30613"/>
    </g>
    <text x="160" y="90" text-anchor="middle" font-family="${JK}" font-size="30" font-weight="900" fill="#e30613" letter-spacing="0.12em">YUASA</text>
    <text x="160" y="108" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">JAPAN</text>
  `),

  /* Westinghouse — W in circle + serif wordmark */
  'westinghouse': wrap(`
    <title>Westinghouse</title>
    <g transform="translate(26,34)">
      <circle cx="22" cy="22" r="22" fill="#00708a"/>
      <path d="M 10 12 L 16 32 L 22 18 L 28 32 L 34 12" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="82" y="62" font-family="${FR}" font-size="22" font-weight="500" fill="#00708a" letter-spacing="0.005em">Westinghouse</text>
    <text x="82" y="82" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">USA</text>
  `),

  /* ATMI — bold red with angled stroke */
  'atmi': wrap(`
    <title>ATMI</title>
    <g transform="translate(84,30)">
      <path d="M 0 46 L 26 0 L 52 46 L 42 46 L 26 18 L 10 46 Z" fill="#b70c18"/>
      <text x="76" y="38" font-family="${JK}" font-size="40" font-weight="900" fill="#b70c18" letter-spacing="0.04em">TMI</text>
    </g>
    <text x="160" y="98" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">FRANCE · LEVEL SWITCHES</text>
  `),

  /* efftec — italic lowercase script with gold underline */
  'efftec': wrap(`
    <title>Efftec · Efficiency Technologies Australia</title>
    <text x="160" y="62" text-anchor="middle" font-family="${FR}" font-size="42" font-weight="500" font-style="italic" fill="#b1832c" letter-spacing="-0.01em">efftec</text>
    <line x1="100" y1="72" x2="220" y2="72" stroke="#b1832c" stroke-width="1.4"/>
    <text x="160" y="90" text-anchor="middle" font-family="${JK}" font-size="9" font-weight="600" fill="#1a1a1a" letter-spacing="0.18em">EFFICIENCY TECHNOLOGIES</text>
    <text x="160" y="108" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#6b7488" letter-spacing="0.22em">AUSTRALIA</text>
  `, 320, 120),

  /* McMaster-Carr — yellow on black, block letters */
  'mcmaster-carr': wrap(`
    <title>McMaster-Carr</title>
    <rect width="320" height="120" fill="#000"/>
    <text x="160" y="66" text-anchor="middle" font-family="${JK}" font-size="30" font-weight="900" fill="#fff100" letter-spacing="0.01em">McMASTER-CARR</text>
    <rect x="40" y="76" width="240" height="2" fill="#fff100"/>
    <text x="160" y="98" text-anchor="middle" font-family="${JK}" font-size="8" font-weight="600" fill="#fff100" letter-spacing="0.22em" opacity="0.7">INDUSTRIAL SUPPLY · USA</text>
  `, 320, 120)
};

for (const [slug, svg] of Object.entries(logos)) {
  const out = path.join(OUT, slug + '.svg');
  fs.writeFileSync(out, svg);
  console.log('wrote', slug + '.svg');
}
console.log('\nGenerated ' + Object.keys(logos).length + ' branded placeholders.');
console.log('Drop official logos at the same path with the same filename to swap.');
