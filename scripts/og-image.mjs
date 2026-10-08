// Tạo ảnh chia sẻ mạng xã hội (Open Graph 1200×630) cho trang chủ: public/brand/og-home.jpg
// Ghép logo + thông điệp + ảnh chụp 3 mẫu thật trong Kho mẫu, chụp bằng Chrome.
// Chạy: node scripts/og-image.mjs   (CHROME_PATH nếu Chrome không ở vị trí mặc định)
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'
import { site } from '../src/data/site.js'

const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)
const data = (p, type) => `data:${type};base64,${readFileSync(resolve(p)).toString('base64')}`
const logo = data('public/brand/logo-vector.svg', 'image/svg+xml')
const shots = ['public/images/hero/du-an-dopro.webp', 'public/images/hero/autopro.webp', 'public/images/hero/du-an-hungthinh.webp'].map((p) => data(p, 'image/webp'))

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;700;800&display=swap');
  * { box-sizing: border-box; margin: 0 }
  body { width: 1200px; height: 630px; font-family: 'Be Vietnam Pro', system-ui, sans-serif; background: #fff; overflow: hidden; position: relative }
  .bg { position: absolute; inset: 0; background: radial-gradient(900px 520px at 100% 100%, #ffe4e5 0%, #fff 60%) }
  .left { position: absolute; left: 64px; top: 54px; width: 540px }
  .logo { height: 76px; margin-left: -6px }
  h1 { margin-top: 30px; font-size: 50px; line-height: 1.12; font-weight: 800; color: #14161a; letter-spacing: -1px }
  h1 b { color: #ea212b }
  p { margin-top: 20px; font-size: 23px; line-height: 1.45; color: #4a4f57; font-weight: 500 }
  .tags { display: flex; gap: 10px; margin-top: 30px; flex-wrap: wrap }
  .tags span { padding: 9px 16px; border-radius: 999px; background: #fff; border: 1.5px solid #f3c2c4; color: #b5141c; font-weight: 700; font-size: 18px }
  .hot { position: absolute; left: 64px; bottom: 46px; font-size: 22px; font-weight: 700; color: #14161a }
  .hot i { font-style: normal; color: #ea212b }
  .shot { position: absolute; border-radius: 14px; overflow: hidden; box-shadow: 0 24px 60px rgba(20,22,26,.22), 0 0 0 1px rgba(20,22,26,.06); background: #fff }
  .shot img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top }
  .s1 { width: 520px; height: 330px; right: -40px; top: 70px; transform: rotate(-3deg) }
  .s2 { width: 360px; height: 235px; right: 205px; top: 345px; transform: rotate(4deg) }
  .s3 { width: 280px; height: 190px; right: 12px; top: 410px; transform: rotate(-6deg) }
</style></head><body><div class="bg"></div>
  <div class="shot s1"><img src="${shots[0]}"></div>
  <div class="shot s2"><img src="${shots[1]}"></div>
  <div class="shot s3"><img src="${shots[2]}"></div>
  <div class="left">
    <img class="logo" src="${logo}">
    <h1>Phần mềm &amp; website cho <b>gara, đại lý, showroom ô tô</b></h1>
    <p>Mẫu dựng sẵn, xem thử trực tiếp, bàn giao trong 3 ngày – tặng kèm landing page quảng cáo.</p>
    <div class="tags"><span>Gara ô tô</span><span>Đại lý xe</span><span>Phụ tùng</span><span>Detailing</span></div>
  </div>
  <div class="hot">Hotline <i>${site.hotline}</i></div>
</body></html>`

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'public/brand/og-home.jpg', type: 'jpeg', quality: 86 })
await browser.close()
console.log('✓ public/brand/og-home.jpg')
