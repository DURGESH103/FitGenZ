import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Clock, Flame, Beef } from 'lucide-react'
import toast from 'react-hot-toast'

const MEAL_TIMES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'snack1', label: 'Mid Morning', icon: '☀️' },
  { id: 'lunch', label: 'Lunch', icon: '🍽️' },
  { id: 'snack2', label: 'Evening Snack', icon: '🌤️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' }
]

export default function MealPlanner({ onSave }) {
  const [customMeals, setCustomMeals] = useState({})
  const [showAddMeal, setShowAddMeal] = useState(null)
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', protein: '' })

  const addMeal = (timeId) => {
    if (!newMeal.name.trim()) {
      toast.error('Please enter a meal name')
      return
    }

    const meal = {
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      protein: parseInt(newMeal.protein) || 0,
      time: MEAL_TIMES.find(t => t.id === timeId)?.label || timeId
    }

    setCustomMeals(prev => ({
      ...prev,
      [timeId]: [...(prev[timeId] || []), meal]
    }))

    setNewMeal({ name: '', calories: '', protein: '' })
    setShowAddMeal(null)
    toast.success('Meal added!')
  }

  const removeMeal = (timeId, index) => {
    setCustomMeals(prev => ({
      ...prev,
      [timeId]: prev[timeId].filter((_, i) => i !== index)
    }))
  }

  const savePlan = () => {
    const allMeals = []
    Object.entries(customMeals).forEach(([timeId, meals]) => {
      meals.forEach(meal => allMeals.push(meal))
    })

    if (allMeals.length === 0) {
      toast.error('Add at least one meal')
      return
    }

    onSave?.(allMeals)
    toast.success('Meal plan saved!')
  }

  const totalCalories = Object.values(customMeals).flat().reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = Object.values(customMeals).flat().reduce((sum, meal) => sum + meal.protein, 0)

  return (
    <div className="glass rounded-2xl p-4 border border-blue-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={14} className="text-blue-400" />
          Custom Meal Planner
        </h3>
        {Object.keys(customMeals).length > 0 && (
          <button
            onClick={savePlan}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Plan
          </button>
        )}
      </div>

      {totalCalories > 0 && (
        <div className="flex items-center justify-around mb-4 p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 text-center">
            <Flame size={14} className="text-orange-400" />
            <div>
              <p className="text-sm font-bold text-white">{totalCalories}</p>
              <p className="text-[9px] text-slate-400">kcal</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2 text-center">
            <Beef size={14} className="text-purple-400" />
            <div>
              <p className="text-sm font-bold text-white">{totalProtein}g</p>
              <p className="text-[9px] text-slate-400">protein</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {MEAL_TIMES.map(mealTime => (
          <div key={mealTime.id} className="border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mealTime.icon}</span>
                <span className="text-sm font-medium text-white">{mealTime.label}</span>
              </div>
              <button
                onClick={() => setShowAddMeal(mealTime.id)}
                className="w-6 h-6 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
              >
                <Plus size={12} className="text-green-400" />
              </button>
            </div>

            {customMeals[mealTime.id]?.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg mb-1"
              >
                <div>
                  <p className="text-xs font-medium text-white">{meal.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {meal.calories} kcal • {meal.protein}g protein
                  </p>
                </div>
                <button
                  onClick={() => removeMeal(mealTime.id, index)}
                  className="w-5 h-5 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                >
                  <X size={10} className="text-red-400" />
                </button>
              </motion.div>
            ))}

            <AnimatePresence>
              {showAddMeal === mealTime.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Meal name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500/50"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Calories"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500/50"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addMeal(mealTime.id)}
                      className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddMeal(null)}
                      className="px-4 py-2 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}