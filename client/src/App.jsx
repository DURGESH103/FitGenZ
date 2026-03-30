import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedLayout from './components/ProtectedLayout'
import { PageLoader } from './components/Skeleton'
import { useKeyboard } from './hooks/useMobile'

const Landing     = lazy(() => import('./pages/Landing'))
const Login       = lazy(() => import('./pages/Login'))
const Signup      = lazy(() => import('./pages/Signup'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Workout     = lazy(() => import('./pages/Workout'))
const Diet        = lazy(() => import('./pages/Diet'))
const Progress    = lazy(() => import('./pages/Progress'))
const AI          = lazy(() => import('./pages/AI'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Social      = lazy(() => import('./pages/Social'))
const Profile     = lazy(() => import('./pages/Profile'))
const PublicProfile = lazy(() => import('./pages/PublicProfile'))

function AppContent() {
  const { isKeyboardOpen } = useKeyboard()

  useEffect(() => {
    // Add keyboard class to body for CSS targeting
    if (isKeyboardOpen) {
      document.body.classList.add('keyboard-open')
    } else {
      document.body.classList.remove('keyboard-open')
    }
  }, [isKeyboardOpen])

  useEffect(() => {
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0
    const preventZoom = (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }
    
    document.addEventListener('touchend', preventZoom, { passive: false })
    return () => document.removeEventListener('touchend', preventZoom)
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/workout"     element={<Workout />} />
            <Route path="/diet"        element={<Diet />} />
            <Route path="/progress"    element={<Progress />} />
            <Route path="/ai"          element={<AI />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/social"      element={<Social />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: { iconTheme: { primary: '#a855f7', secondary: '#0f0f1a' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#0f0f1a' } },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
