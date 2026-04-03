import { useState, useRef, useEffect, useCallback } from 'react'
import type { AppScreen } from './game/types'
import { CHAPTERS, TOTAL_CHAPTERS } from './game/constants'
import { STORIES } from './data/story'
import { createEngine } from './game/engine'
import { TitleScreen } from './ui/TitleScreen'
import { ChapterSelect } from './ui/ChapterSelect'
import { Cutscene } from './ui/Cutscene'
import { GameOverScreen } from './ui/GameOverScreen'

// localStorage helpers
const SAVE_KEY = 'bsw_chapter_progress'

function loadProgress(): number {
  try {
    const val = localStorage.getItem(SAVE_KEY)
    if (val !== null) return Math.min(parseInt(val, 10) || 0, TOTAL_CHAPTERS - 1)
  } catch { /* ignore */ }
  return 0
}

function saveProgress(chapter: number) {
  try {
    const current = loadProgress()
    if (chapter > current) localStorage.setItem(SAVE_KEY, String(chapter))
  } catch { /* ignore */ }
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('title')
  const [unlockedChapter, setUnlockedChapter] = useState(loadProgress)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null)
  // Use refs for chapter/stage to avoid re-triggering engine useEffect
  const chapterRef = useRef(0)
  const stageRef = useRef(0)
  // State only for UI screens that need re-render (cutscene)
  const [cutsceneChapter, setCutsceneChapter] = useState(0)
  const [cutsceneType, setCutsceneType] = useState<'prologue' | 'epilogue'>('prologue')

  const startGame = useCallback((chapter: number, stage = 0) => {
    chapterRef.current = chapter
    stageRef.current = stage
    setCutsceneChapter(chapter)
    setCutsceneType('prologue')
    setScreen('cutscene-prologue')
  }, [])

  const startGameplay = useCallback(() => {
    setScreen('game')
  }, [])

  // Create engine when entering game screen
  useEffect(() => {
    if (screen !== 'game' || !canvasRef.current) return

    const engine = createEngine(canvasRef.current, {
      onChapterClear(chapter) {
        const newUnlocked = Math.min(chapter + 1, TOTAL_CHAPTERS - 1)
        setUnlockedChapter(prev => {
          const next = Math.max(prev, newUnlocked)
          saveProgress(next)
          return next
        })
        chapterRef.current = chapter
        setCutsceneChapter(chapter)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onGameOver() {
        setScreen('game-over')
      },
      onGameComplete() {
        setUnlockedChapter(TOTAL_CHAPTERS - 1)
        saveProgress(TOTAL_CHAPTERS - 1)
        chapterRef.current = TOTAL_CHAPTERS - 1
        setCutsceneChapter(TOTAL_CHAPTERS - 1)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onStageLoaded(chapter, stage) {
        chapterRef.current = chapter
        stageRef.current = stage
      },
    }, chapterRef.current, stageRef.current)

    engineRef.current = engine
    return () => engine.destroy()
  }, [screen]) // only depends on screen

  // ── Render screens ──

  if (screen === 'title') {
    return (
      <TitleScreen
        hasProgress={unlockedChapter > 0}
        onStart={() => startGame(0)}
        onChapterSelect={() => setScreen('chapter-select')}
      />
    )
  }

  if (screen === 'chapter-select') {
    return (
      <ChapterSelect
        unlockedChapter={unlockedChapter}
        onSelect={(ch) => startGame(ch)}
        onBack={() => setScreen('title')}
      />
    )
  }

  if (screen === 'cutscene-prologue' || screen === 'cutscene-epilogue') {
    const story = STORIES[cutsceneChapter]
    const chapter = CHAPTERS[cutsceneChapter]
    const screens = cutsceneType === 'prologue' ? story.prologue : story.epilogue
    return (
      <Cutscene
        screens={screens}
        bgColor={chapter.bgColor}
        accentColor={chapter.accentColor}
        onComplete={() => {
          if (cutsceneType === 'prologue') {
            startGameplay()
          } else if (cutsceneChapter >= TOTAL_CHAPTERS - 1) {
            setScreen('title')
          } else {
            startGame(cutsceneChapter + 1)
          }
        }}
      />
    )
  }

  // Game screen + game-over overlay (same canvas, no remount)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', margin: '0 auto', touchAction: 'none' }}
      />
      {screen === 'game-over' && (
        <GameOverScreen
          onRetry={() => {
            engineRef.current?.retry()
            setScreen('game')
          }}
          onChapterSelect={() => setScreen('chapter-select')}
        />
      )}
    </div>
  )
}
