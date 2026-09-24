import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import EventTicket from '../components/EventTicket'
import { EmptyState, InlineAlert, TicketSkeleton } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useMyRegistrations } from '../hooks/useMyRegistrations'
import { eventDateTime, isPast } from '../utils/format'

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
  { key: 'past', label: 'Past' },
  { key: 'mine', label: 'My events', auth: true },
]

export default function Events() {
  const { isAuthenticated, user } = useAuth()
  const { byEvent } = useMyRegistrations()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('upcoming')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setEvents(await api.listEvents())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const upcomingCount = useMemo(() => events.filter((e) => !isPast(e)).length, [events])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events
      .filter((e) => {
        if (filter === 'upcoming' && isPast(e)) return false
        if (filter === 'past' && !isPast(e)) return false
        if (filter === 'mine' && !byEvent.has(e.id)) return false
        if (!q) return true
        return [e.title, e.description, e.location].some((s) => s.toLowerCase().includes(q))
      })
      .sort((a, b) => {
        const diff = eventDateTime(a) - eventDateTime(b)
        return filter === 'past' ? -diff : diff
      })
  }, [events, query, filter, byEvent])

  return (
    <>
      <section className="hero container">
        <div className="hero__copy">
          <p className="eyebrow">{isAuthenticated ? `Hello, ${user.username}` : 'The events board'}</p>
          <h1 className="display">
            Find your next <span className="scribble">room</span> to be in.
          </h1>
          <p className="lede">
            Workshops, meetups and talks worth leaving the house for. Grab a seat in one click and keep every
            ticket in one place.
          </p>
          {!isAuthenticated && (
            <div className="hero__cta">
              <Link to="/register" className="btn btn--primary">
                Create free account
              </Link>
              <Link to="/login" className="btn btn--ghost">
                I have an account
              </Link>
            </div>
          )}
        </div>

        <dl className="stats">
          <div className="stat">
            <dt>Events listed</dt>
            <dd>{loading ? '—' : events.length}</dd>
          </div>
          <div className="stat">
            <dt>Coming up</dt>
            <dd>{loading ? '—' : upcomingCount}</dd>
          </div>
          <div className="stat stat--accent">
            <dt>Your tickets</dt>
            <dd>{isAuthenticated ? byEvent.size : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="container section">
        <div className="toolbar">
          <div className="tabs" role="tablist" aria-label="Filter events">
            {FILTERS.filter((f) => !f.auth || isAuthenticated).map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`tab${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="sr-only">Search events</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search title, topic or venue"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {error ? (
          <div className="stack">
            <InlineAlert>{error}</InlineAlert>
            <button className="btn btn--ghost" onClick={load}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <TicketSkeleton count={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="✦"
            title={query ? 'No matches' : 'Nothing here yet'}
            action={
              (query || filter !== 'all') && (
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setQuery('')
                    setFilter('all')
                  }}
                >
                  Show all events
                </button>
              )
            }
          >
            {query
              ? `No events match “${query}”. Try a different word.`
              : filter === 'mine'
                ? 'You haven’t registered for anything yet.'
                : 'Check back soon. New events are added regularly.'}
          </EmptyState>
        ) : (
          <div className="ticket-grid">
            {visible.map((event, i) => (
              <EventTicket key={event.id} event={event} registered={byEvent.has(event.id)} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
