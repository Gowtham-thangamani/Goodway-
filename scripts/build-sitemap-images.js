#!/usr/bin/env node
/**
 * Goodway — sitemap-images.xml generator
 *
 * Walks /assets/images/, resolves each asset's alt text from alt-text.yml,
 * maps it to the page URL where it is featured, and emits a Google-spec
 * image sitemap to stdout.
 *
 * Usage:
 *   node scripts/build-sitemap-images.js > sitemap-images.xml
 *
 * No runtime deps beyond Node's stdlib — we hand-parse the YAML subset
 * we use (key: value, key: "value with spaces") so the script runs in CI
 * without an `npm install`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(SITE_ROOT, 'assets', 'images');
const ALT_TEXT_YML = path.join(IMAGES_ROOT, 'alt-text.yml');
const PUBLIC_BASE = 'https://goodway.ae';

/* --------------------------------------------------------------
   Minimal YAML reader — handles the exact shape of alt-text.yml
   (list of maps, each with `file:` and `alt:`). Inline-object
   form `{ file: a, alt: b }` is also supported.
   -------------------------------------------------------------- */
function readAltText(yamlPath) {
  const raw = fs.readFileSync(yamlPath, 'utf8');
  const map = {};
  let currentFile = null;
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.trimStart().startsWith('#')) continue;

    // Inline object: - { file: path, alt: "value" }
    const inline = line.match(/^\s*-\s*\{\s*file:\s*([^,}\s]+)\s*,\s*alt:\s*"([^"]*)"\s*\}\s*$/);
    if (inline) {
      map[inline[1]] = inline[2];
      continue;
    }
    // Block list start: "- file: path"
    const listFile = line.match(/^\s*-\s*file:\s*(.+?)\s*$/);
    if (listFile) {
      currentFile = listFile[1].replace(/^["']|["']$/g, '');
      continue;
    }
    // "alt: ..." continuation
    const altMatch = line.match(/^\s*alt:\s*(.*)\s*$/);
    if (altMatch && currentFile) {
      let alt = altMatch[1].trim();
      if ((alt.startsWith('"') && alt.endsWith('"')) ||
          (alt.startsWith("'") && alt.endsWith("'"))) {
        alt = alt.slice(1, -1);
      }
      map[currentFile] = alt;
      currentFile = null;
    }
  }
  return map;
}

/* --------------------------------------------------------------
   Map an image's folder path to the page(s) where it's featured.
   -------------------------------------------------------------- */
function pageUrlForImage(relPath) {
  // relPath is "hero/hero-home-catalogue-shelf.webp" etc.
  const first = relPath.split('/')[0];

  if (first === 'hero') {
    const slug = path.basename(relPath).replace(/\.[a-z]+$/, '');
    if (slug.startsWith('hero-home-'))              return '/';
    if (slug.startsWith('hero-about-'))             return '/about.html';
    if (slug.startsWith('hero-contact-'))           return '/contact.html';
    if (slug.startsWith('hero-quote-'))             return '/request-a-quote.html';
    if (slug.startsWith('hero-brands-'))            return '/principals.html';
    if (slug.startsWith('hero-office-supplies-'))   return '/services.html';
    if (slug.startsWith('hero-office-equipment-'))  return '/services.html';
    if (slug.startsWith('hero-printing-gifts-'))    return '/services.html';
    if (slug.startsWith('hero-stationery-essentials-')) return '/divisions/office-equipment.html';
    if (slug.startsWith('hero-visual-communication-'))  return '/divisions/office-equipment.html';
    if (slug.startsWith('hero-404-'))               return '/404.html';
    if (slug.startsWith('hero-401-'))               return '/401.html';
    return '/';
  }

  if (first === 'logo')                             return '/';
  if (first === 'office-supplies')                  return '/services.html';
  if (first === 'office-equipment')                 return '/divisions/office-equipment.html';
  if (first === 'printing-gifts')                   return '/services.html';
  if (first === 'brands')                           return '/principals.html';
  if (first === 'company' || first === 'team')      return '/about.html';
  if (first === 'testimonials')                     return '/';
  if (first === 'catalogue')                        return '/';
  if (first === 'social') {
    const page = path.basename(relPath).replace(/^og-/, '').replace(/\.(jpg|webp|avif)$/, '');
    if (page === 'default' || page === 'home')      return '/';
    if (page === 'office-supplies' || page === 'office-equipment' || page === 'printing-gifts') return '/services.html';
    if (page === 'brands')                          return '/principals.html';
    return `/${page}.html`;
  }
  // icons, backgrounds, favicon — not worth indexing
  return null;
}

/* --------------------------------------------------------------
   Walk all image files that should be in the sitemap.
   -------------------------------------------------------------- */
function walk(dir, baseDir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, baseDir));
    } else if (/\.(webp|avif|jpg|jpeg|png|svg)$/i.test(entry.name)) {
      // Skip responsive-width variants — list only the canonical base file.
      if (/-\d{3,4}\.(webp|avif|jpg|jpeg|png)$/i.test(entry.name)) continue;
      // Skip favicon family
      if (/favicon/.test(full)) continue;
      out.push(path.relative(baseDir, full).replace(/\\/g, '/'));
    }
  }
  return out;
}

/* --------------------------------------------------------------
   Build XML
   -------------------------------------------------------------- */
function xmlEscape(s) {
  return String(s).replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]));
}

function main() {
  if (!fs.existsSync(IMAGES_ROOT)) {
    console.error('No /assets/images/ directory found.');
    process.exit(1);
  }
  const altMap = fs.existsSync(ALT_TEXT_YML) ? readAltText(ALT_TEXT_YML) : {};
  const files  = walk(IMAGES_ROOT, IMAGES_ROOT);

  // Group images by page URL
  const byPage = new Map();
  for (const f of files) {
    const pageUrl = pageUrlForImage(f);
    if (!pageUrl) continue;
    if (!byPage.has(pageUrl)) byPage.set(pageUrl, []);
    byPage.get(pageUrl).push(f);
  }

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');

  for (const [pageUrl, imgs] of [...byPage.entries()].sort()) {
    lines.push('  <url>');
    lines.push(`    <loc>${PUBLIC_BASE}${pageUrl}</loc>`);
    for (const img of imgs) {
      const alt = altMap[img] || '';
      const imgLoc = `${PUBLIC_BASE}/assets/images/${img}`;
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${xmlEscape(imgLoc)}</image:loc>`);
      if (alt) {
        lines.push(`      <image:title>${xmlEscape(alt)}</image:title>`);
        lines.push(`      <image:caption>${xmlEscape(alt)}</image:caption>`);
      }
      lines.push('    </image:image>');
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  process.stdout.write(lines.join('\n') + '\n');
}

main();
