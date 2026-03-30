import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import MobileSidebar from './MobileSidebar'
import { useAuth } from '../context/AuthContext'

export default function MobileHeader() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-purple-500/20 pt-safe"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white transition-colors touch-manipulation"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            
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
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitGenZ
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    </>
  )
}