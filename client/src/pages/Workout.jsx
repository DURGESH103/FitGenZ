import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ListSkeleton } from '../components/Skeleton'
import WorkoutPlayer from '../components/WorkoutPlayer'
import { ChevronDown, Dumbbell, Clock, Zap, BarChart2, Play } from 'lucide-react'

const LEVELS     = ['beginner', 'intermediate', 'advanced']
const CATEGORIES = ['home', 'gym']

const LEVEL_BADGE = {
  beginner:     { color: 'bg-green-500/20 text-green-400 border-green-500/30',     label: 'Beginner'     },
  intermediate: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Intermediate' },
  advanced:     { color: 'bg-red-500/20 text-red-400 border-red-500/30',           label: 'Advanced'     },
}

const estimateDuration = (count) => `${count * 4}–${count * 6} min`

export default function Workout() {
  const { user }   = useAuth()
  const [workouts, setWorkouts]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [level,    setLevel]      = useState('beginner')
  const [category, setCategory]   = useState('home')
  const [expanded, setExpanded]   = useState(null)
  const [playing,  setPlaying]    = useState(null) // workout being played

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setExpanded(null)
      try {
        const { data } = await api.get('/workout', {
          params: { gender: user.gender, goal: user.goal, level, category },
        })
        setWorkouts(data.workouts)
      } catch {
        toast.error('Could not load workouts')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, level, category])

  const badge = LEVEL_BADGE[level]

  return (
    <>
      {/* Workout Player overlay */}
      <AnimatePresence>
        {playing && (
          <WorkoutPlayer workout={playing} onClose={() => setPlaying(null)} />
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5 pb-24 md:pb-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white">Workouts 💪</h1>
          <p className="text-slate-400 text-sm mt-1">Personalized for your goal</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((l) => (
            <motion.button key={l} whileTap={{ scale: 0.95 }} onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                level === l
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'glass text-slate-400 border border-purple-500/20 hover:border-purple-500/50 hover:text-slate-200'
              }`}>
              {l}
            </motion.button>
          ))}
          <div className="w-px bg-white/10 mx-1 self-stretch" />
          {CATEGORIES.map((c) => (
            <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === c
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                  : 'glass text-slate-400 border border-purple-500/20 hover:border-purple-500/50 hover:text-slate-200'
              }`}>
              {c === 'home' ? '🏠 Home' : '🏋️ Gym'}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <ListSkeleton rows={3} />
        ) : workouts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-14 text-center">
            <Dumbbell size={44} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No workouts found</p>
            <p className="text-slate-600 text-sm mt-1">Try a different level or category</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {workouts.map((w, wi) => {
              const exCount = w.exercises?.length || 0
              const isOpen  = expanded === wi
              return (
                <motion.div key={wi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wi * 0.06 }}
                  className="glass rounded-2xl overflow-hidden border border-purple-500/10 hover:border-purple-500/25 transition-colors">

                  {/* Card header */}
                  <button onClick={() => setExpanded(isOpen ? null : wi)}
                    className="w-full flex items-start justify-between p-5 text-left hover:bg-white/4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/8 text-slate-400 border border-white/10 capitalize">
                          {category === 'home' ? '🏠 Home' : '🏋️ Gym'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{w.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <BarChart2 size={12} className="text-purple-400" />{exCount} exercises
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} className="text-pink-400" />{estimateDuration(exCount)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Zap size={12} className="text-yellow-400" />
                          {level === 'beginner' ? 'Low' : level === 'intermediate' ? 'Medium' : 'High'} intensity
                        </span>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-3 mt-1 shrink-0">
                      <ChevronDown size={18} className="text-slate-500" />
                    </motion.div>
                  </button>

                  {/* Exercises + Start button */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="exercises"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 pt-1 space-y-2 border-t border-white/6">
                          <p className="text-xs text-slate-500 pt-3 pb-1 uppercase tracking-wider font-medium">Exercises</p>
                          {w.exercises?.map((ex, ei) => (
                            <motion.div key={ei} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ei * 0.04 }}
                              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-purple-400">{ei + 1}</span>
                                </div>
                                <p className="text-sm font-semibold text-white">{ex.name}</p>
                              </div>
                              <p className="text-xs font-semibold text-purple-300 bg-purple-500/15 px-2 py-1 rounded-lg shrink-0">
                                {ex.sets} × {ex.reps}
                              </p>
                            </motion.div>
                          ))}

                          {/* Start Workout button */}
                          <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(168,85,247,0.35)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPlaying(w)}
                            className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                          >
                            <Play size={16} fill="white" />
                            Start Workout
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
