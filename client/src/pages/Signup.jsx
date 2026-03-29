import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STEPS = ['Account', 'Body', 'Goal']

const goals = [
  { value: 'weight_loss', label: '🔥 Lose Weight', desc: 'Burn fat, get lean' },
  { value: 'weight_gain', label: '💪 Gain Muscle', desc: 'Build mass & strength' },
  { value: 'fitness', label: '⚡ Stay Fit', desc: 'Improve overall fitness' },
]

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    gender: 'male', age: '', height: '', weight: '', goal: 'fitness',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Validate current step before advancing
  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) { toast.error('Name is required'); return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Enter a valid email'); return false }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
    }
    if (step === 1) {
      const age = Number(form.age)
      const height = Number(form.height)
      const weight = Number(form.weight)
      if (!form.age || isNaN(age) || age < 10 || age > 100) { toast.error('Age must be between 10 and 100'); return false }
      if (!form.height || isNaN(height) || height < 80 || height > 260) { toast.error('Height must be between 80 and 260 cm'); return false }
      if (!form.weight || isNaN(weight) || weight < 20 || weight > 350) { toast.error('Weight must be between 20 and 350 kg'); return false }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        gender: form.gender,
        goal: form.goal,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
      }
      await signup(payload)
      toast.success("Account created! Let's go 🚀")
      navigate('/dashboard')
    } catch (err) {
      // Show first validation error from server if available
      const serverErrors = err.response?.data?.errors
      const msg = serverErrors?.[0]?.msg || err.response?.data?.message || 'Signup failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f0f1a]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8">
          <div className="mb-6 text-center">
            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FitGenZ</span>
            <p className="text-slate-400 mt-1 text-sm">Create your account</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i <= step ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {i + 1}
                </div>
                <span className={`text-xs ml-1.5 ${i === step ? 'text-purple-300' : 'text-slate-500'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-purple-600' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                <input className={inputCls} type="email" placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} />
                <input className={inputCls} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => set('password', e.target.value)} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex gap-3">
                  {['male', 'female'].map((g) => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${form.gender === g ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 border border-purple-500/20'}`}>
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
                <input className={inputCls} type="number" placeholder="Age (10–100)" value={form.age} onChange={(e) => set('age', e.target.value)} />
                <input className={inputCls} type="number" placeholder="Height in cm (80–260)" value={form.height} onChange={(e) => set('height', e.target.value)} />
                <input className={inputCls} type="number" placeholder="Weight in kg (20–350)" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="text-slate-400 text-sm mb-2">What's your primary goal?</p>
                {goals.map((g) => (
                  <button key={g.value} type="button" onClick={() => set('goal', g.value)}
                    className={`w-full text-left px-4 py-4 rounded-xl border transition-colors ${form.goal === g.value ? 'border-purple-500 bg-purple-500/15 text-white' : 'border-purple-500/20 bg-white/5 text-slate-300'}`}>
                    <div className="font-semibold">{g.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-medium border border-purple-500/20">
                Back
              </button>
            )}
            {step < 2 ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
                Next →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold disabled:opacity-60">
                {loading ? 'Creating…' : 'Create Account 🚀'}
              </motion.button>
            )}
          </div>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
