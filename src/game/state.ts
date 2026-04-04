import type { GameState, Ball, Brick, Item, GamePhase, BrickType } from './types'
import {
  BALL_SPEED, BALL_RADIUS, BALL_STAGGER_MS, MAX_BALLS,
  STAGES_PER_CHAPTER, INITIAL_BALL_COUNT,
  RECALL_SPEED, GRID_COLS, GRID_ROWS, STAGE_TOTAL_ROWS,
} from './constants'
import { CHAPTERS } from './constants'

export function createInitialState(): GameState {
  return {
    phase: 'idle',
    balls: [],
    bricks: [],
    items: [],
    particles: [],
    ballCount: INITIAL_BALL_COUNT,
    launchX: 0,
    aimAngle: Math.PI / 2,
    turnTimer: 0,
    currentChapter: 0,
    currentStage: 0,
    isBossStage: false,
    score: 0,
    turnCount: 0,
    rowsSpawned: 0,
    firstLandedX: null,
    showTutorial: true,
    clearTimer: 0,
    chapterClearTimer: 0,
  }
}

export function startAiming(state: GameState, angle: number) {
  if (state.phase !== 'idle') return
  state.phase = 'aiming'
  state.aimAngle = angle
}

export function updateAim(state: GameState, angle: number) {
  if (state.phase !== 'aiming') return
  state.aimAngle = angle
}

export function fire(state: GameState) {
  if (state.phase !== 'aiming') return
  state.phase = 'firing'
  state.turnTimer = 0
  state.firstLandedX = null
  state.showTutorial = false

  const count = Math.min(state.ballCount, MAX_BALLS)
  state.balls = []
  for (let i = 0; i < count; i++) {
    state.balls.push({
      pos: { x: state.launchX, y: -999 },
      vel: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      landed: false,
      trail: [],
    })
  }
}

export function spawnBall(ball: Ball, launchX: number, launchY: number, angle: number) {
  ball.pos.x = launchX
  ball.pos.y = launchY - BALL_RADIUS
  ball.vel.x = Math.cos(angle) * BALL_SPEED
  ball.vel.y = -Math.sin(angle) * BALL_SPEED
}

// Recall: redirect all active balls downward at high speed
export function recallBalls(state: GameState, launchY: number) {
  if (state.phase !== 'firing') return
  for (const ball of state.balls) {
    if (ball.landed || ball.pos.y < -900) continue
    // Aim directly down toward launch line
    const dx = state.launchX - ball.pos.x
    const dy = launchY - ball.pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      ball.vel.x = (dx / dist) * RECALL_SPEED
      ball.vel.y = (dy / dist) * RECALL_SPEED
    }
  }
}

export function updateFiring(state: GameState, dt: number, launchY: number): {
  phaseDone: boolean
  timeout: boolean
} {
  if (state.phase !== 'firing') return { phaseDone: false, timeout: false }

  state.turnTimer += dt

  // Spawn balls over time (staggered)
  const elapsed = state.turnTimer * 1000
  for (let i = 0; i < state.balls.length; i++) {
    const ball = state.balls[i]
    if (ball.pos.y < -900 && elapsed >= i * BALL_STAGGER_MS) {
      spawnBall(ball, state.launchX, launchY, state.aimAngle)
    }
  }

  // Track first landed ball (sets next turn launch position)
  for (const ball of state.balls) {
    if (ball.landed && state.firstLandedX === null) {
      state.firstLandedX = ball.pos.x
    }
  }

  // Update trails
  for (const ball of state.balls) {
    if (!ball.landed && ball.pos.y > -900) {
      ball.trail.push({ x: ball.pos.x, y: ball.pos.y })
      if (ball.trail.length > 8) ball.trail.shift()
    }
  }

  // No forced timeout — balls bounce until they land naturally

  // All done?
  const allSpawned = state.balls.every(b => b.pos.y > -900)
  const allLanded = state.balls.every(b => b.landed)
  if (allSpawned && allLanded) return { phaseDone: true, timeout: false }

  return { phaseDone: false, timeout: false }
}

// ── Generate a new brick row (called each turn) ──

export function generateNewRow(state: GameState): { bricks: Brick[], items: Item[] } {
  const chapter = CHAPTERS[state.currentChapter]
  const bricks: Brick[] = []
  const items: Item[] = []

  // How many bricks in this row? 4-6 based on chapter
  const brickCount = Math.min(6, 4 + Math.floor(state.currentChapter / 2))

  // Shuffle column positions
  const cols = Array.from({ length: GRID_COLS }, (_, i) => i)
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]]
  }
  const selectedCols = cols.slice(0, brickCount)

  for (const col of selectedCols) {
    // HP scales with ball count (brick-blitz style)
    const scale = 0.4 + (state.currentChapter * 10 + state.currentStage) * 0.06
    const baseHp = Math.ceil(state.ballCount * scale)
    const variance = Math.floor(baseHp * 0.3 * (Math.random() * 2 - 1))
    const hp = Math.max(1, baseHp + variance)

    // Special brick type chance
    let type: BrickType = 'basic'
    if (Math.random() < chapter.specialBrickRate && chapter.specialBrickTypes.length > 0) {
      type = chapter.specialBrickTypes[Math.floor(Math.random() * chapter.specialBrickTypes.length)] as BrickType
    }

    bricks.push({
      row: 0, col, hp, maxHp: hp,
      type, width: 1, height: 1,
      flashTimer: 0, dead: false,
      shieldAngle: type === 'shield' ? Math.random() * Math.PI * 2 : undefined,
    })
  }

  // Extra ball item in a free column (brick-blitz style: 5-10% of ball count)
  const freeCols = cols.filter(c => !selectedCols.includes(c))
  if (freeCols.length > 0 && Math.random() < 0.5) {
    const col = freeCols[Math.floor(Math.random() * freeCols.length)]
    const pct = 0.05 + Math.random() * 0.10
    const bonus = Math.max(3, Math.round(state.ballCount * pct))
    items.push({
      row: 0, col,
      type: 'ball',
      collected: false,
      bonusAmount: bonus,
    })
  }

  // Powerup item (20% chance, from chapter 2+)
  const freeColsAfterBall = freeCols.filter(c => !items.some(i => i.col === c))
  if (freeColsAfterBall.length > 0 && state.currentChapter >= 1 && Math.random() < 0.2) {
    const col = freeColsAfterBall[Math.floor(Math.random() * freeColsAfterBall.length)]
    const powerTypes: ('bomb' | 'laser' | 'multiplier' | 'pierce')[] = ['bomb', 'laser', 'multiplier', 'pierce']
    const type = powerTypes[Math.floor(Math.random() * powerTypes.length)]
    items.push({ row: 0, col, type, collected: false })
  }

  return { bricks, items }
}

// ── End turn: descend bricks, spawn new row, check game over ──

export function endTurn(state: GameState): GamePhase {
  // Update launch position
  if (state.firstLandedX !== null) {
    state.launchX = state.firstLandedX
  }

  state.turnCount++

  const aliveBricks = state.bricks.filter(b => !b.dead)
  const totalRows = STAGE_TOTAL_ROWS[state.currentChapter] ?? 10
  const allRowsSpawned = state.rowsSpawned >= totalRows

  // Stage clear: all rows spawned AND no bricks alive
  if (allRowsSpawned && aliveBricks.length === 0) {
    state.phase = 'stage-clear'
    state.clearTimer = 0
    state.turnCount = 0
    state.rowsSpawned = 0
    return 'stage-clear'
  }

  // Descend all bricks and items by 1 row
  for (const brick of aliveBricks) brick.row++
  for (const item of state.items) {
    if (!item.collected) item.row++
  }

  // Check game over: any brick at bottom
  if (aliveBricks.some(b => b.row >= GRID_ROWS)) {
    state.phase = 'game-over'
    return 'game-over'
  }

  // Remove items that went below grid
  state.items = state.items.filter(i => !i.collected && i.row < GRID_ROWS)

  // Spawn new row at top (only if more rows remain)
  const totalRows2 = STAGE_TOTAL_ROWS[state.currentChapter] ?? 10
  if (state.rowsSpawned < totalRows2) {
    const newRow = generateNewRow(state)
    state.bricks.push(...newRow.bricks)
    state.items.push(...newRow.items)
    state.rowsSpawned++
  }

  state.phase = 'idle'
  state.balls = []
  return 'idle'
}

export function advanceStage(state: GameState): 'next-stage' | 'chapter-clear' | 'game-complete' {
  state.currentStage++
  if (state.currentStage >= STAGES_PER_CHAPTER) {
    state.currentStage = 0
    state.currentChapter++
    if (state.currentChapter >= 5) return 'game-complete'
    return 'chapter-clear'
  }
  return 'next-stage'
}
