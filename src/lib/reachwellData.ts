export type ReachwellPerson = { id: string; firstName: string; lastName: string; email?: string; phone?: string; status: 'Active' | 'Archived'; teams: string[] }
export type ReachwellProject = { id: string; name: string; description: string; teams: string[] }

const key = 'reachwell.connected.workspace.v1'

type Store = { people: ReachwellPerson[]; projects: ReachwellProject[] }

const initial: Store = {
  people: [],
  projects: [],
}

export function loadReachwellStore(): Store {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return initial
    const parsed = JSON.parse(saved) as Store
    return { people: parsed.people ?? [], projects: parsed.projects ?? [] }
  } catch {
    return initial
  }
}

export function saveReachwellStore(store: Store) {
  localStorage.setItem(key, JSON.stringify(store))
}
