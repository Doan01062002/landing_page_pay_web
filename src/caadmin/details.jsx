// Ngăn "Xem chi tiết" của trang quản trị ChungAuto: yêu cầu tư vấn, khách hàng (lịch sử), hợp đồng (in báo giá).
import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Badge } from '../admin/ui.jsx'
import { fmtDate, fmtDateTime, initials, money } from '../admin/lib.js'
import { useSite } from '../lib/siteData.jsx'

const Row = ({ label, children, wide }) => (
  <div className={wide ? 'is-wide' : ''}>
    <dt>{label}</dt>
    <dd>{children ?? <span className="adm-muted">—</span>}</dd>
  </div>
)

export function LeadDetail({ row, ctx }) {
  const orders = ctx.read('orders').filter((o) => o.leadId === row.id)
  const utm = row.utm && Object.entries(row.utm).filter(([, v]) => v)
  return (
    <div className="adm-detail">
      <p>
        <Badge>{row.status}</Badge> <span className="adm-muted">gửi lúc {fmtDateTime(row.createdAt)}</span>
      </p>
      <dl className="adm-dl">
        <Row label="Mã">{row.code}</Row>
        <Row label="Họ tên">{row.name}</Row>
        <Row label="Điện thoại">
          <a href={`tel:${row.phone}`}>{row.phone}</a> · <a href={`https://zalo.me/${row.phone}`} target="_blank" rel="noreferrer">Zalo</a>
        </Row>
        <Row label="Email">{row.email || null}</Row>
        <Row label="Loại hình">{row.businessType || null}</Row>
        <Row label="Số chi nhánh">{row.branches || null}</Row>
        <Row label="Quan tâm" wide>
          {row.interest || 'Chưa chọn mẫu, cần tư vấn'}
        </Row>
        <Row label="Nguồn">{row.source}</Row>
        <Row label="Trang gửi">{row.page || null}</Row>
        {!!utm?.length && <Row label="Chiến dịch (UTM)" wide>{utm.map(([k, v]) => `${k}: ${v}`).join(' · ')}</Row>}
        <Row label="Phụ trách">{row.assignedName || null}</Row>
        <Row label="Gọi lại">{row.nextFollow ? fmtDate(row.nextFollow) : null}</Row>
        <Row label="Nội dung khách gửi" wide>
          {row.message || null}
        </Row>
        <Row label="Ghi chú nội bộ" wide>
          {row.note || null}
        </Row>
      </dl>
      {row.customerCode && (
        <p className="adm-note">
          Đã chuyển thành khách hàng <b>{row.customerCode}</b>
          {orders.map((o) => (
            <span key={o.id}>
              {' '}
              · hợp đồng{' '}
              <Link to={`/admin/hop-dong?open=${o.id}`} className="adm-link">
                {o.code}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

export function CustomerDetail({ row, ctx }) {
  const orders = ctx.read('orders').filter((o) => o.customerId === row.id)
  const ids = new Set(orders.map((o) => o.id))
  const payments = ctx.read('payments').filter((p) => ids.has(p.orderId))
  const leads = ctx.read('leads').filter((l) => l.customerId === row.id || l.phone === row.phone)
  const value = orders.filter((o) => o.status !== 'Đã huỷ').reduce((s, o) => s + o.total, 0)
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  return (
    <div className="adm-detail">
      <div className="adm-profile">
        <span className="adm-avatar adm-avatar--lg">{initials(row.name, 1)}</span>
        <div>
          <h3>{row.name}</h3>
          <p>
            {row.phone} {row.email && `· ${row.email}`}
          </p>
          <p>
            {row.code} · {row.businessName || 'Chưa có tên doanh nghiệp'} · {row.businessType || 'Chưa rõ loại hình'}
          </p>
        </div>
      </div>
      <div className="adm-summary adm-summary--sm">
        <div>
          <span>Giá trị hợp đồng</span>
          <b>{money(value)}</b>
        </div>
        <div>
          <span>Đã thanh toán</span>
          <b>{money(paid)}</b>
        </div>
        <div>
          <span>Còn nợ</span>
          <b>{money(Math.max(0, value - paid))}</b>
        </div>
        <div>
          <span>Hợp đồng</span>
          <b>{orders.length}</b>
        </div>
      </div>
      <dl className="adm-dl">
        <Row label="Mã số thuế">{row.taxCode || null}</Row>
        <Row label="Số chi nhánh">{row.branches || null}</Row>
        <Row label="Địa chỉ" wide>
          {row.address || null}
        </Row>
        <Row label="Ghi chú" wide>
          {row.note || null}
        </Row>
      </dl>
      <section className="adm-history">
        <h3>
          Hợp đồng <span>{orders.length}</span>
        </h3>
        {orders.length ? (
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/admin/hop-dong?open=${o.id}`} className="adm-link">
                  {o.code}
                </Link>
                <span>{o.itemName}</span>
                <span>{money(o.total)}</span>
                <Badge>{o.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-muted">Chưa có hợp đồng</p>
        )}
      </section>
      <section className="adm-history">
        <h3>
          Thanh toán <span>{payments.length}</span>
        </h3>
        {payments.length ? (
          <ul>
            {payments.map((p) => (
              <li key={p.id}>
                <b>{p.code}</b>
                <span>{fmtDate(p.paidAt)}</span>
                <span>{money(p.amount)}</span>
                <span>{p.method}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-muted">Chưa thu tiền</p>
        )}
      </section>
      {!!leads.length && (
        <section className="adm-history">
          <h3>
            Yêu cầu tư vấn <span>{leads.length}</span>
          </h3>
          <ul>
            {leads.map((l) => (
              <li key={l.id}>
                <Link to={`/admin/yeu-cau?open=${l.id}`} className="adm-link">
                  {l.code}
                </Link>
                <span>{fmtDate(l.createdAt)}</span>
                <span>{l.interest || '—'}</span>
                <Badge>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

const FLOW = ['Báo giá', 'Đã ký', 'Đang triển khai', 'Chờ nghiệm thu', 'Hoàn tất']

export function OrderDetail({ row, ctx }) {
  const site = useSite()
  const payments = ctx.read('payments').filter((p) => p.orderId === row.id)
  const step = FLOW.indexOf(row.status)
  return (
    <div className="adm-detail">
      <ol className={`adm-steps ${step < 0 ? 'is-cancel' : ''}`} aria-label="Tiến trình hợp đồng">
        {step < 0 ? (
          <li className="is-done">
            <Badge>{row.status}</Badge>
          </li>
        ) : (
          FLOW.map((s, i) => (
            <li key={s} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
              <i />
              <span>{s}</span>
            </li>
          ))
        )}
      </ol>
      <div className="adm-print">
        <header className="adm-print__head">
          <div>
            <b>{site.company?.split('·')[0] || site.brand}</b>
            <span>{site.address}</span>
            <span>
              Hotline {site.hotline} · {site.email}
            </span>
          </div>
          <div className="adm-print__no">
            <b>{row.status === 'Báo giá' ? 'BÁO GIÁ TRIỂN KHAI PHẦN MỀM' : 'HỢP ĐỒNG TRIỂN KHAI PHẦN MỀM'}</b>
            <span>Số: {row.code}</span>
            <span>Ngày: {fmtDate(row.createdAt)}</span>
          </div>
        </header>
        <dl className="adm-dl adm-dl--2">
          <Row label="Khách hàng">{row.customerName}</Row>
          <Row label="Điện thoại">{row.customerPhone}</Row>
          <Row label="Doanh nghiệp">{row.businessName || null}</Row>
          <Row label="Tên miền">{row.domain || null}</Row>
          <Row label="Bắt đầu">{row.startDate ? fmtDate(row.startDate) : null}</Row>
          <Row label="Hạn bàn giao">{row.dueDate ? fmtDate(row.dueDate) : null}</Row>
          <Row label="Phụ trách">{row.assignedName || null}</Row>
        </dl>
        <table className="adm-table adm-table--plain">
          <thead>
            <tr>
              <th>Hạng mục</th>
              <th>Gói</th>
              <th className="num">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{row.itemName}</td>
              <td>{row.package || '—'}</td>
              <td className="num">{money(row.price)}</td>
            </tr>
            {row.giftLanding && (
              <tr>
                <td>Tặng 1 landing page quảng cáo</td>
                <td>Quà tặng</td>
                <td className="num">0đ</td>
              </tr>
            )}
          </tbody>
        </table>
        <dl className="adm-totals">
          <dt>Giá</dt>
          <dd>{money(row.price)}</dd>
          {!!row.discount && (
            <>
              <dt>Giảm giá</dt>
              <dd>−{money(row.discount)}</dd>
            </>
          )}
          <dt className="is-total">Tổng cộng</dt>
          <dd className="is-total">{money(row.total)}</dd>
          <dt>Đã thanh toán</dt>
          <dd>{money(row.paid)}</dd>
          <dt>Còn lại</dt>
          <dd>
            <b>{money(Math.max(0, row.remaining))}</b>
          </dd>
        </dl>
        {row.note && <p className="adm-print__note">Phạm vi / ghi chú: {row.note}</p>}
        <div className="adm-print__sign">
          <div>
            <b>Khách hàng</b>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
          <div>
            <b>Đại diện {site.brand}</b>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
        </div>
      </div>
      <section className="adm-history">
        <h3>
          Các lần thu tiền <span>{payments.length}</span>
        </h3>
        {payments.length ? (
          <ul>
            {payments.map((p) => (
              <li key={p.id}>
                <b>{p.code}</b>
                <span>{fmtDate(p.paidAt)}</span>
                <span>{money(p.amount)}</span>
                <span>{p.method}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-muted">Chưa thu tiền</p>
        )}
      </section>
      <button type="button" className="adm-btn" onClick={() => window.print()}>
        <Printer size={16} /> In {row.status === 'Báo giá' ? 'báo giá' : 'hợp đồng'}
      </button>
    </div>
  )
}
