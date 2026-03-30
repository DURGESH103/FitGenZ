import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, BarChart2, ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MobileWorkoutCard({ 
  workout, 
  level, 
  category, 
  onStart, 
  onComplete 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [completedExercises, setCompletedExercises] = useState(new Set())

  const toggleExercise = (index) => {
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedExercises(newCompleted)
  }

  const completeWorkout = () => {
    if (completedExercises.size === 0) {
      toast.error('Complete at least one exercise')
      return
    }
    onComplete?.(workout, completedExercises.size, workout.exercises?.length || 0)
    toast.success('Workout completed! 🎉')
  }

  const exCount = workout.exercises?.length || 0
  const completionRate = exCount ? Math.round((completedExercises.size / exCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden border border-purple-500/20"
    >
      {/* Header - Always visible */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center shrink-0">
            <span className="text-lg">💪</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight mb-1">
              {workout.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <BarChart2 size={12} />
                {exCount} exercises
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {exCount * 4}-{exCount * 6} min
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            level === 'beginner' ? 'bg-green-500/20 text-green-400' :
            level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {level}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-400">
            {category === 'home' ? '🏠 Home' : '🏋️ Gym'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
            {isExpanded ? 'Hide' : 'View'} Exercises
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart?.(workout)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center gap-2 shadow-lg"
          >
            <Play size={14} fill="white" />
            Start
          </motion.button>
        </div>
      </div>

      {/* Expandable Exercise List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              {/* Progress Bar */}
              {completedExercises.size > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white font-medium">Progress</span>
                    <span className="text-sm text-purple-400 font-bold">{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Exercise List */}
              <div className="space-y-2">
                {workout.exercises?.map((exercise, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleExercise(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <motion.div whileHover={{ scale: 1.1 }}>
                      {completedExercises.has(index) ? (
                        <CheckCircle2 size={20} className="text-green-400" />
                      ) : (
                        <Circle size={20} className="text-slate-500" />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors ${
                        completedExercises.has(index) 
                          ? 'line-through text-slate-500' 
                          : 'text-white'
                      }`}>
                        {exercise.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Complete Workout Button */}
              {completedExercises.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={completeWorkout}
                  className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold"
                >
                  Complete Workout ({completedExercises.size}/{exCount})
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}