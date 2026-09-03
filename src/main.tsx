import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './features/mission/mission.css'
import './features/projects/projects.css'
import { AppShell } from './app/AppShell'
import { AuthGate } from './features/auth/AuthGate'
import { ReachWellProvider } from './lib/reachwellContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReachWellProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </ReachWellProvider>
  </StrictMode>
)
