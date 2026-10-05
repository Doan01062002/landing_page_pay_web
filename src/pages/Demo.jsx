import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { getTemplate, templates } from '../data/templates.js'
import { getLanding, landings } from '../data/landings.js'
import { formatVND } from '../data/site.js'
import NotFound from './NotFound.jsx'
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
    back: (t) => `/mau-website/${t.slug}`,
    backLabel: 'Quay về chi tiết',
    sub: (t) => `${t.categoryLabel} · ${t.free ? 'Miễn phí' : `từ ${formatVND(t.price)}`}`,
    cta: 'Chọn mẫu này',
    consultName: (t) => t.name,
  },
  landing: {
    list: landings,
    get: getLanding,
    base: '/demo-landing',
    preview: '/lp',
    back: () => '/mau-landing-page',
    backLabel: 'Quay về danh sách',
    sub: (t) => `${t.campaignType} · Tặng kèm khi làm website`,
    cta: 'Chọn mẫu landing này',
    consultName: (t) => `Landing ${t.name}`,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const src = useMemo(() => `${K.preview}/${slug}?c=${palette}`, [slug, K.preview])

  useEffect(() => setLoaded(false), [slug])

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
          <Link to={K.back(t)} className="demo-bar__back">
            <Icon name="ArrowLeft" size={18} />
            <span>{K.backLabel}</span>
          </Link>
          <div className="demo-bar__title">
            <label htmlFor="demo-switch" className="sr-only">
              Đổi mẫu
            </label>
            <select
              id="demo-switch"
              value={t.slug}
              onChange={(e) => {
                setPalette(0)
                navigate(`${K.base}/${e.target.value}`)
              }}
            >
              {K.list.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
            <span>{K.sub(t)}</span>
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
          <button type="button" className="btn btn--signal" onClick={() => open(K.consultName(t))}>
            {K.cta}
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
