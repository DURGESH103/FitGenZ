import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { Trophy, Flame, Zap, Crown, UserPlus, UserCheck } from 'lucide-react'
import { ListSkeleton } from '../components/Skeleton'

const RANK_STYLES = [
  'from-yellow-500/30 to-amber-500/15 border-yellow-500/40',
  'from-slate-400/20 to-slate-500/10 border-slate-400/30',
  'from-orange-600/25 to-orange-700/10 border-orange-600/30',
]
const RANK_ICONS = ['🥇', '🥈', '🥉']

function LeaderRow({ entry, i, onFollow }) {
  const isTop3    = i < 3
  const gradClass = isTop3 ? RANK_STYLES[i] : 'from-white/4 to-white/2 border-white/8'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`glass rounded-2xl p-4 bg-gradient-to-r border transition-all ${gradClass} ${
        entry.isMe ? 'ring-2 ring-purple-500/50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 text-center shrink-0">
          {isTop3
            ? <span className="text-xl">{RANK_ICONS[i]}</span>
            : <span className="text-sm font-bold text-slate-500">#{entry.rank}</span>}
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 text-sm font-black text-white">
          {entry.name[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm truncate ${entry.isMe ? 'text-purple-300' : 'text-white'}`}>
            {entry.name} {entry.isMe && <span className="text-[10px] text-purple-400">(you)</span>}
          </p>
          <p className="text-[11px] text-slate-500 capitalize">
            Lv.{entry.level} {entry.levelTitle} · {entry.goal?.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-xs text-orange-400">
            <Flame size={12} /><span className="font-semibold">{entry.streak}d</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <Zap size={12} /><span className="font-bold">{entry.xp.toLocaleString()}</span>
          </div>
          {!entry.isMe && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onFollow(entry)}
              className={`p-1.5 rounded-lg transition-colors ${
                entry.isFollowing
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/8 text-slate-400 hover:text-purple-400 hover:bg-purple-500/15'
              }`}
            >
              {entry.isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const [tab,     setTab]     = useState('global') // 'global' | 'weekly'
  const [board,   setBoard]   = useState([])
  const [myRank,  setMyRank]  = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (type) => {
    setLoading(true)
    try {
      const url = type === 'weekly' ? '/gamification/leaderboard/weekly' : '/gamification/leaderboard'
      const { data } = await api.get(url)
      setBoard(data.leaderboard)
      setMyRank(data.myRank)
    } catch (error) {
      console.error('Leaderboard fetch error:', error)
      if (error.response?.status === 401) {
        console.log('Authentication required for leaderboard')
      }
      // Set empty state on error
      setBoard([])
      setMyRank(null)
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  const handleFollow = async (entry) => {
    try {
      const { data } = await api.post(`/social/follow/${entry._id || entry.userId}`)
      setBoard((b) => b.map((e) => e.rank === entry.rank ? { ...e, isFollowing: data.following } : e))
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Crown size={22} className="text-yellow-400" /> Leaderboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {myRank ? `Your rank: #${myRank}` : 'Top athletes'}
        </p>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {['global', 'weekly'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              tab === t
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'glass text-slate-400 border border-purple-500/20 hover:text-slate-200'
            }`}>
            {t === 'weekly' ? '📅 This Week' : '🌍 All Time'}
          </button>
        ))}
      </div>

      {loading ? <ListSkeleton rows={8} /> : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {board.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Trophy size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No data yet — start earning XP!</p>
              </div>
            ) : (
              board.map((entry, i) => (
                <LeaderRow key={entry._id || entry.userId || `rank-${entry.rank}-${i}`} entry={entry} i={i} onFollow={handleFollow} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
