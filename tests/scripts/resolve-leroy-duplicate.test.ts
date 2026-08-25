import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Speiler tests/scripts/extend-board-coverage-brreg.test.ts: importerer det
// DB-baserte skriptet UTEN at main() kjører (pathToFileURL-guard), og tester
// den rene, eksporterte kjernen.
//
// Denne fila dekker en sletting mot prod. Den kjørte aldri før testene fantes.
describe('resolve-leroy-duplicate', () => {
  it('kan importeres uten å kjøre den DB-baserte CLI-en', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/resolve-leroy-duplicate?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      // ---- identiteter ----
      // Årsrapporten oppgir selv «identification number 975 350 940»;
      // 975320637 gir 404 i Enhetsregisteret. Bytter noen om på disse to,
      // sletter skriptet det ekte selskapet.
      assert.equal(mod.CANONICAL_ORGNR, '975350940')
      assert.equal(mod.DUPLICATE_ORGNR, '975320637')

      // ---- parseArgs ----
      assert.deepEqual(mod.parseArgs([]), { apply: false, jsonOut: null })
      assert.equal(mod.parseArgs(['--apply']).apply, true)
      assert.equal(mod.parseArgs(['--json-out=rapport.json']).jsonOut, 'rapport.json')
      assert.throws(() => mod.parseArgs(['--bogus']), /Ukjent argument/)
      assert.throws(() => mod.parseArgs(['--json-out=']), /Ugyldig --json-out/)

      // Tørrkjøring er default. Hvis dette noen gang flippes, skriver en
      // argumentløs kjøring mot prod.
      assert.equal(mod.parseArgs([]).apply, false)

      const zero = (): Record<string, number> => ({
        financials: 0,
        shareholders: 0,
        boardMembers: 0,
        subsidies: 0,
        documentRefs: 0,
        actor: 0,
        ownershipAsParent: 0,
        ownershipAsChild: 0,
        ownedProperties: 0,
        tenantProperties: 0,
        relationshipsFrom: 0,
        relationshipsTo: 0,
        aquacultureSites: 0,
        aquacultureApps: 0,
        deliveriesAsSupplier: 0,
        deliveriesAsBuyer: 0,
        deliveriesBySupplierOrgNr: 0,
      })

      // ---- blockingDependencies ----
      assert.deepEqual(mod.blockingDependencies(zero()), [])

      // De to kastbare teller ikke som blokkerende.
      assert.deepEqual(mod.blockingDependencies({ ...zero(), financials: 1, shareholders: 1 }), [])

      // Alt annet gjør det — én sjekk per felt, ellers kan et felt falle ut
      // av guarden uten at noen test merker det.
      for (const field of [
        'boardMembers',
        'subsidies',
        'documentRefs',
        'actor',
        'ownershipAsParent',
        'ownershipAsChild',
        'ownedProperties',
        'tenantProperties',
        'relationshipsFrom',
        'relationshipsTo',
        'aquacultureSites',
        'aquacultureApps',
        'deliveriesAsSupplier',
        'deliveriesAsBuyer',
        'deliveriesBySupplierOrgNr',
      ]) {
        assert.deepEqual(
          mod.blockingDependencies({ ...zero(), [field]: 2 }),
          [`${field}=2`],
          `${field} må blokkere sletting`,
        )
      }

      // ---- planFinancialCorrection ----
      // Manglende rad er 'create', ikke en stille no-op.
      assert.equal(mod.planFinancialCorrection(null).action, 'create')

      // De faktiske prod-verdiene på den kanoniske raden (34009 / 1561 / 4.6),
      // merket «Årsrapport 2024» — som de motsier.
      const fromProd = mod.planFinancialCorrection({
        id: 'x',
        year: 2024,
        revenueNok: '34009',
        operatingResult: '1561',
        operatingMargin: '4.6',
        source: 'Årsrapport 2024',
      })
      assert.equal(fromProd.action, 'update')
      assert.deepEqual(
        fromProd.changes.map((c: { field: string }) => c.field).sort(),
        ['operatingMargin', 'operatingResult', 'revenueNok', 'source'],
      )

      // Allerede riktige tall gir 'unchanged' — kjøringen er idempotent.
      assert.equal(
        mod.planFinancialCorrection({
          id: 'x',
          year: 2024,
          revenueNok: '31124691000',
          operatingResult: '2964266000',
          operatingMargin: '9.52',
          source: mod.FY2024.source,
        }).action,
        'unchanged',
      )

      // Decimal-felt kommer ut av Prisma som strenger; sammenlikningen må
      // være numerisk, ellers ser 31124691000 og '31124691000.00' ut som
      // en endring.
      assert.equal(
        mod.planFinancialCorrection({
          id: 'x',
          year: 2024,
          revenueNok: '31124691000.00',
          operatingResult: '2964266000.00',
          operatingMargin: '9.52',
          source: mod.FY2024.source,
        }).action,
        'unchanged',
      )

      // ---- tallene mot årsrapporten ----
      // Rapporten oppgir 31 124 691 / 2 964 266 i NOK 1 000. Lagres i RÅ NOK,
      // som er enheten normaliseringssporet valgte.
      assert.equal(mod.FY2024.revenueNok, 31_124_691_000)
      assert.equal(mod.FY2024.operatingResult, 2_964_266_000)

      // Enhetsvakt: et tilbakefall til MNOK ville lagret 31125 og lest som
      // 31 125 kroner etter normaliseringen — feil med faktor 10^6. Lerøy
      // omsetter for titalls milliarder, så rå NOK må ligge over 10^9.
      assert.ok(mod.FY2024.revenueNok > 1e9, 'revenueNok må være rå NOK, ikke MNOK')
      assert.ok(mod.FY2024.operatingResult > 1e9, 'operatingResult må være rå NOK, ikke MNOK')
      const impliedMargin = (mod.FY2024.operatingResult / mod.FY2024.revenueNok) * 100
      assert.ok(
        Math.abs(impliedMargin - mod.FY2024.operatingMargin) < 0.05,
        `margin ${mod.FY2024.operatingMargin} stemmer ikke med ${impliedMargin}`,
      )

      // ---- skrivestien ----
      type Call = { op: string; args: unknown }
      const makeClient = (calls: Call[]) => ({
        company: {
          findUnique: async () => null,
          delete: async (args: unknown) => {
            calls.push({ op: 'company.delete', args })
            return {}
          },
        },
        companyFinancial: {
          findFirst: async () => null,
          create: async (args: unknown) => {
            calls.push({ op: 'financial.create', args })
            return {}
          },
          update: async (args: unknown) => {
            calls.push({ op: 'financial.update', args })
            return {}
          },
          deleteMany: async (args: unknown) => {
            calls.push({ op: 'financial.deleteMany', args })
            return {}
          },
        },
        shareholder: {
          deleteMany: async (args: unknown) => {
            calls.push({ op: 'shareholder.deleteMany', args })
            return {}
          },
        },
      })

      // Tørrkjøring skriver ingenting — verken retting eller sletting.
      const dryCalls: Call[] = []
      const dryClient = makeClient(dryCalls)
      await mod.applyFinancialCorrection(dryClient, 'canon', { action: 'update', changes: [{ field: 'x', from: 'a', to: 'b' }] }, false)
      await mod.deleteDuplicate(dryClient, 'dupe', zero(), false)
      assert.deepEqual(dryCalls, [], 'tørrkjøring skrev til DB')

      // 'unchanged' skriver ikke, heller ikke med --apply.
      const noopCalls: Call[] = []
      await mod.applyFinancialCorrection(makeClient(noopCalls), 'canon', { action: 'unchanged', changes: [] }, true)
      assert.deepEqual(noopCalls, [])

      // Ekte kjøring: rettingen treffer den kanoniske raden på (companyId, year).
      const applyCalls: Call[] = []
      await mod.applyFinancialCorrection(makeClient(applyCalls), 'canon', { action: 'update', changes: [{ field: 'x', from: 'a', to: 'b' }] }, true)
      assert.equal(applyCalls.length, 1)
      assert.equal(applyCalls[0].op, 'financial.update')
      const where = (applyCalls[0].args as { where: { companyId_year: { companyId: string; year: number } } }).where
      assert.deepEqual(where.companyId_year, { companyId: 'canon', year: 2024 })

      // Ekte sletting rydder barna før forelderen — motsatt rekkefølge feiler
      // på fremmednøkkelen.
      const delCalls: Call[] = []
      await mod.deleteDuplicate(makeClient(delCalls), 'dupe', zero(), true)
      assert.deepEqual(
        delCalls.map(c => c.op),
        ['financial.deleteMany', 'shareholder.deleteMany', 'company.delete'],
      )

      // Guarden ligger INNE i funksjonen: en kaller som ikke sjekket
      // blockingDependencies selv skal ikke kunne slette likevel.
      const blockedCalls: Call[] = []
      await assert.rejects(
        () => mod.deleteDuplicate(makeClient(blockedCalls), 'dupe', { ...zero(), boardMembers: 3 }, true),
        /Nekter å slette/,
      )
      assert.deepEqual(blockedCalls, [], 'slettingen skrev før guarden slo til')
    } finally {
      console.log = originalLog
    }
  })
})
