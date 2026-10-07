import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import LpCard from '../components/LpCard.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { landings } from '../data/landings.js'
import { formatVND } from '../data/site.js'
import { useSite } from '../lib/siteData.jsx'
import { Seo, ld, useOrigin } from '../lib/seo.jsx'
import '../styles/gallery.css'

const perks = [
  { icon: 'Play', title: 'Video quảng cáo của xưởng', text: 'Gắn video bạn quay tại xưởng: video nền tự phát, thư viện video xem toàn màn hình.' },
  { icon: 'Eye', title: 'Bộ ảnh xưởng', text: 'Ảnh khu tiếp nhận, khu sửa chữa, xe sau khi làm. Bấm để phóng to, vuốt để xem tiếp.' },
  { icon: 'Timer', title: 'Đếm ngược & số suất', text: 'Hạn chót ưu đãi chạy theo giây, thanh số suất còn lại thúc khách đăng ký sớm.' },
  { icon: 'Target', title: 'Form thu số điện thoại', text: 'Tối giản 4 ô, trả mã ưu đãi ngay sau khi đăng ký. Gắn sẵn mã đo lường quảng cáo.' },
]

export default function LpGallery() {
  const site = useSite()
  const { open } = useConsult()
  const origin = useOrigin()
  return (
    <>
      <Seo
        title="Mẫu landing page quảng cáo tặng kèm"
        description={`Landing page quảng cáo một chương trình (thay dầu, kiểm tra xe, khuyến mãi…) có form thu số điện thoại, tặng kèm khi triển khai phần mềm, trị giá ${formatVND(site.promo.giftValue)}.`}
        path="/mau-landing-page"
        jsonLd={[ld.breadcrumb(origin, [['Trang chủ', '/'], ['Landing tặng kèm', '/mau-landing-page']])]}
      />
      <section className="g-hero">
        <div className="wrap g-hero__inner">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span aria-current="page">Mẫu landing page tặng kèm</span>
          </nav>
          <h1>Mẫu landing page tặng kèm</h1>
          <p>
            Triển khai phần mềm, bạn được tặng 1 landing page quảng cáo trị giá {formatVND(site.promo.giftValue)}. Chọn 1 trong{' '}
            {landings.length} mẫu dưới đây. Chúng tôi thay video, ảnh xưởng và ưu đãi bằng nội dung thật của gara bạn.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap lpg">
          {landings.map((lp) => (
            <div key={lp.slug} data-reveal="up">
              <LpCard lp={lp} />
            </div>
          ))}
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow">Mẫu nào cũng có</p>
            <h2>Tối giản, một mục tiêu: lấy số điện thoại khách</h2>
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
            <h2>Có video quay tại xưởng? Gửi cho chúng tôi.</h2>
            <p>Video điện thoại quay dọc hay ngang đều được. Chúng tôi cắt, nén và gắn vào landing page cho bạn.</p>
          </div>
          <button type="button" className="btn btn--signal btn--lg" onClick={() => open()}>
            Nhận landing page miễn phí
          </button>
        </div>
      </section>
    </>
  )
}
