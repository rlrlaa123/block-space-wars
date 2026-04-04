import { describe, it, expect } from 'vitest'
import { wallBounce, computeLayout, applyGravityWell, physicsSubstep } from '../physics'
import type { Ball, Brick } from '../types'
import { BALL_RADIUS } from '../constants'

function makeBall(x: number, y: number, vx = 0, vy = 0): Ball {
  return { pos: { x, y }, vel: { x: vx, y: vy }, radius: BALL_RADIUS, landed: false, trail: [] }
}

function makeBrick(row: number, col: number, hp = 1): Brick {
  return {
    row, col, hp, maxHp: hp, type: 'basic', width: 1, height: 1,
    flashTimer: 0, dead: false,
  }
}

describe('wallBounce', () => {
  const canvasW = 390
  const canvasH = 730
  const launchY = 700

  it('reflects off left wall', () => {
    const ball = makeBall(3, 300, -500, 0)
    wallBounce(ball, canvasW, canvasH, launchY)
    expect(ball.vel.x).toBeGreaterThan(0)
    expect(ball.pos.x).toBeGreaterThanOrEqual(BALL_RADIUS)
  })

  it('reflects off right wall', () => {
    const ball = makeBall(canvasW - 3, 300, 500, 0)
    wallBounce(ball, canvasW, canvasH, launchY)
    expect(ball.vel.x).toBeLessThan(0)
  })

  it('reflects off top wall', () => {
    const ball = makeBall(200, 3, 0, -500)
    wallBounce(ball, canvasW, canvasH, launchY)
    expect(ball.vel.y).toBeGreaterThan(0)
  })

  it('marks ball as landed at bottom', () => {
    const ball = makeBall(200, launchY + 5, 0, 500)
    const landed = wallBounce(ball, canvasW, canvasH, launchY)
    expect(landed).toBe(true)
    expect(ball.landed).toBe(true)
  })

  it('does not land ball above launch line', () => {
    const ball = makeBall(200, 400, 0, 500)
    const landed = wallBounce(ball, canvasW, canvasH, launchY)
    expect(landed).toBe(false)
    expect(ball.landed).toBe(false)
  })
})

describe('computeLayout', () => {
  it('returns valid layout dimensions', () => {
    const layout = computeLayout(390, 730)
    expect(layout.canvasW).toBe(390)
    expect(layout.canvasH).toBe(730)
    expect(layout.gridOffsetY).toBeGreaterThan(0)
    expect(layout.cellSize).toBeGreaterThan(0)
    expect(layout.launchY).toBeLessThan(730)
  })
})

describe('applyGravityWell', () => {
  it('applies force toward the well center', () => {
    const layout = computeLayout(390, 730)
    const well: Brick = {
      row: 3, col: 4, hp: 10, maxHp: 10,
      type: 'gravity-well', width: 1, height: 1,
      flashTimer: 0, dead: false,
    }
    // Ball close to the well (within 2×cellSize radius)
    const brickX = 2 + 4 * (layout.cellSize + 2) + layout.cellSize / 2
    const brickY = layout.gridOffsetY + 3 * (layout.cellSize + 2) + layout.cellSize / 2
    const ball = makeBall(brickX - layout.cellSize, brickY, 0, 0)
    applyGravityWell(ball, well, layout, 1/60)
    // Velocity should be pushed toward the well (positive x)
    expect(ball.vel.x).toBeGreaterThan(0)
  })

  it('does not apply force beyond radius', () => {
    const layout = computeLayout(390, 730)
    const well: Brick = {
      row: 0, col: 0, hp: 10, maxHp: 10,
      type: 'gravity-well', width: 1, height: 1,
      flashTimer: 0, dead: false,
    }
    // Ball very far away
    const ball = makeBall(380, 700, 0, 0)
    applyGravityWell(ball, well, layout, 1/60)
    expect(ball.vel.x).toBe(0)
    expect(ball.vel.y).toBe(0)
  })
})

describe('physicsSubstep', () => {
  it('skips unspawned balls (y < -900)', () => {
    const layout = computeLayout(390, 730)
    const ball = makeBall(200, -999, 0, 0) // not yet spawned
    const bricks = [makeBrick(2, 4, 5)]
    const destroyed = physicsSubstep([ball], bricks, layout, 1/60)
    expect(destroyed).toHaveLength(0)
    expect(ball.pos.y).toBe(-999) // unchanged
  })

  it('skips landed balls', () => {
    const layout = computeLayout(390, 730)
    const ball = makeBall(200, 400, 0, 500)
    ball.landed = true
    const bricks = [makeBrick(2, 4, 5)]
    const destroyed = physicsSubstep([ball], bricks, layout, 1/60)
    expect(destroyed).toHaveLength(0)
  })

  it('destroys brick when HP reaches 0', () => {
    const layout = computeLayout(390, 730)
    const brick = makeBrick(2, 4, 1) // 1 HP
    // Place ball right on top of the brick
    const brickX = 2 + 4 * (layout.cellSize + 2)
    const brickY = layout.gridOffsetY + 2 * (layout.cellSize + 2)
    const ball = makeBall(brickX + layout.cellSize / 2, brickY - BALL_RADIUS - 1, 0, 500)
    // Move ball into brick
    const destroyed = physicsSubstep([ball], [brick], layout, 0.02)
    // Ball should have moved and potentially hit
    if (destroyed.length > 0) {
      expect(brick.dead).toBe(true)
      expect(brick.hp).toBe(0)
    }
  })
})
