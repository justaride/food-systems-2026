import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Speiler tests/scripts/analyze-board-interlocks.test.ts: importerer det
// DB-baserte skriptet UTEN at main() kjører (pathToFileURL-guard), og tester
// den rene, eksporterte kjernen (arg-parsing, dekningsmatematikk, snapshot-indeks).
describe('extend-board-coverage-brreg', () => {
  it('kan importeres uten å kjøre den DB-baserte CLI-en', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/extend-board-coverage-brreg?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      // ---- parseArgs ----
      assert.deepEqual(mod.parseArgs([]), {
        sectors: ['inputs', 'seafood', 'production'],
        dryRun: false,
        limit: null,
        includeCovered: false,
        includeResigned: false,
        snapshotIn: null,
        snapshotOut: null,
      })
      const parsed = mod.parseArgs(['--dry-run', '--sectors=inputs,seafood', '--limit=5', '--include-covered', '--snapshot-in=foo.json'])
      assert.equal(parsed.dryRun, true)
      assert.deepEqual(parsed.sectors, ['inputs', 'seafood'])
      assert.equal(parsed.limit, 5)
      assert.equal(parsed.includeCovered, true)
      assert.equal(parsed.snapshotIn, 'foo.json')
      assert.throws(() => mod.parseArgs(['--bogus']), /Ukjent argument/)
      assert.throws(() => mod.parseArgs(['--limit=0']), /Ugyldig --limit/)

      // ---- summarizeCoverage (dekningsmatematikk) ----
      const cov = mod.summarizeCoverage(275, 129, [
        { sector: 'inputs', companies: 13, withBoard: 13 },
        { sector: 'seafood', companies: 21, withBoard: 18 },
      ])
      assert.equal(cov.universe, 275)
      assert.equal(cov.companiesWithBoard, 129)
      assert.equal(cov.pct, 0.4691) // 129/275
      assert.equal(cov.bySector[0].pct, 1) // 13/13
      assert.equal(cov.bySector[1].pct, 0.8571) // 18/21
      // Tom nevner gir 0, ikke NaN.
      assert.equal(mod.summarizeCoverage(0, 0, []).pct, 0)

      // ---- indexSnapshot ----
      const idx = mod.indexSnapshot({
        companies: [
          { orgNr: '911610744', boardMembers: [{ personName: 'A B', role: 'styremedlem', personKey: 'a-b' }] },
          { orgNr: 'bad', notBoard: true },
        ],
      })
      assert.equal(idx.size, 1)
      assert.equal(idx.get('911610744')?.length, 1)
      assert.equal(mod.indexSnapshot({}).size, 0)
      assert.equal(mod.indexSnapshot(null).size, 0)
    } finally {
      console.log = originalLog
    }
  })

  it('skrivestien: oppretter nye verv, re-stempler eksisterende, og respekterer --dry-run', async () => {
    const mod = await import(`../../scripts/extend-board-coverage-brreg?write=${Date.now()}`)
    const syncedAt = new Date('2026-08-25T12:00:00.000Z')

    type Call = { op: string; args: unknown }
    const makeClient = (existing: { id: string; personKey: string; personName: string; role: string }[]) => {
      const calls: Call[] = []
      return {
        calls,
        client: {
          boardMember: {
            findMany: async (args: unknown) => { calls.push({ op: 'findMany', args }); return existing },
            updateMany: async (args: unknown) => { calls.push({ op: 'updateMany', args }); return {} },
            create: async (args: unknown) => { calls.push({ op: 'create', args }); return {} },
          },
        },
      }
    }

    // --- 1. Tomt styre: alle rader er nye ---
    {
      const { calls, client } = makeClient([])
      const inserted = await mod.upsertBoardRows(
        client, 'cmp1', '911608103',
        [
          { personName: 'Jens Lippestad', role: 'styreleder', personKey: 'jens-lippestad' },
          { personName: 'Svenn Ivar Fure', role: 'CEO', personKey: 'svenn-ivar-fure' },
        ],
        false, syncedAt,
      )
      assert.equal(inserted, 2)
      const creates = calls.filter(c => c.op === 'create')
      assert.equal(creates.length, 2)
      assert.equal(calls.filter(c => c.op === 'updateMany').length, 0)
      const first = (creates[0].args as { data: Record<string, unknown> }).data
      assert.equal(first.companyId, 'cmp1')
      assert.equal(first.personKey, 'jens-lippestad')
      assert.equal(first.verifiedAt, syncedAt)
      // Provenans skal peke på det aktive orgnr-et, ikke et utgått.
      assert.match(String(first.sourceUrl), /911608103\/roller$/)
      // Nye rader får ingen effectiveTo — de teller som SITTENDE styre, som er
      // hele poenget med utvidelsen for AP-1s active-only-dekning.
      assert.equal('effectiveTo' in first, false)
    }

    // --- 2. Eksisterende rad med samme personKey+rolle: re-stemples, ikke duplisert ---
    {
      const { calls, client } = makeClient([
        { id: 'bm1', personKey: 'jens-lippestad', personName: 'Jens Lippestad', role: 'styreleder' },
      ])
      const inserted = await mod.upsertBoardRows(
        client, 'cmp1', '911608103',
        [{ personName: 'Jens Lippestad', role: 'styreleder', personKey: 'jens-lippestad' }],
        false, syncedAt,
      )
      assert.equal(inserted, 0)
      assert.equal(calls.filter(c => c.op === 'create').length, 0)
      const upd = calls.find(c => c.op === 'updateMany')
      assert.ok(upd, 'skal re-stemple provenans på eksisterende rad')
      const args = upd.args as { where: { id: { in: string[] } }; data: Record<string, unknown> }
      assert.deepEqual(args.where.id.in, ['bm1'])
      assert.equal(args.data.verifiedAt, syncedAt)
      // Re-stemplingen skal ikke røre navn/rolle/personKey.
      assert.deepEqual(Object.keys(args.data).sort(), ['source', 'sourceUrl', 'verifiedAt'])
    }

    // --- 3. Samme rolle, kompatibelt navn, ulik personKey: matches, ikke duplisert ---
    {
      const { calls, client } = makeClient([
        { id: 'bm2', personKey: 'annen-nokkel', personName: 'Jens Lippestad', role: 'styreleder' },
      ])
      const inserted = await mod.upsertBoardRows(
        client, 'cmp1', '911608103',
        [{ personName: 'Jens Lippestad', role: 'styreleder', personKey: 'jens-lippestad' }],
        false, syncedAt,
      )
      assert.equal(inserted, 0, 'navnekompatibel match skal hindre duplikat')
      assert.equal(calls.filter(c => c.op === 'create').length, 0)
    }

    // --- 4. Samme person, ANNEN rolle: er et eget verv og skal opprettes ---
    {
      const { calls, client } = makeClient([
        { id: 'bm3', personKey: 'jens-lippestad', personName: 'Jens Lippestad', role: 'styremedlem' },
      ])
      const inserted = await mod.upsertBoardRows(
        client, 'cmp1', '911608103',
        [{ personName: 'Jens Lippestad', role: 'styreleder', personKey: 'jens-lippestad' }],
        false, syncedAt,
      )
      assert.equal(inserted, 1)
      assert.equal(calls.filter(c => c.op === 'create').length, 1)
    }

    // --- 5. dry-run: teller likt, men skriver ingenting ---
    {
      const { calls, client } = makeClient([])
      const inserted = await mod.upsertBoardRows(
        client, 'cmp1', '911608103',
        [
          { personName: 'Jens Lippestad', role: 'styreleder', personKey: 'jens-lippestad' },
          { personName: 'Svenn Ivar Fure', role: 'CEO', personKey: 'svenn-ivar-fure' },
        ],
        true, syncedAt,
      )
      assert.equal(inserted, 2, 'dry-run skal rapportere samme antall som en ekte kjøring')
      assert.equal(calls.filter(c => c.op === 'create').length, 0)
      assert.equal(calls.filter(c => c.op === 'updateMany').length, 0)
    }

    // --- 6. Ingen rader inn: ingen skriving i det hele tatt ---
    {
      const { calls, client } = makeClient([])
      assert.equal(await mod.upsertBoardRows(client, 'cmp1', '911608103', [], false, syncedAt), 0)
      assert.equal(calls.filter(c => c.op !== 'findMany').length, 0)
    }
  })
})
