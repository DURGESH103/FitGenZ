import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import MobileDietCard from '../components/MobileDietCard'
import NutritionTracker from '../components/NutritionTracker'
import MealPlanner from '../components/MealPlanner'
import { Salad, Flame, Beef, Target, Plus, TrendingUp } from 'lucide-react'

const SLOT_STYLES = [
  { grad: 'from-orange-500/20 to-amber-500/10',  border: 'border-orange-500/25',  icon: '🌅', time: 'Breakfast' },
  { grad: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/25',   icon: '☀️', time: 'Mid Morning' },
  { grad: 'from-blue-500/20 to-cyan-500/10',     border: 'border-blue-500/25',    icon: '🍽️', time: 'Lunch' },
  { grad: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/25',  icon: '🌤️', time: 'Evening Snack' },
  { grad: 'from-pink-500/20 to-rose-500/10',     border: 'border-pink-500/25',    icon: '🌙', time: 'Dinner' },
]

export default function Diet() {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTracker, setShowTracker] = useState(false)
  const [showPlanner, setShowPlanner] = useState(false)
  const [activeTab, setActiveTab] = useState('meals') // 'meals', 'tracker', 'planner'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/diet', {
          params: { gender: user.gender, goal: user.goal },
        })
        const first = data.diets?.[0]
        if (!first) { setMeals([]); return }
        const raw = first.meals ?? first
        setMeals(Array.isArray(raw) ? raw : [])
      } catch {
        toast.error('Could not load diet plan')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0)
  const totalProtein  = meals.reduce((s, m) => s + (m.protein  || 0), 0)

  const handleMealLog = async (meal) => {
    await api.post('/analytics/track', {
      eventType: 'user_activity',
      value: 1,
      metadata: {
        action: 'meal_logged',
        mealName: meal.name,
        calories: meal.calories,
        protein: meal.protein
      }
    })
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 pb-24 md:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-black text-white">Diet Plan 🥗</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">
          Tailored for {user?.goal?.replace(/_/g, ' ')} · {user?.gender}
        </p>
      </motion.div>

      {/* Mobile Tab Navigation */}
      <div className="flex rounded-2xl bg-white/5 p-1 md:hidden">
        {[
          { id: 'meals', label: 'Meals', icon: Salad },
          { id: 'tracker', label: 'Track', icon: Target },
          { id: 'planner', label: 'Plan', icon: Plus }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Desktop Quick Actions */}
      <div className="hidden md:flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTracker(!showTracker)}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            showTracker
              ? 'bg-green-600 text-white'
              : 'glass text-slate-400 border border-green-500/20 hover:border-green-500/50'
          }`}
        >
          <Target size={16} />
          Nutrition Tracker
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPlanner(!showPlanner)}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            showPlanner
              ? 'bg-blue-600 text-white'
              : 'glass text-slate-400 border border-blue-500/20 hover:border-blue-500/50'
          }`}
        >
          <Plus size={16} />
          Meal Planner
        </motion.button>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        {activeTab === 'meals' && (
          <div className="space-y-4">
            {/* Summary */}
            {!loading && meals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 border border-purple-500/15"
              >
                <div className="flex items-center justify-around">
                  <div className="flex items-center gap-2 text-center">
                    <Flame size={16} className="text-orange-400" />
                    <div>
                      <p className="text-base font-black text-white">{totalCalories}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">kcal</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex items-center gap-2 text-center">
                    <Beef size={16} className="text-purple-400" />
                    <div>
                      <p className="text-base font-black text-white">{totalProtein}g</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">protein</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-base font-black text-white">{meals.length}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide">meals</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Meal List */}
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : meals.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8 text-center">
                <Salad size={48} className="text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No diet plan available</h3>
                <p className="text-slate-400 text-sm">Check back later for personalized meals</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {meals.map((meal, i) => {
                  const style = SLOT_STYLES[i % SLOT_STYLES.length]
                  return (
                    <MobileDietCard
                      key={i}
                      meal={meal}
                      timeSlot={style}
                      onLog={handleMealLog}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracker' && (
          <NutritionTracker
            targetCalories={totalCalories || 2000}
            targetProtein={totalProtein || 150}
            onLog={handleMealLog}
          />
        )}

        {activeTab === 'planner' && (
          <MealPlanner onSave={(meals) => console.log('Custom meals:', meals)} />
        )}
      </div>

      {/* Desktop Enhanced Features */}
      <div className="hidden md:block">
        <AnimatePresence>
          {showTracker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <NutritionTracker
                targetCalories={totalCalories || 2000}
                targetProtein={totalProtein || 150}
                onLog={handleMealLog}
              />
            </motion.div>
          )}
          {showPlanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <MealPlanner onSave={(meals) => console.log('Custom meals:', meals)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Meal Cards */}
      <div className="hidden md:block">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="glass rounded-2xl p-14 text-center">
            <Salad size={44} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No diet plan available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal, i) => {
              const style = SLOT_STYLES[i % SLOT_STYLES.length]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`glass rounded-2xl p-4 bg-gradient-to-br border ${style.grad} ${style.border} transition-all hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center text-2xl shrink-0">
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm leading-snug truncate">{meal.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {meal.time || style.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {meal.calories != null && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Flame size={11} className="text-orange-400" />
                            <span className="text-sm font-bold text-white">{meal.calories}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase">kcal</p>
                        </div>
                      )}
                      {meal.protein != null && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Beef size={11} className="text-purple-400" />
                            <span className="text-sm font-bold text-white">{meal.protein}g</span>
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase">protein</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
