import { describe, it, expect } from 'vitest'
import { generateStage } from '../generator'

describe('generateStage', () => {
  it('generates non-empty brick layout for each chapter', () => {
    for (let chapter = 0; chapter < 5; chapter++) {
      const stage = generateStage(chapter, 0)
      expect(stage.bricks.length).toBeGreaterThan(0)
      expect(stage.isBoss).toBe(false)
    }
  })

  it('generates boss stage at stage 9', () => {
    for (let chapter = 0; chapter < 5; chapter++) {
      const stage = generateStage(chapter, 9)
      expect(stage.isBoss).toBe(true)
      expect(stage.bricks.length).toBeGreaterThan(0)
    }
  })

  it('uses different templates for different stages', () => {
    const stage0 = generateStage(0, 0)
    const stage1 = generateStage(0, 1)
    // Different template index means different brick count or arrangement
    // (may occasionally match, but layout should differ)
    const s0cols = stage0.bricks.map(b => `${b.row},${b.col}`).sort().join('|')
    const s1cols = stage1.bricks.map(b => `${b.row},${b.col}`).sort().join('|')
    // At least the template pattern should differ
    expect(s0cols).not.toBe(s1cols)
  })

  it('all bricks have positive HP', () => {
    for (let ch = 0; ch < 5; ch++) {
      for (let st = 0; st < 10; st++) {
        const stage = generateStage(ch, st)
        for (const brick of stage.bricks) {
          expect(brick.hp).toBeGreaterThan(0)
        }
      }
    }
  })

  it('bricks stay within grid columns (0-7)', () => {
    for (let ch = 0; ch < 5; ch++) {
      const stage = generateStage(ch, 0)
      for (const brick of stage.bricks) {
        expect(brick.col).toBeGreaterThanOrEqual(0)
        expect(brick.col).toBeLessThan(8)
      }
    }
  })

  it('items have valid types', () => {
    // Run many stages to get at least some items
    let foundItem = false
    for (let ch = 0; ch < 5; ch++) {
      for (let st = 0; st < 9; st++) {
        const stage = generateStage(ch, st)
        for (const item of stage.items) {
          expect(['ball', 'bomb', 'laser', 'multiplier', 'pierce']).toContain(item.type)
          foundItem = true
        }
      }
    }
    // At least one item should have been generated across 45 stages
    expect(foundItem).toBe(true)
  })

  it('special brick types only appear in appropriate chapters', () => {
    // Chapter 0 should have NO special bricks (specialBrickRate = 0)
    const ch0 = generateStage(0, 0)
    for (const brick of ch0.bricks) {
      expect(brick.type).toBe('basic')
    }
  })
})
