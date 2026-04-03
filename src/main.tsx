import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Prevent pull-to-refresh and other browser gestures
document.addEventListener('touchmove', (e) => {
  if (e.target instanceof HTMLCanvasElement) {
    e.preventDefault()
  }
}, { passive: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
