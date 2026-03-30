import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Calendar, Award } from 'lucide-react'

export default function GoalProgressCard({ goalProgress = 0, prediction, goal }) {
  const getTrendIcon = () => {
    if (!prediction?.weeklyRate) return TrendingUp
    return prediction.weeklyRate > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (!prediction?.weeklyRate) return 'text-slate-400'
    return prediction.weeklyRate > 0 ? 'text-green-400' : 'text-red-400'
  }

  const getConfidenceColor = () => {
    if (prediction?.confidence === 'achieved') return 'text-green-400'
    if (prediction?.confidence === 'high') return 'text-green-400'
    if (prediction?.confidence === 'medium') return 'text-yellow-400'
    return 'text-slate-500'
  }

  const TrendIcon = getTrendIcon()

  return (
    <div className="glass rounded-2xl p-4 border border-green-500/20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: goalProgress >= 100 ? 360 : 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              {goalProgress >= 100 ? (
                <Award size={14} className="text-yellow-400" />
              ) : (
                <Target size={14} className="text-green-400" />
              )}
            </motion.div>
            <h2 className="font-bold text-white text-sm">Goal Progress</h2>
          </div>
          <motion.span 
            key={goalProgress}
            initial={{ scale: 1.3, color: '#10b981' }}
            animate={{ scale: 1, color: goalProgress >= 100 ? '#facc15' : '#10b981' }}
            className="text-sm font-black"
          >
            {goalProgress}%
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white/8 rounded-full overflow-hidden mb-3 relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 relative"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(goalProgress, 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'linear',
                repeatDelay: 3 
              }}
            />
          </motion.div>
          
          {/* Overflow indicator for >100% */}
          {goalProgress > 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full"
            />
          )}
        </div>

        {/* Goal type */}
        {goal && (
          <div className="mb-3">
            <span className="text-xs text-slate-400 capitalize">
              {goal.replace(/_/g, ' ')} Goal
            </span>
          </div>
        )}

        {/* Prediction info */}
        {prediction?.estimatedDate && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Calendar size={10} className="text-slate-400" />
                <span className="text-slate-400">Est. completion</span>
              </div>
              <span className="text-white font-semibold">
                {new Date(prediction.estimatedDate).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
                <span className="text-slate-500 ml-1">
                  ({prediction.estimatedDays}d)
                </span>
              </span>
            </div>

            {/* Trend info */}
            {prediction.weeklyRate !== null && prediction.weeklyRate !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <TrendIcon size={10} className={getTrendColor()} />
                  <span className="text-slate-400">Weekly trend</span>
                </div>
                <span className={getTrendColor()}>
                  {prediction.weeklyRate > 0 ? '+' : ''}{prediction.weeklyRate} kg/week
                </span>
              </div>
            )}

            {/* Confidence indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Confidence</span>
              <motion.span 
                className={`font-medium capitalize ${getConfidenceColor()}`}
                animate={prediction.confidence === 'high' ? { 
                  textShadow: ['0 0 0px currentColor', '0 0 8px currentColor', '0 0 0px currentColor']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {prediction.confidence}
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* Achievement message */}
        {prediction?.confidence === 'achieved' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30"
          >
            <div className="flex items-center gap-2">
              <Award size={14} className="text-yellow-400" />
              <span className="text-sm font-bold text-green-400">
                🎉 Goal achieved! Amazing work!
              </span>
            </div>
          </motion.div>
        )}

        {/* Motivational message for low progress */}
        {goalProgress < 25 && prediction?.confidence !== 'achieved' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-3 text-xs text-slate-500"
          >
            💪 Keep going! Every step counts towards your goal.
          </motion.div>
        )}
      </div>
    </div>
  )
}