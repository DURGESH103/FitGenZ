import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Send, Bot, User, Sparkles, RefreshCw, Zap } from 'lucide-react'

const QUICK_PROMPTS = [
  { label: '💪 Workout plan', text: 'Give me a personalized workout plan for today', gradient: 'from-purple-500/20 to-blue-500/10' },
  { label: '🥗 Diet advice',   text: 'What should I eat today for my goals?', gradient: 'from-green-500/20 to-emerald-500/10' },
  { label: '🔥 Weight loss',  text: 'How can I lose weight safely and effectively?', gradient: 'from-orange-500/20 to-red-500/10' },
  { label: '🥚 Protein tips', text: 'Best budget protein sources available in India', gradient: 'from-yellow-500/20 to-orange-500/10' },
]

function parseRec(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
  } catch {}
  return null
}

function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user'
  const parsed = !isUser ? parseRec(msg.content) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser 
          ? 'bg-gradient-to-br from-purple-600 to-purple-700 glow-sm' 
          : 'bg-gradient-to-br from-purple-600 to-pink-600 glow-sm'
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {parsed ? (
          /* ── Structured AI Response Cards ── */
          <div className="space-y-2.5 w-full">
            {parsed.workoutSuggestion && (
              <motion.div
                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-bright rounded-2xl rounded-tl-sm p-4 border border-purple-500/25"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <span className="text-[10px]">💪</span>
                  </div>
                  <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wide">Workout Plan</p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.workoutSuggestion}</p>
              </motion.div>
            )}
            {parsed.dietSuggestion && (
              <motion.div
                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-bright rounded-2xl p-4 border border-green-500/25"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-lg bg-green-500/30 flex items-center justify-center">
                    <span className="text-[10px]">🥗</span>
                  </div>
                  <p className="text-[11px] text-green-400 font-bold uppercase tracking-wide">Diet Plan</p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.dietSuggestion}</p>
              </motion.div>
            )}
            {parsed.caution && (
              <motion.div
                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-bright rounded-2xl p-4 border border-yellow-500/25"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                    <span className="text-[10px]">⚠️</span>
                  </div>
                  <p className="text-[11px] text-yellow-400 font-bold uppercase tracking-wide">Important Note</p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.caution}</p>
              </motion.div>
            )}
          </div>
        ) : (
          /* ── Regular Message Bubble ── */
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-full ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-sm glow-sm'
              : 'glass-bright text-slate-200 rounded-tl-sm border border-purple-500/20'
          }`}>
            {msg.content}
          </div>
        )}
        
        {/* Timestamp */}
        <span className="text-[10px] text-slate-600 px-1 font-medium">
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 glow-sm">
        <Bot size={14} />
      </div>
      <div className="glass-bright rounded-2xl rounded-tl-sm px-4 py-4 border border-purple-500/20">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ 
                y: [0, -6, 0], 
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function AI() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey ${user?.name?.split(' ')[0]}! 👋 I'm your AI fitness coach powered by advanced AI. I'll give you personalized advice based on your profile and goals. What would you like to know?`,
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: msg, ts: Date.now() }])
    setLoading(true)
    
    try {
      const { data } = await api.get('/ai/recommend', { params: { goal: user.goal } })
      const content = data.recommendation || 'Sorry, I could not generate a recommendation right now.'
      setMessages((m) => [...m, { role: 'assistant', content, ts: Date.now() }])
    } catch (err) {
      const status = err.response?.status
      const serverMsg = err.response?.data?.message || ''
      let errMsg = 'Something went wrong. Please try again.'
      
      if (status === 400 && serverMsg.toLowerCase().includes('openai')) {
        errMsg = 'AI features require an OpenAI API key. Add OPENAI_API_KEY to your server .env file to enable this feature.'
      } else if (status === 401) {
        errMsg = 'Session expired. Please log in again.'
      } else if (serverMsg) {
        errMsg = serverMsg
      }
      
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${errMsg}`, ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault()
      send() 
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! Ready to help you crush your fitness goals 💪`,
      ts: Date.now(),
    }])
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto relative">

      {/* ── Header ── */}
      <div className="glass-bright border-b border-purple-500/20 px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center glow-purple">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <h1 className="font-black text-white text-base">AI Fitness Coach</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <motion.div 
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-[11px] text-green-400 font-semibold">Online</p>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-purple-400" />
              <p className="text-[11px] text-purple-400 font-semibold">Powered by GPT</p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearChat}
          className="p-2.5 rounded-xl hover:bg-white/8 transition-colors text-slate-500 hover:text-slate-300"
        >
          <RefreshCw size={16} />
        </motion.button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ paddingBottom: '1rem' }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} index={i} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick Prompts ── */}
      <AnimatePresence>
        {messages.length <= 1 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="px-5 pb-3 flex gap-2.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {QUICK_PROMPTS.map((p, i) => (
              <motion.button
                key={p.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => send(p.text)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-purple-500/20 hover:border-purple-500/40 hover:text-white transition-all whitespace-nowrap bg-gradient-to-br ${p.gradient}`}
              >
                {p.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Bar ── */}
      <div
        className="glass-bright border-t border-purple-500/20 px-5 py-4 shrink-0"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your AI coach anything..."
              rows={1}
              className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 resize-none text-sm transition-all"
            />
            {input.length > 0 && (
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-medium">
                {input.length}/500
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl btn-primary flex items-center justify-center disabled:opacity-30 shrink-0 transition-opacity"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}