import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function read(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

function model(schema: string, name: string): string {
  const match = schema.match(new RegExp(`model ${name} \\{[\\s\\S]*?\\n\\}`))
  assert.ok(match, `missing Prisma model ${name}`)
  return match[0]
}

describe('Food TG board schema contract', () => {
  it('keeps the three database-backed board models in Prisma', () => {
    const schema = read('prisma/schema.prisma')
    const claim = model(schema, 'ClaimBoardEntry')
    const opportunity = model(schema, 'OpportunityEntry')
    const ledger = model(schema, 'FoodTgBoardLedger')

    assert.match(claim, /claimId\s+String/)
    assert.match(claim, /sourceUpdatedAt\s+DateTime/)
    assert.match(claim, /@@index\(\[status\]\)/)

    assert.match(opportunity, /rank\s+Int\s+@unique/)
    assert.match(opportunity, /statuses\s+String\[\]/)
    assert.match(opportunity, /sourceIds\s+String\[\]/)

    assert.match(ledger, /snapshot\s+Json/)
    assert.match(ledger, /@@unique\(\[entryType, entryId, contentHash\]\)/)
  })

  it('ships the idempotent historical migration for those models', () => {
    const sql = read('prisma/migrations/20260611_food_tg_board_entries/migration.sql')

    assert.equal((sql.match(/CREATE TABLE IF NOT EXISTS/g) ?? []).length, 3)
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "ClaimBoardEntry"/)
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "OpportunityEntry"/)
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "FoodTgBoardLedger"/)
    assert.match(sql, /FoodTgBoardLedger_entryType_entryId_contentHash_key/)
  })
})
