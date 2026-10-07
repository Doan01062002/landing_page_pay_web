import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { typeLabel } from '../data/projects.js'

// Mẫu dựng riêng (trang tĩnh /du-an/<slug>/) trong lưới Kho mẫu: cùng khung thẻ tối giản với TemplateCard.
export default function ProjectTile({ p }) {
  return (
    <article className="tcard tcard--project">
      <Link to={`/demo-du-an/${p.slug}`} className="tcard__media" aria-label={`Xem thử ${p.name}`}>
        <LivePreview slug={p.slug} url={p.url} tall title={`${typeLabel(p.type)} ${p.name}`} />
        <div className="tcard__badges">
          <span className="badge badge--custom">Dựng riêng</span>
        </div>
      </Link>
      <div className="tcard__body">
        <h3 className="tcard__name">
          <Link to={`/demo-du-an/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className="tcard__price tcard__price--quote">Báo giá theo yêu cầu</p>
        <div className="tcard__actions">
          <Link to={`/demo-du-an/${p.slug}`} className="btn btn--signal">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
          <a href={p.url} target="_blank" rel="noreferrer" className="btn btn--ghost">
            Mở trang
          </a>
        </div>
      </div>
    </article>
  )
}
