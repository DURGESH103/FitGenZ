import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakRing({ streak, max = 7, showFlame = true }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const progress = Math.min(streak / max, 1)
  const dash = circ * progress

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      {/* Background ring */}
      <svg width="80" height="80" className="-rotate-90">
        <circle 
          cx="40" 
          cy="40" 
          r={r} 
          fill="none" 
          stroke="rgba(255,255,255,0.07)" 
          strokeWidth="6" 
        />
        
        {/* Progress ring */}
        <motion.circle 
          cx="40" 
          cy="40" 
          r={r} 
          fill="none" 
          stroke="url(#streakGrad)" 
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} 
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        
        <defs>
          <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <motion.span 
          key={streak}
          initial={{ scale: 1.3, color: '#f97316' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-lg font-black leading-none"
        >
          {streak}
        </motion.span>
        <span className="text-[9px] text-orange-400 font-semibold">DAYS</span>
      </div>

      {/* Flame animation */}
      <AnimatePresence>
        {showFlame && streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.7, 1, 0.7], 
              scale: [0.8, 1, 0.8],
              rotate: [-5, 5, -5]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="absolute -top-2 -right-2"
          >
            <Flame size={16} className="text-orange-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing glow for high streaks */}
      {streak >= 7 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        />
      )}
    </div>
  )
}