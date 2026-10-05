import { useCallback, useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { CountUp, useScrolled } from '../components/Motion.jsx'
import {
  Services,
  PriceTable,
  Lookup,
  Booking,
  Branches,
  Products,
  BeforeAfter,
  Packages,
  Process,
  Testimonials,
  News,
} from './sections.jsx'
import '../styles/template.css'

// Chọn màu chữ (tối / trắng) đủ tương phản trên một nền màu.
function textOn(hex) {
  const n = parseInt(hex.slice(1), 16)
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return (1.05 / (L + 0.05)) >= 4.5 ? '#ffffff' : '#141a24'
}

const navLabels = {
  services: 'Dịch vụ',
  pricetable: 'Bảng giá',
  products: 'Sản phẩm',
  packages: 'Gói dịch vụ',
  beforeafter: 'Trước & sau',
  lookup: 'Tra cứu',
  process: 'Quy trình',
  branches: 'Chi nhánh',
  news: 'Tin tức',
}

export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function TopBar({ brand }) {
  return (
    <div className="ts-topbar">
      <div className="ts-wrap ts-topbar__inner">
        <span>
          <Icon name="Clock" size={14} /> {brand.hours}
        </span>
        <span className="ts-topbar__addr">
          <Icon name="MapPin" size={14} /> {brand.address}
        </span>
        <span className="ts-topbar__hot">
          <Icon name="Phone" size={14} /> Hotline <b>{brand.hotline}</b>
        </span>
      </div>
    </div>
  )
}

function BrandMark({ brand }) {
  return (
    <span className="ts-brand">
      <span className="ts-brand__icon">
        <Icon name={brand.icon} size={20} strokeWidth={2.4} />
      </span>
      <span className="ts-brand__name">
        {brand.name}
        {brand.suffix && <em> {brand.suffix}</em>}
      </span>
    </span>
  )
}

function Nav({ t, cart }) {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(20)
  const links = t.sections.filter((s) => navLabels[s]).slice(0, 5)
  const hasBooking = t.sections.includes('booking')
  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }
  return (
    <header className={'ts-nav' + (scrolled ? ' is-scrolled' : '')}>
      <div className="ts-wrap ts-nav__inner">
        <a href="#top" onClick={go('top')} aria-label="Về đầu trang">
          <BrandMark brand={t.brand} />
        </a>
        <nav className={'ts-nav__links' + (open ? ' is-open' : '')}>
          {links.map((s) => (
            <a key={s} href={`#${s}`} onClick={go(s)}>
              {navLabels[s]}
            </a>
          ))}
        </nav>
        <div className="ts-nav__actions">
          {t.products && (
            <span key={cart} className={'ts-cart' + (cart ? ' is-bump' : '')} aria-label={`Giỏ hàng: ${cart} sản phẩm`}>
              <Icon name="ShoppingCart" size={20} />
              {cart > 0 && <b>{cart}</b>}
            </span>
          )}
          {hasBooking ? (
            <a href="#booking" onClick={go('booking')} className="ts-btn ts-btn--p">
              <Icon name="CalendarCheck" size={16} /> Đặt lịch
            </a>
          ) : (
            <a href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} className="ts-btn ts-btn--p">
              <Icon name="Phone" size={16} /> <span className="ts-btn__label">{t.brand.hotline}</span>
            </a>
          )}
          <button type="button" className="ts-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'X' : 'Menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroStats({ stats }) {
  if (!stats?.length) return null
  return (
    <ul className="ts-hero__stats">
      {stats.map((s) => (
        <li key={s.label}>
          <b>
            <CountUp value={s.value} />
          </b>
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  )
}

function HeroButtons({ t }) {
  const primaryTarget = t.sections.includes('booking') ? 'booking' : t.sections[0]
  const secondary = t.sections.find((s) => ['pricetable', 'products', 'services', 'packages'].includes(s))
  return (
    <div className="ts-hero__cta">
      <a href={`#${primaryTarget}`} className="ts-btn ts-btn--p ts-btn--lg" onClick={(e) => (e.preventDefault(), scrollToId(primaryTarget))}>
        {primaryTarget === 'booking' ? 'Đặt lịch ngay' : 'Xem ngay'}
      </a>
      {secondary && (
        <a href={`#${secondary}`} className="ts-btn ts-btn--line ts-btn--lg" onClick={(e) => (e.preventDefault(), scrollToId(secondary))}>
          {secondary === 'pricetable' ? 'Xem bảng giá' : secondary === 'products' ? 'Xem sản phẩm' : 'Xem dịch vụ'}
        </a>
      )}
    </div>
  )
}

function Hero({ t, onSizeSearch }) {
  const h = t.hero
  if (h.variant === 'overlay') {
    return (
      <section className="ts-hero ts-hero--overlay" id="top" style={{ backgroundImage: `url(${h.image})` }}>
        <div className="ts-wrap">
          <div className="ts-hero__card">
            <p className="ts-eyebrow">{h.eyebrow}</p>
            <h1 className="ts-hero__title">{h.title}</h1>
            <p className="ts-hero__text">{h.text}</p>
            <HeroButtons t={t} />
            <HeroStats stats={h.stats} />
          </div>
        </div>
      </section>
    )
  }
  if (h.variant === 'search') return <HeroSearch t={t} onSearch={onSizeSearch} />
  if (h.variant === 'shop') {
    return (
      <section className="ts-hero ts-hero--shop" id="top">
        <div className="ts-wrap ts-shop">
          <aside className="ts-shop__cats">
            <b>
              <Icon name="Menu" size={18} /> Danh mục sản phẩm
            </b>
            {t.shopCategories.map((c) => (
              <a key={c} href="#products" onClick={(e) => (e.preventDefault(), scrollToId('products'))}>
                {c}
                <Icon name="ArrowRight" size={14} />
              </a>
            ))}
          </aside>
          <div className="ts-shop__banner" style={{ backgroundImage: `url(${h.image})` }}>
            <div>
              <p className="ts-eyebrow">{h.eyebrow}</p>
              <h1 className="ts-hero__title">{h.title}</h1>
              <p className="ts-hero__text">{h.text}</p>
              <a href="#products" className="ts-btn ts-btn--a ts-btn--lg" onClick={(e) => (e.preventDefault(), scrollToId('products'))}>
                Mua ngay
              </a>
            </div>
          </div>
          <div className="ts-shop__side">
            <div className="ts-shop__promo">
              <span>Mã giảm giá</span>
              <b>GARA10</b>
              <small>Giảm 10% đơn đầu cho tài khoản gara</small>
            </div>
            <div className="ts-shop__promo ts-shop__promo--alt">
              <Icon name="Truck" size={22} />
              <b>Giao 2 giờ</b>
              <small>Nội thành TP. HCM, đơn từ 500.000đ</small>
            </div>
          </div>
        </div>
      </section>
    )
  }
  // split (mặc định)
  return (
    <section className="ts-hero ts-hero--split" id="top">
      <div className="ts-wrap ts-hero__grid">
        <div className="ts-hero__copy">
          <p className="ts-eyebrow">{h.eyebrow}</p>
          <h1 className="ts-hero__title">{h.title}</h1>
          <p className="ts-hero__text">{h.text}</p>
          <HeroButtons t={t} />
          <HeroStats stats={h.stats} />
        </div>
        <div className="ts-hero__media">
          <img src={h.image} alt="" />
          <div className="ts-hero__badge">
            <Icon name="ShieldCheck" size={22} />
            <span>
              <b>Báo giá trước khi làm</b>
              <small>Không phát sinh chi phí</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroSearch({ t, onSearch }) {
  const [w, setW] = useState('205')
  const [r, setR] = useState('55')
  const [d, setD] = useState('16')
  const h = t.hero
  return (
    <section className="ts-hero ts-hero--search" id="top" style={{ backgroundImage: `url(${h.image})` }}>
      <div className="ts-wrap">
        <div className="ts-hero__card">
          <p className="ts-eyebrow">{h.eyebrow}</p>
          <h1 className="ts-hero__title">{h.title}</h1>
          <p className="ts-hero__text">{h.text}</p>
          <form
            className="ts-size"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch(`${w}/${r}R${d}`)
            }}
          >
            <label>
              <span>Chiều rộng</span>
              <select id="ts-size-w" value={w} onChange={(e) => setW(e.target.value)}>
                {['185', '195', '205', '215', '225'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Tỉ lệ</span>
              <select id="ts-size-r" value={r} onChange={(e) => setR(e.target.value)}>
                {['55', '60', '65'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Vành (inch)</span>
              <select id="ts-size-d" value={d} onChange={(e) => setD(e.target.value)}>
                {['15', '16', '17'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="ts-btn ts-btn--p ts-btn--lg">
              <Icon name="Search" size={18} /> Tìm lốp
            </button>
          </form>
          <p className="ts-size__hint">
            Ví dụ: lốp ghi <b>205/55R16</b> nghĩa là rộng 205 mm, tỉ lệ thành lốp 55%, vành 16 inch.
          </p>
        </div>
      </div>
    </section>
  )
}

function CtaBand({ t }) {
  return (
    <section className="ts-cta">
      <div className="ts-wrap ts-cta__inner">
        <div>
          <h2>Cần tư vấn ngay?</h2>
          <p>Gọi hotline, kỹ thuật viên trả lời trong giờ làm việc: {t.brand.hours}.</p>
        </div>
        <a href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} className="ts-btn ts-btn--light ts-btn--lg">
          <Icon name="Phone" size={18} /> {t.brand.hotline}
        </a>
      </div>
    </section>
  )
}

function Footer({ t }) {
  return (
    <footer className="ts-footer">
      <div className="ts-wrap ts-footer__grid">
        <div className="ts-footer__brand">
          <BrandMark brand={t.brand} />
          <p>{t.tagline}</p>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <ul>
            <li>
              <Icon name="Phone" size={15} /> {t.brand.hotline}
            </li>
            <li>
              <Icon name="MapPin" size={15} /> {t.brand.address}
            </li>
            <li>
              <Icon name="Clock" size={15} /> {t.brand.hours}
            </li>
          </ul>
        </div>
        <div>
          <h4>Dịch vụ</h4>
          <ul>
            {(t.services.length ? t.services : t.priceTable?.columns.map((c) => ({ title: `Gói ${c}` })) || []).slice(0, 4).map((s) => (
              <li key={s.title}>{s.title}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ts-wrap ts-footer__bottom">
        <span>
          © 2026 {t.brand.name} {t.brand.suffix}. Nội dung minh họa.
        </span>
        <span>Thiết kế bởi ChungAuto</span>
      </div>
    </footer>
  )
}

export default function TemplateSite({ t, palette, embed }) {
  const [cart, setCart] = useState(0)
  const [toast, setToast] = useState('')
  const [preset, setPreset] = useState('')
  const [sizeQuery, setSizeQuery] = useState('')

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const addToCart = useCallback((name) => {
    setCart((c) => c + 1)
    setToast(`Đã thêm “${name}” vào giỏ hàng`)
  }, [])

  const bookPackage = useCallback((name) => {
    setPreset(name)
    scrollToId('booking')
  }, [])

  const onSizeSearch = useCallback((q) => {
    setSizeQuery(q)
    setTimeout(() => scrollToId('products'), 0)
  }, [])

  const upper = /Condensed|Oswald|Anton/.test(t.fonts.display)
  const style = {
    '--p': palette.p,
    '--a': palette.a,
    '--p-ink': textOn(palette.p),
    '--a-ink': textOn(palette.a),
    '--fd': t.fonts.display,
    '--fb': t.fonts.body,
  }

  const render = (s) => {
    switch (s) {
      case 'services':
        return <Services key={s} t={t} />
      case 'pricetable':
        return t.sections.includes('booking') ? <PriceTable key={s} t={t} onBook={bookPackage} /> : <PriceTable key={s} t={t} />
      case 'lookup':
        return <Lookup key={s} t={t} />
      case 'booking':
        return <Booking key={s} t={t} preset={preset} />
      case 'branches':
        return <Branches key={s} t={t} />
      case 'products':
        return <Products key={s} t={t} onAdd={addToCart} sizeQuery={sizeQuery} onClearSize={() => setSizeQuery('')} />
      case 'beforeafter':
        return <BeforeAfter key={s} t={t} />
      case 'packages':
        return <Packages key={s} t={t} onBook={bookPackage} />
      case 'process':
        return <Process key={s} t={t} />
      case 'testimonials':
        return t.testimonials.length ? <Testimonials key={s} t={t} /> : null
      case 'news':
        return t.news.length ? <News key={s} t={t} /> : null
      default:
        return null
    }
  }

  return (
    <div className={'ts' + (upper ? ' ts--upper' : '') + (embed ? ' ts--embed' : '')} style={style}>
      <TopBar brand={t.brand} />
      <Nav t={t} cart={cart} />
      <Hero t={t} onSizeSearch={onSizeSearch} />
      {t.sections.map(render)}
      <CtaBand t={t} />
      <Footer t={t} />
      {!embed && (
        <a className="ts-float" href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} aria-label={`Gọi ${t.brand.hotline}`}>
          <Icon name="Phone" size={22} />
        </a>
      )}
      {toast && (
        <div className="ts-toast" role="status">
          <Icon name="Check" size={18} /> {toast}
        </div>
      )}
    </div>
  )
}
