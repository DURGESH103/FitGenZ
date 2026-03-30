import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Users, Trophy, Flame, Zap, Lock, Calendar } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import FollowButton from '../components/FollowButton'

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/user/${id}`)
      setProfile(data)
      setIsFollowing(data.isFollowing)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('This profile is private')
      } else if (error.response?.status === 404) {
        toast.error('User not found')
      } else {
        toast.error('Failed to load profile')
      }
      navigate('/social')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowChange = (newFollowState) => {
    setIsFollowing(newFollowState)
    if (profile) {
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followersCount: newFollowState 
            ? prev.user.followersCount + 1 
            : prev.user.followersCount - 1
        }
      }))
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="shimmer w-20 h-20 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="shimmer h-6 w-48 rounded" />
              <div className="shimmer h-4 w-32 rounded" />
              <div className="shimmer h-4 w-64 rounded" />
            </div>
          </div>
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="shimmer h-6 w-32 mb-4 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(j => (
                <div key={j} className="shimmer h-20 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!profile) return null

  const { user: userData, stats, levelInfo, isOwnProfile } = profile

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-safe">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 sm:gap-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-white transition-colors touch-manipulation"
        >
          <ArrowLeft size={18} sm:size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-white truncate">{userData.name}</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {isOwnProfile ? 'Your Profile' : 'User Profile'}
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-purple-500/20"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 flex items-center justify-center overflow-hidden">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-purple-300" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userData.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full capitalize">
                  {userData.goal?.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full capitalize">
                  {userData.gender}
                </span>
                {!userData.isPublic && (
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full flex items-center gap-1">
                    <Lock size={10} />
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {!isOwnProfile && (
            <FollowButton
              userId={userData._id}
              isFollowing={isFollowing}
              onFollowChange={handleFollowChange}
            />
          )}
        </div>

        {/* Bio */}
        {userData.bio && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <p className="text-slate-300 text-sm">{userData.bio}</p>
          </div>
        )}

        {/* Follow Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl border border-blue-500/30">
            <Users size={24} className="text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{userData.followersCount || 0}</div>
            <div className="text-xs text-slate-400">Followers</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30">
            <Users size={24} className="text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{userData.followingCount || 0}</div>
            <div className="text-xs text-slate-400">Following</div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{userData.age}</div>
            <div className="text-xs text-slate-400">Years Old</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{userData.height}</div>
            <div className="text-xs text-slate-400">cm</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{userData.weight}</div>
            <div className="text-xs text-slate-400">kg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              <Calendar size={20} className="mx-auto" />
            </div>
            <div className="text-xs text-slate-400">
              {new Date(userData.createdAt).toLocaleDateString('en-IN', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fitness Stats */}
      {(levelInfo || stats) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Fitness Journey</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelInfo && (
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/30">
                <Zap size={24} className="text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">Level {levelInfo.level}</div>
                <div className="text-xs text-slate-400">{levelInfo.title}</div>
              </div>
            )}
            
            {levelInfo && (
              <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl border border-yellow-500/30">
                <Trophy size={24} className="text-yellow-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{levelInfo.xp.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total XP</div>
              </div>
            )}
            
            {stats?.streak !== undefined && (
              <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/30">
                <Flame size={24} className="text-orange-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stats.streak}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
            )}
            
            {stats?.badges && (
              <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30">
                <Trophy size={24} className="text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stats.badges.length}</div>
                <div className="text-xs text-slate-400">Badges</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {stats?.badges?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Achievements</h3>
            <span className="ml-auto text-xs text-slate-500">{stats.badges.length} unlocked</span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {stats.badges.map((badge, i) => (
              <motion.div 
                key={badge.id} 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }} 
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[9px] text-center text-slate-300 leading-tight font-medium">{badge.label}</span>
                <span className="text-[8px] text-yellow-400 font-bold">EARNED</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}