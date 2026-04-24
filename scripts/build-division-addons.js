/**
 * Injects the "Related divisions" strip + a division-specific FAQ
 * section (with FAQPage JSON-LD schema) into each of the 9 division
 * pages, right before </main>.  Idempotent — if the markers are
 * already present, the script replaces the block in place instead
 * of duplicating.
 *
 * M1 + M2 from the audit roadmap.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'divisions');

const NAMES = {
  'scientific-lab':    'Scientific &amp; Lab Instrumentation',
  'mechanical':        'Mechanical Items',
  'electrical':        'Electrical',
  'instrumentation':   'Instrumentation',
  'building-material': 'Building Material',
  'chemicals-power':   'Chemicals &amp; Power',
  'heavy-equipment':   'Heavy Equipment &amp; Spares',
  'road-safety':       'Road &amp; Industrial Safety',
  'office-equipment':  'Office Equipment &amp; Stationery'
};

const BLURBS = {
  'scientific-lab':    'Analytical instruments, glassware and reagents from Fisher Scientific &amp; Merck.',
  'mechanical':        'Valves, flanges, bolts, compressor spares and lifting gear.',
  'electrical':        'HV &amp; MV motors, switchgear, circuit breakers and cables.',
  'instrumentation':   'Meteorological sensors, level switches and environmental monitoring.',
  'building-material': 'Civil Defence-approved fire doors, wood doors and joinery.',
  'chemicals-power':   'Petroleum production chemicals, DC/AC power supplies and UPS.',
  'heavy-equipment':   'Caterpillar &amp; Komatsu earth-movers and compressor rebuild spares.',
  'road-safety':       'Barriers, cones, fall-arrest harnesses and lifting/lashing kit.',
  'office-equipment':  '20,000+ SKU office catalogue — 3M, Brother, Leitz, Fellowes, PaperOne.'
};

/* Cross-sell map — each division links to 2-3 naturally-paired ones */
const RELATED = {
  'electrical':        ['chemicals-power', 'instrumentation', 'mechanical'],
  'mechanical':        ['heavy-equipment', 'electrical', 'road-safety'],
  'scientific-lab':    ['instrumentation', 'chemicals-power'],
  'instrumentation':   ['scientific-lab', 'electrical', 'chemicals-power'],
  'building-material': ['road-safety', 'office-equipment', 'heavy-equipment'],
  'chemicals-power':   ['electrical', 'instrumentation', 'scientific-lab'],
  'heavy-equipment':   ['mechanical', 'building-material', 'road-safety'],
  'road-safety':       ['building-material', 'heavy-equipment', 'mechanical'],
  'office-equipment':  ['building-material', 'road-safety']
};

/* Per-division FAQs. 3-5 questions each, division-specific.  Strings
   are HTML-safe (escape & as &amp;). */
const FAQS = {
  'electrical': [
    ['What voltage ranges does Goodway supply?',
     'We cover low-voltage distribution, medium-voltage (up to 11 kV) and high-voltage motors from ABB, WEG, Westinghouse, Baldor, Brook Crompton and Marathon Electric. Switchgear up to 33 kV through ABB, Siemens and Merlin Gerin.'],
    ['What is the typical lead time on an HV motor?',
     'Stocked frame sizes ship within 2 weeks. Custom-wound or large-frame HV motors are typically 8&ndash;14 weeks ex-works, plus 1&ndash;2 weeks consolidation to the UAE. We quote firm lead times on every enquiry.'],
    ['Do you supply explosion-protected electrical fixtures?',
     'Yes &mdash; Cooper Crouse-Hinds is our authorised channel for Zone 1 / Zone 2 Ex-proof lighting, junction boxes and safety switches. Certification paperwork (ATEX, IECEx) ships with every order.'],
    ['Can you handle motor rebuilds?',
     'We coordinate rebuilds with the original principal. For on-site rebuild support, speak to our technical desk &mdash; we match the serial number to the right OEM facility and manage the logistics both ways.']
  ],
  'mechanical': [
    ['Which compressor OEMs does Goodway support?',
     'Over 55 compressor OEMs, including Atlas Copco, Ingersoll Rand, Sulzer, Cummins, Waukesha, Aerzen, Howden and Worthington. We source new spares, rebuild kits and obsolete parts with documented pedigree.'],
    ['Do you supply ASME / ASTM certified valves and flanges?',
     'Yes &mdash; all flanges, valves and pressure-rated fittings ship with ASME/ASTM material certificates and mill test reports where applicable.'],
    ['Can you match obsolete compressor serial numbers?',
     'Yes. Send the serial number and nameplate photo to <a href="../contact.html#quote">Request a Quote</a>; we trace the original OEM drawing and source matching or equivalent spares.'],
    ['Do you supply lifting and lashing gear certified to LOLER?',
     'Yes &mdash; slings, shackles, chain blocks and lashing kits are supplied with LOLER test certificates. We can arrange periodic inspection through our UAE partners.']
  ],
  'scientific-lab': [
    ['Do lab instruments come with calibration certificates?',
     'Yes &mdash; every calibration-grade instrument (analytical balances, spectrophotometers, pH meters, digital hydrometers) ships with a traceable certificate from the principal, ISO 17025-referenced where applicable.'],
    ['How do you handle temperature-sensitive reagents in UAE transit?',
     'Merck and Fisher Scientific cold-chain items ship refrigerated via our UAE freight partners with temperature loggers. We reject any delivery that breaks the chain and reorder.'],
    ['Can you supply full laboratory fit-outs?',
     'Yes &mdash; bench systems, fume hoods, analytical benches, ovens, centrifuges and consumables can be quoted as a single project package with installation coordination.'],
    ['What is the typical lead time for Fisher Scientific items?',
     'Catalogue items are typically 3&ndash;6 weeks ex-UK; specialist reagents can be 6&ndash;10 weeks depending on lot availability. Urgent chemistry is often air-freighted.']
  ],
  'instrumentation': [
    ['Which meteorological instrument brands does Goodway supply?',
     'Primary principals are Efftec (Australia) for hi-tech environmental monitoring and ATMI (France) for level switches and process instruments. We also source ABB, WIKA and Foxboro under adjacent divisions.'],
    ['Do your instruments come with calibration certificates?',
     'Yes &mdash; every primary measurement instrument ships with a factory calibration certificate. Field re-calibration after install can be arranged through UAE ISO-accredited labs.'],
    ['Can you supply full environmental monitoring stations?',
     'Yes &mdash; weather stations, air-quality monitoring skids, effluent monitoring and data-logger integration can be supplied as a turnkey package, including masts and SCADA cabling.'],
    ['What is the typical lead time for level switches?',
     'ATMI level switches are typically 4&ndash;8 weeks ex-France. Stocked models for common process tanks ship within 2 weeks.']
  ],
  'building-material': [
    ['Are your fire doors certified to NFPA 80?',
     'Yes &mdash; every fire-rated steel door in our catalogue is tested to NFPA 80 standards and approved by UAE Civil Defence. Fire ratings available range from &frac12;h to 2h; gauge options are 20, 18 or 16.'],
    ['Do you handle Civil Defence approval paperwork?',
     'Yes &mdash; every fire-door delivery includes the Civil Defence approval letter, NFPA 80 test certificate, Certificate of Conformity and manufacturer warranty. We coordinate directly with the consultant or Civil Defence office when requested.'],
    ['Can you supply complete door packages (frame, hardware, seals)?',
     'Yes &mdash; pre-hung door assemblies (leaf, frame, intumescent seals, vision panel, approved door closer, ironmongery) are quoted and shipped as one SKU. Site installation is coordinated with approved fit-out contractors.'],
    ['What is the typical project lead time?',
     '4&ndash;8 weeks ex-works for fire-rated steel doors, plus ~2 weeks consolidation to the UAE. Fast-track stocked options available for common sizes and ratings.']
  ],
  'chemicals-power': [
    ['Do you supply MSDS and SDS documentation?',
     'Yes &mdash; every chemical shipment includes the current SDS (GHS-compliant), Certificate of Analysis and ADNOC-compatible transit paperwork. UAE Civil Defence approval letters are issued for classified hazardous chemistries.'],
    ['Are the chemicals you supply ADNOC-approved?',
     'REP and Arbochim petroleum production chemistries are ADNOC-approved or registered for upstream and downstream use. Specific approvals vary by chemistry &mdash; we confirm against the current ADNOC vendor list on each enquiry.'],
    ['What voltage options are available on AEES power supplies?',
     'AEES supplies rectifier systems from 24 V DC up to 220 V DC and AC UPS from 2 kVA to 400 kVA. Custom redundancy (N+1, 2N) and battery bank sizing are specified per installation.'],
    ['Do you supply batteries for DC power systems?',
     'Yes &mdash; Yuasa sealed lead-acid batteries are our authorised line. We size the bank to the rectifier and inverter, supply the battery cabinet, and coordinate commissioning.']
  ],
  'heavy-equipment': [
    ['Can you source obsolete Caterpillar or Komatsu parts?',
     'Yes &mdash; our OEM network includes obsolete-parts tracing for older Caterpillar and Komatsu models. Send the machine model + serial number and we quote against the current parts availability list.'],
    ['Do you supply new earth-moving equipment or only spares?',
     'Both. New equipment is sourced direct from Caterpillar, Komatsu and approved UAE dealers. Refurbished machines are supplied with service history and warranty terms documented.'],
    ['What is the typical lead time for compressor rebuild parts?',
     '2&ndash;6 weeks for Atlas Copco, Ingersoll Rand and Cummins common spares. Obsolete or large-frame parts can be 8&ndash;12 weeks depending on OEM availability.'],
    ['Do you supply parts for Cummins, Atlas Copco and Waukesha engines?',
     'Yes &mdash; over 55 compressor and engine OEMs are covered including Cummins, Atlas Copco, Ingersoll Rand, Waukesha, Aerzen and Worthington. Serial-number matching is standard on every enquiry.']
  ],
  'road-safety': [
    ['Are your road barriers UAE Ministry of Interior approved?',
     'Yes &mdash; road-safety barriers, cones and delineators in our catalogue meet UAE Ministry of Interior and municipal specifications. Reflective-grade materials ship with conformity certificates.'],
    ['Do you supply certified fall-arrest and PPE systems?',
     'Yes &mdash; full-body harnesses, lanyards, self-retracting lifelines and anchor points are EN 361 / EN 362 certified. Training and inspection services can be arranged through UAE-approved partners.'],
    ['What is the typical delivery window?',
     'Stocked road-safety items (cones, barriers, reflective vests) ship within 1 week in the UAE. Custom-branded or specialty PPE is 2&ndash;4 weeks depending on the principal.'],
    ['Do you carry CE-certified PPE?',
     'Yes &mdash; PPE items carry CE or UKCA marking with the relevant EN standard. We can supply the full declaration of conformity on every order.']
  ],
  'office-equipment': [
    ['What is your typical lead time on stationery?',
     'Stocked items (paper, pens, files, binder clips) ship within 1&ndash;3 working days in the UAE. Branded or specialist items (Casio calculators, Brother label makers, Leitz archival systems) are typically 1&ndash;3 weeks.'],
    ['Can you set up recurring stationery orders?',
     'Yes &mdash; monthly, quarterly or back-to-office seasonal replenishment can be run against a blanket purchase order with VAT-compliant invoicing under TRN 100464283900003.'],
    ['Which paper and print brands do you stock?',
     'PaperOne premium reams are our primary paper line. Print consumables cover Brother, HP, Canon and Epson genuine cartridges and toners.'],
    ['What brands are in the office-equipment catalogue?',
     '3M, Brother, Avery, Leitz, Rexel, Durable, Casio, Kangaro, Zebra, Fellowes, GBC, UHU, Pukka Pad, PaperOne &mdash; 20,000+ SKUs across all categories.']
  ]
};

function escapeJson(s) {
  /* SDOH-safe: HTML entities have to be decoded back to their text
     for JSON-LD (schema.org doesn't parse &mdash;). */
  return String(s)
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&frac12;/g, '½')
    .replace(/&ndash;/g, '–')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function block(slug) {
  const related = RELATED[slug] || [];
  const faqs = FAQS[slug] || [];

  const relatedCards = related.map(r =>
    `        <a class="gw-related-card" href="../divisions/${r}.html">
          <h3 class="gw-related-card__title">${NAMES[r]}</h3>
          <p class="gw-related-card__body">${BLURBS[r]}</p>
          <span class="gw-chip-link">See division →</span>
        </a>`).join('\n');

  const faqItems = faqs.map(([q, a]) =>
    `        <details class="gw-faq-item">
          <summary class="gw-faq-item__q">${q}</summary>
          <div class="gw-faq-item__a">${a}</div>
        </details>`).join('\n');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: escapeJson(q),
      acceptedAnswer: { '@type': 'Answer', text: escapeJson(a) }
    }))
  };

  return `
  <!-- GW-DIV-ADDONS-START -->
  <section class="gw-block gw-block--ivory gw-related-divisions" aria-labelledby="related-${slug}">
    <div class="container">
      <header class="gw-block__header">
        <div class="gw-block__eyebrow">// Related divisions</div>
        <h2 id="related-${slug}" class="gw-block__title">Other divisions you often pair with.</h2>
        <p class="gw-block__lede">Procurement rarely stops at one product family — these are the divisions buyers of <em>${NAMES[slug]}</em> return to most.</p>
      </header>
      <div class="gw-related-grid gw-u-mt-32">
${relatedCards}
      </div>
    </div>
  </section>

  <section class="gw-block gw-block--linen gw-division-faq" aria-labelledby="faq-${slug}">
    <div class="container">
      <header class="gw-block__header">
        <div class="gw-block__eyebrow">// Frequently asked</div>
        <h2 id="faq-${slug}" class="gw-block__title">Questions we hear most about ${NAMES[slug]}.</h2>
      </header>
      <div class="gw-faq-list gw-u-mt-32">
${faqItems}
      </div>
    </div>
  </section>
  <script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
  </script>
  <!-- GW-DIV-ADDONS-END -->
`;
}

let patched = 0;
for (const slug of Object.keys(NAMES)) {
  const file = path.join(DIR, slug + '.html');
  if (!fs.existsSync(file)) { console.warn('!! missing', slug + '.html'); continue; }
  let html = fs.readFileSync(file, 'utf8');

  /* Idempotent: strip any previous addon block so rerunning is safe */
  html = html.replace(/\n\s*<!-- GW-DIV-ADDONS-START -->[\s\S]*?<!-- GW-DIV-ADDONS-END -->\n/, '');

  /* Inject before </main> */
  const injected = html.replace(/(\s*<\/main>)/, block(slug) + '$1');
  if (injected === html) { console.warn('!! no </main> found in', slug); continue; }
  fs.writeFileSync(file, injected);
  patched++;
  console.log('  ✓', slug + '.html', '— ' + FAQS[slug].length + ' FAQs + ' + (RELATED[slug] || []).length + ' related');
}
console.log('\npatched', patched, 'division pages');
