import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import api from '../utils/api'

export default function AIInsights() {
  const [insights, setInsights] = useState([])
  const [idx,      setIdx]      = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/gamification/insights')
      .then(({ data }) => setInsights(data.insights || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || insights.length === 0) return null

  return (
    <div className="glass rounded-2xl p-4 border border-purple-500/20 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-purple-400" />
        <span className="text-sm font-bold text-white">AI Insights</span>
        <span className="ml-auto text-[10px] text-slate-500">{idx + 1}/{insights.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="text-sm text-slate-300 leading-relaxed"
        >
          {insights[idx]}
        </motion.p>
      </AnimatePresence>

      {insights.length > 1 && (
        <button
          onClick={() => setIdx((i) => (i + 1) % insights.length)}
          className="flex items-center gap-1 mt-3 text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
        >
          Next insight <ChevronRight size={12} />
        </button>
      )}
    </div>
  )
}
