// Tổng quan quản trị ChungAuto: yêu cầu tư vấn, tỉ lệ chốt, tiền thu, công nợ; biểu đồ theo ngày; việc cần làm.
import { Link } from 'react-router-dom'
import { CircleDollarSign, ClipboardCheck, Contact, Wallet } from 'lucide-react'
import { useAdmin, useCollection } from '../admin/store.jsx'
import { Badge, Card, Kpi, PageHead } from '../admin/ui.jsx'
import { AreaChart, BarList, Donut } from '../admin/charts.jsx'
import { ago, fmtDate, isoDay, money, moneyShort, num } from '../admin/lib.js'
import { groupSum, inRange, pct, range, series } from '../admin/metrics.js'

export default function CaDashboard() {
  const { site, store } = useAdmin()
  const perms = site.perms
  const has = (p) => (perms[p] || '').includes('r')
  useCollection('leads')
  const leads = has('leads') ? store.read('leads') : []
  const orders = has('orders') ? store.read('orders') : []
  const payments = has('payments') ? store.read('payments') : []
  const audit = has('audit') ? store.read('audit') : []
  const cur = range(30)
  const prev = range(30, 1)
  const day = (r) => isoDay(new Date(r.createdAt))

  const leadsCur = leads.filter((l) => inRange(day(l), cur.from, cur.to))
  const leadsPrev = leads.filter((l) => inRange(day(l), prev.from, prev.to))
  const won = leadsCur.filter((l) => l.status === 'Chốt hợp đồng').length
  const paidCur = payments.filter((p) => inRange(p.paidAt, cur.from, cur.to)).reduce((s, p) => s + p.amount, 0)
  const paidPrev = payments.filter((p) => inRange(p.paidAt, prev.from, prev.to)).reduce((s, p) => s + p.amount, 0)
  const live = orders.filter((o) => o.status !== 'Đã huỷ')
  const debt = live.reduce((s, o) => s + Math.max(0, o.remaining || 0), 0)
  const today = isoDay()
  const follow = leads.filter((l) => (l.status === 'Mới' || (l.nextFollow && l.nextFollow <= today)) && !['Chốt hợp đồng', 'Thất bại'].includes(l.status)).slice(0, 8)
  const running = live.filter((o) => ['Đã ký', 'Đang triển khai', 'Chờ nghiệm thu'].includes(o.status)).sort((a, b) => String(a.dueDate || '9').localeCompare(String(b.dueDate || '9'))).slice(0, 8)
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="adm-page">
      <PageHead title={`${greet}, ${site.me.name.split(' ').pop()}!`} sub={new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
        {has('leads') && (
          <Link to="/admin/yeu-cau" className="adm-btn">
            Yêu cầu tư vấn
          </Link>
        )}
        {(perms.orders || '').includes('w') && (
          <Link to="/admin/hop-dong" className="adm-btn">
            Hợp đồng
          </Link>
        )}
      </PageHead>

      {has('leads') ? (
        <>
          <div className="adm-kpis">
            <Kpi label="Yêu cầu tư vấn 30 ngày" value={num(leadsCur.length)} delta={pct(leadsCur.length, leadsPrev.length)} icon={Contact} />
            <Kpi label="Tỉ lệ chốt hợp đồng" value={Math.round((won / (leadsCur.length || 1)) * 100) + '%'} hint={`${won} yêu cầu đã chốt`} icon={ClipboardCheck} tone="ok" />
            {has('payments') && <Kpi label="Đã thu 30 ngày" value={moneyShort(paidCur)} delta={pct(paidCur, paidPrev)} icon={Wallet} tone="info" />}
            {has('orders') && <Kpi label="Công nợ hợp đồng" value={moneyShort(debt)} hint={`${live.filter((o) => o.remaining > 0).length} hợp đồng còn nợ`} icon={CircleDollarSign} tone="warn" />}
          </div>
          <div className="adm-grid adm-grid--2-1">
            <Card title="Yêu cầu tư vấn theo ngày (30 ngày)" actions={<Link to="/admin/yeu-cau" className="adm-link">Xem tất cả →</Link>}>
              <AreaChart data={series(leads.map((l) => ({ date: day(l), amount: 1 })), 30)} label="Yêu cầu" format={(v) => (Number.isInteger(v) ? num(v) : '')} />
            </Card>
            <Card title="Theo trạng thái">
              <Donut data={groupSum(leads, (l) => l.status)} center={num(leads.length)} />
            </Card>
          </div>
          <div className="adm-grid adm-grid--3">
            <Card title="Mẫu được quan tâm (90 ngày)">
              <BarList data={groupSum(leads.filter((l) => inRange(day(l), range(90).from, range(90).to)), (l) => l.interest || 'Chưa chọn mẫu', () => 1, 6)} format={(v) => `${v} yêu cầu`} />
            </Card>
            <Card title="Nguồn khách">
              <BarList data={groupSum(leads, (l) => l.source, () => 1, 6)} format={(v) => `${v} yêu cầu`} />
            </Card>
            <Card title="Loại hình kinh doanh">
              <BarList data={groupSum(leads, (l) => l.businessType || 'Chưa rõ', () => 1, 6)} format={(v) => `${v} yêu cầu`} />
            </Card>
          </div>
          <div className="adm-grid adm-grid--2">
            <Card title="Cần gọi / gọi lại" actions={<Link to="/admin/yeu-cau?tab=Mới" className="adm-link">Tất cả →</Link>}>
              {follow.length ? (
                <ul className="adm-mini">
                  {follow.map((l) => (
                    <li key={l.id}>
                      <Link to={`/admin/yeu-cau?open=${l.id}`}>
                        <div>
                          <b>
                            {l.name} · {l.phone}
                          </b>
                          <span>
                            {l.interest || 'Cần tư vấn'} · {ago(l.createdAt)}
                          </span>
                        </div>
                        <Badge>{l.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="adm-muted">Không có yêu cầu nào cần gọi.</p>
              )}
            </Card>
            {has('orders') && (
              <Card title="Hợp đồng đang triển khai" actions={<Link to="/admin/hop-dong" className="adm-link">Tất cả →</Link>}>
                {running.length ? (
                  <ul className="adm-mini">
                    {running.map((o) => (
                      <li key={o.id}>
                        <Link to={`/admin/hop-dong?open=${o.id}`}>
                          <div>
                            <b>
                              {o.code} · {o.customerName}
                            </b>
                            <span>
                              {o.itemName} · hạn {o.dueDate ? fmtDate(o.dueDate) : 'chưa đặt'} · còn {money(o.remaining)}
                            </span>
                          </div>
                          <Badge tone={o.dueDate && o.dueDate < today ? 'danger' : undefined}>{o.status}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="adm-muted">Chưa có hợp đồng đang triển khai.</p>
                )}
              </Card>
            )}
          </div>
          {has('payments') && (
            <Card title="Tiền thu theo ngày (30 ngày)" actions={<Link to="/admin/thu-tien" className="adm-link">Sổ thu →</Link>}>
              <AreaChart data={series(payments.map((p) => ({ date: p.paidAt, amount: p.amount })), 30)} label="Đã thu" second="Số phiếu" />
            </Card>
          )}
        </>
      ) : (
        <Card title="Lối tắt">
          <ul className="adm-alerts">
            <li>
              <Link to="/admin/mau-phan-mem">Sửa giá, mô tả, ẩn / hiện mẫu phần mềm</Link>
            </li>
            <li>
              <Link to="/admin/hoi-dap">Cập nhật hỏi đáp trên trang chủ</Link>
            </li>
            <li>
              <Link to="/admin/cai-dat">Thông tin liên hệ, khuyến mãi, SEO</Link>
            </li>
          </ul>
        </Card>
      )}
      {has('audit') && !!audit.length && (
        <Card title="Hoạt động gần đây" actions={<Link to="/admin/nhat-ky" className="adm-link">Nhật ký →</Link>}>
          <ul className="adm-feed">
            {audit.slice(0, 8).map((a) => (
              <li key={a.id}>
                <p>
                  <b>{a.userName}</b> · {a.summary}
                  <time>{ago(a.createdAt)}</time>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
