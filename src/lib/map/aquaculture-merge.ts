import type { AquacultureSite } from './types'

/**
 * Combine the register snapshot with database sites. The snapshot holds every
 * locality in Fiskeridirektoratet's register; the database only holds sites
 * linked to a company. Database rows therefore add owner fields to matching
 * localities and append localities the snapshot lacks, but never remove any.
 */
export function mergeAquacultureSites(
  registerSites: AquacultureSite[],
  dbSites: AquacultureSite[]
): AquacultureSite[] {
  const dbById = new Map<number, AquacultureSite>()
  const unmatched: AquacultureSite[] = []
  for (const site of dbSites) {
    if (site.id > 0) dbById.set(site.id, site)
    else unmatched.push(site)
  }

  const merged = registerSites.map(site => {
    const db = dbById.get(site.id)
    if (!db) return site
    dbById.delete(site.id)
    return { ...site, companyName: db.companyName, orgNr: db.orgNr }
  })

  return [...merged, ...dbById.values(), ...unmatched]
}
