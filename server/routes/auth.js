const express = require('express');
const bcrypt = require('bcryptjs');
const { ensureCsrf, verifyCsrf } = require('../middleware/auth');
const { logAudit } = require('../db');

const router = express.Router();

router.get('/login', ensureCsrf, function (req, res) {
  if (req.session.user) return res.redirect('/admin');
  res.render('login', { active: '' });
});

router.post('/login', ensureCsrf, verifyCsrf, function (req, res) {
  const { username, password } = req.body;
  const EXPECT_USER = process.env.ADMIN_USERNAME || 'admin';
  const EXPECT_HASH = process.env.ADMIN_PASSWORD_HASH || '';
  if (!EXPECT_HASH) {
    req.session.flash = [{ kind: 'error', msg: 'Server not configured: ADMIN_PASSWORD_HASH is empty. Run `npm run set-password` first.' }];
    return res.redirect('/admin/login');
  }
  const ok = username === EXPECT_USER && bcrypt.compareSync(password || '', EXPECT_HASH);
  if (!ok) {
    logAudit('anonymous', 'login.fail', 'auth', null, 'user=' + String(username || '').slice(0, 40));
    req.session.flash = [{ kind: 'error', msg: 'Invalid credentials.' }];
    return res.redirect('/admin/login');
  }
  req.session.regenerate(function (err) {
    if (err) { console.error(err); return res.redirect('/admin/login'); }
    req.session.user = { username: EXPECT_USER, role: 'admin' };
    logAudit(EXPECT_USER, 'login.success', 'auth', null, null);
    req.session.flash = [{ kind: 'success', msg: 'Signed in as ' + EXPECT_USER + '.' }];
    res.redirect('/admin');
  });
});

router.post('/logout', function (req, res) {
  const user = req.session.user && req.session.user.username;
  if (user) logAudit(user, 'logout', 'auth', null, null);
  req.session.destroy(function () {
    res.clearCookie('gw_admin');
    res.redirect('/admin/login');
  });
});

module.exports = router;
