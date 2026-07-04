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

function countKey(counts: Map<string, number>, domain: string, subdomain: string, geo: string) {
  const key = `${domain}|${subdomain}|${geo}`
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

export function countActorDomainCells(actors: DomainTaggedActor[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const actor of actors) {
    const metadata = metadataRecord(actor.metadata)
    const registrations = Array.isArray(metadata.domainRegistrations)
      ? metadata.domainRegistrations
          .map(metadataRecord)
          .filter(r => r.domain && r.subdomain && r.geo)
      : []
    if (registrations.length) {
      for (const registration of registrations) {
        countKey(
          counts,
          String(registration.domain),
          String(registration.subdomain),
          String(registration.geo),
        )
      }
      continue
    }

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
        countKey(counts, domain, subdomain, geo)
      }
    }
  }
  return counts
}
