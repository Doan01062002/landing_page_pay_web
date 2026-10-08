import { useRef, useState } from 'react'
import { useIsoLayoutEffect } from '../lib/iso.js'
import { introKey, introWillPlay, INTRO_DONE } from './introState.js'
import '../styles/intro.css'

/*
  Màn mở đầu trang chủ và Kho mẫu (giống landing VinFast): logo hiện giữa màn hình — hình xe chạy vào, chữ mở ra,
  vệt tốc độ lướt qua — rồi thu nhỏ bay đúng vào chỗ logo trên thanh menu. Hero đã dựng sẵn phía sau nền trắng
  (ảnh đã tải, giải mã) và lộ ra khi nền mờ dần, nên logo vào chỗ là hero đã hiện đủ.
  - Chạy một lần mỗi phiên trình duyệt cho mỗi trang (PAGES); thêm ?intro=1 vào link để xem lại.
  - App gắn key theo đường dẫn nên chuyển sang Kho mẫu lần đầu trong phiên cũng chạy.
  - Không chạy trong ảnh thu nhỏ (embed=1). Bấm hoặc nhấn phím bất kỳ để bỏ qua.
  - Dùng Web Animations API (chỉ transform / opacity / clip-path), không cần thư viện.
*/
// Logo vector dò từ /brand/logo-mobile.png (cùng khung 227 × 65): hình xe, chữ CHUNGAUTO.VN, hai gạch đỏ
const LOGO_SVG = '/brand/logo-vector.svg'
const EASE = 'cubic-bezier(.65,0,.35,1)'
const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)'

// Báo logo đã vào chỗ: LivePreview bắt đầu tải iframe
const announceDone = () => window.dispatchEvent(new Event(INTRO_DONE))

// Hero hiện ra sau nền trắng khi logo bay: chờ ảnh các thẻ đang hiện tải + giải mã xong (tối đa `ms`) để không lộ thẻ trống.
// Trang không có thẻ hero (Kho mẫu) thì xong ngay.
const heroImagesReady = (ms) => {
  const imgs = [...document.querySelectorAll('.hx-card img[src]')]
  if (!imgs.length) return Promise.resolve()
  return Promise.race([Promise.allSettled(imgs.map((img) => img.decode())), new Promise((r) => setTimeout(r, ms))])
}

export default function IntroSplash() {
  // false cả lúc dựng phía máy chủ lẫn lần hydrate đầu (HTML khớp nhau); bật ngay trước lần vẽ đầu nếu cần chạy.
  // Trước khi JS tải xong, script trong <head> (index.html) đã che trang bằng lớp html.intro-pre.
  const [on, setOn] = useState(false)
  const rootRef = useRef(null)

  useIsoLayoutEffect(() => {
    if (introWillPlay()) setOn(true)
    else document.documentElement.classList.remove('intro-pre', 'intro-hold')
  }, [])

  useIsoLayoutEffect(() => {
    if (!on) return
    const html = document.documentElement
    html.classList.remove('intro-pre')
    html.classList.add('intro-hold')
    window.scrollTo(0, 0)
    try {
      sessionStorage.setItem(introKey(), '1')
    } catch {
      /* chế độ ẩn danh: bỏ qua */
    }

    const root = rootRef.current
    const bg = root.querySelector('.intro__bg')
    const mark = root.querySelector('.intro__mark') // lớp ngoài: bay vào menu (gốc biến đổi góc trên trái)
    const logo = root.querySelector('.intro__logo') // lớp trong: phóng nhẹ lúc xuất hiện (gốc ở giữa)
    const car = root.querySelector('.intro__car')
    const text = root.querySelector('.intro__text')
    const line = root.querySelector('.intro__line')
    const anims = []
    const run = (el, frames, opts) => {
      const a = el.animate(frames, { fill: 'both', ...opts })
      anims.push(a)
      return a
    }
    let done = false
    let dead = false // đã gỡ khỏi trang (đổi trang giữa chừng): không chạy tiếp
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(flyTimer)
      // ẩn lớp phủ TRƯỚC khi huỷ hiệu ứng: nếu huỷ trước, logo nhảy về cỡ lớn giữa màn hình trong 1 khung hình (bị "nháy")
      root.style.visibility = 'hidden'
      anims.forEach((a) => a.cancel())
      html.classList.remove('intro-hold')
      setOn(false)
      announceDone()
    }

    // 1) logo hiện: hình xe "chạy" vào từ trái, chữ mở ra, vệt tốc độ lướt dưới chân
    run(logo, [{ transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 1500, easing: EASE_OUT })
    run(car, [{ clipPath: 'inset(0 100% 62% 0)' }, { clipPath: 'inset(0 0 62% 0)' }], { duration: 650, delay: 120, easing: EASE })
    run(text, [{ clipPath: 'inset(36% 100% 0 0)' }, { clipPath: 'inset(36% 0 0 0)' }], { duration: 750, delay: 560, easing: EASE })
    run(
      line,
      [
        { transform: 'scaleX(0)', opacity: 1 },
        { transform: 'scaleX(1)', opacity: 1, offset: 0.55 },
        { transform: 'scaleX(1) translateX(30%)', opacity: 0 },
      ],
      { duration: 900, delay: 820, easing: EASE },
    )

    // 2) thu nhỏ, bay đúng vào logo trên menu; nền trắng mờ dần để lộ trang (hero đã sẵn sàng phía sau)
    const fly = () => {
      if (done || dead) return
      const target = document.querySelector('.site-header__logo .logo__img')
      if (!target) return finish()
      const from = mark.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      const s = to.width / from.width
      const tx = to.left - from.left
      const ty = to.top - from.top
      run(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 150, easing: 'ease' })
      run(mark, [{ transform: 'none' }, { transform: `translate(${tx}px, ${ty}px) scale(${s})` }], {
        duration: 850,
        easing: EASE,
      }).finished.then(finish, () => {})
    }
    // đủ 1,8 giây xem logo thì bay; nếu ảnh hero chưa kịp thì chờ thêm tối đa 1,2 giây (mạng chậm) rồi bay luôn
    const flyTimer = setTimeout(() => heroImagesReady(1200).then(fly), 1800)

    // bỏ qua
    const skip = () => finish()
    root.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      dead = true
      root.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      clearTimeout(flyTimer)
      anims.forEach((a) => a.cancel())
      html.classList.remove('intro-hold')
    }
  }, [on])

  if (!on) return null
  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro__bg" />
      <div className="intro__mark">
        {/* logo vector (dò lại từ logo gốc) để phóng to vẫn nét; dòng chữ nhỏ viết bằng chữ thật */}
        <div className="intro__logo">
          <img className="intro__car" src={LOGO_SVG} alt="" width="227" height="65" />
          <div className="intro__text">
            <img src={LOGO_SVG} alt="" width="227" height="65" />
            <span className="intro__tag">Phụ kiện ô tô</span>
          </div>
          <span className="intro__line" />
        </div>
      </div>
    </div>
  )
}
