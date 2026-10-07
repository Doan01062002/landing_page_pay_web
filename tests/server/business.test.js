// Nghiệp vụ: form tư vấn công khai → yêu cầu tư vấn → khách hàng → hợp đồng → thu tiền; Kho mẫu; hỏi đáp; nhật ký.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { client, login, setup } from '../helpers.js'

let ctx, admin
beforeAll(async () => {
  ctx = await setup()
  admin = await login(ctx.app)
})
afterAll(() => ctx.pool.end())

const publicLead = (body) => request(ctx.app).post('/api/leads').set('User-Agent', 'vitest').send(body)

describe('form tư vấn công khai POST /api/leads', () => {
  it('lưu yêu cầu, chuẩn hoá số điện thoại, ghi trang gửi + UTM, nguồn Website', async () => {
    const r = await publicLead({ name: ' Nguyễn Văn An ', phone: '0901 234.567', type: 'Gara ô tô', branches: '2 – 5 chi nhánh', template: 'AutoPro Garage', note: 'Cần gọi sáng', page: '/mau-phan-mem/autopro', utm: { utm_source: 'facebook', utm_campaign: 'thang10' } })
    expect(r.status).toBe(201)
    expect(r.body.code).toMatch(/^TV\d{5}$/)
    const lead = (await admin.get('/api/admin/leads')).body.find((l) => l.code === r.body.code)
    expect(lead).toMatchObject({ name: 'Nguyễn Văn An', phone: '0901234567', businessType: 'Gara ô tô', branches: '2 – 5 chi nhánh', interest: 'AutoPro Garage', message: 'Cần gọi sáng', page: '/mau-phan-mem/autopro', source: 'Website', status: 'Mới', userAgent: 'vitest' })
    expect(lead.utm).toEqual({ utm_source: 'facebook', utm_campaign: 'thang10' })
    const logs = (await admin.get('/api/admin/audit')).body
    expect(logs.some((l) => l.summary.includes(r.body.code) && l.userName === 'Hệ thống')).toBe(true)
  })
  it('dữ liệu sai → 422 kèm lỗi từng trường', async () => {
    let r = await publicLead({ name: 'A', phone: '12345' })
    expect(r.status).toBe(422)
    expect(Object.keys(r.body.fields).sort()).toEqual(['name', 'phone'])
    r = await publicLead({ name: 'Tên dài'.repeat(30), phone: '0901234567' })
    expect(r.body.fields.name).toBeTruthy()
    r = await publicLead({ name: 'Bình', phone: '0901234567', utm: { utm_source: 'x'.repeat(200) } })
    expect(r.body.fields.utm).toBeTruthy()
    r = await publicLead({})
    expect(r.status).toBe(422)
  })
  it('bot điền ô bẫy → trả 201 nhưng không lưu', async () => {
    const before = (await admin.get('/api/admin/leads')).body.length
    const r = await publicLead({ name: 'Spam Bot', phone: '0909999999', website: 'http://spam.example' })
    expect(r.status).toBe(201)
    expect(r.body.code).toBeUndefined()
    expect((await admin.get('/api/admin/leads')).body.length).toBe(before)
  })
  it('nội dung có mã HTML được lưu nguyên văn (giao diện React tự escape khi hiển thị)', async () => {
    const r = await publicLead({ name: '<img src=x onerror=alert(1)>', phone: '0901234560' })
    expect(r.status).toBe(201)
    const lead = (await admin.get('/api/admin/leads')).body.find((l) => l.code === r.body.code)
    expect(lead.name).toBe('<img src=x onerror=alert(1)>')
  })
  it('gửi quá nhiều lần → 429', async () => {
    const small = await setup({ LEAD_RATE_LIMIT: '2' }, { reset: false })
    const go = () => request(small.app).post('/api/leads').send({ name: 'Liên tục', phone: '0901234561' })
    expect((await go()).status).toBe(201)
    expect((await go()).status).toBe(201)
    const r = await go()
    expect(r.status).toBe(429)
    expect(r.body.message).toMatch(/hotline/)
    expect(r.headers.ratelimit || r.headers['ratelimit-policy']).toBeTruthy()
    await small.pool.end()
  })
})

describe('yêu cầu tư vấn (quản trị)', () => {
  let lead
  it('thêm thủ công với giá trị mặc định', async () => {
    const r = await admin.post('/api/admin/leads', { name: 'Trần Bình', phone: '0912 345 678', source: 'Hotline' })
    expect(r.status).toBe(201)
    lead = r.body
    expect(lead).toMatchObject({ phone: '0912345678', status: 'Mới', source: 'Hotline', email: '', assignedTo: null })
  })
  it('sửa một phần không ghi đè trường khác', async () => {
    const me = (await admin.get('/api/auth/me')).body.user
    const r = await admin.patch(`/api/admin/leads/${lead.id}`, { status: 'Hẹn demo', assignedTo: me.id, nextFollow: '2026-12-01' })
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ name: 'Trần Bình', source: 'Hotline', status: 'Hẹn demo', assignedTo: me.id, assignedName: me.name, nextFollow: '2026-12-01' })
    const r2 = await admin.patch(`/api/admin/leads/${lead.id}`, { nextFollow: '' })
    expect(r2.body.nextFollow).toBeNull()
    expect(r2.body.status).toBe('Hẹn demo')
  })
  it('từ chối trạng thái / ngày / người phụ trách không hợp lệ', async () => {
    expect((await admin.patch(`/api/admin/leads/${lead.id}`, { status: 'Lạ' })).body.fields.status).toBeTruthy()
    expect((await admin.patch(`/api/admin/leads/${lead.id}`, { nextFollow: '2026-13-45' })).body.fields.nextFollow).toBeTruthy()
    expect((await admin.patch(`/api/admin/leads/${lead.id}`, { assignedTo: 999999 })).status).toBe(409)
    expect((await admin.patch(`/api/admin/leads/${lead.id}`, { email: 'khong-phai-email' })).body.fields.email).toBeTruthy()
  })
  it('không tồn tại → 404; mã sai định dạng → 422', async () => {
    expect((await admin.get('/api/admin/leads/999999')).status).toBe(404)
    expect((await admin.patch('/api/admin/leads/999999', { name: 'X' })).status).toBe(404)
    expect((await admin.del('/api/admin/leads/999999')).status).toBe(404)
    expect((await admin.get('/api/admin/leads/abc')).status).toBe(422)
  })
  it('cập nhật / xoá hàng loạt', async () => {
    const ids = []
    for (let i = 0; i < 3; i++) ids.push((await admin.post('/api/admin/leads', { name: `Hàng loạt ${i}`, phone: `090000000${i}` })).body.id)
    let r = await admin.post('/api/admin/leads/bulk-update', { ids, patch: { status: 'Đã liên hệ' } })
    expect(r.body).toEqual({ ok: true, updated: 3 })
    const all = (await admin.get('/api/admin/leads')).body.filter((l) => ids.includes(l.id))
    expect(all.every((l) => l.status === 'Đã liên hệ' && l.name.startsWith('Hàng loạt'))).toBe(true)
    expect((await admin.post('/api/admin/leads/bulk-update', { ids, patch: { status: 'Lạ' } })).status).toBe(422)
    expect((await admin.post('/api/admin/leads/bulk-update', { ids, patch: {} })).status).toBe(422)
    expect((await admin.post('/api/admin/leads/bulk-update', { ids: [], patch: { status: 'Mới' } })).status).toBe(422)
    expect((await admin.post('/api/admin/leads/bulk-delete', { ids: ['x'] })).status).toBe(422)
    r = await admin.post('/api/admin/leads/bulk-delete', { ids })
    expect(r.body).toEqual({ ok: true, deleted: 3 })
  })
})

describe('chuyển yêu cầu tư vấn thành hợp đồng', () => {
  it('tạo khách hàng + hợp đồng, chốt yêu cầu', async () => {
    const l = (await admin.post('/api/admin/leads', { name: 'Lê Chốt', phone: '0987654321', businessType: 'Gara ô tô', message: 'Cần web + phần mềm' })).body
    expect((await admin.post(`/api/admin/leads/${l.id}/convert`, { itemName: '' })).body.fields).toMatchObject({ itemName: expect.any(String), price: expect.any(String) })
    const r = await admin.post(`/api/admin/leads/${l.id}/convert`, { itemKind: 'template', itemSlug: 'autopro', itemName: 'AutoPro Garage', price: 3500000, package: 'Gói chuẩn', businessName: 'Gara Lê Chốt' })
    expect(r.status).toBe(201)
    expect(r.body.customerCode).toMatch(/^KH/)
    expect(r.body.orderCode).toMatch(/^HD/)
    const lead = (await admin.get(`/api/admin/leads/${l.id}`)).body
    expect(lead).toMatchObject({ status: 'Chốt hợp đồng', customerId: r.body.customerId, customerCode: r.body.customerCode, nextFollow: null })
    const order = (await admin.get(`/api/admin/orders/${r.body.orderId}`)).body
    expect(order).toMatchObject({ customerId: r.body.customerId, leadId: l.id, itemName: 'AutoPro Garage', price: 3500000, total: 3500000, paid: 0, remaining: 3500000, status: 'Báo giá', note: 'Cần web + phần mềm', businessName: 'Gara Lê Chốt' })
    const cus = (await admin.get(`/api/admin/customers/${r.body.customerId}`)).body
    expect(cus).toMatchObject({ name: 'Lê Chốt', phone: '0987654321', businessType: 'Gara ô tô', orderCount: 1 })
  })
  it('khách đã có (cùng số điện thoại) thì dùng lại, không tạo trùng', async () => {
    const before = (await admin.get('/api/admin/customers')).body.length
    const l = (await admin.post('/api/admin/leads', { name: 'Lê Chốt (lần 2)', phone: '0987654321' })).body
    const r = await admin.post(`/api/admin/leads/${l.id}/convert`, { itemName: 'Landing page', itemKind: 'landing', price: 0 })
    expect(r.status).toBe(201)
    expect((await admin.get('/api/admin/customers')).body.length).toBe(before)
    expect((await admin.get(`/api/admin/customers/${r.body.customerId}`)).body.orderCount).toBe(2)
  })
  it('yêu cầu không tồn tại → 404, không tạo gì (giao dịch huỷ)', async () => {
    const before = (await admin.get('/api/admin/orders')).body.length
    expect((await admin.post('/api/admin/leads/999999/convert', { itemName: 'X', price: 1 })).status).toBe(404)
    expect((await admin.get('/api/admin/orders')).body.length).toBe(before)
  })
})

describe('khách hàng · hợp đồng · thu tiền', () => {
  let cus, order
  beforeAll(async () => {
    cus = (await admin.post('/api/admin/customers', { name: 'Phạm Thu', phone: '0933333333', businessName: 'Rửa xe Thu', taxCode: '0101234567' })).body
  })
  it('thêm khách hàng có mã KH, kiểm tra số điện thoại / email', async () => {
    expect(cus.code).toMatch(/^KH/)
    const r = await admin.post('/api/admin/customers', { name: '', phone: '123', email: 'x' })
    expect(Object.keys(r.body.fields).sort()).toEqual(['email', 'name', 'phone'])
  })
  it('hợp đồng: giảm giá ≤ giá, hạn bàn giao ≥ ngày bắt đầu, khách phải tồn tại', async () => {
    let r = await admin.post('/api/admin/orders', { customerId: cus.id, itemName: 'Shine Detailing', price: 2900000, discount: 3000000 })
    expect(r.body.fields.discount).toBeTruthy()
    r = await admin.post('/api/admin/orders', { customerId: cus.id, itemName: 'Shine Detailing', price: 2900000, startDate: '2026-10-10', dueDate: '2026-10-01' })
    expect(r.body.fields.dueDate).toBeTruthy()
    r = await admin.post('/api/admin/orders', { customerId: 999999, itemName: 'X', price: 1 })
    expect(r.status).toBe(409)
    r = await admin.post('/api/admin/orders', { customerId: cus.id, itemName: 'X', price: -5 })
    expect(r.body.fields.price).toBeTruthy()
    r = await admin.post('/api/admin/orders', { customerId: cus.id, itemName: 'Shine Detailing', price: 2900000, discount: 400000, startDate: '2026-10-01', dueDate: '2026-10-20', domain: 'ruaxethu.vn' })
    expect(r.status).toBe(201)
    order = r.body
    expect(order).toMatchObject({ total: 2500000, paid: 0, remaining: 2500000, giftLanding: true, status: 'Báo giá', customerName: 'Phạm Thu' })
  })
  it('sửa một phần vẫn kiểm tra ràng buộc trên dữ liệu đã gộp', async () => {
    expect((await admin.patch(`/api/admin/orders/${order.id}`, { discount: 3000000 })).body.fields.discount).toBeTruthy()
    expect((await admin.patch(`/api/admin/orders/${order.id}`, { dueDate: '2026-09-01' })).body.fields.dueDate).toBeTruthy()
    const r = await admin.patch(`/api/admin/orders/${order.id}`, { status: 'Đã ký' })
    expect(r.body).toMatchObject({ status: 'Đã ký', discount: 400000, dueDate: '2026-10-20' })
  })
  it('thu tiền: không vượt số còn lại, tổng đã thu cập nhật đúng', async () => {
    let r = await admin.post('/api/admin/payments', { orderId: order.id, amount: 1000000, method: 'Tiền mặt', paidAt: '2026-10-02' })
    expect(r.status).toBe(201)
    const p1 = r.body
    expect(p1).toMatchObject({ code: expect.stringMatching(/^PT/), orderCode: order.code, customerName: 'Phạm Thu', paidAt: '2026-10-02', createdByName: expect.any(String) })
    r = await admin.post('/api/admin/payments', { orderId: order.id, amount: 1600000 })
    expect(r.status).toBe(422)
    expect(r.body.fields.amount).toMatch(/1\.500\.000/)
    expect((await admin.post('/api/admin/payments', { orderId: order.id, amount: 0 })).body.fields.amount).toBeTruthy()
    expect((await admin.post('/api/admin/payments', { orderId: order.id, amount: 100, method: 'Bitcoin' })).body.fields.method).toBeTruthy()
    expect((await admin.post('/api/admin/payments', { orderId: 999999, amount: 100 })).body.fields.orderId).toBeTruthy()
    r = await admin.post('/api/admin/payments', { orderId: order.id, amount: 1500000 })
    expect(r.status).toBe(201)
    const o = (await admin.get(`/api/admin/orders/${order.id}`)).body
    expect(o).toMatchObject({ paid: 2500000, remaining: 0 })
    // sửa phiếu thu: tính lại giới hạn trừ chính phiếu đó
    expect((await admin.patch(`/api/admin/payments/${p1.id}`, { amount: 1000001 })).status).toBe(422)
    expect((await admin.patch(`/api/admin/payments/${p1.id}`, { amount: 900000 })).status).toBe(200)
    expect((await admin.get(`/api/admin/orders/${order.id}`)).body.remaining).toBe(100000)
    const c = (await admin.get('/api/admin/customers')).body.find((x) => x.id === cus.id)
    expect(c.paidTotal).toBe(2400000)
  })
  it('không giảm giá hợp đồng xuống dưới số đã thu', async () => {
    const r = await admin.patch(`/api/admin/orders/${order.id}`, { price: 2000000, discount: 0 })
    expect(r.status).toBe(422)
    expect(r.body.fields.price).toMatch(/2\.400\.000/)
    expect((await admin.patch(`/api/admin/orders/${order.id}`, { price: 2400000, discount: 0 })).status).toBe(200)
    expect((await admin.patch(`/api/admin/orders/${order.id}`, { price: 2900000, discount: 400000 })).status).toBe(200)
  })
  it('cập nhật hàng loạt: đổi trạng thái được, không sửa giá / ngày / phiếu thu hàng loạt', async () => {
    expect((await admin.post('/api/admin/orders/bulk-update', { ids: [order.id], patch: { status: 'Đang triển khai' } })).body.updated).toBe(1)
    expect((await admin.post('/api/admin/orders/bulk-update', { ids: [order.id], patch: { price: 1 } })).status).toBe(422)
    expect((await admin.post('/api/admin/orders/bulk-update', { ids: [order.id], patch: { dueDate: '2020-01-01' } })).status).toBe(422)
    const pid = (await admin.get('/api/admin/payments')).body[0].id
    expect((await admin.post('/api/admin/payments/bulk-update', { ids: [pid], patch: { method: 'Thẻ' } })).status).toBe(422)
  })
  it('hợp đồng đã huỷ không thu thêm tiền', async () => {
    const o = (await admin.post('/api/admin/orders', { customerId: cus.id, itemName: 'Huỷ', price: 1000000 })).body
    await admin.patch(`/api/admin/orders/${o.id}`, { status: 'Đã huỷ' })
    const r = await admin.post('/api/admin/payments', { orderId: o.id, amount: 1000 })
    expect(r.body.fields.orderId).toMatch(/huỷ/)
  })
  it('không xoá được khách còn hợp đồng (409); xoá hợp đồng xoá luôn phiếu thu', async () => {
    const r = await admin.del(`/api/admin/customers/${cus.id}`)
    expect(r.status).toBe(409)
    expect(r.body.error).toBe('in_use')
    expect((await admin.post('/api/admin/customers/bulk-delete', { ids: [cus.id] })).status).toBe(409)
    const orders = (await admin.get('/api/admin/orders')).body.filter((o) => o.customerId === cus.id)
    for (const o of orders) expect((await admin.del(`/api/admin/orders/${o.id}`)).status).toBe(200)
    expect((await admin.get('/api/admin/payments')).body.filter((p) => orders.some((o) => o.id === p.orderId))).toHaveLength(0)
    expect((await admin.del(`/api/admin/customers/${cus.id}`)).status).toBe(200)
  })
})

describe('Kho mẫu & hỏi đáp', () => {
  it('Kho mẫu: chỉ sửa, không thêm / xoá qua API', async () => {
    const list = (await admin.get('/api/admin/catalog')).body
    expect(list.length).toBeGreaterThan(10)
    const t = list.find((x) => x.kind === 'template')
    expect((await admin.post('/api/admin/catalog', { name: 'Mới' })).status).toBe(404)
    expect((await admin.del(`/api/admin/catalog/${t.id}`)).status).toBe(404)
    const r = await admin.patch(`/api/admin/catalog/${t.id}`, { price: 4200000, featured: true, popularity: 99 })
    expect(r.body).toMatchObject({ price: 4200000, featured: true, popularity: 99, slug: t.slug, kind: 'template' })
    expect((await admin.patch(`/api/admin/catalog/${t.id}`, { price: null })).body.price).toBeNull()
    expect((await admin.patch(`/api/admin/catalog/${t.id}`, { name: '' })).status).toBe(422)
    expect((await admin.patch(`/api/admin/catalog/${t.id}`, { popularity: 5000 })).status).toBe(422)
    expect((await admin.patch(`/api/admin/catalog/${t.id}`, { slug: 'doi-slug' })).body.slug).toBe(t.slug) // slug không sửa được
  })
  it('hỏi đáp: thêm / sửa / xoá', async () => {
    const r = await admin.post('/api/admin/faqs', { question: 'Có hỗ trợ trả góp không?', answer: 'Có, qua thẻ tín dụng.', sortOrder: 99 })
    expect(r.status).toBe(201)
    expect(r.body.visible).toBe(true)
    expect((await admin.patch(`/api/admin/faqs/${r.body.id}`, { visible: false })).body.visible).toBe(false)
    expect((await admin.post('/api/admin/faqs', { question: '', answer: '' })).status).toBe(422)
    expect((await admin.del(`/api/admin/faqs/${r.body.id}`)).status).toBe(200)
  })
})

describe('nhật ký & API khác', () => {
  it('ghi lại ai làm gì, mới nhất trước', async () => {
    const logs = (await admin.get('/api/admin/audit')).body
    expect(logs.length).toBeGreaterThan(10)
    expect(new Date(logs[0].createdAt) >= new Date(logs[logs.length - 1].createdAt)).toBe(true)
    const kinds = new Set(logs.map((l) => l.action))
    for (const k of ['create', 'update', 'delete', 'convert', 'login']) expect(kinds.has(k), k).toBe(true)
    expect(logs.some((l) => /Đã ký|Báo giá → Đã ký/.test(l.summary))).toBe(true)
  })
  it('danh sách nhân viên để chọn người phụ trách không lộ email / mật khẩu', async () => {
    const r = await admin.get('/api/admin/staff')
    expect(Object.keys(r.body[0]).sort()).toEqual(['active', 'id', 'name', 'role'])
  })
  it('API không tồn tại → 404 JSON; health kiểm tra database', async () => {
    const r = await request(ctx.app).get('/api/khong-co')
    expect(r.status).toBe(404)
    expect(r.body.error).toBe('not_found')
    const h = await request(ctx.app).get('/api/health')
    expect(h.body.ok).toBe(true)
    expect((await client(ctx.app).get('/api/admin/khong-co')).status).toBe(401)
  })
  it('header bảo mật', async () => {
    const r = await request(ctx.app).get('/api/health')
    expect(r.headers['x-powered-by']).toBeUndefined()
    expect(r.headers['x-content-type-options']).toBe('nosniff')
    expect(r.headers['x-frame-options']).toBeTruthy()
    expect(r.headers['strict-transport-security']).toBeTruthy()
  })
})

describe('thông báo đã xem', () => {
  it('lưu theo từng tài khoản, không trùng, đọc lại được', async () => {
    expect((await admin.get('/api/admin/notifications/seen')).body).toEqual({ keys: [] })
    let r = await admin.post('/api/admin/notifications/seen', { keys: ['leads:1:new', 'orders:2:due:2026-10-01', 'leads:1:new'] })
    expect(r.body).toEqual({ ok: true })
    r = await admin.post('/api/admin/notifications/seen', { keys: ['leads:1:new', 'leads:3:follow:2026-10-09'] })
    expect((await admin.get('/api/admin/notifications/seen')).body.keys.sort()).toEqual(['leads:1:new', 'leads:3:follow:2026-10-09', 'orders:2:due:2026-10-01'])
    // tài khoản khác không bị ảnh hưởng
    await admin.post('/api/admin/users', { email: 'thongbao@test.local', name: 'NV thông báo', role: 'sales', password: 'Matkhau123' })
    const other = await login(ctx.app, 'thongbao@test.local', 'Matkhau123')
    expect((await other.get('/api/admin/notifications/seen')).body.keys).toEqual([])
  })
  it('kiểm tra dữ liệu, bắt buộc đăng nhập + chống CSRF', async () => {
    expect((await admin.post('/api/admin/notifications/seen', { keys: [] })).status).toBe(422)
    expect((await admin.post('/api/admin/notifications/seen', { keys: ['x'.repeat(121)] })).status).toBe(422)
    expect((await admin.post('/api/admin/notifications/seen', { keys: 'leads:1:new' })).status).toBe(422)
    expect((await client(ctx.app).get('/api/admin/notifications/seen')).status).toBe(401)
    expect((await admin.agent.post('/api/admin/notifications/seen').send({ keys: ['a'] })).status).toBe(403)
  })
  it('mục quá 180 ngày tự hết hạn (báo lại nếu sự việc vẫn còn)', async () => {
    await ctx.pool.query(`UPDATE notification_seen SET seen_at = now() - interval '200 days' WHERE key = 'orders:2:due:2026-10-01'`)
    expect((await admin.get('/api/admin/notifications/seen')).body.keys).not.toContain('orders:2:due:2026-10-01')
    await admin.post('/api/admin/notifications/seen', { keys: ['z'] })
    expect((await ctx.pool.query(`SELECT count(*)::int AS n FROM notification_seen WHERE key = 'orders:2:due:2026-10-01'`)).rows[0].n).toBe(0)
  })
})
