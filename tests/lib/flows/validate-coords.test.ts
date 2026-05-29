import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateCircularNodes, ALLOWED_KINDS } from '../../../src/lib/flows/validate-coords'

function feature(props: Record<string, unknown>, coords: [number, number] = [10.5, 59.9]) {
  return { type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: coords } }
}
const ok = { key: 'k1', label: 'L', kind: 'biogas_plant', country: 'no', precision: 'exact_point', source: 'Kilde X' }

describe('validateCircularNodes', () => {
  it('passes a well-formed collection', () => {
    const issues = validateCircularNodes({ type: 'FeatureCollection', features: [feature(ok)] })
    assert.deepEqual(issues, [])
  })

  it('flags missing key, missing source, invalid precision, invalid kind', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [
        feature({ ...ok, key: '' }),
        feature({ ...ok, key: 'k2', source: '' }),
        feature({ ...ok, key: 'k3', precision: 'wild_guess' }),
        feature({ ...ok, key: 'k4', kind: 'spaceport' }),
      ],
    })
    const codes = issues.map(i => i.code).sort()
    assert.ok(codes.includes('missing_key'))
    assert.ok(codes.includes('missing_source'))
    assert.ok(codes.includes('invalid_precision'))
    assert.ok(codes.includes('invalid_kind'))
  })

  it('flags duplicate keys', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [feature({ ...ok, key: 'dup' }), feature({ ...ok, key: 'dup' })],
    })
    assert.ok(issues.some(i => i.code === 'duplicate_key'))
  })

  it('flags non-Point geometry', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: ok, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }],
    })
    assert.ok(issues.some(i => i.code === 'not_point_geometry'))
  })

  it('flags coordinates outside the Nordic envelope (catches swapped lat/lng)', () => {
    // Swapped: [59.23, 10.32] → lng=59.23 > 35 → out of envelope.
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [feature({ ...ok, key: 'swap' }, [59.23, 10.32])],
    })
    assert.ok(issues.some(i => i.code === 'coord_out_of_envelope'))
  })

  it('exposes the allowed-kinds vocabulary', () => {
    assert.ok(ALLOWED_KINDS.includes('biogas_plant'))
    assert.ok(ALLOWED_KINDS.includes('food_bank'))
    assert.ok(ALLOWED_KINDS.includes('water_source'))
  })
})
