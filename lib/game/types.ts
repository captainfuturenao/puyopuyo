export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple'

export type Rotation = 'up' | 'right' | 'down' | 'left'

export type GamePhase =
  | 'idle'
  | 'falling'
  | 'locking'
  | 'settling'
  | 'checking'
  | 'popping'
  | 'paused'
  | 'gameover'

// ConnectionMask: 上=8, 右=4, 下=2, 左=1
export type ConnectionMask = number

export interface Puyo {
  color: PuyoColor
  animState?: 'idle' | 'falling' | 'ghost'
}

export type Cell = Puyo | null

export type GameBoard = Cell[][]

export interface PuyoPair {
  axisCol: number
  axisRow: number
  axisColor: PuyoColor
  childColor: PuyoColor
  rotation: Rotation
}

export interface ChainStep {
  chainCount: number
  poppedCount: number
  colorCount: number
}

export interface ScoreEntry {
  score: number
  level: number
  chains: number
  date: string
}

export interface GameSettings {
  showGhost: boolean
  sfxVolume: number
  bgmVolume: number
}

export interface GameState {
  phase: GamePhase
  board: GameBoard
  currentPair: PuyoPair | null
  nextPairs: [PuyoPair, PuyoPair]
  score: number
  level: number
  totalCleared: number
  maxChain: number
  currentChain: number
  chainHistory: ChainStep[]
  lockTimer: number
  dropTimer: number
  popCells: [number, number][]
  highScores: ScoreEntry[]
  settings: GameSettings
  prevPhase: GamePhase | null
}
