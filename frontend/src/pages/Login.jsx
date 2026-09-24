import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { InlineAlert } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Please enter both your username and password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await login(form.username.trim(), form.password)
      toast.success(`Welcome back, ${user.username}.`, 'Signed in')
      // GuestRoute redirects to location.state.from (or /events) once the user is set.
    } catch (err) {
      setError(
        err.status === 401 ? 'That username and password combination didn’t match an account.' : err.message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your seat."
      subtitle="Pick up where you left off: your tickets, your events, your plans."
      aside={{ big: 'VIP', small: 'Gate opens on sign-in', quote: '“The best seats go to those who show up.”' }}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {location.state?.from && (
          <InlineAlert type="info">Log in to continue. We’ll take you right back.</InlineAlert>
        )}
        <InlineAlert>{error}</InlineAlert>

        <label className="field">
          <span>Username</span>
          <input
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={update}
            placeholder="e.g. alex"
            autoFocus
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="field__with-action">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={update}
              placeholder="••••••••"
            />
            <button type="button" className="field__action" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>

        <p className="form__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
