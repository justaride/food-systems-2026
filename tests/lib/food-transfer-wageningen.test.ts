import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { evidencePack } from '../../src/lib/data/evidence-pack'
import { foodTgControlDocuments } from '../../src/lib/data/food-tg-control-layer'
import { meetings } from '../../src/lib/data/meetings'
import { rLadder } from '../../src/lib/data/r-ladder'

const unsafeExternalReadyPattern =
  /(?:eksternt validert|validert eksternt|pilotklar|pilot-ready|source-closed|externally ready)/i

describe('Food transfer Wageningen registration', () => {
  it('registers the Cities/Food transfer as a caveated intake meeting', () => {
    const transferMeeting = meetings.find((meeting) => meeting.id === 'meeting-9')

    assert.ok(transferMeeting)
    assert.equal(transferMeeting.source, 'docs/meetings/JT-GABRIEL - Metodeoverforing Cities Food mai 2026.md')
    assert.ok(existsSync(join(process.cwd(), transferMeeting.source)))
    assert.match(transferMeeting.summary, /ikke.*ekstern/i)
    assert.doesNotMatch(transferMeeting.summary, unsafeExternalReadyPattern)
    assert.ok(
      transferMeeting.keyDecisions.some((decision) =>
        /cross-project intake/i.test(decision) && /ikke.*formelt/i.test(decision),
      ),
    )
  })

  it('exposes the Wageningen method transfer as gated Food TG control evidence', () => {
    const controlDoc = foodTgControlDocuments.find((doc) => doc.id === 'wageningen-method-transfer-2026-05-26')
    const evidenceDoc = evidencePack.find((doc) => doc.id === 'wageningen-method-transfer')

    assert.ok(controlDoc)
    assert.equal(controlDoc.status, 'klar-med-forbehold')
    assert.equal(controlDoc.path, 'docs/project/mandates/food-tg-wageningen-moerman-method-transfer-2026-05-26.md')
    assert.doesNotMatch(controlDoc.use, unsafeExternalReadyPattern)
    assert.ok(controlDoc.blocks.some((block) => /locator|claim|validering/i.test(block)))

    assert.deepEqual(evidenceDoc, {
      id: 'wageningen-method-transfer',
      name: 'Wageningen/Moerman method transfer',
      status: 'utkast',
    })
  })

  it('keeps the R-ladder tied to Wageningen as a method lens, not proof', () => {
    const r9 = rLadder.find((step) => step.id === 'R9')

    assert.ok(r9)
    assert.ok(r9.foodExamples.some((example) => /Wageningen|Moerman/i.test(example)))
    assert.ok(r9.foodExamples.some((example) => /ikke.*bevis|not proof/i.test(example)))
  })

  it('records the Food-local QA closure without lifting source, claim or validation status', () => {
    const qaNotePath = join(
      process.cwd(),
      'docs/project/mandates/food-tg-meeting-transfer-qa-2026-05-28.md',
    )

    assert.ok(existsSync(qaNotePath), 'Food-local QA closure note should exist')

    const qaNote = readFileSync(qaNotePath, 'utf8')
    const claimLock = readFileSync(
      join(process.cwd(), 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md'),
      'utf8',
    )
    const claimRegister = readFileSync(
      join(process.cwd(), 'docs/project/mandates/claim-register-food-tg.md'),
      'utf8',
    )

    assert.match(qaNote, /intern metodepakke klar med forbehold; ikke eksternt validert; ikke claim-lukket/i)
    assert.match(qaNote, /SRC-B-035/)
    assert.match(qaNote, /CL-B-008/)
    assert.match(qaNote, /CL-B-023/)
    assert.match(qaNote, /Ghana\/Costa Rica\/Nederland.*benchmark-only/i)
    assert.match(claimLock, /SRC-B-035/)
    assert.match(claimRegister, /SRC-B-035/)
    assert.doesNotMatch(qaNote, /(?:validert eksternt|pilotklar|pilot-ready|source-closed|externally ready)/i)
  })
})
