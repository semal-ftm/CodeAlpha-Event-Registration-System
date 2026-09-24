import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ConfirmDialog, EmptyState, Spinner } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMyRegistrations } from '../hooks/useMyRegistrations'
import { formatDateParts, formatLongDate, formatTime, formatTimestamp, isPast, relativeDays } from '../utils/format'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const { byEvent, loading: regsLoading, reload } = useMyRegistrations()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [soldOut, setSoldOut] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setLoadError('')
    api
      .getEvent(id)
      .then((data) => !cancelled && setEvent(data))
      .catch((err) => {
        if (cancelled) return
        if (err.status === 404) setNotFound(true)
        else setLoadError(err.message)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="container section center">
        <Spinner label="Loading event" />
      </div>
    )
  }

  if (notFound || loadError) {
    return (
      <div className="container section">
        <EmptyState
          icon="?"
          title={notFound ? 'Event not found' : 'Couldn’t load this event'}
          action={
            <Link to="/events" className="btn btn--primary">
              Back to events
            </Link>
          }
        >
          {notFound ? 'It may have been removed, or the link is wrong.' : loadError}
        </EmptyState>
      </div>
    )
  }

  const registration = byEvent.get(event.id)
  const past = isPast(event)
  const { day, month, year } = formatDateParts(event)

  async function handleRegister() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${event.id}` } })
      return
    }
    setBusy(true)
    try {
      await api.registerForEvent(event.id)
      await reload()
      toast.success(`You’re registered for “${event.title}”. See you there!`, 'Seat reserved')
    } catch (err) {
      if (/full/i.test(err.message)) setSoldOut(true)
      if (/already registered/i.test(err.message)) await reload()
      toast.error(err.message, 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    setBusy(true)
    try {
      await api.cancelRegistration(registration.id)
      await reload()
      setSoldOut(false)
      setConfirmOpen(false)
      toast.success(`Your registration for “${event.title}” was cancelled.`, 'Registration cancelled')
    } catch (err) {
      toast.error(err.message, 'Couldn’t cancel')
    } finally {
      setBusy(false)
    }
  }

  let action
  if (regsLoading) {
    action = <button className="btn btn--primary btn--block" disabled>Checking your ticket…</button>
  } else if (registration) {
    action = (
      <>
        <div className="pass">
          <span className="pass__check" aria-hidden="true">✓</span>
          <div>
            <strong>You’re on the list</strong>
            <small>Registered {formatTimestamp(registration.registered_at)}</small>
          </div>
        </div>
        <Link to="/my-registrations" className="btn btn--ghost btn--block">
          View my tickets
        </Link>
        {!past && (
          <button className="btn btn--link-danger" onClick={() => setConfirmOpen(true)} disabled={busy}>
            Cancel registration
          </button>
        )}
      </>
    )
  } else if (past) {
    action = <button className="btn btn--primary btn--block" disabled>This event has ended</button>
  } else if (soldOut) {
    action = <button className="btn btn--primary btn--block" disabled>Sold out</button>
  } else {
    action = (
      <button className="btn btn--primary btn--block btn--lg" onClick={handleRegister} disabled={busy}>
        {busy ? 'Reserving…' : isAuthenticated ? 'Reserve my seat' : 'Log in to register'}
      </button>
    )
  }

  return (
    <article className="container section detail">
      <Link to="/events" className="back-link">
        ← All events
      </Link>

      <div className="detail__grid">
        <div className="detail__main">
          <div className="detail__date-badge" aria-hidden="true">
            <span>{month}</span>
            <strong>{day}</strong>
            <span>{year}</span>
          </div>
          <p className="eyebrow">{past ? 'Past event' : relativeDays(event)}</p>
          <h1 className="display display--xl">{event.title}</h1>
          <div className={`prose${event.description.length > 160 ? ' prose--dropcap' : ''}`}>
            {event.description.split(/\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <aside className="detail__card">
          <div className="detail__card-head">
            <span>ADMIT ONE</span>
            <span>No. {String(event.id).padStart(4, '0')}</span>
          </div>
          <dl className="detail__facts">
            <div>
              <dt>Date</dt>
              <dd>{formatLongDate(event)}</dd>
            </div>
            <div>
              <dt>Starts</dt>
              <dd>{formatTime(event)}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <dt>Capacity</dt>
              <dd>{event.capacity} seats</dd>
            </div>
          </dl>
          <div className="detail__perf" aria-hidden="true" />
          <div className="detail__actions">{action}</div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this registration?"
        confirmLabel="Yes, cancel it"
        busy={busy}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      >
        You’ll give up your seat at <strong>{event.title}</strong>. You can register again later if seats are
        still available.
      </ConfirmDialog>
    </article>
  )
}
