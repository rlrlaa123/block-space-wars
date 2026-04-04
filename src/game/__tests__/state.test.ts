import { describe, it, expect } from 'vitest'
import {
  createInitialState, startAiming, updateAim, fire,
  updateFiring, endTurn, advanceStage, recallBalls,
} from '../state'
import { INITIAL_BALL_COUNT, RECALL_SPEED } from '../constants'

describe('createInitialState', () => {
  it('returns idle phase with correct defaults', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.ballCount).toBe(INITIAL_BALL_COUNT)
    expect(state.turnCount).toBe(0)
    expect(state.rowsSpawned).toBe(0)
    expect(state.bricksDestroyed).toBe(0)
  })
})

describe('state transitions', () => {
  it('idle -> aiming on startAiming', () => {
    const state = createInitialState()
    startAiming(state, Math.PI / 3)
    expect(state.phase).toBe('aiming')
    expect(state.aimAngle).toBe(Math.PI / 3)
  })

  it('does not aim if not idle', () => {
    const state = createInitialState()
    state.phase = 'firing'
    startAiming(state, Math.PI / 3)
    expect(state.phase).toBe('firing') // unchanged
  })

  it('aiming -> firing on fire', () => {
    const state = createInitialState()
    state.phase = 'aiming'
    state.launchX = 200
    fire(state)
    expect(state.phase).toBe('firing')
    expect(state.balls).toHaveLength(INITIAL_BALL_COUNT)
    expect(state.showTutorial).toBe(false)
  })

  it('does not fire if not aiming', () => {
    const state = createInitialState()
    fire(state) // idle, not aiming
    expect(state.phase).toBe('idle')
    expect(state.balls).toHaveLength(0)
  })

  it('updateAim only works in aiming phase', () => {
    const state = createInitialState()
    state.phase = 'aiming'
    state.aimAngle = Math.PI / 2
    updateAim(state, Math.PI / 4)
    expect(state.aimAngle).toBe(Math.PI / 4)

    state.phase = 'idle'
    updateAim(state, Math.PI / 6)
    expect(state.aimAngle).toBe(Math.PI / 4) // unchanged
  })
})

describe('updateFiring', () => {
  it('returns not done when balls not yet landed', () => {
    const state = createInitialState()
    state.phase = 'firing'
    state.balls = [{
      pos: { x: 200, y: 300 }, vel: { x: 100, y: -500 },
      radius: 7, landed: false, trail: [],
    }]
    const result = updateFiring(state, 1/60, 700)
    expect(result.phaseDone).toBe(false)
  })

  it('returns done when all balls landed', () => {
    const state = createInitialState()
    state.phase = 'firing'
    state.turnTimer = 1 // enough for all to spawn
    state.balls = [{
      pos: { x: 200, y: 690 }, vel: { x: 0, y: 100 },
      radius: 7, landed: true, trail: [],
    }]
    const result = updateFiring(state, 1/60, 700)
    expect(result.phaseDone).toBe(true)
  })

  it('tracks first landed ball X position', () => {
    const state = createInitialState()
    state.phase = 'firing'
    state.turnTimer = 1
    state.firstLandedX = null
    state.balls = [{
      pos: { x: 150, y: 690 }, vel: { x: 0, y: 0 },
      radius: 7, landed: true, trail: [],
    }]
    updateFiring(state, 1/60, 700)
    expect(state.firstLandedX).toBe(150)
  })
})

describe('endTurn', () => {
  it('updates launch position from first landed ball', () => {
    const state = createInitialState()
    state.firstLandedX = 250
    state.launchX = 200
    // Add a brick so it doesn't trigger stage clear
    state.bricks = [{
      row: 2, col: 3, hp: 5, maxHp: 5, type: 'basic',
      width: 1, height: 1, flashTimer: 0, dead: false,
    }]
    state.rowsSpawned = 99 // prevent new row spawn
    endTurn(state)
    expect(state.launchX).toBe(250)
  })

  it('returns game-over when bricks reach bottom', () => {
    const state = createInitialState()
    state.rowsSpawned = 99
    state.bricks = [{
      row: 9, col: 3, hp: 5, maxHp: 5, type: 'basic',
      width: 1, height: 1, flashTimer: 0, dead: false,
    }]
    const result = endTurn(state)
    expect(result).toBe('game-over')
    expect(state.phase).toBe('game-over')
  })

  it('returns stage-clear when all rows spawned and all bricks dead', () => {
    const state = createInitialState()
    state.rowsSpawned = 99
    state.bricks = [{
      row: 2, col: 3, hp: 0, maxHp: 5, type: 'basic',
      width: 1, height: 1, flashTimer: 0, dead: true,
    }]
    const result = endTurn(state)
    expect(result).toBe('stage-clear')
  })

  it('increments turnCount', () => {
    const state = createInitialState()
    state.bricks = [{
      row: 2, col: 3, hp: 5, maxHp: 5, type: 'basic',
      width: 1, height: 1, flashTimer: 0, dead: false,
    }]
    state.rowsSpawned = 99
    endTurn(state)
    expect(state.turnCount).toBe(1)
  })
})

describe('advanceStage', () => {
  it('advances to next stage within chapter', () => {
    const state = createInitialState()
    state.currentChapter = 0
    state.currentStage = 3
    const result = advanceStage(state)
    expect(result).toBe('next-stage')
    expect(state.currentStage).toBe(4)
  })

  it('advances to next chapter at stage 10', () => {
    const state = createInitialState()
    state.currentChapter = 0
    state.currentStage = 9
    const result = advanceStage(state)
    expect(result).toBe('chapter-clear')
    expect(state.currentChapter).toBe(1)
    expect(state.currentStage).toBe(0)
  })

  it('returns game-complete at final chapter', () => {
    const state = createInitialState()
    state.currentChapter = 4
    state.currentStage = 9
    const result = advanceStage(state)
    expect(result).toBe('game-complete')
  })
})

describe('recallBalls', () => {
  it('redirects active balls toward launch position', () => {
    const state = createInitialState()
    state.phase = 'firing'
    state.launchX = 200
    state.balls = [{
      pos: { x: 100, y: 300 }, vel: { x: 500, y: -500 },
      radius: 7, landed: false, trail: [],
    }]
    recallBalls(state, 700)
    // Velocity should now point toward (200, 700)
    expect(state.balls[0].vel.x).toBeGreaterThan(0) // moving right toward launchX
    expect(state.balls[0].vel.y).toBeGreaterThan(0) // moving down toward launchY
    // Speed should be RECALL_SPEED
    const speed = Math.sqrt(state.balls[0].vel.x ** 2 + state.balls[0].vel.y ** 2)
    expect(speed).toBeCloseTo(RECALL_SPEED, 0)
  })

  it('skips landed and unspawned balls', () => {
    const state = createInitialState()
    state.phase = 'firing'
    state.launchX = 200
    state.balls = [
      { pos: { x: 100, y: 300 }, vel: { x: 0, y: 0 }, radius: 7, landed: true, trail: [] },
      { pos: { x: 100, y: -999 }, vel: { x: 0, y: 0 }, radius: 7, landed: false, trail: [] },
    ]
    recallBalls(state, 700)
    expect(state.balls[0].vel.x).toBe(0) // landed, unchanged
    expect(state.balls[1].vel.x).toBe(0) // unspawned, unchanged
  })
})
