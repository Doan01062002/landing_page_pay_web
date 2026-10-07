import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Thumb from './Thumb.jsx'
import { formatVND } from '../data/site.js'

// Thẻ mẫu tối giản: ảnh xem trước, tên, giá, hai nút Xem thử / Chi tiết.
export default function TemplateCard({ t }) {
  return (
    <article className="tcard">
      <Link to={`/demo/${t.slug}`} className="tcard__media" aria-label={`Xem thử ${t.name}`}>
        <Thumb k={t.slug} alt={`Giao diện mẫu ${t.name}`} />
        <div className="tcard__badges">
          {t.isNew && <span className="badge badge--new">Mới</span>}
          {t.free && <span className="badge badge--free">Miễn phí</span>}
        </div>
      </Link>
      <div className="tcard__body">
        <h3 className="tcard__name">
          <Link to={`/mau-phan-mem/${t.slug}`}>{t.name}</Link>
        </h3>
        <p className="tcard__price">{t.free ? 'Miễn phí' : formatVND(t.price)}</p>
        <div className="tcard__actions">
          <Link to={`/demo/${t.slug}`} className="btn btn--signal">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
          <Link to={`/mau-phan-mem/${t.slug}`} className="btn btn--ghost">
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  )
}
