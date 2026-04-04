import { useState, useEffect, useRef } from 'react'
import type { CutsceneScreen } from '../data/story'
import { TYPEWRITER_MS } from '../game/constants'

interface Props {
  screens: CutsceneScreen[]
  bgColor: string
  accentColor: string
  onComplete: () => void
}

function CharacterSprite({ character, accentColor }: { character: string; accentColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = 160
    canvas.width = s * devicePixelRatio
    canvas.height = s * devicePixelRatio
    canvas.style.width = `${s}px`
    canvas.style.height = `${s}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)

    let time = 0

    function draw() {
      time += 0.016
      ctx.clearRect(0, 0, s, s)
      const cx = s / 2
      const cy = s / 2 + 8
      const float = Math.sin(time * 1.5) * 3

      // Character glow
      const glowColor = accentColor || '#4ecdc4'
      ctx.globalAlpha = 0.12
      const glow = ctx.createRadialGradient(cx, cy + float, 0, cx, cy + float, 70)
      glow.addColorStop(0, glowColor)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy + float, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.save()
      ctx.translate(0, float)

      if (character === 'turtle') {
        drawTurtle(ctx, cx, cy)
      } else if (character === 'rabbit') {
        drawRabbit(ctx, cx, cy, time)
      } else if (character === 'dragon-king') {
        drawDragonKing(ctx, cx, cy, time)
      } else if (character === 'guard') {
        drawGuard(ctx, cx, cy)
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [character, accentColor])

  if (character === 'none') return null
  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto 16px' }} />
}

function drawTurtle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const shellR = 34

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + shellR + 10, shellR * 0.7, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Legs
  ctx.fillStyle = '#27ae60'
  for (const [lx, ly] of [[-22, 18], [22, 18], [-18, -18], [18, -18]] as [number, number][]) {
    ctx.beginPath()
    ctx.roundRect(cx + lx - 6, cy + ly - 4, 12, 8, 3)
    ctx.fill()
  }

  // Tail
  ctx.beginPath()
  ctx.arc(cx, cy + shellR + 2, 5, 0, Math.PI * 2)
  ctx.fill()

  // Shell gradient
  const shellGrad = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, shellR)
  shellGrad.addColorStop(0, '#3ddb85')
  shellGrad.addColorStop(0.7, '#2ecc71')
  shellGrad.addColorStop(1, '#1a9c54')
  ctx.fillStyle = shellGrad
  ctx.beginPath()
  ctx.arc(cx, cy, shellR, 0, Math.PI * 2)
  ctx.fill()

  // Shell pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, shellR * 0.45, 0, Math.PI * 2)
  ctx.stroke()
  for (let a = 0; a < 6; a++) {
    const angle = (a * Math.PI) / 3
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * shellR * 0.45, cy + Math.sin(angle) * shellR * 0.45)
    ctx.lineTo(cx + Math.cos(angle) * shellR * 0.92, cy + Math.sin(angle) * shellR * 0.92)
    ctx.stroke()
  }

  // Rim
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, shellR, 0, Math.PI * 2)
  ctx.stroke()

  // Head
  const headY = cy - shellR - 10
  const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, 14)
  headGrad.addColorStop(0, '#3ddb85')
  headGrad.addColorStop(1, '#27ae60')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.arc(cx, headY, 14, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(cx - 6, headY - 2, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 6, headY - 2, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1a1a2e'
  ctx.beginPath(); ctx.arc(cx - 5, headY - 2, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 7, headY - 2, 2, 0, Math.PI * 2); ctx.fill()
  // Highlights
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath(); ctx.arc(cx - 6.5, headY - 3.5, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 5.5, headY - 3.5, 1.2, 0, Math.PI * 2); ctx.fill()

  // Smile
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx, headY + 3, 4, 0.2, Math.PI - 0.2)
  ctx.stroke()
}

function drawRabbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 32, 20, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  const bodyGrad = ctx.createRadialGradient(cx - 3, cy + 3, 0, cx, cy + 8, 26)
  bodyGrad.addColorStop(0, '#ffffff')
  bodyGrad.addColorStop(1, '#e0e0e8')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(cx, cy + 8, 26, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = 'rgba(255,220,220,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 14, 14, 16, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears with animation
  const earTwitch = Math.sin(time * 2.5) * 2
  for (const side of [-1, 1]) {
    const ex = cx + side * 10
    const ey = cy - 16
    const tipX = ex + side * 4
    const tipY = ey - 38 + (side === 1 ? earTwitch : 0)

    // Outer ear
    ctx.fillStyle = '#f0f0f5'
    ctx.beginPath()
    ctx.moveTo(ex - side * 4, ey)
    ctx.quadraticCurveTo(tipX - side * 6, tipY + 10, tipX, tipY)
    ctx.quadraticCurveTo(tipX + side * 6, tipY + 10, ex + side * 8, ey)
    ctx.closePath()
    ctx.fill()

    // Inner ear
    ctx.fillStyle = '#ffb6c1'
    ctx.beginPath()
    ctx.moveTo(ex - side * 1, ey - 2)
    ctx.quadraticCurveTo(tipX - side * 3, tipY + 14, tipX, tipY + 6)
    ctx.quadraticCurveTo(tipX + side * 3, tipY + 14, ex + side * 5, ey - 2)
    ctx.closePath()
    ctx.fill()
  }

  // Head
  const headGrad = ctx.createRadialGradient(cx - 2, cy - 10, 0, cx, cy - 6, 20)
  headGrad.addColorStop(0, '#ffffff')
  headGrad.addColorStop(1, '#eaeaf0')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 6, 20, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (red, characteristic of 토끼전's rabbit)
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(cx - 8, cy - 8, 5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 8, cy - 8, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#c0392b'
  ctx.beginPath(); ctx.arc(cx - 7, cy - 8, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 9, cy - 8, 3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath(); ctx.arc(cx - 7, cy - 8, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 9, cy - 8, 2, 0, Math.PI * 2); ctx.fill()
  // Eye highlights
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.beginPath(); ctx.arc(cx - 8.5, cy - 9.5, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 7.5, cy - 9.5, 1.5, 0, Math.PI * 2); ctx.fill()

  // Nose
  ctx.fillStyle = '#ffb6c1'
  ctx.beginPath()
  ctx.moveTo(cx, cy - 2)
  ctx.lineTo(cx - 3, cy + 1)
  ctx.lineTo(cx + 3, cy + 1)
  ctx.closePath()
  ctx.fill()

  // Whiskers
  ctx.strokeStyle = 'rgba(200,200,210,0.5)'
  ctx.lineWidth = 0.8
  for (const side of [-1, 1]) {
    for (const angle of [-0.2, 0, 0.2]) {
      ctx.beginPath()
      ctx.moveTo(cx + side * 8, cy)
      ctx.lineTo(cx + side * 25, cy + angle * 20 - 2)
      ctx.stroke()
    }
  }

  // Tail (small puff behind)
  ctx.fillStyle = '#f8f8ff'
  ctx.beginPath()
  ctx.arc(cx - 12, cy + 24, 7, 0, Math.PI * 2)
  ctx.fill()
}

function drawDragonKing(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 38, 28, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body / robe
  const robeGrad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 35)
  robeGrad.addColorStop(0, '#2980b9')
  robeGrad.addColorStop(1, '#1a5276')
  ctx.fillStyle = robeGrad
  ctx.beginPath()
  ctx.moveTo(cx - 28, cy + 35)
  ctx.quadraticCurveTo(cx - 30, cy, cx - 20, cy - 10)
  ctx.lineTo(cx + 20, cy - 10)
  ctx.quadraticCurveTo(cx + 30, cy, cx + 28, cy + 35)
  ctx.closePath()
  ctx.fill()

  // Robe pattern (wave)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    const wy = cy + 5 + i * 12
    for (let wx = cx - 25; wx <= cx + 25; wx += 2) {
      const wvy = wy + Math.sin((wx - cx) * 0.15 + time * 2) * 3
      if (wx === cx - 25) ctx.moveTo(wx, wvy)
      else ctx.lineTo(wx, wvy)
    }
    ctx.stroke()
  }

  // Head
  const headGrad = ctx.createRadialGradient(cx - 2, cy - 20, 0, cx, cy - 16, 22)
  headGrad.addColorStop(0, '#5dade2')
  headGrad.addColorStop(1, '#2e86c1')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 16, 22, 0, Math.PI * 2)
  ctx.fill()

  // Scales on cheeks
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (const sx of [-14, -10, 10, 14]) {
    ctx.beginPath()
    ctx.arc(cx + sx, cy - 8, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Crown
  const crownGrad = ctx.createLinearGradient(cx - 22, cy - 45, cx + 22, cy - 25)
  crownGrad.addColorStop(0, '#f39c12')
  crownGrad.addColorStop(0.5, '#f1c40f')
  crownGrad.addColorStop(1, '#f39c12')
  ctx.fillStyle = crownGrad
  ctx.beginPath()
  ctx.moveTo(cx - 22, cy - 28)
  ctx.lineTo(cx - 16, cy - 46)
  ctx.lineTo(cx - 8, cy - 34)
  ctx.lineTo(cx, cy - 52)
  ctx.lineTo(cx + 8, cy - 34)
  ctx.lineTo(cx + 16, cy - 46)
  ctx.lineTo(cx + 22, cy - 28)
  ctx.closePath()
  ctx.fill()
  // Crown jewels
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath(); ctx.arc(cx, cy - 40, 3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2ecc71'
  ctx.beginPath(); ctx.arc(cx - 12, cy - 36, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 12, cy - 36, 2, 0, Math.PI * 2); ctx.fill()
  // Crown rim
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - 22, cy - 28)
  ctx.lineTo(cx + 22, cy - 28)
  ctx.stroke()

  // Eyes (stern)
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(cx - 8, cy - 18, 5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 8, cy - 18, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1a1a2e'
  ctx.beginPath(); ctx.arc(cx - 7, cy - 17, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 9, cy - 17, 3, 0, Math.PI * 2); ctx.fill()
  // Highlights
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath(); ctx.arc(cx - 8.5, cy - 19, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 7.5, cy - 19, 1.5, 0, Math.PI * 2); ctx.fill()

  // Eyebrows (stern expression)
  ctx.strokeStyle = '#1a5276'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(cx - 14, cy - 25)
  ctx.lineTo(cx - 4, cy - 23)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 14, cy - 25)
  ctx.lineTo(cx + 4, cy - 23)
  ctx.stroke()

  // Beard (long, flowing)
  ctx.fillStyle = 'rgba(200,220,240,0.4)'
  ctx.beginPath()
  ctx.moveTo(cx - 10, cy - 6)
  ctx.quadraticCurveTo(cx - 14, cy + 12, cx - 8, cy + 22)
  ctx.lineTo(cx + 8, cy + 22)
  ctx.quadraticCurveTo(cx + 14, cy + 12, cx + 10, cy - 6)
  ctx.closePath()
  ctx.fill()

  // Mouth
  ctx.strokeStyle = '#1a5276'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 5, cy - 8)
  ctx.lineTo(cx + 5, cy - 8)
  ctx.stroke()
}

function drawGuard(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 35, 22, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body armor
  const armorGrad = ctx.createLinearGradient(cx, cy - 5, cx, cy + 30)
  armorGrad.addColorStop(0, '#7f8c8d')
  armorGrad.addColorStop(0.5, '#95a5a6')
  armorGrad.addColorStop(1, '#6c7a7d')
  ctx.fillStyle = armorGrad
  ctx.beginPath()
  ctx.roundRect(cx - 20, cy - 5, 40, 35, 4)
  ctx.fill()

  // Armor plate lines
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(cx - 18, cy + 6 + i * 9)
    ctx.lineTo(cx + 18, cy + 6 + i * 9)
    ctx.stroke()
  }

  // Shoulder pads
  ctx.fillStyle = '#6c7a7d'
  ctx.beginPath()
  ctx.roundRect(cx - 28, cy - 8, 14, 12, 3)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(cx + 14, cy - 8, 14, 12, 3)
  ctx.fill()

  // Helmet
  const helmGrad = ctx.createRadialGradient(cx - 2, cy - 18, 0, cx, cy - 14, 20)
  helmGrad.addColorStop(0, '#a0adb0')
  helmGrad.addColorStop(1, '#6c7a7d')
  ctx.fillStyle = helmGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 14, 20, Math.PI, 0)
  ctx.lineTo(cx + 22, cy - 8)
  ctx.lineTo(cx - 22, cy - 8)
  ctx.closePath()
  ctx.fill()

  // Helmet crest
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.moveTo(cx - 3, cy - 34)
  ctx.lineTo(cx + 3, cy - 34)
  ctx.lineTo(cx + 2, cy - 18)
  ctx.lineTo(cx - 2, cy - 18)
  ctx.closePath()
  ctx.fill()

  // Visor
  const visorGrad = ctx.createLinearGradient(cx - 12, cy - 14, cx + 12, cy - 8)
  visorGrad.addColorStop(0, '#2c3e50')
  visorGrad.addColorStop(0.5, '#34495e')
  visorGrad.addColorStop(1, '#2c3e50')
  ctx.fillStyle = visorGrad
  ctx.beginPath()
  ctx.roundRect(cx - 14, cy - 14, 28, 10, 2)
  ctx.fill()

  // Visor eye slit (glowing red)
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.roundRect(cx - 10, cy - 11, 20, 4, 1)
  ctx.fill()
  // Eye slit glow
  ctx.globalAlpha = 0.3
  const eyeGlow = ctx.createRadialGradient(cx, cy - 9, 0, cx, cy - 9, 15)
  eyeGlow.addColorStop(0, '#e74c3c')
  eyeGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeGlow
  ctx.beginPath()
  ctx.arc(cx, cy - 9, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Spear
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx + 28, cy - 30)
  ctx.lineTo(cx + 28, cy + 32)
  ctx.stroke()
  // Spear tip
  ctx.fillStyle = '#bdc3c7'
  ctx.beginPath()
  ctx.moveTo(cx + 28, cy - 38)
  ctx.lineTo(cx + 24, cy - 28)
  ctx.lineTo(cx + 32, cy - 28)
  ctx.closePath()
  ctx.fill()
}

export function Cutscene({ screens, bgColor, accentColor, onComplete }: Props) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [textComplete, setTextComplete] = useState(false)
  const current = screens[screenIdx]

  useEffect(() => {
    setDisplayedText('')
    setTextComplete(false)
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx >= current.text.length) {
        setDisplayedText(current.text)
        setTextComplete(true)
        clearInterval(interval)
      } else {
        setDisplayedText(current.text.slice(0, idx))
      }
    }, TYPEWRITER_MS)
    return () => clearInterval(interval)
  }, [screenIdx, current.text])

  function handleTap() {
    if (!textComplete) {
      setDisplayedText(current.text)
      setTextComplete(true)
      return
    }
    if (screenIdx < screens.length - 1) {
      setScreenIdx(screenIdx + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%', height: '100vh', background: bgColor,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 24, boxSizing: 'border-box',
        cursor: 'pointer', userSelect: 'none',
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <CharacterSprite character={current.character} accentColor={accentColor} />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        maxWidth: 340,
      }}>
        <p style={{
          color: '#fff', fontSize: 18, fontFamily: 'sans-serif',
          lineHeight: 1.6, textAlign: 'center', whiteSpace: 'pre-line',
          margin: 0,
        }}>
          {displayedText}
        </p>
      </div>

      <div style={{
        position: 'absolute', bottom: 30, width: '100%',
        textAlign: 'center',
      }}>
        <span style={{ color: '#666', fontSize: 13, fontFamily: 'sans-serif' }}>
          {textComplete ? '탭하여 계속' : ''}
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onComplete() }}
        style={{
          position: 'absolute', top: 16, right: 16,
          padding: '6px 14px', fontSize: 12,
          background: 'rgba(255,255,255,0.1)', color: '#888',
          border: '1px solid #444', borderRadius: 4,
          cursor: 'pointer', fontFamily: 'sans-serif',
          minWidth: 44, minHeight: 44,
        }}
      >
        스킵 ▶
      </button>
    </div>
  )
}
