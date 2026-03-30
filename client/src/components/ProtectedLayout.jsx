import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 overflow-visible">
        <Outlet />
      </main>
    </div>
  )
}
