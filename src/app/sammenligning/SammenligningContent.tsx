import Link from 'next/link'
import { BolkSection } from '@/components/sammenligning/BolkSection'
import { ChartCard } from '@/components/sammenligning/ChartCard'
import { ComparisonTable } from '@/components/sammenligning/ComparisonTable'
import { KeyTakeaway } from '@/components/sammenligning/KeyTakeaway'
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'
import type { SammenligningData, CountrySammenligning } from '@/lib/queries/sammenligning'

type Props = { data: SammenligningData }

function rowsFor<T>(
  data: SammenligningData,
  pick: (c: CountrySammenligning) => T | null,
): Array<{ country: string; flag: string; value: T | null; population: number; code: CountryCode }> {
  return COUNTRY_LIST.map(c => {
    const country = data.countries[c.code]
    return {
      country: c.name,
      flag: c.flag,
      value: country ? pick(country) : null,
      population: country?.population ?? 0,
      code: c.code,
    }
  })
}

export function SammenligningContent({ data }: Props) {
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

      {(() => {
        const hhi = rowsFor(data, c => c.market.hhi)
        const cr3 = rowsFor(data, c => c.market.cr3)
        const gini = rowsFor(data, c => c.market.gini)
        const stores = rowsFor(data, c => c.market.totalStores)
        const emv = rowsFor(data, c => c.market.emvSharePct)
        const formatRows = COUNTRY_LIST.map(c => {
          const m = data.countries[c.code]?.market.retailFormatMix
          return { country: c.name, flag: c.flag, value: m ? m.discount : null, population: 0, code: c.code }
        })

        const hhiNo = data.countries.no?.market.hhi
        const hhiDk = data.countries.dk?.market.hhi

        return (
          <BolkSection
            number={1}
            title="Markedsstruktur & makt"
            question="Hvor konsentrert er nordisk dagligvare?"
            narrative="Norge har Nordens mest konsentrerte dagligvaremarked. HHI rundt 3445 ligger godt over Danmarks 2157 og signaliserer høy markedsmakt hos få aktører."
            takeaway={
              <KeyTakeaway
                headline={`HHI ${hhiNo ?? '—'} (NO høyest) vs ${hhiDk ?? '—'} (DK lavest)`}
                subline="Herfindahl-Hirschman-indeks for dagligvarekjeder"
              />
            }
            charts={
              <>
                <ChartCard title="HHI" description="Markedskonsentrasjon" rows={hhi} source="Konsentrasjons-data fra konkurranse­myndigheter og selskapsrapporter" />
                <ChartCard title="CR3" description="Topp 3 markedsandel" unit="%" rows={cr3} />
                <ChartCard title="Gini-koeffisient" description="Ulikhet i butikkstørrelse" rows={gini} />
                <ChartCard title="Antall butikker" rows={stores} />
                <ChartCard title="EMV-andel foredling" unit="%" rows={emv} />
                <ChartCard title="Discount-andel av detaljhandel" unit="%" rows={formatRows} description="Andel av butikker som er lavpris" />
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
      {(() => {
        const ss = rowsFor(data, c => c.preparedness.selfSufficiencyCaloricPct)
        const importTon = rowsFor(data, c => c.preparedness.importTonnes)
        const exportTon = rowsFor(data, c => c.preparedness.exportTonnes)
        const feed = rowsFor(data, c => c.preparedness.feedImportPct)
        const reserve = rowsFor(data, c => c.preparedness.grainReserveMonths)

        const dk = data.countries.dk?.preparedness.selfSufficiencyCaloricPct
        const no = data.countries.no?.preparedness.selfSufficiencyCaloricPct

        return (
          <BolkSection
            number={2}
            title="Selvforsyning & beredskap"
            question="Hvor sårbar er hvert land for import-stopp?"
            narrative="Selvforsyningsgraden spenner fra ~47 % (NO) til ~300 % (DK). Finland skiller seg ut med 9 måneders kornreserve via HVK-modellen — de andre landene har minimale strategiske lagre."
            takeaway={
              <KeyTakeaway
                headline={`${dk ?? '—'} % DK vs ${no ?? '—'} % NO`}
                subline="Kalori-basert selvforsyning"
              />
            }
            charts={
              <>
                <ChartCard title="Selvforsyning (kalori)" unit="%" rows={ss} />
                <ChartCard
                  title="Total import"
                  description="Tonn (per capita aktiverbar)"
                  unit="tonn"
                  rows={importTon}
                  perCapitaEnabled
                  perCapitaUnit="tonn/innb"
                />
                <ChartCard
                  title="Total eksport"
                  unit="tonn"
                  rows={exportTon}
                  perCapitaEnabled
                  perCapitaUnit="tonn/innb"
                />
                <ChartCard title="Fôr-import-andel" unit="%" rows={feed} />
                <ChartCard
                  title="Kornreserve (måneder)"
                  description="Strategisk lager"
                  unit="mnd"
                  rows={reserve}
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
      <BolkSection
        number={3}
        title="Verdikjedevolum & verdiskaping"
        question="Hvor mye produseres, og hvem tjener pengene?"
        narrative=""
        charts={null}
        seeAlso={[
          { href: '/verdikjede', label: 'Verdikjede' },
          { href: '/havbruk', label: 'Havbruk' },
        ]}
      />
      <BolkSection
        number={4}
        title="Sirkularitet & matsvinn"
        question="Hvor langt er hvert land i sirkulær omstilling?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/sirkularitet', label: 'Sirkularitet' }]}
      />
      <BolkSection
        number={5}
        title="Politikk & regulering"
        question="Hvordan styres systemet ulikt?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/politikk', label: 'Politikk' }]}
      />

      <footer className="mt-16 pt-6 border-t border-stone-200 text-xs text-stone-500">
        <p>Sist generert: {new Date(data.generatedAt).toLocaleDateString('nb-NO')}</p>
        <p className="mt-1">Datagrunnlag har ujevn dekning på tvers av land — manglende verdier vises som «—» med varsel-badge.</p>
      </footer>
    </div>
  )
}
