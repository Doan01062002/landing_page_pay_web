// Ghép dữ liệu Kho mẫu trong mã nguồn (giao diện, bộ màu, nội dung trang mẫu) với phần quản trị sửa được
// (tên, giá, mô tả ngắn, hiển thị, thứ tự, nhãn "Mới") lấy từ database.
import { templates as baseTemplates } from './templates.js'
import { projects as baseProjects } from './projects.js'

// overrides: { templates: { [slug]: {...} }, projects: { [slug]: {...} } } hoặc null
export function mergeCatalog(overrides) {
  if (!overrides) return { templates: baseTemplates, projects: baseProjects }
  const t = overrides.templates || {}
  const p = overrides.projects || {}
  const templates = baseTemplates
    .map((x) => {
      const o = t[x.slug]
      if (!o) return x
      return {
        ...x,
        name: o.name || x.name,
        price: o.price ?? x.price,
        free: o.free ?? x.free,
        isNew: o.isNew ?? x.isNew,
        popularity: o.popularity ?? x.popularity,
        tagline: o.summary || x.tagline,
        featured: !!o.featured,
        visible: o.visible !== false,
      }
    })
    .filter((x) => x.visible !== false)
  const projects = baseProjects
    .map((x, i) => {
      const o = p[x.slug]
      if (!o) return { ...x, sortOrder: i }
      return { ...x, name: o.name || x.name, summary: o.summary || x.summary, visible: o.visible !== false, featured: !!o.featured, sortOrder: o.sortOrder ?? i }
    })
    .filter((x) => x.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  return { templates, projects }
}
