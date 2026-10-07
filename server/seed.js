// Dữ liệu khởi tạo: cấu hình website, Kho mẫu, hỏi đáp (lấy từ mã nguồn, chỉ thêm khi bảng còn trống)
// và tài khoản quản trị từ biến môi trường ADMIN_EMAIL / ADMIN_PASSWORD (chỉ tạo khi email chưa tồn tại).
import { defaultBootstrap } from '../src/data/bootstrap.js'
import { templates } from '../src/data/templates.js'
import { projects } from '../src/data/projects.js'
import { hashPassword } from './auth.js'

export async function seed(pool, cfg, log = console.log) {
  const boot = defaultBootstrap()
  await pool.query(`INSERT INTO settings (key, value) VALUES ('site', $1), ('seo', $2) ON CONFLICT (key) DO NOTHING`, [JSON.stringify(boot.site), JSON.stringify(boot.seo)])

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM catalog_items')
  if (!rows[0].n) {
    for (const [i, t] of templates.entries())
      await pool.query(
        `INSERT INTO catalog_items (kind, slug, name, category, price, free, is_new, popularity, sort_order, summary)
         VALUES ('template', $1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [t.slug, t.name, t.categoryLabel, t.price, !!t.free, !!t.isNew, t.popularity || 0, i, t.tagline || ''],
      )
    for (const [i, p] of projects.entries())
      await pool.query(
        `INSERT INTO catalog_items (kind, slug, name, category, price, sort_order, summary)
         VALUES ('project', $1, $2, $3, NULL, $4, $5) ON CONFLICT DO NOTHING`,
        [p.slug, p.name, p.category, i, p.summary || ''],
      )
    log(`[db] đã nạp Kho mẫu: ${templates.length} mẫu phần mềm, ${projects.length} mẫu dựng riêng`)
  }
  const faq = await pool.query('SELECT count(*)::int AS n FROM faqs')
  if (!faq.rows[0].n) for (const [i, f] of boot.faqs.entries()) await pool.query('INSERT INTO faqs (question, answer, sort_order) VALUES ($1, $2, $3)', [f.q, f.a, i])

  if (cfg.adminEmail && cfg.adminPassword) {
    const exists = await pool.query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [cfg.adminEmail])
    if (!exists.rowCount) {
      await pool.query(`INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin')`, [cfg.adminEmail.trim(), cfg.adminName, await hashPassword(cfg.adminPassword)])
      log(`[db] đã tạo tài khoản quản trị ${cfg.adminEmail}`)
    }
  }
}
