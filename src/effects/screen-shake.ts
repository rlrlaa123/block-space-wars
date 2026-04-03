// Decay-based screen shake (brick-blitz style)
// Intensity decays by *= 0.88 per frame for smooth falloff

export interface ScreenShake {
  intensity: number
  offsetX: number
  offsetY: number
}

export function createScreenShake(): ScreenShake {
  return { intensity: 0, offsetX: 0, offsetY: 0 }
}

export function triggerShake(shake: ScreenShake, amount: number) {
  shake.intensity = Math.min(shake.intensity + amount, 12)
}

export function updateShake(shake: ScreenShake) {
  if (shake.intensity < 0.3) {
    shake.intensity = 0
    shake.offsetX = 0
    shake.offsetY = 0
    return
  }
  shake.offsetX = (Math.random() - 0.5) * shake.intensity * 2
  shake.offsetY = (Math.random() - 0.5) * shake.intensity * 2
  shake.intensity *= 0.88
}
