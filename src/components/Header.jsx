import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'
import { site } from '../data/site.js'
import { useConsult } from './ConsultContext.jsx'
import { useScrolled } from './Motion.jsx'

const links = [
  { to: '/mau-website', label: 'Kho mẫu' },
  { to: '/mau-landing-page', label: 'Landing tặng kèm' },
  { to: '/#quy-trinh', label: 'Quy trình' },
  { to: '/#bang-gia', label: 'Bảng giá' },
  { to: '/#hoi-dap', label: 'Hỏi đáp' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { open: openConsult } = useConsult()
  const scrolled = useScrolled(40)

  useEffect(() => setOpen(false), [pathname, hash])

  return (
    <>
      <div className="promo-bar">
        <div className="wrap promo-bar__inner">
          <span className="promo-bar__tag">{site.promo.label}</span>
          <span className="promo-bar__text">{site.promo.text}</span>
          <Link to="/#qua-tang" className="promo-bar__link">
            Xem chi tiết <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </div>
      <header className={'site-header' + (scrolled ? ' is-scrolled' : '')}>
        <div className="wrap site-header__inner">
          <Link to="/" className="site-header__logo" aria-label={`${site.brand} – Trang chủ`}>
            <Logo />
          </Link>
          <nav className={'site-nav' + (open ? ' is-open' : '')} aria-label="Điều hướng chính">
            {links.map((l) =>
              l.to.includes('#') ? (
                <Link key={l.to} to={l.to} className="site-nav__link">
                  {l.label}
                </Link>
              ) : (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => 'site-nav__link' + (isActive ? ' is-active' : '')}>
                  {l.label}
                </NavLink>
              ),
            )}
            <button type="button" className="btn btn--signal site-nav__mobile-cta" onClick={() => openConsult()}>
              Nhận tư vấn miễn phí
            </button>
          </nav>
          <div className="site-header__actions">
            <span className="site-header__phone">
              <Icon name="Phone" size={16} />
              <span>
                <small>Hotline tư vấn</small>
                <strong>{site.hotline}</strong>
              </span>
            </span>
            <button type="button" className="btn btn--primary" onClick={() => openConsult()}>
              Nhận tư vấn
            </button>
            <button type="button" className="site-header__burger" onClick={() => setOpen((o) => !o)} aria-label="Mở menu" aria-expanded={open}>
              <Icon name={open ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
