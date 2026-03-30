import { useEffect, useState } from 'react'

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight
    
    const handleViewportChange = () => {
      if (!window.visualViewport) return
      
      const currentHeight = window.visualViewport.height
      const heightDifference = initialViewportHeight - currentHeight
      
      // Consider keyboard open if viewport shrunk by more than 150px
      setIsKeyboardOpen(heightDifference > 150)
    }

    // Modern browsers with Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight
      setIsKeyboardOpen(heightDifference > 150)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { isKeyboardOpen }
}

export function useScrollLock() {
  const lockScroll = () => {
    // Store current scroll position
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.classList.add('no-scroll')
  }

  const unlockScroll = () => {
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.classList.remove('no-scroll')
    
    // Restore scroll position
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }

  return { lockScroll, unlockScroll }
}

export function useTouchFeedback() {
  const addTouchFeedback = (element) => {
    if (!element) return

    const handleTouchStart = () => {
      element.style.transform = 'scale(0.98)'
      element.style.opacity = '0.8'
    }

    const handleTouchEnd = () => {
      element.style.transform = 'scale(1)'
      element.style.opacity = '1'
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }

  return { addTouchFeedback }
}