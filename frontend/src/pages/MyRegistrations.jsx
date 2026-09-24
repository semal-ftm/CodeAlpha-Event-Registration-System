import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ConfirmDialog, EmptyState, InlineAlert, TicketSkeleton } from '../components/Feedback'
import { useToast } from '../context/ToastContext'
import { useMyRegistrations } from '../hooks/useMyRegistrations'
import { eventDateTime, formatDateParts, formatTime, formatTimestamp, isPast, relativeDays, ticketCode } from '../utils/format'

function Barcode({ seed }) {
  // Decorative bars generated from the ticket code so each ticket looks distinct.
  const bars = Array.from(seed + seed, (ch, i) => ((ch.charCodeAt(0) + i) % 4) + 1)
  return (
    <span className="barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <i key={i} style={{ width: w }} />
      ))}
    </span>
  )
}

function RegistrationTicket({ registration, event, onCancel, index }) {
  const code = ticketCode(registration)
  const past = event ? isPast(event) : false
  const parts = event ? formatDateParts(event) : null

  return (
    <li className={`pass-ticket${past ? ' pass-ticket--past' : ''}`} style={{ '--i': index }}>
      <div className="pass-ticket__main">
        <div className="pass-ticket__top">
          <span className="chip">{event ? (past ? 'Attended' : relativeDays(event)) : 'Event'}</span>
          <span className="mono muted">{code}</span>
        </div>
        <h3>
          <Link to={`/events/${registration.event}`}>{event?.title ?? registration.event_title}</Link>
        </h3>
        {event && (
          <dl className="pass-ticket__facts">
            <div>
              <dt>When</dt>
              <dd>
                {parts.weekday}, {parts.month} {parts.day} · {formatTime(event)}
              </dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{event.location}</dd>
            </div>
          </dl>
        )}
        <p className="muted small">Registered {formatTimestamp(registration.registered_at)}</p>
      </div>

      <div className="pass-ticket__stub">
        <Barcode seed={code} />
        {past ? (
          <span className="stamp">Used</span>
        ) : (
          <button className="btn btn--ghost btn--sm" onClick={() => onCancel(registration, event)}>
            Cancel
          </button>
        )}
      </div>
    </li>
  )
}

export default function MyRegistrations() {
  const toast = useToast()
  const { registrations, loading, error, reload } = useMyRegistrations()
  const [eventsById, setEventsById] = useState(new Map())
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  // Registrations only carry the event id and title, so join in the full event details.
  useEffect(() => {
    api
      .listEvents()
      .then((list) => setEventsById(new Map(list.map((e) => [e.id, e]))))
      .catch(() => {})
  }, [])

  const { upcoming, past } = useMemo(() => {
    const withEvents = registrations.map((r) => ({ r, e: eventsById.get(r.event) }))
    withEvents.sort((a, b) => (a.e && b.e ? eventDateTime(a.e) - eventDateTime(b.e) : 0))
    return {
      upcoming: withEvents.filter(({ e }) => !e || !isPast(e)),
      past: withEvents.filter(({ e }) => e && isPast(e)).reverse(),
    }
  }, [registrations, eventsById])

  async function confirmCancel() {
    setBusy(true)
    try {
      await api.cancelRegistration(pending.registration.id)
      toast.success(`Your seat at “${pending.title}” has been released.`, 'Registration cancelled')
      setPending(null)
      await reload()
    } catch (err) {
      toast.error(err.message, 'Couldn’t cancel')
    } finally {
      setBusy(false)
    }
  }

  const openCancel = (registration, event) =>
    setPending({ registration, title: event?.title ?? registration.event_title })

  return (
    <section className="container section">
      <header className="page-head">
        <div>
          <p className="eyebrow">Your wallet</p>
          <h1 className="display">My tickets</h1>
        </div>
        {!loading && registrations.length > 0 && (
          <p className="page-head__count">
            <strong>{upcoming.length}</strong> upcoming · <strong>{past.length}</strong> past
          </p>
        )}
      </header>

      {error ? (
        <div className="stack">
          <InlineAlert>{error}</InlineAlert>
          <button className="btn btn--ghost" onClick={reload}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <TicketSkeleton count={2} />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon="🎟"
          title="No tickets yet"
          action={
            <Link to="/events" className="btn btn--primary">
              Browse events
            </Link>
          }
        >
          When you register for an event, your ticket will show up here.
        </EmptyState>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 className="section-title">Upcoming</h2>
              <ul className="pass-list">
                {upcoming.map(({ r, e }, i) => (
                  <RegistrationTicket key={r.id} registration={r} event={e} onCancel={openCancel} index={i} />
                ))}
              </ul>
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 className="section-title">Past</h2>
              <ul className="pass-list">
                {past.map(({ r, e }, i) => (
                  <RegistrationTicket key={r.id} registration={r} event={e} onCancel={openCancel} index={i} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Cancel this registration?"
        confirmLabel="Yes, cancel it"
        busy={busy}
        onConfirm={confirmCancel}
        onCancel={() => setPending(null)}
      >
        You’ll give up your seat at <strong>{pending?.title}</strong>.
      </ConfirmDialog>
    </section>
  )
}
