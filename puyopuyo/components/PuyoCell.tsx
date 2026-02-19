import type { CSSProperties } from 'react'
import type { Cell, ConnectionMask } from '@/lib/game/types'

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string }> = {
  red:    { bg: '#ef4444', border: '#dc2626', glow: 'rgba(239,68,68,0.6)' },
  blue:   { bg: '#3b82f6', border: '#2563eb', glow: 'rgba(59,130,246,0.6)' },
  green:  { bg: '#22c55e', border: '#16a34a', glow: 'rgba(34,197,94,0.6)' },
  yellow: { bg: '#eab308', border: '#ca8a04', glow: 'rgba(234,179,8,0.6)' },
  purple: { bg: '#a855f7', border: '#9333ea', glow: 'rgba(168,85,247,0.6)' },
}

/**
 * ConnectionMaskから四隅のborder-radiusを計算
 * 接続している方向の角は8px（角張る）、非接続は50%（丸い）
 * mask bits: 上=8, 右=4, 下=2, 左=1
 */
function getBorderRadius(mask: ConnectionMask): string {
  const hasUp    = (mask & 8) !== 0
  const hasRight = (mask & 4) !== 0
  const hasDown  = (mask & 2) !== 0
  const hasLeft  = (mask & 1) !== 0

  // 各隅: [上左, 上右, 下右, 下左]
  const topLeft     = (hasUp || hasLeft)    ? '8px' : '50%'
  const topRight    = (hasUp || hasRight)   ? '8px' : '50%'
  const bottomRight = (hasDown || hasRight) ? '8px' : '50%'
  const bottomLeft  = (hasDown || hasLeft)  ? '8px' : '50%'

  return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`
}

interface PuyoCellProps {
  cell: Cell
  mask: ConnectionMask
  isPopping?: boolean
  size?: number
}

export default function PuyoCell({ cell, mask, isPopping = false, size = 44 }: PuyoCellProps) {
  if (!cell) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-sm"
      />
    )
  }

  const isGhost = cell.animState === 'ghost'
  const colors = COLOR_MAP[cell.color] ?? COLOR_MAP.red
  const borderRadius = getBorderRadius(mask)

  if (isGhost) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          border: `2px dashed ${colors.bg}`,
          opacity: 0.4,
          boxSizing: 'border-box',
        }}
      />
    )
  }

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: colors.bg,
    border: `2px solid ${colors.border}`,
    boxShadow: `inset 0 2px 4px rgba(255,255,255,0.4), 0 0 8px ${colors.glow}`,
    position: 'relative',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={style}
      className={isPopping ? 'animate-[puyo-pop_0.6s_ease-in-out_forwards]' : ''}
    >
      {/* ハイライト */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '35%',
          height: '35%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
