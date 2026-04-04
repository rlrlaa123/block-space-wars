import { useState, useEffect, useRef } from 'react'
import { CHAPTERS, TOTAL_CHAPTERS, STAGES_PER_CHAPTER, STAR_COUNT, MAX_CANVAS_WIDTH } from '../game/constants'

interface Props {
  unlockedChapter: number
  unlockedStage: number
  onSelect: (chapter: number, stage: number) => void
  onBack: () => void
}

export function ChapterSelect({ unlockedChapter, unlockedStage, onSelect, onBack }: Props) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated starfield background
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

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 2 + 0.3,
      speed: Math.random() * 8 + 3,
    }))

    let raf = 0
    let time = 0

    function draw() {
      time += 0.016

      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#050520')
      grad.addColorStop(1, '#0a0a2e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      for (const star of stars) {
        star.y += star.speed * 0.016
        if (star.y > h) { star.y = -1; star.x = Math.random() * w }
        ctx.globalAlpha = Math.sin(time * 2 + star.x * 0.1) * 0.2 + 0.5
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.s * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const anim = `
    @keyframes cardSlideIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes headerFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <style>{anim}</style>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* Content overlay */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 20, boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: 24,
          animation: 'headerFade 0.5s ease-out',
        }}>
          <h2 style={{
            color: '#fff', fontFamily: 'monospace', fontSize: 22,
            margin: 0, letterSpacing: 2, textAlign: 'center',
          }}>
            CHAPTER SELECT
          </h2>
          <div style={{
            width: 60, height: 2, margin: '10px auto 0',
            background: 'linear-gradient(90deg, transparent, #4ecdc4, transparent)',
          }} />
        </div>

        {/* Chapter cards */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          width: '100%', maxWidth: 340,
          overflowY: 'auto', maxHeight: '65vh',
        }}>
          {CHAPTERS.map((ch, i) => {
            const locked = i > unlockedChapter
            const isCurrent = i === unlockedChapter
            const isExpanded = expandedChapter === i
            const delay = i * 0.08
            const maxStage = isCurrent ? unlockedStage : (locked ? -1 : STAGES_PER_CHAPTER - 1)

            return (
              <div key={i} style={{ animation: `cardSlideIn 0.4s ease-out ${delay}s both` }}>
                {/* Chapter header */}
                <button
                  onClick={() => !locked && setExpandedChapter(isExpanded ? null : i)}
                  disabled={locked}
                  style={{
                    width: '100%',
                    position: 'relative',
                    padding: '14px 18px',
                    fontSize: 15,
                    fontFamily: 'sans-serif',
                    fontWeight: 600,
                    background: locked
                      ? 'rgba(255,255,255,0.03)'
                      : `linear-gradient(135deg, ${hexToRgba(ch.brickColor, 0.15)} 0%, ${hexToRgba(ch.brickColor, 0.06)} 100%)`,
                    color: locked ? 'rgba(255,255,255,0.25)' : '#fff',
                    border: locked
                      ? '1px solid rgba(255,255,255,0.06)'
                      : isCurrent
                        ? `1.5px solid ${hexToRgba(ch.accentColor, 0.6)}`
                        : `1px solid ${hexToRgba(ch.brickColor, 0.25)}`,
                    borderRadius: isExpanded ? '12px 12px 0 0' : 12,
                    cursor: locked ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    minHeight: 52,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'border-radius 0.2s',
                    backdropFilter: locked ? 'none' : 'blur(8px)',
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: locked ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${ch.brickColor}, ${ch.accentColor})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold',
                    color: locked ? 'rgba(255,255,255,0.2)' : '#fff',
                    flexShrink: 0,
                    boxShadow: locked ? 'none' : `0 2px 8px ${hexToRgba(ch.brickColor, 0.3)}`,
                  }}>
                    {locked ? '🔒' : i + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 10, fontFamily: 'monospace',
                      color: locked ? 'rgba(255,255,255,0.15)' : hexToRgba(ch.brickColor, 0.8),
                      marginBottom: 2, letterSpacing: 1,
                    }}>
                      CHAPTER {i + 1}
                    </div>
                    <div style={{
                      fontSize: 15, fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ch.name}
                    </div>
                  </div>

                  {/* Expand arrow or status */}
                  {!locked && (
                    <div style={{
                      fontSize: 12, flexShrink: 0, color: 'rgba(255,255,255,0.4)',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    }}>
                      ▼
                    </div>
                  )}
                </button>

                {/* Stage grid (expanded) */}
                {isExpanded && !locked && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${hexToRgba(ch.brickColor, 0.15)}`,
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: '12px 14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8,
                  }}>
                    {Array.from({ length: STAGES_PER_CHAPTER }, (_, s) => {
                      const stageLocked = s > maxStage
                      const isStageCurrent = isCurrent && s === unlockedStage
                      return (
                        <button
                          key={s}
                          onClick={() => !stageLocked && onSelect(i, s)}
                          disabled={stageLocked}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            fontSize: 13,
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            background: stageLocked
                              ? 'rgba(255,255,255,0.03)'
                              : isStageCurrent
                                ? `linear-gradient(135deg, ${ch.accentColor}, ${ch.brickColor})`
                                : `rgba(255,255,255,0.06)`,
                            color: stageLocked ? 'rgba(255,255,255,0.15)' : '#fff',
                            border: isStageCurrent
                              ? `1.5px solid ${ch.accentColor}`
                              : stageLocked
                                ? '1px solid rgba(255,255,255,0.04)'
                                : `1px solid ${hexToRgba(ch.brickColor, 0.2)}`,
                            borderRadius: 8,
                            cursor: stageLocked ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 40,
                            minWidth: 40,
                            transition: 'background 0.15s',
                          }}
                        >
                          {stageLocked ? '🔒' : s + 1}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress indicator */}
        <div style={{
          marginTop: 20,
          fontSize: 12, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.3)',
          animation: 'headerFade 0.5s ease-out 0.5s both',
        }}>
          {unlockedChapter >= TOTAL_CHAPTERS - 1 ? 'ALL CLEARED' : `${unlockedChapter + 1} / ${TOTAL_CHAPTERS}`}
        </div>

        {/* Back button */}
        <button onClick={onBack} style={{
          marginTop: 20, padding: '10px 28px', fontSize: 13,
          background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 50, cursor: 'pointer', fontFamily: 'sans-serif',
          letterSpacing: 0.5,
          animation: 'headerFade 0.5s ease-out 0.6s both',
          transition: 'color 0.2s, border-color 0.2s',
        }}>
          돌아가기
        </button>
      </div>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
