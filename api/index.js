// Vercel: chạy toàn bộ máy chủ ChungAuto (website dựng HTML từ database, API, trang quản trị /admin) trong một hàm serverless.
// Tệp tĩnh (/assets, /images, /du-an/…) do Vercel phục vụ trực tiếp từ dist/; mọi đường dẫn khác chuyển vào đây (vercel.json).
// Database: biến môi trường DATABASE_URL (Supabase – chuỗi "Session pooler"). Chưa đặt: website chạy bằng dữ liệu mặc định.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getConfig } from '../server/config.js'
import { createPool, poolOptions } from '../server/db.js'
import { migrate } from '../server/migrate.js'
import { seed } from '../server/seed.js'
import { createApp } from '../server/app.js'

let ready = null

async function init() {
  // mỗi phiên bản hàm giữ ít kết nối (nhiều phiên bản chạy song song dùng chung giới hạn kết nối của Supabase)
  const cfg = getConfig({ ...process.env, DB_POOL_MAX: process.env.DB_POOL_MAX || '2' })
  let pool = null
  if (process.env.DATABASE_URL) {
    pool = createPool(cfg.databaseUrl, poolOptions(cfg))
    // lần khởi động đầu của mỗi phiên bản: bảo đảm bảng + dữ liệu khởi tạo (chạy nhanh khi đã có)
    await migrate(pool, () => {})
    await seed(pool, cfg, () => {})
  } else console.warn('[vercel] chưa đặt DATABASE_URL: chạy bằng dữ liệu mặc định, API quản trị tắt')
  const { render } = await import('../dist-server/entry-server.js')
  const template = readFileSync(join(process.cwd(), 'dist', 'app-shell.html'), 'utf8')
  return createApp({ pool, cfg, renderer: { template, render } })
}

export default async function handler(req, res) {
  try {
    const app = await (ready ||= init())
    return app(req, res)
  } catch (e) {
    ready = null // lần sau thử khởi động lại (vd database tạm thời không kết nối được)
    console.error('[vercel] khởi động lỗi:', e)
    res.statusCode = 503
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Máy chủ đang khởi động lại, vui lòng thử lại sau ít giây.')
  }
}
