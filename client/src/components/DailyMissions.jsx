import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, Circle, Zap, Gift } from 'lucide-react'
import { useState, useRef } from 'react'

export default function DailyMissions({ 
  tasks = [], 
  onTaskToggle, 
  loading = false,
  onTaskComplete 
}) {
  const [completingTasks, setCompletingTasks] = useState(new Set())
  const taskRefs = useRef({})

  const completedCount = tasks.filter(t => t.completed).length
  const progressPct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  const allCompleted = tasks.length > 0 && completedCount === tasks.length

  const handleTaskToggle = async (task) => {
    if (completingTasks.has(task._id)) return
    
    setCompletingTasks(prev => new Set([...prev, task._id]))
    
    try {
      await onTaskToggle(task)
      if (!task.completed && onTaskComplete) {
        onTaskComplete(taskRefs.current[task._id])
      }
    } finally {
      setCompletingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(task._id)
        return newSet
      })
    }
  }

  return (
    <div className="glass rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      
      {/* All completed celebration */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-2 right-2 z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Gift size={20} className="text-yellow-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={allCompleted ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: allCompleted ? Infinity : 0 }}
            >
              <Target size={16} className="text-purple-400" />
            </motion.div>
            <h2 className="font-bold text-white text-base">Daily Missions</h2>
          </div>
          <div className="flex items-center gap-3">
            <motion.span 
              key={progressPct}
              initial={{ scale: 1.2, color: '#a855f7' }}
              animate={{ scale: 1, color: progressPct === 100 ? '#facc15' : '#a855f7' }}
              className="text-sm font-bold"
            >
              {progressPct}%
            </motion.span>
            <span className="text-xs text-slate-500">
              {completedCount}/{tasks.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white/8 rounded-full mb-4 overflow-hidden relative">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'linear',
                repeatDelay: 1 
              }}
            />
          </motion.div>
        </div>

        {/* Tasks list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="shimmer h-12 rounded-xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 text-sm text-center py-6"
          >
            No missions for today 🎯
          </motion.p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <motion.button
                key={task._id}
                ref={el => taskRefs.current[task._id] = el}
                onClick={() => handleTaskToggle(task)}
                disabled={completingTasks.has(task._id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all text-left group disabled:opacity-50"
              >
                {/* Task icon */}
                <motion.div
                  animate={completingTasks.has(task._id) ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {task.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <CheckCircle2 size={20} className="text-green-400" />
                    </motion.div>
                  ) : (
                    <Circle 
                      size={20} 
                      className="text-slate-600 group-hover:text-slate-400 transition-colors" 
                    />
                  )}
                </motion.div>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm transition-colors ${
                    task.completed 
                      ? 'line-through text-slate-500' 
                      : 'text-slate-200'
                  }`}>
                    {task.title}
                  </span>
                  {task.xpReward && (
                    <div className="flex items-center gap-1 mt-1">
                      <Zap size={10} className="text-yellow-400" />
                      <span className="text-[10px] text-yellow-400 font-medium">
                        +{task.xpReward} XP
                      </span>
                    </div>
                  )}
                </div>

                {/* Completion indicator */}
                <AnimatePresence>
                  {task.completed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full"
                    >
                      DONE
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        )}

        {/* Completion bonus indicator */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
            >
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">
                  All missions complete! Bonus XP earned! 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}