const crypto = require('crypto');

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.accepts('html')) return res.redirect('/admin/login');
  return res.status(401).json({ ok: false, error: 'login required' });
}

function ensureCsrf(req, _res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  next();
}

function verifyCsrf(req, res, next) {
  const sent = (req.body && req.body._csrf) || req.get('x-csrf-token');
  if (!sent || sent !== req.session.csrf) {
    return res.status(403).render('error', { code: 403, msg: 'CSRF token mismatch — please refresh and retry.', active: '' });
  }
  next();
}

module.exports = { requireLogin, ensureCsrf, verifyCsrf };
