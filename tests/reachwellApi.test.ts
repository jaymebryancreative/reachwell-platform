import { describe, expect, it } from 'vitest'
import { normalizeTeamMemberships } from '../src/lib/reachwellApi'

describe('normalizeTeamMemberships', () => {
  it('normalizes Supabase joined people records to a single person per membership', () => {
    const records = normalizeTeamMemberships([{
      id: 'membership-1',
      person_id: 'person-1',
      team_id: 'team-1',
      role: 'coordinator',
      is_leader: true,
      joined_at: '2026-08-31T00:00:00.000Z',
      ended_at: null,
      person: [{ id: 'person-1', first_name: 'Ada', last_name: 'Lovelace', preferred_name: null }],
    }])

    expect(records).toEqual([expect.objectContaining({
      person: { id: 'person-1', first_name: 'Ada', last_name: 'Lovelace', preferred_name: null },
      role: 'coordinator',
      is_leader: true,
    })])
  })

  it('keeps an unlinked membership readable rather than throwing', () => {
    const records = normalizeTeamMemberships([{
      id: 'membership-2',
      person_id: 'removed-person',
      team_id: 'team-1',
      role: 'member',
      is_leader: false,
      joined_at: '2026-08-31T00:00:00.000Z',
      ended_at: null,
      person: [],
    }])

    expect(records[0].person).toBeNull()
  })
})
