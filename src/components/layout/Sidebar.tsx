'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Oversikt', href: '/', description: 'Status og fremdrift' },
  { name: 'Tidslinje', href: '/tidslinje', description: 'Soknader og hendelser' },
  { name: 'Team', href: '/team', description: 'Organisasjon' },
  { name: 'Metodikk', href: '/metodikk', description: 'Ten Step + KPIs' },
  { name: 'Leveranser', href: '/leveranser', description: 'Oppgaver og faser' },
  { name: 'Moter', href: '/moter', description: 'Executive summaries' },
  { name: 'Kilder', href: '/kilder', description: 'Dokumenter' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-56 border-r border-neutral-800 bg-neutral-950 sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="p-5">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-neutral-100">Food Systems 2026</h2>
          <p className="text-xs text-neutral-500 mt-0.5">NCH Transition Group</p>
        </div>

        <div className="mb-6 border-t border-neutral-800" />

        <nav>
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-md text-sm transition-colors
                      ${isActive
                        ? 'bg-neutral-800 text-neutral-100'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }
                    `}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className={`block text-xs mt-0.5 ${isActive ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {item.description}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-6 border-t border-neutral-800 pt-4">
          <div className="text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span>Fase</span>
              <span className="text-neutral-400">1 / 4</span>
            </div>
            <div className="flex justify-between">
              <span>Frist</span>
              <span className="text-neutral-400">Juni 2026</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
