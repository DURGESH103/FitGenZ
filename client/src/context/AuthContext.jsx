import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const _persist = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    _persist(data.user)
    return data
  }, [])

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload)
    localStorage.setItem('accessToken', data.accessToken)
    _persist(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  /** Call after profile update to keep context + localStorage in sync */
  const updateUser = useCallback((updatedUser) => {
    _persist({ ...user, ...updatedUser })
  }, [user])

  const value = useMemo(
    () => ({ user, login, signup, logout, updateUser }),
    [user, login, signup, logout, updateUser]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
