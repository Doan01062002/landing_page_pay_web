// Tiện ích dùng chung cho trang quản trị: định dạng tiền, ngày giờ, số ngẫu nhiên có hạt (dữ liệu mẫu ổn định), CSV.

export const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ'

// 1.250.000.000 → "1,25 tỷ", 125.000.000 → "125 tr"
export function moneyShort(n) {
  n = Number(n) || 0
  const abs = Math.abs(n)
  if (abs >= 1e9) return (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ'
  if (abs >= 1e6) return (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr'
  if (abs >= 1e3) return (n / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + 'k'
  return String(n)
}

export const num = (n) => (Number(n) || 0).toLocaleString('vi-VN')

const pad = (n) => String(n).padStart(2, '0')
// Date → 'YYYY-MM-DD' theo giờ máy
export const isoDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const parseDay = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
// 'YYYY-MM-DD' hoặc ISO → '05/10/2026'
export function fmtDate(s) {
  if (!s) return '—'
  const d = String(s).length <= 10 ? parseDay(s) : new Date(s)
  return isNaN(d) ? '—' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
export function fmtDateTime(s) {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d) ? '—' : `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
export function ago(s) {
  const d = new Date(s)
  const m = Math.round((Date.now() - d) / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  if (m < 60 * 24) return `${Math.round(m / 60)} giờ trước`
  if (m < 60 * 24 * 30) return `${Math.round(m / 1440)} ngày trước`
  return fmtDate(s)
}
export const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Bỏ dấu để tìm kiếm không phân biệt dấu
export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// ---------- Ngẫu nhiên có hạt: cùng một mẫu luôn sinh cùng bộ dữ liệu ----------
export function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
export function rng(seed) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const r = {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    // chọn theo trọng số: [[giá trị, trọng số], …]
    weighted: (pairs) => {
      const total = pairs.reduce((s, [, w]) => s + w, 0)
      let x = next() * total
      for (const [v, w] of pairs) if ((x -= w) < 0) return v
      return pairs[pairs.length - 1][0]
    },
    sample: (arr, n) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a.slice(0, n)
    },
  }
  return r
}

// ---------- Tên, số điện thoại, biển số (dữ liệu minh hoạ) ----------
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Phan', 'Trịnh', 'Đinh', 'Lâm']
const DEM_NAM = ['Văn', 'Minh', 'Đức', 'Quang', 'Hữu', 'Thành', 'Tuấn', 'Ngọc', 'Gia', 'Hoàng']
const DEM_NU = ['Thị', 'Thu', 'Ngọc', 'Thanh', 'Minh', 'Phương', 'Khánh', 'Bảo', 'Mai']
const TEN_NAM = ['Hùng', 'Dũng', 'Tuấn', 'Nam', 'Long', 'Phong', 'Khoa', 'Quân', 'Huy', 'Sơn', 'Thắng', 'Trung', 'Hiếu', 'Đạt', 'Bình', 'Tâm', 'Kiên', 'Vinh', 'Lộc', 'Hải']
const TEN_NU = ['Lan', 'Hương', 'Linh', 'Trang', 'Hà', 'Ngọc', 'Thảo', 'Vy', 'Anh', 'Hạnh', 'Yến', 'Nhung', 'Quỳnh', 'Mai', 'Trinh']
export function personName(r) {
  const male = r.chance(0.62)
  return `${r.pick(HO)} ${r.pick(male ? DEM_NAM : DEM_NU)} ${r.pick(male ? TEN_NAM : TEN_NU)}`
}
const PREFIX = ['090', '091', '093', '094', '096', '097', '098', '086', '088', '070', '077', '083', '085', '032', '035', '039']
export const phone = (r) => `${r.pick(PREFIX)}${r.int(1, 9)} ${r.int(100, 999)} ${r.int(100, 999)}`
export function email(r, name) {
  const parts = norm(name).split(' ')
  return `${parts[parts.length - 1]}.${parts[0]}${r.int(10, 99)}@${r.pick(['gmail.com', 'gmail.com', 'yahoo.com', 'outlook.com'])}`
}
export const PLATE_AREAS = { 'Hà Nội': ['29', '30'], 'TP. HCM': ['51'], 'Đà Nẵng': ['43'], 'Hải Phòng': ['15'], 'Cần Thơ': ['65'], 'Quảng Nam': ['92'], 'Huế': ['75'] }
export function plate(r, city = 'Hà Nội') {
  const codes = PLATE_AREAS[city] || ['30']
  return `${r.pick(codes)}${r.pick(['A', 'A', 'K', 'H', 'F', 'G'])}-${r.int(100, 999)}.${pad(r.int(0, 99))}`
}
export const CARS = [
  'Toyota Vios', 'Toyota Corolla Cross', 'Toyota Innova', 'Toyota Fortuner', 'Honda City', 'Honda CR-V', 'Hyundai Accent', 'Hyundai Creta',
  'Hyundai Santa Fe', 'Kia Morning', 'Kia Seltos', 'Kia Carnival', 'Mazda 3', 'Mazda CX-5', 'Mitsubishi Xpander', 'Ford Ranger', 'Ford Everest',
  'VinFast VF 5', 'VinFast VF 8', 'Nissan Kicks', 'Suzuki XL7', 'Mercedes C200',
]

// ---------- CSV (Excel đọc được tiếng Việt nhờ BOM) ----------
export function downloadCSV(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(','))]
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// Mã chứng từ tiếp theo: DH0001…
export function nextCode(rows, prefix) {
  let max = 0
  let width = 4 // giữ đúng độ dài số của mã đã có (DH00170 → DH00171)
  for (const r of rows) {
    const code = String(r.code || '')
    if (!code.startsWith(prefix)) continue
    const digits = code.slice(prefix.length)
    const n = parseInt(digits, 10)
    if (isNaN(n)) continue
    max = Math.max(max, n)
    width = Math.max(width, digits.length)
  }
  return prefix + String(max + 1).padStart(width, '0')
}

// Ảnh tải lên → dataURL đã thu nhỏ (giữ dung lượng localStorage)
export function fileToDataURL(file, maxW = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, maxW / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/webp', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

// Chữ viết tắt: logo thương hiệu (2 chữ, bỏ từ chung chung như "Gara", "Auto") hoặc ảnh đại diện người (1 chữ của tên)
const GENERIC = new Set(['gara', 'garage', 'ô', 'tô', 'auto', 'cửa', 'hàng', 'showroom', 'đại', 'lý', 'landing', 'page', 'xe', '–', '-'])
export function initials(name, n = 2) {
  const words = String(name || '?').split(/\s+/).filter(Boolean)
  if (n === 1) return (/^quản trị/i.test(name) ? 'Q' : words[words.length - 1][0]).toUpperCase()
  const key = words.filter((w) => !GENERIC.has(w.toLowerCase()))
  const src = key.length ? key : words
  return (src.length >= 2 ? src[0][0] + src[1][0] : src[0].slice(0, 2)).toUpperCase()
}
