// Báo cáo: chọn khoảng thời gian, so với kỳ trước, biểu đồ theo ngày / tuần / tháng,
// phân tích theo dịch vụ, sản phẩm, chi nhánh, kênh, nhân viên…; xuất CSV và in.
import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { useAdmin, useCollection } from '../store.jsx'
import { Card, Kpi, PageHead, Tabs } from '../ui.jsx'
import { AreaChart, BarList, Donut } from '../charts.jsx'
import { downloadCSV, fmtDate, isoDay, moneyShort, num } from '../lib.js'
import { groupSum, inRange, pct, range, sales, series } from '../metrics.js'
import { CircleDollarSign, ClipboardCheck, Receipt, Users } from 'lucide-react'

const RANGES = [
  { id: '7', label: '7 ngày' },
  { id: '30', label: '30 ngày' },
  { id: '90', label: '90 ngày' },
  { id: '365', label: '12 tháng' },
]

export default function Reports() {
  const { site, store, toast } = useAdmin()
  useCollection('activity')
  const read = (c) => store.read(c)
  const [days, setDays] = useState('30')
  const n = Number(days)
  const cur = range(n)
  const prev = range(n, 1)
  const S = sales(site, read)
  const inCur = S.filter((x) => inRange(x.date, cur.from, cur.to))
  const inPrev = S.filter((x) => inRange(x.date, prev.from, prev.to))
  const rev = inCur.reduce((s, x) => s + x.amount, 0)
  const revPrev = inPrev.reduce((s, x) => s + x.amount, 0)
  const data = series(S, n)
  const customersCur = new Set(inCur.map((x) => x.ref.customer)).size
  const customersPrev = new Set(inPrev.map((x) => x.ref.customer)).size
  const money = (v, k) => v.ref.items?.filter((i) => i.name === k).reduce((s, i) => s + i.qty * i.price, 0) || 0

  let blocks = []
  let cancelRate = 0
  if (site.profile === 'gara') {
    const all = read('repairOrders').filter((o) => inRange(o.date, cur.from, cur.to))
    cancelRate = (all.filter((o) => o.status === 'Đã huỷ').length / (all.length || 1)) * 100
    const bk = read('bookings').filter((b) => inRange(b.date, cur.from, cur.to))
    blocks = [
      { title: 'Doanh thu theo dịch vụ', data: groupSum(inCur, (x) => x.ref.items.filter((i) => i.kind === 'Công').map((i) => i.name), money) },
      { title: 'Doanh thu phụ tùng', data: groupSum(inCur, (x) => x.ref.items.filter((i) => i.kind === 'Phụ tùng').map((i) => i.name), money) },
      { title: 'Doanh thu theo chi nhánh', data: groupSum(inCur, (x) => x.ref.branch, (x) => x.amount) },
      { title: 'Doanh thu theo kỹ thuật viên', data: groupSum(inCur, (x) => x.ref.tech, (x) => x.amount) },
      { title: 'Lịch hẹn theo nguồn', data: groupSum(bk, (b) => b.source), donut: true, unit: 'lịch' },
      { title: 'Tỉ lệ đến hẹn', data: groupSum(bk.filter((b) => b.date < isoDay()), (b) => (['Hoàn thành', 'Đang thực hiện'].includes(b.status) ? 'Đến đúng hẹn' : b.status === 'Không đến' ? 'Không đến' : b.status === 'Đã huỷ' ? 'Huỷ' : 'Khác')), donut: true, unit: 'lịch' },
    ]
  } else if (site.profile === 'shop') {
    const all = read('orders').filter((o) => inRange(o.date, cur.from, cur.to))
    cancelRate = (all.filter((o) => ['Đã huỷ', 'Trả hàng'].includes(o.status)).length / (all.length || 1)) * 100
    const cat = Object.fromEntries(read('products').map((p) => [p.name, p.category]))
    blocks = [
      { title: 'Sản phẩm bán chạy', data: groupSum(inCur, (x) => x.ref.items.map((i) => i.name), money) },
      { title: 'Doanh thu theo danh mục', data: groupSum(inCur, (x) => [...new Set(x.ref.items.map((i) => cat[i.name] || 'Khác'))], (x, k) => x.ref.items.filter((i) => (cat[i.name] || 'Khác') === k).reduce((s, i) => s + i.qty * i.price, 0)) },
      { title: 'Doanh thu theo kênh bán', data: groupSum(inCur, (x) => x.ref.channel, (x) => x.amount), donut: true },
      { title: 'Hình thức thanh toán', data: groupSum(inCur, (x) => x.ref.payment), donut: true, unit: 'đơn' },
      { title: 'Số lượng bán theo sản phẩm', data: groupSum(inCur, (x) => x.ref.items.map((i) => i.name), (x, k) => x.ref.items.filter((i) => i.name === k).reduce((s, i) => s + i.qty, 0)), unit: 'sp' },
      { title: 'Đơn huỷ / trả theo kênh', data: groupSum(all.filter((o) => ['Đã huỷ', 'Trả hàng'].includes(o.status)), (o) => o.channel), unit: 'đơn' },
    ]
  } else {
    const leads = read('leads').filter((l) => inRange(l.createdAt.slice(0, 10), cur.from, cur.to))
    const dep = inCur.filter((x) => x.ref.carCode !== undefined || x.ref.deposit)
    cancelRate = (read('deposits').filter((d) => inRange(d.date, cur.from, cur.to) && d.status === 'Huỷ cọc').length / (dep.length || 1)) * 100
    const brand = Object.fromEntries(read('cars').map((c) => [c.name, c.brand]))
    blocks = [
      { title: 'Doanh số theo hãng xe', data: groupSum(dep, (x) => brand[x.ref.car] || x.ref.car.split(' ')[0], (x) => x.amount) },
      { title: 'Doanh số theo tư vấn', data: groupSum(dep, (x) => x.ref.sale, (x) => x.amount) },
      { title: 'Khách quan tâm theo nguồn', data: groupSum(leads, (l) => l.source), donut: true, unit: 'khách' },
      { title: 'Phễu chuyển đổi', data: ['Mới', 'Đã liên hệ', 'Hẹn xem xe', 'Đàm phán', 'Đặt cọc'].map((s, i, arr) => ({ label: s, value: leads.filter((l) => arr.indexOf(l.status) >= i).length })), unit: 'khách', keepOrder: true },
      { title: 'Hồ sơ trả góp theo ngân hàng', data: groupSum(read('loans'), (l) => l.bank), unit: 'hồ sơ' },
      { title: 'Lý do khách không mua', data: groupSum(read('leads').filter((l) => l.status === 'Thất bại'), (l) => l.note || 'Không rõ'), unit: 'khách' },
    ]
  }

  const topCustomers = groupSum(inCur, (x) => x.ref.customer, (x) => x.amount, 6)

  function exportCSV() {
    downloadCSV(`${site.slug}-bao-cao-${days}-ngay-${isoDay()}.csv`, [{ key: 'full', label: 'Thời gian' }, { key: 'value', label: 'Doanh thu (đồng)' }, { key: 'value2', label: 'Số giao dịch' }], data)
    toast('Đã xuất báo cáo CSV')
  }

  return (
    <div className="adm-page">
      <PageHead title="Báo cáo" sub={`${fmtDate(cur.from)} – ${fmtDate(cur.to)} · so với ${fmtDate(prev.from)} – ${fmtDate(prev.to)}`}>
        <Tabs items={RANGES} value={days} onChange={setDays} small />
        <button type="button" className="adm-btn" onClick={exportCSV}>
          <Download size={16} /> CSV
        </button>
        <button type="button" className="adm-btn" onClick={() => window.print()}>
          <Printer size={16} /> In
        </button>
      </PageHead>
      <div className="adm-kpis">
        <Kpi label={site.profile === 'showroom' ? 'Doanh số' : 'Doanh thu'} value={moneyShort(rev)} delta={pct(rev, revPrev)} icon={CircleDollarSign} />
        <Kpi label="Số giao dịch" value={num(inCur.length)} delta={pct(inCur.length, inPrev.length)} icon={Receipt} tone="info" />
        <Kpi label="Khách mua" value={num(customersCur)} delta={pct(customersCur, customersPrev)} icon={Users} tone="ok" />
        <Kpi label="Tỉ lệ huỷ" value={cancelRate.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%'} hint={`Giá trị TB ${moneyShort(rev / (inCur.length || 1))}`} icon={ClipboardCheck} tone="warn" />
      </div>
      <Card title={n > 120 ? 'Theo tháng' : n > 45 ? 'Theo tuần' : 'Theo ngày'}>
        <AreaChart data={data} label="Doanh thu" second="Số giao dịch" />
      </Card>
      <div className="adm-grid adm-grid--3">
        {blocks.map((b) => (
          <Card key={b.title} title={b.title}>
            {b.donut ? <Donut data={b.data} size={140} format={(v) => (b.unit ? `${num(v)} ${b.unit}` : moneyShort(v))} /> : <BarList data={b.data} format={(v) => (b.unit ? `${num(v)} ${b.unit}` : moneyShort(v))} />}
          </Card>
        ))}
        <Card title="Khách hàng chi tiêu nhiều nhất">
          <BarList data={topCustomers} />
        </Card>
      </div>
    </div>
  )
}
