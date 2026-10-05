import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { getPages, PageHeader, About, Contact, NewsList } from './pages.jsx'
import {
  DealerHero,
  UsedHero,
  Highlights,
  Versions,
  Rolling,
  Specs,
  Colors,
  Equipment,
  Installment,
  Offers,
  Quote,
  Faq,
  Commitments,
  Inventory,
  Valuation,
  BannerHero,
  Perks,
  Models,
  Pledge,
  Reasons,
  PriceList,
  StickyCall,
  EMPTY_FILTER,
} from './autoSections.jsx'
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

export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function TopBar({ brand, notice }) {
  return (
    <div className={'ts-topbar' + (notice ? ' ts-topbar--notice' : '')}>
      <div className="ts-wrap ts-topbar__inner">
        {notice ? (
          <span className="ts-topbar__notice">{notice}</span>
        ) : (
          <span>
            <Icon name="Clock" size={14} /> {brand.hours}
          </span>
        )}
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

function Nav({ t, cart, pages, page, to }) {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(20)
  // Menu: các trang con (trừ Trang chủ và Đặt lịch, vì Đặt lịch là nút riêng)
  // Tối đa 6 mục; nếu thừa thì bỏ Tin tức trước (vẫn có ở chân trang), luôn giữ Liên hệ
  let links = pages.filter((p) => p.slug && p.slug !== 'dat-lich' && p.slug !== 'bao-gia')
  for (const drop of ['tin-tuc', 'hoi-dap', 'gioi-thieu']) if (links.length > 6) links = links.filter((p) => p.slug !== drop)
  links = links.slice(0, 6)
  const hasBooking = t.sections.includes('booking')
  const hasQuote = t.sections.includes('quote')
  useEffect(() => setOpen(false), [page])
  return (
    <header className={'ts-nav' + (scrolled ? ' is-scrolled' : '')}>
      <div className="ts-wrap ts-nav__inner">
        <Link to={to('')} aria-label="Trang chủ">
          <BrandMark brand={t.brand} />
        </Link>
        <nav className={'ts-nav__links' + (open ? ' is-open' : '')}>
          {links.map((p) => (
            <Link key={p.slug} to={to(p.slug)} className={page === p.slug ? 'is-active' : ''} aria-current={page === p.slug ? 'page' : undefined}>
              {p.label}
            </Link>
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
            <Link to={to('dat-lich')} className="ts-btn ts-btn--p">
              <Icon name="CalendarCheck" size={16} /> Đặt lịch
            </Link>
          ) : hasQuote ? (
            <Link to={to('bao-gia')} className="ts-btn ts-btn--p">
              <Icon name="CalendarCheck" size={16} /> <span className="ts-btn__label">{t.quote.pageLabel}</span>
            </Link>
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

function Hero({ t, onSizeSearch, onQuote, filter, setFilter, onCarSearch }) {
  const h = t.hero
  if (h.variant === 'dealer') return <DealerHero t={t} onQuote={onQuote} />
  if (h.variant === 'banner') return <BannerHero t={t} onQuote={onQuote} />
  if (h.variant === 'used') return <UsedHero t={t} filter={filter} setFilter={setFilter} onSearch={onCarSearch} />
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

function Footer({ t, pages, to }) {
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
          <h4>Trang</h4>
          <ul className="ts-footer__pages">
            {pages.map((p) => (
              <li key={p.slug}>
                <Link to={to(p.slug)}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Dịch vụ</h4>
          <ul>
            {(t.services.length
              ? t.services
              : t.priceTable
                ? t.priceTable.columns.map((c) => ({ title: `Gói ${c}` }))
                : t.versions
                  ? t.versions.map((v) => ({ title: v.name }))
                  : [...new Set((t.inventory || []).map((c) => c.brand))].map((b) => ({ title: `Xe ${b} cũ` }))
            )
              .slice(0, 4)
              .map((s) => (
                <li key={s.title}>{s.title}</li>
              ))}
          </ul>
        </div>
      </div>
      {t.disclaimer && (
        <div className="ts-wrap ts-footer__note">
          <p>{t.disclaimer}</p>
          {t.credits && <p>Ảnh: Wikimedia Commons. {t.credits.join(' · ')}</p>}
        </div>
      )}
      <div className="ts-wrap ts-footer__bottom">
        <span>
          © 2026 {t.brand.name} {t.brand.suffix}. Nội dung minh họa.
        </span>
        <span>Thiết kế bởi ChungAuto</span>
      </div>
    </footer>
  )
}

export default function TemplateSite({ t, palette, embed, page = '', base = `/preview/${t.slug}`, search = '' }) {
  const navigate = useNavigate()
  const pages = useMemo(() => getPages(t), [t])
  const current = pages.find((p) => p.slug === page) || pages[0]
  const to = useCallback((slug) => (slug ? `${base}/${slug}` : base) + search, [base, search])
  const hasPage = (slug) => pages.some((p) => p.slug === slug)
  // Link "Xem trang …" dưới tiêu đề các khối ở Trang chủ
  const more = (slug) => (current.slug === '' && hasPage(slug) ? { to: to(slug), label: `Xem trang ${pages.find((p) => p.slug === slug).label}` } : null)
  const [cart, setCart] = useState(0)
  const [toast, setToast] = useState('')
  const [preset, setPreset] = useState('')
  const [sizeQuery, setSizeQuery] = useState('')
  const [carFilter, setCarFilter] = useState(EMPTY_FILTER)
  const [quotePreset, setQuotePreset] = useState(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const addToCart = useCallback((name) => {
    setCart((c) => c + 1)
    setToast(`Đã thêm “${name}” vào giỏ hàng`)
  }, [])

  // Đặt lịch theo gói: cùng trang thì cuộn tới form, khác trang thì chuyển sang trang Đặt lịch
  const bookPackage = useCallback(
    (name) => {
      setPreset(name)
      if (current.sections.includes('booking')) scrollToId('booking')
      else navigate(to('dat-lich'))
    },
    [current, navigate, to],
  )

  // Mở form báo giá ở tab cho trước (cùng trang thì cuộn tới, khác trang thì chuyển sang trang Báo giá)
  const onQuote = useCallback(
    (tab, item) => {
      setQuotePreset({ tab, item, n: Date.now() })
      if (current.sections.includes('quote')) setTimeout(() => scrollToId('quote'), 0)
      else navigate(to('bao-gia'))
    },
    [current, navigate, to],
  )
  const onCarSearch = useCallback(() => {
    if (current.sections.includes('inventory')) setTimeout(() => scrollToId('inventory'), 0)
    else navigate(to('xe-dang-ban'))
  }, [current, navigate, to])

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
        return <Services key={s} t={t} more={more('dich-vu')} />
      case 'pricetable':
        return t.sections.includes('booking') ? <PriceTable key={s} t={t} onBook={bookPackage} more={more('bang-gia')} /> : <PriceTable key={s} t={t} more={more('bang-gia')} />
      case 'lookup':
        return <Lookup key={s} t={t} />
      case 'booking':
        return <Booking key={s} t={t} preset={preset} />
      case 'branches':
        return <Branches key={s} t={t} more={more('chi-nhanh')} />
      case 'products':
        return <Products key={s} t={t} onAdd={addToCart} sizeQuery={sizeQuery} onClearSize={() => setSizeQuery('')} more={more('san-pham')} />
      case 'beforeafter':
        return <BeforeAfter key={s} t={t} />
      case 'packages':
        return <Packages key={s} t={t} onBook={bookPackage} more={more('bang-gia')} />
      case 'process':
        return <Process key={s} t={t} />
      case 'testimonials':
        return t.testimonials.length ? <Testimonials key={s} t={t} /> : null
      case 'news':
        return t.news.length ? <News key={s} t={t} more={more('tin-tuc')} /> : null
      case 'newslist':
        return <NewsList key={s} t={t} />
      case 'about':
        return <About key={s} t={t} />
      case 'contact':
        return <Contact key={s} t={t} />
      case 'highlights':
        return <Highlights key={s} t={t} />
      case 'versions':
        return <Versions key={s} t={t} onQuote={onQuote} more={more('bang-gia')} />
      case 'rolling':
        return <Rolling key={s} t={t} />
      case 'specs':
        return <Specs key={s} t={t} more={more('thong-so')} />
      case 'colors':
        return <Colors key={s} t={t} />
      case 'equipment':
        return <Equipment key={s} t={t} />
      case 'installment':
        return <Installment key={s} t={t} onQuote={onQuote} more={more('tra-gop')} />
      case 'offers':
        return <Offers key={s} t={t} onQuote={onQuote} />
      case 'quote':
        return <Quote key={s} t={t} preset={quotePreset} />
      case 'faq':
        return <Faq key={s} t={t} />
      case 'commitments':
        return <Commitments key={s} t={t} />
      case 'inventory':
        return <Inventory key={s} t={t} filter={carFilter} setFilter={setCarFilter} onQuote={onQuote} more={more('xe-dang-ban')} />
      case 'valuation':
        return <Valuation key={s} t={t} />
      case 'perks':
        return <Perks key={s} t={t} />
      case 'models':
        return <Models key={s} t={t} onQuote={onQuote} more={more('mau-xe')} />
      case 'pledge':
        return <Pledge key={s} t={t} onQuote={onQuote} />
      case 'reasons':
        return <Reasons key={s} t={t} />
      case 'pricelist':
        return <PriceList key={s} t={t} onQuote={onQuote} more={more('bang-gia')} />
      default:
        return null
    }
  }

  return (
    <div className={'ts' + (upper ? ' ts--upper' : '') + (embed ? ' ts--embed' : '') + (t.stickyBar ? ' ts--sticky' : '')} style={style}>
      <TopBar brand={t.brand} notice={t.notice} />
      <Nav t={t} cart={cart} pages={pages} page={current.slug} to={to} />
      {current.slug === '' ? <Hero t={t} onSizeSearch={onSizeSearch} onQuote={onQuote} filter={carFilter} setFilter={setCarFilter} onCarSearch={onCarSearch} /> : <PageHeader t={t} page={current} home={to('')} />}
      <main key={current.slug} className="ts-page">
        {current.sections.map(render)}
      </main>
      <CtaBand t={t} />
      <Footer t={t} pages={pages} to={to} />
      {!embed && t.stickyBar && <StickyCall t={t} onQuote={onQuote} />}
      {!embed && (
        <div className="ts-floats">
          <a className="ts-float ts-float--zalo" href={`https://zalo.me/${t.brand.hotline.replace(/\s/g, '')}`} target="_blank" rel="noreferrer" aria-label={`Nhắn Zalo ${t.brand.hotline}`}>
            Zalo
          </a>
          <a className="ts-float" href={`tel:${t.brand.hotline.replace(/\s/g, '')}`} aria-label={`Gọi ${t.brand.hotline}`}>
            <Icon name="Phone" size={22} />
          </a>
        </div>
      )}
      {toast && (
        <div className="ts-toast" role="status">
          <Icon name="Check" size={18} /> {toast}
        </div>
      )}
    </div>
  )
}
