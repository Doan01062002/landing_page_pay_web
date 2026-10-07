import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import FloatingContact from './components/FloatingContact.jsx'
import IntroSplash from './components/IntroSplash.jsx'
import { ConsultProvider } from './components/ConsultContext.jsx'
import { RevealManager, ScrollProgress } from './components/Motion.jsx'
import Landing from './pages/Landing.jsx'
import Gallery from './pages/Gallery.jsx'
import TemplateDetail from './pages/TemplateDetail.jsx'
import Demo from './pages/Demo.jsx'
import Preview from './pages/Preview.jsx'
import NotFound from './pages/NotFound.jsx'
import LpGallery from './pages/LpGallery.jsx'
import LpPreview from './pages/LpPreview.jsx'

// Trang quản trị demo của từng mẫu: tải riêng khi mở /quan-tri
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
// Trang quản trị thật của ChungAuto (đăng nhập, dữ liệu trên máy chủ): /admin
const CaAdminApp = lazy(() => import('./caadmin/CaAdminApp.jsx'))

// Cuộn lên đầu khi đổi trang, hoặc tới #section nếu URL có hash.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// Link cũ /mau-website/... (đã chia sẻ trước khi đổi tên) chuyển sang /mau-phan-mem/...
function RedirectOld() {
  const { pathname, search } = useLocation()
  return <Navigate to={pathname.replace('/mau-website', '/mau-phan-mem') + search} replace />
}

function SiteLayout() {
  const { pathname } = useLocation()
  return (
    <>
      {/* màn mở đầu: trang chủ và Kho mẫu, mỗi trang một lần mỗi phiên (?intro=1 để xem lại) */}
      <IntroSplash key={pathname} />
      <ScrollProgress />
      <Header />
      {/* key theo đường dẫn để chạy hiệu ứng chuyển trang */}
      <main className="page" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
    </>
  )
}

export default function App() {
  return (
    <ConsultProvider>
      <ScrollManager />
      <RevealManager />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/mau-phan-mem" element={<Gallery />} />
          <Route path="/mau-phan-mem/:slug" element={<TemplateDetail />} />
          {/* Đường dẫn cũ: tự chuyển sang /mau-phan-mem */}
          <Route path="/mau-website/*" element={<RedirectOld />} />
          <Route path="/mau-landing-page" element={<LpGallery />} />
          {/* Danh sách dự án đã gộp vào Kho mẫu (mẫu dựng riêng); trang của từng mẫu vẫn là file tĩnh /du-an/<slug>/ */}
          <Route path="/du-an" element={<Navigate to="/mau-phan-mem?ht=rieng" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Trang xem thử toàn màn hình và trang mẫu chạy trong iframe */}
        <Route path="/demo/:slug" element={<Demo />} />
        <Route path="/demo-landing/:slug" element={<Demo kind="landing" />} />
        <Route path="/demo-du-an/:slug" element={<Demo kind="project" />} />
        <Route path="/lp/:slug" element={<LpPreview />} />
        <Route path="/preview/:slug/:page?" element={<Preview />} />
        <Route
          path="/quan-tri/*"
          element={
            <Suspense fallback={<div className="adm-loading">Đang tải trang quản trị…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="adm-loading">Đang tải trang quản trị…</div>}>
              <CaAdminApp />
            </Suspense>
          }
        />
      </Routes>
    </ConsultProvider>
  )
}
