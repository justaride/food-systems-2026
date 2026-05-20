import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('producer separation migration', () => {
  const sql = readFileSync('prisma/migrations/20260520_producer_separation/migration.sql', 'utf8')
  it('creates the Producer table idempotently', () => {
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "Producer"/)
  })
  it('migrates only genuine leaf producers, excluding companies with curated relations', () => {
    assert.match(sql, /CREATE TEMP TABLE "_producer_migration_ids"/)
    assert.match(sql, /"valueChainStage" = 'production'/)
    assert.match(sql, /NOT EXISTS \(SELECT 1 FROM "CompanyOwnership"/)
    assert.match(sql, /IF EXISTS \(SELECT 1 FROM "_producer_migration_ids"\)/)
  })
  it('copies producer rows without clobbering on re-apply', () => {
    assert.match(sql, /ON CONFLICT \("id"\) DO NOTHING/)
  })
  it('keeps Subsidy.companyId and adds producerId (dual FK)', () => {
    assert.match(sql, /ADD COLUMN IF NOT EXISTS "producerId"/)
    assert.ok(!/DROP COLUMN[^\n]*"companyId"/.test(sql), 'companyId must NOT be dropped')
  })
  it('keeps DeliveryVolume.supplierId and adds supplierProducerId', () => {
    assert.match(sql, /ADD COLUMN IF NOT EXISTS "supplierProducerId"/)
  })
  it('enforces the dual-FK exactly-one CHECK constraints', () => {
    assert.match(sql, /Subsidy_recipient_exactly_one/)
    assert.match(sql, /DeliveryVolume_supplier_exactly_one/)
  })
})
