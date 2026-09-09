import assert from 'node:assert/strict'
import test from 'node:test'
import { actorQuadrants, sumKnown } from '../../src/lib/data-meaning'

test('known sums keep all-missing and partially covered values distinct from zero', () => {
  assert.deepEqual(sumKnown([null, undefined]), { value: null, known: 0, total: 2 })
  assert.deepEqual(sumKnown([4, null, 6]), { value: 10, known: 2, total: 3 })
  assert.deepEqual(sumKnown([0, null]), { value: 0, known: 1, total: 2 })
})

test('quadrants exclude missing scores while retaining a recorded zero as low', () => {
  assert.deepEqual(actorQuadrants([
    { powerScore: null, interestScore: null },
    { powerScore: 5, interestScore: null },
    { powerScore: null, interestScore: 5 },
    { powerScore: 0, interestScore: 0 },
    { powerScore: 5, interestScore: 5 },
    { powerScore: 5, interestScore: 2 },
    { powerScore: 2, interestScore: 5 },
  ]), {
    keyPlayers: 1,
    keepSatisfied: 1,
    keepInformed: 1,
    monitor: 1,
    unscored: 3,
  })
})
