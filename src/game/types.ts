// ── Core game types ──

export type BrickType = 'basic' | 'gravity-well' | 'shield' | 'splitter'
export type ItemType = 'ball' | 'bomb' | 'laser' | 'multiplier' | 'pierce'

export type GamePhase =
  | 'idle'
  | 'aiming'
  | 'firing'
  | 'turn-end'
  | 'stage-clear'
  | 'game-over'

export type AppScreen =
  | 'title'
  | 'chapter-select'
  | 'cutscene-prologue'
  | 'game'
  | 'cutscene-epilogue'
  | 'game-over'
  | 'ending'

export interface Vec2 {
  x: number
  y: number
}

export interface Ball {
  pos: Vec2
  vel: Vec2
  radius: number
  landed: boolean
  trail: Vec2[] // last 3 positions for motion blur
}

export interface Brick {
  row: number
  col: number
  hp: number
  maxHp: number
  type: BrickType
  // For multi-cell bosses
  width: number  // in cells
  height: number // in cells
  // Shield-specific
  shieldAngle?: number // current rotation angle (radians)
  // Boss-specific
  bossPhase?: number
  bossId?: string
  // Visual
  flashTimer: number // frames remaining for hit flash
  dead: boolean
}

export interface Item {
  row: number
  col: number
  type: ItemType
  collected: boolean
  bonusAmount?: number  // for ball items: how many balls to add
}

export interface Particle {
  pos: Vec2
  vel: Vec2
  life: number    // remaining life (0-1)
  maxLife: number
  size: number
  color: string
}

export interface HitResult {
  destroyed: boolean
  spawnBricks?: Brick[]  // splitter spawns
  spawnItems?: Item[]
}

export interface DestroyEffect {
  particles: Particle[]
}

export interface Stage {
  bricks: Brick[]
  items: Item[]
  isBoss: boolean
}

export interface ChapterConfig {
  name: string
  hpRange: [number, number]
  itemRate: number          // 0-1, chance of item per row
  specialBrickRate: number  // 0-1, chance of special brick
  specialBrickTypes: BrickType[]
  bgColor: string
  brickColor: string
  accentColor: string
}

export interface BrickBehavior {
  onUpdate(brick: Brick, balls: Ball[], dt: number): void
  onHit(brick: Brick, ball: Ball): HitResult
  onDestroy(brick: Brick, cellSize: number): DestroyEffect
  render(ctx: CanvasRenderingContext2D, brick: Brick, x: number, y: number, w: number, h: number): void
}

export interface GameState {
  phase: GamePhase
  balls: Ball[]
  bricks: Brick[]
  items: Item[]
  particles: Particle[]
  ballCount: number
  launchX: number       // x position for next launch
  aimAngle: number      // current aim angle (radians)
  turnTimer: number     // seconds since firing started (for timeout)
  currentChapter: number // 0-4
  currentStage: number   // 0-9 (0-8 normal, 9 boss)
  isBossStage: boolean
  score: number
  firstLandedX: number | null // x of first ball to land this turn
  showTutorial: boolean
  // Stage clear / chapter clear animation
  clearTimer: number
  chapterClearTimer: number
}

export interface ScreenShake {
  intensity: number  // pixels
  duration: number   // seconds remaining
  offsetX: number
  offsetY: number
}
