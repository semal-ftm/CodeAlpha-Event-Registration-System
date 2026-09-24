import { useEffect, useRef } from 'react'

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner" role="status">
      <span className="spinner__dot" />
      <span className="spinner__dot" />
      <span className="spinner__dot" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function TicketSkeleton({ count = 3 }) {
  return (
    <div className="ticket-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ticket ticket--skeleton">
          <div className="ticket__stub" />
          <div className="ticket__main">
            <span className="skeleton-line w-40" />
            <span className="skeleton-line w-80 tall" />
            <span className="skeleton-line w-60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon = '◌', title, children, action }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function InlineAlert({ type = 'error', children }) {
  if (!children) return null
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', busy, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel()
      }}
    >
      <div className="dialog__body">
        <h3>{title}</h3>
        <div className="dialog__text">{children}</div>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Keep it
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
