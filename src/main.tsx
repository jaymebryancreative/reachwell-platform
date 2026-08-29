import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './features/mission/mission.css'
import './features/projects/projects.css'
import { AppShell } from './app/AppShell'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppShell /></StrictMode>
)
