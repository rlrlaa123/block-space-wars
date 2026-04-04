import { MIN_AIM_ANGLE, MAX_AIM_ANGLE } from './constants'

export interface InputState {
  isDragging: boolean
  aimAngle: number
  touchId: number | null  // track first touch only
}

export function createInputState(): InputState {
  return { isDragging: false, aimAngle: Math.PI / 2, touchId: null }
}

function calcAngle(startX: number, startY: number, curX: number, curY: number): number {
  const dx = curX - startX
  const dy = startY - curY // inverted because canvas y-down
  let angle = Math.atan2(dy, dx)
  // Clamp
  if (angle < MIN_AIM_ANGLE) angle = MIN_AIM_ANGLE
  if (angle > MAX_AIM_ANGLE) angle = MAX_AIM_ANGLE
  return angle
}

export function setupInput(
  canvas: HTMLCanvasElement,
  launchXFn: () => number,
  launchYFn: () => number,
  onAimStart: (angle: number) => void,
  onAimUpdate: (angle: number) => void,
  onFire: () => void,
  onRecall?: () => void,
) {
  const input = createInputState()

  // Convert client coords to canvas logical coords
  function toCanvasCoords(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function handleStart(clientX: number, clientY: number) {
    const pos = toCanvasCoords(clientX, clientY)

    // Check recall button area (bottom 60px of canvas)
    const rect = canvas.getBoundingClientRect()
    const canvasH = rect.height
    if (pos.y > canvasH - 60 && onRecall) {
      onRecall()
      return
    }

    const angle = calcAngle(launchXFn(), launchYFn(), pos.x, pos.y)
    input.aimAngle = angle
    input.isDragging = true
    onAimStart(angle)
  }

  function handleMove(clientX: number, clientY: number) {
    const pos = toCanvasCoords(clientX, clientY)
    const angle = calcAngle(launchXFn(), launchYFn(), pos.x, pos.y)
    input.aimAngle = angle
    onAimUpdate(angle)
  }

  // ── Touch events ──
  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    if (input.touchId !== null) return
    const touch = e.changedTouches[0]
    input.touchId = touch.identifier
    handleStart(touch.clientX, touch.clientY)
  }
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === input.touchId) {
        handleMove(touch.clientX, touch.clientY)
        break
      }
    }
  }
  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === input.touchId) {
        input.touchId = null
        input.isDragging = false
        onFire()
        break
      }
    }
  }
  const onTouchCancel = () => {
    input.touchId = null
    input.isDragging = false
  }

  canvas.addEventListener('touchstart', onTouchStart, { passive: false })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: false })
  canvas.addEventListener('touchcancel', onTouchCancel)

  // ── Mouse events (desktop) ──
  let mouseDown = false

  const onMouseDown = (e: MouseEvent) => {
    mouseDown = true
    handleStart(e.clientX, e.clientY)
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!mouseDown) return
    handleMove(e.clientX, e.clientY)
  }
  const onMouseUp = () => {
    if (!mouseDown) return
    mouseDown = false
    input.isDragging = false
    onFire()
  }

  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseup', onMouseUp)

  // Return cleanup function
  return () => {
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchmove', onTouchMove)
    canvas.removeEventListener('touchend', onTouchEnd)
    canvas.removeEventListener('touchcancel', onTouchCancel)
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseup', onMouseUp)
  }
}
