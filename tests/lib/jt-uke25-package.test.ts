import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const jtPackageFiles = [
  'docs/project/status/jt-statusnotat-uke-25-2026-06-15.md',
  'docs/project/status/jt-uke25-sendepakke-2026-06-15.md',
  'docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md',
  'docs/project/status/jt-uke25-operatorlogg-2026-06-15.md',
  'docs/project/status/food-tg-start-her-2026-06-15.md',
  'docs/project/status/port-e-event-go-uke-25-2026-06-15.md',
  'docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md',
  'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md',
  'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.pptx',
]

const statusNotePath = 'docs/project/status/jt-statusnotat-uke-25-2026-06-15.md'
const sendPackagePath = 'docs/project/status/jt-uke25-sendepakke-2026-06-15.md'
const decisionCasesPath = 'docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md'
const deckMarkdownPath = 'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md'
const deckPptxPath = 'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.pptx'

function readProjectFile(path: string) {
  return readFileSync(path, 'utf8')
}

function assertIncludes(document: string, path: string, terms: string[]) {
  for (const term of terms) {
    assert.ok(document.includes(term), `${term} missing from ${path}`)
  }
}

function frontmatterRelatedFiles(markdown: string) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''

  return [...frontmatter.matchAll(/^\s+-\s+(.+)$/gm)].map((match) => match[1].trim())
}

function extractPptxText(partPath: string) {
  const xml = execFileSync('unzip', ['-p', deckPptxPath, partPath], { encoding: 'utf8' })

  return [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) =>
    match[1]
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"'),
  )
}

function listPptxParts() {
  return execFileSync('unzip', ['-Z1', deckPptxPath], { encoding: 'utf8' }).trim().split('\n')
}

function riskyPositiveClaims(lines: string[]) {
  return lines.filter((line) => {
    const lower = line.toLocaleLowerCase('nb-NO')

    return (
      (lower.includes('importfritt') && !lower.includes('ikke importfritt')) ||
      (lower.includes('norsk pilotbevis') &&
        !lower.includes('ikke norsk pilotbevis') &&
        !lower.includes('kan ikke brukes som norsk pilotbevis')) ||
      (lower.includes('nasjonalt twh-potensial') && !lower.includes('ikke nasjonalt twh-potensial')) ||
      lower.includes('bama blokker') ||
      /mou (finnes|er signert|er bekreftet)/i.test(line)
    )
  })
}

describe('JT uke 25 package', () => {
  it('keeps the complete send-ready artifact set tracked in repo', () => {
    for (const path of jtPackageFiles) {
      assert.ok(existsSync(path), `${path} must exist`)
    }
  })

  it('keeps related_files references resolvable for operator handoff docs', () => {
    const checkedDocs = [
      statusNotePath,
      sendPackagePath,
      decisionCasesPath,
      deckMarkdownPath,
      'docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md',
      'docs/project/status/food-tg-start-her-2026-06-15.md',
      'docs/project/status/port-e-event-go-uke-25-2026-06-15.md',
    ]

    for (const path of checkedDocs) {
      const markdown = readProjectFile(path)
      const relatedFiles = frontmatterRelatedFiles(markdown)

      assert.ok(relatedFiles.length > 0, `${path} should declare related_files`)

      for (const relatedPath of relatedFiles) {
        assert.ok(existsSync(relatedPath), `${path} references missing file ${relatedPath}`)
      }
    }
  })

  it('states the JT decision gate without claiming platform merge, deploy, or operator rerun is done', () => {
    const statusNote = readProjectFile(statusNotePath)
    const sendPackage = readProjectFile(sendPackagePath)

    assertIncludes(statusNote, statusNotePath, [
      'PR #159',
      'G-06, G-10 og G-11',
      '31.07.2026',
      'Minimumsvedtak',
      'Port E',
      'DASK-0906-001/002',
      'Operatorsekvensen skal re-kjøres etter stack-merge',
    ])
    assertIncludes(sendPackage, sendPackagePath, [
      'ikke ekstern outreach',
      'Ikke send eksternt',
      'PR #159 er merget/deployet og operatorsekvensen er re-kjort',
      'Moteforesporsel sendt',
      'DASK-0906-001',
      'DASK-0906-002',
    ])

    for (const unsafeClaim of [
      'PR #159 er merget',
      'stacken er deployet',
      'operatorsekvensen er kjørt',
      'DASK-0906-001 er sendt',
      'DASK-0906-002 er sendt',
      'møte er booket',
    ]) {
      assert.ok(!statusNote.includes(unsafeClaim), `${unsafeClaim} should not be claimed in ${statusNotePath}`)
    }
  })

  it('carries the four requested JT decision cases with owners and consequences', () => {
    const decisions = readProjectFile(decisionCasesPath)

    assertIncludes(decisions, decisionCasesPath, [
      '## Sak 1: Minimumsvedtak casekort',
      '## Sak 2: H1/H2-todeling frem mot 31.07.2026',
      '## Sak 3: Port E - offentlig online event',
      '## Sak 4: DASK-0906-001/002 sendes internt nå',
      '**Eier:**',
      '**Konsekvens hvis vi ikke beslutter:**',
      'Beslutningslogg etter møte',
    ])
  })

  it('keeps the deck manuscript aligned to a ten-slide internal decision deck', () => {
    const deckMarkdown = readProjectFile(deckMarkdownPath)
    const slideHeadings = deckMarkdown.match(/^## Slide \d+ - /gm) ?? []

    assert.equal(slideHeadings.length, 10)
    assertIncludes(deckMarkdown, deckMarkdownPath, [
      'Redigerbar PPTX v0.1',
      'Ikke ekstern presentasjon',
      'Trygg språkbank',
      'Ikke-si-liste',
      'ikke importfritt',
      'ikke norsk pilotbevis',
      'Ikke si at MOU-er finnes',
    ])
  })

  it('keeps the editable PPTX structurally aligned and free of unqualified risky claims', () => {
    const parts = listPptxParts()
    const slideParts = parts.filter((part) => /^ppt\/slides\/slide\d+\.xml$/.test(part))
    const notesParts = parts.filter((part) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(part))
    const expectedTitles = [
      'Hvorfor Food må snevres inn',
      'A+B/C er fortsatt arbeidsrammen',
      'Syv caseanker for første leveranse',
      'Modeneste A-spor: fôr/import',
      'Høyverdi restråstoff: 100% Fish som benchmark',
      'Praktiske B-løp: kvalitet før volum',
      'C-gate: distribusjon og adoption',
      'Nye relasjonscase: kaffe og kakao',
      'Valio og spillvarme som smale exploratory løp',
      'Beslutninger og neste 14 dager',
    ]

    assert.equal(slideParts.length, 10)
    assert.equal(notesParts.length, 10)

    for (let index = 0; index < expectedTitles.length; index += 1) {
      const lines = extractPptxText(`ppt/slides/slide${index + 1}.xml`)
      const slideText = lines.join(' ')
      const riskyLines = riskyPositiveClaims(lines)

      assert.ok(slideText.includes(expectedTitles[index]), `${expectedTitles[index]} missing from slide ${index + 1}`)
      assert.deepEqual(riskyLines, [], `risky positive claims on slide ${index + 1}: ${riskyLines.join(' | ')}`)
    }
  })
})
