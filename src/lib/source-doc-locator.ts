type SourceDocLocatorInput = {
  url?: string | null
  doi?: string | null
  documentId?: string | null
  hasLocalFile?: boolean
}

function hasText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function hasSourceDocLocator(input: SourceDocLocatorInput) {
  return (
    hasText(input.url) ||
    hasText(input.doi) ||
    hasText(input.documentId) ||
    input.hasLocalFile === true
  )
}
