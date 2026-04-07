import { useState, useRef, useEffect, useCallback } from 'react'
import type { AppScreen } from './game/types'
import { CHAPTERS, TOTAL_CHAPTERS } from './game/constants'
import { STORIES } from './data/story'
import { createEngine } from './game/engine'
import { TitleScreen } from './ui/TitleScreen'
import { ChapterSelect } from './ui/ChapterSelect'
import { Cutscene } from './ui/Cutscene'
// GameOverScreen removed - now rendered on Canvas

// localStorage helpers
const SAVE_KEY = 'bsw_progress'

interface Progress {
  chapter: number
  stage: number
  ballCount: number
}

function loadProgress(): Progress {
  try {
    const val = localStorage.getItem(SAVE_KEY)
    if (val) {
      const parsed = JSON.parse(val)
      return {
        chapter: Math.min(parsed.chapter ?? 0, TOTAL_CHAPTERS - 1),
        stage: parsed.stage ?? 0,
        ballCount: parsed.ballCount ?? 3,
      }
    }
  } catch { /* ignore */ }
  return { chapter: 0, stage: 0, ballCount: 3 }
}

function saveProgress(chapter: number, stage: number, ballCount?: number) {
  try {
    const current = loadProgress()
    const isAhead = chapter > current.chapter || (chapter === current.chapter && stage > current.stage)
    const isSame = chapter === current.chapter && stage === current.stage
    if (isAhead || (isSame && ballCount !== undefined)) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        chapter, stage,
        ballCount: ballCount ?? current.ballCount,
      }))
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
  const ballCountRef = useRef<number | undefined>(undefined)
  // State only for UI screens that need re-render (cutscene)
  const [cutsceneChapter, setCutsceneChapter] = useState(0)
  const [cutsceneType, setCutsceneType] = useState<'prologue' | 'epilogue' | 'interlude'>('prologue')
  const [interludeStage, setInterludeStage] = useState(0)

  const startGame = useCallback((chapter: number, stage = 0, ballCount?: number) => {
    chapterRef.current = chapter
    stageRef.current = stage
    if (ballCount !== undefined) ballCountRef.current = ballCount
    // Only show prologue cutscene on stage 0 (first stage of chapter)
    if (stage === 0) {
      setCutsceneChapter(chapter)
      setCutsceneType('prologue')
      setScreen('cutscene-prologue')
    } else {
      setScreen('game')
    }
  }, [])

  const startGameplay = useCallback(() => {
    setScreen('game')
  }, [])

  // Create engine when entering game screen
  useEffect(() => {
    if (screen !== 'game' || !canvasRef.current) return

    const engine = createEngine(canvasRef.current, {
      onChapterClear(chapter) {
        const bc = engineRef.current?.getBallCount() ?? 3
        ballCountRef.current = bc
        saveProgress(chapter + 1, 0, bc)
        setProgress(loadProgress())
        chapterRef.current = chapter
        setCutsceneChapter(chapter)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onGameOver() {
        // Game over is now rendered on Canvas, no screen change needed
      },
      onGameComplete() {
        saveProgress(TOTAL_CHAPTERS - 1, 9)
        setProgress(loadProgress())
        chapterRef.current = TOTAL_CHAPTERS - 1
        setCutsceneChapter(TOTAL_CHAPTERS - 1)
        setCutsceneType('epilogue')
        setScreen('cutscene-epilogue')
      },
      onRetry() {
        engineRef.current?.retry()
      },
      onMenu() {
        setScreen('chapter-select')
      },
      onStageLoaded(chapter, stage) {
        chapterRef.current = chapter
        stageRef.current = stage
        const bc = engineRef.current?.getBallCount()
        saveProgress(chapter, stage, bc)
        setProgress(loadProgress())
      },
      onStageCleared(chapter, clearedStage) {
        // Check if an interlude exists for the NEXT stage (clearedStage + 1)
        const nextStage = clearedStage + 1
        const interlude = STORIES[chapter]?.interludes?.[nextStage]
        if (!interlude || interlude.length === 0) return false
        // Intercept: save state and show interlude
        const bc = engineRef.current?.getBallCount() ?? 3
        ballCountRef.current = bc
        chapterRef.current = chapter
        stageRef.current = nextStage
        saveProgress(chapter, nextStage, bc)
        setProgress(loadProgress())
        setCutsceneChapter(chapter)
        setInterludeStage(nextStage)
        setCutsceneType('interlude')
        setScreen('cutscene-interlude')
        return true
      },
    }, chapterRef.current, stageRef.current, ballCountRef.current ?? loadProgress().ballCount)

    engineRef.current = engine
    return () => engine.destroy()
  }, [screen]) // only depends on screen

  // ── Render screens ──

  if (screen === 'title') {
    return (
      <TitleScreen
        hasProgress={progress.chapter > 0 || progress.stage > 0}
        onStart={() => startGame(progress.chapter, progress.stage, progress.ballCount)}
        onChapterSelect={() => setScreen('chapter-select')}
        onReset={() => {
          try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
          ballCountRef.current = undefined
          setProgress({ chapter: 0, stage: 0, ballCount: 3 })
          startGame(0, 0)
        }}
      />
    )
  }

  if (screen === 'chapter-select') {
    return (
      <ChapterSelect
        unlockedChapter={progress.chapter}
        unlockedStage={progress.stage}
        onSelect={(ch, stage) => startGame(ch, stage, ch === progress.chapter ? progress.ballCount : undefined)}
        onBack={() => setScreen('title')}
      />
    )
  }

  if (screen === 'cutscene-prologue' || screen === 'cutscene-epilogue' || screen === 'cutscene-interlude') {
    const story = STORIES[cutsceneChapter]
    const chapter = CHAPTERS[cutsceneChapter]
    const screens = cutsceneType === 'prologue'
      ? story.prologue
      : cutsceneType === 'epilogue'
        ? story.epilogue
        : (story.interludes?.[interludeStage] ?? [])
    return (
      <Cutscene
        screens={screens}
        bgColor={chapter.bgColor}
        accentColor={chapter.accentColor}
        onComplete={() => {
          if (cutsceneType === 'prologue') {
            startGameplay()
          } else if (cutsceneType === 'interlude') {
            // Resume gameplay on the next stage
            setScreen('game')
          } else if (cutsceneChapter >= TOTAL_CHAPTERS - 1) {
            setScreen('title')
          } else {
            startGame(cutsceneChapter + 1)
          }
        }}
      />
    )
  }

  // Game screen (game-over is now rendered on Canvas, not React overlay)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', margin: '0 auto', touchAction: 'none' }}
      />
    </div>
  )
}
