import type { Brick, Item, Stage, BrickType } from '../game/types'
import { CHAPTERS, STAGES_PER_CHAPTER } from '../game/constants'
import { TEMPLATES } from './templates'
import { BOSS_CREATORS } from './bosses'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomBrickType(types: BrickType[]): BrickType {
  if (types.length === 0) return 'basic'
  return types[Math.floor(Math.random() * types.length)]
}

export function generateStage(chapter: number, stage: number): Stage {
  const config = CHAPTERS[chapter]
  const isBoss = stage === STAGES_PER_CHAPTER - 1

  if (isBoss) {
    const bossDef = BOSS_CREATORS[chapter]()
    return { bricks: bossDef.bricks, items: [], isBoss: true }
  }

  // Pick template (cycle through, offset by chapter for variety)
  const templateIdx = (stage + chapter * 3) % TEMPLATES.length
  const template = TEMPLATES[templateIdx]

  const bricks: Brick[] = []
  const items: Item[] = []

  // Apply template with chapter params
  for (let row = 0; row < template.length; row++) {
    for (let col = 0; col < template[row].length; col++) {
      if (template[row][col] === 0) continue

      // Determine brick type
      let type: BrickType = 'basic'
      if (Math.random() < config.specialBrickRate) {
        type = randomBrickType(config.specialBrickTypes)
      }

      // HP stays in chapter's low range, no stage multiplier
      const [minHp, maxHp] = config.hpRange
      const hp = Math.min(5, randomInt(minHp, maxHp))

      const brick: Brick = {
        row, col, hp, maxHp: hp,
        type, width: 1, height: 1,
        flashTimer: 0, dead: false,
        shieldAngle: type === 'shield' ? Math.random() * Math.PI * 2 : undefined,
      }
      bricks.push(brick)
    }
  }

  // Guard: if template produced 0 bricks, use wall template
  if (bricks.length === 0) {
    for (let col = 0; col < 8; col++) {
      bricks.push({
        row: 0, col, hp: config.hpRange[0], maxHp: config.hpRange[0],
        type: 'basic', width: 1, height: 1,
        flashTimer: 0, dead: false,
      })
    }
  }

  // Generate items (ball pickups scattered in empty cells)
  if (Math.random() < config.itemRate) {
    // Find an empty column in last template row
    const lastRow = template.length
    const emptyCol = Math.floor(Math.random() * 8)
    items.push({
      row: lastRow,
      col: emptyCol,
      type: 'ball',
      collected: false,
      bonusAmount: 1 + Math.floor(Math.random() * 2), // initial stages give +1-2
    })
  }

  return { bricks, items, isBoss: false }
}
