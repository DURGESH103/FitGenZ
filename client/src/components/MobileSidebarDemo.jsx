import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Smartphone, Monitor, Navigation } from 'lucide-react'
import MobileSidebar from './MobileSidebar'

export default function MobileSidebarDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deviceView, setDeviceView] = useState('mobile')

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-purple-500/20"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Navigation size={20} className="text-purple-400" />
          Mobile Sidebar Demo
        </h2>
        
        <div className="space-y-6">
          {/* Device View Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">View:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDeviceView('mobile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  deviceView === 'mobile'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Smartphone size={16} />
                Mobile
              </button>
              <button
                onClick={() => setDeviceView('desktop')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  deviceView === 'desktop'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Monitor size={16} />
                Desktop
              </button>
            </div>
          </div>

          {/* Demo Description */}
          <div className="p-4 bg-white/5 rounded-xl">
            <h3 className="text-white font-medium mb-2">How it works:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• <strong>Desktop:</strong> Fixed sidebar on the left (always visible)</li>
              <li>• <strong>Mobile:</strong> Hamburger menu opens slide-in drawer</li>
              <li>• <strong>Backdrop:</strong> Click outside to close</li>
              <li>• <strong>Scroll Lock:</strong> Background scroll disabled when open</li>
              <li>• <strong>Animations:</strong> Smooth slide transitions</li>
            </ul>
          </div>

          {/* Mobile Demo */}
          {deviceView === 'mobile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors hamburger-menu"
                  >
                    <Menu size={20} />
                  </button>
                  <span className="text-white font-medium">Mobile Header</span>
                </div>
                <div className="text-xs text-slate-400">
                  Sidebar: {sidebarOpen ? 'Open' : 'Closed'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-green-400 font-medium">✓ Features</div>
                  <ul className="text-green-300 text-xs mt-1 space-y-0.5">
                    <li>• Slide animation</li>
                    <li>• Backdrop blur</li>
                    <li>• Touch-friendly</li>
                    <li>• Auto-close</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-blue-400 font-medium">📱 Mobile UX</div>
                  <ul className="text-blue-300 text-xs mt-1 space-y-0.5">
                    <li>• 75% width</li>
                    <li>• Full height</li>
                    <li>• Scroll lock</li>
                    <li>• Portal render</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              >
                <Menu size={18} />
                {sidebarOpen ? 'Close' : 'Open'} Mobile Sidebar
              </button>
            </div>
          )}

          {/* Desktop Demo */}
          {deviceView === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="text-white font-medium mb-2">Desktop Behavior</div>
                <p className="text-slate-300 text-sm">
                  On desktop screens (768px+), the sidebar is always visible as a fixed panel on the left side. 
                  The hamburger menu is hidden and users can access all navigation items directly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-blue-400 font-medium mb-2">🖥️ Desktop Features</div>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Fixed sidebar (240px width)</li>
                    <li>• Always visible navigation</li>
                    <li>• No hamburger menu needed</li>
                    <li>• Hover effects and animations</li>
                    <li>• Active route highlighting</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Sidebar Component */}
      <MobileSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    </div>
  )
}