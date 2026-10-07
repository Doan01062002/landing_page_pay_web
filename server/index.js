// Khởi động máy chủ ChungAuto (VPS): chạy migration, dữ liệu khởi tạo, rồi phục vụ API + website.
// Chạy: npm run build && npm start   (cấu hình trong .env – xem .env.example)
import { loadEnvFile, getConfig } from './config.js'
import { createPool } from './db.js'
import { migrate } from './migrate.js'
import { seed } from './seed.js'
import { createApp, loadRenderer } from './app.js'

loadEnvFile()
const cfg = getConfig()
const pool = createPool(cfg.databaseUrl)

await migrate(pool)
await seed(pool, cfg)
const renderer = await loadRenderer(cfg)
if (!renderer) console.warn('[web] chưa có bản dựng giao diện (dist/, dist-server/) – chỉ chạy API. Chạy: npm run build')

const server = createApp({ pool, cfg, renderer }).listen(cfg.port, cfg.host, () => {
  console.log(`[web] ChungAuto đang chạy tại http://${cfg.host === '0.0.0.0' ? 'localhost' : cfg.host}:${cfg.port}`)
})

// Tắt êm: ngừng nhận kết nối mới, đóng database
const stop = (sig) => {
  console.log(`[web] nhận ${sig}, đang dừng…`)
  server.close(() => pool.end().then(() => process.exit(0)))
  setTimeout(() => process.exit(1), 10000).unref()
}
process.on('SIGTERM', () => stop('SIGTERM'))
process.on('SIGINT', () => stop('SIGINT'))
