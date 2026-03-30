import { motion } from 'framer-motion'
import { TrendingUp, Clock, Zap, Target } from 'lucide-react'

export default function WorkoutStats({ 
  weeklyWorkouts = 0, 
  totalMinutes = 0, 
  avgIntensity = 'Medium',
  completionRate = 0 
}) {
  const stats = [
    {
      label: 'This Week',
      value: weeklyWorkouts,
      suffix: ' workouts',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-emerald-500/10'
    },
    {
      label: 'Total Time',
      value: Math.round(totalMinutes / 60),
      suffix: ' hours',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/10'
    },
    {
      label: 'Avg Intensity',
      value: avgIntensity,
      suffix: '',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-orange-500/10'
    },
    {
      label: 'Completion',
      value: completionRate,
      suffix: '%',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-pink-500/10'
    }
  ]

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-purple-400" />
        Workout Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} border border-white/10`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className={`text-xs font-bold ${stat.color}`}>
                {stat.value}{stat.suffix}
              </span>
            </div>
            <p className="text-[10px] text-white/70 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}