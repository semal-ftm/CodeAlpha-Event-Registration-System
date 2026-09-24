import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute'
import { EmptyState } from './components/Feedback'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Logout from './pages/Logout'
import MyRegistrations from './pages/MyRegistrations'
import Register from './pages/Register'

export default function App() {
  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="*"
            element={
              <div className="container section">
                <EmptyState
                  icon="404"
                  title="Wrong door"
                  action={
                    <Link to="/events" className="btn btn--primary">
                      Go to events
                    </Link>
                  }
                >
                  This page doesn’t exist.
                </EmptyState>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer container">
        <span>
          Admit<em>One</em> · Event Registration System
        </span>
        <span className="mono muted">React × Django REST Framework</span>
      </footer>
    </div>
  )
}
