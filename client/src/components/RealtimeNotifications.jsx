import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { Zap, Trophy, Star, Flame, Gift, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const NotificationIcon = ({ type }) => {
  const icons = {
    xp: Zap,
    level: Star,
    badge: Trophy,
    streak: Flame,
    reward: Gift,
    progress: TrendingUp
  }
  const Icon = icons[type] || Zap
  return <Icon size={16} />
}

export default function RealtimeNotifications() {
  const { liveStats, EVENTS, socket } = useSocket()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!socket) return

    // Enhanced XP gain notifications
    const handleXPGain = (data) => {
      const notification = {
        id: Date.now(),
        type: 'xp',
        title: `+${data.xpGain} XP`,
        message: getXPMessage(data.source),
        color: 'from-purple-500 to-pink-500',
        duration: 2500
      }
      showNotification(notification)
    }

    // Level up notifications
    const handleLevelUp = (data) => {
      const notification = {
        id: Date.now(),
        type: 'level',
        title: 'Level Up!',
        message: `You're now ${data.levelTitle}`,
        color: 'from-yellow-500 to-orange-500',
        duration: 4000
      }
      showNotification(notification)
    }

    // Badge earned notifications
    const handleBadgeEarned = (data) => {
      const notification = {
        id: Date.now(),
        type: 'badge',
        title: 'Badge Earned!',
        message: `${data.badge.icon} ${data.badge.label}`,
        color: 'from-yellow-400 to-yellow-600',
        duration: 4000
      }
      showNotification(notification)
    }

    // Streak notifications
    const handleStreakUpdate = (data) => {
      if (data.usedFreeze) {
        const notification = {
          id: Date.now(),
          type: 'streak',
          title: 'Streak Protected!',
          message: 'Freeze used to maintain streak',
          color: 'from-blue-500 to-cyan-500',
          duration: 3500
        }
        showNotification(notification)
      }
    }

    // Daily reward notifications
    const handleDailyReward = (data) => {
      const notification = {
        id: Date.now(),
        type: 'reward',
        title: 'Daily Reward!',
        message: `+${data.xpGain} XP${data.streakBonus ? ` (+${data.streakBonus} bonus)` : ''}`,
        color: 'from-green-500 to-emerald-500',
        duration: 4000
      }
      showNotification(notification)
    }

    // Progress logged notifications
    const handleProgressAdded = (data) => {
      const notification = {
        id: Date.now(),
        type: 'progress',
        title: 'Progress Logged!',
        message: `+${data.xpGain} XP earned`,
        color: 'from-indigo-500 to-purple-500',
        duration: 3000
      }
      showNotification(notification)
    }

    socket.on(EVENTS.XP_GAINED, handleXPGain)
    socket.on(EVENTS.LEVEL_UP, handleLevelUp)
    socket.on(EVENTS.BADGE_EARNED, handleBadgeEarned)
    socket.on(EVENTS.STREAK_UPDATED, handleStreakUpdate)
    socket.on(EVENTS.DAILY_REWARD, handleDailyReward)
    socket.on(EVENTS.PROGRESS_ADDED, handleProgressAdded)

    return () => {
      socket.off(EVENTS.XP_GAINED, handleXPGain)
      socket.off(EVENTS.LEVEL_UP, handleLevelUp)
      socket.off(EVENTS.BADGE_EARNED, handleBadgeEarned)
      socket.off(EVENTS.STREAK_UPDATED, handleStreakUpdate)
      socket.off(EVENTS.DAILY_REWARD, handleDailyReward)
      socket.off(EVENTS.PROGRESS_ADDED, handleProgressAdded)
    }
  }, [socket, EVENTS])

  const getXPMessage = (source) => {
    const messages = {
      task_complete: 'Task completed',
      all_tasks_done: 'All tasks done!',
      progress_logged: 'Progress logged',
      daily_reward: 'Daily reward',
      workout_logged: 'Workout logged',
      streak_milestone: 'Streak milestone!'
    }
    return messages[source] || 'XP earned'
  }

  const showNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 2)]) // Keep max 3
    
    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, notification.duration)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`bg-gradient-to-r ${notification.color} p-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 min-w-[200px] pointer-events-auto`}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-white"
              >
                <NotificationIcon type={notification.type} />
              </motion.div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">
                  {notification.title}
                </div>
                <div className="text-white/90 text-xs">
                  {notification.message}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}