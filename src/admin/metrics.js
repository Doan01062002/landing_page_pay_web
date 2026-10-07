// Số liệu cho Tổng quan & Báo cáo, tính trực tiếp từ dữ liệu (không có số "vẽ sẵn").
import { addDays, isoDay } from './lib.js'
import { orderTotal, repairTotal } from './schemas.jsx'

// Giao dịch tạo doanh thu theo loại hình
export function sales(site, read) {
  if (site.profile === 'gara')
    return read('repairOrders')
      .filter((o) => o.status !== 'Đã huỷ' && o.status !== 'Báo giá')
      .map((o) => ({ date: o.date, amount: repairTotal(o), ref: o }))
  const orders = (site.profile === 'shop' || site.flags.accessories ? read('orders') : [])
    .filter((o) => !['Đã huỷ', 'Trả hàng'].includes(o.status))
    .map((o) => ({ date: o.date, amount: orderTotal(o), ref: o }))
  if (site.profile === 'shop') return orders
  return [...read('deposits').filter((d) => d.status !== 'Huỷ cọc').map((d) => ({ date: d.date, amount: d.price, ref: d })), ...orders]
}

export const inRange = (d, from, to) => d >= from && d <= to
export function range(days, offset = 0) {
  const to = addDays(new Date(), -offset * days)
  return { from: isoDay(addDays(to, -(days - 1))), to: isoDay(to) }
}
// kỳ trước chưa có số liệu → null (không hiện % so sánh, tránh báo "tăng 100%" sai)
export const pct = (a, b) => (b ? ((a - b) / b) * 100 : null)

// chuỗi theo ngày (gom theo tuần / tháng khi khoảng dài)
export function series(list, days, valueOf = (x) => x.amount) {
  const out = []
  const end = new Date()
  const bucket = days > 120 ? 30 : days > 45 ? 7 : 1
  for (let i = Math.ceil(days / bucket) - 1; i >= 0; i--) {
    const to = addDays(end, -i * bucket)
    const from = addDays(to, -(bucket - 1))
    const f = isoDay(from)
    const t = isoDay(to)
    const hit = list.filter((x) => inRange(x.date, f, t))
    out.push({
      label: bucket === 30 ? `T${to.getMonth() + 1}` : `${from.getDate()}/${from.getMonth() + 1}`,
      full: bucket === 1 ? `Ngày ${from.getDate()}/${from.getMonth() + 1}` : `${from.getDate()}/${from.getMonth() + 1} – ${to.getDate()}/${to.getMonth() + 1}`,
      value: hit.reduce((s, x) => s + valueOf(x), 0),
      value2: hit.length,
    })
  }
  return out
}

export function groupSum(list, keyOf, valueOf = () => 1, top = 8) {
  const m = {}
  list.forEach((x) => {
    const keys = [].concat(keyOf(x) || 'Khác')
    keys.forEach((k) => (m[k] = (m[k] || 0) + valueOf(x, k)))
  })
  return Object.entries(m)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top)
}
