import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { displayLaneFromReviewStatus, valueChainFieldGapLabel } from '../../src/lib/supply-chain-status'

describe('supply-chain status lanes', () => {
  it('maps ready review statuses to validated', () => {
    assert.equal(displayLaneFromReviewStatus('ready_to_use'), 'validated')
    assert.equal(displayLaneFromReviewStatus('closed_for_annual_panel'), 'validated')
  })

  it('keeps primary snapshot separate from proxy model', () => {
    assert.equal(displayLaneFromReviewStatus('primary_snapshot_confirmed'), 'primary_snapshot')
    assert.equal(displayLaneFromReviewStatus('proxy_model'), 'proxy_model')
  })

  it('routes harmonization and primary-check states to local research lane', () => {
    assert.equal(displayLaneFromReviewStatus('needs_primary_check'), 'local_research_needs_primary_check')
    assert.equal(displayLaneFromReviewStatus('needs_harmonization'), 'local_research_needs_primary_check')
  })

  it('defaults unknown statuses to missing', () => {
    assert.equal(displayLaneFromReviewStatus(undefined), 'missing')
    assert.equal(displayLaneFromReviewStatus('not_started'), 'missing')
    assert.equal(displayLaneFromReviewStatus('unexpected'), 'missing')
  })

  it('summarizes value-chain field gaps separately from step coverage', () => {
    assert.equal(valueChainFieldGapLabel([], []), 'Ingen feltgap')
    assert.equal(valueChainFieldGapLabel(['processing', 'retail'], []), 'Volum: 2')
    assert.equal(valueChainFieldGapLabel(['processing'], ['distribution']), 'Volum: 1 / Avfall: 1')
  })
})
