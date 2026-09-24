const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const ACCESS_KEY = 'admitone.access'
const REFRESH_KEY = 'admitone.refresh'

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

// Turns any DRF error payload into one readable sentence.
// Handles {"error": "..."}, {"detail": "..."} and field errors like {"username": ["..."]}.
export function extractMessage(data, fallback = 'Something went wrong. Please try again.') {
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data.map((d) => extractMessage(d, '')).filter(Boolean).join(' ') || fallback
  }
  if (data.error) return extractMessage(data.error, fallback)
  if (data.detail) return extractMessage(data.detail, fallback)
  const parts = Object.entries(data).map(([field, value]) => {
    const text = extractMessage(value, '')
    if (!text) return ''
    if (field === 'non_field_errors') return text
    const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
    return `${label}: ${text}`
  })
  return parts.filter(Boolean).join(' ') || fallback
}

let refreshPromise = null
let onAuthExpired = () => {}

export function setAuthExpiredHandler(handler) {
  onAuthExpired = handler
}

async function refreshAccessToken() {
  if (!tokens.refresh) return false
  // Share one in-flight refresh between concurrent requests.
  refreshPromise ??= fetch(`${API_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return false
      tokens.set(await res.json())
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

async function request(path, { method = 'GET', body, auth = false, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is the Django API running?', 0, null)
  }

  if (res.status === 401 && auth && retry) {
    if (await refreshAccessToken()) {
      return request(path, { method, body, auth, retry: false })
    }
    tokens.clear()
    onAuthExpired()
    throw new ApiError('Your session has expired. Please log in again.', 401, null)
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    // 502/503/504 with no JSON body means the dev proxy couldn't reach Django at all.
    if ([502, 503, 504].includes(res.status) && !data) {
      throw new ApiError('Cannot reach the API server. Is Django running (python manage.py runserver)?', res.status, null)
    }
    const fallback =
      res.status >= 500 ? 'The server ran into a problem. Please try again.' : `Request failed (${res.status}).`
    throw new ApiError(extractMessage(data, fallback), res.status, data)
  }
  return data
}

export const api = {
  login: (username, password) =>
    request('/auth/login/', { method: 'POST', body: { username, password } }),
  register: (payload) => request('/auth/register/', { method: 'POST', body: payload }),

  listEvents: () => request('/events/'),
  getEvent: (id) => request(`/events/${id}/`),

  myRegistrations: () => request('/my-registrations/', { auth: true }),
  registerForEvent: (eventId) =>
    request('/registrations/', { method: 'POST', body: { event: eventId }, auth: true }),
  cancelRegistration: (registrationId) =>
    request(`/registrations/${registrationId}/cancel/`, { method: 'DELETE', auth: true }),
}
