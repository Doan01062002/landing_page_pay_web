import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { CountUp, useScrolled } from '../components/Motion.jsx'
import { AutoVideo, VideoCard, Lightbox, useCountdown } from './media.jsx'
import '../styles/lp.css'

const vnd = (n) => (n === 0 ? '0đ' : n.toLocaleString('vi-VN') + 'đ')
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const tel = (s) => `tel:${s.replace(/\s/g, '')}`

function textOn(hex) {
  const n = parseInt(hex.slice(1), 16)
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return 1.05 / (L + 0.05) >= 4.5 ? '#ffffff' : '#111418'
}

/* ---------- Đầu trang ---------- */
function Top({ lp }) {
  const scrolled = useScrolled(24)
  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }
  return (
    <header className={'lp-top' + (scrolled ? ' is-scrolled' : '')}>
      <div className="lp-wrap lp-top__inner">
        <a href="#top" onClick={go('top')} className="lp-mark">
          {lp.brand.name}
          <i />
        </a>
        <nav className="lp-top__nav" aria-label="Mục lục">
          <a href="#uu-dai" onClick={go('uu-dai')}>Ưu đãi</a>
          <a href="#video" onClick={go('video')}>Video</a>
          <a href="#xuong" onClick={go('xuong')}>Xưởng</a>
          <a href="#dang-ky" onClick={go('dang-ky')}>Đăng ký</a>
        </nav>
        <a href={tel(lp.brand.hotline)} className="lp-btn lp-btn--line lp-btn--sm">
          <Icon name="Phone" size={15} /> <span>{lp.brand.hotline}</span>
        </a>
      </div>
    </header>
  )
}

/* ---------- Hero ---------- */
function Title({ lines }) {
  return (
    <h1 className="lp-title">
      {lines.map((l, i) => (
        <span key={i} className="lp-title__line" style={{ '--l': i }}>
          <span>{l}</span>
        </span>
      ))}
    </h1>
  )
}

function HeroCopy({ lp, onWatch }) {
  const { hero, offer } = lp
  return (
    <div className="lp-hero__copy">
      <p className="lp-pill">
        <i className="lp-pill__dot" /> {hero.eyebrow}
      </p>
      <Title lines={hero.title} />
      <p className="lp-lead">{hero.text}</p>
      <div className="lp-hero__cta">
        <a href="#dang-ky" className="lp-btn lp-btn--a lp-btn--lg" onClick={(e) => (e.preventDefault(), scrollToId('dang-ky'))}>
          {hero.cta} <Icon name="ArrowRight" size={18} />
        </a>
        <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={onWatch}>
          <span className="lp-playdot">
            <Icon name="Play" size={12} />
          </span>
          Xem video
        </button>
      </div>
      <p className="lp-hero__price">
        <b>{vnd(offer.price)}</b>
        <s>{vnd(offer.oldPrice)}</s>
        <span>{offer.label}</span>
      </p>
    </div>
  )
}

function Hero({ lp, embed, onWatch }) {
  const { hero } = lp
  if (lp.variant === 'center') {
    return (
      <section className="lp-hero lp-hero--center" id="top">
        <div className="lp-wrap">
          <HeroCopy lp={lp} onWatch={onWatch} />
          <div className="lp-hero__wide">
            <AutoVideo video={hero.video} embed={embed} />
            <ul className="lp-hero__chips">
              {lp.benefits.slice(0, 3).map((b) => (
                <li key={b}>
                  <Icon name="Check" size={14} strokeWidth={3} /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    )
  }
  if (lp.variant === 'overlay') {
    return (
      <section className="lp-hero lp-hero--overlay" id="top">
        <div className="lp-hero__bg">
          <AutoVideo video={hero.video} embed={embed} />
        </div>
        <div className="lp-wrap lp-hero__over">
          <div className="lp-hero__card">
            <HeroCopy lp={lp} onWatch={onWatch} />
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="lp-hero lp-hero--split" id="top">
      <div className="lp-wrap lp-hero__grid">
        <HeroCopy lp={lp} onWatch={onWatch} />
        <div className="lp-hero__frame">
          <AutoVideo video={hero.video} embed={embed} />
          <span className="lp-hero__tag">
            <Icon name="ShieldCheck" size={16} /> {lp.benefits[0]}
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------- Dải lợi ích chạy ngang ---------- */
function Marquee({ items }) {
  const row = (
    <span className="lp-marquee__row" aria-hidden="true">
      {items.map((b) => (
        <span key={b}>
          {b}
          <i />
        </span>
      ))}
    </span>
  )
  return (
    <div className="lp-marquee" aria-label={items.join(', ')}>
      <div className="lp-marquee__track">
        {row}
        {row}
      </div>
    </div>
  )
}

/* ---------- Ưu đãi ---------- */
function Offer({ lp }) {
  const { offer } = lp
  const [d, h, m, s] = useCountdown(offer.deadline)
  const left = offer.slots - offer.taken
  const pct = Math.round((offer.taken / offer.slots) * 100)
  const save = offer.oldPrice - offer.price
  return (
    <section className="lp-section" id="uu-dai">
      <div className="lp-wrap">
        <div className="lp-offer" data-reveal="up">
          <div className="lp-offer__price">
            <p className="lp-label">{offer.label}</p>
            <div className="lp-offer__nums">
              <b>{vnd(offer.price)}</b>
              <s>{vnd(offer.oldPrice)}</s>
            </div>
            <span className="lp-save">Tiết kiệm {vnd(save)}</span>
            <p className="lp-muted">{offer.note}</p>
          </div>
          <div className="lp-offer__time">
            <p className="lp-label">Ưu đãi kết thúc sau</p>
            <div className="lp-count" aria-label={`Còn ${d} ngày ${h} giờ`}>
              {[
                [d, 'ngày'],
                [h, 'giờ'],
                [m, 'phút'],
                [s, 'giây'],
              ].map(([val, label], i) => (
                <span key={label}>
                  <b key={i === 3 ? val : 'x'} className={i === 3 ? 'is-tick' : undefined}>
                    {String(val).padStart(2, '0')}
                  </b>
                  <small>{label}</small>
                </span>
              ))}
            </div>
            <div className="lp-slots">
              <div className="lp-slots__bar">
                <i style={{ '--w': `${pct}%` }} />
              </div>
              <p>
                Đã đăng ký{' '}
                <b>
                  <CountUp value={offer.taken} />
                </b>
                /{offer.slots} · còn <b className="lp-accent">{left} suất</b>
              </p>
            </div>
            <a href="#dang-ky" className="lp-btn lp-btn--a lp-btn--block" onClick={(e) => (e.preventDefault(), scrollToId('dang-ky'))}>
              {lp.hero.cta}
            </a>
          </div>
        </div>

        <div className="lp-included" data-stagger="up">
          {lp.included.map((it) => (
            <article key={it.title}>
              <span className="lp-included__icon">
                <Icon name={it.icon} size={20} />
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

/* ---------- Video ---------- */
function Videos({ lp, embed, onOpen }) {
  return (
    <section className="lp-section lp-section--soft" id="video">
      <div className="lp-wrap">
        <div className="lp-head" data-reveal="up">
          <p className="lp-label">Video tại xưởng · {lp.videos.length} video</p>
          <h2>Xem tận mắt cách chúng tôi làm</h2>
        </div>
        <div className="lp-videos" data-stagger="up">
          {lp.videos.map((v, i) => (
            <VideoCard key={v.id} video={v} embed={embed} featured={i === 0} onOpen={() => onOpen(i)} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Ảnh xưởng ---------- */
function Photos({ lp, onOpen }) {
  return (
    <section className="lp-section" id="xuong">
      <div className="lp-wrap">
        <div className="lp-head lp-head--row" data-reveal="up">
          <div>
            <p className="lp-label">Hình ảnh xưởng</p>
            <h2>Không gian làm việc</h2>
          </div>
          <p className="lp-muted">
            <Icon name="MapPin" size={15} /> {lp.brand.address}
          </p>
        </div>
        <div className="lp-photos" data-stagger="zoom">
          {lp.photos.map((p, i) => (
            <button type="button" key={p.src} className={'lp-photo' + (p.size ? ` lp-photo--${p.size}` : '')} onClick={() => onOpen(i)} aria-label={`Xem ảnh: ${p.caption}`}>
              <img src={p.src} alt={p.caption} loading="lazy" />
              <span>{p.caption}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Các bước + đánh giá ---------- */
function Steps({ lp }) {
  return (
    <section className="lp-section lp-section--soft">
      <div className="lp-wrap lp-steps-wrap">
        <div className="lp-head" data-reveal="up">
          <p className="lp-label">Nhận ưu đãi trong 3 bước</p>
          <h2>Đơn giản, không ràng buộc</h2>
        </div>
        <ol className="lp-steps" data-stagger="up">
          {lp.steps.map((s, i) => (
            <li key={s.title}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="lp-reviews" data-stagger="up">
          {lp.reviews.map((r) => (
            <figure key={r.name}>
              <div className="lp-stars" aria-label="5 sao">
                {[0, 1, 2, 3, 4].map((k) => (
                  <Icon key={k} name="Star" size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote>“{r.text}”</blockquote>
              <figcaption>
                {r.name} · <span>{r.car}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Đăng ký ---------- */
function Register({ lp }) {
  const { offer, form } = lp
  const [v, setV] = useState({ name: '', phone: '', car: '', option: form.options[0] })
  const [err, setErr] = useState({})
  const [state, setState] = useState('idle')
  const code = useMemo(() => `${lp.brand.name.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, [lp.brand.name])
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (v.name.trim().length < 2) errs.name = 'Nhập họ tên của bạn.'
    if (!/^0\d{9}$/.test(v.phone.replace(/[\s.]/g, ''))) errs.phone = 'Số điện thoại gồm 10 số.'
    setErr(errs)
    if (Object.keys(errs).length) return
    setState('sending')
    setTimeout(() => setState('done'), 800)
  }

  return (
    <section className="lp-section lp-register" id="dang-ky">
      <div className="lp-wrap lp-register__grid">
        <div className="lp-register__info" data-reveal="left">
          <p className="lp-label">Đăng ký giữ suất</p>
          <h2>
            {offer.label}
            <br />
            <span className="lp-accent">{vnd(offer.price)}</span> <s>{vnd(offer.oldPrice)}</s>
          </h2>
          <ul className="lp-checks">
            {lp.included.map((it) => (
              <li key={it.title}>
                <Icon name="Check" size={16} strokeWidth={3} /> {it.title}
              </li>
            ))}
          </ul>
          <dl className="lp-contact">
            <div>
              <dt>Địa chỉ</dt>
              <dd>{lp.brand.address}</dd>
            </div>
            <div>
              <dt>Giờ mở cửa</dt>
              <dd>{lp.brand.hours}</dd>
            </div>
            <div>
              <dt>Hotline</dt>
              <dd>
                <a href={tel(lp.brand.hotline)}>{lp.brand.hotline}</a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="lp-formcard" data-reveal="right">
          {state === 'done' ? (
            <div className="lp-done" role="status">
              <span className="lp-done__icon">
                <Icon name="Check" size={28} strokeWidth={3} />
              </span>
              <h3>Đã giữ suất cho {v.name}</h3>
              <p>Mã ưu đãi của bạn</p>
              <b className="lp-code">{code}</b>
              <p className="lp-muted">
                Chúng tôi sẽ gọi số {v.phone} trong 15 phút để xác nhận. Đưa mã này khi đến xưởng.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="lp-field">
                <input id="lp-name" value={v.name} onChange={set('name')} placeholder=" " aria-invalid={!!err.name} autoComplete="name" />
                <label htmlFor="lp-name">Họ và tên</label>
                {err.name && <span className="lp-err">{err.name}</span>}
              </div>
              <div className="lp-field">
                <input id="lp-phone" value={v.phone} onChange={set('phone')} placeholder=" " inputMode="tel" aria-invalid={!!err.phone} autoComplete="tel" />
                <label htmlFor="lp-phone">Số điện thoại</label>
                {err.phone && <span className="lp-err">{err.phone}</span>}
              </div>
              <div className="lp-field">
                <input id="lp-car" value={v.car} onChange={set('car')} placeholder=" " />
                <label htmlFor="lp-car">Dòng xe ({form.carPlaceholder.replace('Ví dụ: ', 'vd: ')})</label>
              </div>
              <div className="lp-field lp-field--select">
                <select id="lp-option" value={v.option} onChange={set('option')}>
                  {form.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <label htmlFor="lp-option">{form.optionsLabel || 'Loại xe'}</label>
              </div>
              <button type="submit" className={'lp-btn lp-btn--a lp-btn--lg lp-btn--block' + (state === 'sending' ? ' is-loading' : '')} disabled={state === 'sending'}>
                {state === 'sending' ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Đang gửi…
                  </>
                ) : (
                  <>
                    {lp.hero.cta} <Icon name="ArrowRight" size={18} />
                  </>
                )}
              </button>
              <p className="lp-muted lp-formcard__note">
                <Icon name="ShieldCheck" size={14} /> Còn {offer.slots - offer.taken} suất. Không thu phí giữ chỗ.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Chân trang + thanh đăng ký dính đáy trên điện thoại ---------- */
function Footer({ lp }) {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer__inner">
        <span className="lp-mark">
          {lp.brand.name}
          <i />
        </span>
        <span>{lp.brand.address}</span>
        <a href={`https://www.google.com/maps/search/${encodeURIComponent(lp.brand.address)}`} target="_blank" rel="noreferrer">
          <Icon name="Navigation" size={14} /> Chỉ đường
        </a>
        <small>Landing page tặng kèm bởi ChungAuto · Nội dung minh họa</small>
      </div>
    </footer>
  )
}

function StickyBar({ lp }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const reg = document.getElementById('dang-ky')?.getBoundingClientRect()
      const nearForm = reg && reg.top < window.innerHeight && reg.bottom > 0
      setShow(window.scrollY > 500 && !nearForm)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={'lp-sticky' + (show ? ' is-shown' : '')} aria-hidden={!show}>
      <span>
        <b>{vnd(lp.offer.price)}</b>
        <s>{vnd(lp.offer.oldPrice)}</s>
      </span>
      <a href="#dang-ky" className="lp-btn lp-btn--a" tabIndex={show ? 0 : -1} onClick={(e) => (e.preventDefault(), scrollToId('dang-ky'))}>
        {lp.hero.cta}
      </a>
    </div>
  )
}

export default function LandingSite({ lp, embed }) {
  const [box, setBox] = useState(null) // { kind: 'video' | 'photo', index }
  const videoItems = useMemo(() => lp.videos.map((v) => ({ type: 'video', src: v.src, poster: v.poster, title: v.title, caption: v.caption })), [lp])
  const photoItems = useMemo(() => lp.photos.map((p) => ({ type: 'image', src: p.src, title: p.caption })), [lp])
  const items = box?.kind === 'photo' ? photoItems : videoItems
  const heroIndex = Math.max(0, lp.videos.findIndex((v) => v.id === lp.hero.video.id))

  const style = {
    '--a': lp.accent,
    '--a-ink': textOn(lp.accent),
    '--fd': lp.fonts.display,
    '--fb': lp.fonts.body,
  }

  return (
    <div className={`lp lp--${lp.variant}` + (embed ? ' lp--embed' : '')} style={style}>
      <Top lp={lp} />
      <Hero lp={lp} embed={embed} onWatch={() => setBox({ kind: 'video', index: heroIndex })} />
      <Marquee items={lp.benefits} />
      <Offer lp={lp} />
      <Videos lp={lp} embed={embed} onOpen={(i) => setBox({ kind: 'video', index: i })} />
      <Photos lp={lp} onOpen={(i) => setBox({ kind: 'photo', index: i })} />
      <Steps lp={lp} />
      <Register lp={lp} />
      <Footer lp={lp} />
      {!embed && <StickyBar lp={lp} />}
      {box && <Lightbox items={items} index={box.index} scopeStyle={style} onClose={() => setBox(null)} onIndex={(i) => setBox((b) => ({ ...b, index: i }))} />}
    </div>
  )
}
