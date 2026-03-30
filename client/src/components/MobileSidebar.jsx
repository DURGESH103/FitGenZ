import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { X, LayoutDashboard, Dumbbell, Salad, TrendingUp, Bot, Crown, Users, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useScrollLock } from '../hooks/useMobile'
import { createPortal } from 'react-dom'

const navigationLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/workout',     icon: Dumbbell,        label: 'Workout'     },
  { to: '/diet',        icon: Salad,           label: 'Diet'        },
  { to: '/progress',    icon: TrendingUp,      label: 'Progress'    },
  { to: '/ai',          icon: Bot,             label: 'AI Coach'    },
  { to: '/leaderboard', icon: Crown,           label: 'Leaderboard' },
  { to: '/social',      icon: Users,           label: 'Community'   },
  { to: '/profile',     icon: User,            label: 'Profile'     },
]

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const sidebarVariants = {
  hidden: { 
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  },
  visible: { 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 + index * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  })
}

export default function MobileSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const navigate = useNavigate()
  const { lockScroll, unlockScroll } = useScrollLock()

  // Handle scroll locking
  React.useEffect(() => {
    if (isOpen) {
      lockScroll()
    } else {
      unlockScroll()
    }

    return () => unlockScroll()
  }, [isOpen, lockScroll, unlockScroll])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle navigation click
  const handleNavClick = () => {
    onClose()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      onClose()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={handleBackdropClick}
        >
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            fixed left-0 top-0 h-full w-[75%] max-w-xs
            bg-[#0f172a]/95 backdrop-blur-xl
            border-r border-purple-500/20
            shadow-2xl shadow-black/40
            overflow-y-auto
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-purple-300">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitGenZ
                </h2>
                <p className="text-xs text-slate-400 truncate">
                  {user?.name || 'User'}
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white transition-colors touch-manipulation"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Connection Status */}
          <div className="px-6 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span 
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
                }`} 
              />
              <span className="text-xs text-slate-400">
                {connected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigationLinks.map(({ to, icon: Icon, label }, index) => (
                <motion.div
                  key={to}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink to={to} onClick={handleNavClick}>
                    {({ isActive }) => (
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 touch-manipulation
                          ${isActive
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 active:bg-white/10'
                          }
                        `}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-base">{label}</span>
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="mobile-nav-indicator"
                            className="ml-auto w-2 h-2 rounded-full bg-purple-400"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            {/* User Info */}
            <div className="mb-4 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/40 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-purple-300">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user?.goal?.replace('_', ' ')} • {user?.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="
                w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium 
                text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20
                transition-all duration-200 touch-manipulation
              "
            >
              <LogOut size={20} />
              <span className="text-base">Logout</span>
            </motion.button>
          </div>
        </motion.aside>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}