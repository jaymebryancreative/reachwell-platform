import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './features/mission/mission.css'
import { MissionMode } from './features/mission/MissionMode'

createRoot(document.getElementById('root')!).render(
  <StrictMode><MissionMode /></StrictMode>
)
