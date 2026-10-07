// Chạy bằng PM2 (không dùng Docker): pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [{ name: 'chungauto', script: 'server/index.js', env: { NODE_ENV: 'production' }, max_memory_restart: '500M', time: true }],
}
