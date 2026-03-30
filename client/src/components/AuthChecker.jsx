import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthChecker({ children }) {
  const { user, logout } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const userData = localStorage.getItem('user')
        
        if (!token || !userData) {
          setAuthError(true)
          return
        }

        // Verify token is still valid by making a simple API call
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401) {
          // Token is invalid, try to refresh
          try {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include'
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem('accessToken', data.accessToken)
              setAuthError(false)
            } else {
              setAuthError(true)
            }
          } catch {
            setAuthError(true)
          }
        } else if (response.ok) {
          setAuthError(false)
        } else {
          setAuthError(true)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthError(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  const handleReauth = async () => {
    setIsChecking(true)
    try {
      await logout()
      window.location.href = '/login'
    } catch {
      window.location.href = '/login'
    }
  }

  const handleRetry = () => {
    setIsChecking(true)
    setAuthError(false)
    window.location.reload()
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 mx-auto mb-4"
          >
            <Loader2 size={32} className="text-purple-400" />
          </motion.div>
          <p className="text-slate-400 text-sm">Checking authentication...</p>
        </motion.div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md w-full text-center border border-yellow-500/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center"
          >
            <AlertCircle size={32} className="text-yellow-400" />
          </motion.div>

          <h1 className="text-xl font-bold text-white mb-2">
            Session Expired
          </h1>
          
          <p className="text-slate-400 text-sm mb-6">
            Your session has expired. Please log in again to continue.
          </p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReauth}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
            >
              Log In Again
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              <RefreshCw size={16} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return children
}