import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TemplateSite from '../templates/TemplateSite.jsx'
import { getTemplate } from '../data/templates.js'
import { PAGE_META } from '../templates/pages.jsx'

// Website mẫu chạy độc lập (thường nằm trong iframe của trang Xem thử / thẻ mẫu).
// Đường dẫn: /preview/:slug hoặc /preview/:slug/:page (vd: /preview/autopro/bang-gia)
export default function Preview() {
  const { slug, page = '' } = useParams()
  const [params] = useSearchParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const t = getTemplate(slug)
  const [pi, setPi] = useState(Number(params.get('c')) || 0)
  const embed = params.get('embed') === '1'
  const base = `/preview/${slug}`

  // Nhận lệnh từ trang Xem thử: đổi bộ màu, chuyển trang
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'garaweb:palette' && Number.isInteger(e.data.index)) setPi(e.data.index)
      if (e.data?.type === 'garaweb:navigate' && typeof e.data.page === 'string') navigate((e.data.page ? `${base}/${e.data.page}` : base) + window.location.search)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [base, navigate])

  // Báo cho trang Xem thử biết đang ở trang nào
  useEffect(() => {
    if (window.parent !== window) window.parent.postMessage({ type: 'garaweb:route', page }, window.location.origin)
  }, [page])

  // Mẫu dựng riêng chạy dạng trang tĩnh → chuyển sang trang đó
  useEffect(() => {
    if (t?.url) window.location.replace(t.url)
  }, [t])

  useEffect(() => {
    if (!t || t.url) return
    const name = `${t.brand.name} ${t.brand.suffix}`.trim()
    document.title = page && PAGE_META[page] ? `${PAGE_META[page].label} – ${name}` : name
  }, [t, page])

  if (!t) return <p style={{ padding: 24 }}>Không tìm thấy mẫu “{slug}”.</p>
  if (t.url) return null

  return <TemplateSite t={t} palette={t.palettes[pi] || t.palettes[0]} embed={embed} page={page} base={base} search={search} />
}
