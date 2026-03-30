import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function XPBar({ levelInfo, xpGain = 0 }) {
  const [showXPGain, setShowXPGain] = useState(false)

  useEffect(() => {
    if (xpGain > 0) {
      setShowXPGain(true)
      const timer = setTimeout(() => setShowXPGain(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [xpGain])

  if (!levelInfo) return null

  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/20 relative overflow-hidden">
      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.6 }}
            className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-purple-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-400/30"
          >
            <Zap size={12} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">+{xpGain}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: levelInfo.level > 5 ? 360 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <Star size={14} className="text-purple-400" />
          </motion.div>
          <span className="text-sm font-bold text-white">
            Level {levelInfo.level} · {levelInfo.title}
          </span>
        </div>
        <motion.span 
          key={levelInfo.xp}
          initial={{ scale: 1.2, color: '#a855f7' }}
          animate={{ scale: 1, color: '#94a3b8' }}
          className="text-xs font-semibold"
        >
          {levelInfo.xp.toLocaleString()} XP
        </motion.span>
      </div>

      {/* Animated Progress Bar */}
      <div className="h-3 bg-white/8 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 relative"
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progressPct}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-slate-500">
          {levelInfo.xpIntoLevel} / {levelInfo.xpNeeded} XP
        </span>
        {levelInfo.next && (
          <span className="text-[10px] text-purple-400 font-medium">
            Next: {levelInfo.next}
          </span>
        )}
      </div>
    </div>
  )
}