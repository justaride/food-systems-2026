import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { kommuneCentroid } from '../../../src/lib/map/kommune-centroid'

describe('kommuneCentroid', () => {
  it('returns [lng, lat] centroid of a square polygon', () => {
    const square = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[10, 59], [11, 59], [11, 60], [10, 60], [10, 59]]],
      },
    }
    const [lng, lat] = kommuneCentroid(square)
    assert.ok(Math.abs(lng - 10.5) < 1e-6, `lng ${lng}`)
    assert.ok(Math.abs(lat - 59.5) < 1e-6, `lat ${lat}`)
  })
})
