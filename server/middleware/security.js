/**
 * Small Helmet-alike: sets sane security headers without pulling the full
 * helmet package. Inline styles are allowed because the admin EJS templates
 * use a single external stylesheet + no inline scripts.
 */
module.exports = function security() {
  return function (_req, res, next) {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; '));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
};
