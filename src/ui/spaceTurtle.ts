// Refined space turtle — minimal geometric style
// Inspired by Monument Valley / Alto's Odyssey / Journey
// Strong silhouette, restrained detail, atmospheric lighting

export function drawSpaceTurtle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  scale = 1,
  time = 0,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // Palette — deep teal/emerald, with cyan rim light
  const C = {
    shellDark: '#0d2820',
    shellMid: '#1a4a3a',
    shellLight: '#2a6a55',
    shellRim: '#4aef9a',
    bodyDark: '#1a2428',
    bodyMid: '#2c3a40',
    bodyLight: '#4a5a62',
    visorDeep: '#020810',
    visorMid: '#0a1824',
    visorGlow: '#1a3a5a',
    accent: '#4ecdc4',
    warm: '#f5a623',
  }

  // ── Ambient glow (atmospheric) ──
  ctx.globalAlpha = 0.08
  const ambGrad = ctx.createRadialGradient(0, -10, 0, 0, -10, 120)
  ambGrad.addColorStop(0, C.accent)
  ambGrad.addColorStop(0.4, C.accent)
  ambGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = ambGrad
  ctx.beginPath()
  ctx.arc(0, -10, 120, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── Ground shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(0, 68, 32, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // ══════════════════════════════════════════
  //  POSE: 3/4 view, turtle shell as body/chest
  //  Geometric shapes, flat shading with rim lights
  // ══════════════════════════════════════════

  // ── Shell (main body, geometric dome) ──
  // The shell IS the body/torso — turtle wears minimal suit
  const shellY = 8
  const shellRx = 44
  const shellRy = 38

  // Drop shadow behind shell
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.ellipse(3, shellY + 4, shellRx, shellRy, 0, 0, Math.PI * 2)
  ctx.fill()

  // Shell base (dark)
  ctx.fillStyle = C.shellDark
  ctx.beginPath()
  ctx.ellipse(0, shellY, shellRx, shellRy, 0, 0, Math.PI * 2)
  ctx.fill()

  // Shell mid layer (3-tone flat shading, Journey-style)
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(0, shellY, shellRx, shellRy, 0, 0, Math.PI * 2)
  ctx.clip()

  // Mid tone covers top 2/3
  ctx.fillStyle = C.shellMid
  ctx.beginPath()
  ctx.ellipse(0, shellY - 6, shellRx, shellRy, 0, 0, Math.PI * 2)
  ctx.fill()

  // Light tone covers top third (angular cut)
  ctx.fillStyle = C.shellLight
  ctx.beginPath()
  ctx.moveTo(-shellRx, shellY - 18)
  ctx.lineTo(shellRx, shellY - 26)
  ctx.lineTo(shellRx, -shellRy + shellY)
  ctx.lineTo(-shellRx, -shellRy + shellY)
  ctx.closePath()
  ctx.fill()

  // Shell geometric pattern — hex tiles, restrained
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.2
  const hexR = 11
  const hexPositions: [number, number][] = [
    [0, -2],
    [-18, 4], [18, 4],
    [-9, 16], [9, 16],
    [-27, 16], [27, 16],
  ]
  for (const [hx, hy] of hexPositions) {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 6
      const px = hx + Math.cos(a) * hexR
      const py = shellY + hy + Math.sin(a) * hexR * 0.85
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // Geometric emblem (center plate)
  const emG = ctx.createLinearGradient(0, shellY - 8, 0, shellY + 8)
  emG.addColorStop(0, 'rgba(74,239,154,0.15)')
  emG.addColorStop(1, 'rgba(74,239,154,0.02)')
  ctx.fillStyle = emG
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6
    const px = Math.cos(a) * hexR * 1.1
    const py = shellY + Math.sin(a) * hexR * 0.95
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(74,239,154,0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()

  // Shell rim light (top edge)
  ctx.strokeStyle = C.shellRim
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.ellipse(0, shellY, shellRx, shellRy, 0, Math.PI + 0.3, -0.3)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Shell outer border (crisp silhouette)
  ctx.strokeStyle = C.shellDark
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(0, shellY, shellRx, shellRy, 0, 0, Math.PI * 2)
  ctx.stroke()

  // ── Arms (minimal, geometric) ──
  for (const s of [-1, 1]) {
    // Shoulder joint (where arm emerges from shell edge)
    const jx = s * (shellRx - 4)
    const jy = shellY - 4

    // Arm — simple capsule
    ctx.save()
    ctx.translate(jx, jy)
    ctx.rotate(s * 0.4)
    // Arm darker base
    ctx.fillStyle = C.bodyDark
    ctx.beginPath()
    ctx.roundRect(-5, -2, 10, 22, 5)
    ctx.fill()
    // Arm lit side
    ctx.fillStyle = C.bodyMid
    ctx.beginPath()
    ctx.roundRect(-5, -2, 5, 22, [5, 0, 0, 5])
    ctx.fill()
    // Rim light on arm
    ctx.strokeStyle = C.accent
    ctx.globalAlpha = 0.25
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-5, 0); ctx.lineTo(-5, 18)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()

    // Hand/glove (flat teal disc)
    const hx = jx + Math.sin(s * 0.4) * 20
    const hy = jy + Math.cos(s * 0.4) * 22
    ctx.fillStyle = C.shellMid
    ctx.beginPath()
    ctx.arc(hx, hy, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = C.shellRim
    ctx.globalAlpha = 0.4
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(hx, hy, 7, Math.PI + 0.3, -0.3)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // ── Legs (below shell, stubby and geometric) ──
  for (const s of [-1, 1]) {
    const lx = s * 18
    const ly = 48
    // Leg base (dark)
    ctx.fillStyle = C.bodyDark
    ctx.beginPath()
    ctx.roundRect(lx - 8, ly - 6, 16, 18, [4, 4, 2, 2])
    ctx.fill()
    // Lit side
    ctx.fillStyle = C.bodyMid
    ctx.beginPath()
    ctx.roundRect(lx - 8, ly - 6, 6, 18, [4, 0, 0, 2])
    ctx.fill()
    // Foot plate
    ctx.fillStyle = C.shellMid
    ctx.beginPath()
    ctx.roundRect(lx - 9, ly + 10, 18, 4, 2)
    ctx.fill()
    // Rim
    ctx.strokeStyle = C.accent
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lx - 8, ly - 4); ctx.lineTo(lx - 8, ly + 10)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // ── Neck (minimal, geometric) ──
  const neckBase = shellY - shellRy + 12
  ctx.fillStyle = C.bodyDark
  ctx.beginPath()
  ctx.moveTo(-8, neckBase)
  ctx.lineTo(-10, neckBase - 18)
  ctx.lineTo(10, neckBase - 18)
  ctx.lineTo(8, neckBase)
  ctx.closePath()
  ctx.fill()
  // Neck lit edge
  ctx.fillStyle = C.bodyMid
  ctx.beginPath()
  ctx.moveTo(-8, neckBase)
  ctx.lineTo(-10, neckBase - 18)
  ctx.lineTo(-5, neckBase - 18)
  ctx.lineTo(-4, neckBase)
  ctx.closePath()
  ctx.fill()

  // ══════════════════════════════════════════
  //  HELMET (geometric dome, dark visor)
  //  This is the focal point
  // ══════════════════════════════════════════
  const hY = -38
  const hR = 30

  // Helmet shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.arc(2, hY + 2, hR + 2, 0, Math.PI * 2)
  ctx.fill()

  // Helmet outer shell — flat charcoal
  ctx.fillStyle = '#0f1a22'
  ctx.beginPath()
  ctx.arc(0, hY, hR + 2, 0, Math.PI * 2)
  ctx.fill()

  // Helmet metallic ring (thin, high contrast)
  const ringG = ctx.createLinearGradient(-hR, hY, hR, hY)
  ringG.addColorStop(0, '#3a4048')
  ringG.addColorStop(0.3, '#8a9098')
  ringG.addColorStop(0.5, '#d0d5da')
  ringG.addColorStop(0.7, '#8a9098')
  ringG.addColorStop(1, '#3a4048')
  ctx.strokeStyle = ringG
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, hY, hR + 1, 0, Math.PI * 2)
  ctx.stroke()

  // Visor glass (deep space, subtle radial gradient)
  const visG = ctx.createRadialGradient(-6, hY - 6, 0, 0, hY, hR)
  visG.addColorStop(0, C.visorGlow)
  visG.addColorStop(0.5, C.visorMid)
  visG.addColorStop(1, C.visorDeep)
  ctx.fillStyle = visG
  ctx.beginPath()
  ctx.arc(0, hY, hR - 1, 0, Math.PI * 2)
  ctx.fill()

  // ── Space/stars inside visor (atmospheric) ──
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, hY, hR - 1, 0, Math.PI * 2)
  ctx.clip()

  // Distant stars in visor
  const starPositions: [number, number, number][] = [
    [-12, hY - 18, 1.5],
    [8, hY - 22, 1],
    [15, hY - 12, 1.2],
    [-20, hY - 8, 0.8],
    [-4, hY + 6, 0.7],
    [18, hY + 4, 0.9],
    [-16, hY + 14, 1],
    [6, hY + 14, 0.8],
  ]
  for (const [sx, sy, sr] of starPositions) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + sr * 0.15})`
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }

  // Subtle planet horizon (bottom arc)
  ctx.globalAlpha = 0.2
  const planetG = ctx.createLinearGradient(0, hY, 0, hY + hR)
  planetG.addColorStop(0, 'transparent')
  planetG.addColorStop(0.7, 'rgba(74,205,196,0.3)')
  planetG.addColorStop(1, 'rgba(74,205,196,0.5)')
  ctx.fillStyle = planetG
  ctx.beginPath()
  ctx.arc(0, hY + hR * 1.8, hR * 1.6, Math.PI + 0.3, -0.3)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.restore()

  // ── Eyes (minimal, through visor) ──
  // Single-color solid dots, no whites, strong readability
  const eyeY = hY - 4
  const blink = Math.sin(time * 0.3) > 0.97 ? 0.1 : 1 // rare blink
  const eyePulse = Math.sin(time * 2.5) * 0.15 + 0.85

  for (const s of [-1, 1]) {
    const ex = s * 9
    // Eye glow halo
    ctx.globalAlpha = 0.4 * eyePulse
    const eyeG = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, 7)
    eyeG.addColorStop(0, C.shellRim)
    eyeG.addColorStop(1, 'transparent')
    ctx.fillStyle = eyeG
    ctx.beginPath()
    ctx.arc(ex, eyeY, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Eye core (blink animation)
    ctx.fillStyle = C.shellRim
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, 3, 3.5 * blink, 0, 0, Math.PI * 2)
    ctx.fill()

    // Inner bright point
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(ex - 0.5, eyeY - 1, 1.2 * blink, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Helmet reflections (geometric, not naturalistic) ──
  // Strong diagonal streak
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, hY, hR - 1, 0, Math.PI * 2)
  ctx.clip()
  const reflG = ctx.createLinearGradient(-hR, hY - hR, 0, hY + hR * 0.3)
  reflG.addColorStop(0, 'rgba(255,255,255,0.15)')
  reflG.addColorStop(0.5, 'rgba(255,255,255,0.05)')
  reflG.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = reflG
  ctx.beginPath()
  ctx.moveTo(-hR, hY - hR)
  ctx.lineTo(-hR + 20, hY - hR)
  ctx.lineTo(0, hY + hR)
  ctx.lineTo(-20, hY + hR)
  ctx.closePath()
  ctx.fill()

  // Secondary thin highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, hY, hR - 4, -2.3, -1.0)
  ctx.stroke()
  ctx.restore()

  // ── Antenna (thin, with pulsing indicator) ──
  const antPulse = Math.sin(time * 2) * 0.3 + 0.7
  ctx.strokeStyle = '#3a4048'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(-2, hY - hR - 2)
  ctx.lineTo(-2, hY - hR - 14)
  ctx.stroke()
  // Indicator ball
  ctx.globalAlpha = antPulse
  ctx.fillStyle = C.warm
  ctx.beginPath()
  ctx.arc(-2, hY - hR - 16, 2.5, 0, Math.PI * 2)
  ctx.fill()
  // Indicator glow
  ctx.globalAlpha = 0.4 * antPulse
  const antG = ctx.createRadialGradient(-2, hY - hR - 16, 0, -2, hY - hR - 16, 8)
  antG.addColorStop(0, C.warm)
  antG.addColorStop(1, 'transparent')
  ctx.fillStyle = antG
  ctx.beginPath()
  ctx.arc(-2, hY - hR - 16, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ── Floating particles around character (atmosphere) ──
  for (let i = 0; i < 4; i++) {
    const pa = time * 0.3 + i * Math.PI / 2
    const pr = 60 + Math.sin(time + i) * 8
    const px = Math.cos(pa) * pr
    const py = Math.sin(pa) * pr * 0.5 - 10
    ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.2
    ctx.fillStyle = C.accent
    ctx.beginPath()
    ctx.arc(px, py, 1.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.restore()
}
