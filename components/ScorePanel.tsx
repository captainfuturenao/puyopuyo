import type { ScoreEntry } from '@/lib/game/types'

interface ScorePanelProps {
  score: number
  level: number
  chain: number
  maxChain: number
  highScores: ScoreEntry[]
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-white/50 tracking-widest uppercase">{label}</span>
      <span className="text-xl font-bold text-white font-mono tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  )
}

export default function ScorePanel({ score, level, chain, maxChain, highScores }: ScorePanelProps) {
  const bestScore = highScores.length > 0 ? highScores[0].score : 0

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: 120,
      }}
    >
      <StatRow label="SCORE" value={score} />
      <StatRow label="BEST" value={bestScore} />
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      />
      <StatRow label="LEVEL" value={level + 1} />
      <StatRow label="CHAIN" value={chain > 0 ? `×${chain}` : '-'} />
      <StatRow label="MAX" value={maxChain > 0 ? `×${maxChain}` : '-'} />
    </div>
  )
}
