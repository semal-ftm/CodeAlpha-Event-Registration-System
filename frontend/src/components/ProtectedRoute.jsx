import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

// Keeps signed-in users away from the login/register screens. This also performs the
// post-login redirect, since it re-renders the moment the user is set.
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (isAuthenticated) return <Navigate to={location.state?.from || '/events'} replace />
  return children
}
