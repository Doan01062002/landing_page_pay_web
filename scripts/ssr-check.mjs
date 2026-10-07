// Kiểm tra nhanh SSR khi phát triển: nạp entry-server qua Vite và dựng thử từng trang công khai.
// Chạy: node scripts/ssr-check.mjs
import { createServer } from 'vite'
import { sitemapRoutes } from '../server/seo.js'
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const m = await vite.ssrLoadModule('/src/entry-server.jsx')
  const boot = { ...m.defaultBootstrap(), origin: 'https://chungauto.vn' }
  const routes = [...sitemapRoutes(null).map((r) => r.path), '/khong-co', '/mau-phan-mem/khong-co']
  for (const url of routes) {
    try {
      const r = m.render(url, boot)
      console.log('OK', r.status, url, r.html.length, 'head:', (r.head.match(/<title>(.*?)<\/title>/) || [])[1])
    } catch (e) {
      console.log('FAIL', url, String(e.stack || e).split('\n').slice(0, 4).join(' | '))
    }
  }
} finally {
  await vite.close()
}
