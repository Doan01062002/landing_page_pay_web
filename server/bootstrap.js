// Dữ liệu khởi động cho website (thương hiệu, SEO, Kho mẫu, hỏi đáp) đọc từ database, có bộ nhớ đệm.
// Ghi vào Kho mẫu / hỏi đáp / cài đặt thì gọi invalidate() để trang công khai cập nhật ngay.
import { defaultBootstrap } from '../src/data/bootstrap.js'

export function createBootstrap(pool, ttlMs = 30000) {
  let cache = null
  let at = 0
  async function load() {
    if (cache && Date.now() - at < ttlMs) return cache
    const def = defaultBootstrap()
    const [settings, catalog, faqs] = await Promise.all([
      pool.query(`SELECT key, value FROM settings WHERE key IN ('site', 'seo')`),
      pool.query(`SELECT kind, slug, name, price, free, is_new, featured, visible, sort_order, popularity, summary FROM catalog_items`),
      pool.query(`SELECT question, answer FROM faqs WHERE visible ORDER BY sort_order, id`),
    ])
    const s = Object.fromEntries(settings.rows.map((r) => [r.key, r.value]))
    const cat = { templates: {}, projects: {} }
    for (const r of catalog.rows) {
      const o = { name: r.name, price: r.price, free: r.free, isNew: r.is_new, featured: r.featured, visible: r.visible, sortOrder: r.sort_order, popularity: r.popularity, summary: r.summary }
      cat[r.kind === 'template' ? 'templates' : 'projects'][r.slug] = o
    }
    cache = {
      site: { ...def.site, ...(s.site || {}), promo: { ...def.site.promo, ...(s.site?.promo || {}) } },
      seo: { ...def.seo, ...(s.seo || {}) },
      catalog: catalog.rowCount ? cat : null,
      faqs: faqs.rows.map((f) => ({ q: f.question, a: f.answer })),
    }
    at = Date.now()
    return cache
  }
  return {
    load,
    invalidate() {
      cache = null
    },
  }
}
