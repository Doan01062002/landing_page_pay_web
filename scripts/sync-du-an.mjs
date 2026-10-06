// Chép landing page từ thư mục làm việc (D:/Chungauto/landing_page_<x>) vào public/du-an/<slug>/
// và chèn <base href> để ảnh, CSS đúng kể cả khi link thiếu dấu "/" cuối.
// Chạy: node scripts/sync-du-an.mjs            (tất cả)
//       node scripts/sync-du-an.mjs nhatduc    (một dự án)
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SRC_ROOT = resolve(process.cwd(), '..')
const PROJECTS = { carcarservice: 'landing_page_carcarservice', nhatduc: 'landing_page_nhatduc' }

const only = process.argv[2]
for (const [slug, folder] of Object.entries(PROJECTS)) {
  if (only && only !== slug) continue
  const src = join(SRC_ROOT, folder)
  const dest = join('public', 'du-an', slug)
  if (!existsSync(join(src, 'index.html'))) throw new Error(`Không thấy ${src}/index.html`)

  rmSync(join(dest, 'assets'), { recursive: true, force: true })
  cpSync(join(src, 'assets'), join(dest, 'assets'), { recursive: true })

  let html = readFileSync(join(src, 'index.html'), 'utf8')
  const nl = html.includes('\r\n') ? '\r\n' : '\n'
  const charset = '<meta charset="utf-8">' + nl
  if (!html.includes(charset)) throw new Error(`${folder}: không thấy thẻ <meta charset>`)
  html = html.replace(charset, `${charset}  <!-- Đặt trong /du-an/${slug}/: giữ đường dẫn ảnh, CSS đúng kể cả khi URL thiếu dấu / cuối -->${nl}  <base href="/du-an/${slug}/">${nl}`)
  writeFileSync(join(dest, 'index.html'), html)
  console.log(`${folder} → ${dest}`)
}
