import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('Producer schema', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  it('defines a Producer model', () => {
    assert.match(schema, /model Producer \{/)
  })
  it('Subsidy keeps companyId and adds producerId (both optional)', () => {
    const block = schema.slice(schema.indexOf('model Subsidy'), schema.indexOf('model Subsidy') + 800)
    assert.match(block, /companyId\s+String\?/)
    assert.match(block, /producerId\s+String\?/)
    assert.match(block, /company\s+Company\?/)
    assert.match(block, /producer\s+Producer\?/)
  })
  it('DeliveryVolume keeps supplier (Company) and adds supplierProducer (Producer)', () => {
    const block = schema.slice(schema.indexOf('model DeliveryVolume'), schema.indexOf('model DeliveryVolume') + 900)
    assert.match(block, /supplier\s+Company\?\s+@relation\("DeliverySupplier"/)
    assert.match(block, /supplierProducer\s+Producer\?\s+@relation\("DeliverySupplierProducer"/)
  })
})
