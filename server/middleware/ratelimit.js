/**
 * Tiny in-memory sliding-window rate limiter. Zero deps.
 * Good enough for single-process prod + dev. Swap for Redis if you scale out.
 *
 *   usage:
 *     const rate = require('./middleware/ratelimit');
 *     app.post('/api/leads', rate({ max: 5, windowMs: 60_000 }), handler);
 */
const buckets = new Map();

function prune(now) {
  for (const [key, hits] of buckets) {
    const fresh = hits.filter(t => t > now);
    if (fresh.length) buckets.set(key, fresh);
    else buckets.delete(key);
  }
}

function keyOf(req) {
  return (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || 'unknown')
    .toString().split(',')[0].trim();
}

module.exports = function rateLimit(opts) {
  const max = (opts && opts.max) || 30;
  const windowMs = (opts && opts.windowMs) || 60_000;
  const message = (opts && opts.message) || 'Too many requests. Try again in a minute.';
  let lastPrune = Date.now();
  return function (req, res, next) {
    const now = Date.now();
    if (now - lastPrune > 10_000) { prune(now); lastPrune = now; }

    const key = (opts.keyBy ? opts.keyBy(req) : keyOf(req));
    const windowStart = now - windowMs;
    const hits = (buckets.get(key) || []).filter(t => t > windowStart);
    hits.push(now + windowMs); // store expiry, not entry time — simplifies prune
    buckets.set(key, hits);

    if (hits.length > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      if (req.accepts('html') && !req.is('json')) {
        return res.status(429).send(
          '<!doctype html><html><body style="font-family:system-ui;padding:40px;max-width:520px;margin:auto;">' +
          '<h1>Too many requests</h1><p>' + message + '</p></body></html>'
        );
      }
      return res.status(429).json({ ok: false, error: 'rate_limited', message });
    }
    next();
  };
};
