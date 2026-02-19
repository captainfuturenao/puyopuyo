import { CHAIN_BONUS, COLOR_BONUS, HIGH_SCORE_COUNT, LEVEL_THRESHOLDS, MAX_LEVEL } from '../constants'
import type { ChainStep, ScoreEntry } from './types'

export function calcChainScore(step: ChainStep): number {
  const { chainCount, poppedCount, colorCount } = step

  const chainIdx = Math.min(chainCount - 1, CHAIN_BONUS.length - 1)
  const chainMultiplier = CHAIN_BONUS[chainIdx] ?? CHAIN_BONUS[CHAIN_BONUS.length - 1]

  const colorIdx = Math.min(colorCount, COLOR_BONUS.length - 1)
  const colorBonus = COLOR_BONUS[colorIdx] ?? 0

  return (poppedCount * 10) * chainMultiplier + colorBonus * 100
}

export function calcLevel(totalCleared: number): number {
  let level = 0
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalCleared >= LEVEL_THRESHOLDS[i]) {
      level = i
    }
  }
  return Math.min(level, MAX_LEVEL)
}

/** ハイスコアリストを更新して上位N件を返す */
export function updateHighScores(
  current: ScoreEntry[],
  newEntry: ScoreEntry
): ScoreEntry[] {
  const updated = [...current, newEntry]
  updated.sort((a, b) => b.score - a.score)
  return updated.slice(0, HIGH_SCORE_COUNT)
}
