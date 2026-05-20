import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('producer separation migration', () => {
  const sql = readFileSync('prisma/migrations/20260520_producer_separation/migration.sql', 'utf8')
  it('creates the Producer table idempotently', () => {
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "Producer"/)
  })
  it('guards the data move so it runs once', () => {
    assert.match(sql, /IF EXISTS \(SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production'/)
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
