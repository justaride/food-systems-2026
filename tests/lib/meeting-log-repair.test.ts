import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const overview = readFileSync('docs/meetings/MØTEOVERSIKT.md', 'utf8')

function sectionBetween(start: string, end: string) {
  const [, afterStart = ''] = overview.split(start)
  return afterStart.split(end)[0] ?? ''
}

describe('Food TG meeting-log repair', () => {
  it('classifies the post-21.04 period without turning intake notes into formal decisions', () => {
    const repairSection = sectionBetween('## Møtelogg-reparasjon etter 21.04.2026', '## Dokumenter referert i møtene')

    for (const required of [
      '26.05.2026',
      '09.06.2026',
      'ikke formelt Food TG-vedtak',
      'ikke ekstern validering',
      'Notion',
      'docs/meetings/STATUS-2026-05-26.md',
    ]) {
      assert.ok(repairSection.includes(required), `${required} missing from post-21.04 repair section`)
    }
  })

  it('documents the forward logging rule for every JT/TG meeting', () => {
    const repairSection = sectionBetween('## Møtelogg-reparasjon etter 21.04.2026', '## Dokumenter referert i møtene')

    for (const required of [
      '48 timer',
      'docs/meetings/',
      'MØTEOVERSIKT-rad',
      'decision-log-food-tg.md',
      'arbeidsavklaring',
      'formelt vedtak',
    ]) {
      assert.ok(repairSection.includes(required), `${required} missing from meeting logging rule`)
    }
  })
})
