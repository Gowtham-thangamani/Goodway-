/**
 * Generates a bcrypt hash you can paste into .env as ADMIN_PASSWORD_HASH.
 * Usage: `npm run set-password -- "new password"`
 */
const bcrypt = require('bcryptjs');

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: npm run set-password -- "your password"');
  process.exit(1);
}
if (pwd.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}
const hash = bcrypt.hashSync(pwd, 12);
console.log('\nPaste this into .env (replace existing ADMIN_PASSWORD_HASH):\n');
console.log('ADMIN_PASSWORD_HASH=' + hash + '\n');
