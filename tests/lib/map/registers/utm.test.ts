import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lonLatToUtm, utmToLonLat } from '../../../../src/lib/map/registers/utm'

const close = (actual: number, expected: number, tolerance: number, label: string) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected}`)

describe('UTM zone 33N', () => {
  it('puts the central meridian at easting 500 000 and the equator at northing 0', () => {
    const [lon, lat] = utmToLonLat(500_000, 0, 33)
    close(lon, 15, 1e-9, 'lon')
    close(lat, 0, 1e-9, 'lat')
  })

  it('matches the scaled GRS80 meridian arc at 60°N (6 654 072.819 m × 0.9996)', () => {
    const [easting, northing] = lonLatToUtm(15, 60, 33)
    close(easting, 500_000, 1e-6, 'easting')
    close(northing, 6_654_072.819 * 0.9996, 0.01, 'northing')
  })

  it('round-trips coordinates far from the central meridian', () => {
    for (const [lon, lat] of [[4.8, 58.1], [10.75, 59.91], [31.0, 70.4], [-0.4, 62.0]]) {
      const [easting, northing] = lonLatToUtm(lon, lat, 33)
      const [lonBack, latBack] = utmToLonLat(easting, northing, 33)
      close(lonBack, lon, 1e-8, `lon ${lon}`)
      close(latBack, lat, 1e-8, `lat ${lat}`)
    }
  })
})
