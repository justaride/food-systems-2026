'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Oversikt', href: '/' },
  { name: 'Tidslinje', href: '/tidslinje' },
  { name: 'Team', href: '/team' },
  { name: 'Metodikk', href: '/metodikk' },
  { name: 'Leveranser', href: '/leveranser' },
  { name: 'Moter', href: '/moter' },
  { name: 'Kilder', href: '/kilder' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="lg:hidden border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex flex-col">
            <span className="text-sm font-bold text-neutral-100">Food Systems 2026</span>
            <span className="text-xs text-neutral-500">NCH Transition Group</span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
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
        <div className="border-t border-neutral-800">
          <div className="px-2 py-2 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-sm font-medium
                    ${isActive
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
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
