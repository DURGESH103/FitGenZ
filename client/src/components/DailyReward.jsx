import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Snowflake, Zap, CheckCircle2 } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useConfetti } from '../hooks/useConfetti'

export default function DailyReward({ canClaim, streakFreezes, streak, onClaimed }) {
  const [claiming, setClaiming] = useState(false)
  const [claimed,  setClaimed]  = useState(!canClaim)
  const { fire } = useConfetti()

  const handleClaim = async () => {
    if (claiming || claimed) return
    setClaiming(true)
    try {
      const { data } = await api.post('/gamification/reward/claim')
      setClaimed(true)
      fire()
      toast.success(data.message)
      onClaimed?.(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim reward')
    } finally {
      setClaiming(false)
    }
  }

  const streakTier  = Math.floor((streak || 0) / 7)
  const streakBonus = streakTier * 25
  const totalXP     = 75 + streakBonus

  return (
    <div className="glass rounded-2xl p-4 border border-green-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            claimed ? 'bg-slate-500/20' : 'bg-green-500/20 animate-pulse'
          }`}>
            {claimed ? <CheckCircle2 size={18} className="text-slate-500" /> : <Gift size={18} className="text-green-400" />}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Daily Reward</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap size={11} className="text-purple-400" />
              <span className="text-[11px] text-slate-400">
                +{totalXP} XP
                {streakBonus > 0 && <span className="text-orange-400 ml-1">(+{streakBonus} streak bonus)</span>}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak freeze tokens */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25">
            <Snowflake size={11} className="text-blue-400" />
            <span className="text-[11px] text-blue-300 font-semibold">{streakFreezes ?? 0}</span>
          </div>

          <motion.button
            whileHover={!claimed ? { scale: 1.05 } : {}}
            whileTap={!claimed ? { scale: 0.95 } : {}}
            onClick={handleClaim}
            disabled={claimed || claiming}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              claimed
                ? 'bg-slate-500/20 text-slate-500 cursor-default'
                : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/25'
            }`}
          >
            {claiming ? '…' : claimed ? 'Claimed ✓' : 'Claim'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
