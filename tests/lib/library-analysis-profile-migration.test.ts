import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const previous = readFileSync(
  'prisma/migrations/20260823_library_analysis_prompt_1_0_23/migration.sql',
  'utf8',
)
const current = readFileSync(
  'prisma/migrations/20260909_library_analysis_prompt_1_0_24/migration.sql',
  'utf8',
)

const hashChanges = new Map([
  ['5794414381dc0c90ade32eac4c36a52a49bdd203f7d93213c7a2851d3620da15', '6cf060374095c957622f85e564cb4a54289204771b48d4a089ca9caf7d4232ec'],
  ['7dccdf2f546b2ddde693f5c361c20e6467e66a02bf11a6750ca8265271f9a2cd', '9102479172020252a62c5d8cce4762872ab97f8b2b077adad2382bcf685340e3'],
  ['06c88137dd654376edb65493ac6eb041661385c578f35475036e4cf1ab55d8ec', '71e2e5a9ff4ca20bd2b4c87d305b34f20426c11e7c4d467e203771ac9ee25acc'],
  ['861563dbf1a9494752b8ef359a1f6b7717911942dbebe170aba0b60c9d98e0b8', '82f61c3911262c110eb281d95a2378153001e69a71ce6d573415511b899f1f87'],
])

function functionBody(sql: string): string {
  const start = sql.indexOf('CREATE OR REPLACE FUNCTION')
  assert.notEqual(start, -1)
  return sql.slice(start)
}

test('1.0.24 migration changes only the two profile versions and four sealed hashes', () => {
  let normalized = functionBody(current).replaceAll('1.0.24', '1.0.23')
  for (const [nextHash, previousHash] of hashChanges) {
    assert.equal((current.match(new RegExp(nextHash, 'g')) ?? []).length, 1)
    normalized = normalized.replace(nextHash, previousHash)
  }
  assert.equal(normalized, functionBody(previous))
})

test('profile migration remains an idempotent function replacement without authority or data changes', () => {
  assert.equal((current.match(/CREATE OR REPLACE FUNCTION/gu) ?? []).length, 1)
  assert.doesNotMatch(current, /\b(?:GRANT|ALTER ROLE|CREATE ROLE|DROP ROLE)\b/iu)
  assert.match(current.trimEnd(), /\$function\$;$/u)
  assert.match(current, /run_row\."outputProfile" = 'candidate_only'/u)
  assert.match(current, /write_payload->>'promotionState' <> 'candidate'/u)
})
