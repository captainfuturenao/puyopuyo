'use client'

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import {
  DROP_INTERVALS,
  LOCK_DELAY,
  POP_DURATION,
  SETTLE_DURATION,
} from '@/lib/constants'
import {
  applyGravity,
  canFallDown,
  canPlace,
  createBoard,
  getHardDropRow,
  placePair,
  tryMove,
  tryRotate,
} from '@/lib/game/board'
import {
  calcAllConnectionMasks,
  countUniqueColors,
  findPoppableGroups,
  groupsToCells,
  popCells,
} from '@/lib/game/chain'
import { generateNextPairs, generatePair } from '@/lib/game/generator'
import { calcChainScore, calcLevel, updateHighScores } from '@/lib/game/score'
import type { GameBoard, GamePhase, GameSettings, GameState, PuyoPair, ScoreEntry } from '@/lib/game/types'
import { loadHighScores, loadSettings, saveHighScores, saveSettings } from '@/lib/storage'
import { audioManager } from '@/lib/audio'

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'TICK'; delta: number }
  | { type: 'POP_COMPLETE' }
  | { type: 'SETTLE_COMPLETE' }
  | { type: 'TOGGLE_GHOST' }
  | { type: 'SET_SFX_VOLUME'; volume: number }

const DEFAULT_SETTINGS: GameSettings = {
  showGhost: true,
  sfxVolume: 0.5,
  bgmVolume: 0,
}

function initState(): GameState {
  const savedSettings = loadSettings()
  const settings: GameSettings = { ...DEFAULT_SETTINGS, ...savedSettings }
  const [next1, next2] = generateNextPairs()
  return {
    phase: 'idle',
    board: createBoard(),
    currentPair: null,
    nextPairs: [next1, next2],
    score: 0,
    level: 0,
    totalCleared: 0,
    maxChain: 0,
    currentChain: 0,
    chainHistory: [],
    lockTimer: 0,
    dropTimer: 0,
    popCells: [],
    highScores: loadHighScores(),
    settings,
    prevPhase: null,
  }
}

function spawnNextPair(state: GameState): GameState {
  const [next1, next2] = state.nextPairs
  const newNext2 = generatePair()
  const newPair: PuyoPair = { ...next1 }

  // ゲームオーバー判定: 出現位置にぷよが置けない
  if (!canPlace(state.board, newPair)) {
    return { ...state, phase: 'gameover', currentPair: null }
  }

  return {
    ...state,
    phase: 'falling',
    currentPair: newPair,
    nextPairs: [next2, newNext2],
    dropTimer: 0,
    lockTimer: 0,
    currentChain: 0,
  }
}

function checkForChains(state: GameState): GameState {
  const groups = findPoppableGroups(state.board)

  if (groups.length === 0) {
    // 消去なし → 次のペア出現
    return spawnNextPair({
      ...state,
      currentChain: 0,
    })
  }

  // 消去あり → popping フェーズへ
  const cells = groupsToCells(groups)
  const colorCount = countUniqueColors(state.board, groups)
  const newChain = state.currentChain + 1

  const chainStep = {
    chainCount: newChain,
    poppedCount: cells.length,
    colorCount,
  }
  const addedScore = calcChainScore(chainStep)

  return {
    ...state,
    phase: 'popping',
    popCells: cells,
    currentChain: newChain,
    maxChain: Math.max(state.maxChain, newChain),
    score: state.score + addedScore,
    totalCleared: state.totalCleared + cells.length,
    level: calcLevel(state.totalCleared + cells.length),
    chainHistory: [...state.chainHistory, chainStep],
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const [next1, next2] = generateNextPairs()
      const newPair = generatePair()
      const board = createBoard()
      return {
        ...initState(),
        board,
        phase: 'falling',
        currentPair: newPair,
        nextPairs: [next1, next2],
        highScores: state.highScores,
        settings: state.settings,
      }
    }

    case 'RESTART_GAME': {
      // ゲームオーバー時にハイスコア保存
      const newEntry: ScoreEntry = {
        score: state.score,
        level: state.level,
        chains: state.maxChain,
        date: new Date().toISOString(),
      }
      const newHighScores = updateHighScores(state.highScores, newEntry)
      saveHighScores(newHighScores)

      const [next1, next2] = generateNextPairs()
      const newPair = generatePair()
      return {
        ...initState(),
        board: createBoard(),
        phase: 'falling',
        currentPair: newPair,
        nextPairs: [next1, next2],
        highScores: newHighScores,
        settings: state.settings,
      }
    }

    case 'TOGGLE_PAUSE': {
      if (state.phase === 'paused') {
        return { ...state, phase: state.prevPhase ?? 'falling', prevPhase: null }
      }
      if (state.phase === 'idle' || state.phase === 'gameover') return state
      return { ...state, phase: 'paused', prevPhase: state.phase }
    }

    case 'PAUSE_GAME': {
      if (state.phase === 'paused' || state.phase === 'idle' || state.phase === 'gameover') return state
      return { ...state, phase: 'paused', prevPhase: state.phase }
    }

    case 'RESUME_GAME': {
      if (state.phase !== 'paused') return state
      return { ...state, phase: state.prevPhase ?? 'falling', prevPhase: null }
    }

    case 'MOVE_LEFT': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      const moved = tryMove(state.board, state.currentPair, -1)
      if (!moved) return state
      audioManager.playMove()
      // 移動成功でlockingから復帰
      const newPhase = state.phase === 'locking' ? 'falling' : state.phase
      return { ...state, currentPair: moved, phase: newPhase, lockTimer: 0 }
    }

    case 'MOVE_RIGHT': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      const moved = tryMove(state.board, state.currentPair, 1)
      if (!moved) return state
      audioManager.playMove()
      const newPhase = state.phase === 'locking' ? 'falling' : state.phase
      return { ...state, currentPair: moved, phase: newPhase, lockTimer: 0 }
    }

    case 'ROTATE_CW': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      const rotated = tryRotate(state.board, state.currentPair, 1)
      if (!rotated) return state
      const newPhase = state.phase === 'locking' ? 'falling' : state.phase
      return { ...state, currentPair: rotated, phase: newPhase, lockTimer: 0 }
    }

    case 'ROTATE_CCW': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      const rotated = tryRotate(state.board, state.currentPair, -1)
      if (!rotated) return state
      const newPhase = state.phase === 'locking' ? 'falling' : state.phase
      return { ...state, currentPair: rotated, phase: newPhase, lockTimer: 0 }
    }

    case 'SOFT_DROP': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      // ソフトドロップ: タイマーを進めるのではなくすぐに1マス落下
      const canDrop = canFallDown(state.board, state.currentPair)
      if (!canDrop) return state
      const dropped = { ...state.currentPair, axisRow: state.currentPair.axisRow + 1 }
      return { ...state, currentPair: dropped, phase: 'falling', dropTimer: 0 }
    }

    case 'HARD_DROP': {
      if (state.phase !== 'falling' && state.phase !== 'locking') return state
      if (!state.currentPair) return state
      const dropRow = getHardDropRow(state.board, state.currentPair)
      const dropped = { ...state.currentPair, axisRow: dropRow }
      const newBoard = applyGravity(placePair(state.board, dropped))
      audioManager.playDrop()
      return checkForChains({
        ...state,
        board: newBoard,
        currentPair: null,
        phase: 'checking',
      })
    }

    case 'TICK': {
      if (state.phase === 'falling') {
        if (!state.currentPair) return state

        const dropInterval = DROP_INTERVALS[state.level] ?? DROP_INTERVALS[DROP_INTERVALS.length - 1]
        const newDropTimer = state.dropTimer + action.delta

        if (newDropTimer >= dropInterval) {
          // 落下タイマー到達
          const canDrop = canFallDown(state.board, state.currentPair)
          if (canDrop) {
            const dropped = { ...state.currentPair, axisRow: state.currentPair.axisRow + 1 }
            return { ...state, currentPair: dropped, dropTimer: newDropTimer - dropInterval }
          } else {
            // 接地 → lockingフェーズへ
            return { ...state, phase: 'locking', dropTimer: 0, lockTimer: 0 }
          }
        }
        return { ...state, dropTimer: newDropTimer }
      }

      if (state.phase === 'locking') {
        if (!state.currentPair) return state

        const newLockTimer = state.lockTimer + action.delta

        // 接地解除チェック（移動・回転で接地解除される場合はACTION側で処理済み）
        if (!canFallDown(state.board, state.currentPair)) {
          if (newLockTimer >= LOCK_DELAY) {
            // 接地確定
            const newBoard = applyGravity(placePair(state.board, state.currentPair))
            audioManager.playDrop()
            return checkForChains({
              ...state,
              board: newBoard,
              currentPair: null,
              phase: 'checking',
              lockTimer: 0,
            })
          }
          return { ...state, lockTimer: newLockTimer }
        } else {
          // 接地解除（移動などで）
          return { ...state, phase: 'falling', lockTimer: 0 }
        }
      }

      return state
    }

    case 'POP_COMPLETE': {
      if (state.phase !== 'popping') return state
      // ぷよを消去して重力適用
      const poppedBoard = applyGravity(popCells(state.board, state.popCells))
      audioManager.playPop(state.currentChain)
      return {
        ...state,
        phase: 'settling',
        board: poppedBoard,
        popCells: [],
      }
    }

    case 'SETTLE_COMPLETE': {
      if (state.phase !== 'settling') return state
      // 再度連鎖チェック
      return checkForChains(state)
    }

    case 'TOGGLE_GHOST': {
      const newSettings = { ...state.settings, showGhost: !state.settings.showGhost }
      saveSettings(newSettings)
      return { ...state, settings: newSettings }
    }

    case 'SET_SFX_VOLUME': {
      const newSettings = { ...state.settings, sfxVolume: action.volume }
      audioManager.setVolume(action.volume)
      saveSettings(newSettings)
      return { ...state, settings: newSettings }
    }

    default:
      return state
  }
}

export interface UseGameReturn {
  state: GameState
  dispatch: (action: GameAction) => void
  displayBoard: GameBoard
  masks: number[][]
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const phaseRef = useRef<GamePhase>(state.phase)
  const dispatchRef = useRef(dispatch)

  // refをレンダー外（useLayoutEffect）で同期
  useLayoutEffect(() => {
    phaseRef.current = state.phase
    dispatchRef.current = dispatch
  })

  // ゲームループ（requestAnimationFrame）
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = Math.min(timestamp - lastTimeRef.current, 100) // 最大100ms（タブ非アクティブ対策）
      lastTimeRef.current = timestamp

      const phase = phaseRef.current
      if (phase === 'falling' || phase === 'locking') {
        dispatchRef.current({ type: 'TICK', delta })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // popフェーズのタイマー
  useEffect(() => {
    if (state.phase !== 'popping') return
    const timer = setTimeout(() => {
      dispatchRef.current({ type: 'POP_COMPLETE' })
    }, POP_DURATION)
    return () => clearTimeout(timer)
  }, [state.phase, state.currentChain]) // currentChainも依存（同フェーズで連鎖が進む場合）

  // settlingフェーズのタイマー
  useEffect(() => {
    if (state.phase !== 'settling') return
    const timer = setTimeout(() => {
      dispatchRef.current({ type: 'SETTLE_COMPLETE' })
    }, SETTLE_DURATION)
    return () => clearTimeout(timer)
  }, [state.phase])

  // タイムスタンプリセット（ポーズ解除時）
  useEffect(() => {
    if (state.phase === 'paused') {
      lastTimeRef.current = null
    }
  }, [state.phase])

  // displayBoard: board + ghost + currentPair を合成
  const displayBoard = useCallback((): GameBoard => {
    const board = state.board.map(row => [...row])
    const { currentPair, settings } = state

    if (!currentPair) return board

    // ゴーストぷよ
    if (settings.showGhost && (state.phase === 'falling' || state.phase === 'locking')) {
      const ghostRow = getHardDropRow(state.board, currentPair)
      if (ghostRow !== currentPair.axisRow) {
        const ghostPair = { ...currentPair, axisRow: ghostRow }
        const ar = ghostPair.axisRow
        const ac = ghostPair.axisCol
        if (ar >= 0 && ar < board.length && ac >= 0 && ac < board[0].length && !board[ar][ac]) {
          board[ar][ac] = { color: ghostPair.axisColor, animState: 'ghost' }
        }
        // 子ぷよのゴースト
        const childOffset = getChildOffset(ghostPair.rotation)
        const cr = ar + childOffset[0]
        const cc = ac + childOffset[1]
        if (cr >= 0 && cr < board.length && cc >= 0 && cc < board[0].length && !board[cr][cc]) {
          board[cr][cc] = { color: ghostPair.childColor, animState: 'ghost' }
        }
      }
    }

    // 現在のぷよペア
    const ar = currentPair.axisRow
    const ac = currentPair.axisCol
    if (ar >= 0 && ar < board.length && ac >= 0 && ac < board[0].length) {
      board[ar][ac] = { color: currentPair.axisColor, animState: 'falling' }
    }
    const childOffset = getChildOffset(currentPair.rotation)
    const cr = ar + childOffset[0]
    const cc = ac + childOffset[1]
    if (cr >= 0 && cr < board.length && cc >= 0 && cc < board[0].length) {
      board[cr][cc] = { color: currentPair.childColor, animState: 'falling' }
    }

    return board
  }, [state])()

  const masks = calcAllConnectionMasks(displayBoard)

  return { state, dispatch, displayBoard, masks }
}

function getChildOffset(rotation: string): [number, number] {
  switch (rotation) {
    case 'up':    return [-1, 0]
    case 'right': return [0, 1]
    case 'down':  return [1, 0]
    case 'left':  return [0, -1]
    default:      return [-1, 0]
  }
}
