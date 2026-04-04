import type { ChapterConfig } from './types'

// ── Physics ──
export const BALL_SPEED = 900          // pixels/sec (brick-blitz: 900)
export const BALL_RADIUS = 7           // pixels (brick-blitz: 7)
export const MAX_BALLS = 200
export const INITIAL_BALL_COUNT = 3    // start small, grow via items
export const BALL_STAGGER_MS = 35      // ms between each ball (brick-blitz: 35)
export const RECALL_SPEED = 1800       // px/s for ball recall
export const SUBSTEPS = 4              // collision substeps per frame
export const FIXED_DT = 1 / 60        // physics timestep (seconds)
export const TURN_TIMEOUT_S = 10       // force balls down after 10s
export const MIN_AIM_ANGLE = Math.PI * 10 / 180   // 10 degrees
export const MAX_AIM_ANGLE = Math.PI * 170 / 180  // 170 degrees
export const GRAVITY_WELL_RADIUS_CELLS = 2
export const GRAVITY_WELL_FORCE = 10   // force multiplier (× cellSize)
export const GRAVITY_WELL_MIN_DIST = 0.01
export const SHIELD_ARC_DEG = 60
export const SHIELD_ROTATION_PERIOD = 2 // seconds per full rotation

// ── Grid ──
export const GRID_COLS = 8
export const GRID_ROWS = 10
export const BRICK_GAP = 2             // pixels between bricks
export const HUD_HEIGHT_RATIO = 0.05   // 5% of canvas height
export const BRICK_AREA_RATIO = 0.60   // 60% of canvas height
export const LAUNCH_AREA_RATIO = 0.25  // bottom 25%

// ── Visual ──
export const PARTICLE_COUNT = 10       // per brick destroy
export const PARTICLE_SPEED = 200      // pixels/sec
export const PARTICLE_LIFE = 0.5       // seconds
export const PARTICLE_SIZE = 4         // pixels
export const TRAIL_LENGTH = 3          // previous positions
export const SCREEN_SHAKE_INTENSITY = 3 // pixels
export const SCREEN_SHAKE_DURATION = 0.1 // seconds
export const STAR_COUNT = 60

// ── Timing ──
export const STAGE_CLEAR_DELAY = 1.5   // seconds before next stage
export const CHAPTER_CLEAR_DELAY = 2.0 // seconds for "CHAPTER COMPLETE"
export const CHAPTER_FADE_DELAY = 1.0  // seconds fade out
export const GAME_OVER_BUTTON_DELAY = 1.0 // seconds before buttons active
export const GAME_OVER_FADE_DURATION = 0.5
export const TYPEWRITER_MS = 30        // ms per character in cutscene
export const TUTORIAL_FADE_DURATION = 0.5

// ── Responsive ──
export const MAX_CANVAS_WIDTH = 420    // desktop max
export const MIN_TOUCH_TARGET = 44     // pixels

// ── Chapters ──
export const STAGES_PER_CHAPTER = 10
export const TOTAL_CHAPTERS = 5

export const CHAPTERS: ChapterConfig[] = [
  {
    name: '용왕의 명령',
    hpRange: [1, 3],
    itemRate: 0.8,
    specialBrickRate: 0,
    specialBrickTypes: [],
    bgColor: '#0a0a2e',
    brickColor: '#4ecdc4',
    accentColor: '#ff6b6b',
  },
  {
    name: '우주로의 출발',
    hpRange: [3, 8],
    itemRate: 0.6,
    specialBrickRate: 0.15,
    specialBrickTypes: ['gravity-well'],
    bgColor: '#0d0d1a',
    brickColor: '#a29bfe',
    accentColor: '#ffd93d',
  },
  {
    name: '토끼별 도착',
    hpRange: [5, 15],
    itemRate: 0.5,
    specialBrickRate: 0.2,
    specialBrickTypes: ['gravity-well', 'shield'],
    bgColor: '#1a0a2e',
    brickColor: '#6c5ce7',
    accentColor: '#00cec9',
  },
  {
    name: '속임수',
    hpRange: [8, 25],
    itemRate: 0.4,
    specialBrickRate: 0.25,
    specialBrickTypes: ['gravity-well', 'shield', 'splitter'],
    bgColor: '#1a0a0a',
    brickColor: '#e17055',
    accentColor: '#00b894',
  },
  {
    name: '토끼의 역습',
    hpRange: [12, 40],
    itemRate: 0.35,
    specialBrickRate: 0.3,
    specialBrickTypes: ['gravity-well', 'shield', 'splitter'],
    bgColor: '#0a0a0a',
    brickColor: '#fd79a8',
    accentColor: '#fdcb6e',
  },
]
