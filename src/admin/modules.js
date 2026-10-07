// Tên và biểu tượng các chức năng trên thanh bên (trang đặc biệt + trang danh sách lấy từ schemas.jsx).
import { BarChart3, FileText, LayoutDashboard, PanelsTopLeft, Settings, UserCog } from 'lucide-react'
import { getSchema } from './schemas.jsx'

const SPECIAL = {
  dashboard: { label: 'Tổng quan', icon: LayoutDashboard },
  reports: { label: 'Báo cáo', icon: BarChart3 },
  content: { label: 'Nội dung website', icon: PanelsTopLeft },
  settings: { label: 'Cài đặt', icon: Settings },
  staff: { label: 'Nhân viên & phân quyền', icon: UserCog },
}

export function moduleMeta(site, id, store) {
  if (SPECIAL[id]) return SPECIAL[id]
  const s = getSchema(id, { site, store, read: (c) => store?.read(c) || [] })
  return s ? { label: s.label, icon: s.icon } : { label: id, icon: FileText }
}
export const moduleLabel = (site, id) => moduleMeta(site, id).label
