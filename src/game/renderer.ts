import type { GameState, Ball, Brick, Item, ScreenShake } from './types'
import type { LayoutInfo } from './physics'
import { brickRect, predictTrajectory } from './physics'
import {
  renderParticles, renderGlowParticles, renderRings,
  renderGlowEffects, renderBgWaves, renderFloorImpacts,
  renderComboTexts, renderConfetti,
  renderShockwaves, renderLaserBeams, renderStarBursts,
  renderChainBeams, renderSpawnFlashes,
} from '../effects/particles'
import { BALL_RADIUS, BRICK_GAP, SHIELD_ARC_DEG, STAGE_TOTAL_ROWS } from './constants'

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

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, _accentColor: string) {
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

// ── Color helpers ──

function hexRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function rgbStr(r: number, g: number, b: number, a = 1): string {
  return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`
}

// ── Block drawing: sci-fi chamfered panel (matches turtle shell pattern) ──

function draw3DBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  baseColor: string, _rad: number,
) {
  const [br, bg, bb] = hexRgb(baseColor)
  const chamfer = Math.min(w, h) * 0.2  // angled corner cuts

  // Helper: build chamfered hex-ish panel path
  const panelPath = (px: number, py: number, pw: number, ph: number) => {
    ctx.beginPath()
    ctx.moveTo(px + chamfer, py)
    ctx.lineTo(px + pw - chamfer, py)
    ctx.lineTo(px + pw, py + chamfer)
    ctx.lineTo(px + pw, py + ph - chamfer)
    ctx.lineTo(px + pw - chamfer, py + ph)
    ctx.lineTo(px + chamfer, py + ph)
    ctx.lineTo(px, py + ph - chamfer)
    ctx.lineTo(px, py + chamfer)
    ctx.closePath()
  }

  // 1) Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  panelPath(x + 1, y + 2, w, h)
  ctx.fill()

  // 2) Dark base (fills whole panel shape)
  ctx.fillStyle = rgbStr(
    Math.round(br * 0.22), Math.round(bg * 0.22), Math.round(bb * 0.22),
  )
  panelPath(x, y, w, h)
  ctx.fill()

  // 3) Lit face (upper-left half, diagonal split)
  ctx.save()
  panelPath(x, y, w, h)
  ctx.clip()
  // Top-left lit zone
  ctx.fillStyle = baseColor
  ctx.beginPath()
  ctx.moveTo(x - 1, y - 1)
  ctx.lineTo(x + w + 1, y - 1)
  ctx.lineTo(x + w + 1, y + h * 0.4)
  ctx.lineTo(x - 1, y + h * 0.75)
  ctx.closePath()
  ctx.fill()
  // Bottom-right shaded zone
  ctx.fillStyle = rgbStr(
    Math.round(br * 0.55), Math.round(bg * 0.55), Math.round(bb * 0.55),
  )
  ctx.beginPath()
  ctx.moveTo(x - 1, y + h * 0.75)
  ctx.lineTo(x + w + 1, y + h * 0.4)
  ctx.lineTo(x + w + 1, y + h + 1)
  ctx.lineTo(x - 1, y + h + 1)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // 4) Inner diagonal seam line (where light meets shadow)
  ctx.strokeStyle = rgbStr(
    Math.round(br * 0.15), Math.round(bg * 0.15), Math.round(bb * 0.15),
  )
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.75)
  ctx.lineTo(x + w, y + h * 0.4)
  ctx.stroke()

  // 5) Inner panel border (inset, creates "plate on plate" feel)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  const inset = 3
  ctx.beginPath()
  ctx.moveTo(x + chamfer, y + inset)
  ctx.lineTo(x + w - chamfer, y + inset)
  ctx.stroke()

  // 6) Corner accent marks (4 small brackets)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1
  const cLen = 3
  // Top-left
  ctx.beginPath()
  ctx.moveTo(x + chamfer + 1, y + cLen + 1)
  ctx.lineTo(x + chamfer + 1, y + 1)
  ctx.lineTo(x + chamfer + 1 + cLen, y + 1)
  ctx.stroke()
  // Top-right
  ctx.beginPath()
  ctx.moveTo(x + w - chamfer - 1 - cLen, y + 1)
  ctx.lineTo(x + w - chamfer - 1, y + 1)
  ctx.lineTo(x + w - chamfer - 1, y + cLen + 1)
  ctx.stroke()

  // 7) Top chamfer rim light (bright)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(x + chamfer, y + 0.5)
  ctx.lineTo(x + w - chamfer, y + 0.5)
  ctx.stroke()
  // Top-left chamfer edge
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.moveTo(x + 0.5, y + chamfer)
  ctx.lineTo(x + chamfer, y + 0.5)
  ctx.stroke()
  // Top-right chamfer edge
  ctx.beginPath()
  ctx.moveTo(x + w - chamfer, y + 0.5)
  ctx.lineTo(x + w - 0.5, y + chamfer)
  ctx.stroke()

  // 8) Crisp dark outline (full silhouette)
  ctx.strokeStyle = rgbStr(
    Math.round(br * 0.1), Math.round(bg * 0.1), Math.round(bb * 0.1),
  )
  ctx.lineWidth = 1
  panelPath(x + 0.5, y + 0.5, w - 1, h - 1)
  ctx.stroke()
}

// ── Brick rendering ──

function getBrickBase(brick: Brick, brickColor: string, accentColor: string): string {
  if (brick.flashTimer > 0) return '#ffffff'
  switch (brick.type) {
    case 'gravity-well': return '#9b59b6'
    case 'shield': return '#3498db'
    case 'splitter': return '#e67e22'
    default: {
      const ratio = brick.hp / brick.maxHp
      return ratio <= 0.25 ? accentColor : brickColor
    }
  }
}

function drawBrick(
  ctx: CanvasRenderingContext2D, brick: Brick, layout: LayoutInfo,
  brickColor: string, accentColor: string,
) {
  if (brick.dead) return
  const { x, y, w, h } = brickRect(brick, layout)
  const base = getBrickBase(brick, brickColor, accentColor)
  const rad = Math.min(w, h) * 0.1 // tighter corners, more geometric

  if (brick.flashTimer > 0) {
    brick.flashTimer--
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, rad)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = `bold ${Math.min(w * 0.38, 13)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${brick.hp}`, x + w / 2, y + h / 2)
    return
  }

  draw3DBlock(ctx, x, y, w, h, base, rad)

  // ── Special brick decorations ──
  const bcx = x + w / 2, bcy = y + h / 2

  if (brick.type === 'gravity-well') {
    // Pulsing rings
    ctx.strokeStyle = 'rgba(200, 150, 255, 0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(bcx, bcy, layout.cellSize * 1.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(200, 150, 255, 0.08)'
    ctx.beginPath()
    ctx.arc(bcx, bcy, layout.cellSize * 2, 0, Math.PI * 2)
    ctx.stroke()
    // Inner glow
    ctx.globalAlpha = 0.25
    const gwG = ctx.createRadialGradient(bcx, bcy, 0, bcx, bcy, w * 0.5)
    gwG.addColorStop(0, '#e0b0ff')
    gwG.addColorStop(1, 'transparent')
    ctx.fillStyle = gwG
    ctx.beginPath()
    ctx.arc(bcx, bcy, w * 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  if (brick.type === 'shield' && brick.shieldAngle !== undefined) {
    const radius = layout.cellSize * 1.2
    const halfArc = (SHIELD_ARC_DEG * Math.PI / 180) / 2
    // Glow
    ctx.globalAlpha = 0.15
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(bcx, bcy, radius, brick.shieldAngle - halfArc, brick.shieldAngle + halfArc)
    ctx.stroke()
    ctx.globalAlpha = 1
    // Arc
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(bcx, bcy, radius, brick.shieldAngle - halfArc, brick.shieldAngle + halfArc)
    ctx.stroke()
    ctx.lineWidth = 1
  }

  if (brick.type === 'splitter') {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(bcx, y + 4)
    ctx.lineTo(bcx, y + h - 6)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // ── HP text ──
  const fs = Math.min(w * 0.38, 13)
  ctx.font = `bold ${fs}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillText(`${brick.hp}`, bcx, bcy + 1)
  ctx.fillStyle = '#fff'
  ctx.fillText(`${brick.hp}`, bcx, bcy)
}

// ── Item rendering ──

function drawItem(ctx: CanvasRenderingContext2D, item: Item, layout: LayoutInfo) {
  if (item.collected) return
  const cellX = BRICK_GAP + item.col * (layout.cellSize + BRICK_GAP)
  const cellY = layout.gridOffsetY + item.row * (layout.cellSize + BRICK_GAP)
  const pad = layout.cellSize * 0.12
  const ix = cellX + pad
  const iy = cellY + pad
  const iw = layout.cellSize - pad * 2
  const ih = layout.cellSize - pad * 2
  const cx = cellX + layout.cellSize / 2
  const cy = cellY + layout.cellSize / 2
  const rad = Math.min(iw, ih) * 0.15

  const colorMap: Record<string, string> = {
    ball: '#2ecc71', bomb: '#e74c3c', laser: '#3498db',
    multiplier: '#f39c12', pierce: '#9b59b6',
  }
  const base = colorMap[item.type] ?? '#f1c40f'

  // Subtle halo glow
  ctx.globalAlpha = 0.15
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, iw * 0.7)
  glow.addColorStop(0, base)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, iw * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  draw3DBlock(ctx, ix, iy, iw, ih, base, rad)

  // Icon
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fs = Math.min(iw * 0.45, 14)

  switch (item.type) {
    case 'ball':
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.font = `bold ${fs}px sans-serif`
      ctx.fillText(`+${item.bonusAmount ?? 1}`, cx, cy + 1)
      ctx.fillStyle = '#fff'
      ctx.fillText(`+${item.bonusAmount ?? 1}`, cx, cy)
      break
    case 'bomb': {
      const br = iw * 0.13
      ctx.fillStyle = '#1a1a2e'
      ctx.beginPath(); ctx.arc(cx, cy + 1, br, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#ffd93d'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx + br * 0.5, cy - br * 0.3)
      ctx.quadraticCurveTo(cx + br * 1.5, cy - br * 2, cx + br * 0.2, cy - br * 2.5)
      ctx.stroke()
      ctx.fillStyle = '#ffd93d'
      ctx.beginPath(); ctx.arc(cx + br * 0.2, cy - br * 2.5, 2, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'laser': {
      const s = iw * 0.15
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.2 + 0.5, cy - s * 1.3 + 1)
      ctx.lineTo(cx + s * 0.6 + 0.5, cy - s * 0.1 + 1)
      ctx.lineTo(cx - s * 0.05 + 0.5, cy + 1)
      ctx.lineTo(cx + s * 0.2 + 0.5, cy + s * 1.3 + 1)
      ctx.lineTo(cx - s * 0.6 + 0.5, cy + s * 0.1 + 1)
      ctx.lineTo(cx + s * 0.05 + 0.5, cy + 1)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.2, cy - s * 1.3)
      ctx.lineTo(cx + s * 0.6, cy - s * 0.1)
      ctx.lineTo(cx - s * 0.05, cy)
      ctx.lineTo(cx + s * 0.2, cy + s * 1.3)
      ctx.lineTo(cx - s * 0.6, cy + s * 0.1)
      ctx.lineTo(cx + s * 0.05, cy)
      ctx.closePath(); ctx.fill()
      break
    }
    case 'multiplier':
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.font = `bold ${fs}px sans-serif`
      ctx.fillText('×3', cx, cy + 1)
      ctx.fillStyle = '#fff'
      ctx.fillText('×3', cx, cy)
      break
    case 'pierce': {
      const d = iw * 0.2
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.moveTo(cx + 0.5, cy - d + 1); ctx.lineTo(cx + d * 0.7 + 0.5, cy + 1)
      ctx.lineTo(cx + 0.5, cy + d + 1); ctx.lineTo(cx - d * 0.7 + 0.5, cy + 1)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(cx, cy - d); ctx.lineTo(cx + d * 0.7, cy)
      ctx.lineTo(cx, cy + d); ctx.lineTo(cx - d * 0.7, cy)
      ctx.closePath(); ctx.fill()
      break
    }
    default:
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${fs}px sans-serif`
      ctx.fillText('?', cx, cy)
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

// ── HUD (brick-blitz style) ──

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, layout: LayoutInfo, _chapterName: string, accentColor: string) {
  const w = layout.canvasW

  // Top bar background (only covers HUD text area, not bounce space)
  ctx.fillStyle = '#08081e'
  ctx.fillRect(0, 0, w, 68)
  // Separator line at HUD bottom
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 67.5)
  ctx.lineTo(w, 67.5)
  ctx.stroke()

  // Menu button (top-left)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.roundRect(8, 8, 36, 28, 6)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.roundRect(8, 8, 36, 28, 6)
  ctx.stroke()
  // Hamburger lines
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1.5
  for (const dy of [-5, 0, 5]) {
    ctx.beginPath()
    ctx.moveTo(16, 22 + dy)
    ctx.lineTo(36, 22 + dy)
    ctx.stroke()
  }

  // Chapter + Stage label (centered)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`Ch.${state.currentChapter + 1} - ${state.currentStage + 1}`, w / 2, 22)

  // ── Bottom HUD bar (opaque, clearly separated) ──
  const bottomBarY = layout.launchY + 12
  const bottomBarH = layout.canvasH - bottomBarY
  // Solid dark background so game objects can't show through
  ctx.fillStyle = '#08081e'
  ctx.fillRect(0, bottomBarY, w, bottomBarH)
  // Subtle top highlight line
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, bottomBarY + 0.5)
  ctx.lineTo(w, bottomBarY + 0.5)
  ctx.stroke()

  // Ball count (bottom-left, amber)
  const bottomMid = bottomBarY + bottomBarH / 2
  ctx.fillStyle = '#f5a623'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  // Ball icon (small circle)
  ctx.beginPath()
  ctx.arc(16, bottomMid, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(16, bottomMid, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f5a623'
  ctx.fillText(`×${state.ballCount}`, 26, bottomMid)

  // Progress bar — uses rowsSpawned for monotonic progress (never decreases)
  {
    const totalRows = STAGE_TOTAL_ROWS[state.currentChapter] ?? 10
    const aliveBricks = state.bricks.filter(b => !b.dead).length
    // Stage clear happens when all rows spawned AND 0 alive.
    // Progress = rows spawned portion + fraction cleared of current alive bricks
    const rowsPct = Math.min(1, state.rowsSpawned / totalRows)
    const clearBonus = state.rowsSpawned >= totalRows && state.totalBricksSpawned > 0
      ? (1 - aliveBricks / Math.max(1, state.bricks.length)) * 0
      : 0
    // Simpler: just rowsSpawned / totalRows, capped at "almost there" until all clear
    let pct = rowsPct
    if (state.rowsSpawned >= totalRows) {
      // All rows spawned — show 90% until aliveBricks = 0, then 100%
      const cleared = state.totalBricksSpawned > 0
        ? state.bricksDestroyed / state.totalBricksSpawned
        : 0
      pct = 0.9 + cleared * 0.1
    } else {
      pct = rowsPct * 0.9
    }
    void clearBonus
    const barX = 60
    const barY = 56
    const barW = w - 120
    const barH = 6

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 3)
    ctx.fill()

    // Fill
    if (pct > 0) {
      ctx.fillStyle = accentColor
      ctx.beginPath()
      ctx.roundRect(barX, barY, barW * pct, barH, 3)
      ctx.fill()
    }

    // Percentage text
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(pct * 100)}%`, barX - 6, barY + 3)
  }
}

// ── Launch position ──

function drawLaunchPos(ctx: CanvasRenderingContext2D, state: GameState, layout: LayoutInfo) {
  if (state.phase === 'firing') return
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()
  ctx.arc(state.launchX, layout.launchY, BALL_RADIUS + 2, 0, Math.PI * 2)
  ctx.fill()
}

// ── Recall button (only during firing, sits in bottom HUD bar) ──

function drawRecallButton(ctx: CanvasRenderingContext2D, layout: LayoutInfo) {
  const bottomBarY = layout.launchY + 14
  const bottomBarH = layout.canvasH - bottomBarY
  const bottomMid = bottomBarY + bottomBarH / 2

  const btnW = 80
  const btnH = 30
  const x = layout.canvasW - btnW - 14
  const y = bottomMid - btnH / 2

  // Pill background with subtle gradient
  const grad = ctx.createLinearGradient(x, y, x, y + btnH)
  grad.addColorStop(0, 'rgba(78, 205, 196, 0.2)')
  grad.addColorStop(1, 'rgba(78, 205, 196, 0.08)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(x, y, btnW, btnH, 15)
  ctx.fill()

  // Border
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, btnW, btnH, 15)
  ctx.stroke()

  // Arrow icon + text
  ctx.fillStyle = 'rgba(78, 205, 196, 0.9)'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('▼ 회수', x + btnW / 2, y + btnH / 2)
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

function drawStageClear(ctx: CanvasRenderingContext2D, layout: LayoutInfo, timer: number, accentColor: string, state: GameState) {
  const w = layout.canvasW
  const h = layout.canvasH
  const alpha = Math.min(1, timer * 3)

  // Overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * alpha})`
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = alpha

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('★ Stage Clear! ★', w / 2, h * 0.3)

  // Chapter info
  ctx.fillStyle = accentColor
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(`Ch.${state.currentChapter + 1} - Stage ${state.currentStage + 1}`, w / 2, h * 0.3 + 45)

  // Ball count
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '13px sans-serif'
  ctx.fillText(`잔여 공: ${state.ballCount}개`, w / 2, h * 0.3 + 80)

  // "Next" button (pill)
  const btnW = 240
  const btnH = 50
  const btnX = (w - btnW) / 2
  const btnY = h * 0.6

  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 25)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 25)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('다음 스테이지', w / 2, btnY + btnH / 2)

  ctx.globalAlpha = 1
}

function drawChapterClear(ctx: CanvasRenderingContext2D, layout: LayoutInfo, timer: number) {
  const w = layout.canvasW
  const h = layout.canvasH
  const alpha = Math.min(1, timer * 2)

  ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * alpha})`
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = alpha
  ctx.fillStyle = '#ffd700'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPTER', w / 2, h / 2 - 24)
  ctx.fillText('COMPLETE', w / 2, h / 2 + 24)
  ctx.globalAlpha = 1
}

function drawGameOver(ctx: CanvasRenderingContext2D, layout: LayoutInfo, alpha: number, state: GameState, accentColor: string) {
  const w = layout.canvasW
  const h = layout.canvasH

  // Dark overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${0.55 * alpha})`
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = alpha

  // Modal
  const modalW = w - 40
  const modalH = 260
  const modalX = 20
  const modalY = (h - modalH) / 2

  ctx.fillStyle = '#1a2a3a'
  ctx.beginPath()
  ctx.roundRect(modalX, modalY, modalW, modalH, 16)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(modalX, modalY, modalW, modalH, 16)
  ctx.stroke()

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('게임 오버', w / 2, modalY + 28)

  // Level info
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '14px sans-serif'
  ctx.fillText(`Ch.${state.currentChapter + 1} - Stage ${state.currentStage + 1}`, w / 2, modalY + 68)

  // Flavor text
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '12px sans-serif'
  ctx.fillText('블록이 맨 아래 줄에 도달했습니다.', w / 2, modalY + 92)

  // Retry button (pill with accent color)
  const btnW = modalW - 40
  const btnH = 44
  const btnX = modalX + 20
  const retryY = modalY + modalH - 120

  // Parse accent color for rgba
  const r = parseInt(accentColor.slice(1, 3), 16)
  const g = parseInt(accentColor.slice(3, 5), 16)
  const b = parseInt(accentColor.slice(5, 7), 16)

  ctx.fillStyle = `rgba(${r},${g},${b},0.3)`
  ctx.beginPath()
  ctx.roundRect(btnX, retryY, btnW, btnH, 22)
  ctx.fill()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(btnX, retryY, btnW, btnH, 22)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('다시 도전', w / 2, retryY + btnH / 2)

  // Menu button
  const menuY = modalY + modalH - 65
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.roundRect(btnX, menuY, btnW, btnH, 22)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '14px sans-serif'
  ctx.fillText('스테이지 선택', w / 2, menuY + btnH / 2)

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

  // ── PASS 2-5: Game area (clipped between top HUD and bottom HUD) ──
  const gameClipTop = 68 // matches HUD bar height, not gridOffsetY
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, gameClipTop, canvasW, layout.launchY + BALL_RADIUS + 2 - gameClipTop)
  ctx.clip()

  // PASS 2: Game objects
  drawGridContainer(ctx, layout)
  drawDangerLine(ctx, layout)

  for (const item of state.items) drawItem(ctx, item, layout)
  for (const brick of state.bricks) drawBrick(ctx, brick, layout, brickColor, accentColor)

  // PASS 3: Glow pass (additive blending)
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

  // PASS 4: Normal particles + rings + item effects
  renderShockwaves(ctx)
  renderLaserBeams(ctx)
  renderChainBeams(ctx)
  renderStarBursts(ctx)
  renderSpawnFlashes(ctx)
  renderRings(ctx)
  renderParticles(ctx)
  renderFloorImpacts(ctx, layout.launchY)

  // PASS 5: Balls
  for (const ball of state.balls) drawBall(ctx, ball, accentColor)

  ctx.restore() // end game area clip

  // ── PASS 6: HUD + overlays ──
  drawAimLine(ctx, state, layout)
  drawLaunchPos(ctx, state, layout)
  drawHUD(ctx, state, layout, chapterName, accentColor)
  // Recall button AFTER HUD so it draws on top of bottom bar
  if (state.phase === 'firing') drawRecallButton(ctx, layout)
  // Speed indicator (pill badge in top HUD area)
  if (timeScale > 1 && state.phase === 'firing') {
    const label = timeScale >= 4 ? '×4' : '×2'
    const badgeW = 44
    const badgeH = 22
    const bx = canvasW - badgeW - 10
    const by = 11
    // Pill background
    ctx.fillStyle = 'rgba(245, 166, 35, 0.2)'
    ctx.beginPath()
    ctx.roundRect(bx, by, badgeW, badgeH, 11)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245, 166, 35, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(bx, by, badgeW, badgeH, 11)
    ctx.stroke()
    // Arrow icon
    ctx.fillStyle = '#f5a623'
    ctx.beginPath()
    const ax = bx + 14
    const ay = by + badgeH / 2
    ctx.moveTo(ax - 5, ay - 4)
    ctx.lineTo(ax + 3, ay)
    ctx.lineTo(ax - 5, ay + 4)
    ctx.closePath()
    ctx.fill()
    // Label
    ctx.fillStyle = '#f5a623'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, ax + 6, ay)
  }
  renderComboTexts(ctx, canvasW)
  renderConfetti(ctx)

  ctx.restore()

  // Overlays (not affected by shake)
  if (state.showTutorial && state.phase === 'idle') drawTutorial(ctx, layout, time)
  if (state.phase === 'stage-clear') drawStageClear(ctx, layout, state.clearTimer, accentColor, state)
  if (state.chapterClearTimer > 0) drawChapterClear(ctx, layout, state.chapterClearTimer)
  if (state.phase === 'game-over') drawGameOver(ctx, layout, gameOverAlpha, state, accentColor)
}

// ── Util ──

function adjustBrightness(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
