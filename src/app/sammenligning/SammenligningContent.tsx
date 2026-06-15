import Link from 'next/link'
import { BolkSection } from '@/components/sammenligning/BolkSection'
import { ChartCard } from '@/components/sammenligning/ChartCard'
import { ComparisonTable } from '@/components/sammenligning/ComparisonTable'
import { KeyTakeaway } from '@/components/sammenligning/KeyTakeaway'
import { PolicyTimeline } from '@/components/sammenligning/PolicyTimeline'
import { ChartFrame } from '@/components/visualization/ChartFrame'
import { NoMarketShareTimeseriesDynamic } from '@/components/charts/NoMarketShareTimeseriesDynamic'
import { PageFraming } from '@/components/ui/PageFraming'
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'
import type { SammenligningData, CountrySammenligning, DataPointMeta } from '@/lib/queries/sammenligning'
import type { NoMarketShareTimeSeries } from '@/lib/queries/market-share'

type Props = { data: SammenligningData; noMarketShare: NoMarketShareTimeSeries }

function rowsFor<T>(
  data: SammenligningData,
  pick: (c: CountrySammenligning) => T | null,
  pickMeta?: (c: CountrySammenligning) => DataPointMeta | undefined,
): Array<{ country: string; flag: string; value: T | null; population: number; code: CountryCode; meta?: DataPointMeta }> {
  return COUNTRY_LIST.map(c => {
    const country = data.countries[c.code]
    return {
      country: c.name,
      flag: c.flag,
      value: country ? pick(country) : null,
      population: country?.population ?? 0,
      code: c.code,
      meta: country && pickMeta ? pickMeta(country) : undefined,
    }
  })
}

export function SammenligningContent({ data, noMarketShare }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-800">Nordisk sammenligning</h1>
        <p className="text-sm text-stone-500 mt-2 max-w-2xl">
          Markedsmakt, beredskap, verdikjede, sirkularitet og politikk på tvers av Norge, Sverige, Danmark, Finland og Island.
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Kilder og metode: <Link href="/metodikk" className="text-emerald-700 hover:underline">/metodikk</Link>
        </p>
      </header>

      <div className="mb-8">
        <PageFraming
          title="Hva svarer denne siden på?"
          description={[
            'Siden setter de fem nordiske landene ved siden av hverandre på markedsmakt, beredskap, verdikjede, sirkularitet og politikk.',
            'Den skal gjøre forskjeller og metodegap synlige før tallene brukes i hvitbok eller beslutningsnotat.',
          ]}
          takeaways={[
            'Norge leses mot nordiske referanser, men flere indikatorer bruker ulik kilde- og definisjonsbaseline.',
            'Bolkene viser både figurer, tabeller og statusdetaljer for hvert tema.',
            'Sammenligningen peker videre til eierskap, forsyningskjede og metodikk for kontroll.',
          ]}
          caveat="Siterbar med forbehold: deler av sammenligningen er primærkildebasert, mens andre felt er proxy/illustrativ og ikke ekstern validering."
        />
      </div>

      {(() => {
        const hhi = rowsFor(data, c => c.market.hhi, c => c.meta.market.hhi)
        const cr3 = rowsFor(data, c => c.market.cr3, c => c.meta.market.cr3)
        const gini = rowsFor(data, c => c.market.gini, c => c.meta.market.gini)
        const stores = rowsFor(data, c => c.market.totalStores, c => c.meta.market.totalStores)
        const emv = rowsFor(data, c => c.market.emvSharePct, c => c.meta.market.emvSharePct)
        const formatRows = COUNTRY_LIST.map(c => {
          const country = data.countries[c.code]
          const m = country?.market.retailFormatMix
          return {
            country: c.name,
            flag: c.flag,
            value: m ? m.discount : null,
            population: 0,
            code: c.code,
            meta: country?.meta.market.retailFormatMix,
          }
        })

        const hhiNo = data.countries.no?.market.hhi
        const hhiDk = data.countries.dk?.market.hhi

        return (
          <BolkSection
            number={1}
            title="Markedsstruktur & makt"
            question="Hvor konsentrert er nordisk dagligvare?"
            narrative="Norge har Nordens mest konsentrerte dagligvaremarked. Den kryssnasjonale butikkantall-proxyen gir HHI ~3445 (NO) mot Danmarks 2157; den citerbare omsetnings-HHI-en (Konkurransetilsynet 2024: NG 43,5/Coop 29,2/Rema 23,9/Bunnpris 3,3) er 3327 med CR3 96,6 %. Begge signaliserer høy markedsmakt hos få aktører."
            researchStatus="primary_snapshot"
            researchStatusDetail="Den viste HHI-en er butikkantall-proxy (chart-metrics parentHHI), brukt likt på tvers av land for sammenlignbarhet. Den autoritative omsetnings-HHI-en for Norge er 3327 (KT Dagligvarerapport 2024-25). Full nordisk paritet på omsetning gjenstår (B11 gap)."
            takeaway={
              <KeyTakeaway
                headline={`HHI ${hhiNo ?? '—'} (NO høyest) vs ${hhiDk ?? '—'} (DK lavest)`}
                subline="Herfindahl-Hirschman-indeks for dagligvarekjeder"
              />
            }
            charts={
              <>
                <ChartCard
                  title="HHI"
                  description="Markedskonsentrasjon — Herfindahl-Hirschman-indeks"
                  rows={hhi}
                  year={2024}
                  sources={['chart-metrics.json (derivert fra stores.json)', 'Konkurransetilsynet/Konkurrensverket/KFST/KKV']}
                />
                <ChartCard
                  title="CR3"
                  description="Topp 3 markedsandel"
                  unit="%"
                  rows={cr3}
                  year={2024}
                  sources={['chart-metrics.json', 'Nasjonale konkurransetilsyn']}
                />
                <ChartCard
                  title="Gini-koeffisient"
                  description="Ulikhet i butikkstørrelse (derivert)"
                  rows={gini}
                  year={2024}
                  sources={['chart-metrics.json (derivert fra municipalities.json + stores.json)']}
                />
                <ChartCard
                  title="Antall butikker"
                  rows={stores}
                  year={2024}
                  sources={['stores.json (OpenStreetMap + brand-attribution)', 'Nasjonale konkurransetilsyn']}
                />
                <ChartCard
                  title="Egne merkevarer (EMV), andel foredling"
                  unit="%"
                  rows={emv}
                  year={2024}
                  sources={['SCB PxWeb (SE)', 'PTY (FI)', 'DLF (NO)', 'value-chain.json processing.emv_share_pct']}
                />
                <ChartCard
                  title="Discount-andel av detaljhandel"
                  unit="%"
                  rows={formatRows}
                  description="Andel av butikker som er lavpris"
                  year={2024}
                  sources={['value-chain.json retail.format_share / retail.retail_format', 'NielsenIQ']}
                />
              </>
            }
            table={
              <ComparisonTable
                caption="Største parent-aktører per land"
                rows={[
                  {
                    label: 'Topp 3 parents',
                    values: Object.fromEntries(
                      COUNTRY_LIST.map(c => {
                        const parents = data.countries[c.code]?.market.parents ?? []
                        return [c.code, parents.slice(0, 3).map(p => `${p.name} (${p.sharePct}%)`).join(', ') || null]
                      })
                    ) as Record<CountryCode, string | null>,
                  },
                ]}
              />
            }
            seeAlso={[{ href: '/eierskap', label: 'Eierskap' }]}
          />
        )
      })()}

      {noMarketShare.rows.length > 0 && (
        <div className="my-6">
          <ChartFrame
            title="Norge: utvikling i markedsandeler 2020–2024"
            contract={noMarketShare.contract}
          >
              <NoMarketShareTimeseriesDynamic rows={noMarketShare.rows} />
          </ChartFrame>
        </div>
      )}

      {(() => {
        const ss = rowsFor(data, c => c.preparedness.selfSufficiencyCaloricPct, c => c.meta.preparedness.selfSufficiencyCaloricPct)
        const importTon = rowsFor(data, c => c.preparedness.importTonnes, c => c.meta.preparedness.importTonnes)
        const exportTon = rowsFor(data, c => c.preparedness.exportTonnes, c => c.meta.preparedness.exportTonnes)
        const feed = rowsFor(data, c => c.preparedness.feedImportPct, c => c.meta.preparedness.feedImportPct)
        const reserve = rowsFor(data, c => c.preparedness.grainReserveMonths, c => c.meta.preparedness.grainReserveMonths)

        const dk = data.countries.dk?.preparedness.selfSufficiencyCaloricPct
        const no = data.countries.no?.preparedness.selfSufficiencyCaloricPct

        return (
          <BolkSection
            number={2}
            title="Selvforsyning & beredskap"
            question="Hvor sårbar er hvert land for import-stopp?"
            narrative="NIBIO 2024 oppgir 41,3 % selvforsyningsgrad for Norge totalt inkl. fisk og 34,9 % korrigert for importert kraftfor. Danmark ligger rundt ~300 %. Finland skiller seg ut med 9 måneders kornreserve via HVK-modellen — de andre landene har minimale strategiske lagre."
            researchStatus="primary_snapshot"
            researchStatusDetail="NIBIO Engrosforbruk 2024 (EV-A-022) er primærkilden for NO; nordisk sammenligning krever felles definisjonsbaseline og er ikke ferdig harmonisert."
            takeaway={
              <KeyTakeaway
                headline={`${dk ?? '—'} % DK vs ${no ?? '—'} % NO`}
                subline="Kalori-basert selvforsyning (NIBIO 2024: NO 41,3% / 34,9% forkorrigert)"
              />
            }
            charts={
              <>
                <ChartCard
                  title="Selvforsyning (kalori)"
                  unit="%"
                  rows={ss}
                  year={2024}
                  sources={['NIBIO Engrosforbruk AB5/AB6 (NO)', 'Jordbruksverket + SOU 2024:8 (SE)', 'DST + Landbrug & Fødevarer (DK)', 'Luke (FI)', 'Hagstofa Íslands (IS)']}
                />
                <ChartCard
                  title="Total import"
                  description="Tonn (per capita aktiverbar)"
                  unit="tonn"
                  rows={importTon}
                  perCapitaEnabled
                  perCapitaUnit="tonn/innb"
                  year={2024}
                  sources={['SSB 08799 (NO)', 'Eurostat ext_lt_intertrd (SE/DK/FI)']}
                />
                <ChartCard
                  title="Total eksport"
                  unit="tonn"
                  rows={exportTon}
                  perCapitaEnabled
                  perCapitaUnit="tonn/innb"
                  year={2024}
                  sources={['SSB 08799 (NO)', 'Sjømatrådet (NO sjømat)', 'Eurostat ext_lt_intertrd (SE/DK/FI)']}
                />
                <ChartCard
                  title="Fôr-import-andel"
                  unit="%"
                  rows={feed}
                  year={2024}
                  sources={['Sjømatrådet (NO sjømat 92%)', 'NIBIO (NO husdyr ~70%)', 'LRF (SE)', 'Landbrug & Fødevarer (DK)']}
                />
                <ChartCard
                  title="Kornreserve (måneder)"
                  description="Strategisk lager"
                  unit="mnd"
                  rows={reserve}
                  year={2024}
                  sources={['Huoltovarmuuskeskus / HVK (FI 9 mnd)', 'NO avviklet 2003 — SE under reetablering, DK/IS ingen']}
                />
              </>
            }
            table={
              <ComparisonTable
                caption="Selvforsyning, mål og reservetid"
                rows={[
                  {
                    label: 'Kalori-SS (%)',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyCaloricPct ?? null])) as Record<CountryCode, number | null>,
                  },
                  {
                    label: 'Mål (%)',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyTargetPct ?? null])) as Record<CountryCode, number | null>,
                  },
                  {
                    label: 'Mål-år',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyTargetYear ?? null])) as Record<CountryCode, number | null>,
                  },
                  {
                    label: 'Kornreserve (mnd)',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.grainReserveMonths ?? null])) as Record<CountryCode, number | null>,
                  },
                ]}
              />
            }
            seeAlso={[{ href: '/forsyningskjede', label: 'Forsyningskjede' }]}
          />
        )
      })()}
      {(() => {
        const vol = rowsFor(data, c => c.valueChain.primaryVolumeTonnes, c => c.meta.valueChain.primaryVolumeTonnes)
        const seafood = rowsFor(data, c => c.valueChain.seafoodExportValueBn, c => c.meta.valueChain.seafoodExportValueBn)
        const turnover = rowsFor(data, c => c.valueChain.processingTurnoverBn, c => c.meta.valueChain.processingTurnoverBn)
        const empNace10 = rowsFor(data, c => c.valueChain.employmentByNace.nace10, c => c.meta.valueChain.employmentNace10)
        const co2eRetail = rowsFor(data, c => c.valueChain.co2ePerStep.retail ?? null, c => c.meta.valueChain.co2ePerStep)

        const noProd = (() => {
          const v = data.countries.no?.valueChain.valueAddedByStep ?? {}
          return Object.values(v).reduce<number>((s, x) => s + (x ?? 0), 0)
        })()

        return (
          <BolkSection
            number={3}
            title="Verdikjedevolum & verdiskaping"
            question="Hvor mye produseres, og hvem tjener pengene?"
            narrative={`Norsk matsystem produserer rundt ${noProd.toFixed(0)} mrd NOK i samlet verdiskaping; sjømateksporten alene er flerfoldig over landbrukets bidrag.`}
            researchStatus="local_research_needs_primary_check"
            researchStatusDetail="NO value-added er kurert; nordisk paritet er ikke harmonisert. CO2e per ledd er kun NO; SE/DK/FI/IS sjømat-eksportverdi mangler primærsjekk."
            takeaway={
              <KeyTakeaway
                headline={`${noProd.toFixed(0)} mrd NOK total verdiskaping (NO)`}
                subline="Sum value-added per ledd"
              />
            }
            charts={
              <>
                <ChartCard
                  title="Primærvolum"
                  description="Råvarer i tonn"
                  unit="tonn"
                  rows={vol}
                  perCapitaEnabled
                  perCapitaUnit="tonn/innb"
                  year={2024}
                  sources={['SSB 09171 (NO)', 'DST (DK aggregert kjøtt+meieri+korn)', 'Verifisering: Eurostat apro_cpsh1, FAO STAT']}
                />
                <ChartCard
                  title="Sjømat eksport-verdi"
                  unit="mrd lok"
                  rows={seafood}
                  year={2024}
                  sources={['Sjømatrådet (NO)', 'value-chain.json seafood.trade (SE/DK/FI lokal research)', 'Verifisering: Eurostat DS-018995, UN Comtrade']}
                />
                <ChartCard
                  title="Foredlings-omsetning"
                  unit="mrd lok"
                  rows={turnover}
                  year={2024}
                  sources={['SSB 13470 (NO)', 'SCB PxWeb (SE)', 'DST (DK)', 'stat.fi PxWeb (FI)', 'Verifisering: Eurostat sbs_na_ind_r2']}
                />
                <ChartCard
                  title="Sysselsetting matforedling (NACE 10)"
                  rows={empNace10}
                  year={2024}
                  sources={['SSB 09171 (NO)', 'Verifisering: Eurostat lfsa_egan22d, OECD STAN']}
                />
                <ChartCard
                  title="CO₂e — detaljhandel"
                  description="Tonn CO₂-ekvivalenter (mt). Kun NO har data per ledd (NORSUS-modell)."
                  unit="mt"
                  rows={co2eRetail}
                  year={2024}
                  sources={['NORSUS LCA 2021 (NO)', 'Verifisering: Naturvårdsverket scope 1+2+3 (SE), DCE Aarhus (DK)']}
                />
              </>
            }
            table={
              <ComparisonTable
                caption="Value-added per ledd (mrd, NO referanse)"
                rows={['primary', 'seafood', 'processing', 'distribution', 'retail', 'horeca'].map(step => ({
                  label: step,
                  values: Object.fromEntries(
                    COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.valueChain.valueAddedByStep[step] ?? null])
                  ) as Record<CountryCode, number | null>,
                }))}
              />
            }
            seeAlso={[
              { href: '/verdikjede', label: 'Verdikjede' },
              { href: '/havbruk', label: 'Havbruk' },
            ]}
          />
        )
      })()}
      {(() => {
        const totalWaste = rowsFor(data, c => c.circularity.totalWastePerCapitaKg, c => c.meta.circularity.totalWastePerCapitaKg)
        const houseWaste = rowsFor(data, c => c.circularity.householdWastePerCapitaKg, c => c.meta.circularity.householdWastePerCapitaKg)
        const reduction = rowsFor(data, c => c.circularity.wasteReductionSince2015Pct, c => c.meta.circularity.wasteReductionSince2015Pct)
        const biogas = rowsFor(data, c => c.circularity.biogasGwh, c => c.meta.circularity.biogasGwh)
        const plants = rowsFor(data, c => c.circularity.biogasPlants, c => c.meta.circularity.biogasPlants)
        const deposit = rowsFor(data, c => c.circularity.depositReturnRatePct, c => c.meta.circularity.depositReturnRatePct)

        const noReduction = data.countries.no?.circularity.wasteReductionSince2015Pct

        const wasteCategoryRows = COUNTRY_LIST
          .map(c => data.countries[c.code]?.circularity.foodWasteByCategory)
          .find(cats => cats && cats.length > 0)
          ?.map(cat => ({
            label: cat.name,
            values: Object.fromEntries(
              COUNTRY_LIST.map(c => {
                const countryCats = data.countries[c.code]?.circularity.foodWasteByCategory
                const match = countryCats?.find(x => x.id === cat.id)
                const v = match?.productionMtNordic ?? null
                return [c.code, v !== null ? `${v} Mt` : null]
              }),
            ) as Partial<Record<CountryCode, string | null>>,
          })) ?? []

        return (
          <BolkSection
            number={4}
            title="Sirkularitet & matsvinn"
            question="Hvor langt er hvert land i sirkulær omstilling?"
            narrative="Norge har redusert matsvinn betydelig siden 2015 (per Matvett/NORSUS tidsserie), og pant-returrate over 90 % er Nordens høyeste. Biogass-utbygging varierer kraftig per innbygger og har ulike scope-grenser per land."
            researchStatus="primary_snapshot"
            researchStatusDetail="Matsvinn-tall er primærkilder (EV-B-025/026); biogass-sammenligning bruker scoped panel STC-030 med eksplisitt DK gas-system og NO industry-scope. Nutrient-flows og bypass-strømmer er proxy_model."
            takeaway={
              noReduction !== null && noReduction !== undefined ? (
                <KeyTakeaway
                  headline={`${Math.abs(noReduction)} % ${noReduction < 0 ? 'reduksjon' : 'økning'} i matsvinn (NO, siden 2015)`}
                />
              ) : (
                <KeyTakeaway headline="Matsvinn-reduksjon NO: data mangler" />
              )
            }
            charts={
              <>
                <ChartCard
                  title="Total svinn (kg/capita)"
                  unit="kg"
                  rows={totalWaste}
                  year={2024}
                  sources={['NORSUS/Matvett (NO)', 'Naturvårdsverket Rapport 7176 (SE)', 'DST (DK)', 'Luke (FI)', 'Verifisering: Eurostat env_wasfw, TemaNord 2021:504']}
                />
                <ChartCard
                  title="Husholdningssvinn (kg/capita)"
                  unit="kg"
                  rows={houseWaste}
                  year={2024}
                  sources={['NORSUS (NO)', 'Naturvårdsverket (SE)', 'DST (DK)', 'Luke (FI)', 'Verifisering: UNEP Food Waste Index 2024']}
                />
                <ChartCard
                  title="Svinn-reduksjon siden 2015"
                  unit="%"
                  rows={reduction}
                  year={2024}
                  sources={['NORSUS/Matvett tidsserie (NO -24% baseline 2015→2024)', 'Bransjeavtalen rapportering']}
                />
                <ChartCard
                  title="Biogass-produksjon"
                  unit="GWh"
                  rows={biogas}
                  perCapitaEnabled
                  perCapitaUnit="GWh/innb"
                  year={2024}
                  sources={['IEA Bioenergy NO/SE/DK 2024', 'Biogas Outlook 2025 (DK)', 'Luke (FI)', 'Verifisering: EU EurObservER barometer']}
                />
                <ChartCard
                  title="Biogass-anlegg"
                  rows={plants}
                  year={2024}
                  sources={['IEA Bioenergy nasjonale rapporter 2024']}
                />
                <ChartCard
                  title="Pant-returrate"
                  unit="%"
                  rows={deposit}
                  year={2024}
                  sources={['Infinitum (NO 92.3%)', 'Pantamera (SE 87%)', 'Dansk Retursystem (DK ~93%)', 'Palpa (FI ~94%)', 'Endurvinnslan (IS ~85%) — DK/FI/IS ennå ikke i JSON']}
                />
              </>
            }
            table={wasteCategoryRows.length > 0 ? (
              <ComparisonTable
                caption="Matsvinn per kategori — produksjonsvolum (Mt, nordisk estimat per land der data finnes)"
                rows={wasteCategoryRows}
              />
            ) : undefined}
            seeAlso={[{ href: '/sirkularitet', label: 'Sirkularitet' }]}
          />
        )
      })()}
      {(() => {
        const flat = COUNTRY_LIST.flatMap(c =>
          (data.countries[c.code]?.policies ?? []).map(p => ({ country: c.code, ...p }))
        )

        return (
          <BolkSection
            number={5}
            title="Politikk & regulering"
            question="Hvordan styres systemet ulikt?"
            narrative="Norden konvergerer på matsvinn, biogass og emballasje, men i ulikt tempo og med ulike virkemidler — fra bransjeavtaler til bindende lov. Norges matsvinnlov (LOV-2025-06-20-103), Danmarks Klimaaftale 2024 og Sveriges styringsgap (RiR 2025) er sentrale referansepunkter."
            researchStatus="primary_snapshot"
            researchStatusDetail="EV-C-026 matsvinnloven, EV-C-027 Klimaaftalen og EV-C-028 Riksrevisionen er primærkilder med URL/paragraf-locator. Norsk handelsskikklov (EV-C-013) overfører til Konkurransetilsynet 2026-04-30."
            takeaway={
              <KeyTakeaway
                headline="2015–2030 — bransjeavtale → matsvinnlov → PFAS-forbud"
                subline="Politikkmiks varierer per land"
              />
            }
            charts={<div className="md:col-span-2"><PolicyTimeline policies={flat} /></div>}
            table={
              <ComparisonTable
                caption="Antall registrerte tiltak per land"
                rows={[
                  {
                    label: 'Lover',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, (data.countries[c.code]?.policies ?? []).filter(p => p.type === 'law').length])) as Record<CountryCode, number>,
                  },
                  {
                    label: 'Frivillige avtaler',
                    values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, (data.countries[c.code]?.policies ?? []).filter(p => p.type === 'voluntary').length])) as Record<CountryCode, number>,
                  },
                ]}
              />
            }
            seeAlso={[{ href: '/politikk', label: 'Politikk' }]}
          />
        )
      })()}

      <footer className="mt-16 pt-6 border-t border-stone-200 text-xs text-stone-500">
        <p>Sist generert: {new Date(data.generatedAt).toLocaleDateString('nb-NO')}</p>
        <p className="mt-1">Datagrunnlag har ujevn dekning på tvers av land — manglende verdier vises som «—» med varsel-badge.</p>
      </footer>
    </div>
  )
}
