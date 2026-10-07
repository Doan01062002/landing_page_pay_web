import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { typeLabel } from '../data/projects.js'

// Thẻ dự án đã triển khai: xem trước trang thật, mở trang, sao chép link gửi cho cơ sở.
export default function ProjectCard({ p }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + p.url : p.url

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      window.prompt('Sao chép đường dẫn:', fullUrl)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <article className="lpcard pjcard">
      <Link to={`/demo-du-an/${p.slug}`} className="lpcard__media" aria-label={`Xem thử ${p.name}`}>
        <LivePreview slug={p.slug} url={p.url} tall title={`${typeLabel(p.type)} ${p.name}`} />
        <div className="lpcard__phone">
          <LivePreview slug={p.slug} url={p.url} device="mobile" title={`${p.name} trên điện thoại`} />
        </div>
        <span className={`lpcard__badge pjcard__badge${p.demo ? ' pjcard__badge--demo' : ''}`}>
          <Icon name={p.demo ? 'Sparkles' : 'BadgeCheck'} size={14} /> {p.demo ? 'Bản mẫu' : 'Đã triển khai'}
        </span>
      </Link>
      <div className="lpcard__body">
        <span className="lpcard__type">
          {typeLabel(p.type)} · {p.demo ? 'Thực hiện' : 'Bàn giao'} {p.deployed}
        </span>
        <h3>
          <Link to={`/demo-du-an/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className="pjcard__client">
          <Icon name="MapPin" size={14} /> {p.area}
        </p>
        <p>{p.summary}</p>
        <ul className="lpcard__facts">
          {p.highlights.map((h) => (
            <li key={h}>
              <Icon name="Check" size={13} /> {h}
            </li>
          ))}
        </ul>
        <div className="lpcard__foot pjcard__foot">
          <a href={p.url} target="_blank" rel="noreferrer" className="pjcard__url" title="Mở trang thật trong tab mới">
            <Icon name="ExternalLink" size={14} /> {p.url}
          </a>
          <div className="pjcard__actions">
            <button type="button" className="btn btn--ghost" onClick={copy}>
              <Icon name={copied ? 'Check' : 'Copy'} size={16} /> {copied ? 'Đã sao chép' : 'Sao chép link'}
            </button>
            <Link to={`/demo-du-an/${p.slug}`} className="btn btn--primary">
              <Icon name="Eye" size={16} /> Xem thử
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
