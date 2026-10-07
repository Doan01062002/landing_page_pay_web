// Website công khai dựng phía máy chủ (SSR): thẻ SEO, dữ liệu từ trang quản trị cập nhật ngay, 404, robots, sitemap.
// Cần bản dựng: npm run build (dist/ + dist-server/).
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { bootScript, fillTemplate, robotsTxt, sitemapRoutes } from '../../server/seo.js'
import { mergeCatalog } from '../../src/data/catalog.js'
import { templates } from '../../src/data/templates.js'
import { defaultBootstrap } from '../../src/data/bootstrap.js'
import { login, setup } from '../helpers.js'

let ctx, admin
beforeAll(async () => {
  ctx = await setup()
  if (!ctx.renderer) throw new Error('Chưa có bản dựng giao diện: chạy npm run build trước khi test')
  admin = await login(ctx.app)
})
afterAll(() => ctx.pool.end())

const page = (path) => request(ctx.app).get(path)
const boot = (html) => JSON.parse(html.match(/window\.__CA_BOOT__=(.*?)<\/script>/)[1])
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const T = templates[0] // mẫu dùng để thử ẩn / sửa

describe('trang công khai dựng sẵn HTML (tốt cho SEO)', () => {
  it('trang chủ: nội dung, title, description, canonical, Open Graph, JSON-LD, dữ liệu khởi động', async () => {
    const r = await page('/')
    expect(r.status).toBe(200)
    expect(r.headers['content-type']).toMatch(/text\/html/)
    const html = r.text
    const seo = defaultBootstrap().seo
    expect(html).toContain(`<title>${seo.title.replace(/&/g, '&amp;')}</title>`)
    expect(html).toMatch(/<meta name="description" content="[^"]{50,}">/)
    expect(html).toMatch(/<link rel="canonical" href="http:\/\/127\.0\.0\.1:\d+\/">/)
    expect(html).toContain('<meta property="og:title"')
    expect(html).toContain('<html lang="vi"')
    expect((html.match(/<title>/g) || []).length).toBe(1)
    expect(html).toMatch(/<div id="root"><[a-z]/) // có nội dung thật trong #root
    expect(html).toMatch(/<h1[\s>]/)
    const types = jsonLd(html).map((o) => o['@type'])
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'FAQPage']))
    const b = boot(html)
    expect(b.site.brand).toBeTruthy()
    expect(b.catalog.templates[T.slug].name).toBe(T.name)
    expect(b.url).toBe('/') // trình duyệt chỉ hydrate khi địa chỉ khớp
    expect(boot((await page('/mau-phan-mem?trang=2')).text).url).toBe('/mau-phan-mem?trang=2')
  })
  it('Kho mẫu và trang chi tiết mẫu có title / JSON-LD riêng', async () => {
    const g = await page('/mau-phan-mem')
    expect(g.status).toBe(200)
    expect(g.text).toContain('<title>Mẫu website gara ô tô &amp; phần mềm quản lý | ')
    expect(jsonLd(g.text).map((o) => o['@type'])).toEqual(expect.arrayContaining(['BreadcrumbList', 'ItemList']))
    const d = await page(`/mau-phan-mem/${T.slug}`)
    expect(d.status).toBe(200)
    expect(d.text).toContain(`<title>${T.name} – mẫu phần mềm`)
    expect(d.text).toMatch(new RegExp(`<link rel="canonical" href="[^"]+/mau-phan-mem/${T.slug}">`))
    const product = jsonLd(d.text).find((o) => o['@type'] === 'Product')
    expect(product.name).toBe(T.name)
    const lp = await page('/mau-landing-page')
    expect(lp.status).toBe(200)
  })
  it('trang không tồn tại → mã 404 thật + noindex (không phải soft 404)', async () => {
    for (const p of ['/trang-khong-co', '/mau-phan-mem/khong-co-mau-nay']) {
      const r = await page(p)
      expect(r.status, p).toBe(404)
      expect(r.text).toContain('noindex')
      expect(r.text).toContain('Không tìm thấy trang này')
    }
  })
  it('trang quản trị / xem thử: chỉ trả khung trang, noindex, không dựng nội dung', async () => {
    for (const p of ['/admin', '/admin/dang-nhap', '/quan-tri/autopro', `/demo/${T.slug}`, `/preview/${T.slug}`]) {
      const r = await page(p)
      expect(r.status, p).toBe(200)
      expect(r.headers['x-robots-tag']).toBe('noindex, nofollow')
      expect(r.text).toContain('<meta name="robots" content="noindex, nofollow"')
      expect(r.text).toContain('<div id="root"></div>')
    }
  })
  it('đường dẫn cũ chuyển hướng vĩnh viễn', async () => {
    const r = await page('/du-an')
    expect(r.status).toBe(301)
    expect(r.headers.location).toBe('/mau-phan-mem?ht=rieng')
    expect((await page('/du-an/')).headers.location).toBe('/mau-phan-mem?ht=rieng')
  })
  it('trang mẫu dựng riêng là tệp tĩnh /du-an/<slug>/', async () => {
    const r = await page('/du-an/dopro/')
    expect(r.status).toBe(200)
    expect(r.headers['content-type']).toMatch(/html/)
    expect((await page('/du-an/dopro')).status).toBe(301)
  })
  it('tệp tĩnh có mã băm lưu đệm 1 năm; tệp thiếu → 404', async () => {
    const html = (await page('/')).text
    const js = html.match(/\/assets\/[^"]+\.js/)[0]
    const r = await page(js)
    expect(r.status).toBe(200)
    expect(r.headers['cache-control']).toMatch(/max-age=31536000/)
    expect(r.headers['cache-control']).toMatch(/immutable/)
    expect((await page('/assets/khong-co.js')).status).toBe(404)
  })
  it('nén gzip', async () => {
    const r = await page('/').set('Accept-Encoding', 'gzip')
    expect(r.headers['content-encoding']).toBe('gzip')
  })
})

describe('sửa trong trang quản trị → website cập nhật ngay', () => {
  it('cài đặt SEO: kiểm tra độ dài, lưu xong title trang chủ đổi', async () => {
    let r = await admin.put('/api/admin/settings/seo', { title: 'Ngắn', description: 'ngắn', image: '' })
    expect(r.status).toBe(422)
    expect(Object.keys(r.body.fields).sort()).toEqual(['description', 'title'])
    const title = 'Phần mềm gara ô tô & website ChungAuto 2026'
    r = await admin.put('/api/admin/settings/seo', { title, description: 'Mô tả kiểm thử đủ dài cho công cụ tìm kiếm, phần mềm quản lý gara và website.', image: '/brand/og-home.jpg' })
    expect(r.status).toBe(200)
    const html = (await page('/')).text
    expect(html).toContain('<title>Phần mềm gara ô tô &amp; website ChungAuto 2026</title>')
    expect(html).toContain('/brand/og-home.jpg')
    expect((await admin.get('/api/admin/settings')).body.seo.title).toBe(title)
  })
  it('thông tin liên hệ: hotline mới hiện trên website; dữ liệu sai bị chặn', async () => {
    const site = (await admin.get('/api/admin/settings')).body.site
    let r = await admin.put('/api/admin/settings/site', { ...site, email: 'sai', zaloUrl: 'khong-phai-link', brand: '' })
    expect(r.status).toBe(422)
    expect(Object.keys(r.body.fields).sort()).toEqual(['brand', 'email', 'zaloUrl'])
    r = await admin.put('/api/admin/settings/site', { ...site, hotline: '0988 777 666', promo: { ...site.promo, text: 'Khuyến mãi kiểm thử tháng 10' } })
    expect(r.status).toBe(200)
    const html = (await page('/')).text
    expect(html).toContain('0988 777 666')
    expect(boot(html).site.promo.text).toBe('Khuyến mãi kiểm thử tháng 10')
    expect((await admin.put('/api/admin/settings/la', {})).status).toBe(404)
  })
  it('chống chèn mã: nội dung có </script> không phá trang', async () => {
    const site = (await admin.get('/api/admin/settings')).body.site
    const evil = '</script><script>alert(1)</script>'
    expect((await admin.put('/api/admin/settings/site', { ...site, tagline: evil })).status).toBe(200)
    const html = (await page('/')).text
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(boot(html).site.tagline).toBe(evil)
  })
  it('ẩn mẫu: biến mất khỏi Kho mẫu, trang mẫu trả 404, rời sitemap; hiện lại thì quay về', async () => {
    const item = (await admin.get('/api/admin/catalog')).body.find((x) => x.kind === 'template' && x.slug === T.slug)
    expect((await page('/sitemap.xml')).text).toContain(`/mau-phan-mem/${T.slug}<`)
    await admin.patch(`/api/admin/catalog/${item.id}`, { visible: false })
    expect((await page(`/mau-phan-mem/${T.slug}`)).status).toBe(404)
    expect((await page('/sitemap.xml')).text).not.toContain(`/mau-phan-mem/${T.slug}<`)
    expect(boot((await page('/mau-phan-mem')).text).catalog.templates[T.slug].visible).toBe(false)
    expect((await page('/mau-phan-mem')).text).not.toContain(`href="/mau-phan-mem/${T.slug}"`)
    await admin.patch(`/api/admin/catalog/${item.id}`, { visible: true })
    expect((await page(`/mau-phan-mem/${T.slug}`)).status).toBe(200)
  })
  it('đổi tên / giá mẫu: trang chi tiết hiển thị theo dữ liệu mới', async () => {
    const item = (await admin.get('/api/admin/catalog')).body.find((x) => x.kind === 'template' && x.slug === T.slug)
    await admin.patch(`/api/admin/catalog/${item.id}`, { name: 'Tên Mẫu Kiểm Thử', price: 1234000 })
    const html = (await page(`/mau-phan-mem/${T.slug}`)).text
    expect(html).toContain('<title>Tên Mẫu Kiểm Thử – mẫu phần mềm')
    expect(html).toMatch(/1\.234\.000/)
    await admin.patch(`/api/admin/catalog/${item.id}`, { name: T.name, price: T.price })
  })
  it('hỏi đáp: thêm hiện trên trang chủ (cả JSON-LD FAQPage), ẩn thì mất', async () => {
    const q = 'Câu hỏi kiểm thử hiển thị SSR?'
    const f = (await admin.post('/api/admin/faqs', { question: q, answer: 'Trả lời kiểm thử.', sortOrder: 0 })).body
    let html = (await page('/')).text
    expect(html).toContain(q)
    expect(jsonLd(html).find((o) => o['@type'] === 'FAQPage').mainEntity.some((e) => e.name === q)).toBe(true)
    await admin.patch(`/api/admin/faqs/${f.id}`, { visible: false })
    html = (await page('/')).text
    expect(html).not.toContain(q)
  })
  it('API công khai trả dữ liệu khởi động cho bản tĩnh', async () => {
    const r = await page('/api/public/bootstrap')
    expect(r.status).toBe(200)
    expect(r.body.site.hotline).toBe('0988 777 666')
    expect(r.headers['cache-control']).toMatch(/max-age=30/)
  })
})

describe('robots.txt & sitemap.xml', () => {
  it('robots chặn trang riêng tư, khai báo sitemap', async () => {
    const r = await page('/robots.txt')
    expect(r.headers['content-type']).toMatch(/text\/plain/)
    for (const p of ['/admin', '/quan-tri', '/preview', '/api']) expect(r.text).toContain(`Disallow: ${p}`)
    expect(r.text).toMatch(/Sitemap: http:\/\/127\.0\.0\.1:\d+\/sitemap\.xml/)
  })
  it('PUBLIC_URL được dùng cho canonical / sitemap (không tin header Host)', async () => {
    const pub = await setup({ PUBLIC_URL: 'https://chungauto.vn/' }, { reset: false })
    const sm = await request(pub.app).get('/sitemap.xml').set('Host', 'evil.example')
    expect(sm.headers['content-type']).toMatch(/xml/)
    expect(sm.text).toContain('<loc>https://chungauto.vn/</loc>')
    expect(sm.text).not.toContain('evil.example')
    const urls = sm.text.match(/<loc>/g).length
    expect(urls).toBe(sitemapRoutes(null).length)
    const home = await request(pub.app).get('/').set('Host', 'evil.example')
    expect(home.text).toContain('<link rel="canonical" href="https://chungauto.vn/">')
    expect((await request(pub.app).get('/robots.txt')).text).toContain('Sitemap: https://chungauto.vn/sitemap.xml')
    await pub.pool.end()
  })
})

describe('hàm tiện ích SEO', () => {
  it('bootScript: thoát < > & và U+2028, vẫn là JSON hợp lệ', () => {
    const s = bootScript({ a: '</script><b>&', b: 'x\u2028y' })
    expect(s).not.toMatch(/<\/script>.*<\/script>/)
    expect(s).toContain('\\u003c/script\\u003e')
    expect(s).toContain('\\u2028')
    const json = s.replace('<script>window.__CA_BOOT__=', '').replace(/<\/script>$/, '')
    expect(JSON.parse(json)).toEqual({ a: '</script><b>&', b: 'x\u2028y' })
  })
  it('fillTemplate thay khối head, chèn nội dung và dữ liệu', () => {
    const tpl = '<head><!--head:start--><title>Cũ</title><!--head:end--></head><div id="root"><!--app-html--></div><!--app-boot-->'
    expect(fillTemplate(tpl, { head: '<title>Mới</title>', html: '<p>x</p>', boot: { a: 1 } })).toBe('<head><title>Mới</title></head><div id="root"><p>x</p></div><script>window.__CA_BOOT__={"a":1}</script>')
    expect(fillTemplate(tpl, { noindex: true })).toContain('<meta name="robots" content="noindex, nofollow" />')
  })
  it('robotsTxt không có địa chỉ thì bỏ dòng Sitemap', () => {
    expect(robotsTxt('')).not.toContain('Sitemap')
  })
  it('mergeCatalog: ghi đè tên / giá / mô tả, lọc mẫu ẩn, sắp xếp mẫu dựng riêng', () => {
    const t0 = templates[0]
    const out = mergeCatalog({ templates: { [t0.slug]: { name: 'Mới', price: 1, summary: 'Mô tả', visible: true, featured: true } }, projects: {} })
    expect(out.templates[0]).toMatchObject({ slug: t0.slug, name: 'Mới', price: 1, tagline: 'Mô tả', featured: true })
    const hidden = mergeCatalog({ templates: { [t0.slug]: { visible: false } }, projects: {} })
    expect(hidden.templates.find((x) => x.slug === t0.slug)).toBeUndefined()
    expect(mergeCatalog(null).templates).toBe(templates)
  })
})
