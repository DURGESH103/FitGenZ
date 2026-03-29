import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { Trophy, Flame, Zap, Crown } from 'lucide-react'
import { ListSkeleton } from '../components/Skeleton'

const RANK_STYLES = [
  'from-yellow-500/30 to-amber-500/15 border-yellow-500/40',
  'from-slate-400/20 to-slate-500/10 border-slate-400/30',
  'from-orange-600/25 to-orange-700/10 border-orange-600/30',
]
const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [board, setBoard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gamification/leaderboard')
      .then(({ data }) => { setBoard(data.leaderboard); setMyRank(data.myRank) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Crown size={22} className="text-yellow-400" /> Leaderboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {myRank ? `Your rank: #${myRank}` : 'Top athletes this week'}
        </p>
      </motion.div>

      {loading ? <ListSkeleton rows={8} /> : (
        <div className="space-y-2">
          {board.map((entry, i) => {
            const isTop3 = i < 3
            const gradClass = isTop3 ? RANK_STYLES[i] : 'from-white/4 to-white/2 border-white/8'
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-4 bg-gradient-to-r border transition-all ${gradClass} ${
                  entry.isMe ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-9 text-center shrink-0">
                    {isTop3
                      ? <span className="text-xl">{RANK_ICONS[i]}</span>
                      : <span className="text-sm font-bold text-slate-500">#{entry.rank}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 text-sm font-black text-white">
                    {entry.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm truncate ${entry.isMe ? 'text-purple-300' : 'text-white'}`}>
                        {entry.name} {entry.isMe && <span className="text-[10px] text-purple-400">(you)</span>}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 capitalize">
                      Lv.{entry.level} {entry.levelTitle} · {entry.goal?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Flame size={12} />
                      <span className="font-semibold">{entry.streak}d</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-400">
                      <Zap size={12} />
                      <span className="font-bold">{entry.xp.toLocaleString()}</span>
                    </div>
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
