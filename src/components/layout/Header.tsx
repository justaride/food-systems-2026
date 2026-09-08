'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { navGroups } from '@/lib/data/nav'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'


export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <header className="lg:hidden border-b border-stone-200 bg-white sticky top-0 z-50" onKeyDown={event => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }}>
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900">{t('header.appName')}</span>
              <span className="text-xs text-stone-400">{t('header.appTagline')}</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex items-center justify-center p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{t('header.menu')}</span>
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
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label={t('header.menu')} className="border-t border-stone-100 max-h-[calc(100dvh-3.5rem)] overflow-y-auto p-2 space-y-3">
          {navGroups.map((group, index) => (
            <div key={group.groupKey ?? index}>
              {group.groupKey && <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-stone-500">{t(`nav.group.${group.groupKey}`)}</p>}
              <ul className="space-y-0.5">
                {group.items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-600 ${pathname === item.href ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}`}
                      onClick={() => setMobileMenuOpen(false)}>
                      {t(`nav.${item.key}.name`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}
