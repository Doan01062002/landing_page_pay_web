import { useEffect, useMemo, useRef, useState } from 'react'
import { introWillPlay, introRunning, INTRO_DONE } from './introState.js'

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
export default function LivePreview({ slug, palette = 0, device = 'desktop', className = '', title, tall = false, auto = false, path = '/preview', url }) {
  const { w, h } = DEVICES[device]
  const frameH = tall || auto ? h * 3 : h
  const boxRef = useRef(null)
  const frameRef = useRef(null)
  const paletteRef = useRef(palette)
  const [scale, setScale] = useState(0.25)
  // đang chạy màn mở đầu logo: chưa tải iframe (nhiều iframe tải cùng lúc làm logo giật), chờ logo xong
  const [ready, setReady] = useState(() => !introWillPlay())

  useEffect(() => {
    if (ready) return
    if (!introRunning()) return setReady(true)
    const go = () => setReady(true)
    window.addEventListener(INTRO_DONE, go, { once: true })
    return () => window.removeEventListener(INTRO_DONE, go)
  }, [ready])

  // src chỉ phụ thuộc slug: đổi màu không làm iframe tải lại. url: trang tĩnh (dự án đã triển khai)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const src = useMemo(() => url || `${path}/${slug}?embed=1&c=${palette}`, [slug, path, url])

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
        src={ready ? src : undefined}
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
