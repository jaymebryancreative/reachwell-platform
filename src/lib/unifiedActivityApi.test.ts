import { describe, expect, it } from 'vitest'
import { activityTitle, type UnifiedActivityRecord } from './unifiedActivityApi'

describe('unified activity', () => {
  it('preserves meaningful titles', () => {
    expect(activityTitle({ title: 'Door visit', activity_kind: 'visit' })).toBe('Door visit')
  })

  it('provides stable fallbacks for untitled activity', () => {
    const kinds: UnifiedActivityRecord['activity_kind'][] = ['assignment', 'visit', 'note', 'need', 'prayer', 'follow_up']
    expect(kinds.map(activity_kind => activityTitle({ title: '', activity_kind }))).toEqual([
      'Outreach assignment', 'Outreach visit', 'Field note', 'Need', 'Prayer request', 'Follow-up',
    ])
  })
})
