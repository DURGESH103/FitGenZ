import confetti from 'canvas-confetti'
import { useCallback } from 'react'

export function useConfetti() {
  const fire = useCallback((opts = {}) => {
    confetti({
      particleCount: opts.particleCount ?? 90,
      spread:        opts.spread        ?? 70,
      origin:        opts.origin        ?? { x: 0.5, y: 0.6 },
      colors:        opts.colors        ?? ['#a855f7', '#ec4899', '#f97316', '#facc15'],
      scalar:        opts.scalar        ?? 1.1,
      zIndex:        9999,
    })
  }, [])

  const fireFromElement = useCallback((el) => {
    if (!el) { fire(); return }
    const rect = el.getBoundingClientRect()
    fire({
      origin: {
        x: (rect.left + rect.width  / 2) / window.innerWidth,
        y: (rect.top  + rect.height / 2) / window.innerHeight,
      },
    })
  }, [fire])

  return { fire, fireFromElement }
}
