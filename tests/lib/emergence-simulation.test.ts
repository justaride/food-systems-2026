import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createInitialAgents, getConcentration, stepAgents } from '../../src/lib/emergence-simulation'

describe('emergence simulation', () => {
  it('creates the same initial agents for the same seed', () => {
    assert.deepEqual(createInitialAgents(80, 20260527), createInitialAgents(80, 20260527))
  })

  it('creates valid agents inside the grid', () => {
    const agents = createInitialAgents(80, 20260527)

    assert.equal(agents.length, 80)
    assert.ok(agents.every(agent => agent.x >= 0 && agent.x < 40))
    assert.ok(agents.every(agent => agent.y >= 0 && agent.y < 40))
    assert.ok(agents.every(agent => agent.company >= 0 && agent.company < 5))
    assert.ok(agents.every(agent => agent.size === 1))
  })

  it('steps deterministically without using ambient Math.random', () => {
    const agents = createInitialAgents(80, 20260527)

    assert.deepEqual(stepAgents(agents, 11), stepAgents(agents, 11))
  })

  it('computes one concentration bucket per company', () => {
    const concentration = getConcentration(createInitialAgents(80, 20260527))

    assert.equal(concentration.length, 5)
    assert.equal(concentration.reduce((sum, value) => sum + value, 0), 80)
  })
})
