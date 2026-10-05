import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'

/*
  Video nền tự phát (tắt tiếng, lặp lại). Luôn có nút tạm dừng để người xem dừng chuyển động.
  Tự dừng khi cuộn ra khỏi màn hình để nhẹ máy. Ở chế độ thu nhỏ (embed) chỉ hiện ảnh đại diện.
*/
export function AutoVideo({ video, embed, className = '', showToggle = true }) {
  const ref = useRef(null)
  const [paused, setPaused] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || embed) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) el.play().catch(() => {})
      else el.pause()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [embed, video.src])

  if (embed) return <img className={'lp-media ' + className} src={video.poster} alt="" />

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      userPaused.current = false
      el.play().catch(() => {})
    } else {
      userPaused.current = true
      el.pause()
    }
  }

  return (
    <>
      <video
        ref={ref}
        className={'lp-media ' + className}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        aria-label={video.title}
      />
      {showToggle && (
        <button type="button" className="lp-vtoggle" onClick={toggle} aria-label={paused ? 'Phát video' : 'Tạm dừng video'}>
          <Icon name={paused ? 'Play' : 'Pause'} size={16} />
        </button>
      )}
    </>
  )
}

/* Thẻ video: rê chuột để xem thử (tắt tiếng), bấm để mở trình phát lớn. */
export function VideoCard({ video, onOpen, embed, featured }) {
  const ref = useRef(null)
  const [hover, setHover] = useState(false)

  const start = () => {
    if (embed || !window.matchMedia('(hover: hover)').matches) return
    setHover(true)
    const el = ref.current
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }
  const stop = () => {
    setHover(false)
    ref.current?.pause()
  }

  return (
    <button
      type="button"
      className={'lp-vcard' + (featured ? ' lp-vcard--featured' : '') + (hover ? ' is-playing' : '')}
      onClick={onOpen}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`Xem video: ${video.title}`}
    >
      <img src={video.poster} alt="" loading="lazy" />
      {!embed && <video ref={ref} src={video.src} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
      <span className="lp-vcard__shade" />
      <span className="lp-vcard__play">
        <Icon name="Play" size={featured ? 26 : 18} />
      </span>
      <span className="lp-vcard__meta">
        <b>{video.title}</b>
        <small>{video.caption}</small>
      </span>
      <span className="lp-vcard__dur">{video.duration}</span>
    </button>
  )
}

/*
  Trình xem lớn cho video và ảnh: ← → để chuyển, Esc để đóng, vuốt ngang trên điện thoại.
  items: [{ type: 'video' | 'image', src, poster?, title, caption }]
*/
export function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index]
  const touch = useRef(null)
  const go = useCallback((d) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [go, onClose])

  return (
    <div
      className="lp-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <button type="button" className="lp-lightbox__close" onClick={onClose} aria-label="Đóng">
        <Icon name="X" size={22} />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="lp-lightbox__nav lp-lightbox__nav--prev" onClick={() => go(-1)} aria-label="Trước">
            <Icon name="ArrowLeft" size={22} />
          </button>
          <button type="button" className="lp-lightbox__nav lp-lightbox__nav--next" onClick={() => go(1)} aria-label="Sau">
            <Icon name="ArrowRight" size={22} />
          </button>
        </>
      )}
      <figure className="lp-lightbox__stage" key={index}>
        {item.type === 'video' ? (
          <video src={item.src} poster={item.poster} controls autoPlay playsInline />
        ) : (
          <img src={item.src} alt={item.caption || item.title} />
        )}
        <figcaption>
          <span>
            <b>{item.title}</b>
            {item.caption && <small>{item.caption}</small>}
          </span>
          <em>
            {index + 1} / {items.length}
          </em>
        </figcaption>
      </figure>
    </div>
  )
}

/* Thời gian còn lại tới hạn chót: [ngày, giờ, phút, giây], cập nhật mỗi giây. */
export function useCountdown(deadline) {
  const end = new Date(deadline).getTime()
  const calc = () => {
    const d = Math.max(0, end - Date.now())
    return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60]
  }
  const [v, setV] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setV(calc()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end])
  return v
}
