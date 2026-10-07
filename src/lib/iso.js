import { useEffect, useLayoutEffect } from 'react'

// useLayoutEffect trên trình duyệt, useEffect khi dựng phía máy chủ (tránh cảnh báo SSR)
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
