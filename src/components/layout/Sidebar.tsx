'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from '@/lib/data/nav'
import { useTranslations } from 'next-intl'

export function Sidebar({ activePhase, totalPhases }: { activePhase: number; totalPhases: number }) {
  const pathname = usePathname()
  const t = useTranslations()

  return (
    <aside className="hidden lg:block w-56 border-r border-stone-200 bg-white sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-stone-900">{t('header.appName')}</h2>
          </div>
          <p className="text-xs text-stone-400 ml-4">{t('header.appTagline')}</p>
        </div>

        <div className="mb-6 border-t border-stone-100" />

        <nav className="space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.groupKey && (
                <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  {t(`nav.group.${group.groupKey}`)}
                  {group.groupKey === 'intern' && (
                    <span className="rounded bg-stone-100 px-1 text-[9px] normal-case text-stone-500">{t('nav.internalBadge')}</span>
                  )}
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
                        <span className="font-medium">{t(`nav.${item.key}.name`)}</span>
                        <span className={`block text-xs mt-0.5 ${isActive ? 'text-stone-500' : 'text-stone-400'}`}>
                          {t(`nav.${item.key}.description`)}
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
              <span>{t('common.phase')}</span>
              <span className="text-stone-600 font-medium">{activePhase} / {totalPhases}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('common.deadline')}</span>
              <span className="text-stone-600 font-medium">{t('common.deadlineValue')}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
