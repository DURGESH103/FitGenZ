import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ListSkeleton } from '../components/Skeleton'
import { Salad, Flame, Beef } from 'lucide-react'

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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/diet', {
          params: { gender: user.gender, goal: user.goal },
        })
        // Server returns: { diets: [ { gender, goal, meals: [...] } ] }
        // meals is a flat array: [{ time, name, calories, protein }]
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

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5 pb-24 md:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Diet Plan 🥗</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">
          Tailored for {user?.goal?.replace(/_/g, ' ')} · {user?.gender}
        </p>
      </motion.div>

      {/* Summary bar */}
      {!loading && meals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 flex items-center justify-around border border-purple-500/15"
        >
          <div className="flex items-center gap-2 text-center">
            <Flame size={18} className="text-orange-400" />
            <div>
              <p className="text-lg font-black text-white">{totalCalories}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">kcal / day</p>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex items-center gap-2 text-center">
            <Beef size={18} className="text-purple-400" />
            <div>
              <p className="text-lg font-black text-white">{totalProtein}g</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">protein / day</p>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-lg font-black text-white">{meals.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">meals</p>
          </div>
        </motion.div>
      )}

      {/* Meal cards */}
      {loading ? (
        <ListSkeleton rows={5} />
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
                className={`glass rounded-2xl p-4 bg-gradient-to-br border ${style.grad} ${style.border} transition-shadow hover:shadow-lg hover:shadow-purple-500/10`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: icon + name + time */}
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

                  {/* Right: macros */}
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
  )
}
