import Link from 'next/link'
import { BolkSection } from '@/components/sammenligning/BolkSection'
import type { SammenligningData } from '@/lib/queries/sammenligning'

type Props = { data: SammenligningData }

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

      <BolkSection
        number={1}
        title="Markedsstruktur & makt"
        question="Hvor konsentrert er nordisk dagligvare?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/eierskap', label: 'Eierskap' }]}
      />
      <BolkSection
        number={2}
        title="Selvforsyning & beredskap"
        question="Hvor sårbar er hvert land for import-stopp?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/forsyningskjede', label: 'Forsyningskjede' }]}
      />
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
