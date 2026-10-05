import { useEffect, useMemo, useRef, useState } from 'react'

const DEVICES = {
  desktop: { w: 1280, h: 800 },
  tablet: { w: 820, h: 1100 },
  mobile: { w: 390, h: 844 },
}

/*
  Hiển thị trang mẫu thật (route /preview/:slug) trong iframe, thu nhỏ vừa khung chứa.
  Đổi bộ màu bằng postMessage để không phải tải lại iframe.
  - tall: iframe cao gấp 3 khung nhìn, rê chuột vào thẻ cha thì trang mẫu cuộn xuống
  - auto: tự cuộn xuống rồi lên liên tục (dùng ở hero)
*/
export default function LivePreview({ slug, palette = 0, device = 'desktop', className = '', title, tall = false, auto = false, path = '/preview' }) {
  const { w, h } = DEVICES[device]
  const frameH = tall || auto ? h * 3 : h
  const boxRef = useRef(null)
  const frameRef = useRef(null)
  const paletteRef = useRef(palette)
  const [scale, setScale] = useState(0.25)

  // src chỉ phụ thuộc slug: đổi màu không làm iframe tải lại.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const src = useMemo(() => `${path}/${slug}?embed=1&c=${palette}`, [slug, path])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])

  const sendPalette = () => {
    frameRef.current?.contentWindow?.postMessage({ type: 'garaweb:palette', index: paletteRef.current }, window.location.origin)
  }

  useEffect(() => {
    paletteRef.current = palette
    sendPalette()
  }, [palette])

  const cls = ['live-preview', tall && 'live-preview--tall', auto && 'live-preview--auto', className].filter(Boolean).join(' ')

  return (
    <div ref={boxRef} className={cls} style={{ aspectRatio: `${w} / ${h}`, '--s': scale, '--ty': `${-(frameH - h)}px` }}>
      <iframe
        ref={frameRef}
        src={src}
        title={title || `Xem trước mẫu ${slug}`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={sendPalette}
        style={{ width: w, height: frameH }}
      />
    </div>
  )
}
