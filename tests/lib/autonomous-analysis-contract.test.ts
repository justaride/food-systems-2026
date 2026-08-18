import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(path, 'utf8')

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
