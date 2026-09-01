import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './features/mission/mission.css'
import './features/projects/projects.css'
import { AppShell } from './app/AppShell'
import { ReachWellProvider } from './lib/reachwellContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReachWellProvider>
      <AppShell />
    </ReachWellProvider>
  </StrictMode>
)
