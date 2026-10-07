// Chụp ảnh xem trước cho thẻ trong Kho mẫu → src/assets/thumbs/<key>.webp (Vite gắn mã băm theo nội dung: chụp lại là trình duyệt tải ảnh mới)
// (thẻ dùng ảnh tĩnh thay cho iframe: nhúng 9 website thật một lúc làm điện thoại giật, tải hơn chục MB).
// - Ảnh: khung máy tính 1280 px, cao 3 màn hình (2400 px) để rê chuột vào thẻ thì ảnh cuộn xuống; thu về rộng 720 px.
// - key: mẫu phần mềm = <slug>, mẫu dựng riêng = du-an-<slug>.
// Chạy (cần Chrome và ffmpeg trong PATH; trang phải đang chạy, vd `npm run build && npm run preview`):
//   node scripts/thumbs.mjs                       (tất cả, mặc định http://localhost:4173)
//   node scripts/thumbs.mjs --base=http://localhost:4180 dopro lumen
// Chụp lại mỗi khi sửa giao diện một mẫu.
import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { templates } from '../src/data/templates.js'
import { projects } from '../src/data/projects.js'

const args = process.argv.slice(2)
const base = (args.find((a) => a.startsWith('--base='))?.slice(7) || 'http://localhost:4173').replace(/\/$/, '')
const only = args.filter((a) => !a.startsWith('--'))
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = 'src/assets/thumbs'
const W = 1280
const H = 800
const TALL = H * 3

const jobs = [
  ...projects.map((p) => ({ key: `du-an-${p.slug}`, slug: p.slug, url: `${base}/du-an/${p.slug}/` })),
  ...templates.map((t) => ({ key: t.slug, slug: t.slug, url: `${base}/preview/${t.slug}?embed=1` })),
].filter((j) => !only.length || only.includes(j.slug) || only.includes(j.key))

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME })
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: W, height: H } })
  await page.goto(job.url, { waitUntil: 'load', timeout: 60000 })
  // chờ màn mở đầu / hiệu ứng vào trang (vd VinFast) chạy xong
  await page.waitForTimeout(3500)
  // cuộn qua 3 màn hình để các hiệu ứng "hiện khi cuộn tới" chạy hết, rồi về đầu trang
  for (let y = 0; y <= TALL; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1500)
  const png = join(tmpdir(), `thumb-${job.key}.png`)
  await page.screenshot({ path: png, fullPage: true, clip: { x: 0, y: 0, width: W, height: TALL } })
  await page.close()
  // fullPage ngắn hơn 2400 px: ffmpeg đệm nền trắng cho đủ khung
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', `pad=${W}:${TALL}:0:0:white,scale=720:-2`, '-c:v', 'libwebp', '-quality', '72', join(OUT, `${job.key}.webp`)])
  rmSync(png)
  console.log('✓', job.key)
}
await browser.close()
