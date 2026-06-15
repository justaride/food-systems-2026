# Språkbryter (i18n) — Fase 1: infrastruktur + bryter + global ramme — design

- **Dato:** 2026-06-09
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** Fase 1 av et flerfase-prosjekt. Etablerer NO/EN-i18n-infrastruktur (next-intl, cookie-basert), en språkbryter, og oversetter **den globale rammen** (Sidebar-nav + Header) til engelsk. Sidekropper og innhold forblir norske til senere faser.

## 1. Bakgrunn og beslutninger

Appen er norsk-only (bekreftet: `<html lang="no">`, ingen i18n). Brukeren vil ha en NO/EN-språkbryter. Innholdet (analyser, selskaps-/dokumentdata fra ~127 DB-kilder) er norsk forskningsmateriale og oversettes **ikke** — kun UI-rammen byttes. Med ~1000+ hardkodede UI-strenger over 133 filer er dette et flerfase-prosjekt.

**Låst i brainstorming:**
1. Rammeverk: **next-intl** (App Router, Next.js 16).
2. Locale-strategi: **cookie-basert, ingen URL-ruting** (`NEXT_LOCALE`-cookie) — ingen omstrukturering av de 45 rutene eller interne lenker.
3. Omfang: UI-ramme til engelsk; innhold forblir norsk.
4. **Fase 1 = Sidebar-nav + Header** (+ `<html lang>`). Felleskomponenter (StatusLegend, EmptyState, Glossary-tittel, Internal*-standardtekst) er Fase 1b. Sidekropper er Fase 2+.

## 2. Arkitektur

### 2.1 next-intl-oppsett (cookie, uten ruting)
- Installer `next-intl` (pin en versjon bekreftet kompatibel med Next 16 — planens første steg verifiserer; se §6 fallback).
- `next.config.ts`: wrap eksisterende config med `createNextIntlPlugin('./src/i18n/request.ts')`.
- `src/i18n/request.ts` (`getRequestConfig`): les `NEXT_LOCALE` fra `cookies()` (default `'no'`, valider mot `['no','en']`), returner `{ locale, messages: (await import(\`../../messages/${locale}.json\`)).default }`.
- `src/app/layout.tsx`: hent `locale` via `getLocale()`, sett `<html lang={locale}>`, og wrap `{children}` i `<NextIntlClientProvider>` (locale + messages via `getMessages()`) slik at både server- og klientkomponenter kan bruke oversettelser. Layout er allerede `force-dynamic`.

### 2.2 Meldingskataloger
- `messages/no.json` og `messages/en.json`, navnerom-delt: `nav` (gruppe-etiketter + menypunkt-navn/beskrivelser), `header`, `common`.
- `en.json` speiler `no.json`s nøkkelsett nøyaktig. En **unit-test håndhever rekursiv nøkkel-paritet** (samme nøkler i begge) — fanger manglende oversettelser ved build.

### 2.3 Navigasjon (`src/lib/data/nav.ts`)
- Restrukturer `NavItem` til strukturell form `{ key: string; href: string }` og `NavGroup` til `{ groupKey?: string; items }`. Display-strengene (`name`, `description`, gruppe-`label`) flyttes **ut** av nav.ts og inn i meldingskatalogene under `nav.{key}.name` / `nav.{key}.description` / `nav.group.{groupKey}` — for begge språk. (Stabile nøkler avledet fra dagens ruter, f.eks. `oversikt`, `sok`, `team`, `selskaper` …; gruppe-nøkler `intern`, `selskap`, `matsystem`, `produsenter`, `nordisk`, `kunnskap`, `bibliotek`.)
- `Sidebar.tsx` rendrer hvert punkt via `t(\`nav.${item.key}.name\`)` osv. Alle eksisterende `href` og rute-oppførsel er uendret.

### 2.4 Header + språkbryter
- `Header.tsx`: erstatt hardkodede strenger med `t('header.*')`; rendre `<LanguageSwitcher />` (øverst til høyre).
- `src/components/layout/LanguageSwitcher.tsx` (klientkomponent): NO/EN-toggle. Klikk kaller en **server action** `setLocale(locale: 'no'|'en')` som setter `cookies().set('NEXT_LOCALE', locale, { path: '/', maxAge: 1 år })`, deretter `router.refresh()`. Markerer aktivt språk.

## 3. Dataflyt
```
NEXT_LOCALE-cookie ──► src/i18n/request.ts (getRequestConfig) ──► { locale, messages }
   ▲                                            │
   │ setLocale() server action                  ├─► layout.tsx: <html lang> + NextIntlClientProvider
   │                                            └─► Sidebar/Header: t('nav.*'/'header.*')
LanguageSwitcher (klikk) ──► setLocale + router.refresh()
```

## 4. Feilhåndtering / edge cases
- Ingen/ugyldig cookie → default `'no'`.
- Manglende oversettelsesnøkkel → next-intl-standard (faller tilbake/varsler); paritet-testen forhindrer dette i praksis.
- `import()` av ukjent locale-fil → fanget av locale-valideringen i `request.ts`.

## 5. Testing
- **`tests/i18n/messages-parity.test.ts` (node:test):** flat ut nøklene i `messages/no.json` og `messages/en.json` rekursivt og assert at nøkkelsettene er identiske; assert at hvert nav-`key` i `nav.ts` har en `nav.{key}.name` i begge kataloger.
- **`tests/i18n/resolve-locale.test.ts`:** ren funksjon som mapper cookie-verdi → locale (default `'no'`, valider).
- Komponenter (Sidebar/Header/LanguageSwitcher) verifiseres med `npm run build` + `npm run lint` + manuell veksling.

## 6. Risiko / fallback
- **next-intl × Next.js 16:** Next 16 er ferskt. Planens første oppgave installerer next-intl og verifiserer et minimalt «uten ruting»-oppsett (én testside som veksler). **Hvis inkompatibelt:** fall tilbake til et lett hjemmesnekret i18n — en `messages`-modul + React-context + en `useT()`-hook + cookie — samme katalog-/bryter-design, uten next-intl. Spec-ens datamodell (kataloger, nøkler, cookie, bryter) er rammeverk-uavhengig.

## 7. Filer
**Nye:** `src/i18n/request.ts`, `messages/no.json`, `messages/en.json`, `src/components/layout/LanguageSwitcher.tsx`, `src/i18n/resolve-locale.ts` (ren helper), tester (`tests/i18n/*`).
**Endres:** `next.config.ts`, `src/app/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/lib/data/nav.ts`, `package.json`.

## 8. Utenfor omfang (senere faser)
- Fase 1b: felleskomponenter (StatusLegend, EmptyState, PageFraming/Glossary/Internal*-standardtekst).
- Fase 2+: side-for-side eksternalisering av nøkkelsider (forside, /innsikt, /sirkularitet …), én PR per sidegruppe.
- URL-basert locale-ruting (`/no`, `/en`); oversettelse av DB-innhold; «innhold på norsk»-indikator når UI er EN men siden er NO.
