// Chạy trên Vercel: hàm serverless api/index.js (website + API + quản trị) và chế độ chưa có database.
// Cần bản dựng (npm run build hoặc build:vercel).
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { getConfig } from '../../server/config.js'
import { createApp, loadRenderer } from '../../server/app.js'
import { ADMIN, TEST_DB, setup } from '../helpers.js'

describe('chưa đặt DATABASE_URL: website vẫn chạy bằng dữ liệu mặc định', () => {
  let app
  beforeAll(async () => {
    const cfg = getConfig({ COOKIE_SECURE: 'false' })
    app = createApp({ pool: null, cfg, renderer: await loadRenderer(cfg) })
  })
  it('trang công khai dựng đủ HTML + SEO', async () => {
    const r = await request(app).get('/')
    expect(r.status).toBe(200)
    expect(r.text).toMatch(/<title>[^<]*ChungAuto<\/title>/)
    expect(r.text).toContain('application/ld+json')
    expect((await request(app).get('/mau-phan-mem/autopro')).status).toBe(200)
    expect((await request(app).get('/khong-co')).status).toBe(404)
    expect((await request(app).get('/sitemap.xml')).text).toContain('/mau-phan-mem/autopro<')
  })
  it('API báo 503 no_database (form tư vấn lưu tạm phía trình duyệt, quản trị báo chưa kết nối)', async () => {
    const h = await request(app).get('/api/health')
    expect(h.body).toEqual({ ok: true, database: false })
    expect((await request(app).get('/api/public/bootstrap')).body.site.brand).toBeTruthy()
    for (const [m, p] of [['post', '/api/leads'], ['get', '/api/auth/me'], ['post', '/api/auth/login'], ['get', '/api/admin/leads']]) {
      const r = await request(app)[m](p).set('x-ca-csrf', '1').send({})
      expect(r.status, p).toBe(503)
      expect(r.body.error).toBe('no_database')
    }
  })
})

describe('hàm Vercel api/index.js với database', () => {
  let handler, ctx
  const saved = { ...process.env }
  beforeAll(async () => {
    ctx = await setup() // database test sạch + tài khoản quản trị
    Object.assign(process.env, { DATABASE_URL: TEST_DB, COOKIE_SECURE: 'false', TRUST_PROXY: 'false', VERCEL_PROJECT_PRODUCTION_URL: 'chungauto.vercel.app' })
    handler = (await import('../../api/index.js')).default
  })
  afterAll(async () => {
    process.env = saved
    await ctx.pool.end()
  })
  it('dựng trang từ database, canonical theo tên miền production Vercel', async () => {
    const r = await request(handler).get('/')
    expect(r.status).toBe(200)
    expect(r.text).toContain('<link rel="canonical" href="https://chungauto.vercel.app/">')
    expect((await request(handler).get('/robots.txt')).text).toContain('Sitemap: https://chungauto.vercel.app/sitemap.xml')
    expect((await request(handler).get('/api/health')).body.ok).toBe(true)
  })
  it('đăng nhập quản trị, sửa Kho mẫu → trang cập nhật ngay', async () => {
    const agent = request.agent(handler)
    const login = await agent.post('/api/auth/login').set('x-ca-csrf', '1').send(ADMIN)
    expect(login.status).toBe(200)
    const item = (await agent.get('/api/admin/catalog')).body.find((x) => x.slug === 'autopro')
    expect((await agent.patch(`/api/admin/catalog/${item.id}`).set('x-ca-csrf', '1').send({ visible: false })).status).toBe(200)
    expect((await request(handler).get('/mau-phan-mem/autopro')).status).toBe(404)
    await agent.patch(`/api/admin/catalog/${item.id}`).set('x-ca-csrf', '1').send({ visible: true })
    expect((await request(handler).get('/mau-phan-mem/autopro')).status).toBe(200)
  })
  it('form tư vấn lưu vào database', async () => {
    const r = await request(handler).post('/api/leads').send({ name: 'Khách Vercel', phone: '0909123456' })
    expect(r.status).toBe(201)
    expect(r.body.code).toMatch(/^TV/)
  })
  it('khởi động nhiều lần không lỗi (migration / dữ liệu khởi tạo chạy lại an toàn)', async () => {
    const again = (await import('../../api/index.js?again')).default
    expect((await request(again).get('/api/health')).status).toBe(200)
  })
})
