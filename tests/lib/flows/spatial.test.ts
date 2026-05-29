import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  normalizeKey,
  buildCuratedLookup,
  resolveFlowCoordinates,
  summarizeCoverage,
  type FlowCoordLookups,
} from '../../../src/lib/flows/spatial'
import type { LoopFlows } from '../../../src/lib/flows/types'

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { key: 'anaerob-nedbrytning', label: 'Anaerob nedbrytning', kind: 'biogas_plant', country: 'no', precision: 'exact_point', source: 'Den Magiske Fabrikken' },
      geometry: { type: 'Point', coordinates: [10.32, 59.23] },
    },
    {
      type: 'Feature',
      properties: { key: 'jordbruk', label: 'Jordbruk', kind: 'agriculture', country: 'no', precision: 'kommune_centroid', source: 'SSB kommune-sentroid (Tønsberg)' },
      geometry: { type: 'Point', coordinates: [10.41, 59.27] },
    },
  ],
}

const loops: LoopFlows[] = [
  {
    loopId: 'no-magiske-fabrikken',
    nodes: [
      { id: 'anaerob-nedbrytning', type: 'category', label: 'anaerob nedbrytning' },
      { id: 'jordbruk', type: 'category', label: 'jordbruk' },
      { id: 'biometan-biorest-gjodsel', type: 'category', label: 'biometan + biorest-gjodsel' },
      { id: 'oppdrett', type: 'company', label: 'Oppdrettsanlegg', ref: 'mowi-x' },
    ],
    edges: [],
  },
]

describe('normalizeKey', () => {
  it('lowercases, strips diacritics, collapses whitespace', () => {
    assert.equal(normalizeKey('  Anaerob   Nedbrytning '), 'anaerob nedbrytning')
    assert.equal(normalizeKey('Tønsberg'), 'tonsberg')
  })
})

describe('buildCuratedLookup', () => {
  it('keys curated coords by feature.key', () => {
    const lookup = buildCuratedLookup(geojson)
    assert.equal(lookup.size, 2)
    assert.deepEqual(lookup.get('anaerob-nedbrytning'), {
      coord: [10.32, 59.23], precision: 'exact_point', source: 'Den Magiske Fabrikken',
    })
  })
})

describe('resolveFlowCoordinates', () => {
  const lookups: FlowCoordLookups = {
    curated: buildCuratedLookup(geojson),
    aquacultureByRef: new Map([['mowi-x', [5.5, 62.1] as [number, number]]]),
  }
  const resolved = resolveFlowCoordinates(loops, lookups)

  it('returns one ResolvedFlowNode per loop node', () => {
    assert.equal(resolved.length, 4)
  })

  it('tier 1: curated feature matched by node id wins with its precision + source', () => {
    const n = resolved.find(r => r.nodeId === 'anaerob-nedbrytning')!
    assert.deepEqual(n.coord, [10.32, 59.23])
    assert.equal(n.precision, 'exact_point')
    assert.equal(n.source, 'Den Magiske Fabrikken')
    assert.equal(n.loopId, 'no-magiske-fabrikken')
  })

  it('tier 2: node.ref → aquaculture coord = exact_point when not curated', () => {
    const n = resolved.find(r => r.nodeId === 'oppdrett')!
    assert.deepEqual(n.coord, [5.5, 62.1])
    assert.equal(n.precision, 'exact_point')
    assert.match(n.source ?? '', /[Aa]kvakultur/)
  })

  it('tier 3: no curated + no aquaculture match → unknown, no coord', () => {
    const n = resolved.find(r => r.nodeId === 'biometan-biorest-gjodsel')!
    assert.equal(n.coord, undefined)
    assert.equal(n.precision, 'unknown')
  })
})

describe('summarizeCoverage', () => {
  it('counts resolved nodes per precision', () => {
    const lookups: FlowCoordLookups = {
      curated: buildCuratedLookup(geojson),
      aquacultureByRef: new Map([['mowi-x', [5.5, 62.1] as [number, number]]]),
    }
    const counts = summarizeCoverage(resolveFlowCoordinates(loops, lookups))
    assert.equal(counts.exact_point, 2)
    assert.equal(counts.kommune_centroid, 1)
    assert.equal(counts.unknown, 1)
    assert.equal(counts.estimated, 0)
  })
})

describe('loop-scoped curated keys', () => {
  // The same generic node id ("jordbruk") in two loops must NOT share one curated
  // coordinate. A loop-scoped key (`loopId::nodeId`) binds the coord to one loop only.
  const twoLoops: LoopFlows[] = [
    { loopId: 'no-magiske-fabrikken', nodes: [{ id: 'jordbruk', type: 'category', label: 'jordbruk' }], edges: [] },
    { loopId: 'se-helsingborg-blackwater', nodes: [{ id: 'jordbruk', type: 'category', label: 'jordbruk' }], edges: [] },
  ]
  const scopedLookups: FlowCoordLookups = {
    curated: new Map([
      ['no-magiske-fabrikken::jordbruk', { coord: [10.33, 59.36] as [number, number], precision: 'kommune_centroid', source: 'Tønsberg' }],
    ]),
    aquacultureByRef: new Map(),
  }
  const out = resolveFlowCoordinates(twoLoops, scopedLookups)

  it('places only the loop named in the curated key', () => {
    const no = out.find(r => r.loopId === 'no-magiske-fabrikken' && r.nodeId === 'jordbruk')!
    assert.deepEqual(no.coord, [10.33, 59.36])
    assert.equal(no.precision, 'kommune_centroid')
  })

  it('leaves the same node id in another loop unknown (no coordinate bleed)', () => {
    const se = out.find(r => r.loopId === 'se-helsingborg-blackwater' && r.nodeId === 'jordbruk')!
    assert.equal(se.coord, undefined)
    assert.equal(se.precision, 'unknown')
  })
})
