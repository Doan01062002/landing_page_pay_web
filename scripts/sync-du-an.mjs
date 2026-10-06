// Chép landing page từ thư mục làm việc (D:/Chungauto/landing_page_<x>) vào public/du-an/<slug>/.
// - Landing HTML tĩnh: chép assets + index.html, chèn <base href> để ảnh, CSS đúng kể cả khi link thiếu dấu "/" cuối.
// - Landing build bằng Vite (dist: true): chép nguyên dist/ (Vite đã đặt base /du-an/<slug>/, không cần <base>).
//   Nhớ chạy `npm run build` trong thư mục đó trước.
// Chạy: node scripts/sync-du-an.mjs            (tất cả)
//       node scripts/sync-du-an.mjs nhatduc    (một dự án)
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SRC_ROOT = resolve(process.cwd(), '..')
const PROJECTS = {
  carcarservice: { folder: 'landing_page_carcarservice' },
  nhatduc: { folder: 'landing_page_nhatduc' },
  'nhatduc-motion': { folder: 'landing_page_nhatduc_motion', dist: true },
}

const only = process.argv[2]
if (only && !PROJECTS[only]) throw new Error(`Không có dự án "${only}". Có: ${Object.keys(PROJECTS).join(', ')}`)

for (const [slug, { folder, dist }] of Object.entries(PROJECTS)) {
  if (only && only !== slug) continue
  const src = dist ? join(SRC_ROOT, folder, 'dist') : join(SRC_ROOT, folder)
  const dest = join('public', 'du-an', slug)
  if (!existsSync(join(src, 'index.html'))) throw new Error(`Không thấy ${src}/index.html${dist ? ' (chạy npm run build trước)' : ''}`)

  if (dist) {
    rmSync(dest, { recursive: true, force: true })
    cpSync(src, dest, { recursive: true })
    console.log(`${folder}/dist → ${dest}`)
    continue
  }

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
