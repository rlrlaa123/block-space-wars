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
const SAVE_KEY = 'bsw_progress'

interface Progress {
  chapter: number
  stage: number
}

function loadProgress(): Progress {
  try {
    const val = localStorage.getItem(SAVE_KEY)
    if (val) {
      const parsed = JSON.parse(val)
      return {
        chapter: Math.min(parsed.chapter ?? 0, TOTAL_CHAPTERS - 1),
        stage: parsed.stage ?? 0,
      }
    }
  } catch { /* ignore */ }
  return { chapter: 0, stage: 0 }
}

function saveProgress(chapter: number, stage: number) {
  try {
    const current = loadProgress()
    // Save if further in game (higher chapter, or same chapter + higher stage)
    if (chapter > current.chapter || (chapter === current.chapter && stage > current.stage)) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ chapter, stage }))
    }
  } catch { /* ignore */ }
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('title')
  const [progress, setProgress] = useState(loadProgress)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null)
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
        saveProgress(chapter + 1, 0)
        setProgress(loadProgress())
        chapterRef.current = chapter
        setCutsceneChapter(chapter)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onGameOver() {
        setScreen('game-over')
      },
      onGameComplete() {
        saveProgress(TOTAL_CHAPTERS - 1, 9)
        setProgress(loadProgress())
        chapterRef.current = TOTAL_CHAPTERS - 1
        setCutsceneChapter(TOTAL_CHAPTERS - 1)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onStageLoaded(chapter, stage) {
        chapterRef.current = chapter
        stageRef.current = stage
        saveProgress(chapter, stage)
        setProgress(loadProgress())
      },
    }, chapterRef.current, stageRef.current)

    engineRef.current = engine
    return () => engine.destroy()
  }, [screen]) // only depends on screen

  // ── Render screens ──

  if (screen === 'title') {
    return (
      <TitleScreen
        hasProgress={progress.chapter > 0 || progress.stage > 0}
        onStart={() => startGame(progress.chapter, progress.stage)}
        onChapterSelect={() => setScreen('chapter-select')}
      />
    )
  }

  if (screen === 'chapter-select') {
    return (
      <ChapterSelect
        unlockedChapter={progress.chapter}
        onSelect={(ch) => startGame(ch, ch === progress.chapter ? progress.stage : 0)}
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
