import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react'

const QUICK_PROMPTS = [
  { label: '💪 Workout plan', text: 'Give me a personalized workout plan' },
  { label: '🥗 Diet today',   text: 'What should I eat today?' },
  { label: '🔥 Lose weight',  text: 'How to lose weight fast safely?' },
  { label: '🥚 Protein tips', text: 'Best budget protein sources in India' },
]

function parseRec(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
  } catch {}
  return null
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  const parsed = !isUser ? parseRec(msg.content) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-purple-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'
      }`}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {parsed ? (
          /* Structured AI response cards */
          <div className="space-y-2 w-full">
            {parsed.workoutSuggestion && (
              <div className="glass rounded-2xl rounded-tl-sm p-4 border border-purple-500/25">
                <p className="text-[11px] text-purple-400 font-bold mb-1.5 uppercase tracking-wide">💪 Workout</p>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.workoutSuggestion}</p>
              </div>
            )}
            {parsed.dietSuggestion && (
              <div className="glass rounded-2xl p-4 border border-green-500/25">
                <p className="text-[11px] text-green-400 font-bold mb-1.5 uppercase tracking-wide">🥗 Diet</p>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.dietSuggestion}</p>
              </div>
            )}
            {parsed.caution && (
              <div className="glass rounded-2xl p-4 border border-yellow-500/25">
                <p className="text-[11px] text-yellow-400 font-bold mb-1.5 uppercase tracking-wide">⚠️ Caution</p>
                <p className="text-sm text-slate-200 leading-relaxed">{parsed.caution}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-purple-600 text-white rounded-tr-sm'
              : 'glass text-slate-200 rounded-tl-sm border border-purple-500/20'
          }`}>
            {msg.content}
          </div>
        )}
        <span className="text-[10px] text-slate-600 px-1">
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
        <Bot size={13} />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3.5 border border-purple-500/20">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
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
    content: `Hey ${user?.name?.split(' ')[0]}! 👋 I'm your AI fitness coach. I'll give you personalized advice based on your profile. What would you like to know?`,
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
      const { data } = await api.get('/ai/recommend', { params: { goal: user.goal, prompt: msg } })
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! Ask me anything about your fitness journey 💪`,
      ts: Date.now(),
    }])
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">

      {/* Header */}
      <div className="glass border-b border-purple-500/20 px-4 py-3.5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles size={17} />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-white text-sm">AI Coach</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-[11px] text-green-400">Online · Powered by GPT</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-500 hover:text-slate-300">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: '1rem' }}>
        {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only show when fresh */}
      <AnimatePresence>
        {messages.length <= 1 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {QUICK_PROMPTS.map((p) => (
              <motion.button
                key={p.label}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => send(p.text)}
                className="shrink-0 px-3 py-2 rounded-xl glass text-xs text-slate-300 border border-purple-500/20 hover:border-purple-500/50 hover:text-white transition-all whitespace-nowrap"
              >
                {p.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="glass border-t border-purple-500/20 px-4 py-3 shrink-0"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2.5 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your AI coach…"
            rows={1}
            className="flex-1 bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none text-sm transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 16px rgba(168,85,247,0.5)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center disabled:opacity-35 shrink-0 shadow-lg shadow-purple-500/25 transition-opacity"
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
