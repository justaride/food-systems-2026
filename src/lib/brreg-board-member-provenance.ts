export type ExistingBoardMemberForBrregMatch = {
  id: string
  personKey: string
  role: string
}

export function boardMemberPersonRoleKey(personKey: string, role: string): string {
  return `${personKey}|${role}`
}

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length >= 2)
}

export function boardMemberNamesAreCompatible(leftName: string, rightName: string): boolean {
  const leftTokens = nameTokens(leftName)
  const rightTokens = nameTokens(rightName)
  if (leftTokens.length < 2 || rightTokens.length < 2) return false

  const [shorter, longer] =
    leftTokens.length <= rightTokens.length ? [leftTokens, rightTokens] : [rightTokens, leftTokens]
  const longerSet = new Set(longer)

  return shorter.every((token) => longerSet.has(token))
}

export function groupBoardMembersByPersonRole<T extends ExistingBoardMemberForBrregMatch>(
  members: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>()

  for (const member of members) {
    const key = boardMemberPersonRoleKey(member.personKey, member.role)
    const existing = grouped.get(key) ?? []
    existing.push(member)
    grouped.set(key, existing)
  }

  return grouped
}
