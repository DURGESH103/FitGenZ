import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_ICON = {
  streak_alert:     '🔥',
  workout_reminder: '💪',
  level_up:         '🎉',
  badge_earned:     '🏅',
  goal_milestone:   '🎯',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, markAllRead } = useNotifications()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen((v) => !v)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-400 hover:text-slate-200">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 glass rounded-2xl border border-purple-500/20 shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="font-bold text-white text-sm">Notifications</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id}
                    className={`px-4 py-3 border-b border-white/5 hover:bg-white/4 transition-colors ${!n.read ? 'bg-purple-500/5' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
