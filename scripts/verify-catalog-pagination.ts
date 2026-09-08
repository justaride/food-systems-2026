/** Read-only HTTP acceptance: complete paging, filter reset and bounded payloads. */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
async function main() {
  const base = process.argv[2] ?? 'http://localhost:3015', output = process.argv[3]
  const checks = []
  for (const kind of ['documents', 'actors', 'sources']) {
    const read = async (p: Record<string, string>) => {
      const started = Date.now(), res = await fetch(`${base}/api/catalog?${new URLSearchParams({ kind, ...p })}`)
      assert.equal(res.status, 200)
      const text = await res.text(), data = JSON.parse(text)
      assert.ok(data.rows.length <= 50); assert.equal(data.pageSize, 50)
      checks.push({ kind, params: p, total: data.total, page: data.page, rows: data.rows.length, bytes: Buffer.byteLength(text), ms: Date.now() - started })
      return data
    }
    const first = await read({ page: '1' }), second = await read({ page: '2' })
    if (first.total > 50) assert.ok(!second.rows.some((r: { id: string }) => first.rows.some((f: { id: string }) => r.id === f.id)))
    const last = await read({ page: '999999999999' }); assert.equal(last.page, last.lastPage)
    const none = await read({ page: '88', q: 'no-such-food-record-987654321' }); assert.equal(none.total, 0); assert.equal(none.page, 1)
    const q = kind === 'actors' ? 'Oslo Economics' : 'Nofima'
    const filtered = await read({ q }); assert.ok(filtered.total > 0)
  }
  if (output) writeFileSync(output, JSON.stringify({ base, capturedAt: new Date().toISOString(), checks }, null, 2)+'\n')
  console.log(JSON.stringify(checks))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
