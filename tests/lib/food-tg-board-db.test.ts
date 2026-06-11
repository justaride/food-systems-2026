import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { foodTgClaimBoard, foodTgOpportunityRadar } from '../../src/lib/data/food-tg-mandate'
import {
  FOOD_TG_BOARD_SOURCE_PATH,
  claimBoardSeedRows,
  opportunitySeedRows,
} from '../../src/lib/food-tg-board-seed'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

test('Food TG board seed rows preserve the static mandate contract with stable provenance', () => {
  const claimRows = claimBoardSeedRows()
  const opportunityRows = opportunitySeedRows()

  assert.equal(claimRows.length, foodTgClaimBoard.length)
  assert.equal(opportunityRows.length, foodTgOpportunityRadar.length)
  assert.ok(claimRows.every(row => row.sourcePath === FOOD_TG_BOARD_SOURCE_PATH))
  assert.ok(opportunityRows.every(row => row.sourcePath === FOOD_TG_BOARD_SOURCE_PATH))
  assert.ok(claimRows.every(row => row.contentHash.length === 64))
  assert.ok(opportunityRows.every(row => row.contentHash.length === 64))
  assert.deepEqual(opportunityRows.map(row => row.rank), [1, 2, 3, 4, 5])
})

test('schema and migration define DB-backed claim and opportunity board tables', () => {
  const schema = read('prisma/schema.prisma')
  assert.match(schema, /model ClaimBoardEntry/)
  assert.match(schema, /model OpportunityEntry/)
  assert.match(schema, /model FoodTgBoardLedger/)
  assert.match(schema, /sourcePath\s+String/)
  assert.match(schema, /sourceUpdatedAt\s+DateTime/)
  assert.match(schema, /updatedAt\s+DateTime\s+@updatedAt/)

  const migration = read('prisma/migrations/20260611_food_tg_board_entries/migration.sql')
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "ClaimBoardEntry"/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "OpportunityEntry"/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "FoodTgBoardLedger"/)
})

test('import, audit, and docs wire the Food TG board tables into operations', () => {
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
  assert.equal(pkg.scripts['db:import:food-tg-board'], 'tsx scripts/import-food-tg-board.ts')
  assert.match(pkg.scripts['db:import:approved-corpus'], /db:import:food-tg-board/)

  const importer = read('scripts/import-food-tg-board.ts')
  assert.match(importer, /claimBoardSeedRows/)
  assert.match(importer, /opportunitySeedRows/)
  assert.match(importer, /\.upsert\(/)
  assert.match(importer, /foodTgBoardLedger\.upsert/)

  const audit = read('scripts/verify-data-integrity.ts')
  assert.match(audit, /checkFoodTgBoardTables/)
  assert.match(audit, /claimBoardEntry\.count/)
  assert.match(audit, /opportunityEntry\.count/)

  assert.match(read('.claude/database.md'), /ClaimBoardEntry/)
  assert.match(read('.claude/data-imports.md'), /import-food-tg-board\.ts/)
})

test('/mandat renders DB view-model rows with visible per-row update dates and static fallback marking', () => {
  const page = read('src/app/mandat/page.tsx')
  assert.match(page, /getFoodTgBoard/)
  assert.match(page, /async function MandatPage/)

  const query = read('src/lib/queries/food-tg-board.ts')
  assert.match(query, /claimBoardEntry\.findMany/)
  assert.match(query, /opportunityEntry\.findMany/)
  assert.match(query, /static-fallback/)

  const content = read('src/app/mandat/MandatContent.tsx')
  assert.doesNotMatch(content, /foodTgClaimBoard\.map/)
  assert.doesNotMatch(content, /foodTgOpportunityRadar\.map/)
  assert.match(content, /claimBoard\.map/)
  assert.match(content, /opportunityRadar\.map/)
  assert.match(content, /Oppdatert/)
  assert.match(content, /statisk fallback/)
})
