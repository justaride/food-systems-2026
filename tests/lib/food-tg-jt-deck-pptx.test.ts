import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'

const deckManusPath = 'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md'
const deckPptxPath = 'docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.pptx'

function readText(path: string) {
  assert.ok(existsSync(path), `${path} must exist`)
  return readFileSync(path, 'utf8')
}

function readPptx() {
  assert.ok(existsSync(deckPptxPath), `${deckPptxPath} must exist`)
  const stat = statSync(deckPptxPath)
  assert.ok(stat.size > 50_000, `${deckPptxPath} must be a real PPTX export, got ${stat.size} bytes`)
  return readFileSync(deckPptxPath)
}

describe('Food TG JT deck PPTX v0.1', () => {
  it('turns the Week 25 slide manuscript into a 10-slide editable PowerPoint artifact', () => {
    const pptx = readPptx()
    assert.equal(pptx.subarray(0, 2).toString('utf8'), 'PK', 'PPTX must be a zip package')

    const packageText = pptx.toString('latin1')
    const slideFiles = new Set([...packageText.matchAll(/ppt\/slides\/slide\d+\.xml/g)].map((match) => match[0]))
    assert.equal(slideFiles.size, 10, `${deckPptxPath} must contain exactly 10 slide XML files`)
    assert.ok(packageText.includes('ppt/notesSlides/notesSlide1.xml'), 'speaker notes must be exported')
  })

  it('keeps the deck tied to the internal safe-language manuscript and sender surfaces', () => {
    const manus = readText(deckManusPath)
    readPptx()

    for (const term of [
      'bruksregel',
      'Kun sikker språkbank',
      'Ingen uvaliderte aktørclaims',
      'Trygg språkbank i decket',
      'Ikke-si-liste',
      'DASK-0906-001',
      'DASK-0906-002',
      'benchmark-only',
      'needs-primary-check',
      'needs-actor-validation',
    ]) {
      assert.ok(manus.includes(term), `${term} missing from ${deckManusPath}`)
    }

    for (const path of [
      'docs/project/status/jt-uke25-sendepakke-2026-06-15.md',
      'docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md',
      'docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md',
    ]) {
      const doc = readText(path)
      assert.ok(doc.includes(deckPptxPath), `${deckPptxPath} missing from ${path}`)
    }
  })
})
