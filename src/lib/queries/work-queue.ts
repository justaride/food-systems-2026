import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CASESTATUS_UPDATED, caseAnchors } from '@/lib/data/casestatus'
import { prisma } from '@/lib/db'

export const GAP_REGISTER_PATH = 'research/_status/information-gap-register-2026-08-11.jsonl'
export type WorkItem = {
  id: string; title: string; kind: string; priority: string; status: string
  owner: string; nextAction: string; checkedAt: string; href: string
  sourceRefs: string[]; detail: string; exitCriteria: string[]
}
export function parseGapWorkQueue(text: string): WorkItem[] {
  return text.trim().split(/\r?\n/).filter(Boolean).map(line => {
    const row = JSON.parse(line)
    if (!row.id || !row.title || !row.lastVerifiedAt || !row.closureProcess?.ownerRole || !row.nextAction) throw new Error('Incomplete gap register row')
    return { id: row.id, title: row.title, kind: 'gap', priority: row.priority,
      status: row.status, owner: row.closureProcess.ownerRole, nextAction: row.nextAction,
      checkedAt: row.lastVerifiedAt, href: `/arbeidsko#${row.id}`, sourceRefs: row.evidenceRefs,
      detail: row.currentState, exitCriteria: row.closureProcess.exitCriteria }
  })
}
export async function getWorkQueue(): Promise<WorkItem[]> {
  const [gapText, actors] = await Promise.all([
    readFile(join(process.cwd(), GAP_REGISTER_PATH), 'utf8'),
    prisma.actor.findMany({
      where: { OR: [{ priorityTier: 'p1' }, { specificAsk: { not: null } }] },
      select: { id: true, slug: true, name: true, priorityTier: true, owner: true, nextStep: true,
        specificAsk: true, roleSummary: true, lastVerifiedAt: true,
        documentRefs: { select: { document: { select: { slug: true } } } } },
      orderBy: { name: 'asc' },
    }),
  ])
  const gaps = parseGapWorkQueue(gapText)
  const cases: WorkItem[] = caseAnchors.map(c => ({
    id: `case-${c.id}`, title: c.title, kind: 'case', priority: 'P1', status: 'follow_up',
    owner: 'Caseansvarlig må utpekes', nextAction: c.nextActions.join(' '), checkedAt: CASESTATUS_UPDATED,
    href: `/casestatus/${c.id}`, sourceRefs: c.docRefs, detail: c.blockers.join(' '), exitCriteria: c.nextActions,
  }))
  const followups: WorkItem[] = actors.filter(a => a.priorityTier === 'p1' || a.specificAsk?.trim()).map(a => ({
    id: `actor-${a.id}`, title: a.name, kind: 'actor', priority: a.priorityTier?.toUpperCase() ?? 'Ikke prioritert',
    status: 'actor_follow_up', owner: a.owner?.trim() || 'Aktøransvarlig må utpekes',
    nextAction: a.nextStep?.trim() || 'Ansvarlig må konkretisere neste handling i aktørunderlaget.',
    checkedAt: a.lastVerifiedAt?.toISOString().slice(0, 10) ?? 'Ikke dokumentert',
    href: `/aktorer/${a.slug}`, sourceRefs: a.documentRefs.map(ref => `/bibliotek/${ref.document.slug}`),
    detail: a.specificAsk?.trim() ? `Registrert forespørsel: ${a.specificAsk}` : a.roleSummary,
    exitCriteria: [],
  }))
  const rank = (priority: string) => /^P\d$/.test(priority) ? Number(priority.slice(1)) : 99
  return [...gaps, ...cases, ...followups].sort((a, b) => rank(a.priority) - rank(b.priority) || a.id.localeCompare(b.id))
}
