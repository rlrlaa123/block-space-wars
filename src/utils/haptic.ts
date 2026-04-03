// Haptic feedback for mobile
const HAPTIC_KEY = 'bsw_haptic'

let enabled = true
try {
  enabled = localStorage.getItem(HAPTIC_KEY) !== 'off'
} catch { /* ignore */ }

export function hapticLight() {
  if (enabled && navigator.vibrate) navigator.vibrate(10)
}

export function hapticMedium() {
  if (enabled && navigator.vibrate) navigator.vibrate(25)
}

export function hapticHeavy() {
  if (enabled && navigator.vibrate) navigator.vibrate(50)
}

export function toggleHaptic(): boolean {
  enabled = !enabled
  try { localStorage.setItem(HAPTIC_KEY, enabled ? 'on' : 'off') } catch { /* ignore */ }
  return enabled
}
