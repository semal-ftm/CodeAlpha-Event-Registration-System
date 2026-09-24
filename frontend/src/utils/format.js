// Event dates arrive as "YYYY-MM-DD" and times as "HH:MM:SS".
// Parse them as local time so the calendar day never shifts by timezone.
export function eventDateTime(event) {
  const [y, m, d] = event.date.split('-').map(Number)
  const [hh = 0, mm = 0] = (event.start_time || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

export function isPast(event) {
  return eventDateTime(event) < new Date()
}

export function formatDateParts(event) {
  const dt = eventDateTime(event)
  return {
    weekday: dt.toLocaleDateString(undefined, { weekday: 'short' }),
    day: dt.toLocaleDateString(undefined, { day: '2-digit' }),
    month: dt.toLocaleDateString(undefined, { month: 'short' }),
    year: dt.getFullYear(),
  }
}

export function formatLongDate(event) {
  return eventDateTime(event).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(event) {
  return eventDateTime(event).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatTimestamp(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeDays(event) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dt = eventDateTime(event)
  dt.setHours(0, 0, 0, 0)
  const diff = Math.round((dt - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0) return `In ${diff} days`
  return `${Math.abs(diff)} days ago`
}

// A stable, short ticket code derived from the registration — purely cosmetic.
export function ticketCode(registration) {
  const n = (registration.id * 2654435761) % 0xffffff
  return `A1-${String(registration.event).padStart(3, '0')}-${n.toString(36).toUpperCase().padStart(5, '0')}`
}
