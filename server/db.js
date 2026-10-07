// Kết nối PostgreSQL (node-postgres) + tiện ích chuyển tên cột snake_case ↔ camelCase.
import { readFileSync } from 'node:fs'
import pg from 'pg'

// bigint (tiền) → số JS (an toàn tới 9e15 đồng); date → chuỗi 'YYYY-MM-DD' (không lệch múi giờ)
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)))
pg.types.setTypeParser(1082, (v) => v)

// Tuỳ chọn kết nối từ cấu hình (config.js): số kết nối, SSL
export function poolOptions(cfg) {
  const ssl =
    cfg.databaseSsl === 'verify' ? { ca: readFileSync(cfg.databaseCaFile, 'utf8'), rejectUnauthorized: true } : cfg.databaseSsl === 'require' ? { rejectUnauthorized: false } : undefined
  return { max: cfg.dbPoolMax, ...(ssl && { ssl }) }
}

export function createPool(connectionString, opts = {}) {
  // SSL đặt qua opts: bỏ sslmode… trong chuỗi kết nối (pg ưu tiên tham số trong chuỗi, sẽ ghi đè cấu hình ssl)
  if (opts.ssl) {
    const u = new URL(connectionString)
    for (const k of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat']) u.searchParams.delete(k)
    connectionString = u.toString()
  }
  const pool = new pg.Pool({ connectionString, max: 10, idleTimeoutMillis: 30000, ...opts })
  pool.on('error', (e) => console.error('[db] lỗi kết nối nền:', e.message))
  return pool
}

// Chạy fn trong một giao dịch (tự ROLLBACK khi lỗi)
export async function tx(pool, fn) {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    const r = await fn(c)
    await c.query('COMMIT')
    return r
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    c.release()
  }
}

export const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
export const toSnake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
export function camelize(row) {
  if (!row) return row
  const o = {}
  for (const [k, v] of Object.entries(row)) o[toCamel(k)] = v instanceof Date ? v.toISOString() : v
  return o
}
