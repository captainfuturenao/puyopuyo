import type { PuyoPair } from '@/lib/game/types'
import PuyoCell from './PuyoCell'

interface NextPuyoPreviewProps {
  pair: PuyoPair
  label: string
  size?: number
}

function NextPuyoPreview({ pair, label, size = 28 }: NextPuyoPreviewProps) {
  // 子ぷよは上、軸ぷよは下 の形で表示（rotation'up'のデフォルト配置）
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-white/50 font-mono">{label}</span>
      <div className="flex flex-col items-center gap-0.5">
        <PuyoCell
          cell={{ color: pair.childColor }}
          mask={0}
          size={size}
        />
        <PuyoCell
          cell={{ color: pair.axisColor }}
          mask={0}
          size={size}
        />
      </div>
    </div>
  )
}

interface NextPuyoProps {
  pairs: [PuyoPair, PuyoPair]
}

export default function NextPuyo({ pairs }: NextPuyoProps) {
  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <span className="text-xs font-bold text-white/70 tracking-widest text-center">NEXT</span>
      <NextPuyoPreview pair={pairs[0]} label="1st" size={32} />
      <NextPuyoPreview pair={pairs[1]} label="2nd" size={24} />
    </div>
  )
}
