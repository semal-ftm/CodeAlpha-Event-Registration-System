import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthExpiredHandler, tokens } from '../api/client'

const AuthContext = createContext(null)
const USER_KEY = 'admitone.user'

function readStoredUser() {
  if (!tokens.refresh) return null
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const clearSession = useCallback(() => {
    tokens.clear()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    setAuthExpiredHandler(clearSession)
  }, [clearSession])

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password)
    tokens.set(data)
    // The login endpoint only returns tokens, so remember the username we signed in with.
    const u = { username }
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const register = useCallback(
    async ({ username, email, password }) => {
      await api.register({ username, email, password })
      return login(username, password)
    },
    [login],
  )

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout: clearSession }),
    [user, login, register, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
