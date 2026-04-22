const express = require('express');
const { logAudit } = require('../db');
const { ensureCsrf, verifyCsrf } = require('../middleware/auth');
const { rebuildAll } = require('../scripts/build-pages');

const router = express.Router();

router.get('/', ensureCsrf, function (_req, res) {
  res.render('publish', { last: null, active: 'publish' });
});

router.post('/', ensureCsrf, verifyCsrf, function (req, res) {
  try {
    const result = rebuildAll();
    logAudit(req.session.user.username, 'publish', 'site', null,
             'principals=' + result.principalsWritten + ' sectors=' + result.sectorsWritten);
    req.session.flash = [{
      kind: 'success',
      msg: 'Published. principals.html (' + result.principalsWritten + ' brands) and industries.html (' + result.sectorsWritten + ' sectors) regenerated.'
    }];
  } catch (e) {
    console.error(e);
    req.session.flash = [{ kind: 'error', msg: 'Publish failed: ' + e.message }];
  }
  res.redirect('/admin/publish');
});

module.exports = router;
