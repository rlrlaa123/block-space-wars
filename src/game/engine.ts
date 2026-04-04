import type { GameState, ScreenShake } from './types'
import type { LayoutInfo } from './physics'
import { computeLayout, physicsUpdate, brickRect } from './physics'
import { render } from './renderer'
import { setupInput } from './input'
import {
  createInitialState, startAiming, updateAim, fire,
  updateFiring, endTurn, advanceStage, recallBalls,
} from './state'
import {
  spawnBrickBreak, spawnHitSpark, spawnHitRing,
  spawnDestroyGlow, spawnBackgroundWave, spawnFloorImpact,
  spawnComboText, spawnConfetti, spawnCollectBurst,
  updateAllEffects, clearAllEffects,
} from '../effects/particles'
import { createScreenShake, triggerShake, updateShake } from '../effects/screen-shake'
import { hapticLight, hapticMedium, hapticHeavy } from '../utils/haptic'
import { generateStage } from '../stages/generator'
import {
  CHAPTERS, FIXED_DT, STAGE_CLEAR_DELAY, GAME_OVER_FADE_DURATION,
  BALL_RADIUS, BALL_SPEED, MAX_BALLS,
} from './constants'

export interface EngineCallbacks {
  onChapterClear: (chapter: number) => void
  onGameOver: () => void
  onGameComplete: () => void
  onStageLoaded: (chapter: number, stage: number) => void
}

export function createEngine(
  canvas: HTMLCanvasElement,
  callbacks: EngineCallbacks,
  startChapter = 0,
  startStage = 0,
) {
  const ctx = canvas.getContext('2d')!
  const state: GameState = createInitialState()
  const shake: ScreenShake = createScreenShake()

  state.currentChapter = startChapter
  state.currentStage = startStage

  let accumulator = 0
  let lastTime = 0
  let running = true
  let gameTime = 0
  let gameOverAlpha = 0

  // Combo system
  let comboCount = 0
  let comboTimer = 0
  const COMBO_WINDOW = 0.5

  // Background flash
  let bgFlashAlpha = 0

  // Slowmo
  let timeScale = 1
  let slowmoTimer = 0

  // Fast-forward
  let firingElapsed = 0

  // Resize first
  const w = Math.min(window.innerWidth, 420)
  const h = window.innerHeight
  canvas.width = w * devicePixelRatio
  canvas.height = h * devicePixelRatio
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx.scale(devicePixelRatio, devicePixelRatio)
  let layout: LayoutInfo = computeLayout(w, h)
  state.launchX = w / 2

  const loadStage = () => {
    const stage = generateStage(state.currentChapter, state.currentStage)
    state.bricks = stage.bricks
    state.items = stage.items
    state.isBossStage = stage.isBoss
    state.phase = 'idle'
    state.balls = []
    state.clearTimer = 0
    state.chapterClearTimer = 0
    gameOverAlpha = 0
    comboCount = 0
    comboTimer = 0
    bgFlashAlpha = 0
    timeScale = 1
    slowmoTimer = 0
    firingElapsed = 0
    clearAllEffects()
    callbacks.onStageLoaded(state.currentChapter, state.currentStage)
  }

  loadStage()

  function resize() {
    const w = Math.min(window.innerWidth, 420)
    const h = window.innerHeight
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)
    layout = computeLayout(w, h)
    state.launchX = Math.max(10, Math.min(w - 10, state.launchX || w / 2))
  }
  window.addEventListener('resize', resize)

  // Input
  const cleanupInput = setupInput(
    canvas,
    () => state.launchX,
    () => layout.launchY,
    (angle) => startAiming(state, angle),
    (angle) => updateAim(state, angle),
    () => { fire(state); firingElapsed = 0 },
    // Recall button handler: called when tap is in bottom area during firing
    () => {
      if (state.phase === 'firing') recallBalls(state, layout.launchY)
    },
  )

  // Game loop
  function loop(timestamp: number) {
    if (!running) return

    if (lastTime === 0) lastTime = timestamp
    const rawDt = Math.min((timestamp - lastTime) / 1000, 0.05)
    lastTime = timestamp
    gameTime += rawDt

    const dt = rawDt * timeScale
    accumulator += dt

    while (accumulator >= FIXED_DT) {
      update(FIXED_DT)
      accumulator -= FIXED_DT
    }

    const chapter = CHAPTERS[state.currentChapter]
    render(
      ctx, state, layout, shake,
      chapter.bgColor, chapter.brickColor, chapter.accentColor,
      chapter.name, gameTime, gameOverAlpha, bgFlashAlpha, timeScale,
    )

    requestAnimationFrame(loop)
  }

  function update(dt: number) {
    updateAllEffects(dt)
    updateShake(shake)

    // Decay background flash
    if (bgFlashAlpha > 0) bgFlashAlpha = Math.max(0, bgFlashAlpha - dt * 6)

    // Decay slowmo
    if (slowmoTimer > 0) {
      slowmoTimer -= dt
      if (slowmoTimer <= 0) timeScale = 1
    }

    // Combo timer
    if (comboTimer > 0) {
      comboTimer -= dt
      if (comboTimer <= 0) comboCount = 0
    }

    if (state.phase === 'firing') {
      firingElapsed += dt

      // Fast-forward after long shooting
      if (firingElapsed > 10 && timeScale === 1) timeScale = 2
      if (firingElapsed > 20 && timeScale < 4) timeScale = 4

      // Physics
      const destroyed = physicsUpdate(state.balls, state.bricks, layout, dt)
      const chapter = CHAPTERS[state.currentChapter]

      // Process destroyed bricks
      if (destroyed.length > 0) {
        // Slowmo on multi-kill
        if (destroyed.length >= 3) {
          timeScale = 0.3
          slowmoTimer = 0.1
        }

        for (const brick of destroyed) {
          const rect = brickRect(brick, layout)

          // Full visual feedback stack:
          spawnBrickBreak(rect.x, rect.y, rect.w, rect.h, chapter.accentColor)
          spawnDestroyGlow(rect.x, rect.y, rect.w, rect.h, chapter.accentColor)
          spawnBackgroundWave(rect.x + rect.w / 2, rect.y + rect.h / 2)

          // Combo
          comboCount++
          comboTimer = COMBO_WINDOW
          if (comboCount >= 2) spawnComboText(comboCount)

          // Combo-scaled shake + haptic
          if (comboCount >= 10) {
            triggerShake(shake, 8)
            bgFlashAlpha = 0.15
            hapticHeavy()
          } else if (comboCount >= 5) {
            triggerShake(shake, 4)
            bgFlashAlpha = 0.08
            hapticMedium()
          } else {
            triggerShake(shake, destroyed.length > 1 ? 3 : 1.5)
            hapticLight()
          }

          // Adjacent brick bright flash
          for (const other of state.bricks) {
            if (other.dead) continue
            if (Math.abs(other.row - brick.row) <= 1 && Math.abs(other.col - brick.col) <= 1) {
              other.flashTimer = Math.max(other.flashTimer, 4)
            }
          }
        }
      }

      // Hit sparks for non-destroying hits
      for (const ball of state.balls) {
        if (ball.landed || ball.pos.y < -900) continue
        for (const brick of state.bricks) {
          if (brick.dead || brick.flashTimer !== 3) continue // flashTimer 3 = just hit
          const rect = brickRect(brick, layout)
          spawnHitSpark(ball.pos.x, ball.pos.y, CHAPTERS[state.currentChapter].accentColor)
          spawnHitRing(ball.pos.x, ball.pos.y, CHAPTERS[state.currentChapter].brickColor)
          break
        }
      }

      // Item collection on ball contact (balls pass through items)
      for (const item of state.items) {
        if (item.collected) continue
        const ix = layout.cellSize / 2 + item.col * (layout.cellSize + 2) + 2
        const iy = layout.gridOffsetY + item.row * (layout.cellSize + 2) + layout.cellSize / 2
        const itemRadius = layout.cellSize * 0.3
        for (const ball of state.balls) {
          if (ball.landed || ball.pos.y < -900) continue
          const dx = ball.pos.x - ix
          const dy = ball.pos.y - iy
          if (dx * dx + dy * dy < (itemRadius + BALL_RADIUS) * (itemRadius + BALL_RADIUS)) {
            item.collected = true
            hapticLight()

            switch (item.type) {
              case 'ball': {
                const bonus = item.bonusAmount ?? 1
                state.ballCount = Math.min(state.ballCount + bonus, MAX_BALLS)
                spawnCollectBurst(ix, iy, '#4caf50')
                break
              }
              case 'bomb': {
                // AoE: destroy all bricks within 2 cells
                spawnCollectBurst(ix, iy, '#e74c3c')
                hapticHeavy()
                for (const brick of state.bricks) {
                  if (brick.dead) continue
                  if (Math.abs(brick.row - item.row) <= 2 && Math.abs(brick.col - item.col) <= 2) {
                    brick.hp = 0
                    brick.dead = true
                    const rect = brickRect(brick, layout)
                    spawnBrickBreak(rect.x, rect.y, rect.w, rect.h, chapter.accentColor)
                    spawnDestroyGlow(rect.x, rect.y, rect.w, rect.h, chapter.accentColor)
                  }
                }
                triggerShake(shake, 8)
                bgFlashAlpha = 0.2
                break
              }
              case 'laser': {
                // Horizontal + vertical beam: destroy all bricks in same row and col
                spawnCollectBurst(ix, iy, '#3498db')
                hapticMedium()
                for (const brick of state.bricks) {
                  if (brick.dead) continue
                  if (brick.row === item.row || brick.col === item.col) {
                    brick.hp = 0
                    brick.dead = true
                    const rect = brickRect(brick, layout)
                    spawnBrickBreak(rect.x, rect.y, rect.w, rect.h, '#3498db')
                    spawnDestroyGlow(rect.x, rect.y, rect.w, rect.h, '#3498db')
                  }
                }
                triggerShake(shake, 6)
                bgFlashAlpha = 0.15
                break
              }
              case 'multiplier': {
                // Spawn 3 extra balls at the collection point
                spawnCollectBurst(ix, iy, '#f1c40f')
                for (let m = 0; m < 3; m++) {
                  const angle = (Math.PI / 4) + (Math.PI / 2) * (m / 2)
                  state.balls.push({
                    pos: { x: ix, y: iy },
                    vel: { x: Math.cos(angle) * BALL_SPEED, y: -Math.sin(angle) * BALL_SPEED },
                    radius: BALL_RADIUS,
                    landed: false,
                    trail: [],
                  })
                }
                break
              }
              case 'pierce': {
                // Make the collecting ball pierce through bricks for 3 seconds
                // (simplified: deal 999 damage on next 5 brick hits)
                spawnCollectBurst(ix, iy, '#9b59b6')
                // Mark this ball as piercing by boosting its velocity slightly
                // and temporarily making it ignore brick collision reflection
                // Simple approach: destroy 5 nearest bricks instantly
                const aliveBricks = state.bricks
                  .filter(b => !b.dead)
                  .map(b => ({
                    brick: b,
                    dist: Math.abs(b.row - item.row) + Math.abs(b.col - item.col),
                  }))
                  .sort((a, b) => a.dist - b.dist)
                  .slice(0, 5)
                for (const { brick } of aliveBricks) {
                  brick.hp = 0
                  brick.dead = true
                  const rect = brickRect(brick, layout)
                  spawnBrickBreak(rect.x, rect.y, rect.w, rect.h, '#9b59b6')
                }
                triggerShake(shake, 4)
                break
              }
            }
            break
          }
        }
      }
      state.items = state.items.filter(i => !i.collected)

      // Update trails
      for (const ball of state.balls) {
        if (!ball.landed && ball.pos.y > -900) {
          ball.trail.push({ x: ball.pos.x, y: ball.pos.y })
          if (ball.trail.length > 8) ball.trail.shift()
        }
      }

      // Check ball landing for floor impact
      for (const ball of state.balls) {
        if (ball.landed && ball.trail.length > 0) {
          spawnFloorImpact(ball.pos.x)
          ball.trail = []
        }
      }

      // Update firing state
      const { phaseDone } = updateFiring(state, dt, layout.launchY)
      if (phaseDone) {
        timeScale = 1
        firingElapsed = 0
        const result = endTurn(state)
        if (result === 'game-over') {
          callbacks.onGameOver()
        }
      }
    }

    if (state.phase === 'stage-clear') {
      state.clearTimer += dt
      // Spawn confetti on first frame
      if (state.clearTimer < dt * 2) spawnConfetti(layout.canvasW)
      if (state.clearTimer >= STAGE_CLEAR_DELAY) {
        const result = advanceStage(state)
        if (result === 'game-complete') {
          callbacks.onGameComplete()
        } else if (result === 'chapter-clear') {
          state.chapterClearTimer = 0
          state.phase = 'idle'
          callbacks.onChapterClear(state.currentChapter - 1)
        } else {
          loadStage()
        }
      }
    }

    if (state.phase === 'game-over') {
      gameOverAlpha = Math.min(1, gameOverAlpha + dt / GAME_OVER_FADE_DURATION)
    }
  }

  requestAnimationFrame(loop)

  return {
    destroy() {
      running = false
      window.removeEventListener('resize', resize)
      cleanupInput()
    },
    getState() { return state },
    loadStage,
    resize,
    retry() {
      gameOverAlpha = 0
      loadStage()
    },
  }
}
