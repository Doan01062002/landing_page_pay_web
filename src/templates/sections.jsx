import { useMemo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { motionAllowed, prefersReducedMotion, useInView } from '../components/Motion.jsx'

function Head({ eyebrow, title, text, center, more }) {
  return (
    <div className={'ts-head' + (center ? ' ts-head--center' : '')} data-reveal="up">
      {eyebrow && <p className="ts-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {more && (
        <Link to={more.to} className="ts-more">
          {more.label} <Icon name="ArrowRight" size={15} />
        </Link>
      )}
    </div>
  )
}

/* ---------- Dịch vụ ---------- */
export function Services({ t, more }) {
  if (!t.services.length) return null
  const withImages = t.services.some((s) => s.image)
  return (
    <section className="ts-section" id="services">
      <div className="ts-wrap">
        <Head eyebrow="Dịch vụ" title="Chúng tôi làm gì cho xe của bạn" text="Giá niêm yết rõ ràng, báo giá chi tiết trước khi làm." more={more} />
        <div className={'ts-services' + (withImages ? ' ts-services--img' : ' ts-services--icon')} data-stagger="up">
          {t.services.map((s) => (
            <article key={s.title} className="ts-service">
              {s.image ? (
                <img src={s.image} alt="" loading="lazy" />
              ) : (
                <span className="ts-service__icon">
                  <Icon name={s.icon} size={24} />
                </span>
              )}
              <div className="ts-service__body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.price && <span className="ts-service__price">{s.price}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Bảng giá theo mốc ---------- */
export function PriceTable({ t, onBook, more }) {
  const pt = t.priceTable
  return (
    <section className="ts-section ts-section--soft" id="pricetable">
      <div className="ts-wrap">
        <Head eyebrow="Bảng giá" title={pt.title} text={pt.note} more={more} />
        <p className="ts-swipe">
          Vuốt ngang để xem các cột khác <Icon name="ArrowRight" size={14} />
        </p>
        <div className="ts-table-wrap" data-reveal="up">
          <table className="ts-table">
            <thead>
              <tr>
                <th scope="col">Hạng mục</th>
                {pt.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pt.rows.map(([label, vals]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i}>
                      {v === 1 ? (
                        <span className="ts-yes" aria-label="Có">
                          <Icon name="Check" size={16} strokeWidth={3} />
                        </span>
                      ) : v === 0 ? (
                        <span className="ts-no" aria-label="Không">
                          –
                        </span>
                      ) : (
                        <span className="ts-val">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Giá trọn gói</th>
                {pt.prices.map((p, i) => (
                  <td key={i}>
                    <b>{p}</b>
                    {onBook && (
                      <button type="button" className="ts-btn ts-btn--p ts-btn--sm" onClick={() => onBook(`Gói ${pt.columns[i]}`)}>
                        Đặt lịch
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ---------- Tra cứu theo biển số ---------- */
export function Lookup({ t }) {
  const [plate, setPlate] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const isEV = t.category === 'xedien'

  const submit = (e) => {
    e.preventDefault()
    const p = plate.trim().toUpperCase()
    if (!/^\d{2}[A-Z]{1,2}\d?[-\s]?\d{3,5}(\.\d{2})?$/.test(p.replace(/\s/g, ''))) {
      setError('Biển số chưa đúng định dạng. Ví dụ: 51G-246.81 hoặc 30A12345.')
      setResult(null)
      return
    }
    setError('')
    const b = t.branches
    setResult({
      plate: p,
      next: isEV ? 'Kiểm tra định kỳ 36.000 km (dự kiến 12/2026)' : 'Bảo dưỡng 40.000 km (dự kiến 11/2026)',
      soh: isEV ? '96%' : null,
      rows: isEV
        ? [
            { date: '02/09/2026', km: '24.150', work: 'Kiểm tra 24.000 km, cập nhật phần mềm', branch: b[0].name },
            { date: '15/03/2026', km: '12.080', work: 'Kiểm tra 12.000 km, đo SoH 98%', branch: b[0].name },
          ]
        : [
            { date: '12/08/2026', km: '35.200', work: 'Bảo dưỡng 30.000 km, thay má phanh trước', branch: b[0].name },
            { date: '20/02/2026', km: '25.400', work: 'Bảo dưỡng 20.000 km', branch: (b[1] || b[0]).name },
            { date: '05/09/2025', km: '15.100', work: 'Thay ắc quy, cân chỉnh độ chụm', branch: b[0].name },
          ],
    })
  }

  return (
    <section className="ts-section" id="lookup">
      <div className="ts-wrap ts-lookup">
        <div className="ts-lookup__intro" data-reveal="left">
          <Head eyebrow="Tra cứu" title={isEV ? 'Tra cứu lịch sử dịch vụ & sức khỏe pin' : 'Tra cứu lịch sử bảo dưỡng'} text="Nhập biển số để xem các lần làm dịch vụ và mốc bảo dưỡng tiếp theo." />
          <form className="ts-lookup__form" onSubmit={submit} noValidate>
            <label htmlFor="ts-plate" className="ts-sr">
              Biển số xe
            </label>
            <input id="ts-plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="51G-246.81" autoComplete="off" />
            <button type="submit" className="ts-btn ts-btn--p ts-btn--lg">
              <Icon name="Search" size={18} /> Tra cứu
            </button>
          </form>
          {error && <p className="ts-error">{error}</p>}
          <p className="ts-muted">Dữ liệu minh họa. Khi triển khai, kết quả lấy từ phần mềm quản lý xưởng.</p>
        </div>
        <div className="ts-lookup__result" aria-live="polite" data-reveal="right">
          {result ? (
            <>
              <div className="ts-lookup__head">
                <span className="ts-plate">{result.plate}</span>
                {result.soh && (
                  <span className="ts-soh">
                    <Icon name="BatteryFull" size={18} /> SoH <b>{result.soh}</b>
                  </span>
                )}
              </div>
              <ol className="ts-timeline" key={result.plate}>
                {result.rows.map((r) => (
                  <li key={r.date}>
                    <span className="ts-timeline__date">
                      {r.date} · {r.km} km
                    </span>
                    <b>{r.work}</b>
                    <small>{r.branch}</small>
                  </li>
                ))}
              </ol>
              <div className="ts-lookup__next">
                <Icon name="CalendarDays" size={18} /> Mốc tiếp theo: <b>{result.next}</b>
              </div>
            </>
          ) : (
            <div className="ts-lookup__empty">
              <Icon name="History" size={30} />
              <p>Kết quả tra cứu sẽ hiện ở đây.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Đặt lịch ---------- */
const SLOTS = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30']
const FULL = ['11:00']

export function Booking({ t, preset }) {
  const services = useMemo(() => {
    const list = t.services.map((s) => s.title)
    if (t.priceTable) list.push(...t.priceTable.columns.map((c) => `Gói ${c}`))
    if (t.packages) list.push(...t.packages.map((p) => `Gói ${p.name}`))
    return list.length ? list : ['Kiểm tra tổng quát']
  }, [t])
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }, [])

  const [v, setV] = useState({ name: '', phone: '', plate: '', car: '', service: services[0], branch: t.branches[0]?.name || '', date: tomorrow, slot: '09:30', note: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  useEffect(() => {
    if (preset && services.includes(preset)) setV((x) => ({ ...x, service: preset }))
  }, [preset, services])

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (v.name.trim().length < 2) errs.name = 'Vui lòng nhập họ tên.'
    if (!/^0\d{9}$/.test(v.phone.replace(/[\s.]/g, ''))) errs.phone = 'Số điện thoại gồm 10 số.'
    setErrors(errs)
    if (!Object.keys(errs).length) setDone(v)
  }

  const isMoto = t.category === 'xemay'
  const dateLabel = (iso) => iso.split('-').reverse().join('/')

  return (
    <section className="ts-section ts-section--soft" id="booking">
      <div className="ts-wrap ts-booking">
        <div className="ts-booking__info" data-reveal="left">
          <Head eyebrow="Đặt lịch hẹn" title="Đặt lịch trước, không phải chờ" text="Chọn dịch vụ và khung giờ. Chúng tôi gọi xác nhận trong 15 phút." />
          <ul className="ts-perks" data-stagger="left">
            <li>
              <Icon name="Timer" size={20} /> Tiếp nhận xe ngay khi tới, ưu tiên khách đặt lịch
            </li>
            <li>
              <Icon name="FileText" size={20} /> Báo giá từng hạng mục qua Zalo trước khi làm
            </li>
            <li>
              <Icon name="ShieldCheck" size={20} /> Bảo hành công thợ và phụ tùng theo phiếu
            </li>
          </ul>
          <div className="ts-booking__hot">
            <small>Hoặc gọi trực tiếp</small>
            <b>{t.brand.hotline}</b>
          </div>
        </div>

        <div className="ts-card ts-booking__card" data-reveal="right">
          {done ? (
            <div className="ts-done" role="status">
              <span className="ts-done__icon">
                <Icon name="CalendarCheck" size={28} />
              </span>
              <h3>Đã nhận lịch hẹn</h3>
              <dl>
                <div>
                  <dt>Khách hàng</dt>
                  <dd>{done.name}</dd>
                </div>
                <div>
                  <dt>Dịch vụ</dt>
                  <dd>{done.service}</dd>
                </div>
                {t.branches.length > 1 && (
                  <div>
                    <dt>Chi nhánh</dt>
                    <dd>{done.branch}</dd>
                  </div>
                )}
                <div>
                  <dt>Thời gian</dt>
                  <dd>
                    {done.slot} · {dateLabel(done.date)}
                  </dd>
                </div>
              </dl>
              <p>Nhân viên sẽ gọi số {done.phone} để xác nhận.</p>
              <button type="button" className="ts-btn ts-btn--line" onClick={() => setDone(null)}>
                Đặt lịch khác
              </button>
            </div>
          ) : (
            <form className="ts-form" onSubmit={submit} noValidate>
              <div className="ts-form__row">
                <div className="ts-field">
                  <label htmlFor="bk-name">Họ tên</label>
                  <input id="bk-name" value={v.name} onChange={set('name')} placeholder="Nguyễn Văn An" aria-invalid={!!errors.name} />
                  {errors.name && <span className="ts-error">{errors.name}</span>}
                </div>
                <div className="ts-field">
                  <label htmlFor="bk-phone">Số điện thoại</label>
                  <input id="bk-phone" value={v.phone} onChange={set('phone')} placeholder="0901 234 567" inputMode="tel" aria-invalid={!!errors.phone} />
                  {errors.phone && <span className="ts-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="ts-form__row">
                <div className="ts-field">
                  <label htmlFor="bk-plate">Biển số</label>
                  <input id="bk-plate" value={v.plate} onChange={set('plate')} placeholder={isMoto ? '29B1-234.56' : '51G-246.81'} />
                </div>
                <div className="ts-field">
                  <label htmlFor="bk-car">Dòng xe</label>
                  <input id="bk-car" value={v.car} onChange={set('car')} placeholder={isMoto ? 'Honda Vision' : 'Toyota Vios 2021'} />
                </div>
              </div>
              <div className="ts-form__row">
                <div className="ts-field">
                  <label htmlFor="bk-service">Dịch vụ</label>
                  <select id="bk-service" value={v.service} onChange={set('service')}>
                    {services.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {t.branches.length > 1 ? (
                  <div className="ts-field">
                    <label htmlFor="bk-branch">Chi nhánh</label>
                    <select id="bk-branch" value={v.branch} onChange={set('branch')}>
                      {t.branches.map((b) => (
                        <option key={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="ts-field">
                    <label htmlFor="bk-date">Ngày hẹn</label>
                    <input id="bk-date" type="date" min={tomorrow} value={v.date} onChange={set('date')} />
                  </div>
                )}
              </div>
              {t.branches.length > 1 && (
                <div className="ts-field">
                  <label htmlFor="bk-date">Ngày hẹn</label>
                  <input id="bk-date" type="date" min={tomorrow} value={v.date} onChange={set('date')} />
                </div>
              )}
              <div className="ts-field">
                <span className="ts-label" id="bk-slot-label">
                  Khung giờ
                </span>
                <div className="ts-slots" role="radiogroup" aria-labelledby="bk-slot-label">
                  {SLOTS.map((s) => {
                    const full = FULL.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={v.slot === s}
                        disabled={full}
                        className={(v.slot === s ? 'is-active' : '') + (full ? ' is-full' : '')}
                        onClick={() => setV((x) => ({ ...x, slot: s }))}
                        title={full ? 'Đã kín lịch' : undefined}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button type="submit" className="ts-btn ts-btn--p ts-btn--lg ts-btn--block">
                Xác nhận đặt lịch
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Chi nhánh + bản đồ minh họa ---------- */
const PIN_POS = [
  [30, 38],
  [62, 26],
  [70, 64],
  [40, 70],
  [18, 58],
  [84, 42],
]

export function Branches({ t, more }) {
  const [active, setActive] = useState(0)
  const single = t.branches.length === 1
  return (
    <section className="ts-section" id="branches">
      <div className="ts-wrap">
        <Head
          eyebrow={single ? 'Địa chỉ' : 'Hệ thống chi nhánh'}
          title={single ? 'Ghé xưởng của chúng tôi' : `${t.branches.length} điểm phục vụ gần bạn`}
          text={single ? undefined : 'Chọn chi nhánh để xem vị trí, giờ mở cửa và số điện thoại.'}
          more={more}
        />
        <div className="ts-branches">
          <ul className="ts-branches__list" data-stagger="left">
            {t.branches.map((b, i) => (
              <li key={b.name}>
                <button type="button" className={active === i ? 'is-active' : ''} onClick={() => setActive(i)}>
                  <span className="ts-branches__num">{i + 1}</span>
                  <span className="ts-branches__body">
                    <b>{b.name}</b>
                    <span>{b.address}</span>
                    <small>
                      <Icon name="Clock" size={13} /> {b.hours} · <Icon name="Phone" size={13} /> {b.phone}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ts-map" aria-label="Bản đồ minh họa vị trí chi nhánh" data-reveal="zoom">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect width="100" height="100" fill="#eef2ec" />
              <path d="M-5 78 C 20 70, 35 88, 55 80 S 90 60, 105 66 L105 76 C 88 72, 70 92, 52 90 S 18 82, -5 88 Z" fill="#cfe3f3" />
              <g stroke="#ffffff" strokeWidth="2.6" fill="none">
                <path d="M0 30 H100" />
                <path d="M0 55 H100" />
                <path d="M25 0 V100" />
                <path d="M58 0 V100" />
                <path d="M0 10 L100 92" />
              </g>
              <g stroke="#fbe7b2" strokeWidth="3.4" fill="none">
                <path d="M78 0 V100" />
              </g>
              <g fill="#dfe7da">
                <rect x="30" y="6" width="22" height="18" rx="1.5" />
                <rect x="62" y="34" width="12" height="16" rx="1.5" />
                <rect x="4" y="34" width="17" height="16" rx="1.5" />
                <rect x="84" y="8" width="14" height="18" rx="1.5" />
              </g>
            </svg>
            {t.branches.map((b, i) => {
              const [x, y] = PIN_POS[i % PIN_POS.length]
              return (
                <button
                  key={b.name}
                  type="button"
                  className={'ts-pin' + (active === i ? ' is-active' : '')}
                  style={{ left: `${x}%`, top: `${y}%`, '--i': i }}
                  onClick={() => setActive(i)}
                  aria-label={b.name}
                >
                  <Icon name="MapPin" size={active === i ? 34 : 26} strokeWidth={2.2} />
                </button>
              )
            })}
            <div className="ts-map__card" key={active}>
              <b>{t.branches[active].name}</b>
              <span>{t.branches[active].address}</span>
              <a className="ts-btn ts-btn--p ts-btn--sm" href={`https://www.google.com/maps/search/${encodeURIComponent(t.branches[active].address)}`} target="_blank" rel="noreferrer">
                <Icon name="Navigation" size={14} /> Chỉ đường
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Sản phẩm + giỏ hàng ---------- */
export function Products({ t, onAdd, sizeQuery, onClearSize, more }) {
  const [added, setAdded] = useState('')
  const timer = useRef(null)
  const add = (name) => {
    onAdd(name)
    setAdded(name)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(''), 1400)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  const list = sizeQuery ? t.products.filter((p) => p.name.includes(sizeQuery)) : t.products
  return (
    <section className="ts-section" id="products">
      <div className="ts-wrap">
        <div className="ts-head-row">
          <Head eyebrow="Sản phẩm" title={t.category === 'lop' ? 'Lốp & ắc quy bán chạy' : 'Phụ tùng nổi bật'} more={more} />
          {sizeQuery && (
            <div className="ts-filter-note">
              <span>
                Kích cỡ <b>{sizeQuery}</b>: {list.length} sản phẩm
              </span>
              <button type="button" onClick={onClearSize}>
                <Icon name="X" size={14} /> Bỏ lọc
              </button>
            </div>
          )}
        </div>
        {list.length ? (
          <div className="ts-products" data-stagger="up" key={sizeQuery}>
            {list.map((p) => (
              <article key={p.name} className="ts-product">
                <div className="ts-product__img">
                  <img src={p.image} alt="" loading="lazy" />
                  {p.tag && <span className="ts-product__tag">{p.tag}</span>}
                </div>
                <h3>{p.name}</h3>
                <div className="ts-product__price">
                  <b>{p.price}</b>
                  {p.oldPrice && <s>{p.oldPrice}</s>}
                </div>
                <button type="button" className={'ts-btn ts-btn--line ts-btn--block' + (added === p.name ? ' is-added' : '')} onClick={() => add(p.name)}>
                  {added === p.name ? (
                    <>
                      <Icon name="Check" size={16} strokeWidth={3} /> Đã thêm
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingCart" size={16} /> Thêm vào giỏ
                    </>
                  )}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="ts-empty">
            <p>
              Chưa có sẵn lốp {sizeQuery} trong kho online. Gọi <b>{t.brand.hotline}</b> để đặt hàng, có trong 24 giờ.
            </p>
            <button type="button" className="ts-btn ts-btn--p" onClick={onClearSize}>
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Ảnh trước / sau ---------- */
export function BeforeAfter({ t }) {
  const [pos, setPos] = useState(50)
  const [hinting, setHinting] = useState(false)
  const stop = useRef(false)
  const [ref, inView] = useInView({ threshold: 0.5 })
  const ba = t.beforeAfter

  useEffect(() => {
    if (!inView || !motionAllowed() || prefersReducedMotion()) return
    // 50 → 18 → 82 → 50 trong 2,4 giây để khách biết có thể kéo
    const keys = [50, 18, 82, 50]
    const dur = 2400
    let raf
    const t0 = performance.now()
    setHinting(true)
    const tick = (now) => {
      if (stop.current) return setHinting(false)
      const p = Math.min(1, (now - t0) / dur)
      const seg = Math.min(keys.length - 2, Math.floor(p * (keys.length - 1)))
      const local = p * (keys.length - 1) - seg
      const ease = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2
      setPos(keys[seg] + (keys[seg + 1] - keys[seg]) * ease)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setHinting(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])
  return (
    <section className="ts-section ts-section--soft" id="beforeafter">
      <div className="ts-wrap ts-ba-wrap">
        <Head eyebrow="Trước & sau" title="Kéo để thấy sự khác biệt" text={ba.label} />
        <div ref={ref} className={'ts-ba' + (hinting ? ' is-hinting' : '')} style={{ '--pos': `${pos}%` }} data-reveal="zoom">
          <img src={ba.image} alt="Sau khi xử lý" className="ts-ba__after" />
          <div className="ts-ba__before" aria-hidden="true">
            <img src={ba.image} alt="" />
          </div>
          <span className="ts-ba__label ts-ba__label--l">Trước</span>
          <span className="ts-ba__label ts-ba__label--r">Sau</span>
          <span className="ts-ba__handle" aria-hidden="true">
            <Icon name="ArrowLeft" size={14} />
            <Icon name="ArrowRight" size={14} />
          </span>
          <label htmlFor="ts-ba-range" className="ts-sr">
            Kéo để so sánh ảnh trước và sau
          </label>
          <input id="ts-ba-range" type="range" min="0" max="100" value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} onPointerDown={() => (stop.current = true)} />
        </div>
      </div>
    </section>
  )
}

/* ---------- Gói dịch vụ ---------- */
export function Packages({ t, onBook, more }) {
  return (
    <section className="ts-section" id="packages">
      <div className="ts-wrap">
        <Head eyebrow="Gói dịch vụ" title="Chọn gói phù hợp với xe của bạn" text="Giá cho xe sedan. SUV, bán tải cộng thêm 20%." center more={more} />
        <div className="ts-packages" data-stagger="up">
          {t.packages.map((p) => (
            <article key={p.name} className={'ts-package' + (p.featured ? ' is-featured' : '')}>
              {p.featured && <span className="ts-package__flag">Được chọn nhiều</span>}
              <h3>{p.name}</h3>
              <b className="ts-package__price">{p.price}</b>
              <ul>
                {p.items.map((i) => (
                  <li key={i}>
                    <Icon name="Check" size={16} strokeWidth={3} /> {i}
                  </li>
                ))}
              </ul>
              <button type="button" className={'ts-btn ts-btn--block ' + (p.featured ? 'ts-btn--p' : 'ts-btn--line')} onClick={() => onBook(`Gói ${p.name}`)}>
                Đặt lịch gói này
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Quy trình ---------- */
export function Process({ t }) {
  return (
    <section className="ts-section" id="process">
      <div className="ts-wrap">
        <Head eyebrow="Quy trình" title="Tiếp nhận xe tai nạn trong 6 bước" text="Bạn được cập nhật ảnh và tiến độ qua Zalo ở mỗi bước." />
        <ol className="ts-process" data-stagger="up">
          {t.process.map((s, i) => (
            <li key={s.title}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Đánh giá ---------- */
export function Testimonials({ t }) {
  return (
    <section className="ts-section ts-section--soft" id="testimonials">
      <div className="ts-wrap">
        <Head eyebrow="Đánh giá" title="Khách hàng nói về chúng tôi" center />
        <div className="ts-quotes" data-stagger="up">
          {t.testimonials.map((q) => (
            <figure key={q.name} className="ts-quote">
              <div className="ts-stars" aria-label="5 sao">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="Star" size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote>{q.text}</blockquote>
              <figcaption>{q.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Tin tức ---------- */
export function News({ t, more }) {
  return (
    <section className="ts-section" id="news">
      <div className="ts-wrap">
        <Head eyebrow="Tin tức" title="Mẹo chăm sóc xe" more={more} />
        <div className="ts-news" data-stagger="up">
          {t.news.map((n) => (
            <article key={n.title} className="ts-newscard">
              <img src={n.image} alt="" loading="lazy" />
              <div>
                <small>{n.date}</small>
                <h3>{n.title}</h3>
                <span className="ts-link">
                  Đọc tiếp <Icon name="ArrowRight" size={14} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
