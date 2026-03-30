import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function ProgressLogger({ onLog }) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [isLogging, setIsLogging] = useState(false)

  const logProgress = async () => {
    if (!weight) {
      toast.error('Please enter your weight')
      return
    }

    setIsLogging(true)
    try {
      await api.post('/progress', {
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined
      })
      toast.success('Progress logged! 📊')
      setWeight('')
      setBodyFat('')
      onLog?.()
    } catch (error) {
      toast.error('Failed to log progress')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-4 border border-blue-500/20">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Scale size={14} className="text-blue-400" />
        Log Progress
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-2">Weight (kg) *</label>
          <input
            type="number"
            placeholder="70.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2">Body Fat % (optional)</label>
          <input
            type="number"
            placeholder="15.2"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={logProgress}
          disabled={isLogging || !weight}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp size={16} />
          {isLogging ? 'Logging...' : 'Log Progress'}
        </motion.button>
      </div>
    </div>
  )
}