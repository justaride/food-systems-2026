import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyUrlStatus,
  shouldAttemptUrlHealthFallback,
} from '@/lib/url-health-classifier'

describe('URL health classifier', () => {
  it('treats successful 2xx responses as ok for source liveness', () => {
    assert.equal(classifyUrlStatus(200), 'ok')
    assert.equal(classifyUrlStatus(202), 'ok')
    assert.equal(classifyUrlStatus(204), 'ok')
  })

  it('keeps redirects, blockers, dead links and server errors distinct', () => {
    assert.equal(classifyUrlStatus(302), 'redirect')
    assert.equal(classifyUrlStatus(403), 'blocked')
    assert.equal(classifyUrlStatus(404), 'dead')
    assert.equal(classifyUrlStatus(500), 'server_error')
  })

  it('classifies DNS and timeout failures without treating them as live URLs', () => {
    assert.equal(classifyUrlStatus('error: ENOTFOUND'), 'dead')
    assert.equal(classifyUrlStatus('timeout'), 'timeout')
    assert.equal(classifyUrlStatus('error: unexpected TLS alert'), 'other')
  })

  it('tries a secondary live check only for ambiguous or tool-sensitive failures', () => {
    assert.equal(shouldAttemptUrlHealthFallback(403), true)
    assert.equal(shouldAttemptUrlHealthFallback(500), true)
    assert.equal(shouldAttemptUrlHealthFallback('timeout'), true)
    assert.equal(shouldAttemptUrlHealthFallback(404), false)
    assert.equal(shouldAttemptUrlHealthFallback(200), false)
  })
})
