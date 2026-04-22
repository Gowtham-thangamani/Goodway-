const express = require('express');
const { db, logAudit } = require('../db');
const { ensureCsrf, verifyCsrf } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['new', 'in_progress', 'quoted', 'won', 'lost', 'archived'];

router.get('/', ensureCsrf, function (req, res) {
  const status = STATUSES.includes(req.query.status) ? req.query.status : 'all';
  const q = (req.query.q || '').trim();

  const where = [];
  const args = {};
  if (status !== 'all') { where.push('status = @status'); args.status = status; }
  if (q) {
    where.push('(name LIKE @q OR company LIKE @q OR email LIKE @q OR spec LIKE @q)');
    args.q = '%' + q + '%';
  }
  const sql = `SELECT id, received_at, name, company, email, phone, sector, division, status
               FROM quotes
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY received_at DESC
               LIMIT 500`;
  const rows = db.prepare(sql).all(args);
  const counts = {};
  db.prepare('SELECT status, COUNT(*) AS n FROM quotes GROUP BY status').all()
    .forEach(r => { counts[r.status] = r.n; });
  res.render('quotes/list', { rows, counts, status, q, statuses: STATUSES, active: 'quotes' });
});

router.get('/export.csv', function (_req, res) {
  const rows = db.prepare('SELECT * FROM quotes ORDER BY received_at DESC').all();
  const cols = ['id','received_at','name','company','email','phone','sector','division','location','timeline','spec','source','status'];
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  const csv = cols.join(',') + '\n' +
    rows.map(r => cols.map(c => esc(r[c])).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="goodway-quotes-' + new Date().toISOString().slice(0,10) + '.csv"');
  res.send(csv);
});

router.get('/:id', ensureCsrf, function (req, res) {
  const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).render('error', { code: 404, msg: 'Not found', active: '' });
  res.render('quotes/detail', { row, statuses: STATUSES, active: 'quotes' });
});

router.post('/:id/status', ensureCsrf, verifyCsrf, function (req, res) {
  const status = STATUSES.includes(req.body.status) ? req.body.status : 'new';
  const r = db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, req.params.id);
  if (r.changes) logAudit(req.session.user.username, 'status:' + status, 'quote', req.params.id, null);
  req.session.flash = [{ kind: 'success', msg: 'Status → ' + status }];
  res.redirect('/admin/quotes/' + req.params.id);
});

router.post('/:id/delete', ensureCsrf, verifyCsrf, function (req, res) {
  db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  logAudit(req.session.user.username, 'delete', 'quote', req.params.id, null);
  req.session.flash = [{ kind: 'success', msg: 'Lead deleted.' }];
  res.redirect('/admin/quotes');
});

module.exports = router;
