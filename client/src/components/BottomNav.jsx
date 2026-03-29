import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Salad, TrendingUp, Crown, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'      },
  { to: '/workout',     icon: Dumbbell,        label: 'Workout'   },
  { to: '/progress',    icon: TrendingUp,      label: 'Progress'  },
  { to: '/leaderboard', icon: Crown,           label: 'Ranks'     },
  { to: '/social',      icon: Users,           label: 'Community' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-purple-500/20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="flex-1">
            {({ isActive }) => (
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5 py-1">
                <Icon size={22} className={isActive ? 'text-purple-400' : 'text-slate-500'}
                  strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-purple-400" />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
