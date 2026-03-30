import { motion } from 'framer-motion'
import { Plus, Dumbbell, Apple, Target, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function QuickActions() {
  const navigate = useNavigate()
  
  const actions = [
    { icon: Plus, label: 'Log Progress', path: '/progress', color: 'from-blue-500 to-cyan-400' },
    { icon: Dumbbell, label: 'Workout', path: '/workout', color: 'from-red-500 to-orange-400' },
    { icon: Apple, label: 'Diet Plan', path: '/diet', color: 'from-green-500 to-emerald-400' },
    { icon: Target, label: 'AI Coach', path: '/ai', color: 'from-purple-500 to-pink-400' }
  ]

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <Zap size={14} className="text-yellow-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            onClick={() => navigate(action.path)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium text-xs flex items-center gap-2 hover:shadow-lg transition-all`}
          >
            <action.icon size={14} />
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}