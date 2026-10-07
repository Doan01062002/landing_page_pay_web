// Phân quyền theo vai trò và quản lý tài khoản quản trị.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PERMS } from '../../server/auth.js'
import { ADMIN, client, login, setup, userWithRole } from '../helpers.js'

let ctx, admin
const roles = {}
beforeAll(async () => {
  ctx = await setup()
  admin = await login(ctx.app)
  for (const r of ['manager', 'sales', 'editor']) roles[r] = await userWithRole(ctx.app, admin, r, `${r}@test.local`)
})
afterAll(() => ctx.pool.end())

const as = (role) => (role === 'admin' ? admin : roles[role].client)
const RES = ['leads', 'customers', 'orders', 'payments', 'catalog', 'faqs', 'users', 'audit']

describe('ma trận quyền xem', () => {
  for (const role of ['admin', 'manager', 'sales', 'editor'])
    it(`${role}: chỉ xem được bảng được phép`, async () => {
      for (const res of RES) {
        const r = await as(role).get(`/api/admin/${res}`)
        expect(r.status, `${role} GET ${res}`).toBe((PERMS[role][res] || '').includes('r') ? 200 : 403)
      }
      const s = await as(role).get('/api/admin/settings')
      expect(s.status).toBe(200) // mọi vai trò đều xem được cài đặt
      expect((await as(role).get('/api/admin/staff')).status).toBe(200)
    })
  it('/auth/me trả đúng bảng quyền của vai trò', async () => {
    for (const role of ['manager', 'sales', 'editor']) expect((await as(role).get('/api/auth/me')).body.perms).toEqual(PERMS[role])
  })
})

describe('quyền ghi / xoá', () => {
  it('kinh doanh: thêm / sửa / xoá yêu cầu tư vấn; không xoá khách hàng; không sửa Kho mẫu, cài đặt', async () => {
    const c = as('sales')
    const lead = await c.post('/api/admin/leads', { name: 'Khách A', phone: '0901111111' })
    expect(lead.status).toBe(201)
    expect((await c.patch(`/api/admin/leads/${lead.body.id}`, { status: 'Đã liên hệ' })).status).toBe(200)
    const cus = await c.post('/api/admin/customers', { name: 'Khách B', phone: '0902222222' })
    expect(cus.status).toBe(201)
    expect((await c.del(`/api/admin/customers/${cus.body.id}`)).status).toBe(403)
    expect((await c.post('/api/admin/customers/bulk-delete', { ids: [cus.body.id] })).status).toBe(403)
    const cat = (await c.get('/api/admin/catalog')).body[0]
    expect((await c.patch(`/api/admin/catalog/${cat.id}`, { visible: false })).status).toBe(403)
    expect((await c.put('/api/admin/settings/seo', { title: 'Tiêu đề mới đủ dài', description: 'x'.repeat(60), image: '' })).status).toBe(403)
    expect((await c.del(`/api/admin/leads/${lead.body.id}`)).status).toBe(200)
  })
  it('biên tập: sửa Kho mẫu, hỏi đáp, cài đặt; không đụng tới khách / tiền', async () => {
    const c = as('editor')
    const cat = (await c.get('/api/admin/catalog')).body[0]
    expect((await c.patch(`/api/admin/catalog/${cat.id}`, { summary: 'Mô tả mới' })).status).toBe(200)
    const f = await c.post('/api/admin/faqs', { question: 'Câu hỏi biên tập?', answer: 'Trả lời' })
    expect(f.status).toBe(201)
    expect((await c.del(`/api/admin/faqs/${f.body.id}`)).status).toBe(200)
    expect((await c.post('/api/admin/leads', { name: 'X', phone: '0903333333' })).status).toBe(403)
    expect((await c.post('/api/admin/payments', { orderId: 1, amount: 1000 })).status).toBe(403)
    expect((await c.post('/api/admin/leads/1/convert', { itemName: 'X', price: 1 })).status).toBe(403)
  })
  it('quản lý: toàn quyền nghiệp vụ, không quản lý tài khoản', async () => {
    const c = as('manager')
    expect((await c.post('/api/admin/users', { email: 'moi@test.local', name: 'Mới', role: 'sales', password: 'Matkhau123' })).status).toBe(403)
    expect((await c.patch(`/api/admin/users/${roles.sales.user.id}`, { role: 'admin' })).status).toBe(403)
    expect((await c.del(`/api/admin/users/${roles.sales.user.id}`)).status).toBe(403)
    const cus = await c.post('/api/admin/customers', { name: 'Xoá được', phone: '0904444444' })
    expect((await c.del(`/api/admin/customers/${cus.body.id}`)).status).toBe(200)
  })
  it('không ai sửa / xoá được nhật ký', async () => {
    expect((await admin.post('/api/admin/audit', {})).status).toBe(404)
    expect((await admin.del('/api/admin/audit/1')).status).toBe(404)
  })
})

describe('quản lý tài khoản', () => {
  it('danh sách không lộ mật khẩu băm', async () => {
    const r = await admin.get('/api/admin/users')
    expect(r.status).toBe(200)
    for (const u of r.body) {
      expect(u.passwordHash).toBeUndefined()
      expect(u.password_hash).toBeUndefined()
    }
  })
  it('kiểm tra dữ liệu khi thêm: email, vai trò, mật khẩu, trùng email', async () => {
    let r = await admin.post('/api/admin/users', { email: 'sai', name: '', role: 'boss', password: 'Matkhau123' })
    expect(r.status).toBe(422)
    expect(Object.keys(r.body.fields).sort()).toEqual(['email', 'name', 'role'])
    r = await admin.post('/api/admin/users', { email: 'yeu@test.local', name: 'Yếu', role: 'sales', password: '12345678' })
    expect(r.body.fields.password).toMatch(/chữ và số/)
    r = await admin.post('/api/admin/users', { email: 'SALES@test.local', name: 'Trùng', role: 'sales', password: 'Matkhau123' })
    expect(r.status).toBe(409)
    expect(r.body.fields.email).toBeTruthy()
  })
  it('không tự đổi vai trò / tự khoá / tự xoá chính mình', async () => {
    const me = (await admin.get('/api/auth/me')).body.user
    expect((await admin.patch(`/api/admin/users/${me.id}`, { role: 'sales' })).status).toBe(422)
    expect((await admin.patch(`/api/admin/users/${me.id}`, { active: false })).status).toBe(422)
    expect((await admin.del(`/api/admin/users/${me.id}`)).status).toBe(409)
    expect((await admin.patch(`/api/admin/users/${me.id}`, { name: 'Quản trị đổi tên' })).body.name).toBe('Quản trị đổi tên')
  })
  it('luôn còn ít nhất một quản trị viên hoạt động', async () => {
    const a2 = await userWithRole(ctx.app, admin, 'admin', 'admin2@test.local')
    const me = (await admin.get('/api/auth/me')).body.user
    // admin2 hạ quyền admin gốc được vì vẫn còn admin2
    expect((await a2.client.patch(`/api/admin/users/${me.id}`, { role: 'manager' })).status).toBe(200)
    // giờ admin2 là quản trị viên duy nhất: không ai hạ / khoá / xoá được
    const meAgain = await login(ctx.app)
    expect((await meAgain.get('/api/admin/users')).status).toBe(403)
    expect((await a2.client.patch(`/api/admin/users/${a2.user.id}`, { role: 'manager' })).status).toBe(422)
    // khôi phục
    expect((await a2.client.patch(`/api/admin/users/${me.id}`, { role: 'admin' })).status).toBe(200)
    admin = await login(ctx.app)
    expect((await admin.del(`/api/admin/users/${a2.user.id}`)).status).toBe(200)
    expect((await admin.patch(`/api/admin/users/${me.id}`, { active: true })).status).toBe(200)
  })
  it('quản trị viên khác xoá / tạo lại được tài khoản quản trị; không tự xoá mình', async () => {
    const me = (await admin.get('/api/auth/me')).body.user
    const a3 = await userWithRole(ctx.app, admin, 'admin', 'admin3@test.local')
    await a3.client.patch(`/api/admin/users/${me.id}`, { active: false })
    expect((await a3.client.del(`/api/admin/users/${me.id}`)).status).toBe(200)
    const r = await a3.client.post('/api/admin/users', { email: ADMIN.email, name: 'Quản trị Test', role: 'admin', password: ADMIN.password })
    expect(r.status).toBe(201)
    admin = await login(ctx.app)
    // a3 không xoá được chính mình; admin gốc xoá a3 được (vì còn admin gốc)
    expect((await a3.client.del(`/api/admin/users/${a3.user.id}`)).status).toBe(409)
    expect((await admin.del(`/api/admin/users/${a3.user.id}`)).status).toBe(200)
  })
  it('đặt lại mật khẩu cho nhân viên: đăng xuất mọi phiên của người đó', async () => {
    const s = await userWithRole(ctx.app, admin, 'sales', 'datlai@test.local')
    expect((await admin.patch(`/api/admin/users/${s.user.id}`, { password: 'ngan' })).status).toBe(422)
    expect((await admin.patch(`/api/admin/users/${s.user.id}`, { password: 'DatLai2026' })).status).toBe(200)
    expect((await s.client.get('/api/auth/me')).status).toBe(401)
    await login(ctx.app, 'datlai@test.local', 'DatLai2026')
  })
  it('tài khoản không tồn tại → 404', async () => {
    expect((await admin.patch('/api/admin/users/999999', { name: 'X' })).status).toBe(404)
    expect((await admin.del('/api/admin/users/999999')).status).toBe(404)
  })
  it('mọi thay đổi tài khoản được ghi nhật ký', async () => {
    const logs = (await admin.get('/api/admin/audit')).body.filter((l) => l.entity === 'users').map((l) => l.summary)
    expect(logs.some((s) => s.includes('Thêm tài khoản sales@test.local'))).toBe(true)
    expect(logs.some((s) => s.includes('đặt lại mật khẩu'))).toBe(true)
    expect(logs.some((s) => s.startsWith('Xoá tài khoản'))).toBe(true)
  })
  it('người không đăng nhập không truy cập được', async () => {
    expect((await client(ctx.app).post('/api/admin/users', { email: 'h@x.vn', name: 'H', role: 'admin', password: 'Matkhau123' })).status).toBe(401)
  })
})
