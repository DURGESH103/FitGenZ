import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

// Mirror of server/config/events.js
export const EVENTS = {
  XP_GAINED:        'XP_GAINED',
  LEVEL_UP:         'LEVEL_UP',
  BADGE_EARNED:     'BADGE_EARNED',
  STATS_UPDATE:     'STATS_UPDATE',
  TASK_COMPLETED:   'TASK_COMPLETED',
  TASKS_ALL_DONE:   'TASKS_ALL_DONE',
  PROGRESS_ADDED:   'PROGRESS_ADDED',
  STREAK_UPDATED:   'STREAK_UPDATED',
  STREAK_MILESTONE: 'STREAK_MILESTONE',
  DAILY_REWARD:     'DAILY_REWARD',
  FEED_NEW_POST:    'feed:new_post',
  FEED_LIKE:        'feed:like_update',
  FEED_COMMENT:     'feed:comment_added',
  NEW_NOTIFICATION: 'NEW_NOTIFICATION',
}

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user }    = useAuth()
  const socketRef   = useRef(null)
  const [connected, setConnected] = useState(false)
  const [liveStats, setLiveStats] = useState(null)
  const [notifications, setNotifications] = useState([])

  const showXPToast = useCallback((xpGain, source) => {
    if (!xpGain || xpGain <= 0) return
    const labels = {
      task_complete:  'Task done',
      all_tasks_done: 'All tasks done!',
      progress_logged:'Progress logged',
      daily_reward:   'Daily reward',
      workout_logged: 'Workout logged',
    }
    const label = labels[source] || ''
    toast(`+${xpGain} XP ⚡${label ? ` · ${label}` : ''}`, {
      style: { background: '#1a1a2e', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)', fontWeight: 700 },
      duration: 2500,
    })
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

    // ── Named event handlers ──────────────────────────────────────────────────

    socket.on(EVENTS.STATS_UPDATE, (data) => {
      setLiveStats((prev) => ({ ...prev, ...data }))
      if (data.leveledUp) {
        setTimeout(() => toast.success(`🎉 Level Up! You're now ${data.levelTitle}`, { duration: 4000 }), 400)
      }
      for (const badge of (data.newBadges || [])) {
        setTimeout(() => toast(`${badge.icon} Badge: ${badge.label}`, {
          style: { background: '#1a1a2e', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)', fontWeight: 700 },
          duration: 4000,
        }), 1000)
      }
    })

    socket.on(EVENTS.XP_GAINED, (data) => {
      setLiveStats((prev) => ({ ...prev, xp: data.xp, weeklyXP: data.weeklyXP }))
      showXPToast(data.xpGain, data.source)
    })

    socket.on(EVENTS.LEVEL_UP, (data) => {
      setLiveStats((prev) => ({ ...prev, level: data.level, levelTitle: data.levelTitle }))
    })

    socket.on(EVENTS.TASK_COMPLETED, (data) => {
      setLiveStats((prev) => ({ ...prev, streak: data.streak }))
    })

    socket.on(EVENTS.TASKS_ALL_DONE, () => {
      toast('🏆 All tasks done! Bonus XP earned!', {
        style: { background: '#1a1a2e', color: '#facc15', border: '1px solid rgba(250,204,21,0.4)', fontWeight: 700 },
        duration: 3500,
      })
    })

    socket.on(EVENTS.PROGRESS_ADDED, (data) => {
      setLiveStats((prev) => ({ ...prev, xp: data.xp, _progressNew: Date.now() }))
    })

    socket.on(EVENTS.STREAK_UPDATED, (data) => {
      setLiveStats((prev) => ({ ...prev, streak: data.streak }))
      if (data.usedFreeze) {
        toast('❄️ Streak freeze used! Streak protected.', {
          style: { background: '#1a1a2e', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', fontWeight: 700 },
          duration: 3500,
        })
      }
    })

    socket.on(EVENTS.DAILY_REWARD, (data) => {
      setLiveStats((prev) => ({ ...prev, xp: data.xp, weeklyXP: data.weeklyXP }))
      toast(`🎁 Daily reward! +${data.xpGain} XP${data.streakBonus ? ` (+${data.streakBonus} streak bonus)` : ''}`, {
        style: { background: '#1a1a2e', color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)', fontWeight: 700 },
        duration: 4000,
      })
    })

    // Social notifications
    socket.on(EVENTS.NEW_NOTIFICATION, (notification) => {
      setNotifications(prev => [notification, ...prev])
      if (notification.type === 'follow') {
        toast(`${notification.sender?.name || 'Someone'} started following you!`, {
          style: { background: '#1a1a2e', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)', fontWeight: 700 },
          duration: 3000,
        })
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user, showXPToast])

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      connected, 
      liveStats, 
      setLiveStats, 
      notifications,
      setNotifications,
      EVENTS 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
