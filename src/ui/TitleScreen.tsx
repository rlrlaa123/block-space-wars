import { useEffect, useRef } from 'react'
import { STAR_COUNT } from '../game/constants'

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
    const w = Math.min(window.innerWidth, 420)
    const h = window.innerHeight
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)

    // Stars
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 2 + 0.5,
    }))

    let raf = 0
    let time = 0

    function draw() {
      time += 0.016
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, w, h)

      // Stars
      for (const star of stars) {
        ctx.globalAlpha = Math.sin(time * 2 + star.x * 0.1) * 0.2 + 0.5
        ctx.fillStyle = '#fff'
        ctx.fillRect(star.x, star.y, star.s, star.s)
      }
      ctx.globalAlpha = 1

      // Geometric turtle (center)
      const cx = w / 2
      const cy = h * 0.42

      // Shell (green circle)
      ctx.fillStyle = '#2ecc71'
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fill()

      // Shell pattern
      ctx.strokeStyle = '#27ae60'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, 15, 0, Math.PI * 2)
      ctx.stroke()
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI) / 3
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * 15, cy + Math.sin(angle) * 15)
        ctx.lineTo(cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30)
        ctx.stroke()
      }

      // Head
      ctx.fillStyle = '#27ae60'
      ctx.beginPath()
      ctx.arc(cx, cy - 35, 12, 0, Math.PI * 2)
      ctx.fill()

      // Eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(cx - 5, cy - 38, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 5, cy - 38, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(cx - 4, cy - 38, 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 6, cy - 38, 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Legs
      ctx.fillStyle = '#27ae60'
      for (const [lx, ly] of [[-25, 15], [25, 15], [-20, -15], [20, -15]]) {
        ctx.fillRect(cx + lx - 5, cy + ly - 3, 10, 6)
      }

      // Floating animation
      const float = Math.sin(time * 1.5) * 5
      ctx.save()
      ctx.translate(0, float)

      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SPACE RABBIT', cx, h * 0.18)
      ctx.fillText('TALES', cx, h * 0.18 + 36)

      // Subtitle
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#4ecdc4'
      ctx.fillText('토끼전 in Space', cx, h * 0.18 + 64)

      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', margin: '0 auto', background: '#0a0a2e' }}
      />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}>
        <button onClick={onStart} style={btnStyle}>
          시작하기
        </button>
        {hasProgress && (
          <button onClick={onChapterSelect} style={{ ...btnStyle, background: 'transparent', border: '2px solid #4ecdc4' }}>
            챕터 선택
          </button>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '16px 48px',
  fontSize: 20,
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  background: '#4ecdc4',
  color: '#0a0a2e',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  minWidth: 200,
  minHeight: 44,
}
