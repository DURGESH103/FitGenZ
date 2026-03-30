import { motion } from 'framer-motion'
import { BarChart3, Target, Calendar, Zap } from 'lucide-react'

export default function PerformanceMetrics({ 
  weeklyWorkouts = 0, 
  avgDailyXP = 0, 
  consistencyScore = 0,
  goalCompletionRate = 0 
}) {
  const metrics = [
    {
      label: 'Weekly Workouts',
      value: weeklyWorkouts,
      target: 5,
      icon: BarChart3,
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-orange-500/10'
    },
    {
      label: 'Daily XP Avg',
      value: Math.round(avgDailyXP),
      target: 100,
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-orange-500/10'
    },
    {
      label: 'Consistency',
      value: `${consistencyScore}%`,
      target: 80,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/10'
    },
    {
      label: 'Goal Rate',
      value: `${goalCompletionRate}%`,
      target: 90,
      icon: Target,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-emerald-500/10'
    }
  ]

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 size={14} className="text-purple-400" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const numericValue = typeof metric.value === 'string' 
            ? parseInt(metric.value.replace('%', '')) 
            : metric.value
          const progress = Math.min((numericValue / metric.target) * 100, 100)
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-xl bg-gradient-to-br ${metric.bgColor} border border-white/10`}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon size={14} className={metric.color} />
                <span className={`text-xs font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
              <p className="text-[10px] text-white/70 mb-2 font-medium">
                {metric.label}
              </p>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color.replace('text-', 'from-').replace('-400', '-500')} to-white/20`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}