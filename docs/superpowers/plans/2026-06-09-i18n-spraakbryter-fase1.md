# Språkbryter (i18n) Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working NO/EN language switcher that flips the global UI frame (sidebar nav + header) to English via a cookie, with no URL changes; page content stays Norwegian.

**Architecture:** next-intl in cookie-based mode (no i18n routing). A `NEXT_LOCALE` cookie selects the locale; `getRequestConfig` loads `messages/{locale}.json`; the root layout sets `<html lang>` and a `NextIntlClientProvider`; sidebar/header read labels via `useTranslations`; a `LanguageSwitcher` sets the cookie via a server action and refreshes.

**Tech Stack:** Next.js 16 (App Router), next-intl, TypeScript. Tests: `node --import=tsx --test` over `tests/**/*.test.ts`.

**Spec:** [`docs/superpowers/specs/2026-06-09-i18n-spraakbryter-fase1-design.md`](../specs/2026-06-09-i18n-spraakbryter-fase1-design.md)

**Verification commands:** `npm run test` · `npm run lint` · `npm run build` (Next build; the real integration check for next-intl wiring) · `npx tsc --noEmit` (ignore the known pre-existing `tests/lib/insight-link-scripts.test.ts` error).

---

## File Structure
- **New:** `src/i18n/resolve-locale.ts` (pure helper), `src/i18n/request.ts` (next-intl request config), `messages/no.json`, `messages/en.json`, `src/components/layout/LanguageSwitcher.tsx`, `src/components/layout/set-locale.ts` (server action), tests under `tests/i18n/`.
- **Modify:** `next.config.ts`, `src/app/layout.tsx`, `src/lib/data/nav.ts`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `package.json` (next-intl dep).

---

## Task 1: Install next-intl and de-risk Next 16 compatibility

**Files:** `package.json`, `next.config.ts`, `src/i18n/request.ts`, `messages/no.json`, `messages/en.json`, `src/app/layout.tsx`

- [ ] **Step 1: Install.** Run: `npm install next-intl`. Then confirm a version installed: `node -e "console.log(require('next-intl/package.json').version)"`. Expected: prints a version (v3.22+ or v4.x).

- [ ] **Step 2: Wrap next.config.** Replace `next.config.ts` with:

```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 3: Minimal request config + stub catalogs.** Create `src/i18n/request.ts`:

```ts
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { resolveLocale } from './resolve-locale'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)
  const messages = (await import(`../../messages/${locale}.json`)).default
  return { locale, messages }
})
```

(`resolve-locale.ts` is created in Task 2. For this smoke step, temporarily inline `const locale = (cookieStore.get('NEXT_LOCALE')?.value === 'en') ? 'en' : 'no'` if Task 2 isn't done yet, then restore the import.)

Create `messages/no.json` = `{ "smoke": "røyktest" }` and `messages/en.json` = `{ "smoke": "smoke test" }` (placeholder; replaced in Task 3).

- [ ] **Step 4: Wire layout provider + smoke-render.** In `src/app/layout.tsx`, add imports and wrap. Change `import type { Metadata } from 'next'` block to also import:

```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
```

Replace the `return (...)` so the html lang is dynamic and children are wrapped:

```tsx
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar activePhase={activeIndex >= 0 ? activeIndex + 1 : 1} totalPhases={phases.length} />
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full">
                {children}
              </main>
            </div>
          </div>
          <span data-testid="i18n-smoke" className="sr-only">{t('smoke')}</span>
        </NextIntlClientProvider>
      </body>
    </html>
  )
```

- [ ] **Step 5: Build to verify next-intl works with Next 16.** Run: `npm run build`
Expected: build succeeds. **If the build fails with a next-intl/Next-16 incompatibility** (e.g. `getRequestConfig`/plugin errors), STOP and escalate — fall back to the spec §6 lightweight custom i18n (cookie + React context + a `useT()` hook + the same catalogs). Do not force a broken next-intl setup.

- [ ] **Step 6: Commit.**

```bash
git add package.json package-lock.json next.config.ts src/i18n/request.ts messages/no.json messages/en.json src/app/layout.tsx
git commit -m "feat(i18n): wire next-intl (cookie-based) + smoke test"
```

---

## Task 2: `resolve-locale` helper (TDD)

**Files:** Create `src/i18n/resolve-locale.ts`; Test `tests/i18n/resolve-locale.test.ts`

- [ ] **Step 1: Write the failing test** at `tests/i18n/resolve-locale.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveLocale, LOCALES, DEFAULT_LOCALE } from '../../src/i18n/resolve-locale'

describe('resolveLocale', () => {
  it('returns the value when it is a supported locale', () => {
    assert.equal(resolveLocale('en'), 'en')
    assert.equal(resolveLocale('no'), 'no')
  })
  it('falls back to the default for missing/unknown values', () => {
    assert.equal(resolveLocale(undefined), DEFAULT_LOCALE)
    assert.equal(resolveLocale('de'), DEFAULT_LOCALE)
    assert.equal(resolveLocale(''), DEFAULT_LOCALE)
  })
  it('exposes the supported set with no as default', () => {
    assert.deepEqual([...LOCALES].sort(), ['en', 'no'])
    assert.equal(DEFAULT_LOCALE, 'no')
  })
})
```

- [ ] **Step 2: Run; verify FAIL.** Run: `node --import=tsx --test tests/i18n/resolve-locale.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement** `src/i18n/resolve-locale.ts`:

```ts
export const LOCALES = ['no', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'no'

export function resolveLocale(value: string | undefined | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : DEFAULT_LOCALE
}
```

- [ ] **Step 4: Run; verify PASS.** Run: `node --import=tsx --test tests/i18n/resolve-locale.test.ts` → PASS (3 tests).

- [ ] **Step 5: Restore the real import in `request.ts`** (if you inlined it in Task 1 Step 3, it already imports `resolveLocale` from `./resolve-locale` — confirm it does). Run `npx tsc --noEmit` → no new errors.

- [ ] **Step 6: Commit.**

```bash
git add src/i18n/resolve-locale.ts tests/i18n/resolve-locale.test.ts src/i18n/request.ts
git commit -m "feat(i18n): resolveLocale helper (default no)"
```

---

## Task 3: Message catalogs + key-parity test (TDD)

**Files:** Replace `messages/no.json`, `messages/en.json`; Test `tests/i18n/messages-parity.test.ts`

- [ ] **Step 1: Write the failing parity test** at `tests/i18n/messages-parity.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import no from '../../messages/no.json'
import en from '../../messages/en.json'
import { navGroups } from '../../src/lib/data/nav'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? flatten(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )
}

describe('message catalogs', () => {
  it('no and en have identical key sets', () => {
    assert.deepEqual(flatten(no as Record<string, unknown>).sort(), flatten(en as Record<string, unknown>).sort())
  })
  it('every nav item key has a name in both catalogs', () => {
    const keys = flatten(no as Record<string, unknown>)
    for (const group of navGroups) {
      for (const item of group.items) {
        assert.ok(keys.includes(`nav.${item.key}.name`), `missing nav.${item.key}.name`)
      }
    }
  })
})
```

- [ ] **Step 2: Run; verify FAIL.** Run: `node --import=tsx --test tests/i18n/messages-parity.test.ts` → FAIL (`navGroups`/`item.key` not yet restructured, and catalogs still the smoke stubs). The no/en key-parity assertion goes green once the full catalogs are written (Steps 3–4 below); the nav-key assertion goes green once Task 4 restructures `nav.ts` (Task 4 Step 3). Leave this test in place.

- [ ] **Step 3: Write `messages/no.json`** (full):

```json
{
  "smoke": "røyktest",
  "header": { "appName": "Food Systems 2026", "appTagline": "NCH Transition Group", "menu": "Meny" },
  "common": { "phase": "Fase", "deadline": "Frist", "deadlineValue": "Juni 2026" },
  "language": { "switchAria": "Bytt språk" },
  "nav": {
    "internalBadge": "internt",
    "group": {
      "intern": "Intern", "selskap": "Selskap & eierskap", "matsystem": "Matsystem",
      "produsenter": "Produsenter & støtte", "nordisk": "Nordisk", "kunnskap": "Kunnskap", "bibliotek": "Bibliotek"
    },
    "oversikt": { "name": "Oversikt", "description": "Fase, fremdrift, neste steg" },
    "sok": { "name": "Søk", "description": "Søk på tvers av alt" },
    "team": { "name": "Team", "description": "Medlemmer og roller" },
    "moter": { "name": "Møter", "description": "Møtesammendrag og referater" },
    "kommunikasjon": { "name": "Kommunikasjon", "description": "E-post og korrespondanse" },
    "mandat": { "name": "Mandat", "description": "Food TG scope, claims og validering" },
    "metodikk": { "name": "Metodikk", "description": "Ten Step, KPIs og deep research-prompter" },
    "tidslinje": { "name": "Tidslinje", "description": "Faser og søknader" },
    "selskaper": { "name": "Selskaper", "description": "Selskapsdata og regnskap" },
    "eierskap": { "name": "Eierskap", "description": "Konserndossier og datakvalitet" },
    "styremedlemmer": { "name": "Styremedlemmer", "description": "Krysstyrer og nettverk" },
    "personer": { "name": "Personer", "description": "Nøkkelpersoner og roller" },
    "eiendommer": { "name": "Eiendommer", "description": "Selskapseiendommer og lokaler" },
    "verdikjede": { "name": "Verdikjede", "description": "Nordisk verdikjedeanalyse (jord til bord)" },
    "forsyningskjede": { "name": "Forsyningskjede", "description": "Leverandørrelasjoner, primærleveranser og selvhandel" },
    "havbruk": { "name": "Havbruk", "description": "Lokaliteter og søknader (Fiskeridir)" },
    "sirkularitet": { "name": "Sirkularitet", "description": "R-stige, 10 spørsmål, looper og caser" },
    "okonomi": { "name": "Økonomi", "description": "Finansielle trender og sammenligning" },
    "produsentregister": { "name": "Produsentregister", "description": "Jordbruksforetak fra register (rådata)" },
    "subsidier": { "name": "Subsidier", "description": "Tilskudd per kommune, ordning og mottaker" },
    "sammenligning": { "name": "Sammenligning", "description": "Nordisk sammenligning" },
    "politikk": { "name": "Politikk", "description": "Nordisk matpolitikk-sammenligning" },
    "kart": { "name": "Kart", "description": "Butikker og kommunegrenser" },
    "media": { "name": "Media", "description": "Medieomtale og narrativer" },
    "innsikt": { "name": "Innsikt", "description": "Forskning, kartlegging, analyse" },
    "forskningsrunder": { "name": "Forskningsrunder", "description": "Food Research Process 20. april 2026" },
    "akademia": { "name": "Akademia", "description": "Master- og PhD-avhandlinger" },
    "graf": { "name": "Graf", "description": "Kunnskapsgraf og koblinger" },
    "aktorer": { "name": "Aktører", "description": "Prioritering, asks og relasjoner" },
    "rapporter": { "name": "Rapporter", "description": "Offentlige og bransjeanalyser" },
    "hvitbok": { "name": "Hvitbok", "description": "Leveransedokument i kapitler" },
    "bibliotek": { "name": "Bibliotek", "description": "Fulltekst forskningsdokumenter" },
    "kilder": { "name": "Kilder", "description": "Dokumenter og referanser" }
  }
}
```

- [ ] **Step 4: Write `messages/en.json`** (same keys, English values):

```json
{
  "smoke": "smoke test",
  "header": { "appName": "Food Systems 2026", "appTagline": "NCH Transition Group", "menu": "Menu" },
  "common": { "phase": "Phase", "deadline": "Deadline", "deadlineValue": "June 2026" },
  "language": { "switchAria": "Switch language" },
  "nav": {
    "internalBadge": "internal",
    "group": {
      "intern": "Internal", "selskap": "Companies & ownership", "matsystem": "Food system",
      "produsenter": "Producers & support", "nordisk": "Nordic", "kunnskap": "Knowledge", "bibliotek": "Library"
    },
    "oversikt": { "name": "Overview", "description": "Phase, progress, next steps" },
    "sok": { "name": "Search", "description": "Search across everything" },
    "team": { "name": "Team", "description": "Members and roles" },
    "moter": { "name": "Meetings", "description": "Meeting summaries and minutes" },
    "kommunikasjon": { "name": "Communication", "description": "Email and correspondence" },
    "mandat": { "name": "Mandate", "description": "Food TG scope, claims and validation" },
    "metodikk": { "name": "Methodology", "description": "Ten Step, KPIs and deep-research prompts" },
    "tidslinje": { "name": "Timeline", "description": "Phases and applications" },
    "selskaper": { "name": "Companies", "description": "Company data and financials" },
    "eierskap": { "name": "Ownership", "description": "Group dossiers and data quality" },
    "styremedlemmer": { "name": "Board members", "description": "Interlocks and networks" },
    "personer": { "name": "People", "description": "Key people and roles" },
    "eiendommer": { "name": "Properties", "description": "Company properties and premises" },
    "verdikjede": { "name": "Value chain", "description": "Nordic value-chain analysis (farm to table)" },
    "forsyningskjede": { "name": "Supply chain", "description": "Supplier relations, primary supply and self-dealing" },
    "havbruk": { "name": "Aquaculture", "description": "Sites and applications (Fisheries Dir.)" },
    "sirkularitet": { "name": "Circularity", "description": "R-ladder, 10 questions, loops and cases" },
    "okonomi": { "name": "Economy", "description": "Financial trends and comparison" },
    "produsentregister": { "name": "Producer registry", "description": "Agricultural holdings from register (raw data)" },
    "subsidier": { "name": "Subsidies", "description": "Subsidies by municipality, scheme and recipient" },
    "sammenligning": { "name": "Comparison", "description": "Nordic comparison" },
    "politikk": { "name": "Policy", "description": "Nordic food-policy comparison" },
    "kart": { "name": "Map", "description": "Stores and municipal boundaries" },
    "media": { "name": "Media", "description": "Media coverage and narratives" },
    "innsikt": { "name": "Insight", "description": "Research, mapping, analysis" },
    "forskningsrunder": { "name": "Research rounds", "description": "Food Research Process 20 April 2026" },
    "akademia": { "name": "Academia", "description": "Master's and PhD theses" },
    "graf": { "name": "Graph", "description": "Knowledge graph and connections" },
    "aktorer": { "name": "Actors", "description": "Prioritization, asks and relations" },
    "rapporter": { "name": "Reports", "description": "Public and industry analyses" },
    "hvitbok": { "name": "White paper", "description": "Deliverable document in chapters" },
    "bibliotek": { "name": "Library", "description": "Full-text research documents" },
    "kilder": { "name": "Sources", "description": "Documents and references" }
  }
}
```

- [ ] **Step 5: Commit** (the parity test will pass after Task 5; commit catalogs now).

```bash
git add messages/no.json messages/en.json tests/i18n/messages-parity.test.ts
git commit -m "feat(i18n): NO/EN message catalogs (nav/header/common) + parity test"
```

---

## Task 4: Restructure `nav.ts` to keys + translate Sidebar

**Files:** `src/lib/data/nav.ts`, `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Restructure `src/lib/data/nav.ts`** — replace its contents with (structural keys, no display strings; keys match the catalog):

```ts
export type NavItem = { key: string; href: string }
export type NavGroup = { groupKey?: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  { items: [
    { key: 'oversikt', href: '/' },
    { key: 'sok', href: '/sok' },
  ]},
  { groupKey: 'intern', items: [
    { key: 'team', href: '/team' },
    { key: 'moter', href: '/moter' },
    { key: 'kommunikasjon', href: '/kommunikasjon' },
    { key: 'mandat', href: '/mandat' },
    { key: 'metodikk', href: '/metodikk' },
    { key: 'tidslinje', href: '/tidslinje' },
  ]},
  { groupKey: 'selskap', items: [
    { key: 'selskaper', href: '/selskap' },
    { key: 'eierskap', href: '/eierskap' },
    { key: 'styremedlemmer', href: '/styremedlemmer' },
    { key: 'personer', href: '/personer' },
    { key: 'eiendommer', href: '/eiendommer' },
  ]},
  { groupKey: 'matsystem', items: [
    { key: 'verdikjede', href: '/verdikjede' },
    { key: 'forsyningskjede', href: '/forsyningskjede' },
    { key: 'havbruk', href: '/havbruk' },
    { key: 'sirkularitet', href: '/sirkularitet' },
    { key: 'okonomi', href: '/okonomi' },
  ]},
  { groupKey: 'produsenter', items: [
    { key: 'produsentregister', href: '/produsenter' },
    { key: 'subsidier', href: '/subsidier' },
  ]},
  { groupKey: 'nordisk', items: [
    { key: 'sammenligning', href: '/sammenligning' },
    { key: 'politikk', href: '/politikk' },
    { key: 'kart', href: '/kart' },
    { key: 'media', href: '/media' },
  ]},
  { groupKey: 'kunnskap', items: [
    { key: 'innsikt', href: '/innsikt' },
    { key: 'forskningsrunder', href: '/forskningsrunder' },
    { key: 'akademia', href: '/masteroppgaver' },
    { key: 'graf', href: '/graf' },
    { key: 'aktorer', href: '/aktorer' },
  ]},
  { groupKey: 'bibliotek', items: [
    { key: 'rapporter', href: '/rapporter' },
    { key: 'hvitbok', href: '/hvitbok' },
    { key: 'bibliotek', href: '/bibliotek' },
    { key: 'kilder', href: '/kilder' },
  ]},
]
```

- [ ] **Step 2: Translate `Sidebar.tsx`.** It is a `'use client'` component. Add `import { useTranslations } from 'next-intl'` at the top. Inside `Sidebar(...)`, add `const t = useTranslations()`. Then replace the hardcoded strings:
  - `<h2 ...>Food Systems 2026</h2>` → `{t('header.appName')}`
  - `<p ...>NCH Transition Group</p>` → `{t('header.appTagline')}`
  - The group label block — replace `group.label && (... {group.label} ... group.label === 'Intern' ...)` with `group.groupKey && (... {t(\`nav.group.${group.groupKey}\`)} ... {group.groupKey === 'intern' && (<span ...>{t('nav.internalBadge')}</span>)})`
  - `<span className="font-medium">{item.name}</span>` → `{t(\`nav.${item.key}.name\`)}`
  - `{item.description}` → `{t(\`nav.${item.key}.description\`)}`
  - `<span>Fase</span>` → `{t('common.phase')}`
  - `<span>Frist</span>` → `{t('common.deadline')}`
  - `Juni 2026` → `{t('common.deadlineValue')}`

- [ ] **Step 3: Typecheck + parity test now passes.** Run: `npx tsc --noEmit` (no new errors) and `node --import=tsx --test tests/i18n/messages-parity.test.ts` → PASS (nav keys now exist).

- [ ] **Step 4: Commit.**

```bash
git add src/lib/data/nav.ts src/components/layout/Sidebar.tsx
git commit -m "feat(i18n): nav keys + translated Sidebar"
```

---

## Task 5: Translate Header (mobile) + its nav array

**Files:** `src/components/layout/Header.tsx`

- [ ] **Step 1: Re-key the Header nav array.** In `Header.tsx`, replace the local `navigation` array (lines 7-23) with keyed items reusing the catalog keys:

```tsx
const navigation = [
  { key: 'oversikt', href: '/' },
  { key: 'team', href: '/team' },
  { key: 'moter', href: '/moter' },
  { key: 'kommunikasjon', href: '/kommunikasjon' },
  { key: 'metodikk', href: '/metodikk' },
  { key: 'tidslinje', href: '/tidslinje' },
  { key: 'innsikt', href: '/innsikt' },
  { key: 'akademia', href: '/masteroppgaver' },
  { key: 'kart', href: '/kart' },
  { key: 'sammenligning', href: '/sammenligning' },
  { key: 'verdikjede', href: '/verdikjede' },
  { key: 'rapporter', href: '/rapporter' },
  { key: 'hvitbok', href: '/hvitbok' },
  { key: 'kilder', href: '/kilder' },
  { key: 'media', href: '/media' },
]
```

- [ ] **Step 2: Use translations.** Add `import { useTranslations } from 'next-intl'`. Inside `Header()`, add `const t = useTranslations()`. Replace:
  - `<span ...>Food Systems 2026</span>` → `{t('header.appName')}`
  - `<span ...>NCH Transition Group</span>` → `{t('header.appTagline')}`
  - `<span className="sr-only">Meny</span>` → `{t('header.menu')}`
  - `{item.name}` (in the mobile menu map) → `{t(\`nav.${item.key}.name\`)}`

- [ ] **Step 3: Typecheck + lint.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 4: Commit.**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(i18n): translated mobile Header"
```

---

## Task 6: LanguageSwitcher + setLocale server action

**Files:** Create `src/components/layout/set-locale.ts`, `src/components/layout/LanguageSwitcher.tsx`; Modify `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`

- [ ] **Step 1: Server action** `src/components/layout/set-locale.ts`:

```ts
'use server'

import { cookies } from 'next/headers'
import { resolveLocale, type Locale } from '@/i18n/resolve-locale'

export async function setLocale(locale: Locale) {
  const safe = resolveLocale(locale)
  const store = await cookies()
  store.set('NEXT_LOCALE', safe, { path: '/', maxAge: 60 * 60 * 24 * 365 })
}
```

- [ ] **Step 2: Switcher** `src/components/layout/LanguageSwitcher.tsx`:

```tsx
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
```

- [ ] **Step 3: Place in Sidebar** (desktop). In `Sidebar.tsx`, add `import { LanguageSwitcher } from './LanguageSwitcher'`, and inside the footer block (after the Fase/Frist `div`, before the closing `</div>` of `mt-6 border-t...`), add `<LanguageSwitcher className="mt-3" />`.

- [ ] **Step 4: Place in Header** (mobile). In `Header.tsx`, add `import { LanguageSwitcher } from './LanguageSwitcher'`, and inside the top bar `flex justify-between items-center h-14`, between the logo `<Link>` and the menu `<button>`, wrap them so the switcher sits left of the menu button — add `<div className="flex items-center gap-2">` around `<LanguageSwitcher />` + the existing menu button, OR simply insert `<LanguageSwitcher className="ml-auto mr-2" />` before the `<button>`. (Keep the existing logo Link first.)

- [ ] **Step 5: Build (integration check) + lint.** Run: `npm run build` (must succeed — exercises the server action + provider) and `npm run lint`.

- [ ] **Step 6: Commit.**

```bash
git add src/components/layout/set-locale.ts src/components/layout/LanguageSwitcher.tsx src/components/layout/Sidebar.tsx src/components/layout/Header.tsx
git commit -m "feat(i18n): LanguageSwitcher (NO/EN) in sidebar + header"
```

---

## Task 7: Clean up smoke artifact + final verification

**Files:** `src/app/layout.tsx`, `messages/no.json`, `messages/en.json`

- [ ] **Step 1: Remove the smoke span.** In `src/app/layout.tsx`, delete the `<span data-testid="i18n-smoke" ...>{t('smoke')}</span>` line and the now-unused `const t = await getTranslations()` and the `getTranslations` import (keep `getLocale`, `getMessages`, `NextIntlClientProvider`). Remove the `"smoke"` key from both `messages/no.json` and `messages/en.json`.

- [ ] **Step 2: Full verification.** Run, in order:
  - `npm run test` → all pass (incl. resolve-locale + parity).
  - `npm run lint` → clean.
  - `npm run build` → succeeds.
  - `npx tsc --noEmit` → only the known pre-existing error.

- [ ] **Step 3: Manual switch check.** `npm run dev`, open the app. Confirm: a NO/EN toggle shows in the sidebar (desktop) and mobile header; clicking **EN** flips the **sidebar nav group labels + item names/descriptions + "Phase/Deadline"** to English (page bodies stay Norwegian), `<html lang>` becomes `en`, and the choice persists on reload (cookie). Clicking **NO** flips back.

- [ ] **Step 4: Commit.**

```bash
git add src/app/layout.tsx messages/no.json messages/en.json
git commit -m "chore(i18n): remove smoke-test artifact"
```

- [ ] **Step 5: Open a PR** from `codex/i18n-phase1`.

---

## Notes for the implementer
- next-intl client components (`Sidebar`, `Header`, `LanguageSwitcher`) work because `NextIntlClientProvider` wraps them in the root layout. Server components would use `getTranslations` from `next-intl/server`.
- If Task 1 Step 5 reveals next-intl is incompatible with Next 16, STOP and escalate to the human — the spec (§6) defines a lightweight custom-context fallback that reuses every catalog/key/cookie decision here.
