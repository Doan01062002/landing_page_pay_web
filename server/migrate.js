// Chạy các tệp server/db/migrations/*.sql theo thứ tự tên, mỗi tệp một lần (ghi lại trong schema_migrations).
// Khoá advisory để nhiều tiến trình khởi động cùng lúc không chạy chồng.
// Chạy tay: node server/migrate.js
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'db', 'migrations')
const LOCK = 727274 // số bất kỳ, cố định

export async function migrate(pool, log = console.log) {
  const c = await pool.connect()
  try {
    await c.query('SELECT pg_advisory_lock($1)', [LOCK])
    await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
    const done = new Set((await c.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name))
    const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort()
    let applied = 0
    for (const f of files) {
      if (done.has(f)) continue
      await c.query('BEGIN')
      try {
        await c.query(readFileSync(join(DIR, f), 'utf8'))
        await c.query('INSERT INTO schema_migrations (name) VALUES ($1)', [f])
        await c.query('COMMIT')
        applied++
        log(`[db] đã chạy migration ${f}`)
      } catch (e) {
        await c.query('ROLLBACK')
        throw new Error(`Migration ${f} lỗi: ${e.message}`)
      }
    }
    return applied
  } finally {
    await c.query('SELECT pg_advisory_unlock($1)', [LOCK]).catch(() => {})
    c.release()
  }
}

// node server/migrate.js
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { loadEnvFile, getConfig } = await import('./config.js')
  const { createPool, poolOptions } = await import('./db.js')
  const { seed } = await import('./seed.js')
  loadEnvFile()
  const cfg = getConfig()
  const pool = createPool(cfg.databaseUrl, poolOptions(cfg))
  try {
    const n = await migrate(pool)
    console.log(n ? `Đã chạy ${n} migration.` : 'Cơ sở dữ liệu đã ở phiên bản mới nhất.')
    await seed(pool, cfg)
  } finally {
    await pool.end()
  }
}
