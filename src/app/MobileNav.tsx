import { CalendarDays, HeartPulse, MapPinned, MoreHorizontal, Users } from 'lucide-react'

type MobileView = 'today' | 'people' | 'mission' | 'relationships' | 'home'

export function MobileNav({ view, onNavigate }: { view: string; onNavigate: (view: MobileView) => void }) {
  const items: { id: MobileView; label: string; icon: typeof CalendarDays }[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'people', label: 'People', icon: Users },
    { id: 'mission', label: 'Mission', icon: MapPinned },
    { id: 'relationships', label: 'Care', icon: HeartPulse },
    { id: 'home', label: 'More', icon: MoreHorizontal },
  ]
  return <nav className="rw-mobile-nav" aria-label="Quick navigation">{items.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'is-active' : ''} onClick={() => onNavigate(id)}><Icon size={19} strokeWidth={2.2}/><span>{label}</span></button>)}</nav>
}
