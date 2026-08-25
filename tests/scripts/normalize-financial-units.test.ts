import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Speiler tests/scripts/resolve-leroy-duplicate.test.ts: importerer det
// DB-baserte skriptet UTEN at main() kjører (pathToFileURL-guard), og tester
// den rene, eksporterte kjernen.
//
// Denne fila dekker en mutasjon av HVER pengerad i prod. En feil her ganger
// tall med en million i stillhet.
describe('normalize-financial-units', () => {
  it('kan importeres uten å kjøre den DB-baserte CLI-en', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/normalize-financial-units?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      // ---- parseArgs ----
      assert.deepEqual(mod.parseArgs([]), { apply: false, jsonOut: null })
      assert.equal(mod.parseArgs(['--apply']).apply, true)
      assert.equal(mod.parseArgs(['--json-out=rapport.json']).jsonOut, 'rapport.json')
      assert.throws(() => mod.parseArgs(['--bogus']), /Ukjent argument/)
      assert.throws(() => mod.parseArgs(['--json-out=']), /Ugyldig --json-out/)

      // Tørrkjøring er default. Hvis dette noen gang flippes, skriver en
      // argumentløs kjøring mot prod.
      assert.equal(mod.parseArgs([]).apply, false)

      // ---- classifyFinancialUnit ----
      // De fire rå-NOK-mønstrene, hver sporet til importskriptet sitt.
      assert.equal(
        mod.classifyFinancialUnit('https://data.brreg.no/regnskapsregisteret/regnskap/932324997'),
        'raw_nok',
      )
      assert.equal(mod.classifyFinancialUnit('Brønnøysund / offentligdata MCP 2026-03'), 'raw_nok')
      assert.equal(mod.classifyFinancialUnit('Broennoysund / offentligdata MCP 2026-03'), 'raw_nok')
      assert.equal(mod.classifyFinancialUnit('Regnskapsregisteret 2024'), 'raw_nok')
      assert.equal(mod.classifyFinancialUnit('Regnskapsregisteret 2025'), 'raw_nok')
      assert.equal(
        mod.classifyFinancialUnit('Leroey Annual Report 2024 / web research 2026-03'),
        'raw_nok',
      )

      // Kuraterte seed-kilder er MNOK.
      assert.equal(mod.classifyFinancialUnit('Årsrapport 2024'), 'million_nok')
      assert.equal(mod.classifyFinancialUnit('Estimat basert på bransjedata'), 'million_nok')
      assert.equal(mod.classifyFinancialUnit('Regnskap 2024'), 'million_nok')
      assert.equal(mod.classifyFinancialUnit('Proff.no 2023'), 'million_nok')

      // De fire kildene `financialAmountToNok` i dag BOMMER på. De er grunnen
      // til at klassifiseringen ikke gjenbruker nøkkelordlista på lesesiden.
      assert.equal(
        mod.classifyFinancialUnit('Hagar hf Ársreikningur 2023. ISK ~115B, 1 ISK ≈ 0.077 NOK'),
        'million_nok',
      )
      assert.equal(
        mod.classifyFinancialUnit('Axfood Annual and Sustainability Report 2025. SEK 89152m'),
        'million_nok',
      )
      assert.equal(
        mod.classifyFinancialUnit('https://sallinggroup.com/en/stores/key-figures'),
        'million_nok',
      )

      // `Regnskapsregisteret (Brønnøysund) API regnskap/982254604 … 5 889,6 MNOK`
      // er en KURATERT rad i MNOK, ikke et registeruttrekk. Ankeret ^…$ på
      // `Regnskapsregisteret 20\d\d` er det som skiller dem.
      assert.equal(
        mod.classifyFinancialUnit(
          'Regnskapsregisteret (Brønnøysund) API regnskap/982254604, årsregnskap 2025 key figures — driftsinntekter 5 889,6 MNOK',
        ),
        'million_nok',
      )

      // ---- planRowConversion: rå NOK røres ikke ----
      // Den viktigste testen i fila. Disse fire radene er ekte, ligger under
      // 10^6, og ville blitt ganget med en million av en terskelbasert regel.
      for (const [name, revenue] of [
        ['NorgesGruppen Merkevare AS', 20],
        ['SELVÆR SEAWEED AS', 8081],
        ['ALGAVIDA AS', 408944],
        ['1814 NORD AS', 0],
      ] as [string, number][]) {
        const plan = mod.planRowConversion({
          id: `raw-${name}`,
          year: 2024,
          companyName: name,
          revenueNok: revenue,
          operatingResult: null,
          ebitda: null,
          operatingMargin: null,
          source: 'https://data.brreg.no/regnskapsregisteret/regnskap/999999999',
        })
        assert.equal(plan.unit, 'raw_nok', name)
        assert.equal(plan.action, 'unchanged', name)
        assert.deepEqual(plan.changes, [], name)
      }

      // Rad uten `revenueNok`, men med negativt driftsresultat under 10^6 —
      // 26 slike finnes, alle fra registeret.
      const holding = mod.planRowConversion({
        id: 'holding',
        year: 2024,
        revenueNok: null,
        operatingResult: -25529,
        ebitda: null,
        operatingMargin: null,
        source: 'https://data.brreg.no/regnskapsregisteret/regnskap/999999999',
      })
      assert.equal(holding.action, 'unchanged')

      // ---- planRowConversion: MNOK konverteres ----
      const tine = mod.planRowConversion({
        id: 'tine',
        year: 2024,
        companyName: 'TINE SA',
        revenueNok: 28300,
        operatingResult: 2084,
        ebitda: null,
        operatingMargin: 7.4,
        source: 'Årsrapport 2024',
      })
      assert.equal(tine.unit, 'million_nok')
      assert.equal(tine.action, 'convert')
      assert.deepEqual(tine.changes, [
        { field: 'revenueNok', from: 28300, to: 28_300_000_000 },
        { field: 'operatingResult', from: 2084, to: 2_084_000_000 },
      ])
      assert.deepEqual(tine.warnings, [])

      // `ebitda` følger med — Hagar er de fem radene som har feltet satt.
      const hagar = mod.planRowConversion({
        id: 'hagar',
        year: 2023,
        companyName: 'Hagar hf',
        revenueNok: 8900,
        operatingResult: 623.5,
        ebitda: 1013.7,
        operatingMargin: 7.01,
        source: 'Hagar hf Ársreikningur 2023. ISK ~115B, 1 ISK ≈ 0.077 NOK',
      })
      assert.equal(hagar.action, 'convert')
      assert.deepEqual(
        hagar.changes.map((c: { field: string }) => c.field),
        ['revenueNok', 'operatingResult', 'ebitda'],
      )
      assert.equal(hagar.changes[2].to, 1_013_700_000)

      // Prosentfeltene røres aldri.
      assert.ok(!hagar.changes.some((c: { field: string }) => c.field === 'operatingMargin'))

      // ---- idempotens ----
      // Kjøring nummer to må være en no-op. Uten båndet ville den ganget
      // TINE opp til 2,83e16.
      const tineAgain = mod.planRowConversion({
        id: 'tine',
        year: 2024,
        revenueNok: 28_300_000_000,
        operatingResult: 2_084_000_000,
        ebitda: null,
        operatingMargin: 7.4,
        source: 'Årsrapport 2024',
      })
      assert.equal(tineAgain.action, 'unchanged')
      assert.deepEqual(tineAgain.changes, [])
      assert.deepEqual(tineAgain.alreadyRaw, ['revenueNok', 'operatingResult'])

      // ---- blandet rad: Austevoll Seafood ASA 2024 ----
      // revenueNok i MNOK, operatingResult i rå NOK, i samme rad. Per felt
      // lander raden på én enhet; per rad ville den enten forblitt blandet
      // eller sprengt Decimal(15,2) med 4,2e18.
      const austevoll = mod.planRowConversion({
        id: 'austevoll',
        year: 2024,
        companyName: 'Austevoll Seafood ASA',
        revenueNok: 30600,
        operatingResult: 4_200_000_000,
        ebitda: null,
        operatingMargin: 11.8,
        source: 'Austevoll Seafood Årsrapport 2024',
      })
      assert.equal(austevoll.action, 'convert')
      assert.deepEqual(austevoll.changes, [
        { field: 'revenueNok', from: 30600, to: 30_600_000_000 },
      ])
      assert.deepEqual(austevoll.alreadyRaw, ['operatingResult'])
      // Marginen henger ikke sammen — det er en datasak, ikke en enhetssak,
      // og skal være synlig framfor å bli stille konvertert bort.
      assert.equal(austevoll.warnings.length, 1)
      assert.match(austevoll.warnings[0], /operatingMargin=11\.8/)

      // ---- rimelighetssjekk: omsetning per ansatt ----
      // Nettet under kildemønstrene. Prod er større enn korpuset mønstrene
      // ble målt på; en ukjent kildestreng på en rå-NOK-rad ville ellers
      // passert stille og blitt ganget med en million.
      const misclassified = mod.planRowConversion({
        id: 'misclassified',
        year: 2024,
        companyName: 'LITEN TANG AS',
        revenueNok: 900_000, // står i rå NOK, men kilden er ikke gjenkjent
        operatingResult: null,
        ebitda: null,
        operatingMargin: null,
        groupEmployees: 5,
        source: 'Ukjent kilde 2024',
      })
      assert.equal(misclassified.action, 'convert')
      assert.equal(misclassified.warnings.length, 1)
      assert.match(misclassified.warnings[0], /omsetning per ansatt/)

      // Et ekte selskap skal ikke gi utslag: TINE er 28 300 MNOK på 5 200
      // ansatte ≈ 5,4 MNOK per ansatt.
      const tineWithEmployees = mod.planRowConversion({
        id: 'tine-emp',
        year: 2024,
        revenueNok: 28300,
        operatingResult: 2084,
        ebitda: null,
        operatingMargin: 7.4,
        groupEmployees: 5200,
        source: 'Årsrapport 2024',
      })
      assert.deepEqual(tineWithEmployees.warnings, [])

      // ---- rad uten kilde blokkerer ----
      // Enheten ER provenienskjeden. Uten kilde finnes det ingenting å
      // avgjøre den fra, og et gjett ganger tallet med en million.
      const noSource = mod.planRowConversion({
        id: 'no-source',
        year: 2024,
        revenueNok: 5000,
        operatingResult: null,
        ebitda: null,
        operatingMargin: null,
        source: null,
      })
      assert.equal(noSource.unit, 'unknown')
      assert.equal(noSource.action, 'blocked')
      assert.deepEqual(noSource.changes, [])
      assert.match(noSource.blockers[0], /kilden mangler/)
      assert.equal(mod.classifyFinancialUnit('   '), 'unknown')

      // Men en kildeløs rad som allerede står over båndet er ikke tvetydig —
      // den er rå NOK og skal stå urørt, ikke blokkere.
      const noSourceRaw = mod.planRowConversion({
        id: 'no-source-raw',
        year: 2024,
        revenueNok: 5_000_000_000,
        operatingResult: null,
        ebitda: null,
        operatingMargin: null,
        source: null,
      })
      assert.equal(noSourceRaw.action, 'unchanged')
      assert.deepEqual(noSourceRaw.alreadyRaw, ['revenueNok'])

      // ---- applyRowConversion ----
      const calls: unknown[] = []
      const client = {
        companyFinancial: {
          update: async (args: unknown) => {
            calls.push(args)
            return {}
          },
        },
      }

      // Tørrkjøring skriver ikke.
      assert.equal(await mod.applyRowConversion(client, tine, false), false)
      assert.deepEqual(calls, [])

      // Blokkerte og uendrede rader skriver ikke, selv med --apply.
      assert.equal(await mod.applyRowConversion(client, noSource, true), false)
      assert.equal(await mod.applyRowConversion(client, tineAgain, true), false)
      assert.equal(await mod.applyRowConversion(client, holding, true), false)
      assert.deepEqual(calls, [])

      // Skriver bare pengefeltene som faktisk endres.
      assert.equal(await mod.applyRowConversion(client, tine, true), true)
      assert.deepEqual(calls, [
        {
          where: { id: 'tine' },
          data: { revenueNok: 28_300_000_000, operatingResult: 2_084_000_000 },
        },
      ])

      // ---- summarize ----
      const summary = mod.summarize([tine, hagar, austevoll, noSource, tineAgain, holding])
      assert.equal(summary.rows, 6)
      assert.equal(summary.rawNok, 1)
      assert.equal(summary.millionNok, 4)
      assert.equal(summary.unknownUnit, 1)
      assert.equal(summary.converted, 3)
      assert.equal(summary.blocked, 1)
      assert.equal(summary.unchanged, 2)
      assert.equal(summary.fieldsConverted, 2 + 3 + 1)
      // Båndet forutsetter at ingen konvertert MNOK-verdi når 10^6.
      assert.ok(summary.maxMillionValue < mod.UNIT_BAND_NOK)

      // ---- summarizeBySource ----
      // Review-flaten før en ekte kjøring: en kilde som mønstrene ikke kjenner
      // skal dukke opp som sin egen linje, ikke smelte inn i totalen.
      const bySource = mod.summarizeBySource([tine, tineAgain, hagar, holding, noSource])
      const tineLine = bySource.find((e: { source: string }) => e.source === 'Årsrapport 2024')
      assert.equal(tineLine.unit, 'million_nok')
      assert.equal(tineLine.rows, 2) // tine + tineAgain deler kilde
      assert.equal(tineLine.converted, 1) // men bare den ukonverterte telles
      const rawLine = bySource.find((e: { unit: string }) => e.unit === 'raw_nok')
      assert.equal(rawLine.converted, 0)
      const unknownLine = bySource.find((e: { unit: string }) => e.unit === 'unknown')
      assert.equal(unknownLine.source, '(uten kilde)')
      assert.equal(unknownLine.converted, 0)

      // Planen bærer kilden den klassifiserte på — uten den er
      // konverteringslista i rapporten ikke reviewbar.
      assert.equal(tine.source, 'Årsrapport 2024')
      assert.equal(noSource.source, null)

      // ---- konstanter ----
      assert.equal(mod.MILLION_NOK_IN_NOK, 1_000_000)
      assert.equal(mod.UNIT_BAND_NOK, 1_000_000)
      // Båndet gjør Decimal(15,2)-overløp strukturelt umulig: et felt
      // konverteres bare under 10^6, så resultatet er alltid under 10^12.
      assert.ok(mod.UNIT_BAND_NOK * mod.MILLION_NOK_IN_NOK < 10_000_000_000_000)
      assert.deepEqual(mod.MONEY_FIELDS, ['revenueNok', 'operatingResult', 'ebitda'])
    } finally {
      console.log = originalLog
    }
  })
})
