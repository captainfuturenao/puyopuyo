import type { GameSettings, ScoreEntry } from './game/types'

const HIGH_SCORES_KEY = 'puyo-high-scores'
const SETTINGS_KEY = 'puyo-settings'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function loadHighScores(): ScoreEntry[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ScoreEntry[]
  } catch {
    return []
  }
}

export function saveHighScores(entries: ScoreEntry[]): void {
  if (!isClient()) return
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(entries))
  } catch {
    // localStorage が使えない環境は無視
  }
}

export function loadSettings(): Partial<GameSettings> {
  if (!isClient()) return {}
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<GameSettings>
  } catch {
    return {}
  }
}

export function saveSettings(settings: GameSettings): void {
  if (!isClient()) return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
