// Shared space turtle drawing — used by TitleScreen and Cutscene
// Chibi-style astronaut turtle with polished indie-game quality

export function drawSpaceTurtle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  scale = 1,
  time = 0,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // All coords relative to (0, 0) = character center

  // ── Shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(0, 62, 24, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── Jetpack (behind body) ──
  for (const s of [-1, 1]) {
    const jx = s * 28
    // Tank body
    const tankG = ctx.createLinearGradient(jx - 6, -20, jx + 6, -20)
    tankG.addColorStop(0, '#8a9498')
    tankG.addColorStop(0.5, '#a8b0b5')
    tankG.addColorStop(1, '#6c7478')
    ctx.fillStyle = tankG
    ctx.beginPath()
    ctx.roundRect(jx - 6, -18, 12, 32, 5)
    ctx.fill()
    // Tank band
    ctx.fillStyle = '#c8940c'
    ctx.beginPath()
    ctx.roundRect(jx - 5, -6, 10, 3, 1)
    ctx.fill()
    // Nozzle
    ctx.fillStyle = '#4a5055'
    ctx.beginPath()
    ctx.roundRect(jx - 4, 12, 8, 8, [0, 0, 3, 3])
    ctx.fill()
    // Thruster flame (animated)
    const flameH = 8 + Math.sin(time * 12 + s) * 3
    const flameG = ctx.createLinearGradient(jx, 20, jx, 20 + flameH)
    flameG.addColorStop(0, 'rgba(78,205,196,0.7)')
    flameG.addColorStop(0.4, 'rgba(78,205,196,0.3)')
    flameG.addColorStop(1, 'rgba(78,205,196,0)')
    ctx.fillStyle = flameG
    ctx.beginPath()
    ctx.moveTo(jx - 4, 20)
    ctx.lineTo(jx + 4, 20)
    ctx.lineTo(jx + 1, 20 + flameH)
    ctx.lineTo(jx - 1, 20 + flameH)
    ctx.closePath()
    ctx.fill()
    // Inner flame core
    const coreG = ctx.createLinearGradient(jx, 20, jx, 20 + flameH * 0.6)
    coreG.addColorStop(0, 'rgba(255,255,255,0.5)')
    coreG.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = coreG
    ctx.beginPath()
    ctx.moveTo(jx - 2, 20)
    ctx.lineTo(jx + 2, 20)
    ctx.lineTo(jx, 20 + flameH * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  // ── Feet (round boots) ──
  for (const s of [-1, 1]) {
    const fx = s * 14
    // Boot
    const bootG = ctx.createRadialGradient(fx, 52, 0, fx, 52, 11)
    bootG.addColorStop(0, '#d0d5da')
    bootG.addColorStop(1, '#7a8288')
    ctx.fillStyle = bootG
    ctx.beginPath()
    ctx.ellipse(fx, 52, 11, 9, 0, 0, Math.PI * 2)
    ctx.fill()
    // Boot highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.ellipse(fx - 2, 49, 5, 3, -0.2, 0, Math.PI * 2)
    ctx.fill()
    // Sole line
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(fx, 55, 9, 3, 0, 0, Math.PI)
    ctx.stroke()
  }

  // ── Arms (short, round) ──
  for (const s of [-1, 1]) {
    const ax = s * 32, ay = 8
    // Arm sleeve
    ctx.fillStyle = '#c0c6cc'
    ctx.beginPath()
    ctx.ellipse(ax, ay, 9, 13, s * 0.4, 0, Math.PI * 2)
    ctx.fill()
    // Glove
    const glG = ctx.createRadialGradient(ax + s * 4, ay + 10, 0, ax + s * 4, ay + 10, 9)
    glG.addColorStop(0, '#3ddb85')
    glG.addColorStop(1, '#1a8c48')
    ctx.fillStyle = glG
    ctx.beginPath()
    ctx.arc(ax + s * 4, ay + 10, 9, 0, Math.PI * 2)
    ctx.fill()
    // Glove highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.arc(ax + s * 2, ay + 7, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Body (spacesuit torso) ──
  // Main suit shape
  const suitG = ctx.createLinearGradient(0, -22, 0, 40)
  suitG.addColorStop(0, '#eef0f3')
  suitG.addColorStop(0.3, '#dce0e5')
  suitG.addColorStop(0.8, '#b8c0c8')
  suitG.addColorStop(1, '#a0a8b0')
  ctx.fillStyle = suitG
  ctx.beginPath()
  ctx.roundRect(-24, -20, 48, 58, 16)
  ctx.fill()

  // Suit left edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.roundRect(-23, -18, 8, 50, [14, 0, 0, 14])
  ctx.fill()

  // Chest display panel
  const panelG = ctx.createLinearGradient(-14, -4, -14, 26)
  panelG.addColorStop(0, 'rgba(46,204,113,0.12)')
  panelG.addColorStop(1, 'rgba(46,204,113,0.04)')
  ctx.fillStyle = panelG
  ctx.beginPath()
  ctx.roundRect(-14, -4, 28, 24, 6)
  ctx.fill()
  ctx.strokeStyle = 'rgba(46,204,113,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(-14, -4, 28, 24, 6)
  ctx.stroke()

  // Control buttons
  const bColors = ['#2ecc71', '#f5a623', '#e74c3c']
  for (let i = 0; i < 3; i++) {
    const bx = -6 + i * 6
    // Button shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath(); ctx.arc(bx, 4, 2.8, 0, Math.PI * 2); ctx.fill()
    // Button
    ctx.fillStyle = bColors[i]
    ctx.beginPath(); ctx.arc(bx, 3.5, 2.5, 0, Math.PI * 2); ctx.fill()
    // Button highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath(); ctx.arc(bx - 0.5, 2.5, 1.2, 0, Math.PI * 2); ctx.fill()
  }

  // Mini display (below buttons)
  ctx.fillStyle = 'rgba(0,40,20,0.3)'
  ctx.beginPath()
  ctx.roundRect(-8, 9, 16, 8, 2)
  ctx.fill()
  // Display line (animated)
  ctx.strokeStyle = '#2ecc71'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let dx = -6; dx <= 6; dx += 1) {
    const dy = Math.sin(dx * 0.8 + time * 4) * 2
    dx === -6 ? ctx.moveTo(dx, 13 + dy) : ctx.lineTo(dx, 13 + dy)
  }
  ctx.stroke()

  // Collar ring
  const colG = ctx.createLinearGradient(-20, -22, 20, -22)
  colG.addColorStop(0, '#a8b0b8')
  colG.addColorStop(0.3, '#d8dce0')
  colG.addColorStop(0.7, '#d8dce0')
  colG.addColorStop(1, '#a8b0b8')
  ctx.fillStyle = colG
  ctx.beginPath()
  ctx.ellipse(0, -20, 20, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  // Collar highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(0, -21, 18, 5, 0, Math.PI + 0.3, -0.3)
  ctx.stroke()

  // ── Helmet (big, chibi proportions) ──
  const hY = -48
  const hR = 34

  // Helmet outer shell (metallic)
  const helmG = ctx.createLinearGradient(-hR - 4, hY, hR + 4, hY)
  helmG.addColorStop(0, '#b0b8c0')
  helmG.addColorStop(0.3, '#e0e4e8')
  helmG.addColorStop(0.5, '#f0f2f4')
  helmG.addColorStop(0.7, '#e0e4e8')
  helmG.addColorStop(1, '#98a0a8')
  ctx.fillStyle = helmG
  ctx.beginPath()
  ctx.arc(0, hY, hR + 4, 0, Math.PI * 2)
  ctx.fill()

  // Helmet rim ring
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, hY, hR + 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, hY, hR + 3, -2.5, -0.5)
  ctx.stroke()

  // Visor glass (dark space)
  const visorG = ctx.createRadialGradient(-6, hY - 6, 0, 0, hY, hR)
  visorG.addColorStop(0, '#1a3848')
  visorG.addColorStop(0.5, '#0e2030')
  visorG.addColorStop(1, '#060c14')
  ctx.fillStyle = visorG
  ctx.beginPath()
  ctx.arc(0, hY, hR, 0, Math.PI * 2)
  ctx.fill()

  // ── Face (inside helmet) ──
  const fR = 26
  const fG = ctx.createRadialGradient(-4, hY - 3, 0, 0, hY + 2, fR)
  fG.addColorStop(0, '#5af0a8')
  fG.addColorStop(0.4, '#2ecc71')
  fG.addColorStop(0.8, '#1faa58')
  fG.addColorStop(1, '#168040')
  ctx.fillStyle = fG
  ctx.beginPath()
  ctx.arc(0, hY + 2, fR, 0, Math.PI * 2)
  ctx.fill()

  // Face shading (bottom darker)
  const fShadow = ctx.createLinearGradient(0, hY - fR, 0, hY + fR)
  fShadow.addColorStop(0, 'rgba(255,255,255,0.08)')
  fShadow.addColorStop(0.6, 'rgba(0,0,0,0)')
  fShadow.addColorStop(1, 'rgba(0,0,0,0.1)')
  ctx.fillStyle = fShadow
  ctx.beginPath()
  ctx.arc(0, hY + 2, fR, 0, Math.PI * 2)
  ctx.fill()

  // Cheeks
  ctx.fillStyle = 'rgba(255,180,160,0.18)'
  ctx.beginPath(); ctx.ellipse(-18, hY + 8, 6, 4, -0.15, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(18, hY + 8, 6, 4, 0.15, 0, Math.PI * 2); ctx.fill()

  // ── Eyes (big, expressive, anime-style) ──
  const eyeOff = Math.sin(time * 0.8) * 1.2
  for (const s of [-1, 1]) {
    const ex = s * 10, ey = hY - 2

    // Eye white (slightly oval, taller)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(ex, ey, 9, 10.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Eye outline
    ctx.strokeStyle = 'rgba(10,40,20,0.15)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(ex, ey, 9, 10.5, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Iris (multi-layer gradient)
    const px = ex + eyeOff
    const iG = ctx.createRadialGradient(px, ey - 1, 0, px, ey, 6.5)
    iG.addColorStop(0, '#4aeaa0')
    iG.addColorStop(0.3, '#2ecc71')
    iG.addColorStop(0.6, '#1a8c4a')
    iG.addColorStop(1, '#0d5028')
    ctx.fillStyle = iG
    ctx.beginPath()
    ctx.arc(px, ey, 6, 0, Math.PI * 2)
    ctx.fill()

    // Iris ring detail
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(px, ey, 4, 0, Math.PI * 2)
    ctx.stroke()

    // Pupil
    ctx.fillStyle = '#060e08'
    ctx.beginPath()
    ctx.arc(px + 0.3, ey + 0.5, 3.2, 0, Math.PI * 2)
    ctx.fill()

    // Big primary highlight (top-left)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(ex - 3, ey - 4, 3.2, 3.8, -0.2, 0, Math.PI * 2)
    ctx.fill()

    // Secondary highlight (bottom-right, smaller)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(ex + 3, ey + 3, 1.8, 0, Math.PI * 2)
    ctx.fill()

    // Tiny sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.arc(ex - 1, ey + 1, 0.8, 0, Math.PI * 2)
    ctx.fill()

    // Upper eyelid shadow
    ctx.fillStyle = 'rgba(10,60,30,0.08)'
    ctx.beginPath()
    ctx.ellipse(ex, ey - 6, 9, 5, 0, 0, Math.PI)
    ctx.fill()
  }

  // Nostrils
  ctx.fillStyle = '#0d5028'
  ctx.beginPath(); ctx.arc(-2.5, hY + 8, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(2.5, hY + 7.5, 1.5, 0, Math.PI * 2); ctx.fill()

  // Mouth (happy curve with thickness)
  ctx.strokeStyle = '#0d5028'
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(0, hY + 14, 8, 0.2, Math.PI - 0.2)
  ctx.stroke()
  ctx.lineCap = 'butt'

  // Tooth (tiny, cute)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.roundRect(-2, hY + 15, 4, 3, [0, 0, 1.5, 1.5])
  ctx.fill()

  // ── Helmet glass reflections (on top of face) ──
  // Main curved reflection arc
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(-10, hY - 8, hR * 0.65, -1.0, 0.3)
  ctx.stroke()

  // Secondary thin reflection
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(14, hY + 4, hR * 0.5, -0.5, 0.5)
  ctx.stroke()

  // Star reflections on visor
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.beginPath(); ctx.arc(18, hY - 16, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath(); ctx.arc(14, hY - 22, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(22, hY - 10, 1, 0, Math.PI * 2); ctx.fill()

  // Cross sparkle on main star
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(18, hY - 20); ctx.lineTo(18, hY - 12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14, hY - 16); ctx.lineTo(22, hY - 16); ctx.stroke()

  // ── Antenna (top of helmet) ──
  ctx.strokeStyle = '#a8b0b8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, hY - hR - 2)
  ctx.lineTo(0, hY - hR - 14)
  ctx.stroke()
  // Antenna ball (pulsing)
  const antPulse = Math.sin(time * 3) * 0.15 + 0.85
  ctx.fillStyle = `rgba(78,205,196,${antPulse})`
  ctx.beginPath()
  ctx.arc(0, hY - hR - 16, 4, 0, Math.PI * 2)
  ctx.fill()
  // Antenna glow
  ctx.globalAlpha = 0.2 * antPulse
  const antG = ctx.createRadialGradient(0, hY - hR - 16, 0, 0, hY - hR - 16, 10)
  antG.addColorStop(0, '#4ecdc4')
  antG.addColorStop(1, 'transparent')
  ctx.fillStyle = antG
  ctx.beginPath()
  ctx.arc(0, hY - hR - 16, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Antenna highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(-1, hY - hR - 17.5, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
