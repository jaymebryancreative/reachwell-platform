import { CalendarDays, Home, MapPinned, MoreHorizontal, Users } from 'lucide-react'

type MobileView = 'home' | 'people' | 'mission' | 'events'

export function MobileNav({ view, onNavigate, onMore }: { view: string; onNavigate: (view: MobileView) => void; onMore: () => void }) {
  const items: { id: MobileView; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'people', label: 'People', icon: Users },
    { id: 'mission', label: 'Mission', icon: MapPinned },
    { id: 'events', label: 'Events', icon: CalendarDays },
  ]

  return <nav className="rw-mobile-nav" aria-label="Quick navigation">
    {items.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'is-active' : ''} onClick={() => onNavigate(id)}><Icon size={19} strokeWidth={2.2}/><span>{label}</span></button>)}
    <button onClick={onMore} aria-label="Open more ReachWell tools"><MoreHorizontal size={19} strokeWidth={2.2}/><span>More</span></button>
  </nav>
}
