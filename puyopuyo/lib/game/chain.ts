import { BOARD_COLS, BOARD_ROWS, MIN_GROUP_SIZE } from '../constants'
import type { ConnectionMask, GameBoard } from './types'

const DIRECTIONS: [number, number][] = [
  [-1, 0], // 上
  [0, 1],  // 右
  [1, 0],  // 下
  [0, -1], // 左
]

/** BFS で同色4連結グループを探す。4つ以上のグループのみ返す */
export function findPoppableGroups(board: GameBoard): Set<string>[] {
  const visited = new Set<string>()
  const groups: Set<string>[] = []

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const cell = board[r][c]
      if (!cell) continue

      const key = `${r},${c}`
      if (visited.has(key)) continue

      // BFS
      const color = cell.color
      const group = new Set<string>()
      const queue: [number, number][] = [[r, c]]

      while (queue.length > 0) {
        const [row, col] = queue.shift()!
        const k = `${row},${col}`
        if (group.has(k)) continue
        group.add(k)
        visited.add(k)

        for (const [dr, dc] of DIRECTIONS) {
          const nr = row + dr
          const nc = col + dc
          if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) continue
          const neighbor = board[nr][nc]
          if (!neighbor || neighbor.color !== color) continue
          const nk = `${nr},${nc}`
          if (group.has(nk)) continue
          queue.push([nr, nc])
        }
      }

      if (group.size >= MIN_GROUP_SIZE) {
        groups.push(group)
      }
    }
  }

  return groups
}

/** グループのセット配列から [row,col][] に変換 */
export function groupsToCells(groups: Set<string>[]): [number, number][] {
  const cells: [number, number][] = []
  for (const group of groups) {
    for (const key of group) {
      const [r, c] = key.split(',').map(Number)
      cells.push([r, c])
    }
  }
  return cells
}

/** 指定セルを消去した新しいボードを返す */
export function popCells(board: GameBoard, cells: [number, number][]): GameBoard {
  const newBoard = board.map(row => [...row])
  for (const [r, c] of cells) {
    newBoard[r][c] = null
  }
  return newBoard
}

/** 指定セルの接続マスク（上=8,右=4,下=2,左=1）を計算 */
export function calcConnectionMask(
  board: GameBoard,
  row: number,
  col: number
): ConnectionMask {
  const cell = board[row][col]
  if (!cell) return 0

  let mask = 0
  const [up, right, down, left] = DIRECTIONS

  const check = (dr: number, dc: number, bit: number) => {
    const nr = row + dr
    const nc = col + dc
    if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) return
    const neighbor = board[nr][nc]
    if (neighbor && neighbor.color === cell.color) mask |= bit
  }

  check(up[0], up[1], 8)
  check(right[0], right[1], 4)
  check(down[0], down[1], 2)
  check(left[0], left[1], 1)

  return mask
}

/** ボード全体の接続マスク配列を計算 */
export function calcAllConnectionMasks(board: GameBoard): ConnectionMask[][] {
  return board.map((row, r) =>
    row.map((_, c) => calcConnectionMask(board, r, c))
  )
}

/** 消去グループが存在する色の数を返す */
export function countUniqueColors(board: GameBoard, groups: Set<string>[]): number {
  const colors = new Set<string>()
  for (const group of groups) {
    const [key] = group
    const [r, c] = key.split(',').map(Number)
    const cell = board[r][c]
    if (cell) colors.add(cell.color)
  }
  return colors.size
}
