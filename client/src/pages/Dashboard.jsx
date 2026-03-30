import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ChartSkeleton } from '../components/Skeleton'
import { useConfetti } from '../hooks/useConfetti'
import DailyReward from '../components/DailyReward'
import AIInsights from '../components/AIInsights'
import { Flame, Trophy, CheckCircle2, Circle, Target, Zap, TrendingUp, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Streak Ring ──────────────────────────────────────────────────────────────
function StreakRing({ streak, max = 7 }) {
  const r = 28, circ = 2 * Math.PI * r
  const dash = circ * Math.min(streak / max, 1)
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="url(#sGrad)" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black text-white leading-none">{streak}</span>
        <span className="text-[9px] text-orange-400 font-semibold">DAYS</span>
      </div>
    </div>
  )
}

// ── XP Level Bar ─────────────────────────────────────────────────────────────
function XPBar({ levelInfo }) {
  if (!levelInfo) return null
  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-purple-400" />
          <span className="text-sm font-bold text-white">Level {levelInfo.level} · {levelInfo.title}</span>
        </div>
        <span className="text-xs text-slate-400">{levelInfo.xp.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progressPct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-slate-500">{levelInfo.xpIntoLevel} / {levelInfo.xpNeeded} XP</span>
        {levelInfo.next && <span className="text-[10px] text-purple-400">Next: {levelInfo.next}</span>}
      </div>
    </div>
  )
}

// ── Weekly Heatmap ────────────────────────────────────────────────────────────
function WeeklyHeatmap({ analytics }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const activityMap = {}
  analytics.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 10)
    activityMap[key] = (activityMap[key] || 0) + 1
  })

  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/15">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-purple-400" />
        <h2 className="font-bold text-white text-sm">Weekly Activity</h2>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const count = activityMap[day] || 0
          const intensity = count === 0 ? 'bg-white/5' : count === 1 ? 'bg-purple-500/30' : count <= 3 ? 'bg-purple-500/60' : 'bg-purple-500'
          const label = dayLabels[new Date(day).getDay()]
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <motion.div
                whileHover={{ scale: 1.2 }}
                title={`${day}: ${count} activities`}
                className={`w-full aspect-square rounded-lg ${intensity} cursor-default transition-colors`}
              />
              <span className="text-[9px] text-slate-600">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Goal Progress Card ────────────────────────────────────────────────────────
function GoalCard({ goalProgress, prediction }) {
  return (
    <div className="glass rounded-2xl p-4 border border-green-500/20">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-green-400" />
        <h2 className="font-bold text-white text-sm">Goal Progress</h2>
        <span className="ml-auto text-sm font-black text-green-400">{goalProgress}%</span>
      </div>
      <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${goalProgress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      {prediction?.estimatedDate && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Est. completion</span>
          <span className="text-white font-semibold">
            {new Date(prediction.estimatedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            <span className="text-slate-500 ml-1">({prediction.estimatedDays}d)</span>
          </span>
        </div>
      )}
      {prediction?.weeklyRate !== null && prediction?.weeklyRate !== undefined && (
        <p className="text-[11px] text-slate-500 mt-1">
          Trend: {prediction.weeklyRate > 0 ? '+' : ''}{prediction.weeklyRate} kg/week ·{' '}
          <span className={`font-medium ${prediction.confidence === 'high' ? 'text-green-400' : prediction.confidence === 'medium' ? 'text-yellow-400' : 'text-slate-500'}`}>
            {prediction.confidence} confidence
          </span>
        </p>
      )}
      {prediction?.confidence === 'achieved' && (
        <p className="text-xs text-green-400 font-semibold mt-1">🎉 Goal achieved!</p>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { liveStats } = useSocket()
  const { fireFromElement } = useConfetti()
  const taskBtnRefs = useRef({})

  const [tasks,          setTasks]          = useState([])
  const [progress,       setProgress]       = useState([])
  const [streak,         setStreak]         = useState(0)
  const [levelInfo,      setLevelInfo]      = useState(null)
  const [analytics,      setAnalytics]      = useState([])
  const [goalProgress,   setGoalProgress]   = useState(0)
  const [prediction,     setPrediction]     = useState(null)
  const [badges,         setBadges]         = useState([])
  const [canClaimReward, setCanClaimReward] = useState(false)
  const [streakFreezes,  setStreakFreezes]  = useState(0)
  const [loadingTasks,   setLoadingTasks]   = useState(true)
  const [loadingProgress,setLoadingProgress]= useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/task')
      setTasks(data.tasks)
    } catch { toast.error('Could not load tasks') }
    finally { setLoadingTasks(false) }
  }, [])

  const fetchProgress = useCallback(async () => {
    try {
      const { data } = await api.get('/progress?limit=7')
      setProgress(data.history.reverse())
    } catch { /* silent */ }
    finally { setLoadingProgress(false) }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, analyticsRes, predRes] = await Promise.all([
        api.get('/gamification/stats'),
        api.get('/analytics?limit=50'),
        api.get('/gamification/prediction'),
      ])
      setLevelInfo(statsRes.data.levelInfo)
      setStreak(statsRes.data.stats.streak)
      setBadges(statsRes.data.stats.badges || [])
      setCanClaimReward(statsRes.data.canClaimReward)
      setStreakFreezes(statsRes.data.streakFreezes ?? 0)
      setAnalytics(analyticsRes.data.events || [])
      setGoalProgress(predRes.data.goalProgress || 0)
      setPrediction(predRes.data.prediction)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchProgress()
    fetchStats()
  }, [fetchTasks, fetchProgress, fetchStats])

  // Apply real-time socket updates — also refresh progress chart on progress:new
  useEffect(() => {
    if (!liveStats) return
    if (liveStats.streak  !== undefined) setStreak(liveStats.streak)
    if (liveStats.xp      !== undefined && levelInfo) {
      setLevelInfo((prev) => prev ? { ...prev, xp: liveStats.xp, level: liveStats.level } : prev)
    }
    if (liveStats._progressNew) fetchProgress()
  }, [liveStats, levelInfo, fetchProgress])

  const toggleTask = async (task, e) => {
    const prev = tasks
    setTasks((t) => t.map((x) => (x._id === task._id ? { ...x, completed: !x.completed } : x)))
    try {
      await api.patch(`/task/${task._id}/complete`, { completed: !task.completed })
      if (!task.completed) {
        toast.success('Task completed! 🎉')
        fireFromElement(taskBtnRefs.current[task._id])
      }
    } catch {
      setTasks(prev)
      toast.error('Failed to update task')
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const progressPct    = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  const chartData      = progress.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    weight: p.weight,
  }))

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-safe">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs sm:text-sm">{getGreeting()},</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-0.5">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 capitalize">{user?.goal?.replace(/_/g, ' ')} · {user?.gender}</p>
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
          <StreakRing streak={streak} />
        </motion.div>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <XPBar levelInfo={levelInfo} />
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Streak',  value: `${streak}d 🔥`,                          color: 'from-orange-500/25 to-red-500/15 border-orange-500/30' },
          { label: 'Tasks',   value: `${completedCount}/${tasks.length}`,       color: 'from-yellow-500/25 to-orange-500/15 border-yellow-500/30' },
          { label: 'Goal',    value: user?.goal?.replace('_', ' '),             color: 'from-purple-500/25 to-pink-500/15 border-purple-500/30' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            className={`glass rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 bg-gradient-to-br border ${color}`}>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mb-1 uppercase tracking-wide">{label}</p>
            <p className="font-bold text-white capitalize text-xs sm:text-sm truncate">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Reward + AI Insights */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <DailyReward
            canClaim={canClaimReward}
            streakFreezes={streakFreezes}
            streak={streak}
            onClaimed={() => setCanClaimReward(false)}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <AIInsights />
        </motion.div>
      </div>

      {/* Heatmap + Goal side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <WeeklyHeatmap analytics={analytics} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <GoalCard goalProgress={goalProgress} prediction={prediction} />
        </motion.div>
      </div>

      {/* Daily Tasks */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={14} sm:size={16} className="text-purple-400" />
            <h2 className="font-bold text-white text-sm sm:text-base">Daily Tasks</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-400 font-semibold">{progressPct}%</span>
            <span className="text-xs text-slate-500">{completedCount}/{tasks.length}</span>
          </div>
        </div>
        <div className="h-2 bg-white/8 rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
            initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
        {loadingTasks ? (
          <div className="space-y-2.5">{[1,2,3].map((i) => <div key={i} className="shimmer h-11 rounded-xl" />)}</div>
        ) : tasks.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No tasks for today</p>
        ) : (
          <div className="space-y-1.5">
            {tasks.map((task, i) => (
              <motion.button key={task._id} onClick={(e) => toggleTask(task, e)}
                ref={(el) => { taskBtnRefs.current[task._id] = el }}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left group touch-manipulation">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  {task.completed
                    ? <CheckCircle2 size={18} sm:size={20} className="text-green-400 shrink-0" />
                    : <Circle size={18} sm:size={20} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />}
                </motion.div>
                <span className={`text-sm transition-colors ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </span>
                {task.completed && <span className="ml-auto text-[10px] text-green-500 font-medium shrink-0">Done ✓</span>}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Weight Chart */}
      {loadingProgress ? <ChartSkeleton /> : chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-sm sm:text-base">Weight Progress</h2>
            <span className="text-xs text-slate-500">{chartData.length} entries</span>
          </div>
          <ResponsiveContainer width="100%" height={140} sm:height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} width={30} domain={['auto','auto']} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, color: '#f1f5f9', fontSize: 11 }}
                cursor={{ stroke: 'rgba(168,85,247,0.25)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} fill="url(#wGrad)"
                dot={{ fill: '#a855f7', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#c084fc' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} sm:size={16} className="text-yellow-400" />
          <h2 className="font-bold text-white text-sm sm:text-base">Achievements</h2>
          <span className="ml-auto text-xs text-slate-500">{badges.length} unlocked</span>
        </div>
        {badges.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-3">Complete tasks to earn badges!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl cursor-default bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 touch-manipulation">
                <span className="text-xl sm:text-2xl">{b.icon}</span>
                <span className="text-[8px] sm:text-[9px] text-center text-slate-300 leading-tight font-medium">{b.label}</span>
                <span className="text-[7px] sm:text-[8px] text-yellow-400 font-bold">EARNED</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
