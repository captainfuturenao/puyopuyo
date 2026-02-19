import { COLORS, SPAWN_COL, SPAWN_ROW } from '../constants'
import type { PuyoColor, PuyoPair } from './types'

function randomColor(): PuyoColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

export function generatePair(): PuyoPair {
  return {
    axisCol: SPAWN_COL,
    axisRow: SPAWN_ROW,
    axisColor: randomColor(),
    childColor: randomColor(),
    rotation: 'up', // 子ぷよは軸ぷよの上に
  }
}

export function generateNextPairs(): [PuyoPair, PuyoPair] {
  return [generatePair(), generatePair()]
}
