import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useSocket } from '../context/SocketContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const fetchedRef = useRef(false) // prevent StrictMode double-fetch
  const { notifications: liveNotifications } = useSocket()

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch { /* silent */ }
  }, [])

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all')
    setUnreadCount(0)
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
  }, [])

  const requestPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg      = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub      = existing || await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      })
      await api.post('/notifications/push', { subscription: sub.toJSON() })
    } catch { /* push not supported or denied */ }
  }, [])

  // Merge live notifications from socket
  useEffect(() => {
    if (liveNotifications?.length > 0) {
      setNotifications(prev => {
        const newNotifications = liveNotifications.filter(
          live => !prev.some(existing => existing._id === live._id)
        )
        return [...newNotifications, ...prev]
      })
      setUnreadCount(prev => prev + liveNotifications.filter(n => !n.read).length)
    }
  }, [liveNotifications])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch()
  }, [fetch])

  return { notifications, unreadCount, fetch, markAllRead, requestPush }
}
