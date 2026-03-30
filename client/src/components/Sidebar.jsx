import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Salad, TrendingUp, Bot, LogOut, Crown, Users, Sun, Moon, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/workout',     icon: Dumbbell,        label: 'Workout'     },
  { to: '/diet',        icon: Salad,           label: 'Diet'        },
  { to: '/progress',    icon: TrendingUp,      label: 'Progress'    },
  { to: '/ai',          icon: Bot,             label: 'AI Coach'    },
  { to: '/leaderboard', icon: Crown,           label: 'Leaderboard' },
  { to: '/social',      icon: Users,           label: 'Community'   },
  { to: '/profile',     icon: User,            label: 'Profile'     },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const { connected } = useSocket()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate anyway since logout should always succeed from user perspective
      navigate('/login')
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen glass border-r border-purple-500/20 p-6 fixed left-0 top-0 z-40">
      <div className="mb-10 flex items-center justify-between">
        <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          FitGenZ
        </span>
        <div className="flex items-center gap-2">
          <span title={connected ? 'Live' : 'Offline'}
            className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <NotificationBell />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}>
                <Icon size={18} />{label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
        <LogOut size={18} />Logout
      </button>
    </aside>
  )
}
