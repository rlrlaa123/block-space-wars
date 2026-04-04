import type { Ball, Brick, Vec2 } from './types'
import {
  BALL_RADIUS, SUBSTEPS, GRAVITY_WELL_FORCE,
  GRAVITY_WELL_MIN_DIST, GRAVITY_WELL_RADIUS_CELLS,
  SHIELD_ARC_DEG, SHIELD_ROTATION_PERIOD,
  GRID_COLS, BRICK_GAP,
} from './constants'

// ── Layout helpers (need canvas dimensions) ──

export interface LayoutInfo {
  gridOffsetY: number  // top of brick area
  cellSize: number
  canvasW: number
  canvasH: number
  launchY: number      // y where balls launch from
}

export function computeLayout(canvasW: number, canvasH: number): LayoutInfo {
  const gridOffsetY = canvasH * 0.05 // below HUD
  const cellSize = (canvasW - BRICK_GAP * (GRID_COLS + 1)) / GRID_COLS
  const launchY = canvasH - 30
  return { gridOffsetY, cellSize, canvasW, canvasH, launchY }
}

export function brickRect(brick: Brick, layout: LayoutInfo) {
  const { cellSize, gridOffsetY } = layout
  const x = BRICK_GAP + brick.col * (cellSize + BRICK_GAP)
  const y = gridOffsetY + brick.row * (cellSize + BRICK_GAP)
  const w = brick.width * cellSize + (brick.width - 1) * BRICK_GAP
  const h = brick.height * cellSize + (brick.height - 1) * BRICK_GAP
  return { x, y, w, h }
}

// ── Ball-Brick AABB collision ──

interface CollisionResult {
  hit: boolean
  normalX: number
  normalY: number
}

function ballBrickCollision(ball: Ball, bx: number, by: number, bw: number, bh: number): CollisionResult {
  const r = BALL_RADIUS
  // Find closest point on brick to ball center
  const closestX = Math.max(bx, Math.min(ball.pos.x, bx + bw))
  const closestY = Math.max(by, Math.min(ball.pos.y, by + bh))

  const dx = ball.pos.x - closestX
  const dy = ball.pos.y - closestY
  const distSq = dx * dx + dy * dy

  if (distSq >= r * r) {
    return { hit: false, normalX: 0, normalY: 0 }
  }

  // Determine reflection normal
  const dist = Math.sqrt(distSq)
  if (dist < 0.001) {
    // Ball center inside brick, push out via velocity direction
    return { hit: true, normalX: -Math.sign(ball.vel.x) || 1, normalY: -Math.sign(ball.vel.y) || 1 }
  }

  // Normal points from brick surface to ball center
  return { hit: true, normalX: dx / dist, normalY: dy / dist }
}

// ── Wall bounce ──

export function wallBounce(ball: Ball, canvasW: number, _canvasH: number, launchY: number): boolean {
  const r = BALL_RADIUS
  // Left wall
  if (ball.pos.x - r <= 0) {
    ball.pos.x = r
    ball.vel.x = Math.abs(ball.vel.x)
  }
  // Right wall
  if (ball.pos.x + r >= canvasW) {
    ball.pos.x = canvasW - r
    ball.vel.x = -Math.abs(ball.vel.x)
  }
  // Top wall
  if (ball.pos.y - r <= 0) {
    ball.pos.y = r
    ball.vel.y = Math.abs(ball.vel.y)
  }
  // Bottom = ball landed
  if (ball.pos.y + r >= launchY) {
    ball.pos.y = launchY - r
    ball.landed = true
    return true
  }
  return false
}

// ── Reflect ball off normal ──

function reflect(ball: Ball, nx: number, ny: number) {
  const dot = ball.vel.x * nx + ball.vel.y * ny
  ball.vel.x -= 2 * dot * nx
  ball.vel.y -= 2 * dot * ny
  // Push ball out of overlap
  ball.pos.x += nx * 1
  ball.pos.y += ny * 1
}

// ── Gravity well force ──

export function applyGravityWell(ball: Ball, brick: Brick, layout: LayoutInfo, dt: number) {
  const rect = brickRect(brick, layout)
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2

  const dx = cx - ball.pos.x
  const dy = cy - ball.pos.y
  let distNorm = Math.sqrt(dx * dx + dy * dy) / layout.cellSize

  // NaN guard
  if (distNorm < GRAVITY_WELL_MIN_DIST) distNorm = GRAVITY_WELL_MIN_DIST

  const radius = GRAVITY_WELL_RADIUS_CELLS
  if (distNorm > radius) return

  const force = GRAVITY_WELL_FORCE * layout.cellSize / (distNorm * distNorm)
  const angle = Math.atan2(dy, dx)
  ball.vel.x += Math.cos(angle) * force * dt
  ball.vel.y += Math.sin(angle) * force * dt
}

// ── Shield arc collision ──

export function shieldCollision(ball: Ball, brick: Brick, layout: LayoutInfo): boolean {
  const rect = brickRect(brick, layout)
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const shieldRadius = layout.cellSize * 1.2

  const dx = ball.pos.x - cx
  const dy = ball.pos.y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (Math.abs(dist - shieldRadius) > BALL_RADIUS) return false

  // Check if ball is within the arc angle range
  const angle = brick.shieldAngle ?? 0
  const ballAngle = Math.atan2(dy, dx)
  const halfArc = (SHIELD_ARC_DEG * Math.PI / 180) / 2

  let diff = ballAngle - angle
  // Normalize to [-PI, PI]
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI

  if (Math.abs(diff) > halfArc) return false

  // Reflect off arc normal (radial direction)
  const nx = dx / dist
  const ny = dy / dist
  reflect(ball, nx, ny)
  return true
}

// ── Main physics update (one substep) ──

export function physicsSubstep(
  balls: Ball[],
  bricks: Brick[],
  layout: LayoutInfo,
  subDt: number,
): Brick[] {
  const destroyedBricks: Brick[] = []

  for (const ball of balls) {
    if (ball.landed) continue
    if (ball.pos.y < -900) continue // not yet spawned

    // Move
    ball.pos.x += ball.vel.x * subDt
    ball.pos.y += ball.vel.y * subDt

    // Wall bounce
    wallBounce(ball, layout.canvasW, layout.canvasH, layout.launchY)
    if (ball.landed) continue

    // Brick collisions
    for (const brick of bricks) {
      if (brick.dead) continue

      // Gravity well: apply force (no collision)
      if (brick.type === 'gravity-well') {
        applyGravityWell(ball, brick, layout, subDt)
      }

      // Shield arc collision
      if (brick.type === 'shield' && brick.shieldAngle !== undefined) {
        shieldCollision(ball, brick, layout)
      }

      // Standard brick collision
      const rect = brickRect(brick, layout)
      const col = ballBrickCollision(ball, rect.x, rect.y, rect.w, rect.h)
      if (col.hit) {
        reflect(ball, col.normalX, col.normalY)
        brick.hp--
        brick.flashTimer = 3
        if (brick.hp <= 0) {
          brick.dead = true
          destroyedBricks.push(brick)
        }
        break // one collision per substep per ball
      }
    }
  }

  return destroyedBricks
}

// ── Full physics frame ──

export function physicsUpdate(
  balls: Ball[],
  bricks: Brick[],
  layout: LayoutInfo,
  dt: number,
): Brick[] {
  const subDt = dt / SUBSTEPS
  const allDestroyed: Brick[] = []

  // Update shield rotations
  for (const brick of bricks) {
    if (brick.type === 'shield' && !brick.dead) {
      brick.shieldAngle = ((brick.shieldAngle ?? 0) + (2 * Math.PI / SHIELD_ROTATION_PERIOD) * dt)
      if (brick.shieldAngle! > 2 * Math.PI) brick.shieldAngle! -= 2 * Math.PI
    }
  }

  for (let i = 0; i < SUBSTEPS; i++) {
    const destroyed = physicsSubstep(balls, bricks, layout, subDt)
    allDestroyed.push(...destroyed)
  }

  return allDestroyed
}

// ── Aim prediction (dotted line) ──

export function predictTrajectory(
  startX: number,
  startY: number,
  angle: number,
  layout: LayoutInfo,
  bounces: number = 3,
): Vec2[] {
  const points: Vec2[] = [{ x: startX, y: startY }]
  let x = startX
  let y = startY
  let vx = Math.cos(angle)
  let vy = -Math.sin(angle) // negative because canvas y is down

  for (let b = 0; b < bounces; b++) {
    // Find next wall intersection
    let minT = Infinity
    let hitNx = 0
    let hitNy = 0

    // Left wall
    if (vx < 0) {
      const t = -x / vx
      if (t > 0 && t < minT) { minT = t; hitNx = 1; hitNy = 0 }
    }
    // Right wall
    if (vx > 0) {
      const t = (layout.canvasW - x) / vx
      if (t > 0 && t < minT) { minT = t; hitNx = -1; hitNy = 0 }
    }
    // Top wall
    if (vy < 0) {
      const t = -y / vy
      if (t > 0 && t < minT) { minT = t; hitNx = 0; hitNy = 1 }
    }

    if (minT === Infinity) break
    x += vx * minT
    y += vy * minT
    points.push({ x, y })

    // Reflect
    const dot = vx * hitNx + vy * hitNy
    vx -= 2 * dot * hitNx
    vy -= 2 * dot * hitNy
  }

  return points
}
