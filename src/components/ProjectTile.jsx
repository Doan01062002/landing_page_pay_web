import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { typeLabel } from '../data/projects.js'

// Thẻ dự án dạng lưới (trang /du-an): khung trình duyệt + điện thoại xem trước, nhãn, mô tả, tính năng, 2 nút.
export default function ProjectTile({ p }) {
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
    <article className="pjx">
      <Link to={`/demo-du-an/${p.slug}`} className="pjx__thumb" aria-label={`Xem thử ${p.name}`}>
        <span className="pjx__bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <LivePreview slug={p.slug} url={p.url} tall title={`${typeLabel(p.type)} ${p.name}`} />
        <span className="pjx__phone">
          <LivePreview slug={p.slug} url={p.url} device="mobile" title={`${p.name} trên điện thoại`} />
        </span>
        <span className="pjx__badges">
          <span className={'pjx__bdg' + (p.demo ? ' pjx__bdg--demo' : '')}>
            <Icon name={p.demo ? 'Sparkles' : 'BadgeCheck'} size={13} /> {p.demo ? 'Bản mẫu' : 'Đã triển khai'}
          </span>
        </span>
        <span className="pjx__hover">
          <Icon name="Eye" size={15} /> Xem trên máy tính & điện thoại
        </span>
      </Link>

      <div className="pjx__body">
        <div className="pjx__top">
          <h3>
            <Link to={`/demo-du-an/${p.slug}`}>{p.name}</Link>
          </h3>
          <span className="pjx__dots" aria-hidden="true">
            <i style={{ background: p.accent }} />
          </span>
        </div>
        <p className="pjx__kit">
          <b>{typeLabel(p.type)}</b> · {p.demo ? 'Thực hiện' : 'Bàn giao'} {p.deployed}
        </p>
        <p className="pjx__area">
          <Icon name="MapPin" size={13} /> {p.area}
        </p>
        <p className="pjx__desc">{p.summary}</p>
        <div className="pjx__feats">
          {p.highlights.slice(0, 4).map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        <div className="pjx__act">
          <button type="button" className="btn btn--ghost" onClick={copy}>
            <Icon name={copied ? 'Check' : 'Copy'} size={16} /> {copied ? 'Đã sao chép' : 'Sao chép link'}
          </button>
          <Link to={`/demo-du-an/${p.slug}`} className="btn btn--signal">
            <Icon name="Eye" size={16} /> Xem thử
          </Link>
        </div>
      </div>
    </article>
  )
}
