import { motion } from 'framer-motion'
import { Activity, CheckCircle2, TrendingUp, Dumbbell, Apple } from 'lucide-react'

// Simple time ago utility
const timeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString()
}

export default function RecentActivity({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return CheckCircle2
      case 'progress_logged': return TrendingUp
      case 'workout_completed': return Dumbbell
      case 'diet_logged': return Apple
      default: return Activity
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed': return 'text-green-400'
      case 'progress_logged': return 'text-blue-400'
      case 'workout_completed': return 'text-red-400'
      case 'diet_logged': return 'text-emerald-400'
      default: return 'text-purple-400'
    }
  }

  if (!activities.length) {
    return (
      <div className="glass rounded-2xl p-4 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Activity size={14} className="text-purple-400" />
          Recent Activity
        </h3>
        <p className="text-slate-500 text-xs text-center py-4">
          No recent activity
        </p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Activity size={14} className="text-purple-400" />
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {activities.slice(0, 5).map((activity, i) => {
          const Icon = getActivityIcon(activity.type)
          const color = getActivityColor(activity.type)
          
          return (
            <motion.div
              key={activity._id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className={`p-1.5 rounded-lg bg-white/10 ${color}`}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">
                  {activity.description || activity.title}
                </p>
                <p className="text-[10px] text-slate-500">
                  {timeAgo(activity.createdAt || activity.date)}
                </p>
              </div>
              {activity.xpGain && (
                <span className="text-[10px] text-yellow-400 font-bold">
                  +{activity.xpGain} XP
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}