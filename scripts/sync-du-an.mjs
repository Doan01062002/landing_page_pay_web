// Chép landing page từ thư mục làm việc (D:/Chungauto/landing_page_<x>) vào public/du-an/<slug>/ (mẫu bán: public/mau/<slug>/).
// - Landing HTML tĩnh: chép assets + index.html, chèn <base href> để ảnh, CSS đúng kể cả khi link thiếu dấu "/" cuối.
// - Landing build bằng Vite (dist: true): chép nguyên dist/ (Vite đã đặt base /du-an/<slug>/, không cần <base>).
//   Nhớ chạy `npm run build` trong thư mục đó trước.
// Chạy: node scripts/sync-du-an.mjs            (tất cả)
//       node scripts/sync-du-an.mjs nhatduc    (một dự án)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SRC_ROOT = resolve(process.cwd(), '..')
const PROJECTS = {
  carcarservice: { folder: 'landing_page_carcarservice' },
  nhatduc: { folder: 'landing_page_nhatduc' },
  'nhatduc-motion': { folder: 'landing_page_nhatduc_motion', dist: true },
  'nhatduc-ladi': { folder: 'landing_page_nhatduc_ladi' },
  minhphat: { folder: 'landing_page_minhphat' },
  vinfast: { folder: 'landing_page_vinfast' },
  // Trang bán hàng mẫu (phụ kiện, độ xe)
  dopro: { folder: 'landing_page_dopro' },
  ankhang: { folder: 'landing_page_ankhang' },
  lumen: { folder: 'landing_page_lumen' },
  vanhviet: { folder: 'landing_page_vanhviet' },
  bongstudio: { folder: 'landing_page_bongstudio' },
  // Website mẫu nhiều trang
  tinviet: { folder: 'landing_page_tinviet' },
  hungthinh: { folder: 'landing_page_hungthinh' },
  // Mẫu website bán (không phải dự án đã triển khai) → public/mau/<slug>/
}

const only = process.argv[2]
if (only && !PROJECTS[only]) throw new Error(`Không có dự án "${only}". Có: ${Object.keys(PROJECTS).join(', ')}`)

for (const [slug, { folder, dist, dir = 'du-an' }] of Object.entries(PROJECTS)) {
  if (only && only !== slug) continue
  const src = dist ? join(SRC_ROOT, folder, 'dist') : join(SRC_ROOT, folder)
  const dest = join('public', dir, slug)
  if (!existsSync(join(src, 'index.html'))) throw new Error(`Không thấy ${src}/index.html${dist ? ' (chạy npm run build trước)' : ''}`)

  if (dist) {
    rmSync(dest, { recursive: true, force: true })
    cpSync(src, dest, { recursive: true })
    console.log(`${folder}/dist → ${dest}`)
    continue
  }

  // trang một file (vd vinfast) không có thư mục assets
  mkdirSync(dest, { recursive: true })
  rmSync(join(dest, 'assets'), { recursive: true, force: true })
  if (existsSync(join(src, 'assets'))) cpSync(join(src, 'assets'), join(dest, 'assets'), { recursive: true })

  // web nhiều trang: mọi file .html ở gốc thư mục (index.html, xe.html, gio-hang.html…)
  const pages = readdirSync(src).filter((f) => f.endsWith('.html'))
  for (const page of pages) {
    let html = readFileSync(join(src, page), 'utf8')
    const nl = html.includes('\r\n') ? '\r\n' : '\n'
    // nhận cả <meta charset="utf-8"> và <meta charset="utf-8" />
    const charset = html.match(/<meta charset="utf-8"\s*\/?>\r?\n/i)?.[0]
    if (!charset) throw new Error(`${folder}/${page}: không thấy thẻ <meta charset>`)
    html = html.replace(charset, `${charset}  <!-- Đặt trong /du-an/${slug}/: giữ đường dẫn ảnh, CSS đúng kể cả khi URL thiếu dấu / cuối -->${nl}  <base href="/du-an/${slug}/">${nl}`)
    writeFileSync(join(dest, page), html)
  }
  console.log(`${folder} → ${dest}${pages.length > 1 ? ` (${pages.length} trang)` : ''}`)
}
