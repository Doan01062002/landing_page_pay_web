import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { getPages } from '../templates/pages.jsx'
import { featureFilters } from '../data/templates.js'
import { formatVND } from '../data/site.js'

const featureLabel = Object.fromEntries(featureFilters.map((f) => [f.id, f.label]))

export default function TemplateCard({ t }) {
  return (
    <article className="tcard">
      <div className="tcard__media">
        <LivePreview slug={t.slug} tall />
        <div className="tcard__overlay">
          <Link to={`/demo/${t.slug}`} className="btn btn--signal">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
          <Link to={`/mau-website/${t.slug}`} className="btn btn--light">
            Chi tiết
          </Link>
        </div>
        <div className="tcard__badges">
          {t.isNew && <span className="badge badge--new">Mới</span>}
          {t.free && <span className="badge badge--free">Miễn phí</span>}
        </div>
      </div>
      <div className="tcard__body">
        <div className="tcard__top">
          <span className="tcard__cat">{t.categoryLabel}</span>
          <span className="tcard__swatches" aria-label={`${t.palettes.length} bộ màu`}>
            {t.palettes.map((p) => (
              <i key={p.name} style={{ background: p.p }} />
            ))}
          </span>
        </div>
        <h3 className="tcard__name">
          <Link to={`/mau-website/${t.slug}`}>{t.name}</Link>
        </h3>
        <p className="tcard__tagline">{t.tagline}</p>
        <ul className="tcard__features">
          {t.features.slice(0, 3).map((f) => (
            <li key={f}>{featureLabel[f]}</li>
          ))}
        </ul>
        <div className="tcard__foot">
          <span className="tcard__price">
            {t.free ? (
              <strong>Miễn phí</strong>
            ) : (
              <>
                <small>Triển khai từ</small>
                <strong>{formatVND(t.price)}</strong>
              </>
            )}
          </span>
          <span className="tcard__pages" title="Số trang của website, chưa kể trang quản trị">
            <Icon name="FileText" size={14} /> {getPages(t).length} trang + quản trị
          </span>
        </div>
      </div>
    </article>
  )
}
