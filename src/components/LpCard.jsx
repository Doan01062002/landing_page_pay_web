import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'

// Thẻ mẫu landing page quà tặng: xem trước trên máy tính + điện thoại.
export default function LpCard({ lp }) {
  return (
    <article className="lpcard">
      <Link to={`/demo-landing/${lp.slug}`} className="lpcard__media" aria-label={`Xem thử landing page ${lp.name}`}>
        <LivePreview slug={lp.slug} path="/lp" tall title={`Landing page ${lp.name}`} />
        <div className="lpcard__phone">
          <LivePreview slug={lp.slug} path="/lp" device="mobile" title={`Landing page ${lp.name} trên điện thoại`} />
        </div>
        <span className="lpcard__badge">
          <Icon name="Gift" size={14} /> Tặng kèm · 0đ
        </span>
      </Link>
      <div className="lpcard__body">
        <span className="lpcard__type">{lp.campaignType}</span>
        <h3>
          <Link to={`/demo-landing/${lp.slug}`}>{lp.name}</Link>
        </h3>
        <p>{lp.summary}</p>
        <ul className="lpcard__facts">
          <li>
            <Icon name="Play" size={13} /> {lp.videos.length} video
          </li>
          <li>
            <Icon name="Eye" size={13} /> {lp.photos.length} ảnh xưởng
          </li>
          <li>
            <Icon name="Timer" size={13} /> Đếm ngược ưu đãi
          </li>
        </ul>
        <div className="lpcard__foot">
          <small>Ví dụ dùng kèm website {lp.forWebsite}</small>
          <Link to={`/demo-landing/${lp.slug}`} className="btn btn--ghost">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
        </div>
      </div>
    </article>
  )
}
