import { motionAllowed } from './Motion.jsx'

// Trạng thái màn mở đầu logo (IntroSplash), dùng chung cho các phần cần chờ logo chạy xong (vd LivePreview).

// trang có màn mở đầu → khoá sessionStorage đánh dấu đã xem
const PAGES = { '/': 'chungauto_intro', '/mau-phan-mem': 'chungauto_intro_kho' }

// bỏ dấu "/" cuối (trừ trang chủ "/")
export const introKey = () => PAGES[window.location.pathname.replace(/(.)\/$/, '$1')]

// Màn mở đầu sẽ chạy ở lần hiển thị này? (tính được ngay lúc render, trước khi IntroSplash đánh dấu đã xem)
export function introWillPlay() {
  if (typeof window === 'undefined' || !introKey() || !motionAllowed()) return false
  if (new URLSearchParams(window.location.search).get('intro') === '1') return true
  try {
    return !sessionStorage.getItem(introKey())
  } catch {
    return true
  }
}

export const INTRO_DONE = 'chungauto:intro-done'
// đang chạy màn mở đầu (IntroSplash gắn class này lên <html> cho tới khi xong)
export const introRunning = () => document.documentElement.classList.contains('intro-hold')
