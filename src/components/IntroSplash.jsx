import { useLayoutEffect, useRef, useState } from 'react'
import { site } from '../data/site.js'
import { motionAllowed } from './Motion.jsx'
import '../styles/intro.css'

/*
  Màn mở đầu trang chủ (giống landing VinFast): logo hiện giữa màn hình — hình xe chạy vào, chữ mở ra,
  vệt tốc độ lướt qua — rồi thu nhỏ bay đúng vào chỗ logo trên thanh menu; sau đó phần hero hiện lần lượt.
  - Chạy một lần mỗi phiên trình duyệt; thêm ?intro=1 vào link để xem lại.
  - Không chạy trong ảnh thu nhỏ (embed=1). Bấm hoặc nhấn phím bất kỳ để bỏ qua.
  - Dùng Web Animations API (chỉ transform / opacity / clip-path), không cần thư viện.
*/
const KEY = 'chungauto_intro'
const EASE = 'cubic-bezier(.65,0,.35,1)'
const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)'

function shouldPlay() {
  if (typeof window === 'undefined' || window.location.pathname !== '/' || !motionAllowed()) return false
  if (new URLSearchParams(window.location.search).get('intro') === '1') return true
  try {
    return !sessionStorage.getItem(KEY)
  } catch {
    return true
  }
}

// Báo cho hero biết logo đã vào chỗ: hero (HomeHero) tự chạy hiệu ứng hiện chữ, vòng thẻ, khung trình duyệt
const announceDone = () => window.dispatchEvent(new Event('chungauto:intro-done'))

export default function IntroSplash() {
  const [on, setOn] = useState(shouldPlay)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (!on) return
    const html = document.documentElement
    html.classList.add('intro-hold')
    window.scrollTo(0, 0)
    try {
      sessionStorage.setItem(KEY, '1')
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
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(flyTimer)
      anims.forEach((a) => a.cancel())
      html.classList.remove('intro-hold')
      setOn(false)
      announceDone() // cùng lượt với việc bỏ intro-hold: hero bắt đầu từ trạng thái ẩn, không loé
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

    // 2) thu nhỏ, bay đúng vào logo trên menu; nền trắng mờ dần để lộ trang
    const fly = () => {
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
    const flyTimer = setTimeout(fly, 1800)

    // bỏ qua
    const skip = () => finish()
    root.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
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
        <div className="intro__logo">
          <img className="intro__car" src={site.logo} alt="" width="227" height="65" />
          <img className="intro__text" src={site.logo} alt="" width="227" height="65" />
          <span className="intro__line" />
        </div>
      </div>
    </div>
  )
}
