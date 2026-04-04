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

      // ── Space Turtle character (center, matches cutscene) ──
      const tCx = cx
      const tBodyY = h * 0.40 + floatY

      // Glow behind turtle
      ctx.globalAlpha = 0.15
      const tGlow = ctx.createRadialGradient(tCx, tBodyY - 20, 0, tCx, tBodyY - 20, 80)
      tGlow.addColorStop(0, '#4ecdc4')
      tGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = tGlow
      ctx.beginPath()
      ctx.arc(tCx, tBodyY - 20, 80, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(tCx, tBodyY + 48, 30, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      // Legs (boots)
      for (const side of [-1, 1]) {
        const bg = ctx.createLinearGradient(tCx + side * 18, tBodyY + 30, tCx + side * 18, tBodyY + 46)
        bg.addColorStop(0, '#d0d4d8'); bg.addColorStop(1, '#8a9098')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.roundRect(tCx + side * 10, tBodyY + 28, 18, 18, [0, 0, 6, 6]); ctx.fill()
        ctx.fillStyle = '#555'
        ctx.beginPath(); ctx.roundRect(tCx + side * 9, tBodyY + 42, 20, 5, [0, 0, 4, 4]); ctx.fill()
      }

      // Arms + gloves
      for (const side of [-1, 1]) {
        const ax = tCx + side * 36, ay = tBodyY + 4
        ctx.fillStyle = '#c8ccd0'
        ctx.beginPath(); ctx.ellipse(ax, ay, 10, 14, side * 0.3, 0, Math.PI * 2); ctx.fill()
        const gg = ctx.createRadialGradient(ax + side * 2, ay + 10, 0, ax + side * 2, ay + 10, 8)
        gg.addColorStop(0, '#2ecc71'); gg.addColorStop(1, '#1a8c48')
        ctx.fillStyle = gg
        ctx.beginPath(); ctx.arc(ax + side * 2, ay + 10, 8, 0, Math.PI * 2); ctx.fill()
      }

      // Body (spacesuit)
      const sg = ctx.createLinearGradient(tCx, tBodyY - 28, tCx, tBodyY + 30)
      sg.addColorStop(0, '#e8ecf0'); sg.addColorStop(0.4, '#d0d4d8'); sg.addColorStop(1, '#a8b0b8')
      ctx.fillStyle = sg
      ctx.beginPath(); ctx.roundRect(tCx - 28, tBodyY - 24, 56, 54, 14); ctx.fill()

      // Chest panel
      ctx.fillStyle = 'rgba(46,204,113,0.15)'
      ctx.beginPath(); ctx.roundRect(tCx - 16, tBodyY - 10, 32, 28, 8); ctx.fill()
      ctx.strokeStyle = 'rgba(46,204,113,0.3)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(tCx - 16, tBodyY - 10, 32, 28, 8); ctx.stroke()

      // Buttons
      const btnColors = ['#2ecc71', '#f39c12', '#e74c3c']
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = btnColors[i]
        ctx.beginPath(); ctx.arc(tCx - 6 + i * 6, tBodyY - 4, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.beginPath(); ctx.arc(tCx - 6.5 + i * 6, tBodyY - 4.5, 1, 0, Math.PI * 2); ctx.fill()
      }

      // Collar
      ctx.fillStyle = '#bcc4cc'
      ctx.beginPath(); ctx.ellipse(tCx, tBodyY - 24, 22, 6, 0, 0, Math.PI * 2); ctx.fill()

      // Helmet
      const helmCy = tBodyY - 50
      const helmR = 30
      const rg = ctx.createLinearGradient(tCx - helmR, helmCy, tCx + helmR, helmCy)
      rg.addColorStop(0, '#c8ccd0'); rg.addColorStop(0.5, '#e8ecf0'); rg.addColorStop(1, '#a8b0b8')
      ctx.fillStyle = rg
      ctx.beginPath(); ctx.arc(tCx, helmCy, helmR + 4, 0, Math.PI * 2); ctx.fill()

      // Visor
      const vg = ctx.createRadialGradient(tCx - 8, helmCy - 8, 0, tCx, helmCy, helmR)
      vg.addColorStop(0, '#1a3a4a'); vg.addColorStop(0.6, '#0d2030'); vg.addColorStop(1, '#081018')
      ctx.fillStyle = vg
      ctx.beginPath(); ctx.arc(tCx, helmCy, helmR, 0, Math.PI * 2); ctx.fill()

      // Face
      const fg = ctx.createRadialGradient(tCx - 3, helmCy - 2, 0, tCx, helmCy + 2, 22)
      fg.addColorStop(0, '#4ceb9a'); fg.addColorStop(0.6, '#2ecc71'); fg.addColorStop(1, '#1a9c54')
      ctx.fillStyle = fg
      ctx.beginPath(); ctx.arc(tCx, helmCy + 2, 22, 0, Math.PI * 2); ctx.fill()

      // Eyes (animated pupils)
      const eyeOff = Math.sin(time * 0.8) * 1.5
      for (const side of [-1, 1]) {
        const ex = tCx + side * 9, ey = helmCy - 2
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.ellipse(ex, ey, 8, 9, 0, 0, Math.PI * 2); ctx.fill()
        const ig = ctx.createRadialGradient(ex + eyeOff, ey, 0, ex, ey, 5.5)
        ig.addColorStop(0, '#2ecc71'); ig.addColorStop(0.5, '#1a7a3e'); ig.addColorStop(1, '#0d4020')
        ctx.fillStyle = ig
        ctx.beginPath(); ctx.arc(ex + eyeOff, ey, 5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#0a0a18'
        ctx.beginPath(); ctx.arc(ex + eyeOff, ey, 2.8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath(); ctx.arc(ex - 2.5, ey - 3.5, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.beginPath(); ctx.arc(ex + 2, ey + 1.5, 1.2, 0, Math.PI * 2); ctx.fill()
      }

      // Nostrils + smile
      ctx.fillStyle = '#145c2e'
      ctx.beginPath(); ctx.arc(tCx - 2.5, helmCy + 7, 1.3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(tCx + 2.5, helmCy + 6.5, 1.3, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#145c2e'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(tCx, helmCy + 12, 8, 0.15, Math.PI - 0.15); ctx.stroke()

      // Helmet reflections
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(tCx - 12, helmCy - 10, helmR * 0.7, -0.8, 0.4); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath(); ctx.arc(tCx + 16, helmCy - 14, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(tCx + 12, helmCy - 20, 1.2, 0, Math.PI * 2); ctx.fill()

      // Jetpack
      for (const side of [-1, 1]) {
        const jpx = tCx + side * 30, jpy = tBodyY - 4
        ctx.fillStyle = '#6c7a80'
        ctx.beginPath(); ctx.roundRect(jpx - 5, jpy - 16, 10, 28, 4); ctx.fill()
        ctx.fillStyle = '#555'
        ctx.beginPath(); ctx.roundRect(jpx - 4, jpy + 10, 8, 6, [0, 0, 3, 3]); ctx.fill()
        ctx.globalAlpha = 0.3
        const tg2 = ctx.createRadialGradient(jpx, jpy + 18, 0, jpx, jpy + 18, 8)
        tg2.addColorStop(0, '#4ecdc4'); tg2.addColorStop(1, 'transparent')
        ctx.fillStyle = tg2
        ctx.beginPath(); ctx.arc(jpx, jpy + 18, 8, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }

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
