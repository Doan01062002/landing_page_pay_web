// Trang quản trị demo cho từng mẫu trong Kho mẫu: /quan-tri (danh sách) và /quan-tri/<key>/… (chưa có backend:
// dữ liệu lưu trong trình duyệt). Tải riêng (lazy) nên không làm nặng website chính.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, LogOut, Menu, Search, X } from 'lucide-react'
import { allAdminSites, getAdminSite, PROFILE_LABEL } from './config.js'
import { AdminProvider, authKey, isAuthed, useAdmin, useCollection } from './store.jsx'
import { ConfirmHost } from './ui.jsx'
import { getSchema, matchText, SEARCHABLE } from './schemas.jsx'
import { moduleMeta } from './modules.js'
import { initials, isoDay } from './lib.js'
import { localSeen, NotifyBell, unseenByModule, useSeen } from './notify.jsx'
import Thumb from '../components/Thumb.jsx'
import Resource from './pages/Resource.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reports from './pages/Reports.jsx'
import Content from './pages/Content.jsx'
import Settings from './pages/Settings.jsx'
import Staff from './pages/Staff.jsx'
import './admin.css'

const seedFiles = import.meta.glob('./seeds/*.json')

export default function AdminApp() {
  return (
    <Routes>
      <Route index element={<AdminIndex />} />
      <Route path=":key/*" element={<SiteGate />} />
    </Routes>
  )
}

function SiteGate() {
  const { key } = useParams()
  const site = useMemo(() => getAdminSite(key), [key])
  const [seed, setSeed] = useState(undefined)
  useEffect(() => {
    setSeed(undefined)
    const load = seedFiles[`./seeds/${key}.json`]
    if (!load) return setSeed(null)
    load().then((m) => setSeed(m.default))
  }, [key])
  if (!site) return <Missing />
  if (seed === undefined) return <div className="adm-loading">Đang tải trang quản trị…</div>
  return (
    <AdminProvider site={site} staticSeed={seed}>
      <Themed site={site}>
        <Routes>
          <Route path="dang-nhap" element={<Login />} />
          <Route path="*" element={<Shell />} />
        </Routes>
        <ConfirmHost />
      </Themed>
    </AdminProvider>
  )
}

// màu nhận diện của mẫu → biến CSS; màu quá sáng (vàng…) thì chữ trên nút dùng màu tối
function Themed({ site, children }) {
  const style = useMemo(() => {
    const hex = site.accent.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return { '--adm-accent': site.accent, '--adm-accent-ink': lum > 0.6 ? '#1c1d21' : '#fff', '--adm-accent-text': lum > 0.6 ? '#7a5b00' : site.accent }
  }, [site])
  return (
    <div className="adm" style={style}>
      {children}
    </div>
  )
}

// ---------- Khung chính ----------
function Shell() {
  const { site, store } = useAdmin()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  useCollection('activity') // vẽ lại số đếm khi dữ liệu đổi
  useEffect(() => setNavOpen(false), [location.pathname])
  // thông báo "đã xem" lưu trong trình duyệt (bản demo chưa có máy chủ)
  const seenStore = useMemo(() => localSeen(`ca-admin-seen:${site.key}`), [site.key])
  const [seen, mark] = useSeen(seenStore.load, seenStore.save)
  const items = pendingItems(site, (c) => store.read(c))
  const badges = unseenByModule(items, seen)
  // mở chi tiết một bản ghi (?open=…) → thông báo của bản ghi đó coi như đã xem
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('open')
    const mod = location.pathname.split('/')[3]
    if (id && mod) mark(items.filter((i) => i.module === mod && String(i.id) === id).map((i) => i.key))
  })
  if (!isAuthed(site)) return <Navigate to={`/quan-tri/${site.key}/dang-nhap`} replace state={{ from: location.pathname + location.search }} />
  let group = null
  return (
    <div className={`adm-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="adm-side" aria-label="Chức năng">
        <div className="adm-side__brand">
          <span className="adm-logo">{initials(site.name)}</span>
          <div>
            <b>{site.name}</b>
            <span>{PROFILE_LABEL[site.profile]}</span>
          </div>
          <button type="button" className="adm-iconbtn adm-side__close" onClick={() => setNavOpen(false)} aria-label="Đóng menu">
            <X size={20} />
          </button>
        </div>
        <nav className="adm-side__nav">
          {site.modules.map((m) => {
            const meta = moduleMeta(site, m.id, store)
            const head = m.group !== group ? (group = m.group) : null
            return (
              <div key={m.id}>
                {head && <p className="adm-side__group">{head}</p>}
                <NavLink
                  to={`/quan-tri/${site.key}/${m.id === 'dashboard' ? '' : m.id}`}
                  end={m.id === 'dashboard'}
                  className={({ isActive }) => `adm-side__link ${isActive ? 'is-active' : ''}`}
                  // mở chức năng → các thông báo của chức năng đó coi như đã xem
                  onClick={() => badges[m.id] && mark(items.filter((i) => i.module === m.id).map((i) => i.key))}
                >
                  <meta.icon size={18} />
                  <span>{meta.label}</span>
                  {!!badges[m.id] && <em>{badges[m.id] > 99 ? '99+' : badges[m.id]}</em>}
                </NavLink>
              </div>
            )
          })}
        </nav>
        <div className="adm-side__foot">
          <a href={site.siteUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Xem website
          </a>
          <Link to="/mau-phan-mem">
            <ArrowLeft size={16} /> Về Kho mẫu
          </Link>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />
      <div className="adm-main">
        <Topbar onMenu={() => setNavOpen(true)} notify={{ items, seen, mark }} />
        <main className="adm-content">
          <Routes>
            <Route index element={<Titled id="dashboard"><Dashboard /></Titled>} />
            <Route path=":module" element={<ModuleRoute />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function Titled({ id, children }) {
  const { site, store } = useAdmin()
  useEffect(() => {
    document.title = `${moduleMeta(site, id, store).label} · Quản trị ${site.name}`
  }, [site, id, store])
  return children
}

function ModuleRoute() {
  const { module } = useParams()
  const { site, store } = useAdmin()
  const ctx = useMemo(() => ({ site, store, read: (c) => store.read(c) }), [site, store])
  if (!site.modules.some((m) => m.id === module)) return <Navigate to={`/quan-tri/${site.key}`} replace />
  const page = { reports: <Reports />, content: <Content />, settings: <Settings />, staff: <Staff /> }[module]
  return (
    <Titled id={module} key={module}>
      {page || <Resource key={module} schema={getSchema(module, ctx)} />}
    </Titled>
  )
}

// Việc chờ xử lý → thông báo + huy hiệu thanh bên. Mỗi việc một mã theo đúng sự việc (đổi ngày hẹn → thông báo mới)
const PENDING = [
  ['orders', (o) => o.status === 'Chờ xác nhận', 'pending', 'Đơn hàng chờ xác nhận'],
  ['bookings', (b) => b.status === 'Chờ xác nhận', 'pending', 'Lịch hẹn chờ xác nhận'],
  ['installs', (b) => b.status === 'Chờ xác nhận', 'pending', 'Lịch lắp đặt chờ xác nhận'],
  ['testDrives', (b) => b.status === 'Chờ xác nhận', 'pending', 'Lịch lái thử chờ xác nhận'],
  ['repairOrders', (o) => o.status === 'Báo giá', 'quote', 'Báo giá chờ khách duyệt'],
  ['reviews', (r) => r.status === 'Chờ duyệt', 'review', 'Đánh giá chờ duyệt'],
  ['leads', (l, today) => l.status === 'Mới' || (l.nextFollow && l.nextFollow < today && !['Thất bại', 'Đặt cọc'].includes(l.status)), (l) => (l.status === 'Mới' ? 'new' : `follow:${l.nextFollow}`), (l) => (l.status === 'Mới' ? 'Khách quan tâm mới' : 'Cần liên hệ lại')],
  ['loans', (l) => l.status === 'Mới nhận', 'new', 'Hồ sơ trả góp mới'],
  ['consignments', (c) => c.status === 'Mới', 'new', 'Yêu cầu định giá / ký gửi mới'],
  ['products', (p) => p.stock <= p.min && p.status !== 'Ẩn', 'low', 'Sản phẩm sắp hết hàng'],
  ['parts', (p) => p.stock <= p.min, 'low', 'Phụ tùng sắp hết'],
]
const call = (v, r) => (typeof v === 'function' ? v(r) : v)
function pendingItems(site, read) {
  const today = isoDay()
  const out = []
  for (const [col, test, part, title] of PENDING) {
    if (!site.modules.some((m) => m.id === col)) continue
    for (const r of read(col))
      if (test(r, today))
        out.push({
          key: `${col}:${r.id}:${call(part, r)}`,
          module: col,
          id: r.id,
          title: call(title, r),
          sub: [r.code || r.sku || r.plate, r.customer || r.customerName || r.name || r.product || r.title, r.phone].filter(Boolean).join(' · '),
          time: r.createdAt || r.date || '',
          path: `${col}?open=${r.id}`,
        })
  }
  return out
}

function Topbar({ onMenu, notify }) {
  const { site, store } = useAdmin()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null) // 'search' | 'bell' | 'user'
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
  const ctx = { site, store, read: (c) => store.read(c) }
  const results = []
  if (q.trim().length >= 2)
    for (const col of SEARCHABLE) {
      if (!site.modules.some((m) => m.id === col)) continue
      const s = getSchema(col, ctx)
      store
        .read(col)
        .filter((r) => matchText(r, s.search, q.trim()))
        .slice(0, 4)
        .forEach((r) => results.push({ col, label: s.label, r }))
    }
  const go = (path) => (setOpen(null), setQ(''), navigate(`/quan-tri/${site.key}/${path}`))
  return (
    <header className="adm-top" ref={ref}>
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
          placeholder="Tìm khách, mã đơn, biển số, xe…  ( / )"
          aria-label="Tìm kiếm toàn bộ"
          onKeyDown={(e) => e.key === 'Enter' && results[0] && go(`${results[0].col}?open=${results[0].r.id}`)}
        />
        {open === 'search' && q.trim().length >= 2 && (
          <div className="adm-pop adm-pop--search">
            {results.length ? (
              results.slice(0, 12).map(({ col, label, r }) => (
                <button key={col + r.id} type="button" onClick={() => go(`${col}?open=${r.id}`)}>
                  <em>{label}</em>
                  <b>{r.code || r.plate || r.sku || ''}</b>
                  <span>{r.name || r.customer || r.owner || ''}</span>
                  <small>{r.phone || r.car || r.status || ''}</small>
                </button>
              ))
            ) : (
              <p className="adm-muted">Không tìm thấy "{q}"</p>
            )}
          </div>
        )}
      </div>
      <span className="adm-demo-pill" title="Chưa kết nối máy chủ: dữ liệu lưu trong trình duyệt này">
        Bản demo
      </span>
      <a className="adm-iconbtn adm-hide-sm" href={site.siteUrl} target="_blank" rel="noreferrer" aria-label="Xem website" title="Xem website">
        <ExternalLink size={18} />
      </a>
      <NotifyBell {...notify} go={go} open={open === 'bell'} onToggle={() => setOpen(open === 'bell' ? null : 'bell')} />
      <div className="adm-top__pop">
        <button type="button" className="adm-user" onClick={() => setOpen(open === 'user' ? null : 'user')} aria-expanded={open === 'user'}>
          <span className="adm-avatar adm-avatar--sm">Q</span>
          <span className="adm-hide-sm">Quản trị viên</span>
        </button>
        {open === 'user' && (
          <div className="adm-pop adm-pop--right">
            <p className="adm-pop__title">
              Quản trị viên
              <small>admin@{site.slug}.demo</small>
            </p>
            <button type="button" onClick={() => go('settings')}>
              Cài đặt
            </button>
            <button type="button" onClick={() => go('staff')}>
              Nhân viên & phân quyền
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(authKey(site))
                } catch {
                  /* bỏ qua */
                }
                navigate(`/quan-tri/${site.key}/dang-nhap`)
              }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// ---------- Đăng nhập (demo: chưa có máy chủ xác thực) ----------
function Login() {
  const { site, toast } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(`admin@${site.slug}.demo`)
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => {
    document.title = `Đăng nhập · Quản trị ${site.name}`
  }, [site])
  const enter = () => {
    try {
      sessionStorage.setItem(authKey(site), '1')
    } catch {
      /* chế độ ẩn danh */
    }
    navigate(location.state?.from || `/quan-tri/${site.key}`, { replace: true })
  }
  return (
    <div className="adm-login">
      <div className="adm-login__brand">
        <span className="adm-logo adm-logo--lg">{initials(site.name)}</span>
        <h1>Quản trị {site.name}</h1>
        <p>{PROFILE_LABEL[site.profile]} · quản lý {site.profile === 'gara' ? 'lịch hẹn, phiếu sửa chữa, khách hàng' : site.profile === 'shop' ? 'đơn hàng, sản phẩm, kho, khuyến mãi' : 'xe, khách quan tâm, đặt cọc, trả góp'} và nội dung website.</p>
        <ul>
          <li>Xem trên máy tính và điện thoại</li>
          <li>Phân quyền theo vai trò nhân viên</li>
          <li>Báo cáo doanh thu theo ngày, tuần, tháng</li>
        </ul>
      </div>
      <form
        className="adm-login__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!/^[^\s@]+@[^\s@]+$/.test(email)) return setErr('Email chưa đúng định dạng')
          if (!pass) return setErr('Vui lòng nhập mật khẩu')
          enter()
        }}
        noValidate
      >
        <h2>Đăng nhập</h2>
        <p className="adm-muted">Bản demo: nhập mật khẩu bất kỳ hoặc vào nhanh bằng tài khoản demo.</p>
        <div className="adm-field">
          <label htmlFor="lg-email">Email</label>
          <input id="lg-email" type="email" autoComplete="username" value={email} onChange={(e) => (setEmail(e.target.value), setErr(''))} />
        </div>
        <div className="adm-field">
          <label htmlFor="lg-pass">Mật khẩu</label>
          <input id="lg-pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => (setPass(e.target.value), setErr(''))} aria-invalid={!!err} />
          {err && <small className="adm-field__err">{err}</small>}
        </div>
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block">
          Đăng nhập
        </button>
        <button type="button" className="adm-btn adm-btn--block" onClick={enter}>
          Vào nhanh bằng tài khoản demo
        </button>
        <button type="button" className="adm-linkbtn" onClick={() => toast('Bản demo: liên kết đặt lại mật khẩu sẽ gửi qua email khi có máy chủ')}>
          Quên mật khẩu?
        </button>
        <Link to="/mau-phan-mem" className="adm-linkbtn">
          ← Về Kho mẫu
        </Link>
      </form>
    </div>
  )
}

// ---------- /quan-tri: danh sách bản quản trị của mọi mẫu ----------
function AdminIndex() {
  useEffect(() => {
    document.title = 'Trang quản trị các mẫu · ChungAuto'
  }, [])
  const sites = allAdminSites()
  return (
    <div className="adm adm-index">
      <header>
        <Link to="/mau-phan-mem" className="adm-linkbtn">
          ← Kho mẫu
        </Link>
        <h1>Trang quản trị của từng mẫu</h1>
        <p>Mỗi mẫu có một trang quản trị riêng theo đúng ngành: gara & dịch vụ, cửa hàng bán lẻ, showroom & đại lý xe. Bản demo chưa có máy chủ, mọi thay đổi lưu trong trình duyệt của bạn.</p>
      </header>
      {['gara', 'shop', 'showroom'].map((p) => (
        <section key={p}>
          <h2>{PROFILE_LABEL[p]}</h2>
          <div className="adm-index__grid">
            {sites
              .filter((s) => s.profile === p)
              .map((s) => (
                <Link key={s.key} to={`/quan-tri/${s.key}`} className="adm-index__card">
                  <Thumb k={s.key} alt="" />
                  <div>
                    <b>{s.fullName}</b>
                    <span>{s.modules.length} chức năng · {s.kind === 'project' ? 'Mẫu dựng riêng' : 'Mẫu phần mềm'}</span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Missing() {
  return (
    <div className="adm adm-index">
      <header>
        <h1>Không tìm thấy trang quản trị</h1>
        <p>
          Mẫu này chưa có trang quản trị. <Link to="/quan-tri">Xem danh sách</Link>
        </p>
      </header>
    </div>
  )
}
