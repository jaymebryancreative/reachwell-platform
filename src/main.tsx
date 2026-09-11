import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './features/mission/mission.css'
import './features/projects/projects.css'
import { WorkspaceGate } from './features/auth/WorkspaceGate'
import { AuthGate } from './features/auth/AuthGate'
import { ReachWellProvider } from './lib/reachwellContext'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReachWellProvider>
      <AuthGate>
        <WorkspaceGate />
      </AuthGate>
    </ReachWellProvider>
  </StrictMode>
)
