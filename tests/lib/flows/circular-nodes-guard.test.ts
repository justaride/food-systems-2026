import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { validateCircularNodes } from '../../../src/lib/flows/validate-coords'
import { buildCuratedLookup, resolveFlowCoordinates, summarizeCoverage } from '../../../src/lib/flows/spatial'
import type { MaterialFlowsFile } from '../../../src/lib/flows/types'

const ROOT = join(process.cwd(), 'public', 'data', 'food-systems')

function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(join(ROOT, file), 'utf8'))
}

describe('circular-nodes.geojson guard', () => {
  const geojson = loadJson('circular-nodes.geojson') as GeoJSON.FeatureCollection
  const flows = loadJson('material-flows.json') as MaterialFlowsFile

  it('passes the validator with zero issues', () => {
    const issues = validateCircularNodes(geojson)
    assert.deepEqual(issues, [], `Coordinate issues:\n${JSON.stringify(issues, null, 2)}`)
  })

  it('every curated key is a real loopId::nodeId in material-flows.json', () => {
    const nodeIdsByLoop = new Map<string, Set<string>>()
    for (const l of flows.loops) nodeIdsByLoop.set(l.loopId, new Set(l.nodes.map((n) => n.id)))
    const orphans = geojson.features
      .map((f) => (f.properties as { key?: string } | null)?.key)
      .filter((k): k is string => Boolean(k))
      .filter((k) => {
        const [loopId, nodeId] = k.split('::')
        return !nodeIdsByLoop.has(loopId) || !nodeIdsByLoop.get(loopId)!.has(nodeId)
      })
    assert.deepEqual(orphans, [], `Curated keys not matching a real loopId::nodeId: ${orphans.join(', ')}`)
  })

  it('resolves enough exact points and reports coverage', () => {
    const lookups = { curated: buildCuratedLookup(geojson), aquacultureByRef: new Map<string, [number, number]>() }
    const resolved = resolveFlowCoordinates(flows.loops, lookups)
    const coverage = summarizeCoverage(resolved)
    // Honest coverage report (printed, not silently truncated).
    console.log(
      `[circular-flows coverage] exact_point=${coverage.exact_point} ` +
        `kommune_centroid=${coverage.kommune_centroid} estimated=${coverage.estimated} unknown=${coverage.unknown}`,
    )
    assert.ok(coverage.exact_point >= 4, `Expected >=4 exact_point, got ${coverage.exact_point}`)
  })
})
