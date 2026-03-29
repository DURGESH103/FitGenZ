import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Bot, Shield } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Smart Workouts', desc: 'AI-personalized plans for your body & goals' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'Visual charts to see your transformation' },
  { icon: Bot, title: 'AI Coach', desc: 'Get instant fitness & diet advice 24/7' },
  { icon: Shield, title: 'Safe & Science-backed', desc: 'Recommendations built on proven methods' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] overflow-hidden">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-6">
            🔥 Built for Gen Z Athletes
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              FitGenZ
            </span>
            <br />
            <span className="text-white">Your AI Fitness</span>
            <br />
            <span className="text-slate-400">Companion</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            Personalized workouts, smart diet plans, and an AI coach — all in one premium app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
              >
                Start Free →
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl glass text-slate-300 font-semibold text-lg border border-purple-500/30 hover:border-purple-500/60 transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="glass rounded-2xl p-6 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Icon size={20} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
