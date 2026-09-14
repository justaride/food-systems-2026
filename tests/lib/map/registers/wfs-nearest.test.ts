import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { decodeXml, parseWfsGmlPoints } from '../../../../src/lib/map/registers/wfs'
import { buildNearestIndex, distanceM, nearestPlace, type PlaceRow } from '../../../../src/lib/map/registers/nearest'

// Synthetic MapServer WFS 1.0 response in Kystverket's layout.
const GML = `<?xml version='1.0' encoding="UTF-8" ?>
<wfs:FeatureCollection xmlns:ms="http://mapserver.gis.umn.edu/mapserver">
  <gml:featureMember>
    <ms:layer_420 fid="layer_420.1">
      <ms:msGeometry>
      <gml:Point srsName="EPSG:32633">
        <gml:coordinates>5472.396771,6915309.427352</gml:coordinates>
      </gml:Point>
      </ms:msGeometry>
      <ms:portfacilityno>NOTST-0001</ms:portfacilityno>
      <ms:locationnamenor>Prøvekai &amp; Lager</ms:locationnamenor>
      <ms:functionsnor>Bulk, Stykkgods</ms:functionsnor>
      <ms:operatorcompanyname></ms:operatorcompanyname>
    </ms:layer_420>
  </gml:featureMember>
  <gml:featureMember>
    <ms:layer_1077 fid="layer_1077.9">
      <ms:msGeometry>
      <gml:Point srsName="EPSG:32633">
        <gml:coordinates>493810.145303,7568669.119081</gml:coordinates>
      </gml:Point>
      </ms:msGeometry>
    </ms:layer_1077>
  </gml:featureMember>
  <gml:featureMember>
    <ms:layer_1077 fid="layer_1077.10"><ms:note>uten geometri</ms:note></ms:layer_1077>
  </gml:featureMember>
</wfs:FeatureCollection>`

describe('parseWfsGmlPoints', () => {
  const points = parseWfsGmlPoints(GML)

  it('reads point features and skips members without geometry', () => {
    assert.equal(points.length, 2)
    assert.deepEqual([points[0].x, points[0].y], [5472.396771, 6915309.427352])
    assert.equal(points[1].fid, 'layer_1077.9')
  })

  it('collects attributes, decodes entities and keeps empty values', () => {
    assert.equal(points[0].properties.locationnamenor, 'Prøvekai & Lager')
    assert.equal(points[0].properties.functionsnor, 'Bulk, Stykkgods')
    assert.equal(points[0].properties.operatorcompanyname, '')
    assert.equal(points[0].properties.msGeometry, undefined)
    assert.deepEqual(points[1].properties, {})
  })

  it('decodes numeric entities', () => {
    assert.equal(decodeXml('&#248;y &#xE5;s'), 'øy ås')
  })
})

describe('nearestPlace', () => {
  const place = (lon: number, lat: number, poststed: string): PlaceRow => ({
    lon,
    lat,
    poststed,
    kommunenummer: '5599',
    kommunenavn: 'Prøvekommune',
  })
  const index = buildNearestIndex([place(10.0, 60.0, 'NÆR'), place(10.05, 60.0, 'LENGER'), place(10.3, 60.3, 'FJERN')])

  it('finds the closest place, also across grid cells', () => {
    const hit = nearestPlace(index, 10.019, 60.001)
    assert.equal(hit?.poststed, 'NÆR')
    assert.ok(Math.abs((hit?.distanceM ?? 0) - distanceM(10.019, 60.001, 10.0, 60.0)) < 1e-6)
    assert.equal(nearestPlace(index, 10.04, 60.0)?.poststed, 'LENGER')
  })

  it('returns null when nothing lies within the maximum distance', () => {
    assert.equal(nearestPlace(index, 12.0, 62.0), null)
    assert.equal(nearestPlace(index, 10.2, 60.2, 1_000), null)
  })
})
