import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Trophy, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function WorkoutProgress({ workout, onComplete }) {
  const [completedExercises, setCompletedExercises] = useState(new Set())
  const [isLogging, setIsLogging] = useState(false)

  const toggleExercise = (index) => {
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedExercises(newCompleted)
  }

  const completionRate = workout.exercises?.length 
    ? Math.round((completedExercises.size / workout.exercises.length) * 100)
    : 0

  const logWorkout = async () => {
    if (completedExercises.size === 0) {
      toast.error('Complete at least one exercise')
      return
    }

    setIsLogging(true)
    try {
      await api.post('/analytics/track', {
        eventType: 'workout_completion',
        value: completedExercises.size,
        metadata: {
          workoutTitle: workout.title,
          exercises: workout.exercises?.filter((_, i) => completedExercises.has(i)),
          completionRate,
          totalExercises: workout.exercises?.length || 0
        }
      })
      toast.success('Workout logged! 🎉')
      onComplete?.()
    } catch {
      toast.error('Failed to log workout')
    } finally {
      setIsLogging(false)
    }
  }

  if (!workout.exercises?.length) return null

  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy size={14} className="text-yellow-400" />
          Track Progress
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-400 font-bold">{completionRate}%</span>
          <span className="text-xs text-slate-500">{completedExercises.size}/{workout.exercises.length}</span>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {workout.exercises.map((exercise, i) => (
          <motion.button
            key={i}
            onClick={() => toggleExercise(i)}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              {completedExercises.has(i) ? (
                <CheckCircle2 size={18} className="text-green-400" />
              ) : (
                <Circle size={18} className="text-slate-600" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium transition-colors ${
                completedExercises.has(i) ? 'line-through text-slate-500' : 'text-white'
              }`}>
                {exercise.name}
              </p>
              <p className="text-xs text-slate-400">
                {exercise.sets} × {exercise.reps}
              </p>
            </div>
            {completedExercises.has(i) && (
              <Flame size={14} className="text-orange-400" />
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={logWorkout}
        disabled={isLogging || completedExercises.size === 0}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
      >
        {isLogging ? 'Logging...' : 'Log Workout'}
      </button>
    </div>
  )
}