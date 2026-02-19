'use client'

import type { GamePhase, ScoreEntry } from '@/lib/game/types'
import type { GameAction } from '@/hooks/useGame'

interface GameOverlayProps {
  phase: GamePhase
  score: number
  highScores: ScoreEntry[]
  dispatch: (action: GameAction) => void
}

const glassStyle = {
  background: 'rgba(15,10,30,0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '1rem',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
}

const btnBase =
  'px-6 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer select-none active:scale-95'

export default function GameOverlay({ phase, score, highScores, dispatch }: GameOverlayProps) {
  if (phase === 'idle') {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={glassStyle} className="p-8 flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">ぷよぷよ</h1>
          <p className="text-white/60 text-sm max-w-[200px]">
            同じ色を4つ以上つなげて消そう！
          </p>
          <div className="text-left text-xs text-white/50 space-y-1">
            <p><kbd className="px-1 py-0.5 rounded bg-white/10">←→</kbd>/<kbd className="px-1 py-0.5 rounded bg-white/10">A</kbd><kbd className="px-1 py-0.5 rounded bg-white/10">D</kbd> 移動</p>
            <p><kbd className="px-1 py-0.5 rounded bg-white/10">E</kbd> 右回転 / <kbd className="px-1 py-0.5 rounded bg-white/10">Q</kbd> 左回転</p>
            <p className="text-white/30">（または X / Z）</p>
            <p><kbd className="px-1 py-0.5 rounded bg-white/10">↓</kbd>/<kbd className="px-1 py-0.5 rounded bg-white/10">S</kbd> ソフトドロップ</p>
            <p><kbd className="px-1 py-0.5 rounded bg-white/10">↑</kbd>/<kbd className="px-1 py-0.5 rounded bg-white/10">Space</kbd> ハードドロップ</p>
            <p><kbd className="px-1 py-0.5 rounded bg-white/10">Esc</kbd> 一時停止</p>
          </div>
          <button
            className={`${btnBase} text-lg px-10 py-4`}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            onClick={() => dispatch({ type: 'START_GAME' })}
          >
            START
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'paused') {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)' }}>
        <div style={glassStyle} className="p-8 flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-white">PAUSED</h2>
          <button
            className={`${btnBase} px-10`}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            onClick={() => dispatch({ type: 'RESUME_GAME' })}
          >
            RESUME
          </button>
          <button
            className={`${btnBase} text-sm`}
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
          >
            RESTART
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'gameover') {
    const best = highScores.length > 0 ? highScores[0].score : 0
    const isNewRecord = score > 0 && score >= best
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={glassStyle} className="p-8 flex flex-col items-center gap-5 text-center">
          <h2 className="text-3xl font-black text-red-400">GAME OVER</h2>
          {isNewRecord && (
            <span className="text-yellow-400 font-bold text-sm animate-[chain-flash_0.8s_ease_infinite]">
              NEW RECORD!
            </span>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-xs">SCORE</span>
            <span className="text-3xl font-bold text-white font-mono">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-xs">BEST</span>
            <span className="text-xl font-bold text-yellow-300 font-mono">
              {best.toLocaleString()}
            </span>
          </div>

          {highScores.length > 0 && (
            <div className="w-full text-xs text-white/50 space-y-1">
              <div className="text-white/30 text-center mb-1">HIGH SCORES</div>
              {highScores.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex justify-between">
                  <span>{i + 1}.</span>
                  <span className="font-mono">{entry.score.toLocaleString()}</span>
                  <span>Lv{entry.level + 1}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className={`${btnBase} px-10 mt-2`}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return null
}
