'use server'

import { cookies } from 'next/headers'
import { resolveLocale, type Locale } from '@/i18n/resolve-locale'

export async function setLocale(locale: Locale) {
  const safe = resolveLocale(locale)
  const store = await cookies()
  store.set('NEXT_LOCALE', safe, { path: '/', maxAge: 60 * 60 * 24 * 365 })
}
