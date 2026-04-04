import { useEffect, useRef } from 'react'
import { STAR_COUNT, MAX_CANVAS_WIDTH } from '../game/constants'

interface Props {
  onStart: () => void
  onChapterSelect: () => void
  hasProgress: boolean
}

export function TitleScreen({ onStart, onChapterSelect, hasProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = Math.min(window.innerWidth, MAX_CANVAS_WIDTH)
    const h = window.innerHeight
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)

    // Stars with color variety
    const stars = Array.from({ length: STAR_COUNT * 2 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 2.5 + 0.3,
      speed: Math.random() * 15 + 5, // scroll speed
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 180 : 40) : 0, // some cyan/gold
    }))

    // Floating particles (ambient)
    const floaters = Array.from({ length: 20 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      alpha: Math.random() * 0.3 + 0.1,
      hue: Math.random() * 60 + 160, // cyan-ish
    }))

    let raf = 0
    let time = 0

    function draw() {
      const dt = 0.016
      time += dt

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#050520')
      grad.addColorStop(0.5, '#0a0a2e')
      grad.addColorStop(1, '#0d0d3a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Scrolling stars
      for (const star of stars) {
        star.y += star.speed * dt
        if (star.y > h) { star.y = -2; star.x = Math.random() * w }
        const twinkle = Math.sin(time * 3 + star.x * 0.1) * 0.3 + 0.7
        ctx.globalAlpha = twinkle * (star.hue ? 0.8 : 0.6)
        ctx.fillStyle = star.hue ? `hsl(${star.hue}, 80%, 75%)` : '#fff'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.s * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Floating particles
      for (const p of floaters) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.globalAlpha = p.alpha * (Math.sin(time * 2 + p.x) * 0.3 + 0.7)
        ctx.fillStyle = `hsl(${p.hue}, 60%, 60%)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const cx = w / 2
      const floatY = Math.sin(time * 1.2) * 6

      // ── Turtle character (center) ──
      const turtleY = h * 0.38 + floatY
      const shellR = 34

      // Glow behind turtle
      ctx.globalAlpha = 0.15
      const tGlow = ctx.createRadialGradient(cx, turtleY, 0, cx, turtleY, shellR * 3)
      tGlow.addColorStop(0, '#4ecdc4')
      tGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = tGlow
      ctx.beginPath()
      ctx.arc(cx, turtleY, shellR * 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Shell shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(cx, turtleY + shellR + 8, shellR * 0.8, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Legs (behind shell)
      ctx.fillStyle = '#27ae60'
      const legPositions: [number, number][] = [[-22, 18], [22, 18], [-18, -18], [18, -18]]
      for (const [lx, ly] of legPositions) {
        ctx.beginPath()
        ctx.roundRect(cx + lx - 6, turtleY + ly - 4, 12, 8, 3)
        ctx.fill()
      }

      // Tail
      ctx.beginPath()
      ctx.arc(cx, turtleY + shellR + 2, 5, 0, Math.PI * 2)
      ctx.fill()

      // Shell
      const shellGrad = ctx.createRadialGradient(cx - 5, turtleY - 5, 0, cx, turtleY, shellR)
      shellGrad.addColorStop(0, '#3ddb85')
      shellGrad.addColorStop(0.7, '#2ecc71')
      shellGrad.addColorStop(1, '#1a9c54')
      ctx.fillStyle = shellGrad
      ctx.beginPath()
      ctx.arc(cx, turtleY, shellR, 0, Math.PI * 2)
      ctx.fill()

      // Shell pattern (hexagon-like)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, turtleY, shellR * 0.45, 0, Math.PI * 2)
      ctx.stroke()
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3 + time * 0.15
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * shellR * 0.45, turtleY + Math.sin(angle) * shellR * 0.45)
        ctx.lineTo(cx + Math.cos(angle) * shellR * 0.92, turtleY + Math.sin(angle) * shellR * 0.92)
        ctx.stroke()
      }

      // Shell rim
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, turtleY, shellR, 0, Math.PI * 2)
      ctx.stroke()

      // Head
      const headY = turtleY - shellR - 10
      const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, 14)
      headGrad.addColorStop(0, '#3ddb85')
      headGrad.addColorStop(1, '#27ae60')
      ctx.fillStyle = headGrad
      ctx.beginPath()
      ctx.arc(cx, headY, 14, 0, Math.PI * 2)
      ctx.fill()

      // Eyes (with pupils that follow a sine wave)
      const eyeOffset = Math.sin(time * 0.8) * 2
      // White
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(cx - 6, headY - 2, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 6, headY - 2, 4, 0, Math.PI * 2)
      ctx.fill()
      // Pupils
      ctx.fillStyle = '#1a1a2e'
      ctx.beginPath()
      ctx.arc(cx - 5 + eyeOffset, headY - 2, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 7 + eyeOffset, headY - 2, 2, 0, Math.PI * 2)
      ctx.fill()
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.arc(cx - 6.5, headY - 3.5, 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 5.5, headY - 3.5, 1.2, 0, Math.PI * 2)
      ctx.fill()

      // Mouth (small smile)
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(cx, headY + 3, 4, 0.2, Math.PI - 0.2)
      ctx.stroke()

      // ── Title ──
      const titleY = h * 0.15 + floatY * 0.5

      // Title glow
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.shadowColor = '#4ecdc4'
      ctx.shadowBlur = 20
      ctx.fillStyle = '#4ecdc4'
      ctx.font = 'bold 32px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('BLOCK SPACE', cx, titleY)
      ctx.fillText('WARS', cx, titleY + 40)
      ctx.restore()

      // Title solid
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('BLOCK SPACE', cx, titleY)
      ctx.fillText('WARS', cx, titleY + 40)

      // Subtitle line
      const subY = titleY + 72
      const lineW = 80
      ctx.strokeStyle = 'rgba(78,205,196,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - lineW, subY)
      ctx.lineTo(cx + lineW, subY)
      ctx.stroke()

      // Subtitle
      ctx.font = '15px sans-serif'
      ctx.fillStyle = '#4ecdc4'
      ctx.globalAlpha = 0.9
      ctx.fillText('Rabbit Tales', cx, subY + 18)
      ctx.globalAlpha = 1

      // ── Version/credit ──
      ctx.font = '11px monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillText('v0.1 MLP', cx, h - 20)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const pulse = `
    @keyframes btnPulse {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.03); }
    }
    @keyframes btnFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <style>{pulse}</style>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', margin: '0 auto', background: '#050520' }}
      />
      {/* Start button */}
      <button
        onClick={onStart}
        style={{
          position: 'absolute',
          bottom: hasProgress ? '22%' : '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '16px 56px',
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44b8b0 100%)',
          color: '#0a0a2e',
          border: 'none',
          borderRadius: 50,
          cursor: 'pointer',
          minWidth: 220,
          minHeight: 52,
          boxShadow: '0 4px 20px rgba(78,205,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
          letterSpacing: 1,
          animation: 'btnPulse 2.5s ease-in-out infinite, btnFadeIn 0.6s ease-out',
        }}
      >
        {hasProgress ? '이어하기' : '시작하기'}
      </button>

      {/* Chapter select button */}
      {hasProgress && (
        <button
          onClick={onChapterSelect}
          style={{
            position: 'absolute',
            bottom: '13%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 36px',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            background: 'rgba(78,205,196,0.08)',
            color: '#4ecdc4',
            border: '1.5px solid rgba(78,205,196,0.35)',
            borderRadius: 50,
            cursor: 'pointer',
            minWidth: 180,
            minHeight: 44,
            backdropFilter: 'blur(4px)',
            letterSpacing: 0.5,
            animation: 'btnFadeIn 0.8s ease-out',
          }}
        >
          챕터 선택
        </button>
      )}
    </div>
  )
}
