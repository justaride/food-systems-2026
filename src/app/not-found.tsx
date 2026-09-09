import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto mt-10 max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/[0.03]" aria-labelledby="not-found-title">
      <div className="h-1.5 w-12 rounded-full bg-stone-300" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-emerald-700">Siden finnes ikke</p>
      <h1 id="not-found-title" className="mt-1 text-xl font-semibold text-stone-900">Finn veien videre fra oversikten</h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-stone-600">
        Adressen peker ikke til en tilgjengelig arbeidsflate. Oversikten samler inngangene til prosjektarbeidet.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Gå til oversikten
      </Link>
    </section>
  )
}
