import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { getTemplate, templates, categories } from '../data/templates.js'
import Picker from '../components/Picker.jsx'
import { getLanding, landings } from '../data/landings.js'
import { getProject, projects, typeLabel } from '../data/projects.js'
import { formatVND } from '../data/site.js'
import NotFound from './NotFound.jsx'
import { getPages } from '../templates/pages.jsx'
import '../styles/demo.css'

const devices = [
  { id: 'desktop', label: 'Máy tính', icon: 'Monitor' },
  { id: 'tablet', label: 'Máy tính bảng', icon: 'Tablet' },
  { id: 'mobile', label: 'Điện thoại', icon: 'Smartphone' },
]

// Trang xem thử dùng chung cho website mẫu và landing page tặng kèm.
const KINDS = {
  template: {
    list: templates,
    get: getTemplate,
    base: '/demo',
    preview: '/preview',
    back: (t) => `/mau-phan-mem/${t.slug}`,
    backLabel: 'Quay về chi tiết',
    sub: (t) => `${t.categoryLabel} · ${t.free ? 'Miễn phí' : `từ ${formatVND(t.price)}`}`,
    cta: 'Chọn mẫu này',
    ctaShort: 'Chọn mẫu',
    consultName: (t) => t.name,
  },
  landing: {
    list: landings,
    get: getLanding,
    base: '/demo-landing',
    preview: '/lp',
    back: () => '/mau-landing-page',
    backLabel: 'Quay về danh sách',
    sub: (t) => `${t.campaignType} · Tặng kèm khi làm phần mềm`,
    cta: 'Chọn mẫu landing này',
    ctaShort: 'Chọn mẫu',
    consultName: (t) => `Landing ${t.name}`,
  },
  // Dự án đã triển khai: trang tĩnh /du-an/<slug>/, không đổi màu, có nút mở trang thật
  project: {
    list: projects,
    get: getProject,
    base: '/demo-du-an',
    url: (t) => t.url,
    back: () => '/du-an',
    backLabel: 'Quay về dự án',
    sub: (t) => `${typeLabel(t.type)} · ${t.demo ? 'Bản mẫu' : 'Đã triển khai'} ${t.deployed}`,
    cta: 'Làm trang như thế này',
    ctaShort: 'Làm trang này',
    consultName: (t) => `Làm giống dự án ${t.name}`,
  },
}

export default function Demo({ kind = 'template' }) {
  const K = KINDS[kind]
  const { slug } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const t = K.get(slug)
  const palettes = t?.palettes || []
  const [device, setDevice] = useState('desktop')
  const [palette, setPalette] = useState(Number(params.get('c')) || 0)
  const frameRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const { open } = useConsult()
  // Website mẫu có nhiều trang; landing page chỉ có 1 trang
  const pages = useMemo(() => (kind === 'template' && t ? getPages(t) : []), [kind, t])
  const [page, setPage] = useState(params.get('trang') || '')

  // Danh sách cho ô chọn mẫu: nhóm theo loại hình, có ảnh, số trang, giá
  const templateOptions = useMemo(() => {
    if (kind === 'template') {
      const order = categories.map((c) => c.id)
      return [...K.list]
        .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
        .map((x) => ({
          value: x.slug,
          label: x.name,
          sub: `${getPages(x).length} trang${x.isNew ? ' · Mới' : ''}`,
          meta: x.free ? 'Miễn phí' : `${(x.price / 1e6).toLocaleString('vi-VN')} triệu`,
          image: x.hero.image || x.hero.slides?.[0]?.image,
          group: x.categoryLabel,
        }))
    }
    if (kind === 'project') return K.list.map((x) => ({ value: x.slug, label: x.name, sub: x.area, meta: typeLabel(x.type), image: x.cover }))
    return K.list.map((x) => ({ value: x.slug, label: x.name, sub: x.campaignType, meta: 'Tặng kèm', image: x.hero.video.poster }))
  }, [kind, K])

  const src = useMemo(
    // Mẫu dựng riêng (t.url) chạy trang tĩnh của nó thay vì /preview
    () => (K.url ? (t ? K.url(t) : '') : t?.url ? t.url : `${K.preview}/${slug}${page ? '/' + page : ''}?c=${palette}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, K],
  )

  useEffect(() => setLoaded(false), [slug])

  // Khung mẫu báo trang đang mở (khi khách bấm menu bên trong) để ô chọn trang cập nhật theo
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin === window.location.origin && e.data?.type === 'garaweb:route' && e.source === frameRef.current?.contentWindow) setPage(e.data.page)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const goPage = (p) => {
    setPage(p)
    frameRef.current?.contentWindow?.postMessage({ type: 'garaweb:navigate', page: p }, window.location.origin)
  }

  useEffect(() => {
    if (t) document.title = `Xem thử ${t.name} – ChungAuto`
  }, [t])

  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage({ type: 'garaweb:palette', index: palette }, window.location.origin)
  }, [palette])

  if (!t) return <NotFound />

  return (
    <div className="demo">
      <header className="demo-bar">
        <div className="demo-bar__left">
          <Link to={K.back(t)} className="demo-bar__back" title={K.backLabel} aria-label={K.backLabel}>
            <Icon name="ArrowLeft" size={17} />
            <span className="demo-bar__back-label">{K.backLabel}</span>
          </Link>
          <div className="demo-bar__title">
            <Picker
              variant="title"
              ariaLabel="Đổi mẫu"
              title={
                kind === 'template'
                  ? `Chọn mẫu phần mềm (${K.list.length})`
                  : kind === 'project'
                    ? `Dự án đã triển khai (${K.list.length})`
                    : `Chọn mẫu landing page (${K.list.length})`
              }
              value={t.slug}
              options={templateOptions}
              onChange={(slug) => {
                setPalette(0)
                setPage('')
                navigate(`${K.base}/${slug}`)
              }}
              renderButton={(o) => (
                <>
                  {o.image && <img src={o.image} alt="" className="picker__btn-thumb" />}
                  <span className="picker__btn-text">
                    <b>{o.label}</b>
                    <small>{K.sub(t)}</small>
                  </span>
                </>
              )}
            />
          </div>
        </div>

        <div className="demo-bar__devices" role="radiogroup" aria-label="Chế độ hiển thị">
          {devices.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={device === d.id} className={device === d.id ? 'is-active' : ''} onClick={() => setDevice(d.id)} title={d.label}>
              <Icon name={d.icon} size={18} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        <div className="demo-bar__right">
          {pages.length > 1 && (
            <div className="demo-bar__pages">
              <span className="demo-bar__pages-label" aria-hidden="true">
                <Icon name="FileText" size={15} /> Trang
              </span>
              <Picker
                ariaLabel="Trang"
                title={`Các trang của mẫu (${pages.length})`}
                align="right"
                value={page}
                options={pages.map((p) => ({ value: p.slug, label: p.label, icon: p.icon }))}
                onChange={goPage}
              />
            </div>
          )}
          <div className="demo-bar__swatches" role="radiogroup" aria-label="Bộ màu">
            {palettes.map((p, i) => (
              <button
                key={p.name}
                type="button"
                role="radio"
                aria-checked={palette === i}
                aria-label={`Bộ màu ${p.name}`}
                title={p.name}
                className={'swatch swatch--sm' + (palette === i ? ' is-active' : '')}
                onClick={() => setPalette(i)}
              >
                <i style={{ background: p.p }} />
                <i style={{ background: p.a }} />
              </button>
            ))}
          </div>
          {K.url && (
            <a
              href={K.url(t)}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost demo-bar__ext-btn"
              title="Mở trang thật trong tab mới"
            >
              <Icon name="ExternalLink" size={15} />
              <span className="demo-bar__btn-label">Mở trang thật</span>
            </a>
          )}
          <button
            type="button"
            className="btn btn--signal demo-bar__cta-btn"
            onClick={() => open(K.consultName(t))}
            title={K.cta}
          >
            <span className="demo-bar__cta-full">{K.cta}</span>
            <span className="demo-bar__cta-short">{K.ctaShort || K.cta}</span>
          </button>
        </div>
      </header>

      <div className={'demo-stage demo-stage--' + device}>
        <div className="demo-frame">
          <div className={'demo-loading' + (loaded ? ' is-done' : '')} aria-hidden={loaded}>
            <span className="spinner" />
            Đang tải mẫu {t.name}…
          </div>
          <iframe
            key={t.slug}
            ref={frameRef}
            src={src}
            title={`Xem thử mẫu ${t.name}`}
            onLoad={() => {
              frameRef.current?.contentWindow?.postMessage({ type: 'garaweb:palette', index: palette }, window.location.origin)
              setLoaded(true)
            }}
          />
        </div>
      </div>
    </div>
  )
}
