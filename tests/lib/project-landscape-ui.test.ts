import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProjectLandscape } from '../../src/lib/data/project-landscape'

describe('project landscape UI projection', () => {
  const landscape = loadProjectLandscape()

  it('loads the complete governed registers without promoting candidates', () => {
    assert.ok(landscape)
    assert.equal(landscape.stats.projects, 40)
    assert.equal(landscape.stats.candidates, 22)
    assert.equal(landscape.stats.sources, 100)
    assert.equal(landscape.projects.length, 40)
    assert.equal(landscape.candidates.length, 22)
    const candidateIds = new Set(landscape.candidates.map((candidate) => candidate.id))
    assert.ok(landscape.projects.every((project) => !candidateIds.has(project.id)))
  })

  it('keeps strategic rank separate from deterministic evidence score', () => {
    assert.ok(landscape)
    assert.equal(landscape.projects[0].id, 'digifood')
    assert.equal(landscape.projects[0].rank, 1)
    assert.equal(landscape.projects[0].analysis.priorityScore, 4.4)
    assert.equal(landscape.projects[0].analysis.evidenceScore, 3)
  assert.equal(landscape.stats.independentlyEvaluatedFindings, 0)
  assert.deepEqual(landscape.evidenceDistribution.map((row) => row.key), ['2', '3', '4', '5'])
  assert.equal(landscape.evidenceDistribution.at(-1)?.count, 0)
    assert.ok(landscape.projects.every((project) => project.analysis.evidenceScore < 5))
  })

  it('projects every required Nordic and thematic coverage cell', () => {
    assert.ok(landscape)
    assert.deepEqual(
      landscape.geographyCoverage.map((row) => row.key),
      ['NO', 'SE', 'DK', 'FI', 'IS', 'GL', 'FO', 'AX', 'SAPMI'],
    )
    assert.equal(landscape.themeCoverage.length, 10)
    assert.equal(landscape.geographyCoverage.find((row) => row.key === 'SAPMI')?.count, 2)
    assert.equal(landscape.themeCoverage.find((row) => row.key === 'seafood')?.count, 2)
  })

  it('retains candidate workflow gates in the UI model', () => {
    assert.ok(landscape)
    assert.equal(landscape.candidates.find((candidate) => candidate.id === 'resnor')?.workflowStatus, 'identity_resolved')
    assert.equal(landscape.candidates.find((candidate) => candidate.id === 'nordforsk-food-security-call-2026')?.workflowStatus, 'human_gated')
  })
})
