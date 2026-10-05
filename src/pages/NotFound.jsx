import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap" style={{ display: 'grid', gap: 16, justifyItems: 'start', maxWidth: 640 }}>
        <p className="eyebrow">Lỗi 404</p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 48 }}>Không tìm thấy trang này</h1>
        <p style={{ color: 'var(--ink-2)' }}>Đường dẫn có thể đã thay đổi. Bạn có thể quay về kho mẫu để xem các mẫu website hiện có.</p>
        <Link to="/mau-website" className="btn btn--primary">
          Về kho mẫu
        </Link>
      </div>
    </section>
  )
}
