// Multi-layer particle system inspired by brick-blitz
// Glow particles rendered in separate additive pass

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// ── Particle ──

export interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number
  maxLife: number
  color: string
  size: number
  rotation: number
  rotSpeed: number
  glow: boolean
}

const particles: Particle[] = []
const MAX_PARTICLES = 200

// Brick break: 10-18 particles, speed 80-280
export function spawnBrickBreak(x: number, y: number, w: number, h: number, color: string) {
  const count = 10 + Math.floor(Math.random() * 8)
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 80 + Math.random() * 200
    particles.push({
      x: x + Math.random() * w,
      y: y + Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.3 + Math.random() * 0.35,
      color,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 10,
      glow: Math.random() < 0.2,
    })
  }
}

// Hit spark: 6 smaller particles, short-lived
export function spawnHitSpark(x: number, y: number, color: string) {
  for (let i = 0; i < 6 && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 60 + Math.random() * 140
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.18 + Math.random() * 0.12,
      color,
      size: 2.5 + Math.random() * 3,
      rotation: 0, rotSpeed: 0,
      glow: false,
    })
  }
}

// Item collect burst
export function spawnCollectBurst(x: number, y: number, color: string) {
  for (let i = 0; i < 10 && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 60 + Math.random() * 100
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.4 + Math.random() * 0.2,
      color,
      size: 2.5 + Math.random() * 2,
      rotation: 0, rotSpeed: 0,
      glow: Math.random() < 0.3,
    })
  }
}

export function updateAllParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 250 * dt // gravity
    p.rotation += p.rotSpeed * dt
    p.life -= dt / p.maxLife
    if (p.life <= 0) particles.splice(i, 1)
  }
}

// Normal particles (Pass 4: source-over)
export function renderParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    if (p.glow) continue
    ctx.globalAlpha = Math.max(0, p.life)
    const s = p.size * p.life
    ctx.fillStyle = p.color
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillRect(-s / 2, -s / 2, s, s)
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

// Glow particles (Pass 3: lighter blending)
export function renderGlowParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    if (!p.glow) continue
    const alpha = (p.life / p.maxLife) * 0.8
    // Trail ghost
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.3})`
    ctx.beginPath()
    ctx.arc(p.x - p.vx * 0.02, p.y - p.vy * 0.02, p.size * 0.7, 0, Math.PI * 2)
    ctx.fill()
    // Glow core
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Hit Ring ──

interface RingEffect {
  x: number; y: number; life: number; color: string
}

const rings: RingEffect[] = []

export function spawnHitRing(x: number, y: number, color: string) {
  rings.push({ x, y, life: 1, color })
}

export function updateRings(dt: number) {
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].life -= dt * 4.5
    if (rings[i].life <= 0) rings.splice(i, 1)
  }
}

export function renderRings(ctx: CanvasRenderingContext2D) {
  for (const r of rings) {
    const t = 1 - r.life
    const radius = 6 + t * 20
    ctx.globalAlpha = r.life * 0.7
    ctx.strokeStyle = r.color
    ctx.lineWidth = 2.5 * r.life
    ctx.beginPath()
    ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = r.life * 0.2
    ctx.fillStyle = r.color
    ctx.beginPath()
    ctx.arc(r.x, r.y, radius * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ── Destroy Glow (radial gradient flash) ──

interface GlowEffect {
  x: number; y: number; color: string
  maxRadius: number; life: number; maxLife: number
}

const glowEffects: GlowEffect[] = []

export function spawnDestroyGlow(bx: number, by: number, bw: number, bh: number, color: string) {
  if (glowEffects.length >= 10) return
  glowEffects.push({
    x: bx + bw / 2, y: by + bh / 2,
    color,
    maxRadius: Math.max(bw, bh) * 2,
    life: 0.4, maxLife: 0.4,
  })
}

export function updateGlowEffects(dt: number) {
  for (let i = glowEffects.length - 1; i >= 0; i--) {
    glowEffects[i].life -= dt
    if (glowEffects[i].life <= 0) glowEffects.splice(i, 1)
  }
}

export function renderGlowEffects(ctx: CanvasRenderingContext2D) {
  for (const glow of glowEffects) {
    const progress = 1 - glow.life / glow.maxLife
    const radius = glow.maxRadius * easeOutCubic(progress)
    const alpha = 0.6 * (1 - progress)
    const r = parseInt(glow.color.slice(1, 3), 16)
    const g = parseInt(glow.color.slice(3, 5), 16)
    const b = parseInt(glow.color.slice(5, 7), 16)
    const grad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, Math.max(radius, 1))
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
    grad.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.5})`)
    grad.addColorStop(1, `rgba(0,0,0,0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(glow.x, glow.y, Math.max(radius, 1), 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Background Wave (on brick destroy) ──

interface BgWave {
  x: number; y: number; life: number; maxLife: number; maxRadius: number
}

const bgWaves: BgWave[] = []

export function spawnBackgroundWave(x: number, y: number) {
  if (bgWaves.length >= 5) return
  bgWaves.push({ x, y, life: 0.6, maxLife: 0.6, maxRadius: 150 })
}

export function updateBgWaves(dt: number) {
  for (let i = bgWaves.length - 1; i >= 0; i--) {
    bgWaves[i].life -= dt
    if (bgWaves[i].life <= 0) bgWaves.splice(i, 1)
  }
}

export function renderBgWaves(ctx: CanvasRenderingContext2D) {
  for (const wave of bgWaves) {
    const progress = 1 - wave.life / wave.maxLife
    const radius = wave.maxRadius * easeOutCubic(progress)
    const alpha = 0.08 * (1 - progress)
    ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

// ── Floor Impact (when ball lands) ──

interface FloorImpact {
  x: number; life: number; maxLife: number
}

const floorImpacts: FloorImpact[] = []

export function spawnFloorImpact(x: number) {
  if (floorImpacts.length >= 10) return
  floorImpacts.push({ x, life: 0.2, maxLife: 0.2 })
}

export function updateFloorImpacts(dt: number) {
  for (let i = floorImpacts.length - 1; i >= 0; i--) {
    floorImpacts[i].life -= dt
    if (floorImpacts[i].life <= 0) floorImpacts.splice(i, 1)
  }
}

export function renderFloorImpacts(ctx: CanvasRenderingContext2D, launchY: number) {
  for (const impact of floorImpacts) {
    const progress = 1 - impact.life / impact.maxLife
    const alpha = 0.4 * (1 - progress)
    const w = 20 + 30 * progress
    const h = Math.max(0.5, 3 * (1 - progress))
    ctx.fillStyle = `rgba(245, 166, 35, ${alpha})`
    ctx.beginPath()
    ctx.ellipse(impact.x, launchY, w / 2, h, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Combo Text ──

interface ComboText {
  count: number; life: number; maxLife: number; scale: number
}

const comboTexts: ComboText[] = []

export function spawnComboText(count: number) {
  comboTexts.length = 0
  comboTexts.push({
    count,
    life: 1.2, maxLife: 1.2,
    scale: count >= 10 ? 1.4 : count >= 5 ? 1.2 : 1.0,
  })
}

export function updateComboTexts(dt: number) {
  for (let i = comboTexts.length - 1; i >= 0; i--) {
    comboTexts[i].life -= dt
    if (comboTexts[i].life <= 0) comboTexts.splice(i, 1)
  }
}

export function renderComboTexts(ctx: CanvasRenderingContext2D, canvasW: number) {
  for (const combo of comboTexts) {
    if (combo.count < 2) continue
    const progress = 1 - combo.life / combo.maxLife
    let scale: number, alpha: number, offsetY: number
    if (progress < 0.15) {
      scale = easeOutBack(progress / 0.15) * combo.scale
      alpha = 1; offsetY = 0
    } else if (progress < 0.7) {
      scale = combo.scale; alpha = 1; offsetY = 0
    } else {
      const t = (progress - 0.7) / 0.3
      scale = combo.scale; alpha = 1 - t; offsetY = -30 * t
    }
    const x = canvasW / 2, y = 120 + offsetY
    let text: string, color: string, fontSize: number
    if (combo.count >= 10) { text = `×${combo.count} AMAZING!`; color = '#ff4081'; fontSize = 28 }
    else if (combo.count >= 5) { text = `×${combo.count} COMBO!!`; color = '#ffab40'; fontSize = 24 }
    else { text = `×${combo.count} COMBO!`; color = '#ffd740'; fontSize = 20 }
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    ctx.globalAlpha = alpha
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillText(text, 2, 2)
    ctx.fillStyle = color
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }
}

// ── Confetti (stage clear) ──

interface Confetti {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string
  rotation: number; rotSpeed: number; w: number; h: number
}

const confetti: Confetti[] = []
const CONFETTI_COLORS = ['#ff4081', '#ffab40', '#4caf50', '#2196f3', '#e040fb', '#ff5722', '#00bcd4', '#ffd740']

export function spawnConfetti(canvasW: number) {
  confetti.length = 0
  for (let i = 0; i < 70; i++) {
    confetti.push({
      x: Math.random() * canvasW,
      y: -20 - Math.random() * 300,
      vx: (Math.random() - 0.5) * 80,
      vy: 100 + Math.random() * 150,
      life: 1, maxLife: 2 + Math.random() * 1.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
      w: 4 + Math.random() * 4, h: 8 + Math.random() * 8,
    })
  }
}

export function updateConfetti(dt: number) {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i]
    c.x += c.vx * dt
    c.y += c.vy * dt
    c.vx += (Math.random() - 0.5) * 20 * dt
    c.rotation += c.rotSpeed * dt
    c.life -= dt / c.maxLife
    if (c.life <= 0) confetti.splice(i, 1)
  }
}

export function renderConfetti(ctx: CanvasRenderingContext2D) {
  for (const c of confetti) {
    ctx.globalAlpha = Math.max(0, c.life)
    ctx.fillStyle = c.color
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.rotate(c.rotation)
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

// ── Update All ──

export function updateAllEffects(dt: number) {
  updateAllParticles(dt)
  updateRings(dt)
  updateGlowEffects(dt)
  updateBgWaves(dt)
  updateFloorImpacts(dt)
  updateComboTexts(dt)
  updateConfetti(dt)
}

// ── Clear All ──

export function clearAllEffects() {
  particles.length = 0
  rings.length = 0
  glowEffects.length = 0
  bgWaves.length = 0
  floorImpacts.length = 0
  comboTexts.length = 0
  confetti.length = 0
}
