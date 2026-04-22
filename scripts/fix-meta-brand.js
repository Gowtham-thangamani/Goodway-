/**
 * One-shot: rewrite <meta name="description"> and <meta property="og:description">
 * on pages that don't explicitly carry the Goodway brand name.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// File → new description (keeps product detail, prepends/appends brand)
const MAP = {
  '401.html':        'Access denied — you do not have permission to view this page on the Goodway General Trading website.',
  '404.html':        'The page you are looking for does not exist on the Goodway General Trading website. Use the navigation to find what you need.',
  'divisions/building-material.html':  'Goodway supplies Civil Defence–approved fire-rated steel doors (NFPA 80), wood doors and full interior joinery across the UAE.',
  'divisions/chemicals-power.html':    'Goodway — authorised UAE distributor for petroleum production chemicals, water/gas treatment, DC/AC power supplies, emergency lighting and explosion-protected fixtures.',
  'divisions/electrical.html':         'Goodway supplies HV/MV electric motors, switchgear, circuit breakers, busway and industrial cables from ABB, WEG, Baldor, Westinghouse and more.',
  'divisions/heavy-equipment.html':    'Goodway — new and used heavy equipment and OEM-quality spare parts for Caterpillar, Komatsu, Atlas Copco, Ingersoll Rand, Waukesha, Cummins and more.',
  'divisions/instrumentation.html':    'Goodway supplies meteorological instrumentation — wind and pressure sensors, rain gauges, weather monitors, anemometers and programmable indicators.',
  'divisions/mechanical.html':         'Goodway supplies compressor spares, couplings, flanges, valves, bolts, lifting and lashing, road-safety equipment and heavy-equipment spares across the UAE.',
  'divisions/office-equipment.html':   'Goodway supplies over 20,000 stationery and office products from 3M, Brother, Avery, Leitz, Rexel, Durable, Casio, Kangaro, Zebra, Fellowes, GBC and more.',
  'divisions/road-safety.html':        'Goodway supplies road-safety barriers, cones, delineators, harnesses, fall-arrest systems, reflective gear and lifting/lashing equipment.',
  'divisions/scientific-lab.html':     'Goodway — authorised UAE supplier of temperature, pressure and specific-gravity measurement; laboratory instruments, analyzers and glassware.',
  'journal/civil-defence-fire-door-compliance.html': 'Goodway journal — UAE Civil Defence fire-door rules: what changed in 2022, what is audited on handover, and the four documents every BOQ should travel with.'
};

let patched = 0;
for (const [rel, desc] of Object.entries(MAP)) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { console.warn('skip (missing)', rel); continue; }
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + desc.replace(/"/g, '&quot;') + '">');
  s = s.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + desc.replace(/"/g, '&quot;') + '">');
  if (s !== before) {
    fs.writeFileSync(p, s);
    console.log('patched', rel);
    patched++;
  } else {
    console.log('no-op  ', rel);
  }
}
console.log('\nDone —', patched, 'files updated.');
