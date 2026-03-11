'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Oversikt', href: '/' },
  { name: 'Oppgaver', href: '/oppgaver' },
  { name: 'Leveranser', href: '/leveranser' },
  { name: 'Tidslinje', href: '/tidslinje' },
  { name: 'Innsikt', href: '/innsikt' },
  { name: 'Moter', href: '/moter' },
  { name: 'Kommunikasjon', href: '/kommunikasjon' },
  { name: 'Media', href: '/media' },
  { name: 'Kart', href: '/kart' },
  { name: 'Team', href: '/team' },
  { name: 'Metodikk', href: '/metodikk' },
  { name: 'Kilder', href: '/kilder' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="lg:hidden border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900">Food Systems 2026</span>
              <span className="text-xs text-stone-400">NCH Transition Group</span>
            </div>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Meny</span>
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-stone-100">
          <div className="px-2 py-2 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
