import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  User, Edit3, Camera, Save, X, Trophy, Target, Flame, 
  Zap, Calendar, TrendingUp, Shield, Eye, EyeOff, Lock,
  Activity, Heart, Scale, Ruler
} from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile')
      setProfile(data)
      setFormData({
        name: data.user.name,
        age: data.user.age,
        height: data.user.height,
        weight: data.user.weight,
        goal: data.user.goal,
        bio: data.user.bio || '',
        isPublic: data.user.isPublic
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/user/profile', formData)
      setProfile(prev => ({ ...prev, user: data.user }))
      updateUser(data.user)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const { data } = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(prev => ({ ...prev, user: { ...prev.user, avatarUrl: data.avatarUrl } }))
      updateUser({ ...user, avatarUrl: data.avatarUrl })
      toast.success('Avatar updated!')
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="shimmer h-6 w-32 mb-4 rounded" />
            <div className="space-y-3">
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-4 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const { user: userData, fitness, stats, levelInfo, goalProgress, completion, recommendations } = profile

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-bold text-white">{completion}% Complete</div>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
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
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 flex items-center justify-center overflow-hidden">
                {userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-purple-300" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userData.name}</h2>
              <p className="text-slate-400 text-sm">{userData.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full capitalize">
                  {userData.goal?.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full capitalize">
                  {userData.gender}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors"
          >
            {editing ? <X size={16} /> : <Edit3 size={16} />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:outline-none"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="fitness">General Fitness</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-slate-300">Public Profile</label>
              <button
                onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                className={`relative w-12 h-6 rounded-full transition-colors ${formData.isPublic ? 'bg-purple-500' : 'bg-slate-600'}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none resize-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
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
              <div className="text-2xl font-bold text-white">{fitness.bmi}</div>
              <div className="text-xs text-slate-400">BMI</div>
            </div>
          </div>
        )}

        {userData.bio && !editing && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl">
            <p className="text-slate-300 text-sm">{userData.bio}</p>
          </div>
        )}
      </motion.div>

      {/* Fitness Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-green-400" />
          <h3 className="text-lg font-bold text-white">Fitness Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30">
            <Heart size={24} className="text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{fitness.bmiInfo.label}</div>
            <div className="text-xs text-slate-400">BMI Status</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl border border-blue-500/30">
            <Target size={24} className="text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{fitness.calories}</div>
            <div className="text-xs text-slate-400">Daily Calories</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/30">
            <Scale size={24} className="text-orange-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{fitness.protein}g</div>
            <div className="text-xs text-slate-400">Protein Goal</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/30">
            <TrendingUp size={24} className="text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{goalProgress}%</div>
            <div className="text-xs text-slate-400">Goal Progress</div>
          </div>
        </div>
      </motion.div>

      {/* Gamification Stats */}
      {levelInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/30">
              <Zap size={24} className="text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">Level {levelInfo.level}</div>
              <div className="text-xs text-slate-400">{levelInfo.title}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl border border-yellow-500/30">
              <Trophy size={24} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{levelInfo.xp.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Total XP</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/30">
              <Flame size={24} className="text-orange-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stats.streak || 0}</div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30">
              <Calendar size={24} className="text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stats.badges?.length || 0}</div>
              <div className="text-xs text-slate-400">Badges Earned</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Personalized Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0" />
                <p className="text-slate-300 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-red-400" />
          <h3 className="text-lg font-bold text-white">Security</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-slate-400" />
              <div>
                <div className="text-white font-medium">Password</div>
                <div className="text-slate-400 text-sm">Last changed recently</div>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              {userData.isPublic ? <Eye size={18} className="text-green-400" /> : <EyeOff size={18} className="text-slate-400" />}
              <div>
                <div className="text-white font-medium">Profile Visibility</div>
                <div className="text-slate-400 text-sm">
                  {userData.isPublic ? 'Public - visible to others' : 'Private - only visible to you'}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-300">
              {userData.isPublic ? 'Public' : 'Private'}
            </div>
          </div>
        </div>

        {showPasswordForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-white/5 rounded-xl border border-red-500/20"
          >
            <h4 className="text-white font-medium mb-4">Change Password</h4>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}