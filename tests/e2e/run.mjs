// Kiểm thử đầu-cuối bằng trình duyệt thật (Chrome): website công khai + trang quản trị /admin + trang quản trị demo /quan-tri.
// Tự dựng database test sạch, chạy máy chủ ở cổng ngẫu nhiên, đi qua các luồng chính rồi báo PASS / FAIL.
// Chạy: npm run build && npm run test:e2e   (CHROME_PATH nếu Chrome không ở vị trí mặc định)
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import express from 'express'
import { chromium } from 'playwright-core'
import { ADMIN, login, setup } from '../helpers.js'

const CHROME = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)
if (!CHROME) throw new Error('Không tìm thấy Chrome: đặt biến CHROME_PATH')

const ctx = await setup()
if (!ctx.renderer) throw new Error('Chưa có bản dựng giao diện: chạy npm run build')
const server = await new Promise((ok) => {
  const s = ctx.app.listen(0, '127.0.0.1', () => ok(s))
})
const B = `http://127.0.0.1:${server.address().port}`
const api = await login(ctx.app)

let pass = 0
const fails = []
const check = (name, cond, extra = '') => {
  if (cond) pass++
  else fails.push(`${name} ${extra}`)
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond || !extra ? '' : ' → ' + extra}`)
}

const browser = await chromium.launch({ executablePath: CHROME })
async function newPage(viewport = { width: 1366, height: 860 }) {
  const c = await browser.newContext({ viewport })
  // bỏ màn mở đầu logo (đã kiểm riêng) để thao tác ngay
  await c.addInitScript(() => {
    try {
      sessionStorage.setItem('chungauto_intro', '1')
      sessionStorage.setItem('chungauto_intro_kho', '1')
    } catch {
      /* */
    }
  })
  const p = await c.newPage()
  p.errors = []
  p.on('pageerror', (e) => p.errors.push('pageerror: ' + String(e).slice(0, 300)))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR|youtube|tiktok|googlesyndication/i.test(m.text())) p.errors.push('console: ' + m.text().slice(0, 300))
  })
  return p
}
const settle = (p, ms = 350) => p.waitForTimeout(ms)
const visible = (loc) => loc.waitFor({ timeout: 8000 }).then(() => true, () => false)
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)

try {
  // ============ 1. Website công khai: SSR + hydrate không lỗi ============
  {
    const p = await newPage()
    for (const path of ['/', '/mau-phan-mem', '/mau-phan-mem/autopro', '/mau-landing-page']) {
      p.errors = []
      const r = await p.goto(B + path, { waitUntil: 'networkidle' })
      await settle(p, 600)
      check(`trang ${path}: 200`, r.status() === 200, String(r.status()))
      check(`trang ${path}: hydrate không lỗi (không mismatch)`, p.errors.length === 0, p.errors.join(' | '))
    }
    const r404 = await p.goto(B + '/khong-co-trang-nay')
    check('trang lạ trả 404 thật', r404.status() === 404)
    check('trang 404 hiển thị thông báo', await p.getByText('Không tìm thấy trang này').isVisible())

    // form tư vấn → API → trang quản trị
    await p.goto(B + '/?utm_source=google&utm_campaign=e2e', { waitUntil: 'networkidle' })
    await p.locator('#landing-phone').scrollIntoViewIfNeeded()
    await p.locator('#landing-name').fill('A')
    await p.locator('#landing-phone').fill('123')
    await p.locator('form.cf button[type=submit]').first().click()
    await settle(p)
    check('form tư vấn: báo lỗi khi nhập sai', (await p.locator('form.cf .field__err').count()) >= 2)
    await p.locator('#landing-name').fill('Khách E2E Website')
    await p.locator('#landing-phone').fill('0901 222 333')
    await p.locator('#landing-template').selectOption({ index: 1 })
    await p.locator('#landing-note').fill('Gửi từ kiểm thử E2E')
    await p.locator('form.cf button[type=submit]').first().click()
    await p.locator('.cf-done').waitFor({ timeout: 8000 })
    check('form tư vấn: gửi thành công', await p.locator('.cf-done').isVisible())
    const leads = (await api.get('/api/admin/leads')).body
    const lead = leads.find((l) => l.name === 'Khách E2E Website')
    check('form tư vấn: yêu cầu lưu vào database', !!lead)
    check('form tư vấn: lưu số điện thoại chuẩn, trang gửi, UTM', lead?.phone === '0901222333' && lead?.page === '/' && lead?.utm?.utm_source === 'google' && lead?.message === 'Gửi từ kiểm thử E2E', JSON.stringify(lead))
    check('form tư vấn: lưu mẫu quan tâm', !!lead?.interest)
    await p.context().close()
  }

  // ============ 2. Đăng nhập trang quản trị ============
  const p = await newPage()
  {
    await p.goto(B + '/admin/hop-dong')
    await p.waitForURL(/\/admin\/dang-nhap/)
    check('chưa đăng nhập → chuyển tới trang đăng nhập', p.url().endsWith('/admin/dang-nhap'))
    await p.locator('#lg-email').fill(ADMIN.email)
    await p.locator('#lg-pass').fill('SaiMatKhau1')
    await p.locator('.adm-login__form button[type=submit]').click()
    await p.locator('.adm-login__err').waitFor()
    check('sai mật khẩu → báo lỗi chung', (await p.locator('.adm-login__err').textContent()).includes('Email hoặc mật khẩu không đúng'))
    await p.locator('#lg-pass').fill(ADMIN.password)
    await p.locator('.adm-login__form button[type=submit]').click()
    await p.waitForURL(/\/admin\/hop-dong/)
    check('đăng nhập xong quay lại trang định mở', p.url().endsWith('/admin/hop-dong'))
    await p.goto(B + '/admin')
    await p.locator('.adm-kpis').waitFor()
    const kpi = await p.locator('.adm-kpis').textContent()
    check('Tổng quan: đếm yêu cầu tư vấn từ website', /Yêu cầu tư vấn 30 ngày\s*1/.test(kpi), kpi)
    check('Tổng quan: danh sách cần gọi có khách mới', await p.locator('.adm-mini').getByText('Khách E2E Website').isVisible())
    check('Tổng quan: huy hiệu việc cần xử lý', (await p.locator('.adm-dot').textContent()) === '1')
  }

  // ============ 3. Mọi chức năng mở được, không lỗi ============
  {
    const mods = [
      ['', 'Chào buổi'],
      ['yeu-cau', 'Yêu cầu tư vấn'],
      ['khach-hang', 'Khách hàng'],
      ['hop-dong', 'Hợp đồng'],
      ['thu-tien', 'Thu tiền'],
      ['mau-phan-mem', 'Mẫu phần mềm'],
      ['mau-dung-rieng', 'Mẫu dựng riêng'],
      ['hoi-dap', 'Hỏi đáp'],
      ['cai-dat', 'Cài đặt website'],
      ['tai-khoan', 'Tài khoản'],
      ['nhat-ky', 'Nhật ký'],
      ['doi-mat-khau', 'Đổi mật khẩu'],
    ]
    for (const [slug, title] of mods) {
      p.errors = []
      await p.goto(`${B}/admin/${slug}`)
      await p.locator('.adm-pagehead h1').waitFor({ timeout: 8000 })
      await settle(p, 300)
      const h = await p.locator('.adm-pagehead h1').textContent()
      check(`quản trị /admin/${slug}: hiển thị "${title}"`, h.includes(title), h)
      check(`quản trị /admin/${slug}: không lỗi`, p.errors.length === 0, p.errors.join(' | '))
    }
    const nav = await p.locator('.adm-side__nav a').count()
    check('thanh bên có đủ 12 mục cho quản trị viên', nav === 12, String(nav))
  }

  // ============ 4. Luồng nghiệp vụ: yêu cầu → hợp đồng → thu tiền ============
  {
    await p.goto(B + '/admin/yeu-cau')
    await p.locator('.adm-table').getByText('Khách E2E Website').click()
    const drawer = p.locator('.adm-drawer')
    await drawer.waitFor()
    check('xem chi tiết yêu cầu: có UTM', (await drawer.textContent()).includes('utm_source: google'))
    await drawer.locator('.adm-drawer__foot button', { hasText: 'Đã gọi' }).click()
    await settle(p, 600)
    let l = (await api.get('/api/admin/leads')).body.find((x) => x.name === 'Khách E2E Website')
    check('thao tác "Đã gọi" → trạng thái Đã liên hệ', l.status === 'Đã liên hệ', l.status)
    await p.goto(B + `/admin/yeu-cau?open=${l.id}`)
    await p.locator('.adm-drawer__foot button', { hasText: 'Chuyển thành hợp đồng' }).click()
    await p.locator('#adm-ask').fill('3200000')
    await p.locator('.adm-modal .adm-btn--primary').click()
    await p.waitForURL(/\/admin\/hop-dong\?open=/, { timeout: 8000 })
    await settle(p, 600)
    const orders = (await api.get('/api/admin/orders')).body
    const order = orders.find((o) => o.customerName === 'Khách E2E Website')
    check('chuyển thành hợp đồng: tạo hợp đồng đúng giá', order?.price === 3200000, JSON.stringify(order))
    check('chuyển thành hợp đồng: mở ngay hợp đồng vừa tạo', (await p.locator('.adm-drawer').textContent()).includes(order?.code))
    l = (await api.get(`/api/admin/leads/${l.id}`)).body
    check('yêu cầu chuyển sang Chốt hợp đồng', l.status === 'Chốt hợp đồng')

    // thu tiền vượt → lỗi; thu đúng → còn lại cập nhật
    await p.locator('.adm-drawer__foot button', { hasText: 'Thu tiền' }).click()
    await p.locator('#adm-ask').fill('9999999')
    await p.locator('.adm-modal .adm-btn--primary').click()
    await settle(p, 600)
    check('thu tiền vượt số còn lại → báo lỗi', await p.locator('.adm-toast--danger').first().isVisible())
    await p.goto(B + `/admin/hop-dong?open=${order.id}`)
    await p.locator('.adm-drawer__foot button', { hasText: 'Thu tiền' }).click()
    await p.locator('#adm-ask').fill('1200000')
    await p.locator('.adm-modal .adm-btn--primary').click()
    await settle(p, 800)
    const o2 = (await api.get(`/api/admin/orders/${order.id}`)).body
    check('thu tiền: còn lại = 2.000.000', o2.remaining === 2000000, String(o2.remaining))
    await p.goto(B + '/admin/thu-tien')
    check('sổ thu có phiếu vừa tạo', await visible(p.locator('.adm-table').getByText('Khách E2E Website').first()))

    // xoá khách còn hợp đồng → báo lỗi, dữ liệu còn nguyên
    await p.goto(B + `/admin/khach-hang?open=${order.customerId}`)
    await p.locator('.adm-drawer').waitFor()
    check('chi tiết khách hàng có lịch sử hợp đồng', (await p.locator('.adm-drawer').textContent()).includes(order.code))
    await p.locator('.adm-drawer__foot button', { hasText: 'Xoá' }).click()
    await p.locator('.adm-modal .adm-btn--danger').click()
    await settle(p, 700)
    check('xoá khách còn hợp đồng → bị chặn', !!(await api.get(`/api/admin/customers/${order.customerId}`)).body.id)
  }

  // ============ 5. Thêm / sửa / xoá qua giao diện (hỏi đáp) → trang chủ cập nhật ============
  {
    await p.goto(B + '/admin/hoi-dap')
    await p.locator('.adm-pagehead button', { hasText: 'Thêm' }).click()
    await p.locator('.adm-drawer__foot .adm-btn--primary').click()
    await settle(p)
    check('thêm hỏi đáp: kiểm tra bắt buộc nhập', (await p.locator('.adm-field__err').count()) >= 2)
    await p.locator('#fld-question').fill('Câu hỏi E2E có hiện trên trang chủ?')
    await p.locator('#fld-answer').fill('Có, hiện ngay sau khi lưu.')
    await p.locator('#fld-sortOrder').fill('0')
    await p.locator('.adm-drawer__foot .adm-btn--primary').click()
    await settle(p, 800)
    const home = await (await fetch(B + '/')).text()
    check('hỏi đáp mới hiện trên trang chủ (SSR)', home.includes('Câu hỏi E2E có hiện trên trang chủ?'))
  }

  // ============ 6. Cài đặt website ============
  {
    await p.goto(B + '/admin/cai-dat')
    await p.locator('#fld-hotline').waitFor()
    await p.locator('#fld-hotline').fill('0977 123 456')
    await p.locator('#fld-email').fill('sai-email')
    await p.locator('.adm-pagehead button', { hasText: 'Lưu thay đổi' }).click()
    await settle(p, 600)
    check('cài đặt: email sai → báo lỗi tại ô', (await p.locator('#fld-email-err, .adm-field__err').count()) >= 1)
    await p.locator('#fld-email').fill('lienhe@chungauto.vn')
    await p.locator('.adm-pagehead button', { hasText: 'Lưu thay đổi' }).click()
    await settle(p, 800)
    const home = await (await fetch(B + '/')).text()
    check('cài đặt: hotline mới hiện trên website', home.includes('0977 123 456'))
    await p.getByRole('tab', { name: 'SEO mặc định' }).click().catch(() => p.locator('button', { hasText: 'SEO mặc định' }).click())
    await p.locator('#fld-title').fill('Phần mềm quản lý gara ô tô, website ngành ô tô | ChungAuto')
    await p.locator('.adm-pagehead button', { hasText: 'Lưu thay đổi' }).click()
    await settle(p, 800)
    const h2 = await (await fetch(B + '/')).text()
    check('cài đặt SEO: title trang chủ đổi', h2.includes('<title>Phần mềm quản lý gara ô tô, website ngành ô tô | ChungAuto</title>'))
    check('cài đặt SEO: xem trước Google', (await p.locator('.adm-serp').textContent()).includes('Phần mềm quản lý gara'))
  }

  // ============ 7. Kho mẫu: ẩn mẫu → website ẩn theo ============
  {
    await p.goto(B + '/admin/mau-phan-mem')
    await p.locator('.adm-table').getByText('AutoPro Garage').first().waitFor()
    const row = p.locator('.adm-table tbody tr', { hasText: 'AutoPro Garage' }).first()
    await row.locator('button[aria-label="Sửa"]').click()
    await p.locator('.adm-drawer').waitFor()
    await p.locator('.adm-drawer .adm-field', { hasText: 'Hiện trên website' }).locator('.adm-switch').click()
    await p.locator('.adm-drawer__foot .adm-btn--primary').click()
    await settle(p, 800)
    const r = await fetch(B + '/mau-phan-mem/autopro')
    check('ẩn mẫu trong quản trị → trang mẫu trả 404', r.status === 404, String(r.status))
    const item = (await api.get('/api/admin/catalog')).body.find((x) => x.slug === 'autopro')
    await api.patch(`/api/admin/catalog/${item.id}`, { visible: true })
  }

  // ============ 8. Đổi mật khẩu, đăng xuất ============
  {
    await p.goto(B + '/admin/doi-mat-khau')
    await p.locator('#fld-current').fill('SaiMatKhau9')
    await p.locator('#fld-next').fill('MatKhauMoi2026')
    await p.locator('#fld-again').fill('MatKhauMoi2026')
    await p.locator('form button[type=submit]').click()
    await settle(p, 800)
    check('đổi mật khẩu: sai mật khẩu hiện tại → báo lỗi', (await p.locator('.adm-field__err').textContent()).includes('không đúng'))
    await p.locator('.ca-user').click()
    await p.locator('.adm-pop button', { hasText: 'Đăng xuất' }).click()
    await p.waitForURL(/dang-nhap/)
    check('đăng xuất → về trang đăng nhập', p.url().includes('/admin/dang-nhap'))
    await p.goto(B + '/admin')
    await p.waitForURL(/dang-nhap/)
    check('sau đăng xuất không vào lại được', p.url().includes('/admin/dang-nhap'))
  }

  // ============ 9. Phân quyền trên giao diện (tài khoản kinh doanh) ============
  {
    const r = await api.post('/api/admin/users', { email: 'sales-e2e@test.local', name: 'Nhân viên Kinh doanh', role: 'sales', password: 'Matkhau123' })
    check('tạo tài khoản kinh doanh', r.status === 201)
    const s = await newPage()
    await s.goto(B + '/admin/dang-nhap')
    await s.locator('#lg-email').fill('sales-e2e@test.local')
    await s.locator('#lg-pass').fill('Matkhau123')
    await s.locator('.adm-login__form button[type=submit]').click()
    await s.locator('.adm-kpis').waitFor()
    const links = await s.locator('.adm-side__nav a').allTextContents()
    check('kinh doanh: không thấy Tài khoản / Nhật ký', !links.some((t) => /Tài khoản|Nhật ký/.test(t)), links.join(','))
    await s.goto(B + '/admin/tai-khoan')
    check('kinh doanh: mở thẳng /admin/tai-khoan → không có quyền', await visible(s.getByText('Không có quyền truy cập')))
    await s.goto(B + '/admin/mau-phan-mem')
    await s.locator('.adm-table').waitFor()
    check('kinh doanh: Kho mẫu chỉ xem (không có nút Sửa)', (await s.locator('button[aria-label="Sửa"]').count()) === 0)
    await s.goto(B + '/admin/cai-dat')
    await s.locator('.adm-note').waitFor()
    check('kinh doanh: cài đặt chỉ xem', (await s.locator('.adm-note').textContent()).includes('chỉ được xem') && (await s.locator('#fld-hotline').isDisabled()))
    check('kinh doanh: không lỗi giao diện', s.errors.length === 0, s.errors.join(' | '))
    await s.context().close()
  }

  // ============ 10. Điện thoại ============
  {
    const m = await newPage({ width: 375, height: 812 })
    await m.goto(B + '/', { waitUntil: 'networkidle' })
    check('điện thoại: trang chủ không tràn ngang', await noOverflow(m))
    await m.goto(B + '/admin/dang-nhap')
    await m.locator('#lg-email').fill(ADMIN.email)
    await m.locator('#lg-pass').fill(ADMIN.password)
    await m.locator('.adm-login__form button[type=submit]').click()
    await m.locator('.adm-kpis').waitFor()
    check('điện thoại: tổng quan không tràn ngang', await noOverflow(m))
    await m.locator('.adm-top__menu').click()
    await settle(m)
    check('điện thoại: mở menu bên', await m.locator('.adm-shell.nav-open').isVisible())
    await m.locator('.adm-side__nav a', { hasText: 'Yêu cầu tư vấn' }).click()
    await m.locator('.adm-pagehead h1').waitFor()
    check('điện thoại: danh sách yêu cầu không tràn ngang', await noOverflow(m))
    check('điện thoại: không lỗi', m.errors.length === 0, m.errors.join(' | '))
    await m.context().close()
  }

  // ============ 11. Trang quản trị demo của các mẫu vẫn chạy (dùng chung bộ giao diện) ============
  {
    const d = await newPage()
    await d.goto(B + '/quan-tri/autopro')
    await settle(d, 600)
    if (d.url().includes('dang-nhap')) {
      await d.locator('button', { hasText: 'Vào nhanh' }).click()
      await settle(d, 600)
    }
    check('demo quản trị mẫu: vào được', (await d.locator('.adm-side__nav a').count()) > 3)
    const link = d.locator('.adm-side__nav a').nth(1)
    await link.click()
    await d.locator('.adm-pagehead h1').waitFor()
    const add = d.locator('.adm-pagehead button', { hasText: 'Thêm' })
    if (await add.count()) {
      await add.first().click()
      await d.locator('.adm-drawer__foot .adm-btn--primary').click()
      await settle(d)
      check('demo quản trị mẫu: biểu mẫu vẫn kiểm tra dữ liệu', (await d.locator('.adm-field__err').count()) >= 1)
    }
    check('demo quản trị mẫu: không lỗi', d.errors.length === 0, d.errors.join(' | '))
    await d.context().close()
  }
  check('trang quản trị: không lỗi trong toàn bộ phiên', p.errors.length === 0, p.errors.join(' | '))

  // ============ 12. Bản tĩnh kiểu Vercel (dist/ dựng sẵn, không có máy chủ) ============
  {
    const st = express()
    const dist = resolve('dist')
    const page = (f) => (_req, res) => res.sendFile(join(dist, f))
    st.get('/mau-phan-mem', page('mau-phan-mem/index.html'))
    st.get('/mau-phan-mem/:slug', (req, res, next) => (existsSync(join(dist, 'mau-phan-mem', req.params.slug, 'index.html')) ? res.sendFile(join(dist, 'mau-phan-mem', req.params.slug, 'index.html')) : next()))
    st.get('/mau-landing-page', page('mau-landing-page/index.html'))
    st.get(/^\/(admin|quan-tri|demo|demo-landing|demo-du-an|preview|lp)(\/|$)/, page('app-shell.html'))
    st.use(express.static(dist, { redirect: false }))
    st.use((_req, res) => res.status(404).sendFile(join(dist, '404.html')))
    const srv = await new Promise((ok) => {
      const s = st.listen(0, '127.0.0.1', () => ok(s))
    })
    const S = `http://127.0.0.1:${srv.address().port}`
    const v = await newPage()
    for (const path of ['/', '/mau-phan-mem', '/mau-phan-mem?ht=rieng', '/mau-phan-mem?trang=2', '/mau-phan-mem/autopro', '/mau-phan-mem/autopro?c=1', '/khong-co-trang', '/demo/autopro']) {
      v.errors = []
      await v.goto(S + path, { waitUntil: 'networkidle' })
      await settle(v, 500)
      check(`bản tĩnh ${path}: không lỗi hydrate`, v.errors.length === 0, v.errors.join(' | '))
    }
    await v.goto(S + '/mau-phan-mem?trang=2', { waitUntil: 'networkidle' })
    check('bản tĩnh: ?trang=2 hiển thị đúng trang 2', (await v.locator('.g-pager [aria-current="page"]').textContent().catch(() => '')) === '2')
    await v.goto(S + '/khong-co-trang')
    check('bản tĩnh: trang lạ hiện 404', await visible(v.getByText('Không tìm thấy trang này')))
    await v.goto(S + '/admin')
    check('bản tĩnh: /admin báo chưa có máy chủ', await visible(v.getByText('Chưa kết nối được máy chủ')))
    await v.context().close()
    srv.close()
  }
} catch (e) {
  fails.push('LỖI KỊCH BẢN: ' + (e.stack || e))
  console.error(e)
} finally {
  await browser.close()
  server.close()
  await ctx.pool.end()
}

console.log(`\n${pass} PASS, ${fails.length} FAIL`)
if (fails.length) {
  console.log(fails.map((f) => ' - ' + f).join('\n'))
  process.exit(1)
}
