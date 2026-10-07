// Ứng dụng Express: API + tệp tĩnh + dựng HTML phía máy chủ (SSR) cho trang công khai.
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createApi } from './api.js'
import { createBootstrap } from './bootstrap.js'
import { fillTemplate, robotsTxt, sitemapXml } from './seo.js'

// Trang chỉ chạy phía trình duyệt (xem thử, quản trị): trả khung trang + noindex
const CLIENT_ONLY = /^\/(admin|quan-tri|demo|demo-landing|demo-du-an|preview|lp|mau-website)(\/|$)/

// Nạp bản dựng giao diện (vite build) và bản SSR (vite build --ssr); chưa build thì trả null
export async function loadRenderer(cfg) {
  const shell = join(cfg.distDir, 'app-shell.html')
  if (!existsSync(shell) || !existsSync(cfg.ssrEntry)) return null
  const mod = await import(pathToFileURL(cfg.ssrEntry).href)
  return { template: readFileSync(shell, 'utf8'), render: mod.render }
}

function noDatabaseApi(boot) {
  const r = express.Router()
  r.get('/health', (_req, res) => res.json({ ok: true, database: false }))
  r.get('/public/bootstrap', async (_req, res) => res.json(await boot.load()))
  r.use((_req, res) => res.status(503).json({ error: 'no_database', message: 'Máy chủ chưa kết nối database (thiếu DATABASE_URL).' }))
  return r
}

export function createApp({ pool, cfg, renderer }) {
  const app = express()
  app.disable('x-powered-by')
  if (cfg.trustProxy) app.set('trust proxy', 1)
  // CSP tắt: trang mẫu nhúng YouTube / TikTok, ảnh Unsplash, phông Google; các header bảo mật khác vẫn bật
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(compression())
  app.use(cookieParser())

  const boot = createBootstrap(pool)
  app.locals.boot = boot
  // chưa cấu hình database (vd Vercel chưa đặt DATABASE_URL): website vẫn chạy bằng dữ liệu mặc định, API báo 503
  app.use('/api', pool ? createApi({ pool, cfg, boot }) : noDatabaseApi(boot))

  const originOf = (req) => cfg.publicUrl || `${req.protocol}://${req.get('host')}`
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(robotsTxt(originOf(req))))
  app.get('/sitemap.xml', async (req, res, next) => {
    try {
      const b = await boot.load()
      res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(sitemapXml(originOf(req), b.catalog))
    } catch (e) {
      next(e)
    }
  })

  // Tệp tĩnh: /assets có mã băm → lưu đệm 1 năm; còn lại 1 ngày
  const dist = cfg.distDir
  app.use('/assets', express.static(join(dist, 'assets'), { immutable: true, maxAge: '1y', index: false, fallthrough: false }))
  // Danh sách dự án cũ đã gộp vào Kho mẫu (trang từng dự án vẫn là tệp tĩnh /du-an/<slug>/)
  app.get(['/du-an', '/du-an/'], (_req, res) => res.redirect(301, '/mau-phan-mem?ht=rieng'))
  app.use('/du-an', express.static(join(dist, 'du-an'), { maxAge: '1d' }))
  // Bỏ qua các trang HTML dựng sẵn cho Vercel (dist/**/index.html): trên máy chủ, trang luôn dựng mới từ database
  const files = express.static(dist, { index: false, redirect: false, maxAge: '1d' })
  app.use((req, res, next) => (/\.html?$/i.test(req.path) ? next() : files(req, res, next)))

  // HTML
  app.use(async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (!renderer) return res.status(503).type('text/plain').send('Chưa có bản dựng giao diện. Chạy: npm run build')
    try {
      const b = { ...(await boot.load()), origin: originOf(req) }
      res.set('Cache-Control', 'no-cache')
      if (CLIENT_ONLY.test(req.path)) {
        res.set('X-Robots-Tag', 'noindex, nofollow')
        return res.type('html').send(fillTemplate(renderer.template, { boot: b, noindex: true }))
      }
      let out
      try {
        out = renderer.render(req.originalUrl, b)
      } catch (e) {
        // lỗi dựng phía máy chủ: vẫn trả khung trang để trình duyệt tự hiển thị
        console.error('[ssr]', req.originalUrl, e)
        return res.type('html').send(fillTemplate(renderer.template, { boot: b }))
      }
      res.status(out.status).type('html').send(fillTemplate(renderer.template, { head: out.head, html: out.html, boot: { ...b, url: req.originalUrl } }))
    } catch (e) {
      next(e)
    }
  })

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.status === 404 || err.statusCode === 404) return res.status(404).type('text/plain').send('Không tìm thấy')
    console.error('[app]', err)
    res.status(500).type('text/plain').send('Máy chủ gặp lỗi')
  })
  return app
}
