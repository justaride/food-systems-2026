// Transverse Mercator on GRS80/WGS84 using Krüger's n-series (third order),
// which is accurate to well under a millimetre within a UTM zone.
const A_AXIS = 6_378_137
const FLATTENING = 1 / 298.257223563
const K0 = 0.9996
const FALSE_EASTING = 500_000

const n = FLATTENING / (2 - FLATTENING)
const RECTIFYING_RADIUS = (A_AXIS / (1 + n)) * (1 + n ** 2 / 4 + n ** 4 / 64)
const ALPHA = [n / 2 - (2 * n ** 2) / 3 + (5 * n ** 3) / 16, (13 * n ** 2) / 48 - (3 * n ** 3) / 5, (61 * n ** 3) / 240]
const BETA = [n / 2 - (2 * n ** 2) / 3 + (37 * n ** 3) / 96, n ** 2 / 48 + n ** 3 / 15, (17 * n ** 3) / 480]
const DELTA = [2 * n - (2 * n ** 2) / 3 - 2 * n ** 3, (7 * n ** 2) / 3 - (8 * n ** 3) / 5, (56 * n ** 3) / 15]

const toRad = Math.PI / 180
const centralMeridian = (zone: number) => (zone * 6 - 183) * toRad

/** UTM northern-hemisphere easting/northing (e.g. EPSG:32633 for zone 33) → [lon, lat] in degrees. */
export function utmToLonLat(easting: number, northing: number, zone: number): [number, number] {
  const xi = northing / (K0 * RECTIFYING_RADIUS)
  const eta = (easting - FALSE_EASTING) / (K0 * RECTIFYING_RADIUS)

  let xiPrime = xi
  let etaPrime = eta
  for (let j = 1; j <= 3; j++) {
    xiPrime -= BETA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta)
    etaPrime -= BETA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta)
  }

  const chi = Math.asin(Math.sin(xiPrime) / Math.cosh(etaPrime))
  let lat = chi
  for (let j = 1; j <= 3; j++) lat += DELTA[j - 1] * Math.sin(2 * j * chi)
  const lon = centralMeridian(zone) + Math.atan2(Math.sinh(etaPrime), Math.cos(xiPrime))

  return [lon / toRad, lat / toRad]
}

/** [lon, lat] in degrees → UTM northern-hemisphere [easting, northing] for `zone`. */
export function lonLatToUtm(lon: number, lat: number, zone: number): [number, number] {
  const phi = lat * toRad
  const dLambda = lon * toRad - centralMeridian(zone)
  const c = (2 * Math.sqrt(n)) / (1 + n)
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - c * Math.atanh(c * Math.sin(phi)))
  const xiPrime = Math.atan2(t, Math.cos(dLambda))
  const etaPrime = Math.atanh(Math.sin(dLambda) / Math.sqrt(1 + t * t))

  let easting = etaPrime
  let northing = xiPrime
  for (let j = 1; j <= 3; j++) {
    easting += ALPHA[j - 1] * Math.cos(2 * j * xiPrime) * Math.sinh(2 * j * etaPrime)
    northing += ALPHA[j - 1] * Math.sin(2 * j * xiPrime) * Math.cosh(2 * j * etaPrime)
  }
  return [FALSE_EASTING + K0 * RECTIFYING_RADIUS * easting, K0 * RECTIFYING_RADIUS * northing]
}
