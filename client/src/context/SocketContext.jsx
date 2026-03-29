import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [liveStats, setLiveStats] = useState(null) // { xp, level, levelTitle, streak }

  const showXPToast = useCallback((xpGain, leveledUp, newBadges = []) => {
    if (xpGain > 0) {
      toast(`+${xpGain} XP ⚡`, {
        icon: '⚡',
        style: { background: '#1a1a2e', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)', fontWeight: 700 },
        duration: 2500,
      })
    }
    if (leveledUp) {
      setTimeout(() => toast.success(`Level Up! 🎉`, { duration: 3500 }), 600)
    }
    for (const badge of newBadges) {
      setTimeout(() => toast(`${badge.icon} Badge: ${badge.label}`, {
        style: { background: '#1a1a2e', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)', fontWeight: 700 },
        duration: 4000,
      }), 1200)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('stats:update', (data) => {
      setLiveStats((prev) => ({ ...prev, ...data }))
      showXPToast(data.xpGain, data.leveledUp, data.newBadges)
    })

    socket.on('progress:new', (data) => {
      setLiveStats((prev) => ({ ...prev, xp: data.xp, level: data.level, _progressNew: Date.now() }))
      if (data.xpGain) showXPToast(data.xpGain, false, [])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user, showXPToast])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, liveStats, setLiveStats }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
