import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  const linkClass = ({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`

  return (
    <header className="nav">
      <div className="nav__inner container">
        <Link to="/" className="brand" aria-label="Admit One home">
          <span className="brand__mark" aria-hidden="true">
            A1
          </span>
          <span className="brand__name">
            Admit<em>One</em>
          </span>
        </Link>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="nav__burger" aria-hidden="true" />
        </button>

        <nav id="primary-nav" className={`nav__links${open ? ' is-open' : ''}`}>
          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/my-registrations" className={linkClass}>
                My Tickets
              </NavLink>
              <span className="nav__user" title={`Signed in as ${user.username}`}>
                <span className="avatar" aria-hidden="true">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                {user.username}
              </span>
              <NavLink to="/logout" className="btn btn--ghost btn--sm">
                Log out
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn--primary btn--sm">
                Get started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
