import { BOARD_COLS, BOARD_ROWS } from '../constants'
import type { Cell, GameBoard, PuyoPair, Rotation } from './types'

export function createBoard(): GameBoard {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, (): Cell => null)
  )
}

/**
 * 子ぷよの位置を返す（回転方向から計算）
 * rotation 'up':    軸の1行上
 * rotation 'right': 軸の1列右
 * rotation 'down':  軸の1行下
 * rotation 'left':  軸の1列左
 */
export function getChildPosition(
  axisRow: number,
  axisCol: number,
  rotation: Rotation
): [number, number] {
  switch (rotation) {
    case 'up':    return [axisRow - 1, axisCol]
    case 'right': return [axisRow,     axisCol + 1]
    case 'down':  return [axisRow + 1, axisCol]
    case 'left':  return [axisRow,     axisCol - 1]
  }
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS
}

function isCellFree(board: GameBoard, row: number, col: number): boolean {
  if (!isInBounds(row, col)) return false
  return board[row][col] === null
}

export function canPlace(
  board: GameBoard,
  pair: PuyoPair,
  offsetRow = 0,
  offsetCol = 0
): boolean {
  const ar = pair.axisRow + offsetRow
  const ac = pair.axisCol + offsetCol
  const [cr, cc] = getChildPosition(ar, ac, pair.rotation)

  return isCellFree(board, ar, ac) && isCellFree(board, cr, cc)
}

/** 横移動を試みる。成功したら新しいPuyoPair、失敗したらnull */
export function tryMove(
  board: GameBoard,
  pair: PuyoPair,
  dir: -1 | 1
): PuyoPair | null {
  const moved: PuyoPair = { ...pair, axisCol: pair.axisCol + dir }
  if (canPlace(board, moved)) return moved
  return null
}

/** 回転を試みる（壁蹴り左右1マス込み）。失敗したらnull */
export function tryRotate(
  board: GameBoard,
  pair: PuyoPair,
  dir: 1 | -1
): PuyoPair | null {
  const rotations: Rotation[] = ['up', 'right', 'down', 'left']
  const currentIdx = rotations.indexOf(pair.rotation)
  const nextIdx = (currentIdx + dir + 4) % 4
  const rotated: PuyoPair = { ...pair, rotation: rotations[nextIdx] }

  // そのまま回転できる
  if (canPlace(board, rotated)) return rotated

  // 壁蹴り: 右に1マス
  const kickRight: PuyoPair = { ...rotated, axisCol: rotated.axisCol + 1 }
  if (canPlace(board, kickRight)) return kickRight

  // 壁蹴り: 左に1マス
  const kickLeft: PuyoPair = { ...rotated, axisCol: rotated.axisCol - 1 }
  if (canPlace(board, kickLeft)) return kickLeft

  // 下に1マス（上向きぷよが天井に当たった場合）
  if (rotated.rotation === 'up') {
    const kickDown: PuyoPair = { ...rotated, axisRow: rotated.axisRow + 1 }
    if (canPlace(board, kickDown)) return kickDown
  }

  return null
}

/** ハードドロップ後の軸ぷよ行を返す */
export function getHardDropRow(board: GameBoard, pair: PuyoPair): number {
  let row = pair.axisRow
  while (canPlace(board, { ...pair, axisRow: row + 1 })) {
    row++
  }
  return row
}

/** ゴースト（落下先）のPuyoPairを返す */
export function getGhostPair(board: GameBoard, pair: PuyoPair): PuyoPair {
  const dropRow = getHardDropRow(board, pair)
  return { ...pair, axisRow: dropRow }
}

/** ボードにぷよペアを配置した新しいボードを返す */
export function placePair(board: GameBoard, pair: PuyoPair): GameBoard {
  const newBoard = board.map(row => [...row])
  const [cr, cc] = getChildPosition(pair.axisRow, pair.axisCol, pair.rotation)

  if (isInBounds(pair.axisRow, pair.axisCol)) {
    newBoard[pair.axisRow][pair.axisCol] = { color: pair.axisColor }
  }
  if (isInBounds(cr, cc)) {
    newBoard[cr][cc] = { color: pair.childColor }
  }

  return newBoard
}

/** 重力を適用して浮いているぷよを落下させる（全部落ちきるまでループ） */
export function applyGravity(board: GameBoard): GameBoard {
  const newBoard = board.map(row => [...row])

  // 列ごとに処理：下から上へスキャンして詰める
  for (let col = 0; col < BOARD_COLS; col++) {
    let writeRow = BOARD_ROWS - 1

    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        newBoard[writeRow][col] = newBoard[row][col]
        if (writeRow !== row) {
          newBoard[row][col] = null
        }
        writeRow--
      }
    }
    // 残りをnullに
    while (writeRow >= 0) {
      newBoard[writeRow][col] = null
      writeRow--
    }
  }

  return newBoard
}

/** 2つのボードが異なるか確認 */
export function boardChanged(prev: GameBoard, next: GameBoard): boolean {
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = prev[r][c]
      const n = next[r][c]
      if (p === null && n === null) continue
      if (p === null || n === null) return true
      if (p.color !== n.color) return true
    }
  }
  return false
}

/** 1マス下に移動可能かチェック */
export function canFallDown(board: GameBoard, pair: PuyoPair): boolean {
  return canPlace(board, { ...pair, axisRow: pair.axisRow + 1 })
}
