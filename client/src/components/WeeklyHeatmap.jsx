import { motion } from 'framer-motion'
import { Calendar, TrendingUp } from 'lucide-react'

export default function WeeklyHeatmap({ analytics = [] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  
  const dayLabels = ['S','M','T','W','T','F','S']
  const activityMap = {}
  
  analytics.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 10)
    activityMap[key] = (activityMap[key] || 0) + 1
  })

  const totalActivity = Object.values(activityMap).reduce((sum, count) => sum + count, 0)
  const avgActivity = totalActivity / 7

  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/15 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-purple-400" />
            <h2 className="font-bold text-white text-sm">Weekly Activity</h2>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-slate-400">{totalActivity} total</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map((day, i) => {
            const count = activityMap[day] || 0
            const intensity = count === 0 ? 'bg-white/5' : 
                            count === 1 ? 'bg-purple-500/30' : 
                            count <= 3 ? 'bg-purple-500/60' : 'bg-purple-500'
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                whileHover={{ 
                  scale: 1.15, 
                  boxShadow: count > 0 ? '0 4px 12px rgba(168, 85, 247, 0.4)' : undefined
                }}
                title={`${new Date(day).toLocaleDateString()}: ${count} activities`}
                className={`aspect-square rounded-lg ${intensity} cursor-default transition-all duration-200 relative`}
              >
                {count > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {dayLabels.map((label, i) => (
            <span key={i} className="text-[9px] text-slate-600 font-medium">
              {label}
            </span>
          ))}
        </div>

        {/* Activity summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 pt-3 border-t border-white/5"
        >
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Avg/day</span>
            <span className="text-purple-400 font-semibold">
              {avgActivity.toFixed(1)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}