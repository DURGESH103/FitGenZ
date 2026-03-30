import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function EnhancedStatsCard({ 
  label, 
  value, 
  previousValue, 
  icon: Icon, 
  color, 
  suffix = '',
  delay = 0 
}) {
  const getTrend = () => {
    if (!previousValue || previousValue === value) return { icon: Minus, color: 'text-slate-500', text: 'No change' }
    if (value > previousValue) return { icon: TrendingUp, color: 'text-green-400', text: `+${value - previousValue}${suffix}` }
    return { icon: TrendingDown, color: 'text-red-400', text: `${value - previousValue}${suffix}` }
  }

  const trend = getTrend()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass rounded-2xl p-4 bg-gradient-to-br border ${color} relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white" />
        <div className="absolute -left-2 -bottom-2 w-12 h-12 rounded-full bg-white" />
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Icon size={16} className="text-white/80" />
          <div className="flex items-center gap-1">
            <trend.icon size={12} className={trend.color} />
            <span className={`text-[10px] font-medium ${trend.color}`}>
              {trend.text}
            </span>
          </div>
        </div>
        
        <div>
          <motion.p 
            className="text-2xl font-black text-white mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
          >
            {value}{suffix}
          </motion.p>
          <p className="text-xs text-white/60 uppercase tracking-wide font-semibold">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}