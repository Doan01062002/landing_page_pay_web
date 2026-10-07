// Mã trạng thái HTTP cho trang dựng phía máy chủ (vd trang 404 trả về 404 thật, tốt cho SEO).
import { createContext, useContext } from 'react'

const StatusCtx = createContext(null)
export const StatusProvider = ({ value, children }) => <StatusCtx.Provider value={value}>{children}</StatusCtx.Provider>

export function useHttpStatus(code) {
  const s = useContext(StatusCtx)
  if (s) s.code = code
}
