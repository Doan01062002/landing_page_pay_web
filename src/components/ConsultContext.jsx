import { createContext, useCallback, useContext, useState } from 'react'
import ConsultModal from './ConsultModal.jsx'

const ConsultCtx = createContext({ open: () => {} })

export function ConsultProvider({ children }) {
  const [state, setState] = useState({ open: false, template: '' })
  const open = useCallback((template = '') => setState({ open: true, template }), [])
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  return (
    <ConsultCtx.Provider value={{ open }}>
      {children}
      {state.open && <ConsultModal template={state.template} onClose={close} />}
    </ConsultCtx.Provider>
  )
}

export const useConsult = () => useContext(ConsultCtx)
