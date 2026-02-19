import type { PuyoColor } from './game/types'

export const BOARD_COLS = 6
export const BOARD_ROWS = 13 // 隠し行(row=0)込み
export const VISIBLE_ROW_START = 1 // 表示開始行（row 1〜12が見える）

export const COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple']

// 連鎖倍率（1連鎖=1, 2連鎖=3, 3連鎖=6 ...）
export const CHAIN_BONUS: number[] = [1, 3, 6, 12, 24, 48, 96, 192, 384, 768]

// 同時消し色数ボーナス（1色=0, 2色=3, 3色=6, 4色=12, 5色=24）
export const COLOR_BONUS: number[] = [0, 0, 3, 6, 12, 24]

// レベル別落下間隔 (ms) — レベル0〜14
export const DROP_INTERVALS: number[] = [
  1000, 900, 800, 700, 600, 500, 450, 400, 350, 300, 250, 200, 180, 150, 120,
]

export const LOCK_DELAY = 500 // 接地後の猶予時間 (ms)
export const POP_DURATION = 600 // 消去アニメーション時間 (ms)
export const SETTLE_DURATION = 200 // 落下後の安定待機時間 (ms)

export const SPAWN_COL = 2 // 出現列（0-indexed、軸ぷよ）
export const SPAWN_ROW = 1 // 出現行（表示最上行。子ぷよは rotation='up' で row 0 の隠し行に入る）

export const MIN_GROUP_SIZE = 4 // 消去に必要な最小連結数

// レベルアップ閾値（累計消去ぷよ数）
export const LEVEL_THRESHOLDS: number[] = [
  0, 30, 60, 100, 150, 210, 280, 360, 450, 550, 660, 780, 910, 1050, 1200,
]

export const MAX_LEVEL = 14

export const HIGH_SCORE_COUNT = 5 // ハイスコア保存件数

export const SOFT_DROP_MULTIPLIER = 20 // ソフトドロップ時の落下速度倍率
