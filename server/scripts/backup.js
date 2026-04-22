/**
 * SQLite backup — uses the better-sqlite3 online backup API so it works
 * even while the server is running (WAL-safe).
 * Writes to data/backups/goodway-YYYY-MM-DD.db and prunes anything older
 * than BACKUP_RETENTION_DAYS (default 30).
 *
 * Cron (daily at 03:00):
 *   0 3 * * * cd /srv/goodway/server && /usr/bin/node scripts/backup.js >> data/backup.log 2>&1
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { db, DB_PATH } = require('../db');

const RETENTION = parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30;
const BACKUP_DIR = path.resolve(path.dirname(DB_PATH), 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const out = path.join(BACKUP_DIR, 'goodway-' + today + '.db');

async function main() {
  await db.backup(out);
  const { size } = fs.statSync(out);
  console.log('Backup OK:', out, '(' + (size / 1024).toFixed(1) + ' KB)');

  /* Prune old backups */
  const cutoff = Date.now() - RETENTION * 24 * 60 * 60 * 1000;
  const pruned = [];
  for (const f of fs.readdirSync(BACKUP_DIR)) {
    if (!/^goodway-\d{4}-\d{2}-\d{2}\.db$/.test(f)) continue;
    const full = path.join(BACKUP_DIR, f);
    if (fs.statSync(full).mtime.getTime() < cutoff) {
      fs.unlinkSync(full);
      pruned.push(f);
    }
  }
  if (pruned.length) console.log('Pruned:', pruned.join(', '));
}

main().catch(function (e) { console.error('Backup failed:', e); process.exit(1); });
