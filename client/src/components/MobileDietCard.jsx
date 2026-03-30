import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Beef, Plus, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MobileDietCard({ 
  meal, 
  timeSlot, 
  onLog 
}) {
  const [isLogged, setIsLogged] = useState(false)

  const logMeal = async () => {
    if (isLogged) return
    
    try {
      await onLog?.(meal)
      setIsLogged(true)
      toast.success(`${meal.name} logged! 🍽️`)
    } catch {
      toast.error('Failed to log meal')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glass rounded-2xl p-4 border transition-all ${
        isLogged 
          ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5' 
          : timeSlot.border + ' ' + timeSlot.grad
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Time Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
          {timeSlot.icon}
        </div>
        
        {/* Meal Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight mb-1">
            {meal.name}
          </h3>
          <p className="text-xs text-slate-400">
            {meal.time || timeSlot.time}
          </p>
        </div>

        {/* Log Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={logMeal}
          disabled={isLogged}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isLogged
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isLogged ? <Check size={16} /> : <Plus size={16} />}
        </motion.button>
      </div>

      {/* Nutrition Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {meal.calories && (
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              <div>
                <p className="text-sm font-bold text-white">{meal.calories}</p>
                <p className="text-[10px] text-slate-500">kcal</p>
              </div>
            </div>
          )}
          
          {meal.protein && (
            <div className="flex items-center gap-1.5">
              <Beef size={14} className="text-purple-400" />
              <div>
                <p className="text-sm font-bold text-white">{meal.protein}g</p>
                <p className="text-[10px] text-slate-500">protein</p>
              </div>
            </div>
          )}
        </div>

        {isLogged && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs text-green-400 font-medium bg-green-500/20 px-2 py-1 rounded-full"
          >
            Logged ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}