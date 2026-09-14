/** One point feature from a MapServer WFS 1.0 GML response, in the service's projection. */
export type WfsPoint = {
  fid: string
  x: number
  y: number
  properties: Record<string, string>
}

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

export function decodeXml(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return XML_ENTITIES[entity.toLowerCase()] ?? match
  })
}

/**
 * Read point features from Kystverket's WFS (`<gml:featureMember>` with
 * `<ms:field>` attributes). Features without a point geometry are skipped.
 */
export function parseWfsGmlPoints(gml: string): WfsPoint[] {
  const points: WfsPoint[] = []
  for (const member of gml.split('<gml:featureMember>').slice(1)) {
    const coordinates = member.match(/<gml:Point[^>]*>\s*<gml:coordinates>([^<]+)<\/gml:coordinates>/)
    if (!coordinates) continue
    const [x, y] = coordinates[1].trim().split(/[\s,]+/).map(Number)
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue

    const properties: Record<string, string> = {}
    for (const [, key, value] of member.matchAll(/<ms:(\w+)>([^<]*)<\/ms:\1>/g)) {
      properties[key] = decodeXml(value.trim())
    }
    points.push({ fid: member.match(/fid="([^"]+)"/)?.[1] ?? '', x, y, properties })
  }
  return points
}
