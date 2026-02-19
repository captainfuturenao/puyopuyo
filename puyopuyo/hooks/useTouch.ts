'use client'

import { useEffect, useRef } from 'react'
import type { GameAction } from './useGame'

const SWIPE_THRESHOLD = 30 // px

export function useTouch(
  ref: React.RefObject<HTMLElement | null>,
  dispatch: (action: GameAction) => void
): void {
  const startPos = useRef<{ x: number; y: number; touches: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startPos.current = {
        x: touch.clientX,
        y: touch.clientY,
        touches: e.touches.length,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startPos.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startPos.current.x
      const dy = touch.clientY - startPos.current.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
        // タップ
        if (startPos.current.touches >= 2) {
          dispatch({ type: 'ROTATE_CCW' })
        } else {
          dispatch({ type: 'ROTATE_CW' })
        }
      } else if (absDx >= absDy) {
        // 横スワイプ
        if (dx > 0) {
          dispatch({ type: 'MOVE_RIGHT' })
        } else {
          dispatch({ type: 'MOVE_LEFT' })
        }
      } else {
        // 縦スワイプ
        if (dy > 0) {
          dispatch({ type: 'SOFT_DROP' })
        }
      }

      startPos.current = null
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, dispatch])
}
