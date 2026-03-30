import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'

export default function WorkoutTimer({ 
  duration = 60, 
  onComplete, 
  autoStart = false,
  label = "Rest Timer" 
}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            onComplete?.()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, onComplete])

  const reset = () => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsComplete(false)
  }

  const toggle = () => {
    if (isComplete) {
      reset()
    } else {
      setIsRunning(!isRunning)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="glass rounded-2xl p-4 border border-blue-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-blue-400" />
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <button
          onClick={reset}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <RotateCcw size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="text-center mb-4">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-black ${isComplete ? 'text-green-400' : 'text-white'}`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
      </div>

      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <button
        onClick={toggle}
        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          isComplete 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : isRunning 
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isComplete ? (
          <>
            <RotateCcw size={16} />
            Reset
          </>
        ) : isRunning ? (
          <>
            <Pause size={16} />
            Pause
          </>
        ) : (
          <>
            <Play size={16} />
            Start
          </>
        )}
      </button>
    </div>
  )
}