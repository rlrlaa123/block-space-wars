import { useState, useEffect } from 'react'
import { GAME_OVER_BUTTON_DELAY } from '../game/constants'

interface Props {
  onRetry: () => void
  onChapterSelect: () => void
}

export function GameOverScreen({ onRetry, onChapterSelect }: Props) {
  const [buttonsActive, setButtonsActive] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setButtonsActive(true), GAME_OVER_BUTTON_DELAY * 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: 16, pointerEvents: buttonsActive ? 'auto' : 'none',
      zIndex: 10,
    }}>
      {/* Buttons appear after delay */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        opacity: buttonsActive ? 1 : 0,
        transition: 'opacity 0.3s',
        marginTop: 80,
      }}>
        <button onClick={onRetry} style={btnStyle}>
          다시 시도
        </button>
        <button onClick={onChapterSelect} style={{ ...btnStyle, background: '#555' }}>
          챕터 선택
        </button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '14px 40px',
  fontSize: 18,
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  background: '#4ecdc4',
  color: '#0a0a2e',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  minWidth: 180,
  minHeight: 44,
}
