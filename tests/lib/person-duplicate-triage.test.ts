import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  analyzePersonNameDuplicates,
  classifyPersonDuplicateGroup,
  isSafeAutomaticPersonDuplicateMerge,
} from '../../src/lib/person-duplicate-triage'

describe('person duplicate triage', () => {
  it('classifies rich profile plus BRREG role on the same company as a merge candidate', () => {
    const result = classifyPersonDuplicateGroup(
      {
        key: 'gustav witzøe',
        label: 'Gustav Witzøe',
        ids: ['rich', 'brreg'],
      },
      new Map([
        ['rich', {
          id: 'rich',
          name: 'Gustav Witzøe',
          personKey: 'gustav-witze',
          tags: ['seafood', 'family-owner'],
          biography: 'Founder and owner profile.',
          roles: [
            { companyId: 'salmar', companyName: 'SalMar ASA', role: 'styreleder' },
            { companyName: 'Kverva AS', role: 'styreleder' },
          ],
        }],
        ['brreg', {
          id: 'brreg',
          name: 'Gustav Witzøe',
          personKey: 'gustav-witzo',
          tags: ['brreg-role', 'styrets-leder'],
          biography: null,
          roles: [
            { companyId: 'salmar', companyName: 'SalMar ASA', role: 'Styrets leder' },
          ],
        }],
      ]),
    )

    assert.equal(result.action, 'merge_candidate')
    assert.equal(result.canonicalId, 'rich')
    assert.equal(result.canonicalPersonKey, 'gustav-witzo')
    assert.deepEqual(result.sharedCompanyKeys, ['salmar'])
  })

  it('prefers a BRREG role row over a thin stub when both point at the same company', () => {
    const result = classifyPersonDuplicateGroup(
      {
        key: 'jan paul bjørkøy',
        label: 'Jan Paul Bjørkøy',
        ids: ['brreg', 'stub'],
      },
      new Map([
        ['brreg', {
          id: 'brreg',
          name: 'Jan Paul Bjørkøy',
          personKey: 'jan-paul-bjorkoy',
          tags: ['brreg-role', 'styremedlem'],
          roles: [{ companyId: 'asko', companyName: 'ASKO Norge AS', role: 'Styremedlem' }],
        }],
        ['stub', {
          id: 'stub',
          name: 'Jan Paul Bjørkøy',
          personKey: 'jan-paul-bjrky',
          tags: ['stub'],
          roles: [{ companyId: 'asko', companyName: 'ASKO Norge AS', role: 'styremedlem' }],
        }],
      ]),
    )

    assert.equal(result.action, 'merge_candidate')
    assert.equal(result.canonicalId, 'brreg')
    assert.equal(result.canonicalPersonKey, 'jan-paul-bjorkoy')
  })

  it('requires review when same-name profiles point at different companies', () => {
    const result = classifyPersonDuplicateGroup(
      {
        key: 'monica ødegaard',
        label: 'Monica Ødegaard',
        ids: ['norway', 'denmark'],
      },
      new Map([
        ['norway', {
          id: 'norway',
          name: 'Monica Ødegaard',
          personKey: 'monica-odegard',
          tags: ['brreg-role', 'styremedlem'],
          roles: [{ companyId: 'rema-no', companyName: 'REMA 1000 Norge AS', role: 'Styremedlem' }],
        }],
        ['denmark', {
          id: 'denmark',
          name: 'Monica Ødegaard',
          personKey: 'monica-degaard',
          tags: ['stub'],
          roles: [{ companyId: 'rema-dk', companyName: 'REMA 1000 A/S', role: 'bestyrelsesmedlem' }],
        }],
      ]),
    )

    assert.equal(result.action, 'review_required')
    assert.equal(result.canonicalPersonKey, 'monica-odegard')
    assert.deepEqual(result.sharedCompanyKeys, [])
  })

  it('blocks automatic merge when duplicate-name profiles lack shared company evidence', () => {
    const group = {
      key: 'monica ødegaard',
      label: 'Monica Ødegaard',
      ids: ['norway', 'denmark'],
    }
    const profiles = [
      {
        id: 'norway',
        name: 'Monica Ødegaard',
        personKey: 'monica-odegard',
        tags: ['brreg-role', 'styremedlem'],
        roles: [{ companyId: 'rema-no', companyName: 'REMA 1000 Norge AS', role: 'Styremedlem' }],
      },
      {
        id: 'denmark',
        name: 'Monica Ødegaard',
        personKey: 'monica-degaard',
        tags: ['stub'],
        roles: [{ companyId: 'rema-dk', companyName: 'REMA 1000 A/S', role: 'bestyrelsesmedlem' }],
      },
    ]

    assert.equal(isSafeAutomaticPersonDuplicateMerge(group, profiles), false)
  })

  it('summarizes merge candidates and review-required groups separately', () => {
    const groups = [
      { key: 'a', label: 'A', ids: ['a1', 'a2'] },
      { key: 'b', label: 'B', ids: ['b1', 'b2'] },
    ]
    const profiles = [
      { id: 'a1', name: 'A', personKey: 'a1', tags: ['brreg-role'], roles: [{ companyId: 'x', companyName: 'X', role: 'Styremedlem' }] },
      { id: 'a2', name: 'A', personKey: 'a2', tags: ['stub'], roles: [{ companyId: 'x', companyName: 'X', role: 'styremedlem' }] },
      { id: 'b1', name: 'B', personKey: 'b1', tags: ['brreg-role'], roles: [{ companyId: 'y', companyName: 'Y', role: 'Styremedlem' }] },
      { id: 'b2', name: 'B', personKey: 'b2', tags: ['stub'], roles: [{ companyId: 'z', companyName: 'Z', role: 'styremedlem' }] },
    ]

    assert.deepEqual(analyzePersonNameDuplicates(groups, profiles), {
      total: 2,
      mergeCandidates: 1,
      reviewRequired: 1,
      byAction: {
        merge_candidate: 1,
        review_required: 1,
      },
      samples: [
        {
          key: 'b',
          label: 'B',
          ids: ['b1', 'b2'],
          action: 'review_required',
          canonicalId: 'b1',
          canonicalPersonKey: 'b',
          sharedCompanyKeys: [],
          rationale: 'Duplicate-name profiles do not share company evidence; avoid automatic merge.',
        },
        {
          key: 'a',
          label: 'A',
          ids: ['a1', 'a2'],
          action: 'merge_candidate',
          canonicalId: 'a1',
          canonicalPersonKey: 'a',
          sharedCompanyKeys: ['x'],
          rationale: 'Duplicate-name profiles share company evidence and can be consolidated after provenance-preserving merge.',
        },
      ],
    })
  })
})
