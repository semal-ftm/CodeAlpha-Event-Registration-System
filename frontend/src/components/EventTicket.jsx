import { Link } from 'react-router-dom'
import { formatDateParts, formatTime, isPast, relativeDays } from '../utils/format'

export default function EventTicket({ event, registered, index = 0 }) {
  const { weekday, day, month } = formatDateParts(event)
  const past = isPast(event)

  return (
    <Link
      to={`/events/${event.id}`}
      className={`ticket${past ? ' ticket--past' : ''}${registered ? ' ticket--registered' : ''}`}
      style={{ '--i': index }}
    >
      <div className="ticket__stub">
        <span className="ticket__month">{month}</span>
        <span className="ticket__day">{day}</span>
        <span className="ticket__weekday">{weekday}</span>
      </div>

      <div className="ticket__main">
        <div className="ticket__meta">
          <span className="chip">{past ? 'Ended' : relativeDays(event)}</span>
          {registered && <span className="chip chip--accent">✓ You're in</span>}
        </div>
        <h3 className="ticket__title">{event.title}</h3>
        <p className="ticket__desc">{event.description}</p>
        <dl className="ticket__facts">
          <div>
            <dt>Time</dt>
            <dd>{formatTime(event)}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{event.location}</dd>
          </div>
          <div>
            <dt>Seats</dt>
            <dd>{event.capacity}</dd>
          </div>
        </dl>
      </div>

      <span className="ticket__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
