import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(path, 'utf8')

const section = (document: string, heading: string) => {
  const marker = `## ${heading}\n`
  const start = document.indexOf(marker)
  assert.notEqual(start, -1, `missing ${heading} section`)
  const bodyStart = start + marker.length
  const next = document.indexOf('\n## ', bodyStart)
  return document.slice(bodyStart, next === -1 ? undefined : next)
}

const inlineUnion = (block: string, lineIncludes: string) => {
  const line = block
    .split('\n')
    .find((candidate) => candidate.includes(lineIncludes))
  assert.ok(line, `missing contract line containing ${lineIncludes}`)
  const union = [...line.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1])
    .find((value) => value.includes(' | '))
  assert.ok(union, `missing literal union on ${lineIncludes} line`)
  return union.split(' | ')
}

const expectedCandidateRoles = [
  'summary',
  'proposition',
  'observation',
  'classification_label',
  'entity_candidate',
  'relationship_candidate',
  'quantitative_observation',
  'coverage_signal',
  'gap',
  'contradiction',
  'source_role_suggestion',
  'reason',
  'worker_reference',
  'checkpoint',
  'scope_reference',
  'limitation',
]

const expectedReferenceTypes = [
  'content_unit',
  'run',
  'artifact',
  'assertion',
  'evidence_link',
  'dependency',
  'reconciliation',
]

const assertPayloadContract = (contract: string) => {
  const payload = section(contract, 'Machine payload grammar')

  assert.match(payload, /strict typed candidate entries/i)
  assert.match(payload, /exactly `\{ namespace, kind, data: \{ entries \} \}`/i)
  assert.deepEqual(inlineUnion(payload, '`kind` is exactly'), [
    'assertion',
    'artifact',
    'run_event',
    'reconciliation',
  ])
  assert.match(payload, /`namespace` is exactly `candidate`/i)
  assert.match(payload, /`data` contains only a non-empty `entries` array/i)
  assert.match(
    payload,
    /envelope, `data` object and every entry reject unknown keys/i,
  )
  assert.deepEqual(inlineUnion(payload, 'allowlisted role'), expectedCandidateRoles)
  assert.deepEqual(
    [...payload.matchAll(/^- `([^`]+)`:/gm)].map((match) => match[1]),
    ['text', 'number', 'flag', 'reference'],
  )
  assert.deepEqual(
    inlineUnion(payload, '`targetType` is exactly'),
    expectedReferenceTypes,
  )
  assert.match(payload, /free text.*candidate text.*never.*status.*decision/i)
}

const assertWorkflowPromptContract = (contract: string) => {
  const integrity = section(contract, 'Integrity sealing')
  const workflowLine = integrity
    .split('\n')
    .find((line) => line.startsWith('- Workflow file'))
  const promptLine = integrity
    .split('\n')
    .find((line) => line.startsWith('- Prompt file'))

  assert.ok(workflowLine, 'missing workflow binding line')
  assert.ok(promptLine, 'missing prompt binding line')

  for (const literal of [
    'workflow.candidate_analysis.v1',
    'prompt.candidate_analysis.v1',
    '1.0.0',
    'knowledge/corpus/workflows/candidate-analysis-v1.md',
    'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md',
  ]) {
    assert.ok(workflowLine.includes(`\`${literal}\``), `workflow missing ${literal}`)
    assert.ok(promptLine.includes(`\`${literal}\``), `prompt missing ${literal}`)
  }
  assert.match(integrity, /each file is read exactly once as bytes/i)
  assert.match(integrity, /same immutable byte buffer.*SHA-256/i)
  assert.match(
    workflowLine,
    /Workflow file `knowledge\/corpus\/workflows\/candidate-analysis-v1\.md` has ID `workflow\.candidate_analysis\.v1` and version `1\.0\.0`/,
  )
  assert.match(
    workflowLine,
    /references the prompt's exact ID `prompt\.candidate_analysis\.v1`, version `1\.0\.0` and repository path `knowledge\/corpus\/workflows\/candidate-analysis-prompt-v1\.md`/,
  )
  assert.match(
    promptLine,
    /Prompt file `knowledge\/corpus\/workflows\/candidate-analysis-prompt-v1\.md` has ID `prompt\.candidate_analysis\.v1` and version `1\.0\.0`/,
  )
  assert.match(
    promptLine,
    /references the workflow's exact ID `workflow\.candidate_analysis\.v1`, version `1\.0\.0` and repository path `knowledge\/corpus\/workflows\/candidate-analysis-v1\.md`/,
  )
}

const assertPriorEventContract = (contract: string) => {
  const integrity = section(contract, 'Integrity sealing')

  assert.match(
    integrity,
    /`\(supersededEventId, supersededEventHash, runId, supersededEventScopeHash\)`/,
  )
  assert.match(integrity, /`\(id, eventHash, runId, scopeHash\)`/)
  assert.match(integrity, /`scopeHash = supersededEventScopeHash`/)
  assert.match(
    integrity,
    /`CandidateRunEvent_supersession_hash_scope_fkey`/,
  )
}

const assertRecoveryContract = (contract: string) => {
  const roles = section(contract, 'Database roles')

  assert.match(
    roles,
    /bootstrap grants -> enable existing credentials -> verify worker -> verify reconciler/i,
  )
  assert.match(
    roles,
    /`scripts\/enable-candidate-analysis-logins\.sh --apply --confirm-existing-credentials`/,
  )
  assert.match(roles, /does not provision.*credentials/i)
  assert.match(roles, /fail.*back.*disabled state/i)
  assert.match(roles, /both roles are `NOLOGIN`/i)
  assert.match(roles, /INSERT grants are revoked/i)
  assert.match(roles, /candidate sessions are terminated/i)
  assert.match(roles, /candidate rows are preserved/i)
}

const assertNoStaleRecoveryGuidance = (contract: string) => {
  const normalizedContract = contract.replace(/\s+/g, ' ')
  const sentences = normalizedContract.split(/(?<=[.!?])\s+/)
  const loginEffect =
    /\b(?:restor(?:e|es|ed|ing)|(?:re[ -]?)?enabl(?:e|es|ed|ing))\b[^.!?;]{0,80}?\bLOGIN\b/gi
  const directlyNegatedEffect =
    /\b(?:(?:do(?:es)?|did|can|could|must|should|will|would)\s+not|cannot|can't|never|won't|mustn't|shouldn't|wouldn't|couldn't|doesn't|(?:is|are|was|were)\s+not\s+able\s+to|(?:isn't|aren't|wasn't|weren't)\s+able\s+to)\s*$/i
  const directlyNegatedInstruction =
    /\b(?:do\s+not|don't|never|must\s+not|mustn't)\s+(?:run|rerun|re-run|re run|use)(?:\s+the)?\s+bootstrap(?:\s+to)?\s*$/i
  const continuationPronoun = /^(?:it|this|that)\b/i
  const continuationAuxiliary =
    /^(?:can|cannot|can't|could|couldn't|may|might|must|mustn't|shall|should|shouldn't|will|won't|would|wouldn't|do|does|doesn't|did|didn't|is|isn't|are|aren't|was|wasn't|were|weren't|has|hasn't|have|haven't|had|hadn't)\b/i
  const continuationEffect =
    /^(?:restor(?:e|es|ed|ing)|(?:re[ -]?)?enabl(?:e|es|ed|ing))\b/i
  const inheritsBootstrapSubject = (clause: string) => {
    if (continuationPronoun.test(clause)) return true

    const withoutContinuationAdverbs = clause.replace(
      /^(?:(?:still|also|even)\s+)+/i,
      '',
    )
    return (
      continuationAuxiliary.test(withoutContinuationAdverbs) ||
      continuationEffect.test(withoutContinuationAdverbs)
    )
  }

  for (const sentence of sentences) {
    const clauses = sentence.split(
      /\s*(?:;(?:\s*(?:however|yet)\b,?)?|,?\s*\b(?:but|however|yet)\b,?)\s*/i,
    )
    let bootstrapSubject = false

    for (const clause of clauses) {
      const namesBootstrap = /\bbootstrap\b/i.test(clause)
      const inheritsBootstrap: boolean =
        bootstrapSubject && inheritsBootstrapSubject(clause)
      const hasBootstrapSubject = namesBootstrap || inheritsBootstrap

      if (hasBootstrapSubject) {
        for (const match of clause.matchAll(loginEffect)) {
          const effectLead = clause.slice(0, match.index ?? 0)

          if (
            directlyNegatedEffect.test(effectLead) ||
            directlyNegatedInstruction.test(effectLead)
          ) {
            continue
          }

          assert.fail(`stale bootstrap LOGIN recovery guidance: ${clause}`)
        }
      }

      bootstrapSubject = namesBootstrap || inheritsBootstrap
    }
  }
}

const assertDurableContract = (contract: string) => {
  assertPayloadContract(contract)
  assertWorkflowPromptContract(contract)
  assertPriorEventContract(contract)
  assertRecoveryContract(contract)
  assertNoStaleRecoveryGuidance(contract)
}

const mutateSection = (
  document: string,
  heading: string,
  mutate: (block: string) => string,
) => {
  const block = section(document, heading)
  const mutated = mutate(block)
  assert.notEqual(mutated, block, `mutation did not change ${heading}`)
  return document.replace(block, mutated)
}

const replaceRequired = (value: string, from: string, to: string) => {
  assert.ok(value.includes(from), `mutation source missing: ${from}`)
  return value.replace(from, to)
}

test('autonomous analysis is permissive at candidate creation and strict at authority promotion', () => {
  const root = read('AGENTS.md')
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const protocol = read('knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md')
  const candidateWorkflow = read('knowledge/corpus/workflows/candidate-analysis-v1.md')
  const strictWorkflow = read('knowledge/corpus/workflows/source-analysis-v1.md')

  assert.match(root, /KI may append candidate-only analysis/i)
  assert.match(contract, /confidence is not authority/i)
  assert.match(contract, /exact \| provisional \| unresolved/)
  assert.match(protocol, /stable, readable and hash-bound input/i)
  assert.match(candidateWorkflow, /Workflow ID: `workflow\.candidate_analysis\.v1`/)
  assert.match(candidateWorkflow, /must not create or modify human review, canonical data, publication or coverage/i)
  assert.match(strictWorkflow, /high-assurance profile/i)
  assert.match(strictWorkflow, /not the only permitted candidate-analysis route/i)
})

test('legacy guides reject generic mutable writes for candidate history', () => {
  const database = read('.claude/database.md')
  const research = read('.claude/research-workflows.md')
  const imports = read('.claude/data-imports.md')

  assert.match(database, /CandidateAnalysisRun/)
  assert.match(research, /workflow\.candidate_analysis\.v1/)
  assert.match(imports, /never use generic upsert or update for candidate history/i)
})

test('candidate SQL is internal, parameterized, non-data-mutating, and limited to integrity checks', () => {
  const root = read('AGENTS.md')
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  for (const authorityText of [root, contract]) {
    assert.match(authorityText, /narrow, parameterized, internal SQL/i)
    assert.match(authorityText, /transaction-scoped advisory run\/assertion locks/i)
    assert.match(authorityText, /change transaction lock state only/i)
    assert.match(authorityText, /recursive dependency-integrity/i)
    assert.match(authorityText, /must not be exposed/i)
    assert.match(authorityText, /must not mutate candidate history/i)
  }
})

test('recursive authority preserves limitations and requires independent direct evidence for upgrades', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assert.match(contract, /inherited limitations are always mandatory/i)
  assert.match(contract, /weakest upstream authority/i)
  assert.match(contract, /own direct supporting.*CandidateEvidenceLink/i)
  assert.match(contract, /dependent run.*inputHash.*contentHash/i)
  assert.match(contract, /upstream_authority_upgrade/)
  assert.match(contract, /no machine lineage changes human review or promotion state/i)
})

test('corrections append explicit supersession links for every authority history', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assert.match(contract, /candidate correction.*append.*new candidate event.*superseded candidate event hash/i)
  assert.match(contract, /human-review correction.*append.*new human-review decision.*superseded human-review receipt hash/i)
  assert.match(contract, /promotion correction.*append.*new promotion receipt.*superseded promotion receipt hash/i)
})

test('authority contract documents domain-separated sealing and receipt bindings', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assert.match(contract, /food-systems\/<domain>\/v1\\n/i)
  assert.match(contract, /run-input-envelope/)
  assert.match(contract, /run-scope/)
  assert.match(contract, /output-manifest/)
  assert.match(
    contract,
    /complete sorted artifact, assertion, evidence-link, dependency and reconciliation/i,
  )
  assert.match(contract, /stored row metadata/i)
  assert.match(contract, /human-review-decision/)
  assert.match(contract, /promotion-decision/)
  assert.match(contract, /prior ID.*prior hash.*same run scope/i)
  assert.match(contract, /target profile hash.*policy hash.*target-set hash.*result hash/i)
})

test('candidate workflow and canonical prompt are distinct immutable bindings', () => {
  const workflowPath = 'knowledge/corpus/workflows/candidate-analysis-v1.md'
  const promptPath =
    'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md'

  assert.equal(existsSync(promptPath), true, 'canonical candidate prompt missing')
  const workflow = read(workflowPath)
  const prompt = read(promptPath)
  const sha256 = (value: string) =>
    createHash('sha256').update(value, 'utf8').digest('hex')

  assert.match(workflow, /Prompt template ID: `prompt\.candidate_analysis\.v1`/)
  assert.match(workflow, /Prompt template version: `1\.0\.0`/)
  assert.match(workflow, new RegExp(promptPath.replaceAll('.', '\\.')))
  assert.match(prompt, /Prompt template ID: `prompt\.candidate_analysis\.v1`/)
  assert.match(prompt, /Prompt template version: `1\.0\.0`/)
  assert.match(prompt, /Workflow ID: `workflow\.candidate_analysis\.v1`/)
  assert.notEqual(sha256(workflow), sha256(prompt))
})

test('package exposes the guarded existing-credential login recovery command', () => {
  const packageJson = JSON.parse(read('package.json')) as {
    scripts: Record<string, string>
  }

  assert.equal(
    packageJson.scripts['candidate:roles:enable'],
    'scripts/enable-candidate-analysis-logins.sh',
  )
})

test('durable contract limits structured machine output to typed candidate entries', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assertPayloadContract(contract)
})

test('durable contract binds workflow and prompt mutual references to single-read exact bytes', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assertWorkflowPromptContract(contract)
})

test('durable contract records complete prior event identity and its database foreign key', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assertPriorEventContract(contract)
})

test('durable recovery chain uses existing credentials and fails back to disabled', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')

  assertRecoveryContract(contract)
})

test('durable contract assertions reject reviewed authority and recovery mutations', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutations: Array<{ name: string; value: string }> = [
    {
      name: 'namespace literal',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(block, '`namespace` is exactly `candidate`', '`namespace` is candidate-like'),
      ),
    },
    {
      name: 'kind literals',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(
          block,
          'assertion | artifact | run_event | reconciliation',
          'assertion | artifact | reconciliation',
        ),
      ),
    },
    {
      name: 'data entries only',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(
          block,
          '`data` contains only a non-empty `entries` array',
          '`data` may contain an `entries` array',
        ),
      ),
    },
    {
      name: 'unknown keys',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(block, 'reject unknown keys', 'ignore unknown keys'),
      ),
    },
    {
      name: 'role literals',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(block, ' | limitation`', '`'),
      ),
    },
    {
      name: 'valueType literals',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(block, '- `flag`:', '- `boolean`:'),
      ),
    },
    {
      name: 'referenceType literals',
      value: mutateSection(contract, 'Machine payload grammar', (block) =>
        replaceRequired(
          block,
          '`targetType` is exactly `content_unit | run | artifact | assertion | evidence_link | dependency | reconciliation`',
          '`targetType` is exactly `content_unit | run | artifact | assertion | evidence_link | dependency`',
        ),
      ),
    },
    ...[
      'workflow.candidate_analysis.v1',
      'prompt.candidate_analysis.v1',
      '1.0.0',
      'knowledge/corpus/workflows/candidate-analysis-v1.md',
      'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md',
    ].map((literal) => ({
      name: `workflow prompt binding ${literal}`,
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(block, `\`${literal}\``, `\`detached:${literal}\``),
      ),
    })),
    {
      name: 'single byte read',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(block, 'read exactly once as bytes', 'read as text when needed'),
      ),
    },
    {
      name: 'same bytes hashed',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(block, 'same immutable byte buffer', 'a later file read'),
      ),
    },
    {
      name: 'workflow references prompt',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(block, "references the prompt's exact ID", 'mentions a prompt'),
      ),
    },
    {
      name: 'prompt references workflow',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(block, "references the workflow's exact ID", 'mentions a workflow'),
      ),
    },
    {
      name: 'complete prior event tuple',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(
          block,
          '(supersededEventId, supersededEventHash, runId, supersededEventScopeHash)',
          '(supersededEventId, supersededEventHash, runId)',
        ),
      ),
    },
    {
      name: 'referenced event tuple',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(
          block,
          '(id, eventHash, runId, scopeHash)',
          '(id, eventHash, runId)',
        ),
      ),
    },
    {
      name: 'event scope equality',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(
          block,
          'scopeHash = supersededEventScopeHash',
          'scopeHash may differ from supersededEventScopeHash',
        ),
      ),
    },
    {
      name: 'named event foreign key',
      value: mutateSection(contract, 'Integrity sealing', (block) =>
        replaceRequired(
          block,
          'CandidateRunEvent_supersession_hash_scope_fkey',
          'CandidateRunEvent_supersession_fkey',
        ),
      ),
    },
    {
      name: 'recovery command flags',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(
          block,
          'scripts/enable-candidate-analysis-logins.sh --apply --confirm-existing-credentials',
          'scripts/enable-candidate-analysis-logins.sh --apply',
        ),
      ),
    },
    {
      name: 'credential provisioning stopline',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(
          block,
          'does not provision, generate, rotate, change or log credentials',
          'may provision credentials',
        ),
      ),
    },
    {
      name: 'fail-back NOLOGIN',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(block, 'both roles are `NOLOGIN`', 'both roles keep their current login state'),
      ),
    },
    {
      name: 'fail-back INSERT revoke',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(block, 'INSERT grants are revoked', 'INSERT grants remain'),
      ),
    },
    {
      name: 'fail-back session termination',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(block, 'candidate sessions are terminated', 'candidate sessions remain'),
      ),
    },
    {
      name: 'fail-back row preservation',
      value: mutateSection(contract, 'Database roles', (block) =>
        replaceRequired(block, 'candidate rows are preserved', 'candidate rows may be deleted'),
      ),
    },
    {
      name: 'stale multiline bootstrap restores LOGIN instruction',
      value: mutateSection(
        contract,
        'Database roles',
        (block) => `${block}\nRe-run bootstrap\nto restore LOGIN.\n`,
      ),
    },
  ]

  for (const mutation of mutations) {
    assert.throws(
      () => assertDurableContract(mutation.value),
      (error: unknown) => error instanceof Error,
      `surviving contract mutation: ${mutation.name}`,
    )
  }
})

test('rejects stale recovery guidance bypass in a non-recovery section', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = mutateSection(
    contract,
    'Purpose',
    (block) => `${block}\nRe-run bootstrap\nto restore LOGIN.\n`,
  )

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects stale recovery guidance bypass after the final section', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nRe-run bootstrap\nto restore LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects stale re-enable LOGIN guidance inside the recovery section', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = mutateSection(
    contract,
    'Database roles',
    (block) => `${block}\nRe-run bootstrap\nto re-enable LOGIN.\n`,
  )

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects stale reenable LOGIN guidance outside the recovery section', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = mutateSection(
    contract,
    'Purpose',
    (block) => `${block}\nRe-run bootstrap to reenable LOGIN.\n`,
  )

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects trailing stale reenable LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nRe-run bootstrap to reenable LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('permits explicit bootstrap-does-not-restore-LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap does not restore LOGIN; use the explicit enable command.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('permits explicit bootstrap-cannot-enable-LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap cannot enable LOGIN; use the explicit enable command.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('permits explicit bootstrap-must-not-reenable-LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap must not re-enable LOGIN; use the explicit enable command.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('rejects positive LOGIN effect after unrelated bootstrap negation', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap does not provision credentials but enables LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects positive pronominal LOGIN effect after negated bootstrap effect', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot restore LOGIN but it does enable LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects positive pronominal LOGIN effect after semicolon however boundary', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot restore LOGIN; however, it does enable LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('permits bootstrap-is-not-able-to-enable-LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap is not able to enable LOGIN.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test("permits bootstrap-doesn't-restore-LOGIN guidance", () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap doesn't restore LOGIN.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('permits bootstrap-never-enables-LOGIN guidance', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap never enables LOGIN.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('permits directly negated bootstrap LOGIN instruction', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nDo not rerun bootstrap to enable LOGIN.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('rejects modal continuation after but with omitted bootstrap subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot enable LOGIN, but can enable LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects adverbial continuation after but with omitted bootstrap subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot enable LOGIN, but still enables LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects modal continuation after yet with omitted bootstrap subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot enable LOGIN, yet will enable LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('rejects adverbial continuation after semicolon with omitted bootstrap subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const mutated = `${contract}\nBootstrap cannot enable LOGIN; still enables LOGIN.\n`

  assert.throws(
    () => assertDurableContract(mutated),
    (error: unknown) => error instanceof Error,
  )
})

test('permits a human reviewer as an explicit post-contrast subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap cannot enable LOGIN, but a human reviewer can authorize the separate enable operation.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})

test('permits the explicit enable script as a post-contrast subject', () => {
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const controlled = `${contract}\nBootstrap cannot enable LOGIN, but the explicit enable script can set LOGIN.\n`

  assert.doesNotThrow(() => assertDurableContract(controlled))
})
