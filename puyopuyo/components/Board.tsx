'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'
import { BOARD_COLS, VISIBLE_ROW_START } from '@/lib/constants'
import type { ConnectionMask, GameBoard } from '@/lib/game/types'
import PuyoCell from './PuyoCell'

interface Particle {
  id: number
  row: number
  col: number
  dx: number
  dy: number
  color: string
}

const COLOR_HEX: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
}

let particleIdCounter = 0

interface ParticleLayerProps {
  popCells: [number, number][]
  board: GameBoard
  cellSize: number
}

function ParticleLayer({ popCells, board, cellSize }: ParticleLayerProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const prevPopCellsRef = useRef<[number, number][]>([])

  useEffect(() => {
    if (popCells.length === 0) return
    // 新しいpopCellsのとき（前と異なる場合のみ）パーティクル生成
    const prev = prevPopCellsRef.current
    if (prev.length === popCells.length && prev.every((p, i) => p[0] === popCells[i][0] && p[1] === popCells[i][1])) return

    prevPopCellsRef.current = popCells

    const newParticles: Particle[] = []
    for (const [row, col] of popCells) {
      const cell = board[row][col]
      if (!cell) continue
      const color = COLOR_HEX[cell.color] ?? '#fff'
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const speed = 30 + Math.random() * 30
        newParticles.push({
          id: particleIdCounter++,
          row: row - VISIBLE_ROW_START,
          col,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color,
        })
      }
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [popCells, board])

  const handleAnimationEnd = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => {
        const style: CSSProperties = {
          position: 'absolute',
          left: p.col * (cellSize + 2) + cellSize / 2,
          top: p.row * (cellSize + 2) + cellSize / 2,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: p.color,
          '--dx': `${p.dx}px`,
          '--dy': `${p.dy}px`,
          animation: 'particle-burst 0.6s ease-out forwards',
        } as CSSProperties
        return (
          <div
            key={p.id}
            style={style}
            onAnimationEnd={() => handleAnimationEnd(p.id)}
          />
        )
      })}
    </div>
  )
}

interface BoardProps {
  displayBoard: GameBoard
  masks: ConnectionMask[][]
  popCells: [number, number][]
  cellSize?: number
}

export default function Board({ displayBoard, masks, popCells, cellSize = 44 }: BoardProps) {
  // 隠し行(row=0)を除いた表示用ボード
  const visibleBoard = displayBoard.slice(VISIBLE_ROW_START)
  const visibleMasks = masks.slice(VISIBLE_ROW_START)
  const popSet = new Set(popCells.map(([r, c]) => `${r},${c}`))

  const boardWidth = BOARD_COLS * (cellSize + 2) - 2
  const boardHeight = visibleBoard.length * (cellSize + 2) - 2

  return (
    <div
      className="relative"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {/* グリッド */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_COLS}, ${cellSize}px)`,
          gap: '2px',
        }}
      >
        {visibleBoard.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const boardRow = rowIdx + VISIBLE_ROW_START
            const isPopping = popSet.has(`${boardRow},${colIdx}`)
            return (
              <PuyoCell
                key={`${rowIdx}-${colIdx}`}
                cell={cell}
                mask={visibleMasks[rowIdx][colIdx]}
                isPopping={isPopping}
                size={cellSize}
              />
            )
          })
        )}
      </div>

      {/* パーティクルレイヤー */}
      <ParticleLayer
        popCells={popCells}
        board={displayBoard}
        cellSize={cellSize}
      />
    </div>
  )
}
