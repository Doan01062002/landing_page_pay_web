import Icon from './Icon.jsx'
import { useSite } from '../lib/siteData.jsx'
import { useScrolled } from './Motion.jsx'

export default function FloatingContact() {
  const site = useSite()
  const showTop = useScrolled(700)
  return (
    <div className="float-contact">
      <button
        type="button"
        className={'float-contact__top' + (showTop ? ' is-visible' : '')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Lên đầu trang"
        tabIndex={showTop ? 0 : -1}
      >
        <Icon name="ArrowUp" size={20} />
      </button>
      <a className="float-contact__btn float-contact__btn--zalo" href={site.zaloUrl} target="_blank" rel="noreferrer" aria-label={`Nhắn ${site.zalo}`}>
        <Icon name="MessageCircle" size={22} />
        <span>Zalo</span>
      </a>
      <a className="float-contact__btn float-contact__btn--call" href={`tel:${site.hotline.replace(/\s/g, '')}`} aria-label={`Gọi ${site.hotline}`}>
        <Icon name="Phone" size={22} />
        <span>{site.hotline}</span>
      </a>
    </div>
  )
}
