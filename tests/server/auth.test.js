// Đăng nhập, phiên, chống CSRF, khoá tài khoản khi nhập sai, đổi mật khẩu, giới hạn tần suất.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { ADMIN, client, login, setup, userWithRole } from '../helpers.js'

let ctx
beforeAll(async () => {
  ctx = await setup({ MAX_FAILED_LOGINS: '3', LOCK_MINUTES: '15' })
})
afterAll(() => ctx.pool.end())

const q = (text, values) => ctx.pool.query(text, values)

describe('đăng nhập', () => {
  it('đúng email + mật khẩu: trả thông tin, đặt cookie httpOnly SameSite=Lax', async () => {
    const c = client(ctx.app)
    const r = await c.post('/api/auth/login', { email: ADMIN.email, password: ADMIN.password })
    expect(r.status).toBe(200)
    expect(r.body.user).toMatchObject({ email: ADMIN.email, role: 'admin', roleLabel: 'Quản trị viên' })
    expect(r.body.user.passwordHash).toBeUndefined()
    const cookie = r.headers['set-cookie'].find((s) => s.startsWith('ca_sid='))
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).toMatch(/Path=\//)
    // DB chỉ lưu SHA-256 của token
    const token = cookie.split(';')[0].split('=')[1]
    expect((await q('SELECT count(*)::int AS n FROM sessions WHERE token_hash = $1', [token])).rows[0].n).toBe(0)
    const me = await c.get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.user.email).toBe(ADMIN.email)
    expect(me.body.perms.users).toBe('rwd')
  })
  it('email không phân biệt hoa thường, có khoảng trắng thừa', async () => {
    const r = await client(ctx.app).post('/api/auth/login', { email: `  ${ADMIN.email.toUpperCase()} `, password: ADMIN.password })
    expect(r.status).toBe(200)
  })
  it('sai mật khẩu và email không tồn tại trả cùng một thông báo (không lộ email)', async () => {
    const a = await client(ctx.app).post('/api/auth/login', { email: 'khongco@test.local', password: 'Sai12345' })
    const { user } = await userWithRole(ctx.app, await login(ctx.app), 'sales', 'saimk@test.local')
    const b = await client(ctx.app).post('/api/auth/login', { email: 'saimk@test.local', password: 'Sai12345' })
    expect(a.status).toBe(401)
    expect(b.status).toBe(401)
    expect(a.body).toEqual(b.body)
    expect(a.headers['set-cookie']).toBeUndefined()
    await q('UPDATE users SET failed_attempts = 0 WHERE id = $1', [user.id])
  })
  it('thiếu email / mật khẩu → 422 kèm lỗi từng trường', async () => {
    const r = await client(ctx.app).post('/api/auth/login', {})
    expect(r.status).toBe(422)
    expect(Object.keys(r.body.fields).sort()).toEqual(['email', 'password'])
  })
  it('JSON hỏng → 400', async () => {
    const r = await request(ctx.app).post('/api/auth/login').set('x-ca-csrf', '1').set('content-type', 'application/json').send('{"email":')
    expect(r.status).toBe(400)
    expect(r.body.error).toBe('bad_json')
  })
})

describe('chống CSRF', () => {
  it('thiếu header x-ca-csrf → 403', async () => {
    const r = await request(ctx.app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password })
    expect(r.status).toBe(403)
    expect(r.body.error).toBe('csrf')
  })
  it('Origin khác máy chủ → 403; cùng máy chủ → cho qua', async () => {
    const bad = await request(ctx.app).post('/api/auth/login').set('x-ca-csrf', '1').set('Origin', 'https://evil.example').send({ email: ADMIN.email, password: ADMIN.password })
    expect(bad.status).toBe(403)
    const junk = await request(ctx.app).post('/api/auth/login').set('x-ca-csrf', '1').set('Origin', 'not a url').send({ email: ADMIN.email, password: ADMIN.password })
    expect(junk.status).toBe(403)
    const ok = await request(ctx.app).post('/api/auth/login').set('Host', 'chungauto.vn').set('x-ca-csrf', '1').set('Origin', 'https://chungauto.vn').send({ email: ADMIN.email, password: ADMIN.password })
    expect(ok.status).toBe(200)
  })
  it('thao tác ghi trong trang quản trị cũng bắt buộc header', async () => {
    const c = await login(ctx.app)
    const r = await c.agent.post('/api/admin/faqs').send({ question: 'Hỏi?', answer: 'Đáp' })
    expect(r.status).toBe(403)
    const get = await c.agent.get('/api/admin/faqs')
    expect(get.status).toBe(200) // đọc không cần header
  })
})

describe('phiên đăng nhập', () => {
  it('chưa đăng nhập → 401 cho /auth/me và mọi API quản trị', async () => {
    for (const p of ['/api/auth/me', '/api/admin/leads', '/api/admin/users', '/api/admin/settings', '/api/admin/audit', '/api/admin/staff']) {
      const r = await request(ctx.app).get(p)
      expect(r.status, p).toBe(401)
    }
  })
  it('cookie giả / hết hạn → 401', async () => {
    const r = await request(ctx.app).get('/api/auth/me').set('Cookie', 'ca_sid=gia-mao')
    expect(r.status).toBe(401)
    const c = await login(ctx.app)
    await q(`UPDATE sessions SET expires_at = now() - interval '1 minute'`)
    expect((await c.get('/api/auth/me')).status).toBe(401)
  })
  it('đăng xuất xoá phiên trên máy chủ (cookie cũ không dùng lại được)', async () => {
    const c = client(ctx.app)
    const r = await c.post('/api/auth/login', { email: ADMIN.email, password: ADMIN.password })
    const cookie = r.headers['set-cookie'][0].split(';')[0]
    expect((await request(ctx.app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(200)
    const out = await c.post('/api/auth/logout')
    expect(out.status).toBe(200)
    expect(out.headers['set-cookie'][0]).toMatch(/ca_sid=;/)
    expect((await c.get('/api/auth/me')).status).toBe(401)
    expect((await request(ctx.app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(401)
  })
  it('tài khoản bị vô hiệu hoá: phiên đang mở mất hiệu lực, không đăng nhập lại được', async () => {
    const admin = await login(ctx.app)
    const s = await userWithRole(ctx.app, admin, 'sales', 'nghiviec@test.local')
    expect((await s.client.get('/api/auth/me')).status).toBe(200)
    expect((await admin.patch(`/api/admin/users/${s.user.id}`, { active: false })).status).toBe(200)
    expect((await s.client.get('/api/auth/me')).status).toBe(401)
    const r = await client(ctx.app).post('/api/auth/login', { email: 'nghiviec@test.local', password: s.password })
    expect(r.status).toBe(403)
    expect(r.body.error).toBe('inactive')
  })
})

describe('khoá tạm khi nhập sai nhiều lần', () => {
  it(`sai 3 lần → khoá (423), kể cả nhập đúng; quản trị mở khoá được`, async () => {
    const admin = await login(ctx.app)
    const s = await userWithRole(ctx.app, admin, 'sales', 'khoa@test.local')
    const bad = () => client(ctx.app).post('/api/auth/login', { email: 'khoa@test.local', password: 'SaiRoi123' })
    expect((await bad()).status).toBe(401)
    expect((await bad()).status).toBe(401)
    expect((await bad()).status).toBe(401) // lần thứ 3: khoá
    const locked = await client(ctx.app).post('/api/auth/login', { email: 'khoa@test.local', password: s.password })
    expect(locked.status).toBe(423)
    expect(locked.body.message).toMatch(/15 phút/)
    const logs = await admin.get('/api/admin/audit')
    expect(logs.body.some((l) => l.action === 'lock' && l.summary.includes('khoa@test.local'))).toBe(true)
    // mở khoá
    expect((await admin.patch(`/api/admin/users/${s.user.id}`, { unlock: true })).status).toBe(200)
    expect((await client(ctx.app).post('/api/auth/login', { email: 'khoa@test.local', password: s.password })).status).toBe(200)
  })
  it('đăng nhập đúng thì đặt lại bộ đếm sai', async () => {
    const admin = await login(ctx.app)
    await userWithRole(ctx.app, admin, 'sales', 'dem@test.local')
    const bad = () => client(ctx.app).post('/api/auth/login', { email: 'dem@test.local', password: 'SaiRoi123' })
    await bad()
    await bad()
    await login(ctx.app, 'dem@test.local', 'Matkhau123')
    await bad()
    await bad()
    expect((await client(ctx.app).post('/api/auth/login', { email: 'dem@test.local', password: 'Matkhau123' })).status).toBe(200)
  })
  it('hết thời gian khoá thì đăng nhập lại được', async () => {
    const admin = await login(ctx.app)
    const s = await userWithRole(ctx.app, admin, 'sales', 'hethan@test.local')
    await q(`UPDATE users SET locked_until = now() - interval '1 second' WHERE id = $1`, [s.user.id])
    expect((await client(ctx.app).post('/api/auth/login', { email: 'hethan@test.local', password: s.password })).status).toBe(200)
  })
})

describe('đổi mật khẩu', () => {
  it('kiểm tra mật khẩu hiện tại, độ mạnh, khác mật khẩu cũ', async () => {
    const admin = await login(ctx.app)
    const s = await userWithRole(ctx.app, admin, 'editor', 'doimk@test.local')
    const c = s.client
    let r = await c.post('/api/auth/password', { current: 'Sai123456', next: 'MoiMoi123' })
    expect(r.status).toBe(422)
    expect(r.body.fields.current).toBeTruthy()
    r = await c.post('/api/auth/password', { current: s.password, next: 'ngan1' })
    expect(r.body.fields.next).toMatch(/8 ký tự/)
    r = await c.post('/api/auth/password', { current: s.password, next: 'chiconchu' })
    expect(r.body.fields.next).toMatch(/chữ và số/)
    r = await c.post('/api/auth/password', { current: s.password, next: s.password })
    expect(r.body.fields.next).toMatch(/khác/)
  })
  it('đổi thành công: phiên hiện tại giữ, phiên khác bị đăng xuất, mật khẩu cũ hết dùng', async () => {
    const admin = await login(ctx.app)
    const s = await userWithRole(ctx.app, admin, 'editor', 'doimk2@test.local')
    const other = await login(ctx.app, 'doimk2@test.local', s.password)
    const r = await s.client.post('/api/auth/password', { current: s.password, next: 'MatKhauMoi9' })
    expect(r.status).toBe(200)
    expect((await s.client.get('/api/auth/me')).status).toBe(200)
    expect((await other.get('/api/auth/me')).status).toBe(401)
    expect((await client(ctx.app).post('/api/auth/login', { email: 'doimk2@test.local', password: s.password })).status).toBe(401)
    await login(ctx.app, 'doimk2@test.local', 'MatKhauMoi9')
  })
  it('chưa đăng nhập → 401', async () => {
    expect((await client(ctx.app).post('/api/auth/password', { current: 'a', next: 'b' })).status).toBe(401)
  })
})

describe('giới hạn tần suất đăng nhập', () => {
  it('vượt giới hạn → 429', async () => {
    const small = await setup({ LOGIN_RATE_LIMIT: '3' }, { reset: false })
    const go = () => client(small.app).post('/api/auth/login', { email: 'x@test.local', password: 'Sai12345' })
    expect((await go()).status).toBe(401)
    expect((await go()).status).toBe(401)
    expect((await go()).status).toBe(401)
    const r = await go()
    expect(r.status).toBe(429)
    expect(r.body.error).toBe('rate_limited')
    await small.pool.end()
  })
})
