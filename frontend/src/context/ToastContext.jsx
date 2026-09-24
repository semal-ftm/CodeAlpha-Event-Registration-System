import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '✓', error: '!', info: 'i' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message, title) => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, type, message, title }])
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000)
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message, title = 'Done') => push('success', message, title),
      error: (message, title = 'Something went wrong') => push('error', message, title),
      info: (message, title = 'Heads up') => push('info', message, title),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <span className="toast__icon" aria-hidden="true">
              {ICONS[t.type]}
            </span>
            <div className="toast__body">
              <strong>{t.title}</strong>
              <p>{t.message}</p>
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
