type BoardMemberGraphRow = {
  companyId: string
  personKey: string
  personName: string
  role: string
  source?: string | null
  sourceUrl?: string | null
  verifiedAt?: Date | string | null
}

type PersonProfileGraphRow = {
  id: string
  personKey: string
  name: string
}

type GraphNodeLike = {
  id: string
  label: string
  type: 'person'
  tags: string[]
  href: string
}

type GraphEdgeLike = {
  source: string
  target: string
  type: 'board-role'
  confidence?: number
  sourceLabel?: string
}

type BoardMemberProfileGap = {
  companyId: string
  companyName: string
  personKey: string
  personName: string
}

function hasText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

function boardMemberConfidence(row: BoardMemberGraphRow) {
  if (row.verifiedAt || hasText(row.sourceUrl)) return 0.95
  if (hasText(row.source)) return 0.7
  return undefined
}

function boardMemberSourceLabel(row: BoardMemberGraphRow) {
  if (hasText(row.source)) return row.source!.trim()
  if (hasText(row.sourceUrl)) return row.sourceUrl!.trim()
  return undefined
}

export function buildBoardMemberGraphArtifacts(input: {
  boardMembers: BoardMemberGraphRow[]
  personProfiles: PersonProfileGraphRow[]
  companyIds: Set<string>
  companyNamesById?: Map<string, string>
}) {
  const profileByPersonKey = new Map(
    input.personProfiles.map((profile) => [profile.personKey, profile]),
  )
  const fallbackPersonNodesByKey = new Map<string, GraphNodeLike>()
  const boardMemberProfileGapsByKey = new Map<string, BoardMemberProfileGap>()
  const edges: GraphEdgeLike[] = []

  for (const row of input.boardMembers) {
    if (!input.companyIds.has(row.companyId)) continue
    const profile = profileByPersonKey.get(row.personKey)
    const personNodeId = profile?.id ?? `board-person:${row.personKey}`

    if (!profile && !fallbackPersonNodesByKey.has(row.personKey)) {
      fallbackPersonNodesByKey.set(row.personKey, {
        id: personNodeId,
        label: row.personName,
        type: 'person',
        tags: ['board-member', 'profile-gap'],
        href: `/styremedlemmer?person=${encodeURIComponent(row.personKey)}`,
      })
      boardMemberProfileGapsByKey.set(row.personKey, {
        companyId: row.companyId,
        companyName: input.companyNamesById?.get(row.companyId) ?? row.companyId,
        personKey: row.personKey,
        personName: row.personName,
      })
    }

    const confidence = boardMemberConfidence(row)
    const sourceLabel = boardMemberSourceLabel(row)
    edges.push({
      source: personNodeId,
      target: row.companyId,
      type: 'board-role',
      ...(confidence !== undefined ? { confidence } : {}),
      ...(sourceLabel ? { sourceLabel } : {}),
    })
  }

  return {
    fallbackPersonNodes: [...fallbackPersonNodesByKey.values()],
    edges,
    boardMemberProfileGaps: [...boardMemberProfileGapsByKey.values()],
  }
}
