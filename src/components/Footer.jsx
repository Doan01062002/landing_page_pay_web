import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import { useSite } from '../lib/siteData.jsx'
import { categories } from '../data/templates.js'

export default function Footer() {
  const site = useSite()
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p>Phần mềm và landing page cho gara ô tô, tiệm sửa xe máy, đại lý ô tô, showroom xe cũ và cửa hàng phụ tùng. Một dịch vụ của hệ thống {site.showrooms} showroom {site.brand} trên toàn quốc.</p>
        </div>
        <div>
          <h2 className="site-footer__h">Kho mẫu</h2>
          <ul>
            {categories.slice(1).map((c) => (
              <li key={c.id}>
                <Link to={`/mau-phan-mem?loai=${c.id}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="site-footer__h">Dịch vụ</h2>
          <ul>
            <li><Link to="/#bang-gia">Bảng giá triển khai</Link></li>
            <li><Link to="/mau-landing-page">Mẫu landing page tặng kèm</Link></li>
            <li><Link to="/mau-phan-mem?ht=rieng">Mẫu website dựng riêng</Link></li>
            <li><Link to="/#quy-trinh">Quy trình 3 ngày</Link></li>
            <li><Link to="/#hoi-dap">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="site-footer__h">Liên hệ</h2>
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
