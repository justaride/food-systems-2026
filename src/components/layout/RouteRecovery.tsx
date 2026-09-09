'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

type RouteRecoveryProps = {
  title: string
  description: string
  retry?: () => void
}

export function RouteRecovery({ title, description, retry }: RouteRecoveryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [title])

  return (
    <section
      aria-labelledby="route-recovery-title"
      className="mx-auto mt-10 max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/[0.03]"
    >
      <div className="h-1.5 w-12 rounded-full bg-emerald-500" aria-hidden="true" />
      <h1
        ref={headingRef}
        id="route-recovery-title"
        tabIndex={-1}
        className="mt-4 text-xl font-semibold text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
      >
        {title}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-stone-600">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Prøv igjen
          </button>
        )}
        <Link
          href="/"
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Gå til oversikten
        </Link>
      </div>
    </section>
  )
}
