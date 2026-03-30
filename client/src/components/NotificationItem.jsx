import { motion } from 'framer-motion'
import { User, Heart, MessageCircle, Trophy, Flame, Target, Zap, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Notification type configurations
const NOTIFICATION_TYPES = {
  follow: {
    icon: User,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  like: {
    icon: Heart,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  comment: {
    icon: MessageCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  badge_earned: {
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  level_up: {
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  streak_alert: {
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  goal_milestone: {
    icon: Target,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  workout_reminder: {
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  }
}

// Time formatting utility
const formatTimeAgo = (dateString) => {
  const now = new Date()
  const notificationDate = new Date(dateString)
  const diffInSeconds = Math.floor((now - notificationDate) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return notificationDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

export default function NotificationItem({ notification, onClick, onMarkAsRead, isMobile = false }) {
  const navigate = useNavigate()
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.follow
  const IconComponent = typeConfig.icon

  const handleClick = () => {
    onClick?.(notification)
    
    // Handle navigation based on notification type
    if (notification.type === 'follow' && notification.sender?._id) {
      navigate(`/profile/${notification.sender._id}`)
    }
    // Add more navigation logic for other types as needed
  }

  const handleMarkAsRead = (e) => {
    e.stopPropagation()
    onMarkAsRead?.(notification)
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        relative cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0
        ${!notification.read ? 'bg-white/5' : ''}
        hover:bg-white/10 active:bg-white/15
        touch-manipulation
        ${isMobile ? 'px-6 py-4' : 'px-4 py-3'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar or Type Icon */}
        <div className="shrink-0 mt-0.5">
          {notification.sender?.avatarUrl ? (
            <div className="relative">
              <img
                src={notification.sender.avatarUrl}
                alt={notification.sender.name}
                className={`rounded-full object-cover border-2 border-white/10 ${
                  isMobile ? 'w-12 h-12' : 'w-10 h-10'
                }`}
              />
              {/* Type indicator overlay */}
              <div className={`
                absolute -bottom-1 -right-1 rounded-full flex items-center justify-center
                ${typeConfig.bgColor} ${typeConfig.borderColor} border
                ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}
              `}>
                <IconComponent size={isMobile ? 12 : 10} className={typeConfig.color} />
              </div>
            </div>
          ) : (
            <div className={`
              rounded-full flex items-center justify-center
              ${typeConfig.bgColor} ${typeConfig.borderColor} border
              ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}
            `}>
              <IconComponent size={isMobile ? 20 : 18} className={typeConfig.color} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`text-white font-medium leading-snug mb-1 ${
            isMobile ? 'text-base' : 'text-sm'
          }`}>
            {notification.title}
          </h4>
          
          {/* Message */}
          <p className={`text-slate-300 leading-relaxed mb-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            {notification.body}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className={`text-slate-500 ${
              isMobile ? 'text-sm' : 'text-xs'
            }`}>
              {formatTimeAgo(notification.createdAt)}
            </span>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={handleMarkAsRead}
                  className={`rounded-full hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white transition-colors touch-manipulation ${
                    isMobile ? 'p-1.5' : 'p-1'
                  }`}
                  title="Mark as read"
                >
                  <Check size={isMobile ? 14 : 12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="shrink-0 mt-2">
            <div className={`rounded-full bg-purple-400 shadow-lg shadow-purple-400/50 ${
              isMobile ? 'w-2.5 h-2.5' : 'w-2 h-2'
            }`} />
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}