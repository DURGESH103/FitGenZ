import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Target, Flame, Beef } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NutritionTracker({ 
  targetCalories = 2000, 
  targetProtein = 150,
  onLog 
}) {
  const [consumedCalories, setConsumedCalories] = useState(0)
  const [consumedProtein, setConsumedProtein] = useState(0)
  const [isLogging, setIsLogging] = useState(false)

  const adjustCalories = (amount) => {
    setConsumedCalories(prev => Math.max(0, prev + amount))
  }

  const adjustProtein = (amount) => {
    setConsumedProtein(prev => Math.max(0, prev + amount))
  }

  const logNutrition = async () => {
    if (consumedCalories === 0 && consumedProtein === 0) {
      toast.error('Add some nutrition data first')
      return
    }

    setIsLogging(true)
    try {
      await onLog?.({ calories: consumedCalories, protein: consumedProtein })
      toast.success('Nutrition logged! 🥗')
      setConsumedCalories(0)
      setConsumedProtein(0)
    } catch {
      toast.error('Failed to log nutrition')
    } finally {
      setIsLogging(false)
    }
  }

  const calorieProgress = Math.min((consumedCalories / targetCalories) * 100, 100)
  const proteinProgress = Math.min((consumedProtein / targetProtein) * 100, 100)

  return (
    <div className="glass rounded-2xl p-4 border border-green-500/20">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Target size={14} className="text-green-400" />
        Nutrition Tracker
      </h3>

      <div className="space-y-4">
        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span className="text-sm text-white font-medium">Calories</span>
            </div>
            <span className="text-xs text-slate-400">
              {consumedCalories} / {targetCalories}
            </span>
          </div>
          
          <div className="h-2 bg-white/10 rounded-full mb-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${calorieProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjustCalories(-50)}
              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <Minus size={14} className="text-red-400" />
            </button>
            <span className="text-lg font-bold text-white min-w-[60px] text-center">
              {consumedCalories}
            </span>
            <button
              onClick={() => adjustCalories(50)}
              className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
            >
              <Plus size={14} className="text-green-400" />
            </button>
          </div>
        </div>

        {/* Protein */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Beef size={14} className="text-purple-400" />
              <span className="text-sm text-white font-medium">Protein</span>
            </div>
            <span className="text-xs text-slate-400">
              {consumedProtein}g / {targetProtein}g
            </span>
          </div>
          
          <div className="h-2 bg-white/10 rounded-full mb-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${proteinProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjustProtein(-5)}
              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <Minus size={14} className="text-red-400" />
            </button>
            <span className="text-lg font-bold text-white min-w-[60px] text-center">
              {consumedProtein}g
            </span>
            <button
              onClick={() => adjustProtein(5)}
              className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
            >
              <Plus size={14} className="text-green-400" />
            </button>
          </div>
        </div>

        <button
          onClick={logNutrition}
          disabled={isLogging}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold disabled:opacity-50 transition-all hover:shadow-lg"
        >
          {isLogging ? 'Logging...' : 'Log Nutrition'}
        </button>
      </div>
    </div>
  )
}