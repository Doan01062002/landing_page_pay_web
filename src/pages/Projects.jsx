import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { projects, projectTypes } from '../data/projects.js'
import '../styles/gallery.css'

const perks = [
  { icon: 'Store', title: 'Nội dung thật của cơ sở', text: 'Ảnh xưởng, đội thợ, mặt tiền, video do gara tự quay. Không dùng ảnh mạng.' },
  { icon: 'Smartphone', title: 'Chạy mượt trên điện thoại', text: 'Phần lớn khách đến từ quảng cáo trên điện thoại: nút gọi, Zalo, chỉ đường luôn trong tầm tay.' },
  { icon: 'CalendarCheck', title: 'Form đặt lịch nhanh', text: 'Khách để lại số điện thoại, chọn dịch vụ và giờ hẹn trong 30 giây.' },
  { icon: 'Zap', title: 'Bàn giao trong vài ngày', text: 'Gửi link cho chủ gara xem trước, chỉnh theo góp ý rồi trỏ tên miền riêng.' },
]

export default function Projects() {
  const { open } = useConsult()
  const [params, setParams] = useSearchParams()
  const type = params.get('loai') || 'all'

  // Chỉ hiện các loại đã có dự án
  const tabs = useMemo(
    () =>
      projectTypes
        .map((t) => ({ ...t, count: t.id === 'all' ? projects.length : projects.filter((p) => p.type === t.id).length }))
        .filter((t) => t.count > 0),
    [],
  )
  const list = type === 'all' ? projects : projects.filter((p) => p.type === type)

  return (
    <>
      <section className="g-hero">
        <div className="wrap g-hero__inner">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span aria-current="page">Dự án đã triển khai</span>
          </nav>
          <h1>Dự án đã triển khai</h1>
          <p>
            Website, landing page và phần mềm chúng tôi đã làm cho gara thật. Mỗi dự án chạy trên đường dẫn riêng: bấm “Xem thử” để xem
            trên máy tính và điện thoại, hoặc sao chép link gửi thẳng cho chủ cơ sở.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {tabs.length > 2 && (
            <div className="pj-tabs" role="tablist" aria-label="Loại dự án">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={type === t.id}
                  className={'pj-tabs__btn' + (type === t.id ? ' is-active' : '')}
                  onClick={() => setParams(t.id === 'all' ? {} : { loai: t.id }, { replace: true })}
                >
                  {t.label} <span>{t.count}</span>
                </button>
              ))}
            </div>
          )}
          <div className="lpg">
            {list.map((p) => (
              <div key={p.slug} data-reveal="up">
                <ProjectCard p={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow">Dự án nào cũng có</p>
            <h2>Làm cho gara thật, khách thật</h2>
          </div>
          <div className="lpg-perks" data-stagger="up">
            {perks.map((p) => (
              <article key={p.title}>
                <Icon name={p.icon} size={22} />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="g-cta">
        <div className="wrap g-cta__inner">
          <div>
            <h2>Muốn gara của bạn có trang như thế này?</h2>
            <p>Gửi ảnh xưởng, số hotline và địa chỉ. Chúng tôi dựng bản xem trước để bạn duyệt trước khi trả tiền.</p>
          </div>
          <button type="button" className="btn btn--signal btn--lg" onClick={() => open('Dự án tương tự đã triển khai')}>
            Nhận tư vấn miễn phí
          </button>
        </div>
      </section>
    </>
  )
}
