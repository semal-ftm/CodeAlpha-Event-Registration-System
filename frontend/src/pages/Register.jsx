import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { InlineAlert } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.username.trim()) errors.username = 'Choose a username.'
  else if (!/^[\w.@+-]+$/.test(form.username.trim()))
    errors.username = 'Use letters, numbers and @ . + - _ only.'
  if (form.email && !EMAIL_RE.test(form.email)) errors.email = 'That email doesn’t look right.'
  if (form.password.length < 6) errors.password = 'Use at least 6 characters.'
  if (form.confirm !== form.password) errors.confirm = 'Passwords don’t match.'
  return errors
}

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setServerError('')
    try {
      await register({ username: form.username.trim(), email: form.email.trim(), password: form.password })
      toast.success('Your account is ready. Go find something worth attending.', 'Welcome aboard')
    } catch (err) {
      // Map DRF field errors back onto their inputs when possible.
      const data = err.data || {}
      const fieldErrors = {}
      for (const key of ['username', 'email', 'password']) {
        if (data[key]) fieldErrors[key] = [].concat(data[key]).join(' ')
      }
      setErrors(fieldErrors)
      setServerError(Object.keys(fieldErrors).length ? 'Please fix the highlighted fields.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  const field = (name, label, props = {}) => (
    <label className={`field${errors[name] ? ' has-error' : ''}`}>
      <span>{label}</span>
      <input
        name={name}
        value={form[name]}
        onChange={update}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...props}
      />
      {errors[name] && (
        <small id={`${name}-error`} className="field__error">
          {errors[name]}
        </small>
      )}
    </label>
  )

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Your pass to what’s next."
      subtitle="One account for every workshop, meetup and conference on the board."
      aside={{ big: 'NEW', small: 'Member since today', quote: '“Show up. Meet people. Learn something.”' }}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <InlineAlert>{serverError}</InlineAlert>
        {field('username', 'Username', { autoComplete: 'username', placeholder: 'e.g. alex', autoFocus: true })}
        {field('email', 'Email (optional)', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        <div className="form__row">
          {field('password', 'Password', { type: 'password', autoComplete: 'new-password', placeholder: 'Min. 6 characters' })}
          {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password', placeholder: 'Repeat it' })}
        </div>

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="form__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
