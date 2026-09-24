import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Logout() {
  const { logout, isAuthenticated } = useAuth()
  const toast = useToast()
  const done = useRef(false)

  useEffect(() => {
    // Guard against StrictMode running the effect twice.
    if (done.current) return
    done.current = true
    if (isAuthenticated) {
      logout()
      toast.info('You’ve been signed out safely.', 'Logged out')
    }
  }, [isAuthenticated, logout, toast])

  return (
    <section className="container section">
      <div className="farewell">
        <div className="farewell__stub" aria-hidden="true">
          <span>SEE YOU</span>
          <strong>SOON</strong>
        </div>
        <h1 className="display">You’re signed out.</h1>
        <p className="lede">Your tickets are saved. Log back in anytime to manage them.</p>
        <div className="hero__cta">
          <Link to="/login" className="btn btn--primary">
            Log in again
          </Link>
          <Link to="/events" className="btn btn--ghost">
            Keep browsing
          </Link>
        </div>
      </div>
    </section>
  )
}
