// Lấy dữ liệu thật của các trang tĩnh (sản phẩm, xe, dịch vụ, chi nhánh, bài viết, đánh giá…) làm dữ liệu ban đầu
// cho trang quản trị: src/admin/seeds/<key>.json (key = du-an-<slug>, giống ảnh xem trước).
// Chạy lại sau khi sửa dữ liệu một trang:  node scripts/admin-seed.mjs   (hoặc kèm slug: node scripts/admin-seed.mjs dopro)
import vm from 'node:vm'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SRC_ROOT = resolve(process.cwd(), '..')
const OUT = 'src/admin/seeds'

// Chạy file data.js của trang trong hộp cát (window = global) và trả về đối tượng toàn cục
function load(slug, files) {
  const ctx = {
    document: { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], documentElement: {} },
    console,
    localStorage: { getItem: () => null, setItem() {} },
    location: { search: '', hash: '' },
  }
  ctx.window = ctx
  ctx.globalThis = ctx
  ctx.self = ctx
  vm.createContext(ctx)
  for (const f of files) vm.runInContext(readFileSync(join(SRC_ROOT, `landing_page_${slug}`, 'assets/js', f), 'utf8'), ctx)
  return ctx
}

// ảnh trong trang (đường dẫn tương đối) → đường dẫn tuyệt đối trên web; ảnh không tồn tại thì bỏ
const asset = (slug, rel) => {
  if (!rel) return ''
  if (/^https?:/.test(rel)) return rel
  return existsSync(join(SRC_ROOT, `landing_page_${slug}`, rel)) ? `/du-an/${slug}/${rel}` : ''
}
const unsplash = (id, w = 640) => (id ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70` : '')
// 05/10/2026 → 2026-10-05
const isoDate = (d) => {
  const m = String(d || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
}
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const SITES = {
  dopro() {
    const d = load('dopro', ['data.js']).DOPRO
    const cat = Object.fromEntries(d.CATS.map((c) => [c.id, c.name]))
    return {
      categories: d.CATS.map((c) => ({ id: c.id, name: c.name })),
      products: d.P.map((p) => ({
        id: p.id, name: p.name, category: cat[p.cat] || p.cat, brand: 'Độ Pro', spec: p.spec, price: p.price, oldPrice: p.old,
        rating: p.rating, reviews: p.reviews, sold: p.sold, image: asset('dopro', d.PIMG(p.img)), gift: p.gift || '', desc: (p.feats || []).join('. '),
      })),
      services: d.SERVICES.map((s) => ({ id: s.id, name: s.name, group: 'Dịch vụ độ', price: s.from, priceText: 'từ ' + s.from.toLocaleString('vi-VN') + 'đ', duration: s.time, desc: s.desc, image: unsplash(s.img) })),
      branches: d.SHOWROOMS.map((b) => ({ name: b.n, address: b.a, phone: b.p, hours: b.h, note: b.f })),
      posts: d.NEWS.map((n) => ({ title: n.t, category: n.tag, date: isoDate(n.d), image: unsplash(n.img), excerpt: n.ex })),
      reviews: d.REVIEWS.map((r) => ({ name: r.n, rating: r.r, content: r.t, date: isoDate(r.d), target: r.car })),
    }
  },
  ankhang() {
    const d = load('ankhang', ['data.js']).AK
    const cat = Object.fromEntries(d.CATEGORIES.map((c) => [c.key, c.name]))
    return {
      categories: d.CATEGORIES.map((c) => ({ id: c.key, name: c.name })),
      products: d.PRODUCTS.map((p) => ({
        id: p.id, name: p.name, category: cat[p.cat] || p.cat, brand: 'An Khang', spec: p.spec, price: p.price, oldPrice: p.old,
        rating: p.rating, reviews: p.reviews, sold: p.sold, image: asset('ankhang', d.img(p.id)), desc: p.desc,
      })),
      vouchers: d.VOUCHERS.map((v) => ({ code: v.code, title: v.title, cond: v.cond, value: v.off, min: v.min })),
    }
  },
  lumen() {
    const d = load('lumen', ['data.js']).LUMEN_DATA
    const cat = Object.fromEntries(d.CATS.map((c) => [c.id, c.name]))
    return {
      categories: d.CATS.map((c) => ({ id: c.id, name: c.name })),
      products: d.PRODUCTS.map((p) => ({
        id: p.id, name: p.name, category: cat[p.cat] || p.cat, brand: p.brand, price: p.price, oldPrice: p.old,
        rating: p.rating, reviews: p.reviews, sold: p.sold, image: asset('lumen', p.img), gift: p.gift || '', desc: (p.specs || []).join('. '),
      })),
      branches: d.BRANCHES.map((b) => ({ name: b.n, address: b.a, phone: b.p, hours: b.h, note: b.bay ? `${b.bay} khoang lắp` : '' })),
      posts: d.NEWS.map((n) => ({ title: n.t, category: n.tag, date: isoDate(n.d), image: unsplash(n.img) })),
      reviews: d.REVIEWS.map((r) => ({ name: r.n, rating: r.r, content: r.t, date: isoDate(r.d), target: [r.car, r.svc].filter(Boolean).join(" · ") })),
    }
  },
  vanhviet() {
    const d = load('vanhviet', ['data.js']).VV
    const CAT = { mam: 'Mâm đúc', lop: 'Lốp ô tô', zin: 'Mâm zin tháo xe', pk: 'Phụ kiện' }
    return {
      categories: [...new Set(d.PRODUCTS.map((p) => p.cat))].map((c) => ({ id: c, name: CAT[c] || c })),
      products: d.PRODUCTS.map((p) => ({
        id: p.id, name: p.name, category: CAT[p.cat] || p.cat, brand: p.brand, price: p.price, oldPrice: p.old,
        rating: p.rating, reviews: p.rv, sold: p.sold, image: asset('vanhviet', `assets/img/products/${p.img}.webp`), desc: p.desc,
      })),
      branches: d.BRANCHES.map((b) => ({ name: b.n, address: b.a, phone: b.p, hours: b.h, note: b.note })),
      posts: (d.TIPS || []).map((n) => ({ title: n.t, category: n.tag, date: isoDate(n.date), image: unsplash(n.img) })),
      reviews: d.REVIEWS.map((r) => ({ name: r.n, rating: r.s, content: r.t, target: [r.car, r.buy].filter(Boolean).join(" · ") })),
    }
  },
  bongstudio() {
    const d = load('bongstudio', ['data.js']).BONG
    const cat = Object.fromEntries(d.CATS.map((c) => [c.id, c.name]))
    return {
      categories: d.CATS.filter((c) => c.id !== 'all').map((c) => ({ id: c.id, name: c.name })),
      products: d.P.map((p) => ({
        id: 'b' + p.id, name: p.name, category: cat[p.cat] || p.cat, brand: p.br, spec: p.spec, price: p.price, oldPrice: p.old,
        rating: p.rate, reviews: p.rv, sold: p.sold, image: asset('bongstudio', `assets/img/products/${p.img}.webp`), gift: p.gift || '', desc: p.desc,
      })),
      services: [
        ...d.SERVICES.map((s) => ({ id: s.id, name: s.name, group: 'Dịch vụ tại xưởng', price: s.price.sedan, priceText: `Sedan ${s.price.sedan.toLocaleString('vi-VN')}đ · SUV ${s.price.suv.toLocaleString('vi-VN')}đ`, duration: s.time, warranty: s.warranty, desc: s.desc, image: unsplash(s.img) })),
        ...d.PKGS.map((s) => ({ id: 'pkg-' + s.id, name: `Gói ${s.name} (${s.alias})`, group: 'Gói chăm sóc', price: s.price.sedan, priceText: `Sedan ${s.price.sedan.toLocaleString('vi-VN')}đ · SUV ${s.price.suv.toLocaleString('vi-VN')}đ`, desc: s.note })),
      ],
      branches: d.BRANCHES.map((b) => ({ name: b.name, address: b.addr, phone: '0900 000 515', hours: b.hours, note: b.bays })),
      posts: d.TIPS.map((n) => ({ title: n.title, category: 'Mẹo chăm xe', date: isoDate(n.date), image: unsplash(n.img), excerpt: n.ex })),
      reviews: d.REVIEWS.map((r) => ({ name: r.n, rating: r.s, content: r.q, date: isoDate(r.d), target: r.v })),
    }
  },
  tinviet() {
    const d = load('tinviet', ['data.js', 'data-news.js']).TVDATA
    return {
      cars: d.cars.map((c) => ({
        id: c.id, name: `${c.brand} ${c.model} ${c.version}`, brand: c.brand, model: c.model, version: c.version, year: c.year, km: c.odo,
        price: c.price, body: c.body, fuel: c.fuel, gear: c.trans, color: c.color, condition: c.odo < 20000 ? 'Lướt' : 'Đã qua sử dụng',
        image: asset('tinviet', c.img), tag: (c.tags || [])[0] || '', postedAt: c.posted,
      })),
      posts: (d.news || d.posts || []).map((n) => ({ title: n.title, category: n.cat || n.category || 'Tin tức', date: n.date && n.date.includes('/') ? isoDate(n.date) : n.date || '', image: asset('tinviet', n.img || n.image), excerpt: n.excerpt || n.sum || '' })),
      reviews: (d.reviews || []).map((r) => ({ name: r.name, rating: r.rating || 5, content: r.text || r.quote || '', target: r.car || r.meta || '' })),
    }
  },
  hungthinh() {
    const d = load('hungthinh', ['data.js']).HT_DATA
    const brand = Object.fromEntries(d.BRANDS.map((b) => [b.id, b.name]))
    const type = Object.fromEntries(d.TYPES.map((b) => [b.id, b.name]))
    const room = Object.fromEntries(d.SHOWROOMS.map((b) => [b.id, b.name]))
    const acc = Object.fromEntries(d.ACC_CATS.map((c) => [c.id, c.name]))
    return {
      cars: d.CARS.map((c) => ({
        id: c.id, name: `${c.name} ${c.version}`, brand: brand[c.brand] || c.brand, model: c.name, version: c.version, year: c.year, km: c.km,
        price: c.price, oldPrice: c.oldPrice, body: type[c.type] || c.type, fuel: c.fuel, gear: c.gear, condition: c.condition,
        image: asset('hungthinh', c.images[0]), tag: c.tag || '', showroom: room[c.showroom] || '', featured: !!c.featured,
      })),
      categories: d.ACC_CATS.map((c) => ({ id: c.id, name: c.name })),
      products: d.ACCESSORIES.map((p) => ({ id: p.id, name: p.name, category: acc[p.cat] || p.cat, brand: 'Hưng Thịnh', price: p.price, oldPrice: p.oldPrice, image: asset('hungthinh', p.images[0]), desc: p.desc })),
      branches: d.SHOWROOMS.map((b) => ({ name: b.name, address: b.address, phone: b.phone, hours: b.hours })),
      posts: d.POSTS.map((n) => ({ title: n.title, category: (d.POST_CATS.find((c) => c.id === n.cat) || {}).name || n.cat, date: n.date && n.date.includes('/') ? isoDate(n.date) : n.date, image: asset('hungthinh', n.img) || n.img, excerpt: n.excerpt })),
    }
  },
}

const only = process.argv[2]
mkdirSync(OUT, { recursive: true })
for (const [slug, build] of Object.entries(SITES)) {
  if (only && only !== slug) continue
  const data = build()
  for (const list of Object.values(data)) list.forEach((x, i) => (x.id = x.id || `${slugify(x.name || x.title || x.code || 'x')}-${i}`))
  const missing = (data.products || data.cars || []).filter((x) => !x.image).map((x) => x.name)
  writeFileSync(join(OUT, `du-an-${slug}.json`), JSON.stringify(data, null, 1))
  console.log(`✓ du-an-${slug}:`, Object.entries(data).map(([k, v]) => `${k} ${v.length}`).join(', '), missing.length ? `· thiếu ảnh: ${missing.join(' | ')}` : '')
}
