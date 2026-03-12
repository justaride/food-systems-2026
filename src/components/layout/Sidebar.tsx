'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navGroups = [
  {
    items: [
      { name: 'Oversikt', href: '/', description: 'Fase, fremdrift, neste steg' },
    ],
  },
  {
    label: 'Intern',
    items: [
      { name: 'Team', href: '/team', description: 'Medlemmer og roller' },
      { name: 'Moter', href: '/moter', description: 'Motesammendrag og referater' },
      { name: 'Kommunikasjon', href: '/kommunikasjon', description: 'E-post og korrespondanse' },
      { name: 'Metodikk', href: '/metodikk', description: 'Ten Step + KPIs' },
    ],
  },
  {
    label: 'Utforing',
    items: [
      { name: 'Oppgaver', href: '/oppgaver', description: 'Alle oppgaver og status' },
      { name: 'Leveranser', href: '/leveranser', description: 'Leveranser og evidence pack' },
      { name: 'Tidslinje', href: '/tidslinje', description: 'Faser og soknader' },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { name: 'Innsikt', href: '/innsikt', description: 'Forskning, kartlegging, analyse' },
      { name: 'Kart', href: '/kart', description: 'Butikker og kommunegrenser' },
    ],
  },
  {
    label: 'Referanse',
    items: [
      { name: 'Kilder', href: '/kilder', description: 'Dokumenter og referanser' },
      { name: 'Media', href: '/media', description: 'Medieomtale og narrativer' },
    ],
  },
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

        <nav className="space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-stone-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
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
            </div>
          ))}
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
