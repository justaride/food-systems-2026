'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocale } from './set-locale'
import { LOCALES, type Locale } from '@/i18n/resolve-locale'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const active = useLocale()
  const router = useRouter()
  const t = useTranslations()
  const [pending, startTransition] = useTransition()

  function change(locale: Locale) {
    if (locale === active) return
    startTransition(async () => {
      await setLocale(locale)
      router.refresh()
    })
  }

  return (
    <div className={`inline-flex rounded-md border border-stone-200 p-0.5 ${className}`} aria-label={t('language.switchAria')}>
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => change(locale)}
          disabled={pending}
          aria-pressed={active === locale}
          className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded ${
            active === locale ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}
