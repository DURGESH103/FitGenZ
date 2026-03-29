import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket, EVENTS } from '../context/SocketContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Heart, MessageCircle, Send, Plus, X, Users, UserPlus, UserCheck } from 'lucide-react'
import { ListSkeleton } from '../components/Skeleton'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function PostCard({ post, onLike, onComment, onFollow, myId }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText,  setCommentText]  = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const isOwn = (post.user?._id || post.user?.id) === myId

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await onComment(post._id, commentText.trim())
      setCommentText('')
    } finally { setSubmitting(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden border border-purple-500/10">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 text-sm font-black text-white">
          {post.user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{post.user?.name || 'User'}</p>
          <p className="text-[11px] text-slate-500 capitalize">
            {post.user?.goal?.replace(/_/g, ' ')} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.tags?.length > 0 && (
          <span className="text-[10px] text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/20">
            #{post.tags[0]}
          </span>
        )}
        {!isOwn && (
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => onFollow(post.user?._id || post.user?.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              post.isFollowing
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-white/8 text-slate-500 hover:text-purple-400 hover:bg-purple-500/15'
            }`}>
            {post.isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
          </motion.button>
        )}
      </div>

      {/* Text */}
      <p className="px-4 pb-3 text-sm text-slate-200 leading-relaxed">{post.text}</p>

      {/* Image */}
      {post.imageUrl && <img src={post.imageUrl} alt="post" className="w-full max-h-64 object-cover" />}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/6">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            post.likedByMe ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
          }`}>
          <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} />
          <span>{post.likeCount}</span>
        </motion.button>
        <button onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-400 transition-colors">
          <MessageCircle size={16} />
          <span>{post.commentCount}</span>
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/6">
            <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
              {post.comments?.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-2">No comments yet</p>
              )}
              {post.comments?.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-purple-300">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                    <p className="text-[11px] font-semibold text-purple-300">{c.name}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2 px-4 pb-3">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-white/5 border border-purple-500/20 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500/50" />
              <motion.button whileTap={{ scale: 0.9 }} type="submit" disabled={submitting || !commentText.trim()}
                className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center disabled:opacity-40 shrink-0">
                <Send size={13} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Social() {
  const { user }   = useAuth()
  const { socket } = useSocket()
  const [tab,      setTab]      = useState('all')
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [text,     setText]     = useState('')
  const [posting,  setPosting]  = useState(false)

  const fetchFeed = useCallback(async (feedTab) => {
    setLoading(true)
    try {
      const url = feedTab === 'following' ? '/social/feed/following' : '/social/feed'
      const { data } = await api.get(url)
      setPosts(data.posts)
    } catch { toast.error('Could not load feed') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchFeed(tab) }, [tab, fetchFeed])

  // Real-time socket events
  useEffect(() => {
    if (!socket) return
    const onNewPost = (post) => { if (tab === 'all') setPosts((p) => [post, ...p]) }
    const onLike    = ({ postId, likeCount }) =>
      setPosts((p) => p.map((x) => x._id === postId ? { ...x, likeCount } : x))
    const onComment = ({ postId, comment, commentCount }) =>
      setPosts((p) => p.map((x) => x._id === postId
        ? { ...x, comments: [...(x.comments || []), comment], commentCount }
        : x))

    socket.on(EVENTS.FEED_NEW_POST, onNewPost)
    socket.on(EVENTS.FEED_LIKE,     onLike)
    socket.on(EVENTS.FEED_COMMENT,  onComment)
    return () => {
      socket.off(EVENTS.FEED_NEW_POST, onNewPost)
      socket.off(EVENTS.FEED_LIKE,     onLike)
      socket.off(EVENTS.FEED_COMMENT,  onComment)
    }
  }, [socket, tab])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      await api.post('/social/post', { text: text.trim(), tags: [user?.goal?.replace('_', '')] })
      setText('')
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post')
    } finally { setPosting(false) }
  }

  const handleLike = async (postId) => {
    setPosts((p) => p.map((x) => x._id === postId
      ? { ...x, likedByMe: !x.likedByMe, likeCount: x.likeCount + (x.likedByMe ? -1 : 1) }
      : x))
    try {
      await api.patch(`/social/post/${postId}/like`)
    } catch {
      setPosts((p) => p.map((x) => x._id === postId
        ? { ...x, likedByMe: !x.likedByMe, likeCount: x.likeCount + (x.likedByMe ? -1 : 1) }
        : x))
    }
  }

  const handleComment = async (postId, txt) => {
    await api.post(`/social/post/${postId}/comment`, { text: txt })
  }

  const handleFollow = async (userId) => {
    try {
      const { data } = await api.post(`/social/follow/${userId}`)
      setPosts((p) => p.map((x) =>
        (x.user?._id === userId || x.user?.id === userId)
          ? { ...x, isFollowing: data.following }
          : x
      ))
    } catch { /* silent */ }
  }

  const myId = user?._id || user?.id

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4 pb-24 md:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users size={22} className="text-purple-400" /> Community
          </h1>
          <p className="text-slate-400 text-sm mt-1">Share your fitness journey</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Post'}
        </motion.button>
      </motion.div>

      {/* Feed tabs */}
      <div className="flex gap-2">
        {[['all', '🌍 All'], ['following', '👥 Following']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'glass text-slate-400 border border-purple-500/20 hover:text-slate-200'
            }`}>{label}</button>
        ))}
      </div>

      {/* Create post form */}
      <AnimatePresence>
        {showForm && (
          <motion.form key="form" initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }} onSubmit={handlePost}
            className="glass rounded-2xl p-4 space-y-3 border border-purple-500/20 overflow-hidden">
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Share your progress, tips, or motivation… 💪"
              rows={3} maxLength={500}
              className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none text-sm" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{text.length}/500</span>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={posting || !text.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold disabled:opacity-50">
                {posting ? 'Posting…' : 'Share 🚀'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Feed */}
      {loading ? <ListSkeleton rows={4} /> : posts.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Users size={44} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {tab === 'following' ? 'Follow people to see their posts here' : 'No posts yet'}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {tab === 'following' ? 'Discover athletes in the All tab' : 'Be the first to share your journey!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} myId={myId}
              onLike={handleLike} onComment={handleComment} onFollow={handleFollow} />
          ))}
        </div>
      )}
    </div>
  )
}
