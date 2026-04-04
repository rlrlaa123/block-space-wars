import type { GameState, Ball, Brick, Item, ScreenShake } from './types'
import type { LayoutInfo } from './physics'
import { brickRect, predictTrajectory } from './physics'
import {
  renderParticles, renderGlowParticles, renderRings,
  renderGlowEffects, renderBgWaves, renderFloorImpacts,
  renderComboTexts, renderConfetti,
} from '../effects/particles'
import { BALL_RADIUS, GRID_COLS, BRICK_GAP, SHIELD_ARC_DEG } from './constants'

// ── Star field ──
let stars: { x: number; y: number; size: number; phase: number }[] = []

function initStars(w: number, h: number) {
  stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    phase: Math.random() * Math.PI * 2,
  }))
}

// ── Ball rendering with glow + trail + speed lines ──

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, accentColor: string) {
  if (ball.landed || ball.pos.y < -800) return

  // Speed lines (when fast)
  const speed = Math.sqrt(ball.vel.x * ball.vel.x + ball.vel.y * ball.vel.y)
  if (speed > 400) {
    const nx = -ball.vel.x / speed
    const ny = -ball.vel.y / speed
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 3
      const px = -ny * offset
      const py = nx * offset
      ctx.beginPath()
      ctx.moveTo(ball.pos.x + px, ball.pos.y + py)
      ctx.lineTo(ball.pos.x + px + nx * 20, ball.pos.y + py + ny * 20)
      ctx.stroke()
    }
  }

  // Trail (8 positions, fading)
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i]
    const alpha = 0.3 * (1 - i / ball.trail.length)
    const r = Math.max(0.5, BALL_RADIUS * (1 - i * 0.08))
    ctx.fillStyle = `rgba(245, 166, 35, ${alpha})`
    ctx.beginPath()
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Radial glow (4-stop gradient)
  const glowR = BALL_RADIUS * 2.5
  const grad = ctx.createRadialGradient(ball.pos.x, ball.pos.y, 0, ball.pos.x, ball.pos.y, glowR)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  grad.addColorStop(0.3, 'rgba(255, 200, 100, 0.2)')
  grad.addColorStop(0.7, 'rgba(255, 150, 50, 0.05)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(ball.pos.x, ball.pos.y, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Core ball
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // Highlight dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.beginPath()
  ctx.arc(ball.pos.x - 2, ball.pos.y - 2, BALL_RADIUS * 0.3, 0, Math.PI * 2)
  ctx.fill()
}

// ── Brick rendering with HP-tier colors ──

function getBrickColor(brick: Brick, brickColor: string, accentColor: string): string {
  if (brick.flashTimer > 0) return '#ffffff'
  switch (brick.type) {
    case 'gravity-well': return '#9b59b6'
    case 'shield': return '#3498db'
    case 'splitter': return '#e67e22'
    default: {
      // HP-tier brightness: lower HP = brighter
      const ratio = brick.hp / brick.maxHp
      if (ratio <= 0.25) return accentColor
      return brickColor
    }
  }
}

function drawBrick(
  ctx: CanvasRenderingContext2D, brick: Brick, layout: LayoutInfo,
  brickColor: string, accentColor: string,
) {
  if (brick.dead) return
  const { x, y, w, h } = brickRect(brick, layout)
  const color = getBrickColor(brick, brickColor, accentColor)

  // Adjacent flash (brightTimer)
  if (brick.flashTimer > 0) {
    ctx.fillStyle = '#ffffff'
    brick.flashTimer--
  } else {
    ctx.fillStyle = color
  }
  ctx.fillRect(x, y, w, h)

  // Subtle border for definition
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, w, h)

  // HP text
  ctx.fillStyle = brick.flashTimer > 0 ? '#000' : '#ffffff'
  ctx.font = `bold ${Math.min(w * 0.4, 14)}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${brick.hp}`, x + w / 2, y + h / 2)

  // Gravity well radius indicator
  if (brick.type === 'gravity-well') {
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, layout.cellSize * 2, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Shield arc
  if (brick.type === 'shield' && brick.shieldAngle !== undefined) {
    const cx = x + w / 2, cy = y + h / 2
    const radius = layout.cellSize * 1.2
    const halfArc = (SHIELD_ARC_DEG * Math.PI / 180) / 2
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, radius, brick.shieldAngle - halfArc, brick.shieldAngle + halfArc)
    ctx.stroke()
    ctx.lineWidth = 1
  }
}

// ── Item rendering ──

function drawItem(ctx: CanvasRenderingContext2D, item: Item, layout: LayoutInfo) {
  if (item.collected) return
  const x = BRICK_GAP + item.col * (layout.cellSize + BRICK_GAP) + layout.cellSize / 2
  const y = layout.gridOffsetY + item.row * (layout.cellSize + BRICK_GAP) + layout.cellSize / 2
  const r = layout.cellSize * 0.3

  // Pulsing glow
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)

  switch (item.type) {
    case 'ball':
      ctx.fillStyle = '#4caf50'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`+${item.bonusAmount ?? 1}`, x, y)
      break
    case 'bomb':
      ctx.fillStyle = '#e74c3c'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('💥', x, y - 1)
      break
    case 'laser':
      ctx.fillStyle = '#3498db'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⚡', x, y - 1)
      break
    case 'multiplier':
      ctx.fillStyle = '#f1c40f'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('×3', x, y)
      break
    case 'pierce':
      ctx.fillStyle = '#9b59b6'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('◆', x, y)
      break
    default:
      ctx.fillStyle = '#f1c40f'
      ctx.fill()
  }
}

// ── Aim line ──

function drawAimLine(ctx: CanvasRenderingContext2D, state: GameState, layout: LayoutInfo) {
  if (state.phase !== 'aiming') return
  const points = predictTrajectory(state.launchX, layout.launchY, state.aimAngle, layout, 3)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.setLineDash([4, 6])
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y)
    else ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
  ctx.setLineDash([])
}

// ── HUD ──

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, layout: LayoutInfo, chapterName: string) {
  const hudH = layout.canvasH * 0.05
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(0, 0, layout.canvasW, hudH)
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px monospace'
  ctx.textBaseline = 'middle'
  const y = hudH / 2
  ctx.textAlign = 'left'
  ctx.fillText(`${chapterName} ${state.currentStage + 1}/10`, 8, y)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText(`턴 ${state.turnCount}/15`, layout.canvasW / 2, y)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.fillText(`●×${state.ballCount}`, layout.canvasW - 8, y)
}

// ── Launch position ──

function drawLaunchPos(ctx: CanvasRenderingContext2D, state: GameState, layout: LayoutInfo) {
  if (state.phase === 'firing') return
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()
  ctx.arc(state.launchX, layout.launchY, BALL_RADIUS + 2, 0, Math.PI * 2)
  ctx.fill()
}

// ── Recall button (only during firing) ──

function drawRecallButton(ctx: CanvasRenderingContext2D, layout: LayoutInfo) {
  const btnW = 100
  const btnH = 36
  const x = (layout.canvasW - btnW) / 2
  const y = layout.canvasH - btnH - 12

  // Button background
  ctx.fillStyle = 'rgba(140, 160, 220, 0.25)'
  ctx.beginPath()
  ctx.roundRect(x, y, btnW, btnH, 8)
  ctx.fill()

  // Border
  ctx.strokeStyle = 'rgba(140, 160, 220, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, btnW, btnH, 8)
  ctx.stroke()

  // Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⏬ 회수', x + btnW / 2, y + btnH / 2)
}

// ── Tutorial overlay ──

function drawTutorial(ctx: CanvasRenderingContext2D, layout: LayoutInfo, time: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, layout.canvasW, layout.canvasH)
  ctx.fillStyle = '#ffffff'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('↕ 드래그하여 조준', layout.canvasW / 2, layout.canvasH * 0.65)
  const bounce = Math.sin(time * 3) * 10
  ctx.font = '28px sans-serif'
  ctx.fillText('↑', layout.canvasW / 2, layout.canvasH * 0.75 + bounce)
}

// ── Stage / Chapter clear ──

function drawStageClear(ctx: CanvasRenderingContext2D, layout: LayoutInfo, timer: number) {
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = Math.min(1, timer * 3)
  ctx.fillText('CLEAR!', layout.canvasW / 2, layout.canvasH / 2)
  ctx.globalAlpha = 1
}

function drawChapterClear(ctx: CanvasRenderingContext2D, layout: LayoutInfo, timer: number) {
  ctx.fillStyle = '#ffd700'
  ctx.font = 'bold 32px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = Math.min(1, timer * 2)
  ctx.fillText('CHAPTER', layout.canvasW / 2, layout.canvasH / 2 - 24)
  ctx.fillText('COMPLETE', layout.canvasW / 2, layout.canvasH / 2 + 24)
  ctx.globalAlpha = 1
}

function drawGameOver(ctx: CanvasRenderingContext2D, layout: LayoutInfo, alpha: number) {
  ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`
  ctx.fillRect(0, 0, layout.canvasW, layout.canvasH)
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#ff4444'
  ctx.font = 'bold 40px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GAME OVER', layout.canvasW / 2, layout.canvasH / 2)
  ctx.globalAlpha = 1
}

// ── Danger line ──

function drawDangerLine(ctx: CanvasRenderingContext2D, layout: LayoutInfo) {
  const y = layout.launchY - layout.cellSize - BRICK_GAP
  ctx.strokeStyle = 'rgba(255, 60, 60, 0.3)'
  ctx.setLineDash([8, 4])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(layout.canvasW, y)
  ctx.stroke()
  ctx.setLineDash([])
}

// ── Grid container ──

function drawGridContainer(ctx: CanvasRenderingContext2D, layout: LayoutInfo) {
  const x = 0
  const y = layout.gridOffsetY - 2
  const w = layout.canvasW
  const h = layout.launchY - layout.gridOffsetY + 4
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, w, h)
}

// ══════════════════════════════════════════════════════
// MAIN RENDER — 6-pass architecture
// ══════════════════════════════════════════════════════

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: LayoutInfo,
  shake: ScreenShake,
  bgColor: string,
  brickColor: string,
  accentColor: string,
  chapterName: string,
  time: number,
  gameOverAlpha: number,
  bgFlashAlpha: number,
  timeScale: number,
) {
  const { canvasW, canvasH } = layout

  ctx.save()
  ctx.translate(shake.offsetX, shake.offsetY)

  // ── PASS 1: Background ──
  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasH)
  bgGrad.addColorStop(0, bgColor)
  bgGrad.addColorStop(1, adjustBrightness(bgColor, -20))
  ctx.fillStyle = bgGrad
  ctx.fillRect(-10, -10, canvasW + 20, canvasH + 20)

  // Stars
  if (stars.length === 0) initStars(canvasW, canvasH)
  for (const star of stars) {
    const twinkle = Math.sin(time * 2 + star.phase) * 0.2 + 0.5
    ctx.globalAlpha = twinkle
    ctx.fillStyle = '#fff'
    ctx.fillRect(star.x, star.y, star.size, star.size)
  }
  ctx.globalAlpha = 1

  // Background waves
  renderBgWaves(ctx)

  // Background flash (combo)
  if (bgFlashAlpha > 0) {
    ctx.fillStyle = `rgba(100, 150, 255, ${bgFlashAlpha})`
    ctx.fillRect(0, 0, canvasW, canvasH)
  }

  // ── PASS 2: Game objects ──
  drawGridContainer(ctx, layout)
  drawDangerLine(ctx, layout)

  for (const item of state.items) drawItem(ctx, item, layout)
  for (const brick of state.bricks) drawBrick(ctx, brick, layout, brickColor, accentColor)

  // ── PASS 3: Glow pass (additive blending) ──
  ctx.globalCompositeOperation = 'lighter'
  renderGlowEffects(ctx)
  renderGlowParticles(ctx)
  // Ball trails in glow pass for luminous effect
  for (const ball of state.balls) {
    if (ball.landed || ball.pos.y < -800 || ball.trail.length < 2) continue
    for (let i = 0; i < ball.trail.length; i++) {
      const t = ball.trail[i]
      const alpha = 0.2 * (1 - i / ball.trail.length)
      ctx.fillStyle = `rgba(245, 166, 35, ${alpha})`
      ctx.beginPath()
      ctx.arc(t.x, t.y, BALL_RADIUS * (1 - i * 0.08), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalCompositeOperation = 'source-over'

  // ── PASS 4: Normal particles + rings ──
  renderRings(ctx)
  renderParticles(ctx)
  renderFloorImpacts(ctx, layout.launchY)

  // ── PASS 5: Balls ──
  for (const ball of state.balls) drawBall(ctx, ball, accentColor)

  // ── PASS 6: HUD + overlays ──
  drawAimLine(ctx, state, layout)
  drawLaunchPos(ctx, state, layout)
  if (state.phase === 'firing') drawRecallButton(ctx, layout)
  drawHUD(ctx, state, layout, chapterName)
  // Speed indicator
  if (timeScale > 1 && state.phase === 'firing') {
    const label = timeScale >= 4 ? '⏩×4' : '⏩×2'
    ctx.fillStyle = 'rgba(255, 200, 50, 0.8)'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, canvasW / 2, canvasH * 0.05 + 30)
  }
  renderComboTexts(ctx, canvasW)
  renderConfetti(ctx)

  ctx.restore()

  // Overlays (not affected by shake)
  if (state.showTutorial && state.phase === 'idle') drawTutorial(ctx, layout, time)
  if (state.phase === 'stage-clear') drawStageClear(ctx, layout, state.clearTimer)
  if (state.chapterClearTimer > 0) drawChapterClear(ctx, layout, state.chapterClearTimer)
  if (state.phase === 'game-over') drawGameOver(ctx, layout, gameOverAlpha)
}

// ── Util ──

function adjustBrightness(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
