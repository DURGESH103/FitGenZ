import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import NotificationItem from './NotificationItem'
import { useScrollLock } from '../hooks/useMobile'

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState('right')
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const { lockScroll, unlockScroll } = useScrollLock()
  
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotifications()

  // Calculate optimal position based on viewport
  const calculatePosition = () => {
    if (!buttonRef.current) return 'right'
    
    const rect = buttonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const dropdownWidth = 320
    
    // If dropdown would overflow on the right, position it to the left
    if (rect.right + dropdownWidth > viewportWidth - 20) {
      return 'left'
    }
    return 'right'
  }

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (!isOpen) {
      setPosition(calculatePosition())
      if (window.innerWidth < 768) {
        lockScroll() // Prevent background scroll on mobile
      }
    } else {
      unlockScroll()
    }
    setIsOpen(!isOpen)
    
    // Mark all as read when opening
    if (!isOpen && unreadCount > 0) {
      setTimeout(() => markAllRead(), 500)
    }
  }

  // Close dropdown
  const closeDropdown = () => {
    setIsOpen(false)
    unlockScroll()
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        closeDropdown()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => unlockScroll()
  }, [])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
  }

  const handleMarkAllRead = () => {
    markAllRead()
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl hover:bg-white/8 active:bg-white/12 transition-all duration-200 text-slate-400 hover:text-slate-200 touch-manipulation group"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} className="transition-transform group-hover:scale-110" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Portal for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            {window.innerWidth < 768 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={closeDropdown}
              />
            )}

            {/* Dropdown Panel */}
            <motion.div
              ref={dropdownRef}
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                y: window.innerWidth < 768 ? 20 : -8
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                y: window.innerWidth < 768 ? 20 : -8
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                duration: 0.2
              }}
              className={`
                absolute z-50 overflow-hidden
                
                /* Desktop Positioning */
                md:top-12 md:w-80 md:max-w-[95vw] md:rounded-2xl
                ${position === 'right' ? 'md:right-0' : 'md:left-0'}
                
                /* Mobile Positioning - Full Width Slide Down */
                fixed md:absolute
                top-16 md:top-12
                left-4 right-4 md:left-auto md:right-auto
                max-w-none md:max-w-[95vw]
                rounded-xl md:rounded-2xl
                
                /* Premium Styling */
                bg-black/70 backdrop-blur-xl
                border border-white/10
                shadow-2xl shadow-black/40
              `}
              style={{
                maxHeight: window.innerWidth < 768 ? 'calc(100vh - 120px)' : '80vh'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Mark All Read Button */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white transition-colors touch-manipulation"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  
                  {/* Close Button */}
                  <button
                    onClick={closeDropdown}
                    className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white transition-colors touch-manipulation"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto touch-pan-y" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 px-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <Bell size={24} className="text-slate-500" />
                    </div>
                    <h4 className="text-white font-medium mb-2">No notifications yet</h4>
                    <p className="text-slate-400 text-sm">
                      We'll notify you when something happens
                    </p>
                  </motion.div>
                ) : (
                  <div className="py-2">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }}
                      >
                        <NotificationItem
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                          onMarkAsRead={() => markAsRead(notification._id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Show More Button */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 bg-white/5">
                  <button className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}