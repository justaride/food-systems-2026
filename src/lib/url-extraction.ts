function countChar(value: string, char: string): number {
  let count = 0
  for (const part of value) {
    if (part === char) count += 1
  }
  return count
}

export function trimTerminalUrlPunctuation(raw: string): string {
  let url = raw.trim()
  let changed = true

  while (changed && url.length > 0) {
    changed = false

    if (/[.,;:]$/.test(url)) {
      url = url.slice(0, -1)
      changed = true
      continue
    }

    if (url.endsWith(')') && countChar(url, '(') < countChar(url, ')')) {
      url = url.slice(0, -1)
      changed = true
      continue
    }

    if (url.endsWith(']') && countChar(url, '[') < countChar(url, ']')) {
      url = url.slice(0, -1)
      changed = true
    }
  }

  return url
}

export function extractFirstHttpUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s"'<]+/)
  if (!match) return null

  const trimmed = trimTerminalUrlPunctuation(match[0])
  return trimmed || null
}
