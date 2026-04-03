import type { GameState, Ball, Brick, Item, GamePhase } from './types'
import {
  BALL_SPEED, BALL_RADIUS, BALL_STAGGER_MS, MAX_BALLS,
  TURN_TIMEOUT_S, STAGE_CLEAR_DELAY, CHAPTER_CLEAR_DELAY,
  STAGES_PER_CHAPTER, TRAIL_LENGTH,
} from './constants'

export function createInitialState(): GameState {
  return {
    phase: 'idle',
    balls: [],
    bricks: [],
    items: [],
    particles: [],
    ballCount: 3,
    launchX: 0, // set when canvas initializes
    aimAngle: Math.PI / 2,
    turnTimer: 0,
    currentChapter: 0,
    currentStage: 0,
    isBossStage: false,
    score: 0,
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

  // Create balls with staggered launch
  const count = Math.min(state.ballCount, MAX_BALLS)
  state.balls = []
  for (let i = 0; i < count; i++) {
    const ball: Ball = {
      pos: { x: state.launchX, y: -999 }, // placed off-screen, spawned over time
      vel: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      landed: false,
      trail: [],
    }
    state.balls.push(ball)
  }
}

export function spawnBall(ball: Ball, launchX: number, launchY: number, angle: number) {
  ball.pos.x = launchX
  ball.pos.y = launchY - BALL_RADIUS
  ball.vel.x = Math.cos(angle) * BALL_SPEED
  ball.vel.y = -Math.sin(angle) * BALL_SPEED
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

  // Track first landed ball
  for (const ball of state.balls) {
    if (ball.landed && state.firstLandedX === null) {
      state.firstLandedX = ball.pos.x
    }
  }

  // Update trails
  for (const ball of state.balls) {
    if (!ball.landed && ball.pos.y > -900) {
      ball.trail.push({ x: ball.pos.x, y: ball.pos.y })
      if (ball.trail.length > TRAIL_LENGTH) ball.trail.shift()
    }
  }

  // Check timeout
  if (state.turnTimer >= TURN_TIMEOUT_S) {
    // Force all balls down
    for (const ball of state.balls) {
      if (!ball.landed) {
        ball.landed = true
        if (state.firstLandedX === null) {
          state.firstLandedX = ball.pos.x
        }
      }
    }
    return { phaseDone: true, timeout: true }
  }

  // Check if all spawned balls have landed
  const allSpawned = state.balls.every(b => b.pos.y > -900)
  const allLanded = state.balls.every(b => b.landed)

  if (allSpawned && allLanded) {
    return { phaseDone: true, timeout: false }
  }

  return { phaseDone: false, timeout: false }
}

export function endTurn(state: GameState): GamePhase {
  // Update launch position to first landed ball
  if (state.firstLandedX !== null) {
    state.launchX = state.firstLandedX
  }

  // Collect items that balls passed through (items on rows where balls were active)
  for (const item of state.items) {
    if (item.collected) continue
    // Items are collected when a ball's landing x is near the item's column
    // Simplified: collect all items that are at or below the brick area
    item.collected = true
    applyItem(state, item)
  }

  // Check stage clear
  const aliveBricks = state.bricks.filter(b => !b.dead)
  if (aliveBricks.length === 0) {
    state.phase = 'stage-clear'
    state.clearTimer = 0
    return 'stage-clear'
  }

  // Move bricks down one row
  for (const brick of aliveBricks) {
    brick.row++
  }
  // Move items down
  for (const item of state.items) {
    if (!item.collected) item.row++
  }

  // Check game over: any brick at row >= GRID_ROWS
  const gameOver = aliveBricks.some(b => b.row >= 10)
  if (gameOver) {
    state.phase = 'game-over'
    return 'game-over'
  }

  // Collect items at bottom row
  for (const item of state.items) {
    if (!item.collected && item.row >= 10) {
      item.collected = true
      applyItem(state, item)
    }
  }
  state.items = state.items.filter(i => !i.collected && i.row < 11)

  state.phase = 'idle'
  state.balls = []
  return 'idle'
}

function applyItem(state: GameState, item: Item) {
  switch (item.type) {
    case 'ball':
      state.ballCount = Math.min(state.ballCount + 1, MAX_BALLS)
      break
    case 'bomb':
      // Destroy nearby bricks (handled in engine)
      break
    case 'power-shot':
      // Next turn balls pierce through (handled in engine)
      break
    case 'wide-shot':
      // Next turn balls spread ±15° (handled in engine)
      break
  }
}

export function advanceStage(state: GameState): 'next-stage' | 'chapter-clear' | 'game-complete' {
  state.currentStage++
  if (state.currentStage >= STAGES_PER_CHAPTER) {
    state.currentStage = 0
    state.currentChapter++
    if (state.currentChapter >= 5) {
      return 'game-complete'
    }
    return 'chapter-clear'
  }
  return 'next-stage'
}
