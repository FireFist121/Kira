import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { verifyAdmin } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('kira_admin_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await verifyAdmin()
      const { email, role, token: freshToken } = res.data
      if (role === 'admin') {
        if (freshToken) localStorage.setItem('kira_admin_token', freshToken)
        setUser({ email, role })
      } else {
        localStorage.removeItem('kira_admin_token')
        setUser(null)
      }
    } catch {
      localStorage.removeItem('kira_admin_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onRemoteLogout = () => setUser(null)
    window.addEventListener('kira-auth-logout', onRemoteLogout)
    return () => window.removeEventListener('kira-auth-logout', onRemoteLogout)
  }, [])

  const login = useCallback((token, userPayload) => {
    localStorage.setItem('kira_admin_token', token)
    setUser(userPayload)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kira_admin_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
