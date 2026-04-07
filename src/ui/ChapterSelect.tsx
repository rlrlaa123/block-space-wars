import { useState, useEffect, useRef } from 'react'
import { CHAPTERS, STAGES_PER_CHAPTER, STAR_COUNT, MAX_CANVAS_WIDTH } from '../game/constants'

interface Props {
  unlockedChapter: number
  unlockedStage: number
  onSelect: (chapter: number, stage: number) => void
  onBack: () => void
  onReset: () => void
}

export function ChapterSelect({ unlockedChapter, unlockedStage, onSelect, onBack, onReset }: Props) {
  const [selectedChapter, setSelectedChapter] = useState(unlockedChapter)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
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

  const ch = CHAPTERS[selectedChapter]
  const isCurrentChapter = selectedChapter === unlockedChapter
  const maxStage = selectedChapter < unlockedChapter
    ? STAGES_PER_CHAPTER - 1
    : isCurrentChapter
      ? unlockedStage
      : -1

  const anim = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes stagePopIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  `

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <style>{anim}</style>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px', boxSizing: 'border-box',
      }}>
        {/* Back button (top-left) */}
        <div
          onClick={onBack}
          style={{
            position: 'absolute', top: 10, left: 10,
            width: 44, height: 44, borderRadius: 22,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <polyline
              points="11,3 5,9 11,15"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Chapter tabs (horizontal scroll) ── */}
        <div style={{
          marginTop: 60, width: '100%', maxWidth: 380,
          animation: 'fadeIn 0.4s ease-out',
        }}>
          <div style={{
            display: 'flex', gap: 0,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {CHAPTERS.map((c, i) => {
              const locked = i > unlockedChapter
              const active = i === selectedChapter
              return (
                <button
                  key={i}
                  onClick={() => !locked && setSelectedChapter(i)}
                  disabled={locked}
                  style={{
                    flex: 1,
                    padding: '12px 4px',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: active ? 700 : 500,
                    background: active
                      ? `linear-gradient(180deg, ${hexToRgba(c.brickColor, 0.3)}, ${hexToRgba(c.brickColor, 0.1)})`
                      : locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                    color: locked ? 'rgba(255,255,255,0.15)' : active ? '#fff' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    borderBottom: active ? `2px solid ${c.brickColor}` : '2px solid transparent',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 44,
                  }}
                >
                  {locked ? '🔒' : `Ch.${i + 1}`}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Selected chapter info ── */}
        <div key={selectedChapter} style={{
          marginTop: 24, textAlign: 'center',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {/* Chapter badge */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${ch.brickColor}, ${ch.accentColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold', color: '#fff',
            boxShadow: `0 4px 20px ${hexToRgba(ch.brickColor, 0.4)}`,
          }}>
            {selectedChapter + 1}
          </div>

          <div style={{
            fontSize: 10, fontFamily: 'monospace', letterSpacing: 2,
            color: hexToRgba(ch.brickColor, 0.8), marginBottom: 4,
          }}>
            CHAPTER {selectedChapter + 1}
          </div>
          <div style={{
            fontSize: 20, fontWeight: 700, color: '#fff',
            fontFamily: 'sans-serif', marginBottom: 4,
          }}>
            {ch.name}
          </div>

          {/* Progress bar for this chapter */}
          {selectedChapter <= unlockedChapter && (
            <div style={{
              marginTop: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}>
              <div style={{
                width: 120, height: 4, borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${((maxStage + 1) / STAGES_PER_CHAPTER) * 100}%`,
                  height: '100%', borderRadius: 2,
                  background: `linear-gradient(90deg, ${ch.brickColor}, ${ch.accentColor})`,
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {maxStage + 1}/{STAGES_PER_CHAPTER}
              </span>
            </div>
          )}
        </div>

        {/* ── Stage grid ── */}
        <div key={`stages-${selectedChapter}`} style={{
          marginTop: 28, width: '100%', maxWidth: 300,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          animation: 'slideUp 0.35s ease-out',
        }}>
          {Array.from({ length: STAGES_PER_CHAPTER }, (_, s) => {
            const locked = s > maxStage
            const isCurrent = isCurrentChapter && s === unlockedStage
            const cleared = s < maxStage || (s <= maxStage && !isCurrentChapter)

            return (
              <button
                key={s}
                onClick={() => !locked && onSelect(selectedChapter, s)}
                disabled={locked}
                style={{
                  aspectRatio: '1',
                  fontSize: 15,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: locked
                    ? 'rgba(255,255,255,0.03)'
                    : isCurrent
                      ? `linear-gradient(135deg, ${ch.accentColor}, ${ch.brickColor})`
                      : cleared
                        ? `linear-gradient(135deg, ${hexToRgba(ch.brickColor, 0.2)}, ${hexToRgba(ch.brickColor, 0.08)})`
                        : 'rgba(255,255,255,0.05)',
                  color: locked ? 'rgba(255,255,255,0.12)' : '#fff',
                  border: isCurrent
                    ? `2px solid ${ch.accentColor}`
                    : locked
                      ? '1px solid rgba(255,255,255,0.04)'
                      : `1px solid ${hexToRgba(ch.brickColor, 0.2)}`,
                  borderRadius: 12,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  minHeight: 48,
                  boxShadow: isCurrent ? `0 2px 12px ${hexToRgba(ch.accentColor, 0.3)}` : 'none',
                  transition: 'transform 0.1s, background 0.15s',
                  animation: `stagePopIn 0.25s ease-out ${s * 0.03}s both`,
                }}
              >
                {locked ? (
                  <span style={{ fontSize: 14 }}>🔒</span>
                ) : (
                  <>
                    <span>{s + 1}</span>
                    {cleared && !isCurrent && (
                      <span style={{ fontSize: 8, color: '#4ecdc4', marginTop: -2 }}>★</span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Chapter navigation hint ── */}
        <div style={{
          marginTop: 20, fontSize: 11, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.2)',
          animation: 'fadeIn 0.5s ease-out 0.3s both',
        }}>
          {selectedChapter < unlockedChapter && `${STAGES_PER_CHAPTER}/${STAGES_PER_CHAPTER} CLEARED`}
          {selectedChapter === unlockedChapter && `STAGE ${unlockedStage + 1} IN PROGRESS`}
          {selectedChapter > unlockedChapter && 'LOCKED'}
        </div>

        {/* ── Reset (bottom, subtle) ── */}
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            marginTop: 24, padding: '6px 16px', fontSize: 11,
            background: 'transparent', color: 'rgba(255,255,255,0.18)',
            border: 'none', cursor: 'pointer', fontFamily: 'monospace',
            letterSpacing: 0.5,
            animation: 'fadeIn 0.5s ease-out 0.6s both',
          }}
        >
          게임 초기화
        </button>
      </div>

      {/* ── Reset confirm modal ── */}
      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#12122a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '28px 24px',
              maxWidth: 280, textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#fff',
              fontFamily: 'sans-serif', marginBottom: 8,
            }}>
              게임 초기화
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)',
              fontFamily: 'sans-serif', lineHeight: 1.5, marginBottom: 20,
            }}>
              모든 진행 상황이 삭제됩니다.{'\n'}정말 처음부터 시작하시겠습니까?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', fontSize: 14,
                  fontFamily: 'sans-serif', fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                취소
              </button>
              <button
                onClick={() => { setShowResetConfirm(false); onReset() }}
                style={{
                  flex: 1, padding: '12px 0', fontSize: 14,
                  fontFamily: 'sans-serif', fontWeight: 600,
                  background: 'rgba(231,76,60,0.2)', color: '#e74c3c',
                  border: '1px solid rgba(231,76,60,0.3)',
                  borderRadius: 10, cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
