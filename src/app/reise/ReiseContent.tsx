import Link from 'next/link'
import {
  MATREISE_STATUS_LABELS,
  matreiseBreadSteps,
  matreiseClaims,
  matreiseIntro,
  matreiseStations,
  matreiseTakeaways,
  type MatreisePoint,
  type MatreiseStation,
  type MatreiseStatus,
} from '@/lib/data/matreise'
import { StasjonIllustrasjon } from './StasjonIllustrasjon'

const STATUS_SHORT: Record<MatreiseStatus, string> = {
  siterbar: 'Siterbar',
  kontrollert: 'Kontrollert',
  hypotese: 'Hypotese',
  hull: 'Hull',
  vedtak: 'Vedtak',
}

const STATUS_CHIP: Record<MatreiseStatus, string> = {
  siterbar: 'border-sky-200 bg-sky-100 text-sky-800',
  kontrollert: 'border-sky-200 bg-white text-sky-700',
  hypotese: 'border-stone-200 bg-stone-100 text-stone-600',
  hull: 'border-rose-200 bg-rose-50 text-rose-700',
  vedtak: 'border-stone-200 bg-white text-stone-500',
}

const CHIP_BASE = 'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums'

const LENSES = [
  { key: 'holds', title: 'Dette holder', box: 'border-emerald-200 bg-emerald-50/50', label: 'text-emerald-700' },
  { key: 'breaks', title: 'Her kan det ryke', box: 'border-amber-200 bg-amber-50/60', label: 'text-amber-700' },
  { key: 'unknown', title: 'Dette vet vi ikke', box: 'border-rose-200 bg-rose-50/50', label: 'text-rose-700' },
] as const

function ClaimChips({ claims }: { claims: readonly string[] }) {
  if (claims.length === 0) return null
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
      {claims.map(id => {
        const claim = matreiseClaims[id]
        return (
          <span key={id} className="inline-flex gap-1">
            <span className={`${CHIP_BASE} ${STATUS_CHIP[claim.status]}`} title={`${id}: ${MATREISE_STATUS_LABELS[claim.status]}`}>
              {id} · {STATUS_SHORT[claim.status]}
            </span>
            {claim.timeCritical && (
              <span className={`${CHIP_BASE} border-amber-200 bg-amber-50 text-amber-700`} title="Tidskritisk: kontrolleres samme uke som tallet brukes">
                Fersksjekk
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function PointList({ points }: { points: readonly MatreisePoint[] }) {
  return (
    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-stone-700">
      {points.map(point => (
        <li key={point.text}>
          {point.text}
          <ClaimChips claims={point.claims} />
        </li>
      ))}
    </ul>
  )
}

function Station({ station }: { station: MatreiseStation }) {
  return (
    <li id={station.id} className="relative scroll-mt-20 sm:pl-14">
      <span
        className="absolute left-0 top-5 hidden h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-bold tabular-nums text-emerald-700 sm:flex"
        aria-hidden="true"
      >
        {station.order}
      </span>
      <article className="card space-y-5">
        <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6">
          <StasjonIllustrasjon id={station.id} className="w-40 lg:w-full" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Stasjon {station.order} av {matreiseStations.length}
            </p>
            <h3 className="mt-1 text-xl font-bold text-stone-900">{station.title}</h3>
            <p className="text-sm font-medium text-emerald-700">{station.tagline}</p>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-stone-700">
              {station.happens.text}
              <ClaimChips claims={station.happens.claims} />
            </p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {station.figures.map(figure => (
            <div key={figure.label} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <dt className="text-lg font-bold tabular-nums text-stone-900">{figure.value}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-stone-600">
                {figure.label}
                <ClaimChips claims={figure.claims} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-3 lg:grid-cols-3">
          {LENSES.map(lens => (
            <section key={lens.key} className={`rounded-lg border p-3 ${lens.box}`}>
              <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${lens.label}`}>{lens.title}</h4>
              <PointList points={station[lens.key]} />
            </section>
          ))}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span>{station.chapter}</span>
          <span aria-hidden="true">·</span>
          <span>Se mer i appen:</span>
          {station.links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
            >
              {link.label}
            </Link>
          ))}
        </footer>
      </article>
    </li>
  )
}

export function ReiseContent() {
  const first = matreiseStations[0]

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Utkast · for partnere, ikke offentlig</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Matreisen</h1>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-stone-600">
            Slik fungerer det norske matsystemet i dag, fra innsatsvarer til tallerken og tilbake til jorda.
            Ett spørsmål følger hele veien: Får folk fortsatt mat når noe svikter?
          </p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Utkast</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-950">
            Reisen bygger på utkastet til hvitbok v3 fra 18. september 2026. Tall merket «Kontrollert» skal
            stikkprøves mot primærkilde før presentasjon. Tall merket «Fersksjekk» skal kontrolleres samme uke som de brukes.
          </p>
        </div>
      </header>

      <section aria-labelledby="reise-lesemate" className="rounded-lg border border-stone-200 bg-stone-50/80 p-4">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div>
            <h2 id="reise-lesemate" className="text-sm font-semibold text-stone-900">Hva betyr forsyningssikkerhet her?</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-600">
              {matreiseIntro.map(point => (
                <p key={point.text}>
                  {point.text}
                  <ClaimChips claims={point.claims} />
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Slik leser du reisen</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-stone-700">
              {LENSES.map(lens => (
                <li key={lens.key} className="flex items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-sm border ${lens.box}`} aria-hidden="true" />
                  <span><strong className={lens.label}>{lens.title}</strong> står ved hver stasjon.</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-stone-600">
              Hver påstand har en merkelapp med nummer i påstandsregisteret og status:
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {(Object.keys(MATREISE_STATUS_LABELS) as MatreiseStatus[]).map(status => (
                <li key={status} className={`${CHIP_BASE} ${STATUS_CHIP[status]}`}>{MATREISE_STATUS_LABELS[status]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <nav aria-labelledby="reise-kart">
        <h2 id="reise-kart" className="text-sm font-semibold text-stone-900">Kart over reisen</h2>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {matreiseStations.map(station => (
            <li key={station.id}>
              <a
                href={`#${station.id}`}
                className="flex h-full flex-col items-center rounded-lg border border-stone-200 bg-white px-2 pb-2 pt-1 text-center hover:border-emerald-300 hover:bg-emerald-50"
              >
                <StasjonIllustrasjon id={station.id} className="w-full max-w-[110px]" />
                <span className="text-[10px] font-semibold tabular-nums text-stone-400">{station.order}</span>
                <span className="text-xs font-semibold leading-tight text-stone-800">{station.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-stone-500">
          Reisen er en sløyfe. Siste stasjon sender næring tilbake til den første, i den grad sløyfen er lukket.
        </p>
      </nav>

      <section aria-labelledby="reise-stasjoner">
        <h2 id="reise-stasjoner" className="sr-only">Stasjonene</h2>
        <ol className="relative space-y-6 sm:before:absolute sm:before:left-5 sm:before:top-0 sm:before:h-full sm:before:w-px sm:before:bg-stone-200">
          {matreiseStations.map(station => (
            <Station key={station.id} station={station} />
          ))}
        </ol>
        <p className="mt-4 text-sm text-stone-600 sm:pl-14">
          Herfra går næringen tilbake til{' '}
          <a href={`#${first.id}`} className="font-medium text-emerald-700 underline underline-offset-2">
            stasjon {first.order}, {first.title.toLowerCase()}
          </a>
          . Hvor mye som faktisk kommer tilbake, er ikke målt.
          <ClaimChips claims={['P-061']} />
        </p>
      </section>

      <section aria-labelledby="reise-brod" className="space-y-3">
        <div>
          <h2 id="reise-brod" className="text-xl font-bold text-stone-900">Ett eksempel hele veien: fra kornlager til brød</h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-stone-600">
            Lagret råvare er ikke leverbar mat. Følg hveten fra åker til bakeri, og se hvor kunnskapen stopper.
          </p>
        </div>
        <ol className="grid gap-3 lg:grid-cols-5">
          {matreiseBreadSteps.map((step, index) => (
            <li
              key={step.title}
              className={`rounded-xl border p-4 ${step.known ? 'border-stone-200 bg-white' : 'border-dashed border-rose-300 bg-rose-50/40'}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Trinn {index + 1}</p>
              <h3 className="text-sm font-semibold text-stone-900">{step.title}</h3>
              <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${step.known ? 'text-sky-700' : 'text-rose-700'}`}>
                {step.known ? 'Dette vet vi' : 'Her stopper kunnskapen'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-700">
                {step.text}
                <ClaimChips claims={step.claims} />
              </p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-stone-500">Hvitbok v3, kap. 4.2.</p>
      </section>

      <section aria-labelledby="reise-viser" className="rounded-2xl bg-stone-900 p-5 sm:p-6">
        <h2 id="reise-viser" className="text-xl font-bold text-white">Tre ting reisen viser</h2>
        <ol className="mt-4 grid gap-4 lg:grid-cols-3">
          {matreiseTakeaways.map((takeaway, index) => (
            <li key={takeaway.title} className="rounded-xl border border-stone-700 bg-stone-800 p-4">
              <p className="text-2xl font-bold tabular-nums text-emerald-400">{index + 1}</p>
              <h3 className="mt-1 text-sm font-semibold text-white">{takeaway.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">
                {takeaway.text}
                <ClaimChips claims={takeaway.claims} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <nav aria-labelledby="reise-videre" className="space-y-3">
        <h2 id="reise-videre" className="text-sm font-semibold text-stone-900">Gå dypere</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/hvitbok" className="rounded-lg border border-stone-200 bg-white p-3 text-sm hover:border-emerald-300">
            <span className="block font-medium text-stone-900">Hvitboka</span>
            <span className="block text-xs text-stone-500">Appen viser synthesis v2. Hvitbok v3 er under arbeid.</span>
          </Link>
          <Link href="/" className="rounded-lg border border-stone-200 bg-white p-3 text-sm hover:border-emerald-300">
            <span className="block font-medium text-stone-900">Matsystemets snitt</span>
            <span className="block text-xs text-stone-500">De samme leddene som oppslag: system, makt, avhengighet, sirkularitet og evidens.</span>
          </Link>
          <Link href="/verdikjede" className="rounded-lg border border-stone-200 bg-white p-3 text-sm hover:border-emerald-300">
            <span className="block font-medium text-stone-900">Verdikjede</span>
            <span className="block text-xs text-stone-500">Nordisk sammenligning ledd for ledd, med selskaper og datadekning.</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
