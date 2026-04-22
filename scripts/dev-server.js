/**
 * Zero-dep dev server for the static site.
 * - Serves files from the site root at http://localhost:3030
 * - Auto-reloads the browser on file change via SSE
 * Run: `npm run dev`  (from site/)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.DEV_PORT, 10) || 3030;
const WATCH_DIRS = ['css', 'js', 'images'].map(d => path.join(ROOT, d));
const WATCH_EXT = /\.(html|css|js|svg|png|jpg|webp|avif)$/i;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

const clients = new Set();
function broadcast(event) {
  for (const res of clients) {
    try { res.write('event: ' + event + '\ndata: ' + Date.now() + '\n\n'); } catch (e) {}
  }
}

/* Watch for file changes, debounce, broadcast reload */
let reloadTimer = null;
function triggerReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => broadcast('reload'), 80);
}

function watch(dir) {
  try {
    fs.watch(dir, { recursive: true }, function (_evt, filename) {
      if (filename && WATCH_EXT.test(filename)) triggerReload();
    });
  } catch (e) { console.warn('watch failed for ' + dir + ':', e.message); }
}
[ROOT, ...WATCH_DIRS].forEach(watch);

/* Inject a tiny SSE reload snippet into HTML responses */
const LIVE_SNIPPET = '\n<script>(function(){try{var es=new EventSource("/_dev/reload");es.addEventListener("reload",function(){location.reload();});}catch(e){}})();</script>';

function send(res, code, headers, body) {
  res.writeHead(code, headers);
  res.end(body);
}

const server = http.createServer(function (req, res) {
  /* SSE endpoint */
  if (req.url === '/_dev/reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write(':hello\n\n');
    clients.add(res);
    req.on('close', function () { clients.delete(res); });
    return;
  }

  /* Resolve path */
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const full = path.resolve(ROOT, '.' + urlPath);
  if (!full.startsWith(ROOT)) return send(res, 403, {}, 'forbidden');

  fs.stat(full, function (err, stat) {
    if (err || !stat.isFile()) return send(res, 404, { 'Content-Type': 'text/html' }, '<h1>404</h1>');
    const ext = path.extname(full).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    if (ext === '.html') {
      fs.readFile(full, 'utf8', function (err2, data) {
        if (err2) return send(res, 500, {}, 'read failed');
        const withLive = data.replace(/<\/body>/i, LIVE_SNIPPET + '</body>');
        send(res, 200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' }, withLive);
      });
    } else {
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(full).pipe(res);
    }
  });
});

server.listen(PORT, function () {
  console.log('\n  Dev server: http://localhost:' + PORT);
  console.log('  Live-reload: active (watching ' + WATCH_DIRS.length + ' folders + root)\n');
});
