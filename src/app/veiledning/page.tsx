import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Glossary } from '@/components/ui/Glossary'

export const metadata = {
  title: 'Brukerveiledning — Food Systems 2026',
  description: 'Slik bruker du kunnskapsbasen: velg inngang, forstå statusspråket og finn fram.',
}

type Entry = { label: string; href: string; status: string; description: string }

const ENTRY_POINTS: Entry[] = [
  {
    label: 'Forstå prosjektet på 5 minutter',
    href: '/mandat',
    status: 'Ny her?',
    description:
      'Mandat, scope-spor og beslutningsporter. Forklarer hva Food TG skal levere, og hva som fortsatt må avklares før sterkere språk.',
  },
  {
    label: 'Se de viktigste funnene',
    href: '/innsikt',
    status: 'Med forbehold',
    description:
      'Hovedmønstre i marked, selvforsyning og verdikjede — hver med claim- og kildechip som viser hvor sikkert funnet er.',
  },
  {
    label: 'Kontroller kilder og datakvalitet',
    href: '/bibliotek',
    status: 'Kildekontroll',
    description:
      'Fulltekst forskningsdokumenter, rapporter og kilder. Gå fra en påstand til dokumentet og lokatoren som skal bære den.',
  },
  {
    label: 'Forbered whitepaper / roadmap',
    href: '/hvitbok',
    status: 'Utkastgrunnlag',
    description:
      'Rapportstruktur i kapitler som holder intern analyse adskilt fra det som er eksternt validert.',
  },
]

type Group = { name: string; intern?: boolean; routes: string; use: string }

const PLATFORM_MAP: Group[] = [
  {
    name: 'Oversikt og søk',
    routes: 'Oversikt · Søk',
    use: 'Startpunkt og fritekstsøk på tvers av selskaper, personer, dokumenter og innsikt.',
  },
  {
    name: 'Intern styring',
    intern: true,
    routes: 'Team · Casestatus · Møter · Kommunikasjon · Mandat · Metodikk · Tidslinje',
    use: 'Prosjektets arbeidsbenk: mandat, modenhet per caseanker, møtereferater og metodikk. Internt språk.',
  },
  {
    name: 'Selskap og eierskap',
    routes: 'Selskaper · Eierskap · Styremedlemmer · Personer · Eiendommer',
    use: 'Hvem eier hvem. Konserndossierer, krysstyrer, nøkkelpersoner og selskapenes eiendommer.',
  },
  {
    name: 'Matsystem',
    routes: 'Verdikjede · Forsyningskjede · Havbruk · Sirkularitet · Økonomi',
    use: 'Selve matsystemet: fra jord til bord, leverandørrelasjoner, havbruk, sirkulære looper og finansielle trender.',
  },
  {
    name: 'Produsenter og støtte',
    routes: 'Produsentregister · Subsidier',
    use: 'Jordbruksforetak fra register og offentlige tilskudd per kommune, ordning og mottaker.',
  },
  {
    name: 'Nordisk',
    routes: 'Sammenligning · Politikk · Kart · Media',
    use: 'Tverrnordisk blikk: sammenligning, matpolitikk, butikk-kart og medieomtale.',
  },
  {
    name: 'Kunnskap',
    routes: 'Innsikt · Prosjektlandskap · Forskningsrunder · Akademia · Graf · Aktører',
    use: 'Analyselaget: hovedinnsikt, sammenlignbare prosjektprofiler, avgrensede forskningsrunder, avhandlinger, kunnskapsgraf og aktørprioritering.',
  },
  {
    name: 'Bibliotek',
    routes: 'Rapporter · Hvitbok · Bibliotek · Kilder',
    use: 'Dokumentlaget: offentlige rapporter, leveransedokumentet og fulltekst kildebibliotek.',
  },
]

type StatusLine = { label: string; meaning: string }

const VALIDATION_STATUSES: StatusLine[] = [
  { label: 'Internt trygt', meaning: 'Kildebelagt og kontrollert internt. Kan brukes i intern analyse — ikke ennå eksternt validert.' },
  { label: 'Needs primary-check', meaning: 'Må verifiseres mot en primærkilde før det brukes videre.' },
  { label: 'Needs actor-validation', meaning: 'Krever bekreftelse fra den aktuelle aktøren før ekstern bruk.' },
  { label: 'Benchmark', meaning: 'Sammenligningsgrunnlag eller FoU-referanse, ikke en påstand om denne casen.' },
  { label: 'Hypotese', meaning: 'Arbeidsantakelse fra samtaler eller mønstre. Ikke kildebelagt ennå.' },
]

const COMMON_TASKS: Entry[] = [
  { label: 'Finne et selskaps eierstruktur', href: '/eierskap', status: 'Oppgave', description: 'Konserndossier med eierandeler og datakvalitet per ledd.' },
  { label: 'Se markedskonsentrasjon (HHI, CR3)', href: '/innsikt', status: 'Oppgave', description: 'Konsentrasjonsmål med forklaring av terskelverdier.' },
  { label: 'Slå opp tilskudd til en mottaker', href: '/subsidier', status: 'Oppgave', description: 'Produksjonstilskudd per kommune, ordning og mottaker.' },
  { label: 'Sammenligne Norden', href: '/sammenligning', status: 'Oppgave', description: 'Selvforsyning, marked og politikk på tvers av land.' },
  { label: 'Kontrollere en kilde bak en påstand', href: '/kilder', status: 'Oppgave', description: 'Dokumenter og referanser med proveniens.' },
  { label: 'Se modenhet per caseanker', href: '/casestatus', status: 'Oppgave', description: 'Hvor langt hvert prioritert case er kommet.' },
]

export default function VeiledningPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-stone-400">Brukerveiledning</p>
        <h1 className="text-xl font-bold text-stone-900">Slik bruker du kunnskapsbasen</h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Dette er den interne kunnskapsbasen for Food Systems Transition Group under Nordic
          Circular Hotspot. Den kartlegger selskapsstrukturer, eierskap, makt og forsyningskjeder
          i den norske og nordiske matsektoren, og skiller bevisst mellom intern analyse,
          kildebelagte funn og det som er eksternt validert.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong className="font-semibold">Viktig:</strong> All lesing er intern og statusstyrt.
          Ingen Food TG-claims er eksternt validert ennå. Sjekk alltid statuschipen på et funn før
          du bruker det utenfor prosjektet.
        </div>
      </header>

      <section aria-labelledby="entry-title" className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 id="entry-title" className="text-sm font-semibold text-stone-800">Velg inngang etter hva du skal gjøre</h2>
        <p className="mt-1 text-xs text-stone-500">Fire vanlige startpunkter. Du kan alltid gå tilbake hit fra menyen.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex min-h-32 flex-col justify-between rounded-lg border border-stone-200 bg-stone-50/70 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">{entry.status}</span>
              <span className="mt-2 text-sm font-semibold text-stone-900 group-hover:text-emerald-900">{entry.label}</span>
              <span className="mt-1 text-xs leading-relaxed text-stone-600">{entry.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="map-title" className="space-y-3">
        <div>
          <h2 id="map-title" className="text-sm font-semibold text-stone-800">Slik er plattformen organisert</h2>
          <p className="mt-1 text-xs text-stone-500">
            Menyen til venstre er gruppert i åtte lag. Du trenger sjelden alle samtidig — finn laget som svarer på spørsmålet ditt.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {PLATFORM_MAP.map((group) => (
            <Card key={group.name}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-800">{group.name}</h3>
                {group.intern && (
                  <span className="rounded bg-stone-100 px-1 text-[9px] text-stone-500">internt</span>
                )}
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-stone-400">{group.routes}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{group.use}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="status-title" className="space-y-3">
        <div>
          <h2 id="status-title" className="text-sm font-semibold text-stone-800">Forstå statusspråket</h2>
          <p className="mt-1 text-xs text-stone-500">
            Plattformens viktigste prinsipp er å vise hvor sikkert noe er. Hvert funn bærer en status som forteller deg hvor langt det kan brukes.
          </p>
        </div>
        <Card>
          <dl className="space-y-2">
            {VALIDATION_STATUSES.map((s) => (
              <div key={s.label} className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-3">
                <dt className="text-xs font-semibold text-stone-800">{s.label}</dt>
                <dd className="text-xs text-stone-600">{s.meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
            Claim-koder følger samme logikk: <span className="font-medium text-stone-700">CL</span> = claim,{' '}
            <span className="font-medium text-stone-700">EV</span> = evidence,{' '}
            <span className="font-medium text-stone-700">SRC</span> = kilde — hver med spor (A/B/C) og nummer.
            Se <Link href="/metodikk" className="text-emerald-600 hover:text-emerald-700">Metodikk</Link> for hele
            valideringsløpet og <Link href="/mandat" className="text-emerald-600 hover:text-emerald-700">Mandat</Link> for claim-board.
          </p>
        </Card>
        <Glossary category="prosjekt" title="Nøkkelbegreper" />
        <Glossary category="status" title="Statusbegreper" />
        <Glossary category="statistikk" title="Statistikkbegreper" />
      </section>

      <section aria-labelledby="tasks-title" className="space-y-3">
        <div>
          <h2 id="tasks-title" className="text-sm font-semibold text-stone-800">Vanlige oppgaver</h2>
          <p className="mt-1 text-xs text-stone-500">Snarveier til det folk oftest leter etter.</p>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {COMMON_TASKS.map((task) => (
            <Link
              key={task.href + task.label}
              href={task.href}
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-900">{task.label}</span>
              <span className="mt-1 text-xs text-stone-600">{task.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
