import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Dumbbell, Apple, TrendingUp, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const actions = [
    { icon: TrendingUp, label: 'Log Progress', path: '/progress', color: 'bg-blue-500' },
    { icon: Dumbbell, label: 'Workout', path: '/workout', color: 'bg-red-500' },
    { icon: Apple, label: 'Diet', path: '/diet', color: 'bg-green-500' },
    { icon: Target, label: 'AI Coach', path: '/ai', color: 'bg-purple-500' }
  ]

  const handleAction = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleAction(action.path)}
                className={`flex items-center gap-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all`}
              >
                <action.icon size={18} />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  )
}