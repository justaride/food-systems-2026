'use client'

import Link from 'next/link'
import { COUNTRY_LIST, type CountryCode } from '@/lib/config/countries'

export default function CountrySelector({ currentCountry }: { currentCountry: CountryCode }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-white rounded-lg border border-stone-200/80 shadow-sm p-1">
      {COUNTRY_LIST.map(({ code, name, flag }) => {
        const active = code === currentCountry
        return (
          <Link
            key={code}
            href={`/kart/${code}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              active
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            }`}
            title={name}
          >
            <span>{flag}</span>
            <span className="hidden sm:inline">{name}</span>
          </Link>
        )
      })}
    </div>
  )
}
