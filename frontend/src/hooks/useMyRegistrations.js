import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

// Loads the signed-in user's registrations and indexes them by event id,
// so any page can ask "is the user registered for this event?".
export function useMyRegistrations() {
  const { isAuthenticated } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(isAuthenticated)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setRegistrations([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setRegistrations(await api.myRegistrations())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    reload()
  }, [reload])

  const byEvent = useMemo(() => new Map(registrations.map((r) => [r.event, r])), [registrations])

  return { registrations, byEvent, loading, error, reload }
}
