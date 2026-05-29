import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateMaterialFlows } from '../../../src/lib/flows/validate'
import type { LoopFlows, MaterialFlowsFile } from '../../../src/lib/flows/types'

function loop(edges: LoopFlows['edges']): MaterialFlowsFile {
  return {
    generated: 'x',
    description: 'x',
    loops: [{ loopId: 'L', nodes: [{ id: 'a', type: 'category', label: 'A' }, { id: 'b', type: 'category', label: 'B' }], edges }],
  }
}

describe('validateMaterialFlows', () => {
  it('passes a clean illustrative edge', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues, [])
  })
  it('blocks observed without a citable source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'observed', sourceRefs: [{ label: 'x' }] }]))
    assert.deepEqual(issues.map((i) => i.code), ['observed_without_citable_source'])
  })
  it('passes observed with a citable source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'observed', sourceRefs: [{ label: 'x', url: 'https://x' }] }]))
    assert.deepEqual(issues, [])
  })
  it('blocks estimated without any source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'estimated', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['sourced_status_without_source'])
  })
  it('blocks quantity without unit', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: { value: 1, unit: '' }, evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['quantity_without_unit'])
  })
  it('blocks a dangling endpoint', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'ghost', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['dangling_node_ref'])
  })
  it('blocks an invalid rLevel', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', rLevel: 'R99' as never, evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['invalid_rlevel'])
  })
  it('flags an unknown loopId when knownLoopIds is supplied', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]), new Set(['OTHER']))
    assert.ok(issues.some((i) => i.code === 'unknown_loop_id'))
  })
})
