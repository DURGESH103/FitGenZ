import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

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
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      })
      await api.post('/notifications/push', { subscription: sub.toJSON() })
    } catch { /* push not supported or denied */ }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { notifications, unreadCount, fetch, markAllRead, requestPush }
}
