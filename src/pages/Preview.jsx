import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import TemplateSite from '../templates/TemplateSite.jsx'
import { getTemplate } from '../data/templates.js'

// Trang mẫu chạy độc lập (thường nằm trong iframe của trang Xem thử / thẻ mẫu).
export default function Preview() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const t = getTemplate(slug)
  const [pi, setPi] = useState(Number(params.get('c')) || 0)
  const embed = params.get('embed') === '1'

  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'garaweb:palette' && Number.isInteger(e.data.index)) setPi(e.data.index)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  useEffect(() => {
    if (t) document.title = `${t.brand.name} ${t.brand.suffix}`.trim()
  }, [t])

  if (!t) return <p style={{ padding: 24 }}>Không tìm thấy mẫu “{slug}”.</p>

  return <TemplateSite t={t} palette={t.palettes[pi] || t.palettes[0]} embed={embed} />
}
