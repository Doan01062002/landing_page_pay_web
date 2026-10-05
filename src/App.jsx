import { useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import FloatingContact from './components/FloatingContact.jsx'
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

function SiteLayout() {
  const { pathname } = useLocation()
  return (
    <>
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
          <Route path="/mau-website" element={<Gallery />} />
          <Route path="/mau-website/:slug" element={<TemplateDetail />} />
          <Route path="/mau-landing-page" element={<LpGallery />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Trang xem thử toàn màn hình và trang mẫu chạy trong iframe */}
        <Route path="/demo/:slug" element={<Demo />} />
        <Route path="/demo-landing/:slug" element={<Demo kind="landing" />} />
        <Route path="/lp/:slug" element={<LpPreview />} />
        <Route path="/preview/:slug" element={<Preview />} />
      </Routes>
    </ConsultProvider>
  )
}
