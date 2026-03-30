import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const fetchedRef = useRef(false)
  const { notifications: liveNotifications } = useSocket()

  const fetchNotifications = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [loading])

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }, [])

  const addNotification = useCallback((newNotification) => {
    setNotifications(prev => [newNotification, ...prev])
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1)
    }
  }, [])

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n._id === notificationId)
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return prev.filter(n => n._id !== notificationId)
    })
  }, [])

  const requestPushPermission = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        
        const subscription = existingSubscription || await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        })

        await api.post('/notifications/push', { 
          subscription: subscription.toJSON() 
        })
        
        return true
      }
    } catch (error) {
      console.error('Push notification setup failed:', error)
    }
    return false
  }, [])

  // Handle real-time notifications from socket
  useEffect(() => {
    if (liveNotifications?.length > 0) {
      liveNotifications.forEach(notification => {
        // Check if notification already exists
        setNotifications(prev => {
          const exists = prev.some(n => n._id === notification._id)
          if (!exists) {
            if (!notification.read) {
              setUnreadCount(count => count + 1)
            }
            return [notification, ...prev]
          }
          return prev
        })
      })
    }
  }, [liveNotifications])

  // Initial fetch
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchNotifications()
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllRead,
    markAsRead,
    addNotification,
    removeNotification,
    requestPushPermission
  }
}
