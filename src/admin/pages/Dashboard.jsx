// Trang Tổng quan: chỉ số chính so với 30 ngày trước, doanh thu theo ngày, cơ cấu trạng thái,
// lịch hôm nay, top dịch vụ / sản phẩm / xe, việc cần xử lý và hoạt động gần đây.
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, Car, CircleDollarSign, ClipboardCheck, Contact, Package, ShoppingBag, Star, Users, Wrench } from 'lucide-react'
import { useAdmin, useCollection } from '../store.jsx'
import { Badge, Card, Kpi, PageHead } from '../ui.jsx'
import { AreaChart, BarList, Donut } from '../charts.jsx'
import { ago, addDays, fmtDate, initials, isoDay, money, moneyShort, num } from '../lib.js'
import { inRange, pct, range, sales, series, groupSum } from '../metrics.js'
import { orderTotal, repairTotal } from '../schemas.jsx'

export default function Dashboard() {
  const { site, store } = useAdmin()
  const read = (c) => store.read(c)
  // đăng ký cập nhật khi dữ liệu đổi
  useCollection('activity')
  const base = `/quan-tri/${site.key}`
  const today = isoDay()
  const cur = range(30)
  const prev = range(30, 1)
  const S = sales(site, read)
  const revCur = S.filter((x) => inRange(x.date, cur.from, cur.to)).reduce((s, x) => s + x.amount, 0)
  const revPrev = S.filter((x) => inRange(x.date, prev.from, prev.to)).reduce((s, x) => s + x.amount, 0)
  const customers = read('customers')
  const newCust = customers.filter((c) => inRange(String(c.createdAt).slice(0, 10), cur.from, cur.to)).length
  const newCustPrev = customers.filter((c) => inRange(String(c.createdAt).slice(0, 10), prev.from, prev.to)).length
  const chart = series(S, 30)
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  let kpis, donut, top, scheduleCol, recent, quick
  if (site.profile === 'gara') {
    const ro = read('repairOrders')
    const bk = read('bookings')
    const todayBk = bk.filter((b) => b.date === today)
    const inShop = ro.filter((o) => ['Đã duyệt', 'Đang sửa', 'Chờ phụ tùng'].includes(o.status))
    kpis = [
      { label: 'Doanh thu 30 ngày', value: moneyShort(revCur), delta: pct(revCur, revPrev), icon: CircleDollarSign },
      { label: 'Lịch hẹn hôm nay', value: num(todayBk.length), hint: `${todayBk.filter((b) => b.status === 'Chờ xác nhận').length} chờ xác nhận`, icon: CalendarDays, tone: 'info' },
      { label: 'Xe đang trong xưởng', value: num(inShop.length), hint: `${ro.filter((o) => o.status === 'Chờ phụ tùng').length} chờ phụ tùng`, icon: Wrench, tone: 'warn' },
      { label: 'Khách mới 30 ngày', value: num(newCust), delta: pct(newCust, newCustPrev), icon: Users, tone: 'ok' },
    ]
    donut = { title: 'Phiếu sửa chữa theo trạng thái', data: groupSum(ro.filter((o) => inRange(o.date, cur.from, cur.to)), (o) => o.status) }
    top = { title: 'Dịch vụ mang lại doanh thu', data: groupSum(S.filter((x) => inRange(x.date, cur.from, cur.to)), (x) => x.ref.items.filter((i) => i.kind === 'Công').map((i) => i.name), (x, k) => x.ref.items.filter((i) => i.name === k).reduce((s, i) => s + i.qty * i.price, 0), 6) }
    scheduleCol = { title: 'Lịch hẹn hôm nay', col: 'bookings', rows: todayBk, line: (b) => `${b.customer} · ${b.plate}`, sub: (b) => b.service }
    recent = { title: 'Phiếu sửa chữa mới', col: 'repairOrders', rows: [...ro].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), line: (o) => `${o.code} · ${o.customer}`, sub: (o) => `${o.plate} · ${money(repairTotal(o))}` }
    quick = [['bookings', 'Thêm lịch hẹn'], ['repairOrders', 'Tạo phiếu sửa chữa']]
  } else if (site.profile === 'shop') {
    const od = read('orders')
    const pending = od.filter((o) => ['Chờ xác nhận', 'Đã xác nhận'].includes(o.status))
    const curOrders = S.filter((x) => inRange(x.date, cur.from, cur.to))
    const prevOrders = S.filter((x) => inRange(x.date, prev.from, prev.to))
    kpis = [
      { label: 'Doanh thu 30 ngày', value: moneyShort(revCur), delta: pct(revCur, revPrev), icon: CircleDollarSign },
      { label: 'Đơn cần xử lý', value: num(pending.length), hint: `${od.filter((o) => o.date === today).length} đơn hôm nay`, icon: ShoppingBag, tone: 'warn' },
      { label: 'Số đơn 30 ngày', value: num(curOrders.length), delta: pct(curOrders.length, prevOrders.length), icon: ClipboardCheck, tone: 'info' },
      { label: 'Giá trị TB / đơn', value: moneyShort(revCur / (curOrders.length || 1)), icon: Package, tone: 'ok' },
    ]
    donut = { title: 'Đơn hàng 30 ngày theo trạng thái', data: groupSum(od.filter((o) => inRange(o.date, cur.from, cur.to)), (o) => o.status) }
    top = { title: 'Sản phẩm bán chạy (doanh thu)', data: groupSum(curOrders, (x) => x.ref.items.map((i) => i.name), (x, k) => x.ref.items.filter((i) => i.name === k).reduce((s, i) => s + i.qty * i.price, 0), 6) }
    scheduleCol = { title: 'Lịch hẹn / lắp đặt hôm nay', col: 'installs', rows: read('installs').filter((b) => b.date === today), line: (b) => b.customer, sub: (b) => b.item }
    recent = { title: 'Đơn hàng mới', col: 'orders', rows: [...od].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), line: (o) => `${o.code} · ${o.customer}`, sub: (o) => money(orderTotal(o)) }
    quick = [['orders', 'Tạo đơn hàng'], ['products', 'Thêm sản phẩm']]
  } else {
    const cars = read('cars')
    const leads = read('leads')
    const curLeads = leads.filter((l) => inRange(l.createdAt.slice(0, 10), cur.from, cur.to))
    const prevLeads = leads.filter((l) => inRange(l.createdAt.slice(0, 10), prev.from, prev.to))
    const sell = cars.filter((c) => c.status === 'Đang bán')
    const won = curLeads.filter((l) => l.status === 'Đặt cọc').length
    kpis = [
      { label: 'Doanh số ký 30 ngày', value: moneyShort(revCur), delta: pct(revCur, revPrev), icon: CircleDollarSign },
      { label: 'Xe đang bán', value: num(sell.length), hint: `Giá trị ${moneyShort(sell.reduce((s, c) => s + c.price, 0))}`, icon: Car, tone: 'info' },
      { label: 'Khách quan tâm mới', value: num(curLeads.length), delta: pct(curLeads.length, prevLeads.length), icon: Contact, tone: 'warn' },
      { label: 'Tỉ lệ chốt cọc', value: Math.round((won / (curLeads.length || 1)) * 100) + '%', hint: `${won} khách đã cọc`, icon: ClipboardCheck, tone: 'ok' },
    ]
    donut = { title: 'Khách quan tâm theo giai đoạn', data: groupSum(leads, (l) => l.status) }
    top = { title: 'Xe được quan tâm nhiều nhất', data: groupSum(leads, (l) => l.car, () => 1, 6), format: (v) => `${v} khách` }
    scheduleCol = { title: 'Lịch lái thử / xem xe hôm nay', col: 'testDrives', rows: read('testDrives').filter((b) => b.date === today), line: (b) => b.customer, sub: (b) => b.car }
    recent = { title: 'Khách quan tâm mới', col: 'leads', rows: [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), line: (l) => `${l.name} · ${l.phone}`, sub: (l) => l.car }
    quick = [['leads', 'Thêm khách quan tâm'], ['cars', 'Đăng xe mới']]
  }

  // việc cần làm
  const alerts = []
  const pendingReviews = read('reviews').filter((r) => r.status === 'Chờ duyệt').length
  if (pendingReviews) alerts.push({ text: `${pendingReviews} đánh giá chờ duyệt`, to: 'reviews?tab=Chờ duyệt', icon: Star })
  if (site.profile === 'gara') {
    const low = read('parts').filter((p) => p.stock <= p.min).length
    if (low) alerts.push({ text: `${low} phụ tùng sắp hết / hết hàng`, to: 'parts?tab=Sắp hết', icon: Package })
    const quote = read('repairOrders').filter((o) => o.status === 'Báo giá').length
    if (quote) alerts.push({ text: `${quote} báo giá chờ khách duyệt`, to: 'repairOrders?tab=Báo giá', icon: Wrench })
    const due = read('vehicles').filter((v) => v.nextService >= today && v.nextService <= isoDay(addDays(new Date(), 14))).length
    if (due) alerts.push({ text: `${due} xe đến hạn bảo dưỡng trong 14 ngày`, to: 'vehicles', icon: Car })
    const pend = read('bookings').filter((b) => b.status === 'Chờ xác nhận').length
    if (pend) alerts.push({ text: `${pend} lịch hẹn chờ xác nhận`, to: 'bookings?tab=Chờ xác nhận', icon: CalendarDays })
  }
  if (site.profile === 'shop') {
    const low = read('products').filter((p) => p.stock <= p.min && p.status !== 'Ẩn').length
    if (low) alerts.push({ text: `${low} sản phẩm sắp hết / hết hàng`, to: 'products', icon: Package })
    const pend = read('orders').filter((o) => o.status === 'Chờ xác nhận').length
    if (pend) alerts.push({ text: `${pend} đơn chờ xác nhận`, to: 'orders?tab=Chờ xác nhận', icon: ShoppingBag })
    const ins = read('installs').filter((b) => b.status === 'Chờ xác nhận').length
    if (ins) alerts.push({ text: `${ins} lịch lắp đặt chờ xác nhận`, to: 'installs?tab=Chờ xác nhận', icon: CalendarDays })
  }
  if (site.profile === 'showroom') {
    const follow = read('leads').filter((l) => l.nextFollow && l.nextFollow <= today && !['Thất bại', 'Đặt cọc'].includes(l.status)).length
    if (follow) alerts.push({ text: `${follow} khách cần gọi lại hôm nay`, to: 'leads', icon: Contact })
    const fresh = read('leads').filter((l) => l.status === 'Mới').length
    if (fresh) alerts.push({ text: `${fresh} khách mới chưa liên hệ`, to: 'leads?tab=Mới', icon: Contact })
    const loans = read('loans').filter((l) => l.status === 'Mới nhận').length
    if (loans) alerts.push({ text: `${loans} hồ sơ trả góp mới`, to: 'loans?tab=Mới nhận', icon: CircleDollarSign })
    const deliver = read('deposits').filter((d) => d.status === 'Chờ giao xe').length
    if (deliver) alerts.push({ text: `${deliver} xe chờ giao cho khách`, to: 'deposits?tab=Chờ giao xe', icon: Car })
  }

  const activity = read('activity').slice(0, 8)

  return (
    <div className="adm-page">
      <PageHead title={`${greet}!`} sub={`${site.name} · ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}>
        {quick.map(([m, l]) => (
          <Link key={m} to={`${base}/${m}`} className="adm-btn">
            {l}
          </Link>
        ))}
      </PageHead>

      <div className="adm-kpis">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>

      <div className="adm-grid adm-grid--2-1">
        <Card title={site.profile === 'showroom' ? 'Doanh số theo ngày (30 ngày)' : 'Doanh thu theo ngày (30 ngày)'} actions={<Link to={`${base}/reports`} className="adm-link">Xem báo cáo →</Link>}>
          <AreaChart data={chart} label="Doanh thu" second="Số giao dịch" />
        </Card>
        <Card title={donut.title}>
          <Donut data={donut.data} center={num(donut.data.reduce((s, d) => s + d.value, 0))} />
        </Card>
      </div>

      <div className="adm-grid adm-grid--3">
        <Card title={scheduleCol.title} actions={<Link to={`${base}/${scheduleCol.col}`} className="adm-link">Tất cả →</Link>}>
          {scheduleCol.rows.length ? (
            <ul className="adm-mini">
              {scheduleCol.rows
                .sort((a, b) => a.time.localeCompare(b.time))
                .slice(0, 7)
                .map((r) => (
                  <li key={r.id}>
                    <Link to={`${base}/${scheduleCol.col}?open=${r.id}`}>
                      <time>{r.time}</time>
                      <div>
                        <b>{scheduleCol.line(r)}</b>
                        <span>{scheduleCol.sub(r)}</span>
                      </div>
                      <Badge>{r.status}</Badge>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="adm-muted">Hôm nay chưa có lịch.</p>
          )}
        </Card>
        <Card title={top.title}>
          <BarList data={top.data} format={top.format || moneyShort} />
        </Card>
        <Card title="Việc cần xử lý">
          {alerts.length ? (
            <ul className="adm-alerts">
              {alerts.map((a) => (
                <li key={a.text}>
                  <Link to={`${base}/${a.to}`}>
                    <a.icon size={18} />
                    <span>{a.text}</span>
                    <b>→</b>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-muted">
              <AlertTriangle size={16} /> Không có việc tồn đọng.
            </p>
          )}
        </Card>
      </div>

      <div className="adm-grid adm-grid--2">
        <Card title={recent.title} actions={<Link to={`${base}/${recent.col}`} className="adm-link">Tất cả →</Link>}>
          <ul className="adm-mini">
            {recent.rows.map((r) => (
              <li key={r.id}>
                <Link to={`${base}/${recent.col}?open=${r.id}`}>
                  <div>
                    <b>{recent.line(r)}</b>
                    <span>
                      {recent.sub(r)} · {ago(r.createdAt)}
                    </span>
                  </div>
                  <Badge>{r.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Hoạt động gần đây" actions={<Link to={`${base}/staff?tab=log`} className="adm-link">Nhật ký →</Link>}>
          <ul className="adm-feed">
            {activity.map((a) => (
              <li key={a.id}>
                <span className="adm-avatar adm-avatar--sm">{initials(a.user, 1)}</span>
                <p>
                  <b>{a.user}</b> {a.text}
                  <time>{ago(a.at)}</time>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="adm-foot-note">Số liệu tính từ dữ liệu minh hoạ của mẫu, cập nhật ngay khi bạn thêm / sửa. Mốc so sánh: {fmtDate(prev.from)} – {fmtDate(prev.to)}.</p>
    </div>
  )
}
