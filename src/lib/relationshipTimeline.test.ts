import { describe, expect, it } from 'vitest'
import { timelineLabel, type RelationshipTimelineRecord } from './relationshipTimeline'

describe('relationship timeline', () => {
  it('uses stable human-readable activity labels', () => {
    expect(timelineLabel('assignment')).toBe('Assignment')
    expect(timelineLabel('need')).toBe('Need')
    expect(timelineLabel('prayer')).toBe('Prayer')
    expect(timelineLabel('follow_up')).toBe('Follow-up')
    expect(timelineLabel('visit')).toBe('Visit')
    expect(timelineLabel('note')).toBe('Note')
  })

  it('keeps timeline records connected to person or household context', () => {
    const record: RelationshipTimelineRecord = {
      organization_id: 'org',
      person_id: 'person',
      household_id: 'household',
      assignment_id: 'assignment',
      source_id: 'source',
      activity_kind: 'visit',
      title: 'Connected',
      detail: 'Visit summary',
      occurred_at: '2026-09-02T12:00:00Z',
      actor_id: 'actor',
      status: 'completed',
    }

    expect(record.person_id).toBe('person')
    expect(record.household_id).toBe('household')
    expect(record.assignment_id).toBe('assignment')
  })
})
