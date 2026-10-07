// Trang quản trị ChungAuto (/admin): đăng nhập thật qua API, dữ liệu lưu trong PostgreSQL trên máy chủ.
// Dùng lại bộ giao diện của trang quản trị demo (src/admin) – cùng CSS, bảng danh sách, biểu mẫu.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ExternalLink, KeyRound, LayoutDashboard, LogOut, Menu, Search, Settings as SettingsIcon, X } from 'lucide-react'
import { AdminProvider, useAdmin, useCollection } from '../admin/store.jsx'
import { ConfirmHost } from '../admin/ui.jsx'
import { matchText } from '../admin/schemas.jsx'
import { fmtDate, isoDay } from '../admin/lib.js'
import { NotifyBell, unseenByModule, useSeen } from '../admin/notify.jsx'
import Resource from '../admin/pages/Resource.jsx'
import { api, createApiStore } from './api.js'
import { CA_MODULES, getCaSchema } from './schemas.jsx'
import CaDashboard from './Dashboard.jsx'
import CaSettings from './Settings.jsx'
import Account from './Account.jsx'
import '../admin/admin.css'

const BASE = '/admin'
const ACCENT = '#ea212b'

export default function CaAdminApp() {
  const [auth, setAuth] = useState({ status: 'loading' })
  const check = useCallback(() => {
    setAuth({ status: 'loading' })
    api('GET', '/api/auth/me')
      .then((d) => setAuth({ status: 'in', user: d.user, perms: d.perms }))
      .catch((e) => setAuth({ status: e.status === 401 ? 'out' : 'error', message: e.message }))
  }, [])
  useEffect(check, [check])
  useEffect(() => {
    const out = () => setAuth((a) => (a.status === 'in' ? { status: 'out', expired: true } : a))
    window.addEventListener('ca-admin:unauthorized', out)
    return () => window.removeEventListener('ca-admin:unauthorized', out)
  }, [])
  useEffect(() => {
    document.documentElement.classList.remove('intro-pre', 'intro-hold')
  }, [])

  return (
    <div className="adm" style={{ '--adm-accent': ACCENT, '--adm-accent-ink': '#fff', '--adm-accent-text': '#c4121b' }}>
      <Routes>
        <Route path="dang-nhap" element={auth.status === 'in' ? <Navigate to={BASE} replace /> : <Login auth={auth} onIn={(d) => setAuth({ status: 'in', user: d.user, perms: d.perms })} />} />
        <Route
          path="*"
          element={
            auth.status === 'loading' ? (
              <div className="adm-loading">Đang tải trang quản trị…</div>
            ) : auth.status === 'error' ? (
              <ApiDown message={auth.message} retry={check} />
            ) : auth.status === 'out' ? (
              <ToLogin expired={auth.expired} />
            ) : (
              <Signed auth={auth} onOut={() => setAuth({ status: 'out' })} />
            )
          }
        />
      </Routes>
      <ConfirmHost />
    </div>
  )
}

function ToLogin({ expired }) {
  const loc = useLocation()
  return <Navigate to={`${BASE}/dang-nhap`} replace state={{ from: loc.pathname + loc.search, expired }} />
}

function ApiDown({ message, retry }) {
  return (
    <div className="adm-index">
      <header>
        <h1>Chưa kết nối được máy chủ</h1>
        <p>{message} Trang quản trị cần backend (Node.js + PostgreSQL) chạy cùng website – xem hướng dẫn DEPLOY.md.</p>
        <p>
          <button type="button" className="adm-btn adm-btn--primary" onClick={retry}>
            Thử lại
          </button>{' '}
          <Link to="/" className="adm-btn">
            Về trang chủ
          </Link>
        </p>
      </header>
    </div>
  )
}

// ---------- Đăng nhập ----------
function Login({ onIn }) {
  const navigate = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    document.title = 'Đăng nhập · Quản trị ChungAuto'
  }, [])
  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Email chưa đúng định dạng'
    if (!password) errs.password = 'Nhập mật khẩu'
    setErr(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const d = await api('POST', '/api/auth/login', { email: email.trim(), password })
      const me = await api('GET', '/api/auth/me')
      onIn({ ...d, perms: me.perms })
      navigate(loc.state?.from && loc.state.from !== `${BASE}/dang-nhap` ? loc.state.from : BASE, { replace: true })
    } catch (ex) {
      setErr({ form: ex.message, ...(ex.fields || {}) })
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="adm-login">
      <div className="adm-login__brand">
        <img src="/brand/logo-mobile.png" alt="ChungAuto" width="227" height="65" className="adm-login__logo" />
        <h1>Quản trị ChungAuto</h1>
        <p>Quản lý yêu cầu tư vấn, khách hàng, hợp đồng triển khai, thu tiền, Kho mẫu và nội dung website.</p>
        <ul>
          <li>Phân quyền theo vai trò: quản trị, quản lý, kinh doanh, biên tập</li>
          <li>Mọi thao tác được ghi nhật ký</li>
          <li>Dữ liệu lưu trên máy chủ, sao lưu được</li>
        </ul>
      </div>
      <form className="adm-login__form" onSubmit={submit} noValidate>
        <h2>Đăng nhập</h2>
        {loc.state?.expired && <p className="adm-note">Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.</p>}
        {err.form && (
          <p className="adm-login__err" role="alert">
            {err.form}
          </p>
        )}
        <div className="adm-field">
          <label htmlFor="lg-email">Email</label>
          <input id="lg-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err.email} />
          {err.email && <small className="adm-field__err">{err.email}</small>}
        </div>
        <div className="adm-field">
          <label htmlFor="lg-pass">Mật khẩu</label>
          <input id="lg-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!err.password} />
          {err.password && <small className="adm-field__err">{err.password}</small>}
        </div>
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <p className="adm-muted adm-login__hint">Quên mật khẩu? Liên hệ quản trị viên để được đặt lại.</p>
        <Link to="/" className="adm-linkbtn">
          ← Về website
        </Link>
      </form>
    </div>
  )
}

// ---------- Đã đăng nhập ----------
function Signed({ auth, onOut }) {
  const store = useMemo(() => createApiStore(), [])
  const site = useMemo(
    () => ({ key: 'chungauto', slug: 'chungauto', name: 'ChungAuto', fullName: 'ChungAuto', profile: 'chungauto', accent: ACCENT, siteUrl: '/', basePath: BASE, modules: [], flags: {}, me: auth.user, perms: auth.perms }),
    [auth],
  )
  return (
    <AdminProvider site={site} store={store}>
      <Shell auth={auth} onOut={onOut} />
    </AdminProvider>
  )
}

const allowed = (m, perms) => !m.perm || (perms[m.perm] || '').includes('r')

function Shell({ auth, onOut }) {
  const { site, store } = useAdmin()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  useCollection('staff')
  useEffect(() => setNavOpen(false), [location.pathname])
  const mods = CA_MODULES.filter((m) => allowed(m, auth.perms))
  const items = notifications(store, auth.perms)
  const [seen, mark] = useSeen(loadSeen, saveSeen)
  const counts = unseenByModule(items, seen)
  // mở chi tiết một bản ghi (?open=…) → thông báo của bản ghi đó coi như đã xem
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('open')
    const m = CA_MODULES.find((x) => x.slug && location.pathname === `${BASE}/${x.slug}`)
    if (id && m) mark(items.filter((i) => i.module === m.id && String(i.id) === id).map((i) => i.key))
  })
  let group = null
  return (
    <div className={`adm-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="adm-side" aria-label="Chức năng">
        <div className="adm-side__brand ca-brand">
          <Link to={BASE} className="ca-brand__logo" aria-label="ChungAuto – Tổng quan">
            <img src="/brand/logo-vector.svg" alt="ChungAuto" width="133" height="38" />
          </Link>
          <span className="ca-brand__tag">Quản trị</span>
          <button type="button" className="adm-iconbtn adm-side__close" onClick={() => setNavOpen(false)} aria-label="Đóng menu">
            <X size={20} />
          </button>
        </div>
        <nav className="adm-side__nav">
          {mods.map((m) => {
            const meta = moduleMeta(m, site, store)
            const head = m.group !== group ? (group = m.group) : null
            return (
              <div key={m.id}>
                {head && <p className="adm-side__group">{head}</p>}
                <NavLink
                  to={`${BASE}/${m.slug}`}
                  end={!m.slug}
                  className={({ isActive }) => `adm-side__link ${isActive ? 'is-active' : ''}`}
                  // mở chức năng → các thông báo của chức năng đó coi như đã xem
                  onClick={() => counts[m.id] && mark(items.filter((i) => i.module === m.id).map((i) => i.key))}
                >
                  <meta.icon size={18} />
                  <span>{meta.label}</span>
                  {!!counts[m.id] && <em>{counts[m.id] > 99 ? '99+' : counts[m.id]}</em>}
                </NavLink>
              </div>
            )
          })}
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Xem website
          </a>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />
      <div className="adm-main">
        <Topbar auth={auth} onMenu={() => setNavOpen(true)} onOut={onOut} notify={{ items, seen, mark }} />
        <main className="adm-content">
          <Routes>
            <Route index element={<Titled label="Tổng quan"><CaDashboard /></Titled>} />
            <Route path=":slug" element={<ModuleRoute perms={auth.perms} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function moduleMeta(m, site, store) {
  if (m.id === 'dashboard') return { label: 'Tổng quan', icon: LayoutDashboard }
  if (m.id === 'settings') return { label: m.label, icon: SettingsIcon }
  if (m.id === 'account') return { label: m.label, icon: KeyRound }
  const s = getCaSchema(m.id, { site, store, read: (c) => store.read(c), perms: site.perms, me: site.me })
  return { label: s.label, icon: s.icon }
}

function Titled({ label, children }) {
  useEffect(() => {
    document.title = `${label} · Quản trị ChungAuto`
  }, [label])
  return children
}

function ModuleRoute({ perms }) {
  const { slug } = useParams()
  const { site, store } = useAdmin()
  const m = CA_MODULES.find((x) => x.slug === slug)
  const ctx = useMemo(() => ({ site, store, read: (c) => store.read(c), perms: site.perms, me: site.me }), [site, store])
  if (!m) return <Navigate to={BASE} replace />
  if (!allowed(m, perms))
    return (
      <div className="adm-empty">
        <p className="adm-empty__title">Không có quyền truy cập</p>
        <p>Tài khoản của bạn không được xem chức năng này.</p>
      </div>
    )
  if (m.id === 'settings') return <Titled label="Cài đặt website"><CaSettings canEdit={(perms.settings || '').includes('w')} /></Titled>
  if (m.id === 'account') return <Titled label="Đổi mật khẩu"><Account /></Titled>
  const schema = getCaSchema(m.id, ctx)
  return (
    <Titled label={schema.label} key={m.id}>
      <Resource key={m.id} schema={schema} />
    </Titled>
  )
}

// Việc cần xử lý → thông báo + huy hiệu thanh bên. Mã theo đúng sự việc: đổi ngày hẹn / hạn bàn giao thì thành thông báo mới
function notifications(store, perms) {
  const has = (p) => (perms[p] || '').includes('r')
  const today = isoDay()
  const out = []
  if (has('leads'))
    for (const l of store.read('leads')) {
      const base = { module: 'leads', id: l.id, path: `yeu-cau?open=${l.id}` }
      if (l.status === 'Mới') out.push({ ...base, key: `leads:${l.id}:new`, title: `Yêu cầu tư vấn mới: ${l.name}`, sub: [l.phone, l.interest].filter(Boolean).join(' · '), time: l.createdAt })
      else if (l.nextFollow && l.nextFollow <= today && !['Chốt hợp đồng', 'Thất bại'].includes(l.status))
        out.push({ ...base, key: `leads:${l.id}:follow:${l.nextFollow}`, title: `Cần gọi lại: ${l.name}`, sub: `Hẹn ${fmtDate(l.nextFollow)} · ${l.phone}`, time: l.nextFollow })
    }
  if (has('orders'))
    for (const o of store.read('orders'))
      if (o.dueDate && o.dueDate < today && !['Hoàn tất', 'Đã huỷ'].includes(o.status))
        out.push({ module: 'orders', id: o.id, path: `hop-dong?open=${o.id}`, key: `orders:${o.id}:due:${o.dueDate}`, title: `Hợp đồng ${o.code} quá hạn bàn giao`, sub: `${o.customerName} · hạn ${fmtDate(o.dueDate)}`, time: o.dueDate })
  return out
}
// trạng thái "đã xem" lưu trên máy chủ theo từng tài khoản (xem ở máy này thì máy khác cũng hết báo)
const loadSeen = () => api('GET', '/api/admin/notifications/seen').then((d) => d.keys)
const saveSeen = (keys) => api('POST', '/api/admin/notifications/seen', { keys })

function Topbar({ auth, onMenu, onOut, notify }) {
  const { site, store, toast } = useAdmin()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const ref = useRef(null)
  const inputRef = useRef(null)
  useEffect(() => {
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(null)
    const onKey = (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) (e.preventDefault(), inputRef.current?.focus())
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => (document.removeEventListener('mousedown', onDoc), window.removeEventListener('keydown', onKey))
  }, [])
  const ctx = { site, store, read: (c) => store.read(c), perms: auth.perms, me: auth.user }
  const results = []
  if (q.trim().length >= 2)
    for (const [id, slug] of [['leads', 'yeu-cau'], ['customers', 'khach-hang'], ['orders', 'hop-dong'], ['payments', 'thu-tien']]) {
      if (!(auth.perms[id] || '').includes('r')) continue
      const s = getCaSchema(id, ctx)
      store
        .read(id)
        .filter((r) => matchText(r, s.search, q.trim()))
        .slice(0, 4)
        .forEach((r) => results.push({ slug, label: s.label, r }))
    }
  const go = (path) => (setOpen(null), setQ(''), navigate(`${BASE}/${path}`))
  async function logout() {
    try {
      await api('POST', '/api/auth/logout')
    } catch {
      /* phiên đã hết: vẫn thoát */
    }
    onOut()
    toast('Đã đăng xuất')
  }
  return (
    <header className="adm-top ca-top" ref={ref}>
      <button type="button" className="adm-iconbtn adm-top__menu" onClick={onMenu} aria-label="Mở menu">
        <Menu size={20} />
      </button>
      <div className="adm-top__search">
        <Search size={16} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => (setQ(e.target.value), setOpen('search'))}
          onFocus={() => setOpen('search')}
          placeholder="Tìm khách, số điện thoại, mã hợp đồng…  ( / )"
          aria-label="Tìm kiếm toàn bộ"
          onKeyDown={(e) => e.key === 'Enter' && results[0] && go(`${results[0].slug}?open=${results[0].r.id}`)}
        />
        {open === 'search' && q.trim().length >= 2 && (
          <div className="adm-pop adm-pop--search">
            {results.length ? (
              results.slice(0, 12).map(({ slug, label, r }) => (
                <button key={slug + r.id} type="button" onClick={() => go(`${slug}?open=${r.id}`)}>
                  <em>{label}</em>
                  <b>{r.code}</b>
                  <span>{r.name || r.customerName}</span>
                  <small>{r.phone || r.customerPhone || r.status}</small>
                </button>
              ))
            ) : (
              <p className="adm-muted">Không tìm thấy "{q}"</p>
            )}
          </div>
        )}
      </div>
      <div className="ca-top__actions">
        <a className="ca-top__site" href="/" target="_blank" rel="noreferrer" title="Mở website trong tab mới">
          <ExternalLink size={16} />
          <span>Xem website</span>
        </a>
        <NotifyBell {...notify} go={go} open={open === 'bell'} onToggle={() => setOpen(open === 'bell' ? null : 'bell')} />
        <span className="ca-top__sep" aria-hidden="true" />
        <div className="adm-top__pop">
          <button type="button" className="ca-user" onClick={() => setOpen(open === 'user' ? null : 'user')} aria-expanded={open === 'user'} aria-label={`Tài khoản ${auth.user.name}`}>
            <span className="adm-avatar">{avatarOf(auth.user.name)}</span>
            <span className="ca-user__text">
              <b>{auth.user.name}</b>
              <small>{auth.user.roleLabel}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {open === 'user' && (
            <div className="adm-pop adm-pop--right">
              <p className="adm-pop__title">
                {auth.user.name}
                <small>
                  {auth.user.email} · {auth.user.roleLabel}
                </small>
              </p>
              <button type="button" onClick={() => go('doi-mat-khau')}>
                <KeyRound size={16} /> Đổi mật khẩu
              </button>
              <button type="button" onClick={logout}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// chữ trên ảnh đại diện: chữ đầu của tên gọi (từ cuối), bỏ chức danh – "Quản trị ChungAuto" → C, "Nguyễn Văn An" → A
function avatarOf(name) {
  const words = String(name || '?').split(/\s+/).filter((w) => w && !/^(quản|trị|nhân|viên|kinh|doanh|biên|tập)$/i.test(w))
  return (words[words.length - 1] || name || '?')[0].toUpperCase()
}
