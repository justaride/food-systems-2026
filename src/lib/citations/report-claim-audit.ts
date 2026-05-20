export type CitableReportAuditInput = {
  html: string
  appendix: string
  claimAudit: string
  phase2: string
  selfCritique: string
  t3Diff: string
  readme: string
}

export type CitableReportAuditIssue = {
  code:
    | 't3_status_contradiction'
    | 'copenhagen_percentage_mismatch'
    | 'readme_line_count_quality_claim'
    | 'hhi_cr3_mislabel'
    | 'unresolved_weak_claim'
    | 'highlighted_numeric_claim_without_support'
  severity: 'blocking' | 'warning'
  message: string
  evidence?: string
}

const SOURCE_TERMS = [
  'appendiks',
  'bosselmann',
  'citation',
  'curis.ku.dk',
  'dagligvaretilsynet',
  'ekomatcentrum',
  'eurostat',
  'fhf',
  'finlex',
  'ifro',
  'iea',
  'jordbruksverket',
  'kilde',
  'konkurransetilsynet',
  'landbruksdirektoratet',
  'luke',
  'matvett',
  'nibio',
  'nofima',
  'norsus',
  'oecd',
  'organic denmark',
  'rapport',
  'salling group',
  'sintef',
  'source',
  'url',
  'http',
]

const CAVEAT_TERMS = [
  'aktørdata',
  'caveat',
  'forbehold',
  'ikke bransjesnitt',
  'ikke industri-snitt',
  'intern',
  'kontroller',
  'krever',
  'method',
  'metode',
  'needs_primary_check',
  'scope',
  'svak',
]

function normalizeText(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAnyTerm(value: string, terms: string[]) {
  const normalized = value.toLowerCase()
  return terms.some(term => normalized.includes(term))
}

function hasSourceOrCaveat(value: string) {
  return hasAnyTerm(value, SOURCE_TERMS) || hasAnyTerm(value, CAVEAT_TERMS)
}

function getLineContexts(value: string, predicate: (line: string) => boolean) {
  return value
    .split(/\r?\n/)
    .map((line, index) => ({ line: normalizeText(line), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0 && predicate(line))
}

function stripTags(value: string) {
  return normalizeText(value)
}

function extractHighlightedNumericClaims(html: string) {
  const claims: Array<{ claim: string; context: string }> = []
  const tagPattern = /<(p|li|td|div|h[1-6])\b[^>]*>([\s\S]*?<b>[\s\S]*?\d[\s\S]*?<\/b>[\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(html)) !== null) {
    const contextHtml = match[2]
    const boldMatches = contextHtml.matchAll(/<b>([\s\S]*?\d[\s\S]*?)<\/b>/gi)
    for (const boldMatch of boldMatches) {
      claims.push({
        claim: stripTags(boldMatch[1]),
        context: stripTags(contextHtml),
      })
    }
  }

  return claims
}

function numericTokens(value: string) {
  return [...value.matchAll(/\d+(?:[,.]\d+)?\s*(?:%|mrd|mill|kt|gwh|kg|nok|usd|eur|pp|t\/cap)|\d+x/gi)].map(match =>
    match[0].toLowerCase().replace(/\s+/g, ' ').trim(),
  )
}

function significantWords(value: string) {
  const stopWords = new Set([
    'and',
    'av',
    'det',
    'dk',
    'er',
    'fi',
    'for',
    'i',
    'is',
    'med',
    'no',
    'og',
    'på',
    'se',
    'som',
    'til',
  ])
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 4 && !stopWords.has(word))
    .slice(0, 4)
}

function hasCorpusSupport(claim: string, corpus: string) {
  const tokens = numericTokens(claim)
  if (tokens.length === 0) return true

  const words = significantWords(claim)
  const normalizedCorpus = normalizeText(corpus).toLowerCase()

  return tokens.some((token) => {
    const tokenIndex = normalizedCorpus.indexOf(token)
    if (tokenIndex === -1) return false

    const window = normalizedCorpus.slice(Math.max(0, tokenIndex - 600), tokenIndex + 600)
    const wordHit = words.length === 0 || words.some(word => window.includes(word))
    return wordHit && hasSourceOrCaveat(window)
  })
}

function extractCopenhagenPublicKitchenPercentages(...texts: string[]) {
  const values = new Set<string>()

  for (const text of texts) {
    for (const { line } of getLineContexts(text, candidate => /københavn|copenhagen/i.test(candidate))) {
      for (const match of line.matchAll(/(\d+(?:[,.]\d+)?)\s*%/g)) {
        const value = match[1].replace(',', '.')
        const number = Number(value)
        if (!Number.isFinite(number)) continue
        if (number < 50 || number > 89) continue
        const matchWindow = line.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30).toLowerCase()
        if (matchWindow.includes('mål') || matchWindow.includes('target')) continue
        values.add(value)
      }
    }
  }

  return [...values].sort()
}

function t3IsDone(input: CitableReportAuditInput) {
  const corpus = [input.html, input.t3Diff, input.readme].join('\n').toLowerCase()
  return /t3[^.\n]*(gjennomført|ferdig|demonstrerer)|status:\s*ferdig|phase 8:\s*t3/.test(corpus)
}

function t3IsDeferredInPublishedContext(input: CitableReportAuditInput) {
  const corpus = [input.html, input.appendix, input.selfCritique, input.readme].join('\n').toLowerCase()
  return /t3[^.\n]*(deferred|ikke kjørt|ikke gjort|ingen ekstern validering)|ingen ekstern validering[^.\n]*t3|ikke har sammenlignet/.test(corpus)
}

export function auditCitableReportDocuments(input: CitableReportAuditInput): CitableReportAuditIssue[] {
  const issues: CitableReportAuditIssue[] = []

  if (t3IsDone(input) && t3IsDeferredInPublishedContext(input)) {
    issues.push({
      code: 't3_status_contradiction',
      severity: 'blocking',
      message: 'T3 is marked completed in Phase 8/report status but still described as not done or deferred.',
    })
  }

  const copenhagenPercentages = extractCopenhagenPublicKitchenPercentages(input.html, input.appendix, input.readme)
  if (copenhagenPercentages.length > 1) {
    issues.push({
      code: 'copenhagen_percentage_mismatch',
      severity: 'blocking',
      message: `Copenhagen public-kitchen percentage is inconsistent: ${copenhagenPercentages.join(', ')}.`,
    })
  }

  for (const { line, lineNumber } of getLineContexts(input.readme, line =>
    /html-rapport/i.test(line) && (/\d+\s+linjer/i.test(line) || /~?\d+\s*kb/i.test(line)),
  )) {
    issues.push({
      code: 'readme_line_count_quality_claim',
      severity: 'blocking',
      message: 'README uses generated line/byte counts as report quality/status claims.',
      evidence: `README:${lineNumber}: ${line}`,
    })
  }

  for (const [name, text] of [
    ['html', input.html],
    ['appendix', input.appendix],
    ['readme', input.readme],
    ['selfCritique', input.selfCritique],
  ] as const) {
    for (const { line, lineNumber } of getLineContexts(text, line => /hhi[^.\n]{0,40}96[,.]6\s*%/i.test(line))) {
      if (/feil|rettet|skal være|→/.test(line)) continue
      if (/cr3\s+(?:på\s+)?96[,.]6\s*%/i.test(line)) continue
      issues.push({
        code: 'hhi_cr3_mislabel',
        severity: 'blocking',
        message: 'HHI/CR3 labels are mixed; 96.6% must be CR3, while HHI is 3445.',
        evidence: `${name}:${lineNumber}: ${line}`,
      })
    }
  }

  for (const [name, text] of [
    ['html', input.html],
    ['appendix', input.appendix],
    ['readme', input.readme],
    ['selfCritique', input.selfCritique],
  ] as const) {
    for (const { line, lineNumber } of getLineContexts(text, line =>
      /krever full url-sjekk|url pending|uten direkte url|ikke kilde-belagt/i.test(line),
    )) {
      issues.push({
        code: 'unresolved_weak_claim',
        severity: 'blocking',
        message: 'Published report material still contains unresolved weak/missing-source language from the claim audit.',
        evidence: `${name}:${lineNumber}: ${line}`,
      })
    }
  }

  const supportCorpus = [input.appendix, input.claimAudit, input.phase2, input.selfCritique, input.t3Diff].join('\n')
  for (const { claim, context } of extractHighlightedNumericClaims(input.html)) {
    if (hasSourceOrCaveat(context)) continue
    if (hasCorpusSupport(claim, supportCorpus)) continue

    issues.push({
      code: 'highlighted_numeric_claim_without_support',
      severity: 'blocking',
      message: 'Highlighted numeric claim has no nearby citation/caveat and no matching sourced support in the audit corpus.',
      evidence: claim,
    })
  }

  return issues
}

export function formatCitableReportAuditIssues(issues: CitableReportAuditIssue[]) {
  if (issues.length === 0) return 'Citable report audit passed: no issues found.'

  return [
    `Citable report audit found ${issues.length} issue(s):`,
    ...issues.map((issue) => {
      const evidence = issue.evidence ? `\n  evidence: ${issue.evidence}` : ''
      return `- [${issue.severity}] ${issue.code}: ${issue.message}${evidence}`
    }),
  ].join('\n')
}
