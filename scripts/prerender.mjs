// Dựng sẵn HTML cho các trang công khai (bản tĩnh, vd Vercel chưa có backend) – chạy sau vite build (client + SSR).
// - dist/app-shell.html: khung trang gốc (máy chủ VPS dùng làm khuôn SSR; Vercel dùng cho trang chỉ chạy phía trình duyệt)
// - dist/index.html, dist/mau-phan-mem/index.html, dist/mau-phan-mem/<slug>/index.html, dist/mau-landing-page/index.html, dist/404.html
// - dist/sitemap.xml, dist/robots.txt
// Địa chỉ trang (canonical, sitemap): PUBLIC_URL, hoặc tên miền production Vercel (VERCEL_PROJECT_PRODUCTION_URL).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defaultBootstrap } from '../src/data/bootstrap.js'
import { fillTemplate, robotsTxt, sitemapRoutes, sitemapXml } from '../server/seo.js'

const DIST = resolve('dist')
const SHELL = join(DIST, 'app-shell.html')
// lần build đầu: index.html do Vite tạo chính là khuôn trang; sau đó index.html bị ghi đè bằng trang chủ đã dựng
if (!existsSync(SHELL) || readFileSync(join(DIST, 'index.html'), 'utf8').includes('<!--app-html-->')) copyFileSync(join(DIST, 'index.html'), SHELL)
const template = readFileSync(SHELL, 'utf8')
const { render } = await import(pathToFileURL(resolve('dist-server/entry-server.js')).href)

const host = process.env.PUBLIC_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
const origin = host.replace(/\/$/, '')
const boot = { ...defaultBootstrap(), origin }

const write = (file, html) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
let n = 0
for (const r of sitemapRoutes(null)) {
  const out = render(r.path, boot)
  if (out.status !== 200) throw new Error(`${r.path} trả về ${out.status}`)
  write(r.path === '/' ? join(DIST, 'index.html') : join(DIST, r.path, 'index.html'), fillTemplate(template, { head: out.head, html: out.html, boot: { ...boot, url: r.path } }))
  n++
}
const nf = render('/404', boot)
write(join(DIST, '404.html'), fillTemplate(template, { head: nf.head, html: nf.html, boot: { ...boot, url: '/404' } }))
// sitemap cần địa chỉ tuyệt đối: chỉ tạo khi biết tên miền
if (origin) writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml(origin, null))
writeFileSync(join(DIST, 'robots.txt'), robotsTxt(origin))
console.log(`✓ đã dựng sẵn ${n} trang + 404, robots.txt${origin ? `, sitemap.xml (${origin})` : ' (chưa có PUBLIC_URL: bỏ qua sitemap)'}`)
