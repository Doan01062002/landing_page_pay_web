import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { typeLabel } from '../data/projects.js'

// Mẫu dựng riêng (trang tĩnh /du-an/<slug>/) trong lưới Kho mẫu: cùng khung thẻ với TemplateCard.
export default function ProjectTile({ p }) {
  return (
    <article className="tcard tcard--project">
      <div className="tcard__media">
        <LivePreview slug={p.slug} url={p.url} tall title={`${typeLabel(p.type)} ${p.name}`} />
        <div className="tcard__overlay">
          <Link to={`/demo-du-an/${p.slug}`} className="btn btn--signal">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
          <a href={p.url} target="_blank" rel="noreferrer" className="btn btn--light">
            Mở trang
          </a>
        </div>
        <div className="tcard__badges">
          <span className="badge badge--custom">Dựng riêng</span>
        </div>
      </div>
      <div className="tcard__body">
        <div className="tcard__top">
          <span className="tcard__cat">{typeLabel(p.type)}</span>
          <span className="tcard__swatches" aria-hidden="true">
            <i style={{ background: p.accent }} />
          </span>
        </div>
        <h3 className="tcard__name">
          <Link to={`/demo-du-an/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className="tcard__tagline tcard__tagline--clamp" title={p.summary}>
          {p.summary}
        </p>
        <ul className="tcard__features">
          {p.highlights.slice(0, 3).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className="tcard__foot">
          <span className="tcard__price">
            <small>Mẫu dựng riêng</small>
            <strong>Báo giá theo yêu cầu</strong>
          </span>
          <span className="tcard__pages">
            <Icon name="FileText" size={14} /> {p.type === 'landing' ? '1 trang' : 'Nhiều trang'}
          </span>
        </div>
      </div>
    </article>
  )
}
