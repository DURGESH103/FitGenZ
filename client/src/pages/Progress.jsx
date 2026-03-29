import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { ChartSkeleton } from '../components/Skeleton'
import { Plus, TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Area, AreaChart,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2 border border-purple-500/30 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value} kg</p>
    </div>
  )
}

export default function Progress() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ weight: '', bodyFat: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/progress?limit=20')
      setHistory(data.history.reverse())
    } catch {
      toast.error('Could not load progress')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  // Live chart update when progress:new fires
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data?.entry) {
        setHistory((prev) => {
          const updated = [...prev, data.entry].sort((a, b) => new Date(a.date) - new Date(b.date))
          return updated
        })
      }
    }
    socket.on('progress:new', handler)
    return () => socket.off('progress:new', handler)
  }, [socket])

  const handleLog = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/progress', {
        weight: +form.weight,
        bodyFat: form.bodyFat ? +form.bodyFat : undefined,
      })
      toast.success('Progress logged! 📈')
      setForm({ weight: '', bodyFat: '' })
      setShowForm(false)
      fetchHistory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log progress')
    } finally {
      setSubmitting(false)
    }
  }

  const chartData = history.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    weight: p.weight,
  }))

  const latest = history[history.length - 1]
  const first  = history[0]
  const diff   = latest && first ? +(latest.weight - first.weight).toFixed(1) : null

  const DiffIcon = diff === null ? Minus : diff > 0 ? TrendingUp : TrendingDown
  const diffColor = diff === null ? 'text-slate-400' : diff > 0 ? 'text-red-400' : 'text-green-400'

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white">Progress 📊</h1>
          <p className="text-slate-400 text-sm mt-1">Track your transformation</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25"
        >
          <Plus size={16} />
          Log
        </motion.button>
      </div>

      {/* Log form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLog}
            className="glass rounded-2xl p-5 space-y-4 border border-purple-500/20 overflow-hidden"
          >
            <h3 className="font-bold text-white flex items-center gap-2">
              <Scale size={16} className="text-purple-400" />
              Log Today's Progress
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Weight (kg) *</label>
                <input
                  required type="number" step="0.1" min="20" max="350"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Body Fat % <span className="text-slate-600">(optional)</span></label>
                <input
                  type="number" step="0.1" min="1" max="60"
                  value={form.bodyFat}
                  onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                  className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
                  placeholder="18.5"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save Entry'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      {latest && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Current', value: `${latest.weight} kg`, sub: 'latest entry', color: 'text-white', grad: 'from-purple-500/20 to-pink-500/10 border-purple-500/25' },
            { label: 'Starting', value: first ? `${first.weight} kg` : '—', sub: 'first entry', color: 'text-slate-300', grad: 'from-slate-500/15 to-slate-500/5 border-slate-500/20' },
            { label: 'Change', value: diff !== null ? `${diff > 0 ? '+' : ''}${diff} kg` : '—', sub: 'total', color: diffColor, grad: diff > 0 ? 'from-red-500/15 to-red-500/5 border-red-500/20' : 'from-green-500/15 to-green-500/5 border-green-500/20' },
          ].map(({ label, value, sub, color, grad }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.04, y: -2 }}
              className={`glass rounded-2xl p-4 text-center bg-gradient-to-br border ${grad}`}
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className={`font-black text-base ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <ChartSkeleton />
      ) : chartData.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center border border-dashed border-purple-500/20"
        >
          {/* SVG illustration */}
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-4 opacity-40">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M20 52 L32 36 L44 44 L56 28" stroke="#a855f7" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="52" r="3" fill="#a855f7" />
            <circle cx="32" cy="36" r="3" fill="#a855f7" />
            <circle cx="44" cy="44" r="3" fill="#a855f7" />
            <circle cx="56" cy="28" r="3" fill="#a855f7" />
          </svg>
          <p className="text-slate-300 font-semibold text-lg">No progress yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">Start logging your weight to see your transformation chart</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168,85,247,0.35)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25"
          >
            <Plus size={16} />
            Add First Entry
          </motion.button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Weight Over Time</h2>
            <div className="flex items-center gap-1.5">
              <DiffIcon size={14} className={diffColor} />
              <span className={`text-xs font-semibold ${diffColor}`}>
                {diff !== null ? `${diff > 0 ? '+' : ''}${diff} kg` : '—'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={35} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              {user?.weight && (
                <ReferenceLine y={user.weight} stroke="rgba(168,85,247,0.25)" strokeDasharray="4 4"
                  label={{ value: 'Start', fill: '#475569', fontSize: 9, position: 'insideTopRight' }} />
              )}
              <Area type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2.5}
                fill="url(#progGrad)"
                dot={{ fill: '#a855f7', r: 3.5, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#c084fc', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* History list */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">History</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[...history].reverse().map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/4 hover:bg-white/7 transition-colors"
              >
                <span className="text-sm text-slate-400">
                  {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white font-semibold">{p.weight} kg</span>
                  {p.bodyFat != null && (
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">{p.bodyFat}% fat</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
