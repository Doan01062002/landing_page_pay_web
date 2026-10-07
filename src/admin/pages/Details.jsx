// Nội dung ngăn "Xem chi tiết": phiếu / hoá đơn có thể in, hồ sơ khách hàng (lịch sử giao dịch),
// hồ sơ xe (lịch sử sửa chữa theo biển số) và dạng mặc định liệt kê các trường.
import { Printer } from 'lucide-react'
import { fmtDate, fmtDateTime, initials, money, num } from '../lib.js'
import { Badge, Stars } from '../ui.jsx'
import { orderTotal, repairTotal } from '../schemas.jsx'

export function DetailBody({ schema, row, ctx, statusOf }) {
  // chi tiết tuỳ biến (component) – dùng cho trang quản trị ChungAuto
  if (typeof schema.detail === 'function') return <schema.detail schema={schema} row={row} ctx={ctx} />
  if (schema.detail === 'invoice') return <Invoice schema={schema} row={row} ctx={ctx} />
  if (schema.detail === 'customer') return <CustomerDetail row={row} ctx={ctx} />
  if (schema.detail === 'vehicle') return <VehicleDetail row={row} ctx={ctx} />
  return <FieldList schema={schema} row={row} statusOf={statusOf} />
}

export function fmtValue(f, v) {
  if (v === undefined || v === null || v === '') return <span className="adm-muted">—</span>
  switch (f.type) {
    case 'money':
      return money(v)
    case 'number':
      return `${num(v)}${f.suffix ? ' ' + f.suffix : ''}`
    case 'date':
      return fmtDate(v)
    case 'boolean':
      return v ? 'Có' : 'Không'
    case 'image':
      return <img className="adm-detail__img" src={v} alt="" />
    case 'rating':
      return <Stars value={v} />
    case 'tags':
      return v.join(', ')
    case 'items':
      return `${v.length} dòng`
    case 'select':
      return /trạng thái|giai đoạn/i.test(f.label) ? <Badge>{v}</Badge> : v
    default:
      return String(v)
  }
}

function FieldList({ schema, row, statusOf }) {
  const st = statusOf(row)
  return (
    <div className="adm-detail">
      {st && (
        <p>
          <Badge>{st}</Badge>
        </p>
      )}
      <dl className="adm-dl">
        {row.code && (
          <>
            <dt>Mã</dt>
            <dd className="adm-code">{row.code}</dd>
          </>
        )}
        {schema.fields
          .filter((f) => !f.hidden?.(row))
          .map((f) => (
            <div key={f.key} className={f.wide ? 'is-wide' : ''}>
              <dt>{f.label}</dt>
              <dd>{fmtValue(f, row[f.key])}</dd>
            </div>
          ))}
        {row.createdAt && (
          <div>
            <dt>Tạo lúc</dt>
            <dd>{fmtDateTime(row.createdAt)}</dd>
          </div>
        )}
        {row.updatedAt && (
          <div>
            <dt>Cập nhật</dt>
            <dd>{fmtDateTime(row.updatedAt)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

const FLOWS = {
  orders: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Hoàn tất'],
  repairOrders: ['Báo giá', 'Đã duyệt', 'Đang sửa', 'Hoàn thành', 'Đã giao xe'],
  deposits: ['Đã đặt cọc', 'Chờ giao xe', 'Đã giao xe'],
}
const TITLES = { orders: 'HOÁ ĐƠN BÁN HÀNG', repairOrders: 'PHIẾU SỬA CHỮA – BÁO GIÁ', deposits: 'HỢP ĐỒNG ĐẶT CỌC MUA XE' }

function Invoice({ schema, row, ctx }) {
  const settings = ctx.read('settings')
  const flow = FLOWS[schema.id] || []
  const step = flow.indexOf(row.status)
  const cancelled = step < 0
  const isRepair = schema.id === 'repairOrders'
  const isDeposit = schema.id === 'deposits'
  const sub = (row.items || []).reduce((s, it) => s + it.qty * it.price, 0)
  const total = isRepair ? repairTotal(row) : isDeposit ? row.price : orderTotal(row)
  const paid = isRepair ? row.paid || 0 : isDeposit ? row.deposit : row.paid ? total : 0
  return (
    <div className="adm-detail">
      <ol className={`adm-steps ${cancelled ? 'is-cancel' : ''}`} aria-label="Tiến trình">
        {cancelled ? (
          <li className="is-done">
            <Badge>{row.status}</Badge>
          </li>
        ) : (
          flow.map((s, i) => (
            <li key={s} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
              <i />
              <span>{s}</span>
            </li>
          ))
        )}
      </ol>

      <div className="adm-print" id="adm-print">
        <header className="adm-print__head">
          <div>
            <b>{settings.name}</b>
            <span>{settings.address}</span>
            <span>
              Hotline {settings.hotline} · {settings.email}
            </span>
          </div>
          <div className="adm-print__no">
            <b>{TITLES[schema.id]}</b>
            <span>Số: {row.code}</span>
            <span>Ngày: {fmtDate(row.date || row.createdAt)}</span>
          </div>
        </header>
        <dl className="adm-dl adm-dl--2">
          <div>
            <dt>Khách hàng</dt>
            <dd>{row.customer}</dd>
          </div>
          <div>
            <dt>Điện thoại</dt>
            <dd>{row.phone}</dd>
          </div>
          {row.address && (
            <div className="is-wide">
              <dt>Địa chỉ</dt>
              <dd>{row.address}</dd>
            </div>
          )}
          {isRepair && (
            <>
              <div>
                <dt>Xe / biển số</dt>
                <dd>
                  {row.car} · <span className="adm-plate">{row.plate}</span>
                </dd>
              </div>
              <div>
                <dt>Số km</dt>
                <dd>{num(row.km)} km</dd>
              </div>
              <div>
                <dt>Cố vấn / KTV</dt>
                <dd>
                  {row.advisor || '—'} / {row.tech || '—'}
                </dd>
              </div>
              <div>
                <dt>Chi nhánh</dt>
                <dd>{row.branch}</dd>
              </div>
            </>
          )}
          {schema.id === 'orders' && (
            <>
              <div>
                <dt>Thanh toán</dt>
                <dd>
                  {row.payment} · {row.paid ? 'đã thanh toán' : 'chưa thanh toán'}
                </dd>
              </div>
              <div>
                <dt>Kênh / lắp đặt</dt>
                <dd>
                  {row.channel}
                  {row.install ? ' · có lắp đặt' : ''}
                </dd>
              </div>
            </>
          )}
          {isDeposit && (
            <>
              <div className="is-wide">
                <dt>Xe</dt>
                <dd>
                  {row.car} {row.carCode ? `(${row.carCode})` : ''}
                </dd>
              </div>
              <div>
                <dt>Hình thức</dt>
                <dd>{row.payment}</dd>
              </div>
              <div>
                <dt>Hẹn giao xe</dt>
                <dd>{fmtDate(row.delivery)}</dd>
              </div>
              <div>
                <dt>Tư vấn</dt>
                <dd>{row.sale || '—'}</dd>
              </div>
            </>
          )}
        </dl>

        {!isDeposit && (
          <table className="adm-table adm-table--plain">
            <thead>
              <tr>
                <th>#</th>
                <th>{isRepair ? 'Hạng mục' : 'Sản phẩm'}</th>
                {isRepair && <th>Loại</th>}
                <th className="num">SL</th>
                <th className="num">Đơn giá</th>
                <th className="num">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(row.items || []).map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.name}</td>
                  {isRepair && <td>{it.kind}</td>}
                  <td className="num">{it.qty}</td>
                  <td className="num">{money(it.price)}</td>
                  <td className="num">{money(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <dl className="adm-totals">
          {!isDeposit && (
            <>
              <dt>Tạm tính</dt>
              <dd>{money(sub)}</dd>
            </>
          )}
          {!!row.ship && (
            <>
              <dt>Phí vận chuyển</dt>
              <dd>{money(row.ship)}</dd>
            </>
          )}
          {!!row.discount && (
            <>
              <dt>Giảm giá</dt>
              <dd>−{money(row.discount)}</dd>
            </>
          )}
          <dt className="is-total">{isDeposit ? 'Giá xe' : 'Tổng cộng'}</dt>
          <dd className="is-total">{money(total)}</dd>
          <dt>{isDeposit ? 'Đã đặt cọc' : 'Đã thanh toán'}</dt>
          <dd>{money(paid)}</dd>
          <dt>Còn lại</dt>
          <dd>
            <b>{money(Math.max(0, total - paid))}</b>
          </dd>
        </dl>
        {row.note && <p className="adm-print__note">Ghi chú: {row.note}</p>}
        <div className="adm-print__sign">
          <div>
            <b>Khách hàng</b>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
          <div>
            <b>Đại diện {settings.name}</b>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
        </div>
      </div>
      <button type="button" className="adm-btn" onClick={() => window.print()}>
        <Printer size={16} /> In {isRepair ? 'phiếu' : isDeposit ? 'hợp đồng' : 'hoá đơn'}
      </button>
    </div>
  )
}

function History({ title, rows, render }) {
  return (
    <section className="adm-history">
      <h3>
        {title} <span>{rows.length}</span>
      </h3>
      {rows.length ? <ul>{rows.slice(0, 8).map(render)}</ul> : <p className="adm-muted">Chưa có</p>}
    </section>
  )
}

function CustomerDetail({ row, ctx }) {
  const same = (r) => r.phone === row.phone || r.customer === row.name || r.name === row.name || r.owner === row.name
  const orders = ctx.read('orders').filter(same)
  const repairs = ctx.read('repairOrders').filter(same)
  const bookings = [...ctx.read('bookings'), ...ctx.read('installs'), ...ctx.read('testDrives')].filter(same)
  const leads = ctx.read('leads').filter(same)
  const deposits = ctx.read('deposits').filter(same)
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
            <Badge tone={row.tier === 'VIP' ? 'info' : 'ok'}>{row.tier}</Badge> {row.code} · {row.city} · nguồn {row.source}
          </p>
        </div>
      </div>
      <div className="adm-summary adm-summary--sm">
        <div>
          <span>Đã chi tiêu</span>
          <b>{money(row.spent || 0)}</b>
        </div>
        <div>
          <span>Số lần</span>
          <b>{row.visits || 0}</b>
        </div>
        <div>
          <span>Gần nhất</span>
          <b>{fmtDate(row.lastVisit)}</b>
        </div>
        <div>
          <span>Xe</span>
          <b>{row.car}</b>
        </div>
      </div>
      {row.note && <p className="adm-note">📝 {row.note}</p>}
      {!!orders.length && <History title="Đơn hàng" rows={orders} render={(o) => <li key={o.id}><b>{o.code}</b> <span>{fmtDate(o.date)}</span> <span>{money(orderTotal(o))}</span> <Badge>{o.status}</Badge></li>} />}
      {!!repairs.length && <History title="Phiếu sửa chữa" rows={repairs} render={(o) => <li key={o.id}><b>{o.code}</b> <span>{fmtDate(o.date)}</span> <span>{money(repairTotal(o))}</span> <Badge>{o.status}</Badge></li>} />}
      {!!bookings.length && <History title="Lịch hẹn" rows={bookings} render={(o) => <li key={o.id}><b>{o.code}</b> <span>{fmtDate(o.date)} {o.time}</span> <span>{o.service || o.item || o.car}</span> <Badge>{o.status}</Badge></li>} />}
      {!!leads.length && <History title="Nhu cầu mua xe" rows={leads} render={(o) => <li key={o.id}><b>{o.code}</b> <span>{o.car}</span> <Badge>{o.status}</Badge></li>} />}
      {!!deposits.length && <History title="Hợp đồng" rows={deposits} render={(o) => <li key={o.id}><b>{o.code}</b> <span>{o.car}</span> <span>{money(o.price)}</span> <Badge>{o.status}</Badge></li>} />}
      {!orders.length && !repairs.length && !bookings.length && !leads.length && !deposits.length && <p className="adm-muted">Khách chưa có giao dịch nào.</p>}
    </div>
  )
}

function VehicleDetail({ row, ctx }) {
  const repairs = ctx
    .read('repairOrders')
    .filter((o) => o.plate === row.plate)
    .sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="adm-detail">
      <div className="adm-profile">
        <span className="adm-plate adm-plate--lg">{row.plate}</span>
        <div>
          <h3>
            {row.car} · {row.year}
          </h3>
          <p>
            Chủ xe {row.owner} · {row.phone}
          </p>
          <p>
            Màu {row.color || '—'} · VIN {row.vin || '—'} {row.insurance && `· Bảo hiểm ${row.insurance}`}
          </p>
        </div>
      </div>
      <div className="adm-summary adm-summary--sm">
        <div>
          <span>ODO</span>
          <b>{num(row.km)} km</b>
        </div>
        <div>
          <span>Lượt vào xưởng</span>
          <b>{repairs.length}</b>
        </div>
        <div>
          <span>Tổng chi</span>
          <b>{money(repairs.filter((r) => r.status !== 'Đã huỷ').reduce((s, r) => s + repairTotal(r), 0))}</b>
        </div>
        <div>
          <span>Hẹn bảo dưỡng</span>
          <b>{fmtDate(row.nextService)}</b>
        </div>
      </div>
      <section className="adm-history adm-history--timeline">
        <h3>
          Lịch sử sửa chữa <span>{repairs.length}</span>
        </h3>
        {repairs.length ? (
          <ol>
            {repairs.map((o) => (
              <li key={o.id}>
                <p>
                  <b>{fmtDate(o.date)}</b> · {num(o.km)} km · {o.branch} · <Badge>{o.status}</Badge>
                </p>
                <p className="adm-muted">{o.items.map((i) => i.name).join(', ')}</p>
                <p>
                  {o.code} · {money(repairTotal(o))}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="adm-muted">Chưa có lần sửa chữa nào được ghi nhận.</p>
        )}
      </section>
    </div>
  )
}

