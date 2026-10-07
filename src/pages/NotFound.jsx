import { Link } from 'react-router-dom'
import { Seo } from '../lib/seo.jsx'
import { useHttpStatus } from '../lib/status.jsx'

export default function NotFound() {
  useHttpStatus(404)
  return (
    <section className="section">
      <Seo title="Không tìm thấy trang" noindex />
      <div className="wrap" style={{ display: 'grid', gap: 16, justifyItems: 'start', maxWidth: 640 }}>
        <p className="eyebrow">Lỗi 404</p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48 }}>Không tìm thấy trang này</h1>
        <p style={{ color: 'var(--ink-2)' }}>Đường dẫn có thể đã thay đổi. Bạn có thể quay về kho mẫu để xem các mẫu phần mềm hiện có.</p>
        <Link to="/mau-phan-mem" className="btn btn--primary">
          Về kho mẫu
        </Link>
      </div>
    </section>
  )
}
