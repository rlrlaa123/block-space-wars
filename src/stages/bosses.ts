import type { Brick } from '../game/types'

export interface BossDefinition {
  bricks: Brick[]
  name: string
}

function boss(
  row: number, col: number,
  w: number, h: number,
  hp: number,
  id: string,
  phase = 0,
): Brick {
  return {
    row, col, hp, maxHp: hp,
    type: 'basic', width: w, height: h,
    flashTimer: 0, dead: false,
    bossId: id, bossPhase: phase,
  }
}

function basicBrick(row: number, col: number, hp: number): Brick {
  return {
    row, col, hp, maxHp: hp,
    type: 'basic', width: 1, height: 1,
    flashTimer: 0, dead: false,
  }
}

function gravityWell(row: number, col: number, hp: number): Brick {
  return {
    row, col, hp, maxHp: hp,
    type: 'gravity-well', width: 1, height: 1,
    flashTimer: 0, dead: false,
  }
}

function shieldBrick(row: number, col: number, hp: number): Brick {
  return {
    row, col, hp, maxHp: hp,
    type: 'shield', width: 1, height: 1,
    flashTimer: 0, dead: false,
    shieldAngle: 0,
  }
}

// Ch.1 Boss: 용왕의 시험 — 3×2, HP 50, static, spawns minions
export function createBoss1(): BossDefinition {
  return {
    name: '용왕의 시험',
    bricks: [
      boss(1, 2, 3, 2, 50, 'dragon-king'),
      // Minion bricks around
      basicBrick(0, 0, 3), basicBrick(0, 1, 3),
      basicBrick(0, 5, 3), basicBrick(0, 6, 3), basicBrick(0, 7, 3),
      basicBrick(3, 0, 2), basicBrick(3, 1, 2),
      basicBrick(3, 6, 2), basicBrick(3, 7, 2),
    ],
  }
}

// Ch.2 Boss: 소행성대 — 3 moving obstacles, HP 30 each
export function createBoss2(): BossDefinition {
  return {
    name: '소행성대',
    bricks: [
      boss(1, 1, 2, 1, 30, 'asteroid-1'),
      boss(3, 3, 2, 1, 30, 'asteroid-2'),
      boss(5, 5, 2, 1, 30, 'asteroid-3'),
      // Debris
      basicBrick(0, 0, 5), basicBrick(0, 7, 5),
      basicBrick(2, 4, 3), basicBrick(4, 2, 3),
    ],
  }
}

// Ch.3 Boss: 경비대장 — 2×2, HP 80, shield orbiting
export function createBoss3(): BossDefinition {
  return {
    name: '경비대장',
    bricks: [
      boss(2, 3, 2, 2, 80, 'guard-captain'),
      shieldBrick(1, 2, 20),
      basicBrick(0, 0, 8), basicBrick(0, 1, 8),
      basicBrick(0, 6, 8), basicBrick(0, 7, 8),
      basicBrick(4, 0, 5), basicBrick(4, 7, 5),
    ],
  }
}

// Ch.4 Boss: 토끼의 의심 — 2×2, HP 100, 2-phase
export function createBoss4(): BossDefinition {
  return {
    name: '토끼의 의심',
    bricks: [
      boss(2, 3, 2, 2, 100, 'suspicious-rabbit'),
      basicBrick(0, 0, 10), basicBrick(0, 1, 10),
      basicBrick(0, 6, 10), basicBrick(0, 7, 10),
      basicBrick(1, 1, 8), basicBrick(1, 6, 8),
      gravityWell(4, 2, 15), gravityWell(4, 5, 15),
    ],
  }
}

// Ch.5 Boss: 토끼 — 3×3, HP 150, 3-phase
export function createBoss5(): BossDefinition {
  return {
    name: '토끼',
    bricks: [
      boss(1, 2, 3, 3, 150, 'final-rabbit'),
      shieldBrick(0, 0, 25), shieldBrick(0, 7, 25),
      gravityWell(4, 1, 20),
      basicBrick(0, 1, 15), basicBrick(0, 6, 15),
      basicBrick(4, 3, 12), basicBrick(4, 4, 12),
      basicBrick(5, 0, 10), basicBrick(5, 7, 10),
    ],
  }
}

export const BOSS_CREATORS = [createBoss1, createBoss2, createBoss3, createBoss4, createBoss5]
