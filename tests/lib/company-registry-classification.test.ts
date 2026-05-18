import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { classifyCompanyRegistryStatus } from '../../src/lib/company-registry-classification'

describe('company registry classification', () => {
  it('classifies Norwegian nine-digit org numbers as Bronnoysund records', () => {
    assert.deepEqual(classifyCompanyRegistryStatus('987565922', 'NO'), {
      isResearchConstruct: false,
      orgNrFormat: 'bronnoysund',
      registrySource: null,
    })
  })

  it('keeps Nordic prefixed identifiers distinct from research constructs', () => {
    assert.deepEqual(classifyCompanyRegistryStatus('SE-556542-5353', 'SE'), {
      isResearchConstruct: false,
      orgNrFormat: 'nordic_prefix',
      registrySource: null,
    })
  })

  it('flags synthetic Norwegian identifiers as research constructs', () => {
    assert.deepEqual(classifyCompanyRegistryStatus('NO-JJ-EIE', 'NO'), {
      isResearchConstruct: true,
      orgNrFormat: 'research_construct',
      registrySource: null,
    })
  })

  it('marks empty or unrecognized identifiers as unknown', () => {
    assert.deepEqual(classifyCompanyRegistryStatus('', 'NO'), {
      isResearchConstruct: false,
      orgNrFormat: 'unknown',
      registrySource: null,
    })
  })
})
