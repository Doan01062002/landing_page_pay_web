// Ngữ cảnh dữ liệu website (thông tin thương hiệu, SEO, Kho mẫu, hỏi đáp) dùng chung cho mọi trang.
// Giá trị lấy từ window.__CA_BOOT__ (máy chủ nhúng vào) hoặc mặc định trong mã nguồn.
import { createContext, useContext, useMemo } from 'react'
import { defaultBootstrap } from '../data/bootstrap.js'
import { mergeCatalog } from '../data/catalog.js'

const Ctx = createContext(null)

export function SiteDataProvider({ boot, children }) {
  const value = useMemo(() => {
    const b = boot || defaultBootstrap()
    return { ...b, merged: mergeCatalog(b.catalog) }
  }, [boot])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

const useBoot = () => useContext(Ctx) || fallback()
let cached
function fallback() {
  if (!cached) {
    const b = defaultBootstrap()
    cached = { ...b, merged: mergeCatalog(null) }
  }
  return cached
}

export const useSite = () => useBoot().site
export const useSeoDefaults = () => useBoot().seo
export const useFaqs = () => useBoot().faqs
// { templates, projects } đã áp phần quản trị (ẩn / đổi giá / sắp xếp)
export const useCatalog = () => useBoot().merged

// Dữ liệu khởi động phía trình duyệt
export function readBoot() {
  if (typeof window === 'undefined') return null
  return window.__CA_BOOT__ || null
}
