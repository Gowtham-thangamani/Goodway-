/* pm2 keeps the Node admin alive across crashes + reboots.
   Install on the server once:
     npm install -g pm2
   Start the app:
     cd /var/www/goodway/site
     pm2 start deploy/pm2.ecosystem.config.js
     pm2 save
     pm2 startup    # follow the printed sudo command to persist across reboot
   Logs:  pm2 logs goodway-admin
   Restart: pm2 restart goodway-admin */
module.exports = {
  apps: [
    {
      name: 'goodway-admin',
      script: 'server/server.js',
      cwd: '/var/www/goodway/site',
      instances: 1,                  // SQLite needs single-process, don't cluster
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4010
        // everything else is read from server/.env
      },
      error_file:  '/var/log/goodway/admin.err.log',
      out_file:    '/var/log/goodway/admin.out.log',
      merge_logs: true,
      time: true
    }
  ]
};
