// Kết nối PostgreSQL (node-postgres) + tiện ích chuyển tên cột snake_case ↔ camelCase.
import pg from 'pg'

// bigint (tiền) → số JS (an toàn tới 9e15 đồng); date → chuỗi 'YYYY-MM-DD' (không lệch múi giờ)
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)))
pg.types.setTypeParser(1082, (v) => v)

export function createPool(connectionString, opts = {}) {
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
