'use client'

import { useEffect } from 'react'
import type { GameAction } from './useGame'

export function useKeyboard(dispatch: (action: GameAction) => void): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // IME 変換中は無視
      if (e.isComposing) return

      const code = e.code
      const key = e.key.toLowerCase()

      // 移動: 矢印 or WASD
      if (code === 'ArrowLeft' || key === 'a') {
        e.preventDefault()
        dispatch({ type: 'MOVE_LEFT' })
        return
      }
      if (code === 'ArrowRight' || key === 'd') {
        e.preventDefault()
        dispatch({ type: 'MOVE_RIGHT' })
        return
      }

      // ソフトドロップ: ↓ or S
      if (code === 'ArrowDown' || key === 's') {
        e.preventDefault()
        dispatch({ type: 'SOFT_DROP' })
        return
      }

      // ハードドロップ: ↑ or Space or W
      if (code === 'ArrowUp' || code === 'Space' || key === 'w') {
        e.preventDefault()
        if (e.repeat) return
        dispatch({ type: 'HARD_DROP' })
        return
      }

      // 右回転: X or E
      if (code === 'KeyX' || code === 'KeyE' || key === 'x' || key === 'e') {
        e.preventDefault()
        if (e.repeat) return
        dispatch({ type: 'ROTATE_CW' })
        return
      }

      // 左回転: Z or Q
      if (code === 'KeyZ' || code === 'KeyQ' || key === 'z' || key === 'q') {
        e.preventDefault()
        if (e.repeat) return
        dispatch({ type: 'ROTATE_CCW' })
        return
      }

      // 一時停止: Esc or P
      if (code === 'Escape' || code === 'KeyP' || key === 'p') {
        if (e.repeat) return
        dispatch({ type: 'TOGGLE_PAUSE' })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])
}
