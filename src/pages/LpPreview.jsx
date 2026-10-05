import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import LandingSite from '../landings/LandingSite.jsx'
import { getLanding } from '../data/landings.js'

// Landing page quà tặng chạy độc lập (thường nằm trong iframe của trang xem thử / thẻ mẫu).
export default function LpPreview() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const lp = getLanding(slug)
  const embed = params.get('embed') === '1'

  useEffect(() => {
    if (lp) document.title = `${lp.hero.title.join(' ')} – ${lp.brand.name}`
  }, [lp])

  if (!lp) return <p style={{ padding: 24 }}>Không tìm thấy mẫu landing page “{slug}”.</p>
  return <LandingSite lp={lp} embed={embed} />
}
