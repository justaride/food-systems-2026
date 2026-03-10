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
    <aside className="hidden lg:block w-56 border-r border-stone-200 bg-white sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-stone-900">Food Systems 2026</h2>
          </div>
          <p className="text-xs text-stone-400 ml-4">NCH Transition Group</p>
        </div>

        <div className="mb-6 border-t border-stone-100" />

        <nav>
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive
                        ? 'bg-stone-100 text-stone-900'
                        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                      }
                    `}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className={`block text-xs mt-0.5 ${isActive ? 'text-stone-500' : 'text-stone-400'}`}>
                      {item.description}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-6 border-t border-stone-100 pt-4">
          <div className="text-xs text-stone-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Fase</span>
              <span className="text-stone-600 font-medium">1 / 4</span>
            </div>
            <div className="flex justify-between">
              <span>Frist</span>
              <span className="text-stone-600 font-medium">Juni 2026</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
