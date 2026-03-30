import { motion } from 'framer-motion'
import { Zap, Target, Flame, Trophy } from 'lucide-react'

export default function CompactDashboard({ 
  streak, 
  completedTasks, 
  totalTasks, 
  level, 
  xp, 
  goalProgress 
}) {
  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="md:hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 mb-4"
      >
        {/* Top row - Key metrics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <p className="text-xs text-slate-400">Streak</p>
            <p className="text-sm font-bold text-white">{streak}d</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
            <p className="text-xs text-slate-400">Tasks</p>
            <p className="text-sm font-bold text-white">{completedTasks}/{totalTasks}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <p className="text-xs text-slate-400">Level</p>
            <p className="text-sm font-bold text-white">{level}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <p className="text-xs text-slate-400">Goal</p>
            <p className="text-sm font-bold text-white">{goalProgress}%</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Daily Tasks</span>
              <span className="text-xs text-white font-medium">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Goal Progress</span>
              <span className="text-xs text-white font-medium">{goalProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}