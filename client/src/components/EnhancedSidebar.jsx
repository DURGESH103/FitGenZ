import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Salad, TrendingUp, Bot, LogOut, Crown, Users, Sun, Moon, User, ChevronLeft, ChevronRight, Zap, Target, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationDropdown from './NotificationDropdown'

const mainLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   color: 'text-blue-400',   bgColor: 'bg-blue-500/20 border-blue-500/30' },
  { to: '/workout',     icon: Dumbbell,        label: 'Workout',     color: 'text-red-400',    bgColor: 'bg-red-500/20 border-red-500/30' },
  { to: '/diet',        icon: Salad,           label: 'Diet',        color: 'text-green-400',  bgColor: 'bg-green-500/20 border-green-500/30' },
  { to: '/progress',    icon: TrendingUp,      label: 'Progress',    color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30' },
  { to: '/ai',          icon: Bot,             label: 'AI Coach',    color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
]

const socialLinks = [
  { to: '/leaderboard', icon: Crown,           label: 'Leaderboard', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/30' },
  { to: '/social',      icon: Users,           label: 'Community',   color: 'text-pink-400',   bgColor: 'bg-pink-500/20 border-pink-500/30' },
]

const settingsLinks = [
  { to: '/profile',     icon: User,            label: 'Profile',     color: 'text-slate-400',  bgColor: 'bg-slate-500/20 border-slate-500/30' },
  { to: '/settings',    icon: Settings,        label: 'Settings',    color: 'text-slate-400',  bgColor: 'bg-slate-500/20 border-slate-500/30' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { connected, liveStats } = useSocket()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [theme, setTheme] = useState('dark')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.aside 
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col min-h-screen glass border-r border-purple-500/20 p-4 fixed left-0 top-0 z-40 overflow-visible"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitGenZ
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span title={connected ? 'Live' : 'Offline'}
                    className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {connected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>

      {/* User Stats Card */}
      <AnimatePresence>
        {!isCollapsed && liveStats && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400">
                  Level {liveStats.level || 1}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-black text-purple-400">{liveStats.xp || 0}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">XP</p>
              </div>
              <div>
                <p className="text-lg font-black text-orange-400">{liveStats.streak || 0}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">Streak</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {/* Main Navigation */}
        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 px-2"
              >
                Main
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {mainLinks.map(({ to, icon: Icon, label, color, bgColor }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 6, scale: isCollapsed ? 1.1 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative group ${
                      isActive
                        ? `${bgColor} ${color} border shadow-lg`
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={isCollapsed ? label : ''}
                  >
                    <Icon size={20} className={isActive ? color : ''} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Social Navigation */}
        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 px-2"
              >
                Social
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {socialLinks.map(({ to, icon: Icon, label, color, bgColor }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 6, scale: isCollapsed ? 1.1 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? `${bgColor} ${color} border`
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={isCollapsed ? label : ''}
                  >
                    <Icon size={20} className={isActive ? color : ''} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2">
        {/* Settings Links */}
        {settingsLinks.map(({ to, icon: Icon, label, color, bgColor }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 6, scale: isCollapsed ? 1.1 : 1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? `${bgColor} ${color} border`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? label : ''}
              >
                <Icon size={20} className={isActive ? color : ''} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}

        {/* Theme Toggle & Notifications */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-2 px-3 py-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.button>
              <NotificationDropdown />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 6, scale: isCollapsed ? 1.1 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}