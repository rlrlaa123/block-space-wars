import { useState, useEffect, useRef } from 'react'
import type { CutsceneScreen } from '../data/story'
import { TYPEWRITER_MS } from '../game/constants'

interface Props {
  screens: CutsceneScreen[]
  bgColor: string
  accentColor: string
  onComplete: () => void
}

function CharacterSprite({ character, accentColor }: { character: string; accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = 120
    canvas.width = s * devicePixelRatio
    canvas.height = s * devicePixelRatio
    canvas.style.width = `${s}px`
    canvas.style.height = `${s}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, s, s)

    const cx = s / 2, cy = s / 2

    if (character === 'turtle') {
      ctx.fillStyle = '#2ecc71'
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#27ae60'
      ctx.beginPath(); ctx.arc(cx, cy - 32, 12, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cx - 4, cy - 35, 3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 4, cy - 35, 3, 0, Math.PI * 2); ctx.fill()
    } else if (character === 'rabbit') {
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cx, cy + 5, 22, 0, Math.PI * 2); ctx.fill()
      // Ears
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(cx - 8, cy - 15); ctx.lineTo(cx - 12, cy - 50); ctx.lineTo(cx - 2, cy - 18)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + 8, cy - 15); ctx.lineTo(cx + 12, cy - 50); ctx.lineTo(cx + 2, cy - 18)
      ctx.fill()
      // Inner ears
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.moveTo(cx - 7, cy - 18); ctx.lineTo(cx - 10, cy - 42); ctx.lineTo(cx - 3, cy - 20)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + 7, cy - 18); ctx.lineTo(cx + 10, cy - 42); ctx.lineTo(cx + 3, cy - 20)
      ctx.fill()
      // Eyes
      ctx.fillStyle = '#e74c3c'
      ctx.beginPath(); ctx.arc(cx - 7, cy + 2, 3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 7, cy + 2, 3, 0, Math.PI * 2); ctx.fill()
    } else if (character === 'dragon-king') {
      ctx.fillStyle = '#3498db'
      ctx.beginPath(); ctx.arc(cx, cy + 5, 30, 0, Math.PI * 2); ctx.fill()
      // Crown
      ctx.fillStyle = '#f1c40f'
      ctx.beginPath()
      ctx.moveTo(cx - 20, cy - 22)
      ctx.lineTo(cx - 15, cy - 40)
      ctx.lineTo(cx - 5, cy - 28)
      ctx.lineTo(cx, cy - 45)
      ctx.lineTo(cx + 5, cy - 28)
      ctx.lineTo(cx + 15, cy - 40)
      ctx.lineTo(cx + 20, cy - 22)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cx - 8, cy + 2, 4, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 8, cy + 2, 4, 0, Math.PI * 2); ctx.fill()
    } else if (character === 'guard') {
      ctx.fillStyle = '#95a5a6'
      ctx.fillRect(cx - 18, cy - 15, 36, 40)
      ctx.fillStyle = '#7f8c8d'
      ctx.fillRect(cx - 20, cy - 20, 40, 8) // helmet
      ctx.fillStyle = '#e74c3c'
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill() // visor
    }
  }, [character])

  if (character === 'none') return null
  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto 16px' }} />
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
