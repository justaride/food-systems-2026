export type DomainTaggedActor = {
  metadata: unknown
  country: string | null
  themeTags: string[]
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export function countActorDomainCells(actors: DomainTaggedActor[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const actor of actors) {
    const metadata = metadataRecord(actor.metadata)
    const tags = actor.themeTags ?? []
    const domainTags = tags
      .filter(t => t.startsWith('domene:'))
      .map(t => t.slice('domene:'.length))
    const subdomainTags = tags
      .filter(t => t.startsWith('subdomene:'))
      .map(t => t.slice('subdomene:'.length))

    const domains = domainTags.length ? domainTags : [String(metadata.domain ?? '')].filter(Boolean)
    const subdomains = subdomainTags.length ? subdomainTags : [String(metadata.subdomain ?? '(uklassifisert)')]
    const geo = String(metadata.geo ?? actor.country ?? 'NO')

    for (const domain of domains) {
      for (const subdomain of subdomains) {
        const key = `${domain}|${subdomain}|${geo}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  return counts
}
