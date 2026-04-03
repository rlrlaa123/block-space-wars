import { CHAPTERS } from '../game/constants'

interface Props {
  unlockedChapter: number // 0 = only ch1, 4 = all unlocked
  onSelect: (chapter: number) => void
  onBack: () => void
}

export function ChapterSelect({ unlockedChapter, onSelect, onBack }: Props) {
  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#0a0a2e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 20, boxSizing: 'border-box',
    }}>
      <h2 style={{ color: '#fff', fontFamily: 'monospace', fontSize: 24, margin: 0 }}>
        챕터 선택
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
        {CHAPTERS.map((ch, i) => {
          const locked = i > unlockedChapter
          return (
            <button
              key={i}
              onClick={() => !locked && onSelect(i)}
              disabled={locked}
              style={{
                padding: '14px 20px',
                fontSize: 16,
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                background: locked ? '#333' : ch.brickColor,
                color: locked ? '#666' : '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: locked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                minHeight: 44,
                opacity: locked ? 0.5 : 1,
              }}
            >
              Ch.{i + 1}: {ch.name} {locked ? '🔒' : ''}
            </button>
          )
        })}
      </div>
      <button onClick={onBack} style={{
        marginTop: 16, padding: '10px 24px', fontSize: 14,
        background: 'transparent', color: '#888', border: '1px solid #444',
        borderRadius: 6, cursor: 'pointer', fontFamily: 'sans-serif',
      }}>
        돌아가기
      </button>
    </div>
  )
}
