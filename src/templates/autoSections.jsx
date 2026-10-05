import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { CountUp } from '../components/Motion.jsx'

/* Các khối giao diện cho mẫu bán xe (đại lý, showroom xe cũ). Số liệu chỉ mang tính minh họa. */

const vnd = (n) => Math.round(n).toLocaleString('vi-VN') + 'đ'
// 458 → "458 triệu", 1025 → "1,025 tỷ"
export const trieu = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} tỷ` : `${m.toLocaleString('vi-VN')} triệu`)

// Danh sách xe cho công cụ tính và form: phiên bản (1 dòng xe), các dòng xe (đại lý nhiều dòng) hoặc xe cũ
export function carOptions(t) {
  if (t.versions) return t.versions.map((v) => ({ id: v.id, name: v.name, price: v.price, seats: t.seats || 7 }))
  if (t.models) return t.models.flatMap((g) => g.items).map((m) => ({ id: m.id, name: m.name, price: m.price, seats: m.seats }))
  return t.inventory.map((c) => ({ id: c.id, name: `${c.name} ${c.year}`, price: c.price * 1e6, seats: c.seats || 5 }))
}
// Bảo hiểm trách nhiệm dân sự bắt buộc (xe không kinh doanh, đã gồm VAT)
const tnds = (seats) => (seats > 5 ? 873400 : 480700)

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

/* ---------- Hero đại lý: một dòng xe ---------- */
export function DealerHero({ t, onQuote }) {
  const h = t.hero
  const from = Math.min(...t.versions.map((v) => v.price))
  return (
    <section className="ts-hero ts-hero--dealer" id="top">
      <div className="ts-wrap ts-dealer">
        <div className="ts-hero__copy">
          <p className="ts-pill">{h.eyebrow}</p>
          <h1 className="ts-hero__title">
            {h.title}
            <span className="ts-dealer__sub">{h.subtitle}</span>
          </h1>
          <p className="ts-hero__text">{h.text}</p>
          <ul className="ts-dealer__stats">
            {h.stats.map((s) => (
              <li key={s.label}>
                <b>
                  <CountUp value={s.value} />
                </b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="ts-hero__cta">
            <button type="button" className="ts-btn ts-btn--p ts-btn--lg" onClick={() => onQuote(t.quote.tabs[0])}>
              {t.quote.tabs[0]}
            </button>
            <button type="button" className="ts-btn ts-btn--line ts-btn--lg" onClick={() => onQuote(t.quote.tabs[1])}>
              Đăng ký {t.quote.tabs[1].toLowerCase()} miễn phí
            </button>
          </div>
        </div>
        <div className="ts-dealer__media">
          <img src={h.image} alt={h.title} />
          <div className="ts-dealer__price">
            <small>Giá từ</small>
            <b>{trieu(from / 1e6)}</b>
          </div>
          {t.offers?.[0] && <div className="ts-dealer__offer">{t.offers[0]}</div>}
        </div>
      </div>
    </section>
  )
}

/* ---------- Hero showroom xe cũ: ô tìm xe ---------- */
export function UsedHero({ t, filter, setFilter, onSearch }) {
  const h = t.hero
  const brands = useMemo(() => [...new Set(t.inventory.map((c) => c.brand))].sort(), [t])
  const bodies = useMemo(() => [...new Set(t.inventory.map((c) => c.body))], [t])
  const count = filterCars(t.inventory, filter).length
  return (
    <section className="ts-hero ts-hero--used" id="top" style={{ backgroundImage: `url(${h.image})` }}>
      <div className="ts-wrap">
        <div className="ts-hero__card">
          <p className="ts-pill">{h.eyebrow}</p>
          <h1 className="ts-hero__title">{h.title}</h1>
          <p className="ts-hero__text">{h.text}</p>
          <form
            className="ts-carsearch"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch()
            }}
          >
            <label>
              <span>Hãng xe</span>
              <select id="hs-brand" value={filter.brand} onChange={(e) => setFilter((f) => ({ ...f, brand: e.target.value }))}>
                <option value="">Tất cả hãng</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Khoảng giá</span>
              <select id="hs-price" value={filter.price} onChange={(e) => setFilter((f) => ({ ...f, price: e.target.value }))}>
                {PRICE_RANGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Kiểu dáng</span>
              <select id="hs-body" value={filter.body} onChange={(e) => setFilter((f) => ({ ...f, body: e.target.value }))}>
                <option value="">Tất cả</option>
                {bodies.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="ts-btn ts-btn--p ts-btn--lg">
              <Icon name="Search" size={18} /> Tìm {count} xe
            </button>
          </form>
          <ul className="ts-used__stats">
            {h.stats.map((s) => (
              <li key={s.label}>
                <b>
                  <CountUp value={s.value} />
                </b>
                {s.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Điểm nổi bật / trang bị / cam kết: thẻ có biểu tượng ---------- */
function EmojiGrid({ items, id, eyebrow, title, text, soft }) {
  return (
    <section className={'ts-section' + (soft ? ' ts-section--soft' : '')} id={id}>
      <div className="ts-wrap">
        {title && <Head eyebrow={eyebrow} title={title} text={text} center />}
        <div className="ts-emoji-grid" data-stagger="up">
          {items.map((it) => (
            <article key={it.title} className="ts-emoji-card">
              <span className="ts-emoji" aria-hidden="true">
                {it.emoji}
              </span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
export const Highlights = ({ t }) => <EmojiGrid id="highlights" items={t.highlightsList} />
export const Equipment = ({ t }) => <EmojiGrid id="equipment" soft items={t.equipment} eyebrow="Trang bị" title="Trang bị nổi bật" text="Đầy đủ tiện nghi cho gia đình." />
export const Commitments = ({ t }) => (
  <EmojiGrid id="commitments" items={t.commitments} eyebrow="Cam kết" title="Mua xe cũ an tâm như xe mới" text="Mọi xe đều có phiếu kiểm định và hợp đồng cam kết." />
)

/* ---------- Phiên bản & giá ---------- */
export function Versions({ t, onQuote, more }) {
  return (
    <section className="ts-section ts-section--soft" id="versions">
      <div className="ts-wrap">
        <Head eyebrow="Giá bán" title="Phiên bản & giá niêm yết" text="Giá đã gồm VAT, chưa gồm chi phí lăn bánh." more={more} />
        <div className="ts-versions" data-stagger="up">
          {t.versions.map((v) => (
            <article key={v.id} className={'ts-version' + (v.hot ? ' is-hot' : '')}>
              {v.hot && <span className="ts-version__hot">🔥 Bán chạy</span>}
              <h3>{v.name}</h3>
              <b className="ts-version__price">{trieu(v.price / 1e6)}</b>
              <ul>
                {v.items.map((i) => (
                  <li key={i}>
                    <Icon name="Check" size={15} strokeWidth={3} /> {i}
                  </li>
                ))}
              </ul>
              <button type="button" className={'ts-btn ts-btn--block ' + (v.hot ? 'ts-btn--p' : 'ts-btn--line')} onClick={() => onQuote(t.quote.tabs[0], v.name)}>
                Nhận báo giá lăn bánh
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Tính giá lăn bánh ----------
   Lệ phí trước bạ và phí biển số theo tỉnh, cộng đăng kiểm, phí đường bộ 1 năm, bảo hiểm bắt buộc. */
const PROVINCES = [
  { name: 'Hà Nội', tb: 0.12, plate: 20000000 },
  { name: 'TP. Hồ Chí Minh', tb: 0.1, plate: 20000000 },
  { name: 'Hải Phòng', tb: 0.12, plate: 1000000 },
  { name: 'Đà Nẵng', tb: 0.1, plate: 1000000 },
  { name: 'Cần Thơ', tb: 0.12, plate: 1000000 },
  { name: 'Tỉnh, thành khác', tb: 0.1, plate: 1000000 },
]

export function rollingRows(car, p, support) {
  const tb = car.price * p.tb
  return [
    ['Giá niêm yết', car.price],
    [`Lệ phí trước bạ (${Math.round(p.tb * 100)}%)`, tb],
    ...(support ? [[support.label, -tb * support.rate]] : []),
    ['Phí biển số', p.plate],
    ['Phí đăng kiểm', 340000],
    ['Phí bảo trì đường bộ (1 năm)', 1560000],
    ['Bảo hiểm trách nhiệm dân sự', tnds(car.seats)],
  ]
}
export const DEFAULT_SUPPORT = { label: 'Hỗ trợ 50% lệ phí trước bạ', rate: 0.5 }

export function Rolling({ t }) {
  const cars = carOptions(t)
  const sup = t.rollingSupport || DEFAULT_SUPPORT
  const [vid, setVid] = useState((t.versions?.find((v) => v.hot) || cars[Math.min(1, cars.length - 1)]).id)
  const [pi, setPi] = useState(0)
  const [support, setSupport] = useState(true)
  const v = cars.find((x) => x.id === vid)
  const p = PROVINCES[pi]
  const rows = rollingRows(v, p, support ? sup : null)
  const total = rows.reduce((s, [, n]) => s + n, 0)
  return (
    <section className="ts-section" id="rolling">
      <div className="ts-wrap ts-calc">
        <div className="ts-calc__form" data-reveal="left">
          <Head eyebrow="Công cụ" title="Tính giá lăn bánh" text="Chọn xe và nơi đăng ký biển số để xem tổng chi phí ra biển." />
          <div className="ts-field">
            <label htmlFor="rl-ver">{t.versions ? 'Phiên bản' : 'Dòng xe'}</label>
            <select id="rl-ver" value={vid} onChange={(e) => setVid(e.target.value)}>
              {cars.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · {trieu(x.price / 1e6)}
                </option>
              ))}
            </select>
          </div>
          <div className="ts-field">
            <label htmlFor="rl-prov">Nơi đăng ký</label>
            <select id="rl-prov" value={pi} onChange={(e) => setPi(Number(e.target.value))}>
              {PROVINCES.map((x, i) => (
                <option key={x.name} value={i}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          <label className="ts-check">
            <input id="rl-support" type="checkbox" checked={support} onChange={(e) => setSupport(e.target.checked)} />
            Áp dụng ưu đãi: {sup.label.charAt(0).toLowerCase() + sup.label.slice(1)}
          </label>
        </div>
        <div className="ts-card ts-calc__result" data-reveal="right" aria-live="polite">
          <dl>
            {rows.map(([k, n]) => (
              <div key={k} className={n < 0 ? 'is-minus' : ''}>
                <dt>{k}</dt>
                <dd>{n < 0 ? '−' + vnd(-n) : vnd(n)}</dd>
              </div>
            ))}
          </dl>
          <div className="ts-calc__total">
            <span>Giá lăn bánh dự kiến tại {p.name}</span>
            <b key={total}>{vnd(total)}</b>
          </div>
          <p className="ts-muted">Số liệu tham khảo. Chi phí thực tế có thể chênh lệch theo quy định từng địa phương.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------- Tính trả góp (dư nợ giảm dần) ---------- */
export function Installment({ t, onQuote, more }) {
  const cars = carOptions(t)
  const [cid, setCid] = useState(cars[Math.min(1, cars.length - 1)].id)
  const [down, setDown] = useState(30)
  const [term, setTerm] = useState(60)
  const [rate, setRate] = useState(8.5)
  const car = cars.find((c) => c.id === cid)
  const loan = car.price * (1 - down / 100)
  const r = rate / 100 / 12
  const first = loan / term + loan * r
  const interest = (loan * r * (term + 1)) / 2
  return (
    <section className="ts-section ts-section--soft" id="installment">
      <div className="ts-wrap ts-calc">
        <div className="ts-calc__form" data-reveal="left">
          <Head eyebrow="Trả góp" title="Tính tiền trả góp hằng tháng" text="Ngân hàng hỗ trợ vay đến 80%, duyệt hồ sơ trong 24 giờ." more={more} />
          <div className="ts-field">
            <label htmlFor="ig-car">Xe</label>
            <select id="ig-car" value={cid} onChange={(e) => setCid(e.target.value)}>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {trieu(c.price / 1e6)}
                </option>
              ))}
            </select>
          </div>
          <div className="ts-field">
            <label htmlFor="ig-down">
              Trả trước: <b>{down}%</b> ({vnd(car.price * (down / 100))})
            </label>
            <input id="ig-down" type="range" min="20" max="70" step="5" value={down} onChange={(e) => setDown(Number(e.target.value))} className="ts-range" />
          </div>
          <div className="ts-form__row">
            <div className="ts-field">
              <label htmlFor="ig-term">Kỳ hạn</label>
              <select id="ig-term" value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                {[12, 24, 36, 48, 60, 72, 84, 96].map((m) => (
                  <option key={m} value={m}>
                    {m / 12} năm ({m} tháng)
                  </option>
                ))}
              </select>
            </div>
            <div className="ts-field">
              <label htmlFor="ig-rate">Lãi suất (%/năm)</label>
              <input id="ig-rate" type="number" min="4" max="16" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
            </div>
          </div>
        </div>
        <div className="ts-card ts-calc__result" data-reveal="right" aria-live="polite">
          <div className="ts-calc__big">
            <span>Trả tháng đầu (gốc + lãi)</span>
            <b key={Math.round(first)}>{vnd(first)}</b>
          </div>
          <dl>
            <div>
              <dt>Số tiền vay</dt>
              <dd>{vnd(loan)}</dd>
            </div>
            <div>
              <dt>Gốc mỗi tháng</dt>
              <dd>{vnd(loan / term)}</dd>
            </div>
            <div>
              <dt>Tổng lãi ước tính</dt>
              <dd>{vnd(interest)}</dd>
            </div>
          </dl>
          <p className="ts-muted">Tính theo dư nợ giảm dần, số tiền các tháng sau giảm dần. Lãi suất thực tế theo ngân hàng.</p>
          {onQuote && (
            <button type="button" className="ts-btn ts-btn--p ts-btn--block" onClick={() => onQuote(t.quote.tabs.find((x) => /trả góp/i.test(x)) || t.quote.tabs[0], car.name)}>
              Nhận tư vấn trả góp
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Thông số kỹ thuật ---------- */
export function Specs({ t, more }) {
  return (
    <section className="ts-section" id="specs">
      <div className="ts-wrap">
        <Head eyebrow="Thông số" title={`Thông số kỹ thuật ${t.hero.title.replace(/ \d{4}$/, '')}`} text="Theo công bố của hãng, mang tính tham khảo." more={more} />
        <div className="ts-specs" data-stagger="up">
          {t.specGroups.map((g) => (
            <div key={g.title} className="ts-spec">
              <h3>{g.title}</h3>
              <table>
                <tbody>
                  {g.rows.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Màu sắc & hình ảnh ---------- */
export function Colors({ t }) {
  const [ci, setCi] = useState(0)
  const c = t.colors[ci]
  return (
    <section className="ts-section ts-section--soft" id="colors">
      <div className="ts-wrap">
        <Head eyebrow="Hình ảnh" title="Màu sắc & hình ảnh" text="Chọn màu để xem xe." center />
        <div className="ts-colors" data-reveal="zoom">
          <div className="ts-colors__stage">
            <img key={c.image} src={c.image} alt={`${t.hero.title} màu ${c.name}`} />
            <span className="ts-colors__name">{c.name}</span>
          </div>
          <div className="ts-colors__swatches" role="radiogroup" aria-label="Chọn màu">
            {t.colors.map((x, i) => (
              <button key={x.name} type="button" role="radio" aria-checked={i === ci} aria-label={x.name} title={x.name} className={i === ci ? 'is-active' : ''} onClick={() => setCi(i)}>
                <i style={{ background: x.hex }} />
              </button>
            ))}
          </div>
        </div>
        {t.gallery?.length > 0 && (
          <div className="ts-gallery" data-stagger="up">
            {t.gallery.map((g) => (
              <figure key={g.src}>
                <img src={g.src} alt={g.caption} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Ưu đãi ---------- */
export function Offers({ t, onQuote }) {
  return (
    <section className="ts-section" id="offers">
      <div className="ts-wrap">
        <div className="ts-offers" data-reveal="up">
          <h2>🎁 Ưu đãi & chính sách tháng này</h2>
          <ul>
            {t.offers.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <button type="button" className="ts-btn ts-btn--light ts-btn--lg" onClick={() => onQuote(t.quote.tabs[t.quote.tabs.length - 1])}>
            Giữ ưu đãi ngay
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- Hỏi đáp ---------- */
export function Faq({ t }) {
  if (!t.faqs?.length) return null
  return (
    <section className="ts-section" id="faq">
      <div className="ts-wrap ts-faq">
        <Head eyebrow="Hỏi đáp" title="Câu hỏi thường gặp" />
        <div className="ts-faq__list" data-stagger="up">
          {t.faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                {f.q}
                <Icon name="ChevronDown" size={18} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Danh sách xe cũ + bộ lọc ---------- */
export const PRICE_RANGES = [
  { id: '', label: 'Mọi mức giá', min: 0, max: Infinity },
  { id: 'u400', label: 'Dưới 400 triệu', min: 0, max: 400 },
  { id: '400-600', label: '400 – 600 triệu', min: 400, max: 600 },
  { id: '600-800', label: '600 – 800 triệu', min: 600, max: 800 },
  { id: 'o800', label: 'Trên 800 triệu', min: 800, max: Infinity },
]
export const EMPTY_FILTER = { brand: '', price: '', body: '', sort: 'new' }

export function filterCars(cars, f) {
  const range = PRICE_RANGES.find((p) => p.id === f.price) || PRICE_RANGES[0]
  const list = cars.filter((c) => (!f.brand || c.brand === f.brand) && (!f.body || c.body === f.body) && c.price >= range.min && c.price < range.max)
  const sorters = {
    new: (a, b) => b.year - a.year || a.km - b.km,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    km: (a, b) => a.km - b.km,
  }
  return [...list].sort(sorters[f.sort] || sorters.new)
}

export function Inventory({ t, filter, setFilter, onQuote, more }) {
  const brands = useMemo(() => [...new Set(t.inventory.map((c) => c.brand))].sort(), [t])
  const bodies = useMemo(() => [...new Set(t.inventory.map((c) => c.body))], [t])
  const all = filterCars(t.inventory, filter)
  // Trang chủ chỉ hiện 6 xe (2 hàng), trang Xe đang bán hiện đủ
  const list = more ? all.slice(0, 6) : all
  const set = (k) => (e) => setFilter((f) => ({ ...f, [k]: e.target.value }))
  const active = filter.brand || filter.price || filter.body
  const tel = `tel:${t.brand.hotline.replace(/\s/g, '')}`
  return (
    <section className="ts-section" id="inventory">
      <div className="ts-wrap">
        <Head eyebrow="Xe đang bán" title={`${t.inventory.length} xe sẵn tại showroom`} text="Giá công khai, xem xe và lái thử miễn phí." more={more} />
        <div className="ts-filterbar" data-reveal="up">
          <select id="iv-brand" aria-label="Hãng xe" value={filter.brand} onChange={set('brand')}>
            <option value="">Tất cả hãng</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select id="iv-price" aria-label="Khoảng giá" value={filter.price} onChange={set('price')}>
            {PRICE_RANGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select id="iv-body" aria-label="Kiểu dáng" value={filter.body} onChange={set('body')}>
            <option value="">Mọi kiểu dáng</option>
            {bodies.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select id="iv-sort" aria-label="Sắp xếp" value={filter.sort} onChange={set('sort')}>
            <option value="new">Đời mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="km">Ít km nhất</option>
          </select>
          <span className="ts-filterbar__count">
            <b key={all.length}>{all.length}</b> xe
          </span>
          {active && (
            <button type="button" className="ts-filterbar__clear" onClick={() => setFilter({ ...EMPTY_FILTER, sort: filter.sort })}>
              <Icon name="X" size={14} /> Bỏ lọc
            </button>
          )}
        </div>
        {list.length ? (
          <div className="ts-cars" data-stagger="up" key={[filter.brand, filter.price, filter.body, filter.sort].join('|')}>
            {list.map((c) => (
              <article key={c.id} className="ts-car">
                <div className="ts-car__img">
                  <img src={c.image} alt={`${c.name} ${c.year}`} loading="lazy" />
                  {c.tag && <span className="ts-car__tag">{c.tag}</span>}
                  <span className="ts-car__check">
                    <Icon name="ShieldCheck" size={13} /> Đã kiểm định
                  </span>
                </div>
                <div className="ts-car__body">
                  <h3>
                    {c.name} <span>{c.year}</span>
                  </h3>
                  <ul className="ts-car__facts">
                    <li>
                      <Icon name="Gauge" size={14} /> {c.km.toLocaleString('vi-VN')} km
                    </li>
                    <li>
                      <Icon name="Settings" size={14} /> {c.gear}
                    </li>
                    <li>
                      <Icon name="Droplet" size={14} /> {c.fuel}
                    </li>
                    <li>
                      <Icon name="MapPin" size={14} /> {c.city}
                    </li>
                  </ul>
                  <div className="ts-car__foot">
                    <b className="ts-car__price">{trieu(c.price)}</b>
                    <div className="ts-car__actions">
                      <a href={tel} className="ts-btn ts-btn--line ts-btn--sm" aria-label={`Gọi hỏi xe ${c.name}`}>
                        <Icon name="Phone" size={14} />
                      </a>
                      <button type="button" className="ts-btn ts-btn--p ts-btn--sm" onClick={() => onQuote(t.quote.tabs[0], `${c.name} ${c.year}`)}>
                        Đặt lịch xem
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {more && all.length > list.length && (
          <div className="ts-more-wrap">
            <Link to={more.to} className="ts-btn ts-btn--line ts-btn--lg">
              Xem tất cả {all.length} xe <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        )}
        {list.length ? null : (
          <div className="ts-empty">
            <p>Chưa có xe phù hợp bộ lọc. Để lại số điện thoại, chúng tôi báo ngay khi có xe đúng nhu cầu.</p>
            <button type="button" className="ts-btn ts-btn--p" onClick={() => setFilter({ ...EMPTY_FILTER })}>
              Xem tất cả xe
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Định giá thu mua xe cũ ----------
   Ước tính đơn giản: giá xe mới tham khảo theo hãng, khấu hao theo tuổi xe và số km. */
const NEW_PRICE = { Toyota: 720, Honda: 760, Mazda: 740, Kia: 620, Hyundai: 640, Ford: 820, Mitsubishi: 620, VinFast: 520, Khác: 600 }

export function Valuation() {
  const years = Array.from({ length: 11 }, (_, i) => 2025 - i)
  const [v, setV] = useState({ brand: 'Toyota', model: '', year: 2021, km: 45000, cond: 'good' })
  const [res, setRes] = useState(null)
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const calc = (e) => {
    e.preventDefault()
    const age = Math.max(0, 2026 - Number(v.year))
    const km = Math.max(0, Number(v.km) || 0)
    let p = NEW_PRICE[v.brand] * Math.pow(0.88, age)
    const extraKm = Math.max(0, km - age * 15000)
    p *= 1 - Math.min(0.15, (extraKm / 10000) * 0.01)
    if (v.cond === 'fair') p *= 0.92
    setRes({ low: Math.round(p * 0.95), high: Math.round(p * 1.03) })
  }
  return (
    <section className="ts-section ts-section--soft" id="valuation">
      <div className="ts-wrap ts-calc">
        <div data-reveal="left">
          <Head eyebrow="Thu mua xe cũ" title="Định giá xe của bạn trong 30 giây" text="Đổi xe cũ lấy xe khác tại showroom, bù trừ trực tiếp vào giá xe mới." />
          <ul className="ts-perks">
            <li>
              <Icon name="BadgeCheck" size={20} /> Thu mua tận nơi, thanh toán ngay trong ngày
            </li>
            <li>
              <Icon name="FileText" size={20} /> Hỗ trợ rút hồ sơ, sang tên trọn gói
            </li>
            <li>
              <Icon name="RefreshCcw" size={20} /> Đổi xe cũ lấy xe khác, bù trừ trực tiếp
            </li>
          </ul>
        </div>
        <div className="ts-card ts-calc__result" data-reveal="right">
          <form className="ts-form" onSubmit={calc}>
            <div className="ts-form__row">
              <div className="ts-field">
                <label htmlFor="vl-brand">Hãng xe</label>
                <select id="vl-brand" value={v.brand} onChange={set('brand')}>
                  {Object.keys(NEW_PRICE).map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="ts-field">
                <label htmlFor="vl-model">Dòng xe</label>
                <input id="vl-model" value={v.model} onChange={set('model')} placeholder="Vios, CR-V, CX-5…" />
              </div>
            </div>
            <div className="ts-form__row">
              <div className="ts-field">
                <label htmlFor="vl-year">Năm sản xuất</label>
                <select id="vl-year" value={v.year} onChange={set('year')}>
                  {years.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="ts-field">
                <label htmlFor="vl-km">Số km đã đi</label>
                <input id="vl-km" type="number" min="0" step="1000" value={v.km} onChange={set('km')} />
              </div>
            </div>
            <div className="ts-field">
              <span className="ts-label">Tình trạng</span>
              <div className="ts-seg" role="radiogroup" aria-label="Tình trạng xe">
                {[
                  ['good', 'Tốt, không lỗi'],
                  ['fair', 'Có trầy xước nhẹ'],
                ].map(([id, label]) => (
                  <button key={id} type="button" role="radio" aria-checked={v.cond === id} className={v.cond === id ? 'is-active' : ''} onClick={() => setV((x) => ({ ...x, cond: id }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="ts-btn ts-btn--p ts-btn--lg ts-btn--block">
              Định giá ngay
            </button>
          </form>
          {res && (
            <div className="ts-valuation" role="status">
              <span>
                Giá thu mua dự kiến {v.brand} {v.model} {v.year}
              </span>
              <b>
                {trieu(res.low)} – {trieu(res.high)}
              </b>
              <small>Ước tính tham khảo. Giá chốt sau khi kiểm tra xe trực tiếp.</small>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Form nhiều tab: báo giá, lái thử, trả góp, đặt cọc / xem xe, định giá ---------- */
export function Quote({ t, preset }) {
  const tabs = t.quote.tabs
  const items = carOptions(t).map((c) => c.name)
  const [tab, setTab] = useState(tabs[0])
  const [v, setV] = useState({ name: '', phone: '', item: items[0], extra: '' })
  const [err, setErr] = useState({})
  const [done, setDone] = useState(null)

  useEffect(() => {
    if (!preset) return
    if (preset.tab && tabs.includes(preset.tab)) setTab(preset.tab)
    if (preset.item && items.includes(preset.item)) setV((x) => ({ ...x, item: preset.item }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (v.name.trim().length < 2) errs.name = 'Vui lòng nhập họ tên.'
    if (!/^0\d{9}$/.test(v.phone.replace(/[\s.]/g, ''))) errs.phone = 'Số điện thoại gồm 10 số.'
    setErr(errs)
    if (!Object.keys(errs).length) setDone({ ...v, tab })
  }
  // Ô thứ 3 thay đổi theo tab
  const extra = /lăn bánh|trả thẳng/i.test(tab)
    ? { label: 'Nơi đăng ký biển số', options: PROVINCES.map((p) => p.name) }
    : /lái thử/i.test(tab)
      ? { label: 'Lái thử ở đâu', options: ['Tại showroom', 'Tại nhà (nội thành)'] }
      : /trả góp/i.test(tab)
        ? { label: 'Muốn trả trước', options: ['20%', '30%', '40%', '50% trở lên'] }
        : /cọc/i.test(tab)
          ? { label: 'Hình thức cọc', options: ['Chuyển khoản 10 triệu', 'Đặt cọc tại showroom'] }
          : /định giá/i.test(tab)
            ? { label: 'Xe đang đi', options: ['Sedan', 'SUV / Crossover', 'MPV 7 chỗ', 'Bán tải', 'Hatchback'] }
            : { label: 'Showroom', options: t.branches.map((b) => b.name) }

  return (
    <section className="ts-section ts-section--soft" id="quote">
      <div className="ts-wrap ts-quote">
        <Head eyebrow="📩 Gửi thông tin, nhận ưu đãi" title={t.quote.pageLabel === 'Nhận báo giá' ? 'Nhận báo giá & đăng ký lái thử' : t.quote.pageLabel} text="Tư vấn viên liên hệ lại trong 5 phút. Thông tin chỉ dùng để tư vấn." center />
        <div className="ts-card ts-quote__card" data-reveal="up">
          <div className="ts-tabs" role="tablist" aria-label="Loại yêu cầu">
            {tabs.map((x) => (
              <button
                key={x}
                type="button"
                role="tab"
                aria-selected={tab === x}
                className={tab === x ? 'is-active' : ''}
                onClick={() => {
                  setTab(x)
                  setDone(null)
                }}
              >
                {x}
              </button>
            ))}
          </div>
          {done ? (
            <div className="ts-done" role="status">
              <span className="ts-done__icon">
                <Icon name="Check" size={28} />
              </span>
              <h3>Đã nhận yêu cầu “{done.tab}”</h3>
              <p>
                Cảm ơn {done.name}. Tư vấn viên sẽ gọi số {done.phone} trong 5 phút về <b>{done.item}</b>.
              </p>
              <button type="button" className="ts-btn ts-btn--line" onClick={() => setDone(null)}>
                Gửi yêu cầu khác
              </button>
            </div>
          ) : (
            <form className="ts-form" onSubmit={submit} noValidate key={tab}>
              <div className="ts-form__row">
                <div className="ts-field">
                  <label htmlFor="qt-name">Họ tên</label>
                  <input id="qt-name" value={v.name} onChange={set('name')} placeholder="Nguyễn Văn An" aria-invalid={!!err.name} />
                  {err.name && <span className="ts-error">{err.name}</span>}
                </div>
                <div className="ts-field">
                  <label htmlFor="qt-phone">Số điện thoại</label>
                  <input id="qt-phone" value={v.phone} onChange={set('phone')} placeholder="0901 234 567" inputMode="tel" aria-invalid={!!err.phone} />
                  {err.phone && <span className="ts-error">{err.phone}</span>}
                </div>
              </div>
              <div className="ts-form__row">
                {!/định giá/i.test(tab) && (
                  <div className="ts-field">
                    <label htmlFor="qt-item">{t.versions ? 'Phiên bản' : t.models ? 'Dòng xe' : 'Xe quan tâm'}</label>
                    <select id="qt-item" value={v.item} onChange={set('item')}>
                      {items.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="ts-field">
                  <label htmlFor="qt-extra">{extra.label}</label>
                  <select id="qt-extra" value={v.extra || extra.options[0]} onChange={set('extra')}>
                    {extra.options.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="ts-btn ts-btn--p ts-btn--lg ts-btn--block">
                📩 Gửi thông tin: {tab}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   Đại lý nhiều dòng xe (kiểu đại lý 3S)
   ========================================================= */

/* Banner khuyến mãi tự chạy, có nút chuyển và chấm chỉ vị trí */
export function BannerHero({ t, onQuote }) {
  const slides = t.hero.slides
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || slides.length < 2 || new URLSearchParams(window.location.search).get('embed') === '1') return
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [paused, slides.length])
  const s = slides[i]
  const go = (d) => setI((x) => (x + d + slides.length) % slides.length)
  return (
    <section className="ts-hero ts-hero--banner" id="top" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="ts-wrap">
        <div className="ts-banner" aria-roledescription="carousel" aria-label="Chương trình khuyến mãi">
          <div className="ts-banner__slide" key={i} aria-live="polite">
            <div className="ts-banner__copy">
              <p className="ts-pill">{s.eyebrow}</p>
              <h1 className="ts-hero__title">{s.title}</h1>
              <p className="ts-hero__text">{s.text}</p>
              <div className="ts-hero__cta">
                <button type="button" className="ts-btn ts-btn--p ts-btn--lg" onClick={() => onQuote(t.quote.tabs[0])}>
                  Nhận báo giá ưu đãi
                </button>
                <a href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} className="ts-btn ts-btn--line ts-btn--lg">
                  <Icon name="Phone" size={16} /> {t.brand.hotline}
                </a>
              </div>
            </div>
            <div className="ts-banner__media">
              <img src={s.image} alt={s.alt || ''} />
            </div>
          </div>
          {slides.length > 1 && (
            <>
              <button type="button" className="ts-banner__nav ts-banner__nav--prev" onClick={() => go(-1)} aria-label="Chương trình trước">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <button type="button" className="ts-banner__nav ts-banner__nav--next" onClick={() => go(1)} aria-label="Chương trình sau">
                <Icon name="ArrowRight" size={18} />
              </button>
              <div className="ts-banner__dots" role="tablist" aria-label="Chọn chương trình">
                {slides.map((x, k) => (
                  <button key={x.title} type="button" role="tab" aria-selected={k === i} aria-label={x.title} className={k === i ? 'is-active' : ''} onClick={() => setI(k)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/* 3 dòng ưu đãi ngắn ngay dưới banner */
export function Perks({ t }) {
  return (
    <section className="ts-perkbar" id="perks">
      <div className="ts-wrap">
        <ul data-stagger="up">
          {t.perks.map((p) => (
            <li key={p}>
              <span>
                <Icon name="Check" size={15} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* Lưới các dòng xe, chia nhóm bằng tab */
export function Models({ t, onQuote, more }) {
  const [g, setG] = useState(0)
  const group = t.models[g]
  const tel = `tel:${t.brand.hotline.replace(/\s/g, '')}`
  return (
    <section className="ts-section" id="models">
      <div className="ts-wrap">
        <Head eyebrow="Sản phẩm" title={`Các dòng xe ${t.brand.name}`} text="Giá niêm yết tham khảo, gọi ngay để có giá tốt nhất trong tháng." center more={more} />
        {t.models.length > 1 && (
          <div className="ts-tabs ts-tabs--center" role="tablist" aria-label="Nhóm xe">
            {t.models.map((x, k) => (
              <button key={x.name} type="button" role="tab" aria-selected={k === g} className={k === g ? 'is-active' : ''} onClick={() => setG(k)}>
                {x.name} ({x.items.length})
              </button>
            ))}
          </div>
        )}
        <div className="ts-models" data-stagger="up" key={g}>
          {group.items.map((m) => (
            <article key={m.id} className="ts-model">
              <div className="ts-model__img">
                <img src={m.image} alt={m.name} loading="lazy" />
                {m.tag && <span className="ts-car__tag">{m.tag}</span>}
              </div>
              <div className="ts-model__body">
                <h3>{m.name}</h3>
                <p className="ts-model__meta">{m.meta}</p>
                <p className="ts-model__price">
                  Giá từ: <b>{vnd(m.price)}</b>
                </p>
                <div className="ts-model__actions">
                  <button type="button" className="ts-btn ts-btn--p" onClick={() => onQuote(t.quote.tabs[0], m.name)}>
                    Nhận ưu đãi
                  </button>
                  <a href={tel} className="ts-btn ts-btn--line">
                    <Icon name="Phone" size={15} /> Gọi chốt giá
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Khối cam kết giá + hotline lớn */
export function Pledge({ t, onQuote }) {
  return (
    <section className="ts-section ts-section--soft" id="pledge">
      <div className="ts-wrap">
        <div className="ts-pledge" data-reveal="up">
          <div>
            <h2>{t.pledge.title}</h2>
            <ul>
              {t.pledge.items.map((x) => (
                <li key={x}>
                  <Icon name="BadgeCheck" size={18} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="ts-pledge__call">
            <small>Gọi ngay để có giá tốt nhất (24/7)</small>
            <a href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} className="ts-pledge__hot">
              <Icon name="Phone" size={24} /> {t.brand.hotline}
            </a>
            <button type="button" className="ts-btn ts-btn--a ts-btn--lg ts-btn--block" onClick={() => onQuote(t.quote.tabs[0])}>
              Nhận báo giá lăn bánh
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export const Reasons = ({ t }) => <EmojiGrid id="reasons" items={t.reasons} eyebrow="Vì sao chọn chúng tôi" title="Mua xe tại đại lý, yên tâm từ lúc chọn đến khi lăn bánh" />

/* Bảng giá tất cả dòng xe, kèm giá lăn bánh tạm tính tại Hà Nội */
export function PriceList({ t, onQuote, more }) {
  const sup = t.rollingSupport || DEFAULT_SUPPORT
  const hn = PROVINCES[0]
  return (
    <section className="ts-section" id="pricelist">
      <div className="ts-wrap">
        <Head eyebrow="Bảng giá" title={`Bảng giá xe ${t.brand.name} tháng này`} text={`Giá lăn bánh tạm tính tại ${hn.name}, đã áp dụng ưu đãi: ${sup.label.toLowerCase()}.`} more={more} />
        <div className="ts-table-wrap" data-reveal="up">
          <table className="ts-table ts-pricelist">
            <thead>
              <tr>
                <th scope="col">Dòng xe</th>
                <th scope="col">Phân khúc</th>
                <th scope="col">Giá niêm yết</th>
                <th scope="col">Lăn bánh tạm tính</th>
                <th scope="col">
                  <span className="ts-sr">Báo giá</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {t.models.flatMap((g) => g.items).map((m) => {
                const total = rollingRows({ price: m.price, seats: m.seats }, hn, sup).reduce((a, [, n]) => a + n, 0)
                return (
                  <tr key={m.id}>
                    <th scope="row">{m.name}</th>
                    <td>{m.meta}</td>
                    <td className="ts-num">{vnd(m.price)}</td>
                    <td className="ts-num">
                      <b>{vnd(total)}</b>
                    </td>
                    <td>
                      <button type="button" className="ts-btn ts-btn--line ts-btn--sm" onClick={() => onQuote(t.quote.tabs[0], m.name)}>
                        Báo giá
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* Thanh "Hotline / Nhận giá ưu đãi" nổi góc dưới (thói quen trang đại lý Việt Nam) */
export function StickyCall({ t, onQuote }) {
  return (
    <div className="ts-stickycall">
      <a href={`tel:${t.brand.hotline.replace(/\s/g, '')}`}>
        <Icon name="Phone" size={16} /> Hotline: {t.brand.hotline}
      </a>
      <button type="button" onClick={() => onQuote(t.quote.tabs[0])}>
        <Icon name="Gift" size={16} /> Nhận giá ưu đãi
      </button>
    </div>
  )
}
