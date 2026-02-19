'use client'

import { useRef } from 'react'
import Board from '@/components/Board'
import GameOverlay from '@/components/GameOverlay'
import NextPuyo from '@/components/NextPuyo'
import ScorePanel from '@/components/ScorePanel'
import { useGame } from '@/hooks/useGame'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useTouch } from '@/hooks/useTouch'

export default function GamePage() {
  const { state, dispatch, displayBoard, masks } = useGame()
  const boardRef = useRef<HTMLDivElement>(null)

  useKeyboard(dispatch)
  useTouch(boardRef, dispatch)

  const {
    phase,
    nextPairs,
    score,
    level,
    currentChain,
    maxChain,
    popCells,
    highScores,
    settings,
  } = state

  return (
    <div
      className="min-h-screen flex items-center justify-center select-none"
      style={{
        background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0a0f1e 100%)',
      }}
    >
      {/* メインコンテナ */}
      <div
        className="flex items-start gap-4 p-6 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* ゲームボード */}
        <div
          ref={boardRef}
          className="relative"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            padding: '4px',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          }}
        >
          <Board
            displayBoard={displayBoard}
            masks={masks}
            popCells={popCells}
            cellSize={44}
          />

          {/* オーバーレイ（スタート/ポーズ/ゲームオーバー） */}
          {(phase === 'idle' || phase === 'paused' || phase === 'gameover') && (
            <GameOverlay
              phase={phase}
              score={score}
              highScores={highScores}
              dispatch={dispatch}
            />
          )}
        </div>

        {/* サイドパネル */}
        <div className="flex flex-col gap-3">
          <NextPuyo pairs={nextPairs} />
          <ScorePanel
            score={score}
            level={level}
            chain={currentChain}
            maxChain={maxChain}
            highScores={highScores}
          />

          {/* 設定 */}
          <div
            className="p-3 rounded-xl flex flex-col gap-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
              <input
                type="checkbox"
                checked={settings.showGhost}
                onChange={() => dispatch({ type: 'TOGGLE_GHOST' })}
                className="accent-purple-500"
              />
              ゴースト
            </label>

            <label className="flex flex-col gap-1 text-xs text-white/70">
              <span>SE音量</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.sfxVolume}
                onChange={e => dispatch({ type: 'SET_SFX_VOLUME', volume: parseFloat(e.target.value) })}
                className="accent-purple-500 w-full"
              />
            </label>
          </div>

          {/* ポーズボタン（ゲーム中のみ） */}
          {phase !== 'idle' && phase !== 'gameover' && (
            <button
              className="px-3 py-2 rounded-xl text-xs text-white/60 transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
            >
              {phase === 'paused' ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
