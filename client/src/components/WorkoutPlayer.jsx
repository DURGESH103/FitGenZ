import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, SkipForward, CheckCircle2, Timer, ChevronRight } from 'lucide-react'
import { useConfetti } from '../hooks/useConfetti'
import api from '../utils/api'
import toast from 'react-hot-toast'

const REST_SECONDS = 15

// Parse reps string like "12" or "30 sec" → returns { reps, isTime }
const parseReps = (reps = '') => {
  const lower = reps.toLowerCase()
  if (lower.includes('sec') || lower.includes('min')) return { label: reps, isTime: true }
  return { label: reps, isTime: false }
}

function CircleTimer({ seconds, total, size = 120 }) {
  const r    = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? seconds / total : 0
  const dash = circ * pct
  const color = seconds <= 5 ? '#ef4444' : seconds <= 10 ? '#f97316' : '#a855f7'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-white leading-none">{seconds}</span>
        <span className="text-[10px] text-slate-400 font-medium">sec</span>
      </div>
    </div>
  )
}

export default function WorkoutPlayer({ workout, onClose }) {
  const { exercises = [] } = workout
  const [idx,        setIdx]        = useState(0)
  const [phase,      setPhase]      = useState('exercise') // 'exercise' | 'rest' | 'done'
  const [running,    setRunning]    = useState(false)
  const [seconds,    setSeconds]    = useState(REST_SECONDS)
  const [setsDone,   setSetsDone]   = useState(0)
  const [completed,  setCompleted]  = useState(false)
  const intervalRef  = useRef(null)
  const { fire }     = useConfetti()

  const ex      = exercises[idx]
  const isLast  = idx === exercises.length - 1
  const totalSets = ex?.sets || 3

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }, [])

  const startRest = useCallback(() => {
    setPhase('rest')
    setSeconds(REST_SECONDS)
    setRunning(true)
  }, [])

  const advanceExercise = useCallback(() => {
    stopTimer()
    if (isLast) {
      setPhase('done')
      setCompleted(true)
      fire()
      api.patch(`/task/${workout._id || 'workout'}/complete`, { completed: true }).catch(() => {})
      toast.success(`Workout complete! 🏆 +40 XP`)
    } else {
      setIdx((i) => i + 1)
      setSetsDone(0)
      setPhase('exercise')
    }
  }, [isLast, stopTimer, fire, workout._id])

  // Countdown tick
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          if (phase === 'rest') setPhase('exercise')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phase])

  const handleSetDone = () => {
    const next = setsDone + 1
    setSetsDone(next)
    if (next >= totalSets) {
      advanceExercise()
    } else {
      startRest()
    }
  }

  const toggleTimer = () => {
    if (phase !== 'rest') return
    setRunning((r) => !r)
  }

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="glass rounded-3xl p-10 text-center max-w-sm w-full border border-purple-500/30">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">Workout Complete!</h2>
          <p className="text-slate-400 mb-2">{exercises.length} exercises · {workout.title}</p>
          <p className="text-purple-400 font-bold text-lg mb-6">+40 XP earned ⚡</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
            Back to Workouts
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0a0a14] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b border-white/8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Now Playing</p>
          <h2 className="font-bold text-white text-sm truncate max-w-[220px]">{workout.title}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/8">
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{ width: `${((idx) / exercises.length) * 100}%` }}
          transition={{ duration: 0.4 }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <AnimatePresence mode="wait">
          {phase === 'rest' ? (
            <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Rest Time</p>
              <CircleTimer seconds={seconds} total={REST_SECONDS} size={140} />
              <button onClick={toggleTimer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-purple-500/30 text-purple-300 text-sm font-medium">
                {running ? <Pause size={15} /> : <Play size={15} />}
                {running ? 'Pause' : 'Resume'}
              </button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { stopTimer(); setPhase('exercise') }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Skip rest →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key={`ex-${idx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} className="w-full max-w-sm flex flex-col items-center gap-5">

              {/* Exercise number badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{idx + 1} / {exercises.length}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs text-purple-400 font-medium">
                  Set {setsDone + 1} of {totalSets}
                </span>
              </div>

              {/* Exercise icon */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-4xl">💪</span>
              </div>

              {/* Name + reps */}
              <div className="text-center">
                <h3 className="text-2xl font-black text-white mb-2">{ex?.name}</h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-bold border border-purple-500/30">
                    {ex?.sets} sets
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 text-sm font-bold border border-pink-500/30">
                    {ex?.reps}
                  </span>
                </div>
              </div>

              {/* Sets progress dots */}
              <div className="flex gap-2">
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < setsDone ? 'bg-green-400' : i === setsDone ? 'bg-purple-400 animate-pulse' : 'bg-white/15'}`} />
                ))}
              </div>

              {/* Done button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSetDone}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                {setsDone + 1 < totalSets ? `Set ${setsDone + 1} Done` : isLast ? 'Finish Workout 🏆' : 'Next Exercise'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise queue */}
      <div className="px-5 pb-6 border-t border-white/8 pt-4">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Up next</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {exercises.slice(idx + 1, idx + 4).map((e, i) => (
            <div key={i} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{e.name}</span>
              <ChevronRight size={12} className="text-slate-600" />
            </div>
          ))}
          {exercises.slice(idx + 1).length === 0 && (
            <span className="text-xs text-slate-600 py-2">Last exercise!</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
