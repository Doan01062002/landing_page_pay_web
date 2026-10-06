import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import { site } from '../data/site.js'
import { categories } from '../data/templates.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>Phần mềm và landing page cho gara ô tô, tiệm sửa xe máy, đại lý ô tô, showroom xe cũ và cửa hàng phụ tùng. Một dịch vụ của hệ thống {site.showrooms} showroom {site.brand} trên toàn quốc.</p>
        </div>
        <div>
          <h4>Kho mẫu</h4>
          <ul>
            {categories.slice(1).map((c) => (
              <li key={c.id}>
                <Link to={`/mau-phan-mem?loai=${c.id}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Dịch vụ</h4>
          <ul>
            <li><Link to="/#bang-gia">Bảng giá triển khai</Link></li>
            <li><Link to="/mau-landing-page">Mẫu landing page tặng kèm</Link></li>
            <li><Link to="/du-an">Dự án đã triển khai</Link></li>
            <li><Link to="/#quy-trinh">Quy trình 7 ngày</Link></li>
            <li><Link to="/#hoi-dap">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <ul className="site-footer__contact">
            <li><Icon name="Phone" size={16} /> Hotline: {site.hotline}</li>
            <li><Icon name="MessageCircle" size={16} /> <a href={site.zaloUrl} target="_blank" rel="noreferrer">{site.zalo}</a></li>
            <li><Icon name="FileText" size={16} /> <a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><Icon name="MapPin" size={16} /> {site.address}</li>
          </ul>
        </div>
      </div>
      <div className="wrap site-footer__bottom">
        <span>© 2026 {site.domain} · {site.company}</span>
        <span>Mẫu phần mềm dùng dữ liệu minh họa. Ảnh: StockSnap (CC0), Wikimedia Commons (CC BY-SA)</span>
      </div>
    </footer>
  )
}
