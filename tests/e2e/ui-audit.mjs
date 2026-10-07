// Dò lỗi giao diện trang quản trị /admin ở 4 cỡ màn hình (máy tính lớn, laptop, máy tính bảng, điện thoại):
// trang tràn ngang, phần tử bị cắt khỏi khung, ảnh hỏng, lỗi JS. Có dữ liệu mẫu đủ nhiều để lộ lỗi bố cục.
// Chạy: npm run build && node tests/e2e/ui-audit.mjs   (database test bị xoá sạch như npm test)
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { ADMIN, login, setup } from '../helpers.js'

const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)
const VIEWPORTS = [
  ['máy tính', 1440, 900],
  ['laptop', 1100, 760],
  ['máy tính bảng', 820, 1100],
  ['điện thoại', 375, 812],
]
const PAGES = ['', 'yeu-cau', 'khach-hang', 'hop-dong', 'thu-tien', 'mau-phan-mem', 'mau-dung-rieng', 'hoi-dap', 'cai-dat', 'tai-khoan', 'nhat-ky', 'doi-mat-khau']

// Đo trong trình duyệt: phần tử ngoài cùng vượt khỏi khung nội dung (trừ vùng cuộn ngang có chủ đích như bảng)
export const AUDIT = () => {
  const out = { overflow: document.documentElement.scrollWidth > innerWidth + 1, cut: [], broken: [] }
  const content = document.querySelector('.adm-drawer') || document.querySelector('.adm-content') || document.body
  const limit = Math.min(content.getBoundingClientRect().right, innerWidth) + 2
  const inScroller = (el) => {
    for (let a = el.parentElement; a && a !== content; a = a.parentElement) if (/(auto|scroll)/.test(getComputedStyle(a).overflowX)) return true
    return false
  }
  const seen = new Set()
  for (const el of content.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || el.closest('.sr-only, .adm-preview') || inScroller(el)) continue
    if (r.right > limit && !(el.parentElement && el.parentElement !== content && el.parentElement.getBoundingClientRect().right > limit)) {
      const k = String(el.className)
      if (!seen.has(k)) seen.add(k) && out.cut.push(`${el.tagName.toLowerCase()}.${k.split(' ').join('.')} "${(el.textContent || '').trim().slice(0, 40)}"`)
    }
  }
  for (const img of document.images) if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) out.broken.push(img.getAttribute('src'))
  return out
}

const ctx = await setup()
const server = await new Promise((ok) => {
  const s = ctx.app.listen(0, '127.0.0.1', () => ok(s))
})
const B = `http://127.0.0.1:${server.address().port}`
const api = await login(ctx.app)

// dữ liệu mẫu: tên dài, nhiều trạng thái, có tiền thu
const names = ['Nguyễn Văn An', 'Trần Thị Bích Ngọc', 'Lê Hoàng Phúc', 'Phạm Minh Tuấn', 'Hoàng Thị Thu Trang', 'Đặng Quốc Bảo', 'Vũ Đức Thắng', 'Bùi Thanh Hương']
const templatesList = (await api.get('/api/admin/catalog')).body
for (let i = 0; i < 40; i++) {
  const t = templatesList[i % templatesList.length]
  await api.post('/api/admin/leads', {
    name: names[i % names.length] + (i > 7 ? ` ${i}` : ''),
    phone: `09${String(10000000 + i * 7919).slice(0, 8)}`,
    businessType: ['Gara ô tô', 'Tiệm / chuỗi sửa xe máy', 'Lốp & ắc quy', 'Đại lý / showroom ô tô'][i % 4],
    interest: i % 5 ? t.name : 'Phần mềm quản lý chuỗi gara nhiều chi nhánh kèm website bán phụ tùng và landing page quảng cáo',
    source: ['Website', 'Hotline', 'Zalo', 'Facebook'][i % 4],
    status: ['Mới', 'Đã liên hệ', 'Hẹn demo', 'Đã báo giá', 'Thất bại'][i % 5],
    message: 'Cần tư vấn phần mềm quản lý gara có 3 chi nhánh, muốn đặt lịch online và nhắc bảo dưỡng tự động qua Zalo.',
  })
}
const leads = (await api.get('/api/admin/leads')).body
for (let i = 0; i < 12; i++) {
  const r = await api.post(`/api/admin/leads/${leads[i].id}/convert`, { itemName: templatesList[i % templatesList.length].name, price: 3500000 + i * 450000, businessName: `Gara ${names[i % names.length]} – chi nhánh Long Biên` })
  await api.patch(`/api/admin/orders/${r.body.orderId}`, { status: ['Đã ký', 'Đang triển khai', 'Chờ nghiệm thu', 'Hoàn tất'][i % 4], dueDate: `2026-1${i % 2}-1${i % 9}`, domain: `gara-${i}-chungauto-demo.vn` })
  await api.post('/api/admin/payments', { orderId: r.body.orderId, amount: 1000000 + i * 100000, method: ['Chuyển khoản', 'Tiền mặt'][i % 2] })
}
for (const role of ['manager', 'sales', 'editor']) await api.post('/api/admin/users', { email: `${role}.nhanvien.dai@chungauto-demo.vn`, name: `Nhân viên ${role} có tên khá dài`, role, password: 'Matkhau123' })

const browser = await chromium.launch({ executablePath: CHROME })
const problems = []
for (const [vn, w, h] of VIEWPORTS) {
  const c = await browser.newContext({ viewport: { width: w, height: h } })
  const p = await c.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)))
  await p.goto(B + '/admin/dang-nhap')
  await p.locator('#lg-email').fill(ADMIN.email)
  await p.locator('#lg-pass').fill(ADMIN.password)
  await p.locator('.adm-login__form button[type=submit]').click()
  await p.locator('.adm-pagehead').waitFor()
  const check = async (label) => {
    await p.waitForTimeout(450)
    const a = await p.evaluate(AUDIT)
    const issues = [...(a.overflow ? ['trang tràn ngang'] : []), ...a.cut.slice(0, 5), ...a.broken.slice(0, 3).map((s) => 'ảnh hỏng ' + s)]
    if (issues.length) problems.push(`[${vn}] ${label}: ${issues.join(' | ')}`)
  }
  for (const slug of PAGES) {
    await p.goto(`${B}/admin/${slug}`)
    await p.locator('.adm-pagehead').waitFor()
    await check(`/admin/${slug}`)
    // mở chi tiết dòng đầu + biểu mẫu thêm mới
    const view = p.locator('button[aria-label="Xem chi tiết"]').first()
    if (await view.count()) {
      await view.click()
      await p.locator('.adm-drawer').waitFor()
      await check(`/admin/${slug} › chi tiết`)
      await p.keyboard.press('Escape')
    }
    const add = p.locator('.adm-pagehead .adm-btn--primary', { hasText: 'Thêm' })
    if (await add.count()) {
      await add.click()
      await p.locator('.adm-drawer').waitFor()
      await check(`/admin/${slug} › thêm mới`)
      await p.keyboard.press('Escape')
    }
  }
  // dạng bảng kéo thả của yêu cầu tư vấn
  await p.goto(B + '/admin/yeu-cau')
  await p.locator('button[aria-label="Bảng kéo thả"]').click()
  await check('/admin/yeu-cau › bảng kéo thả')
  if (errs.length) problems.push(`[${vn}] lỗi JS: ${[...new Set(errs)].join(' | ')}`)
  await c.close()
}
await browser.close()
server.close()
await ctx.pool.end()
console.log(problems.length ? problems.join('\n') : 'Không phát hiện lỗi giao diện')
process.exit(problems.length ? 1 : 0)
