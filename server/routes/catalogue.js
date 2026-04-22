/**
 * Catalogue-request endpoint. Site newsletter form POSTs to /api/catalogue,
 * we log the email + dispatch it to the notifier (so admin sees who asked).
 * If a PDF exists at ../assets/catalogue.pdf (relative to server/),
 * we redirect the user to its public URL; otherwise we return a friendly
 * "we'll email it to you" response.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { db, logAudit } = require('../db');
const { notifyNewLead } = require('../lib/notify');

const router = express.Router();

router.post('/', express.urlencoded({ extended: true }), async function (req, res) {
  const email = String((req.body && req.body.email) || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }
  /* Honeypot */
  if (req.body.website && String(req.body.website).trim()) {
    return res.json({ ok: true });
  }

  /* Store as a lead with source='catalogue' */
  try {
    const info = db.prepare(`
      INSERT INTO quotes (name, company, email, phone, sector, division, location, timeline, spec, source, ip, user_agent)
      VALUES ('Catalogue request', '', @email, '', NULL, NULL, NULL, NULL, 'Requested the principal/product catalogue.', 'catalogue', @ip, @ua)
    `).run({
      email,
      ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim(),
      ua: (req.headers['user-agent'] || '').toString().slice(0, 300)
    });
    notifyNewLead({
      id: info.lastInsertRowid,
      name: 'Catalogue request',
      email,
      spec: 'Requested the principal/product catalogue.'
    }).catch(function (e) { console.error('notify failed', e); });
    logAudit('anonymous', 'catalogue.request', 'lead', info.lastInsertRowid, email);
  } catch (e) {
    console.error('catalogue insert failed', e);
    return res.status(500).json({ ok: false, error: 'server' });
  }

  /* If a real PDF exists, send the URL back */
  const pdfPath = path.resolve(__dirname, '..', process.env.SITE_ROOT || '..', 'assets', 'catalogue.pdf');
  const hasPdf = fs.existsSync(pdfPath);
  return res.json({
    ok: true,
    message: hasPdf
      ? 'Thanks — opening the catalogue in a new tab.'
      : 'Thanks — we will email the catalogue within one business day.',
    url: hasPdf ? '/assets/catalogue.pdf' : null
  });
});

module.exports = router;
