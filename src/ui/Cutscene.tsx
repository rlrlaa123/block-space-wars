import { useState, useEffect, useRef } from 'react'
import type { CutsceneScreen } from '../data/story'
import { TYPEWRITER_MS } from '../game/constants'
import { drawSpaceTurtle } from './spaceTurtle'

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
    const s = 200
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
        drawSpaceTurtle(ctx, cx, cy, 1, time)
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

function drawRabbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 40, 26, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  // Tail puff
  const tailGrad = ctx.createRadialGradient(cx - 16, cy + 28, 0, cx - 16, cy + 28, 10)
  tailGrad.addColorStop(0, '#fff')
  tailGrad.addColorStop(1, '#ddd')
  ctx.fillStyle = tailGrad
  ctx.beginPath(); ctx.arc(cx - 16, cy + 28, 10, 0, Math.PI * 2); ctx.fill()

  // Body
  const bodyGrad = ctx.createRadialGradient(cx - 4, cy + 2, 0, cx, cy + 10, 34)
  bodyGrad.addColorStop(0, '#ffffff')
  bodyGrad.addColorStop(0.7, '#f0f0f5')
  bodyGrad.addColorStop(1, '#d8d8e0')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy + 10, 28, 32, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = 'rgba(255,225,225,0.3)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 18, 16, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Paws
  for (const sx of [-18, 18]) {
    ctx.fillStyle = '#f0e8f0'
    ctx.beginPath()
    ctx.ellipse(cx + sx, cy + 36, 8, 5, sx > 0 ? 0.2 : -0.2, 0, Math.PI * 2)
    ctx.fill()
    // Paw pads
    ctx.fillStyle = '#ffb6c1'
    ctx.beginPath(); ctx.arc(cx + sx, cy + 37, 2, 0, Math.PI * 2); ctx.fill()
  }

  // Ears with animation
  const earTwitch = Math.sin(time * 2.5) * 3
  for (const side of [-1, 1]) {
    const ex = cx + side * 12
    const ey = cy - 22
    const tipX = ex + side * 5
    const tipY = ey - 48 + (side === 1 ? earTwitch : 0)

    // Ear outline (slightly darker)
    ctx.fillStyle = '#e0dce5'
    ctx.beginPath()
    ctx.moveTo(ex - side * 6, ey)
    ctx.quadraticCurveTo(tipX - side * 8, tipY + 12, tipX, tipY)
    ctx.quadraticCurveTo(tipX + side * 8, tipY + 12, ex + side * 10, ey)
    ctx.closePath()
    ctx.fill()

    // Outer ear
    ctx.fillStyle = '#f5f3f8'
    ctx.beginPath()
    ctx.moveTo(ex - side * 5, ey)
    ctx.quadraticCurveTo(tipX - side * 7, tipY + 13, tipX, tipY + 2)
    ctx.quadraticCurveTo(tipX + side * 7, tipY + 13, ex + side * 9, ey)
    ctx.closePath()
    ctx.fill()

    // Inner ear (pink gradient)
    const earGrad = ctx.createLinearGradient(tipX, tipY + 10, tipX, ey)
    earGrad.addColorStop(0, '#ff9eb5')
    earGrad.addColorStop(1, '#ffcdd8')
    ctx.fillStyle = earGrad
    ctx.beginPath()
    ctx.moveTo(ex - side * 1, ey - 4)
    ctx.quadraticCurveTo(tipX - side * 4, tipY + 18, tipX, tipY + 10)
    ctx.quadraticCurveTo(tipX + side * 4, tipY + 18, ex + side * 6, ey - 4)
    ctx.closePath()
    ctx.fill()
  }

  // Head
  const headR = 26
  const headGrad = ctx.createRadialGradient(cx - 4, cy - 14, 0, cx, cy - 8, headR)
  headGrad.addColorStop(0, '#ffffff')
  headGrad.addColorStop(0.8, '#f0eef5')
  headGrad.addColorStop(1, '#d8d5e0')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 8, headR, 0, Math.PI * 2)
  ctx.fill()

  // Cheek tufts
  ctx.fillStyle = '#f0eef5'
  ctx.beginPath(); ctx.ellipse(cx - 22, cy - 4, 8, 6, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + 22, cy - 4, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill()

  // Eyes (red ruby eyes, 토끼전 characteristic)
  for (const sx of [-9, 9]) {
    // Eye white
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(cx + sx, cy - 10, 7, 0, Math.PI * 2); ctx.fill()
    // Iris gradient
    const irisGrad = ctx.createRadialGradient(cx + sx + (sx > 0 ? 1.5 : -1.5), cy - 10, 0, cx + sx, cy - 10, 5)
    irisGrad.addColorStop(0, '#e74c3c')
    irisGrad.addColorStop(0.6, '#c0392b')
    irisGrad.addColorStop(1, '#7b1a10')
    ctx.fillStyle = irisGrad
    ctx.beginPath(); ctx.arc(cx + sx + (sx > 0 ? 1 : -1), cy - 10, 4.5, 0, Math.PI * 2); ctx.fill()
    // Pupil
    ctx.fillStyle = '#2c0808'
    ctx.beginPath(); ctx.arc(cx + sx + (sx > 0 ? 1.5 : -1.5), cy - 10, 2.5, 0, Math.PI * 2); ctx.fill()
    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath(); ctx.arc(cx + sx - 2, cy - 12, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath(); ctx.arc(cx + sx + 2, cy - 8, 1.2, 0, Math.PI * 2); ctx.fill()
  }

  // Nose
  const noseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 4)
  noseGrad.addColorStop(0, '#ff8fa3')
  noseGrad.addColorStop(1, '#e06080')
  ctx.fillStyle = noseGrad
  ctx.beginPath()
  ctx.moveTo(cx, cy - 3)
  ctx.quadraticCurveTo(cx - 5, cy + 2, cx, cy + 1)
  ctx.quadraticCurveTo(cx + 5, cy + 2, cx, cy - 3)
  ctx.fill()

  // Mouth line
  ctx.strokeStyle = '#c0a0a8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy + 1)
  ctx.lineTo(cx - 4, cy + 5)
  ctx.moveTo(cx, cy + 1)
  ctx.lineTo(cx + 4, cy + 5)
  ctx.stroke()

  // Whiskers
  ctx.strokeStyle = 'rgba(180,170,180,0.6)'
  ctx.lineWidth = 0.8
  for (const side of [-1, 1]) {
    for (const a of [-0.15, 0, 0.15]) {
      ctx.beginPath()
      ctx.moveTo(cx + side * 12, cy - 1)
      ctx.lineTo(cx + side * 32, cy + a * 25 - 3)
      ctx.stroke()
    }
  }
}

function drawDragonKing(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 46, 34, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // Robe (wider, more majestic)
  const robeGrad = ctx.createLinearGradient(cx, cy - 12, cx, cy + 44)
  robeGrad.addColorStop(0, '#3498db')
  robeGrad.addColorStop(0.5, '#2176ad')
  robeGrad.addColorStop(1, '#0d3b66')
  ctx.fillStyle = robeGrad
  ctx.beginPath()
  ctx.moveTo(cx - 36, cy + 44)
  ctx.quadraticCurveTo(cx - 38, cy + 5, cx - 24, cy - 12)
  ctx.lineTo(cx + 24, cy - 12)
  ctx.quadraticCurveTo(cx + 38, cy + 5, cx + 36, cy + 44)
  ctx.closePath()
  ctx.fill()

  // Robe trim (gold sash)
  ctx.strokeStyle = '#f1c40f'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 4, cy - 8)
  ctx.lineTo(cx - 6, cy + 40)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 4, cy - 8)
  ctx.lineTo(cx + 6, cy + 40)
  ctx.stroke()

  // Robe wave pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    const wy = cy + 5 + i * 10
    for (let wx = cx - 32; wx <= cx + 32; wx += 2) {
      const wvy = wy + Math.sin((wx - cx) * 0.12 + time * 1.5 + i) * 3
      wx === cx - 32 ? ctx.moveTo(wx, wvy) : ctx.lineTo(wx, wvy)
    }
    ctx.stroke()
  }

  // Shoulders / collar
  ctx.fillStyle = '#0d3b66'
  ctx.beginPath()
  ctx.moveTo(cx - 28, cy - 8)
  ctx.quadraticCurveTo(cx, cy - 18, cx + 28, cy - 8)
  ctx.quadraticCurveTo(cx, cy - 4, cx - 28, cy - 8)
  ctx.fill()
  ctx.strokeStyle = '#f1c40f'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Head
  const headR = 28
  const headY = cy - 22
  const headGrad = ctx.createRadialGradient(cx - 4, headY - 6, 0, cx, headY, headR)
  headGrad.addColorStop(0, '#6dc8f2')
  headGrad.addColorStop(0.5, '#3498db')
  headGrad.addColorStop(1, '#1a6ba0')
  ctx.fillStyle = headGrad
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()

  // Scale texture on face
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  for (let sy = -18; sy < 18; sy += 8) {
    for (let sx = -18; sx < 18; sx += 8) {
      if (sx * sx + sy * sy < headR * headR * 0.7) {
        ctx.beginPath(); ctx.arc(cx + sx, headY + sy, 3, 0, Math.PI * 2); ctx.fill()
      }
    }
  }

  // Crown (larger, more ornate)
  const crownY = headY - headR + 2
  // Crown base
  ctx.fillStyle = '#c8940c'
  ctx.beginPath()
  ctx.roundRect(cx - 26, crownY, 52, 10, 2)
  ctx.fill()
  // Crown points
  const crownGrad = ctx.createLinearGradient(cx - 26, crownY - 30, cx + 26, crownY)
  crownGrad.addColorStop(0, '#f5c518')
  crownGrad.addColorStop(0.5, '#fce566')
  crownGrad.addColorStop(1, '#c8940c')
  ctx.fillStyle = crownGrad
  ctx.beginPath()
  ctx.moveTo(cx - 26, crownY + 2)
  ctx.lineTo(cx - 20, crownY - 22)
  ctx.lineTo(cx - 12, crownY - 8)
  ctx.lineTo(cx - 4, crownY - 28)
  ctx.lineTo(cx + 4, crownY - 8)
  ctx.lineTo(cx + 12, crownY - 22)
  ctx.lineTo(cx + 20, crownY - 8)
  ctx.lineTo(cx + 26, crownY + 2)
  ctx.closePath()
  ctx.fill()
  // Crown jewels
  const jewels: [number, number, string][] = [
    [cx - 4, crownY - 18, '#e74c3c'],
    [cx - 18, crownY - 14, '#2ecc71'],
    [cx + 14, crownY - 14, '#3498db'],
  ]
  for (const [jx, jy, jc] of jewels) {
    const jg = ctx.createRadialGradient(jx - 1, jy - 1, 0, jx, jy, 4)
    jg.addColorStop(0, '#fff')
    jg.addColorStop(0.3, jc)
    jg.addColorStop(1, jc)
    ctx.fillStyle = jg
    ctx.beginPath(); ctx.arc(jx, jy, 3.5, 0, Math.PI * 2); ctx.fill()
  }

  // Eyes (stern, piercing)
  for (const sx of [-10, 10]) {
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(cx + sx, headY - 4, 6, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#0d2240'
    ctx.beginPath(); ctx.arc(cx + sx + (sx > 0 ? 1 : -1), headY - 3, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.beginPath(); ctx.arc(cx + sx - 1.5, headY - 5.5, 2, 0, Math.PI * 2); ctx.fill()
  }

  // Stern eyebrows
  ctx.strokeStyle = '#0d3b66'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - 18, headY - 13)
  ctx.lineTo(cx - 5, headY - 10)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 18, headY - 13)
  ctx.lineTo(cx + 5, headY - 10)
  ctx.stroke()

  // Dragon whiskers
  ctx.strokeStyle = 'rgba(160,200,240,0.5)'
  ctx.lineWidth = 1
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(cx + side * 14, headY + 4)
    ctx.quadraticCurveTo(cx + side * 30, headY, cx + side * 38, headY + 10 + Math.sin(time * 2) * 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + side * 12, headY + 8)
    ctx.quadraticCurveTo(cx + side * 28, headY + 10, cx + side * 35, headY + 20 + Math.sin(time * 2 + 1) * 3)
    ctx.stroke()
  }

  // Beard
  ctx.fillStyle = 'rgba(180,210,240,0.35)'
  ctx.beginPath()
  ctx.moveTo(cx - 12, headY + 12)
  ctx.quadraticCurveTo(cx - 16, headY + 30, cx - 8, headY + 42)
  ctx.quadraticCurveTo(cx, headY + 46, cx + 8, headY + 42)
  ctx.quadraticCurveTo(cx + 16, headY + 30, cx + 12, headY + 12)
  ctx.closePath()
  ctx.fill()

  // Mouth (stern line)
  ctx.strokeStyle = '#0d3b66'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 6, headY + 10)
  ctx.lineTo(cx + 6, headY + 10)
  ctx.stroke()
}

function drawGuard(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 44, 28, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  // Spear (behind body)
  // Shaft
  const spGrad = ctx.createLinearGradient(cx + 34, cy - 40, cx + 34, cy + 40)
  spGrad.addColorStop(0, '#a08060')
  spGrad.addColorStop(1, '#6b5030')
  ctx.strokeStyle = spGrad
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx + 34, cy - 44)
  ctx.lineTo(cx + 34, cy + 40)
  ctx.stroke()
  // Spear tip
  const tipGrad = ctx.createLinearGradient(cx + 34, cy - 56, cx + 34, cy - 40)
  tipGrad.addColorStop(0, '#ecf0f1')
  tipGrad.addColorStop(1, '#95a5a6')
  ctx.fillStyle = tipGrad
  ctx.beginPath()
  ctx.moveTo(cx + 34, cy - 56)
  ctx.lineTo(cx + 28, cy - 40)
  ctx.lineTo(cx + 40, cy - 40)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Body armor
  const armorGrad = ctx.createLinearGradient(cx, cy - 8, cx, cy + 38)
  armorGrad.addColorStop(0, '#a8b5b8')
  armorGrad.addColorStop(0.3, '#8a9598')
  armorGrad.addColorStop(0.7, '#6c7a7d')
  armorGrad.addColorStop(1, '#4a5558')
  ctx.fillStyle = armorGrad
  ctx.beginPath()
  ctx.roundRect(cx - 24, cy - 6, 48, 44, 6)
  ctx.fill()

  // Armor plate segments
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(cx - 22, cy + 4 + i * 10)
    ctx.lineTo(cx + 22, cy + 4 + i * 10)
    ctx.stroke()
  }
  // Center line
  ctx.beginPath()
  ctx.moveTo(cx, cy - 4)
  ctx.lineTo(cx, cy + 36)
  ctx.stroke()
  // Armor highlight
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath()
  ctx.roundRect(cx - 22, cy - 4, 22, 40, [4, 0, 0, 4])
  ctx.fill()

  // Shoulder pads (larger, rounder)
  for (const side of [-1, 1]) {
    const spGrad2 = ctx.createRadialGradient(cx + side * 30, cy - 4, 0, cx + side * 30, cy - 4, 14)
    spGrad2.addColorStop(0, '#a8b5b8')
    spGrad2.addColorStop(1, '#5a6568')
    ctx.fillStyle = spGrad2
    ctx.beginPath()
    ctx.ellipse(cx + side * 30, cy - 2, 14, 10, side * 0.2, 0, Math.PI * 2)
    ctx.fill()
    // Shoulder rivet
    ctx.fillStyle = '#c8940c'
    ctx.beginPath(); ctx.arc(cx + side * 30, cy - 2, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath(); ctx.arc(cx + side * 30 - 0.5, cy - 3, 1, 0, Math.PI * 2); ctx.fill()
  }

  // Helmet (larger, more detailed)
  const helmGrad = ctx.createRadialGradient(cx - 4, cy - 24, 0, cx, cy - 18, 26)
  helmGrad.addColorStop(0, '#bcc6c8')
  helmGrad.addColorStop(0.6, '#8a9598')
  helmGrad.addColorStop(1, '#5a6568')
  ctx.fillStyle = helmGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 18, 26, Math.PI, 0)
  ctx.lineTo(cx + 28, cy - 8)
  ctx.lineTo(cx - 28, cy - 8)
  ctx.closePath()
  ctx.fill()

  // Helmet rim
  ctx.fillStyle = '#5a6568'
  ctx.beginPath()
  ctx.roundRect(cx - 28, cy - 10, 56, 6, 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - 27, cy - 10)
  ctx.lineTo(cx + 27, cy - 10)
  ctx.stroke()

  // Helmet crest (larger, with gradient)
  const crestGrad = ctx.createLinearGradient(cx, cy - 48, cx, cy - 18)
  crestGrad.addColorStop(0, '#ff4444')
  crestGrad.addColorStop(0.5, '#cc2222')
  crestGrad.addColorStop(1, '#881111')
  ctx.fillStyle = crestGrad
  ctx.beginPath()
  ctx.moveTo(cx - 4, cy - 44)
  ctx.quadraticCurveTo(cx - 8, cy - 50, cx, cy - 54)
  ctx.quadraticCurveTo(cx + 8, cy - 50, cx + 4, cy - 44)
  ctx.lineTo(cx + 3, cy - 20)
  ctx.lineTo(cx - 3, cy - 20)
  ctx.closePath()
  ctx.fill()

  // Visor
  const visorGrad = ctx.createLinearGradient(cx - 16, cy - 18, cx + 16, cy - 8)
  visorGrad.addColorStop(0, '#1a2530')
  visorGrad.addColorStop(0.5, '#2c3e50')
  visorGrad.addColorStop(1, '#1a2530')
  ctx.fillStyle = visorGrad
  ctx.beginPath()
  ctx.roundRect(cx - 18, cy - 18, 36, 12, 3)
  ctx.fill()

  // Eye slit (menacing red glow)
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.roundRect(cx - 14, cy - 14, 28, 5, 2)
  ctx.fill()
  // Glow effect
  ctx.globalAlpha = 0.35
  const eyeG = ctx.createRadialGradient(cx, cy - 12, 0, cx, cy - 12, 20)
  eyeG.addColorStop(0, '#ff3333')
  eyeG.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeG
  ctx.beginPath()
  ctx.arc(cx, cy - 12, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Two bright spots in visor
  ctx.fillStyle = '#ff6666'
  ctx.beginPath(); ctx.arc(cx - 6, cy - 12, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 6, cy - 12, 2, 0, Math.PI * 2); ctx.fill()

  // Belt
  ctx.fillStyle = '#4a3520'
  ctx.beginPath()
  ctx.roundRect(cx - 24, cy + 10, 48, 6, 2)
  ctx.fill()
  // Belt buckle
  ctx.fillStyle = '#c8940c'
  ctx.beginPath()
  ctx.roundRect(cx - 5, cy + 9, 10, 8, 2)
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
