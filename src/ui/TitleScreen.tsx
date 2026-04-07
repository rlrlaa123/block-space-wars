import { useEffect, useRef } from 'react'
import { STAR_COUNT, MAX_CANVAS_WIDTH } from '../game/constants'
import { drawSpaceTurtle } from './spaceTurtle'

interface Props {
  onStart: () => void
  onChapterSelect: () => void
  onReset: () => void
  hasProgress: boolean
}

export function TitleScreen({ onStart, onChapterSelect, onReset, hasProgress }: Props) {
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

      // ── Space Turtle (shared with cutscene) ──
      drawSpaceTurtle(ctx, cx, h * 0.40 + floatY, 1, time)

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
            bottom: '14%',
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

      {/* Reset button */}
      {hasProgress && (
        <button
          onClick={onReset}
          style={{
            position: 'absolute',
            bottom: '6%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 24px',
            fontSize: 12,
            fontFamily: 'sans-serif',
            background: 'transparent',
            color: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 50,
            cursor: 'pointer',
            minHeight: 36,
            letterSpacing: 0.5,
            animation: 'btnFadeIn 1s ease-out',
          }}
        >
          처음부터 시작
        </button>
      )}
    </div>
  )
}
