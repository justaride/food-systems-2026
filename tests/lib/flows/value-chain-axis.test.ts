import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveVerdikjedeAxis, summarizeVerdikjede } from '../../../src/lib/flows/value-chain-axis'
import type { LoopFlows } from '../../../src/lib/flows/types'

describe('deriveVerdikjedeAxis', () => {
  it('classifies primary-origin flow as raastoff/oppstroem', () => {
    assert.deepEqual(deriveVerdikjedeAxis('primary', 'processing'), { stage: 'raastoff', position: 'oppstroem' })
  })

  it('treats seafood origin as raastoff', () => {
    assert.equal(deriveVerdikjedeAxis('seafood', 'processing').stage, 'raastoff')
  })

  it('classifies processed-origin flow as bearbeidet', () => {
    assert.equal(deriveVerdikjedeAxis('processing', 'retail').stage, 'bearbeidet')
  })

  it('flags any flow touching waste as avfallsside', () => {
    assert.equal(deriveVerdikjedeAxis('household', 'waste').position, 'avfallsside')
    assert.equal(deriveVerdikjedeAxis('waste', 'processing').position, 'avfallsside')
  })

  it('marks stage ukjent when origin slot is missing', () => {
    assert.equal(deriveVerdikjedeAxis(undefined, 'processing').stage, 'ukjent')
  })

  it('marks position ukjent only when both slots are missing', () => {
    assert.equal(deriveVerdikjedeAxis(undefined, undefined).position, 'ukjent')
    assert.equal(deriveVerdikjedeAxis('primary', undefined).position, 'oppstroem')
  })
})

describe('summarizeVerdikjede', () => {
  const loops: LoopFlows[] = [
    {
      loopId: 'L1',
      nodes: [
        { id: 'a', type: 'category', label: 'Råstoff', valueChainStep: 'primary' },
        { id: 'b', type: 'process', label: 'Foredling', valueChainStep: 'processing' },
        { id: 'c', type: 'category', label: 'Matavfall', valueChainStep: 'waste' },
      ],
      edges: [
        { id: 'L1-e0', fromId: 'a', toId: 'b', material: 'korn', evidenceStatus: 'observed', sourceRefs: [] },
        { id: 'L1-e1', fromId: 'b', toId: 'c', material: 'svinn', evidenceStatus: 'estimated', sourceRefs: [] },
      ],
    },
  ]

  it('counts stage and position across all edges of selected loops', () => {
    assert.deepEqual(summarizeVerdikjede(loops), {
      total: 2,
      raastoff: 1,
      bearbeidet: 1,
      oppstroem: 1,
      avfallsside: 1,
    })
  })
})
