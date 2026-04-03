// Each template is a grid pattern (0 = empty, 1 = brick)
// 8 columns × variable rows. Applied with chapter HP params.

export type StageTemplate = number[][]

// Diamond pattern
const diamond: StageTemplate = [
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
]

const wall: StageTemplate = [
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
]

const zigzag: StageTemplate = [
  [1,1,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0],
  [0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,1,1],
  [0,0,0,0,1,1,0,0],
  [0,0,1,1,0,0,0,0],
]

const corridor: StageTemplate = [
  [1,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,1],
]

const cluster: StageTemplate = [
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
]

const ring: StageTemplate = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1],
]

const checker: StageTemplate = [
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
]

const vShape: StageTemplate = [
  [1,0,0,0,0,0,0,1],
  [0,1,0,0,0,0,1,0],
  [0,0,1,0,0,1,0,0],
  [0,0,0,1,1,0,0,0],
]

const spiral: StageTemplate = [
  [1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,1,0],
  [0,1,1,1,1,0,1,0],
  [0,1,0,0,1,0,1,0],
  [0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,0],
]

const scatter: StageTemplate = [
  [1,0,1,0,0,1,0,1],
  [0,0,0,1,0,0,1,0],
  [0,1,0,0,1,0,0,0],
  [1,0,0,1,0,0,0,1],
  [0,0,1,0,0,1,0,0],
]

export const TEMPLATES: StageTemplate[] = [
  diamond, wall, zigzag, corridor, cluster,
  ring, checker, vShape, spiral, scatter,
]
