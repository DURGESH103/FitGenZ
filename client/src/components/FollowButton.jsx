import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, UserMinus } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function FollowButton({ 
  userId, 
  isFollowing: initialIsFollowing, 
  onFollowChange,
  size = 'md',
  className = '' 
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (loading) return
    
    setLoading(true)
    const previousState = isFollowing
    
    // Optimistic update
    setIsFollowing(!isFollowing)
    onFollowChange?.(!isFollowing)
    
    try {
      if (isFollowing) {
        await api.post(`/user/unfollow/${userId}`)
        toast.success('Unfollowed successfully')
      } else {
        await api.post(`/user/follow/${userId}`)
        toast.success('Following!')
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowing(previousState)
      onFollowChange?.(previousState)
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-8',
    md: 'px-4 py-2 text-sm min-h-10',
    lg: 'px-6 py-3 text-base min-h-12'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  }

  return (
    <motion.button
      onClick={handleFollow}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 touch-manipulation
        ${sizeClasses[size]}
        ${isFollowing 
          ? 'bg-slate-500/20 hover:bg-red-500/20 active:bg-red-500/30 text-slate-300 hover:text-red-300 border border-slate-500/30 hover:border-red-500/30' 
          : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white border border-purple-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <UserMinus size={iconSizes[size]} />
      ) : (
        <UserPlus size={iconSizes[size]} />
      )}
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </motion.button>
  )
}