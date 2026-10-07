// Gọi API máy chủ ChungAuto (/api/…): gửi cookie phiên, header chống CSRF, chuyển lỗi thành ApiError
// ({ status, message, fields }) để form hiện lỗi đúng ô nhập.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    this.status = status
    this.code = body?.error
    this.fields = body?.fields
  }
}

export async function api(method, path, body) {
  let res
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body !== undefined && { 'Content-Type': 'application/json' }), 'x-ca-csrf': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { error: 'network', message: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' })
  }
  const type = res.headers.get('content-type') || ''
  const data = type.includes('application/json') ? await res.json().catch(() => null) : null
  // máy chủ tĩnh (vd Vercel) trả HTML thay vì JSON: chưa có backend
  if (!data && !res.ok) throw new ApiError(res.status, { error: 'no_backend', message: 'Máy chủ API chưa sẵn sàng (bản tĩnh chưa có backend).' })
  if (!type.includes('application/json')) throw new ApiError(res.status, { error: 'no_backend', message: 'Máy chủ API chưa sẵn sàng (bản tĩnh chưa có backend).' })
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('ca-admin:unauthorized'))
    throw new ApiError(res.status, data)
  }
  return data
}

// Bảng dữ liệu → đường dẫn API
const ENDPOINT = {
  leads: '/api/admin/leads',
  customers: '/api/admin/customers',
  orders: '/api/admin/orders',
  payments: '/api/admin/payments',
  catalog: '/api/admin/catalog',
  faqs: '/api/admin/faqs',
  users: '/api/admin/users',
  audit: '/api/admin/audit',
  staff: '/api/admin/staff',
}
// sửa bảng này thì số liệu bảng kia đổi theo (tổng tiền, số hợp đồng…) → tải lại khi cần
const DEPENDS = {
  payments: ['orders', 'customers', 'audit'],
  orders: ['customers', 'payments', 'audit'],
  customers: ['orders', 'leads', 'payments', 'audit'],
  leads: ['customers', 'orders', 'audit'],
  users: ['staff', 'audit'],
  catalog: ['audit'],
  faqs: ['audit'],
}

// Kho dữ liệu cùng giao diện với kho demo (read / add / update / remove…) nhưng đọc ghi qua API.
export function createApiStore() {
  const cache = {}
  const state = {} // 'loading' | 'ready' | 'error'
  const listeners = new Set()
  let version = 0
  const emit = () => {
    version++
    listeners.forEach((l) => l())
  }
  async function load(col) {
    if (!ENDPOINT[col]) return
    state[col] = 'loading'
    try {
      cache[col] = await api('GET', ENDPOINT[col])
      state[col] = 'ready'
    } catch (e) {
      state[col] = 'error'
      cache[col] ||= []
      if (e.status !== 401) console.warn('[admin]', col, e.message)
    }
    emit()
  }
  const stale = (col) => (DEPENDS[col] || []).forEach((c) => c in cache && load(c))
  const put = (col, row) => {
    const list = cache[col] || []
    cache[col] = list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? row : r)) : [row, ...list]
  }
  return {
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
    getVersion: () => version,
    setErrorHandler() {},
    read(col) {
      if (!(col in cache)) {
        cache[col] = []
        load(col)
      }
      return cache[col]
    },
    isLoading: (col) => state[col] === 'loading' || state[col] === undefined,
    reload: load,
    async add(col, rec) {
      const row = await api('POST', ENDPOINT[col], rec)
      put(col, row)
      emit()
      stale(col)
      return row
    },
    async update(col, id, patch) {
      const row = await api('PATCH', `${ENDPOINT[col]}/${id}`, patch)
      put(col, row)
      emit()
      stale(col)
      return row
    },
    async updateMany(col, ids, patch) {
      await api('POST', `${ENDPOINT[col]}/bulk-update`, { ids, patch })
      await load(col)
      stale(col)
    },
    async remove(col, ids) {
      if (ids.length === 1) await api('DELETE', `${ENDPOINT[col]}/${ids[0]}`)
      else await api('POST', `${ENDPOINT[col]}/bulk-delete`, { ids })
      const set = new Set(ids)
      cache[col] = (cache[col] || []).filter((r) => !set.has(r.id))
      emit()
      stale(col)
    },
    // không dùng ở trang ChungAuto (nhật ký ghi phía máy chủ)
    log() {},
    write() {},
  }
}
