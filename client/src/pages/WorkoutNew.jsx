import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import WorkoutPlayer from '../components/WorkoutPlayer'
import MobileWorkoutCard from '../components/MobileWorkoutCard'
import MobileFilterSheet from '../components/MobileFilterSheet'
import { Dumbbell, Filter, Search } from 'lucide-react'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const CATEGORIES = ['home', 'gym']

export default function Workout() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('beginner')
  const [category, setCategory] = useState('home')
  const [playing, setPlaying] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
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

  const handleWorkoutComplete = async (workout, completedCount, totalCount) => {
    try {
      await api.post('/progress', {
        type: 'workout',
        workoutTitle: workout.title,
        completedExercises: completedCount,
        totalExercises: totalCount,
        completionRate: Math.round((completedCount / totalCount) * 100)
      })
    } catch {
      toast.error('Failed to log workout')
    }
  }

  const filteredWorkouts = workouts.filter(workout =>
    workout.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <AnimatePresence>
        {playing && (
          <WorkoutPlayer workout={playing} onClose={() => setPlaying(null)} />
        )}
      </AnimatePresence>

      <MobileFilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Workout Filters"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-300 mb-3 font-medium">Difficulty Level</p>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <motion.button
                  key={l}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLevel(l)
                    setShowFilters(false)
                  }}
                  className={`py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                    level === l
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {l}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-300 mb-3 font-medium">Location</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCategory(c)
                    setShowFilters(false)
                  }}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    category === c
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {c === 'home' ? '🏠 Home' : '🏋️ Gym'}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </MobileFilterSheet>

      <div className="p-4 max-w-4xl mx-auto space-y-4 pb-24 md:pb-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-white">Workouts 💪</h1>
          <p className="text-slate-400 text-sm mt-1">Personalized for your goal</p>
        </motion.div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors text-base"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(true)}
            className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2 shrink-0"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Active filters:</span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            level === 'beginner' ? 'bg-green-500/20 text-green-400' :
            level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {level}
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-slate-400">
            {category === 'home' ? '🏠 Home' : '🏋️ Gym'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
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
        ) : filteredWorkouts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="glass rounded-2xl p-8 text-center"
          >
            <Dumbbell size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              {searchTerm ? 'No workouts found' : 'No workouts available'}
            </h3>
            <p className="text-slate-400 text-sm">
              {searchTerm ? 'Try a different search term' : 'Try different filters'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts.map((workout, index) => (
              <MobileWorkoutCard
                key={index}
                workout={workout}
                level={level}
                category={category}
                onStart={setPlaying}
                onComplete={handleWorkoutComplete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}