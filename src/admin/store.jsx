// Kho dữ liệu của trang quản trị: chưa có máy chủ nên lưu trong localStorage của trình duyệt
// (mỗi mẫu một vùng riêng). Lần đầu mở, dữ liệu được sinh từ seed.js; "Khôi phục dữ liệu mẫu" xoá vùng này.
import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { buildSeed, defaultContent, defaultSettings } from './seed.js'
import { uid } from './lib.js'

const PREFIX = 'ca-admin:'

export function defaultRoles(site) {
  const roles =
    site.profile === 'gara'
      ? ['Quản trị viên', 'Quản lý xưởng', 'Cố vấn dịch vụ', 'Kỹ thuật viên', 'Kế toán', 'Marketing']
      : site.profile === 'shop'
        ? ['Quản trị viên', 'Quản lý cửa hàng', 'Nhân viên bán hàng', 'Kỹ thuật lắp đặt', 'Thủ kho', 'Kế toán', 'Marketing']
        : ['Quản trị viên', 'Giám đốc kinh doanh', 'Tư vấn bán hàng', 'Chuyên viên tài chính', 'Kỹ thuật kiểm định', 'Marketing']
  const perms = {}
  const mods = site.modules.map((m) => m.id)
  for (const role of roles) {
    perms[role] = {}
    for (const m of mods) {
      let p = 'view'
      if (/Quản trị|Giám đốc|Quản lý/.test(role)) p = 'full'
      else if (/Marketing/.test(role)) p = ['content', 'posts', 'reviews', 'promotions'].includes(m) ? 'edit' : ['dashboard', 'reports'].includes(m) ? 'view' : 'none'
      else if (/Kế toán/.test(role)) p = ['reports', 'orders', 'repairOrders', 'deposits', 'loans', 'stockReceipts'].includes(m) ? 'edit' : 'view'
      else if (/Kho/.test(role)) p = ['products', 'stockReceipts', 'parts', 'categories'].includes(m) ? 'edit' : ['dashboard', 'orders'].includes(m) ? 'view' : 'none'
      else if (/Kỹ thuật/.test(role)) p = ['bookings', 'repairOrders', 'installs', 'vehicles', 'consignments'].includes(m) ? 'edit' : ['parts', 'services', 'dashboard'].includes(m) ? 'view' : 'none'
      else p = ['settings', 'staff', 'reports'].includes(m) ? 'none' : 'edit'
      if (m === 'settings' && !/Quản trị/.test(role)) p = p === 'full' ? 'view' : 'none'
      perms[role][m] = p
    }
  }
  return { roles, perms }
}

// Tăng khi dữ liệu mẫu (seed.js) thay đổi: trình duyệt đang giữ bản cũ sẽ tự nạp lại dữ liệu mới
const SEED_VERSION = 2

function createStore(site, staticSeed) {
  const ns = PREFIX + site.key + ':'
  try {
    if (localStorage.getItem(ns + '__v') !== String(SEED_VERSION)) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(ns))
        .forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(ns + '__v', String(SEED_VERSION))
    }
  } catch {
    /* trình duyệt chặn lưu trữ: dùng dữ liệu mẫu trong bộ nhớ */
  }
  let seed = null
  const getSeed = () => (seed ||= buildSeed(site, staticSeed || {}))
  const docs = {
    settings: () => defaultSettings(site),
    content: () => defaultContent(site, getSeed()),
    roles: () => defaultRoles(site),
  }
  const cache = {}
  const listeners = new Set()
  let version = 0
  let onError = () => {}
  const emit = () => {
    version++
    listeners.forEach((l) => l())
  }

  function read(col) {
    if (col in cache) return cache[col]
    let v = null
    try {
      const raw = localStorage.getItem(ns + col)
      if (raw) v = JSON.parse(raw)
    } catch {
      /* dữ liệu hỏng hoặc bị chặn: dùng dữ liệu mẫu */
    }
    if (v == null) v = docs[col] ? docs[col]() : getSeed()[col] || []
    cache[col] = v
    return v
  }
  function write(col, v) {
    cache[col] = v
    try {
      localStorage.setItem(ns + col, JSON.stringify(v))
    } catch {
      onError('Bộ nhớ trình duyệt đã đầy: thay đổi chỉ giữ tới khi tải lại trang. Hãy xoá bớt ảnh tải lên.')
    }
    emit()
  }
  function log(text, user = 'Quản trị viên') {
    const list = read('activity')
    write('activity', [{ id: uid(), at: new Date().toISOString(), user, text }, ...list].slice(0, 200))
  }

  return {
    site,
    ns,
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
    getVersion: () => version,
    setErrorHandler: (fn) => (onError = fn),
    read,
    write,
    log,
    add(col, rec, label) {
      const row = { id: uid(), createdAt: new Date().toISOString(), ...rec }
      write(col, [row, ...read(col)])
      if (label) log(`đã thêm ${label}`)
      return row
    },
    update(col, id, patch, label) {
      write(col, read(col).map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)))
      if (label) log(`đã cập nhật ${label}`)
    },
    updateMany(col, ids, patch, label) {
      const set = new Set(ids)
      write(col, read(col).map((r) => (set.has(r.id) ? { ...r, ...patch } : r)))
      if (label) log(label)
    },
    remove(col, ids, label) {
      const set = new Set(ids)
      write(col, read(col).filter((r) => !set.has(r.id)))
      if (label) log(`đã xoá ${label}`)
    },
    setDoc(name, value, label) {
      write(name, value)
      if (label) log(label)
    },
    // Xuất / nhập / khôi phục toàn bộ dữ liệu của mẫu
    exportAll() {
      const out = {}
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k.startsWith(ns)) out[k.slice(ns.length)] = JSON.parse(localStorage.getItem(k))
      }
      const s = getSeed()
      for (const col of Object.keys(s)) if (!(col in out)) out[col] = read(col)
      for (const d of Object.keys(docs)) if (!(d in out)) out[d] = read(d)
      return out
    },
    importAll(data) {
      for (const [k, v] of Object.entries(data)) write(k, v)
      log('đã nhập dữ liệu từ tệp sao lưu')
    },
    reset() {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith(ns)) keys.push(localStorage.key(i))
      keys.forEach((k) => localStorage.removeItem(k))
      for (const k of Object.keys(cache)) delete cache[k]
      seed = null
      emit()
    },
  }
}

const Ctx = createContext(null)

// store: truyền kho dữ liệu riêng (vd kho gọi API máy chủ của trang quản trị ChungAuto); mặc định dùng localStorage
export function AdminProvider({ site, staticSeed, store: external, children }) {
  const store = useMemo(() => external || createStore(site, staticSeed), [external, site, staticSeed])
  const [toasts, setToasts] = useState([])
  const tid = useRef(0)
  const toast = useCallback((text, tone = 'ok') => {
    const id = ++tid.current
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  store.setErrorHandler((m) => toast(m, 'danger'))
  const value = useMemo(() => ({ site, store, toast }), [site, store, toast])
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useAdmin = () => useContext(Ctx)

// Đọc một bảng dữ liệu (tự cập nhật khi bảng thay đổi ở bất kỳ đâu)
export function useCollection(col) {
  const { store } = useAdmin()
  useSyncExternalStore(store.subscribe, store.getVersion)
  return store.read(col)
}
export const useDoc = useCollection

// Phiên đăng nhập demo (chưa có máy chủ xác thực)
export const authKey = (site) => `ca-admin-auth:${site.key}`
export function isAuthed(site) {
  try {
    return !!sessionStorage.getItem(authKey(site))
  } catch {
    return true
  }
}
