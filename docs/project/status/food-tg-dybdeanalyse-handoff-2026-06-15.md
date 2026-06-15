---
tittel: Food TG Dybdeanalyse — handoff for neste økt 2026-06-15
status: Intern handoff / start-her (fortsettelse av handoff 2026-06-14)
eier: Gabriel
dato: 2026-06-15
formål: Plukk opp dybdeanalyse-tråden i en ny økt uten å lese hele historikken. Oppsummerer hele forrige sesjon: alle 8 lenser kjørt, primærsjekker, AP-3-fiks, og de lokale + needs-data-stegene som gjenstår.
---

# Dybdeanalyse — start her (alle 8 lenser kjørt)

## 1. Hva er gjort denne sesjonen

Forrige handoff (2026-06-14) sto med fire AP-pakker + maktkart. Denne sesjonen kjørte hele dybdeanalysen ende-til-ende: alle 8 lenser, to §8-primærsjekker, en bug-fiks, og verktøy for de DB-/registeravhengige stegene.

**Nye verktøy (kode, committet/klart):**
- `src/lib/brreg-roles.ts` + `scripts/extend-board-coverage-brreg.ts` — AP-1 dekningsutvidelse (sittende styre fra Brønnøysund, sektor-målrettet, idempotent provenans). Enhetstestet.
- `scripts/verify-ownership-aksjonaerregister.ts` — AP-5 eierandel-% mot Skatteetatens Aksjonærregister (bestilt uttrekk). Enhetstestet.
- `scripts/analyze-subsidy-concentration.ts` — **bugfix**: `SCHEME_ALIASES`/`resolveSchemeHeaders` for 2024s omdøpte kolonner. Enhetstestet + committet. Aggregatet regenerert til **18,61 mrd** og avstemt (funnnotat §4 + surfacing); AP-3 konsistent på main (jf. §6.1 — ryddet).

**Nye datasett:**
- `research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json` (265 styreverv, 31 selskaper).
- `research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json` (22 selskaper, form + styrekontroll).
- `research/analyse/ap3-tilskuddskonsentrasjon.json` (2024 = 18,61 mrd, regenerert + avstemt).

**Nye funnnotater:** AP-1 dekningsutvidelse, maktkart Brønnøysund-stikkprøve (§8 steg 1), maktkart §8 steg 3–4, AP-6 havbruk, AP-7 pris-asymmetri, AP-4+AP-8 partial, **AP-2 kryss-node markeds-HHI (§8 steg 3, alle noder)**. Pluss `food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md` (sikker Gemini-samarbeidsprotokoll).

**Primærsjekker utført herfra (åpne kilder):** Brønnøysund (form + styre, 22/22 formmatch, 9/10 broer); Landbruksdirektoratet/LMD (2024-tilskudd total); SSB (AP-7 prisserier); Fiskeridirektoratet (AP-6 MTB); Konkurransetilsynet + Oslo Economics + KLF/Animalia + Menon (kryss-node markeds-HHI).

## 2. Status alle 8 lenser (intern baseline, claim-lock)

| AP | Status | Kjerne-funn |
|---|---|---|
| AP-1 styrer | `klar-med-forbehold` | Broer i retail/logistikk/foredling; 9/10 primærsjekket; dekningsutvidelse 36 %→~47 % klar til DB-kjøring |
| AP-2 eierskap | `klar-med-forbehold` (kryss-node-HHI) | Ekte markeds-HHI for 5 noder; **konsentrasjonen topper i foredling (samvirke TINE/Nortura ~6000/~4600), ikke retail (~3327)**; distribusjon vertikalt internalisert |
| AP-3 tilskudd | `klar-med-forbehold` | Moderat konsentrert (Gini ~0,52–0,54); 2024 lukket (var skript-bug) |
| AP-4 verdifangst | delvis; kjerne `needs-data` | Sjømat ~2× verdi/tonn; per-aktør volum↔margin = DB-join |
| AP-5 konsern | `klar-med-forbehold` for struktur | 19 tverrsektorielle kontrollører; form+styre primærsjekket; eierandel-% `needs-data` |
| AP-6 havbruk | `intern baseline` | Sjøbasert MTB CR4 57 %, HHI ~929; land-RAS fortynner totaltall |
| AP-7 pris-asymmetri | `intern STØTTET` (valuta-forbehold) | Asymmetri bekreftet laks→foredling (NARDL t=14,0) |
| AP-8 tilskudd↔konsentrasjon | `needs-data`-kjerne + regionalt null-funn | Regionalt strukturnøytral (r≈−0,05) |
| Syntese | `klar-med-forbehold` for struktur | CL-MAKTKART-001; CL-DAGLIGVARE-HHI-001 citable-kvalifisert m/forbehold |

Detaljer: arbeidsplan §9 (statusoversikt) + PCQ Runde 8–11 + de enkelte funnnotatene.

## 3. Vei til citable (maktkart §8)

Steg 1 (Brønnøysund-stikkprøve) ✓ · steg 2 (dekningsutvidelse) klar · **steg 3 (markeds-HHI) lukket så langt åpne data tillater** (5 noder ekte HHI; 5 citable struktur + needs-data presis; catering metodisk uegnet) · **steg 4 (2024-tilskudd) lukket** ✓ · steg 5 (operator-sekvens) gjenstår. CL-MAKTKART-001 kan løftes mot citable først når eierandel-% (AP-5) + operator-sekvensen er på plass.

## 4. Lokale steg som gjenstår (din maskin)

Alt er spesifisert i to operator-docs:
- **`food-tg-closeout-2026-06-14.md`** — strict-source-opprydding (9 brudd; enrich→prune→backfill) + full sekvens.
- **`food-tg-lokal-kjoere-commit-guide-2026-06-14.md`** — vei 2 (import→dedupe→AP-1-rekjøring), vei 1 (Aksjonærregister), commit/push.

Kjernerekkefølge: vei 2-import → `dedupe-person-keys --commit` → AP-1-rekjøring → strict-source-opprydding → operator-sekvens grønn → vei 1 eierandel-%.

## 5. Needs-data (navngitte kilder per lens)

- **AP-5:** eierandel-% → Skatteetaten Aksjonærregister (bestilt uttrekk; verktøy klart).
- **AP-2:** kryss-node markeds-HHI er gjort for 5 noder (citable) + 5 struktur. Gjenstår presise andeler for: oppdrettsfôr/kraftfôr/egg, foodservice-distribusjon (leder-andel ASKO ~36–50 %), logistikk volum-HHI → Kontali/årsrapporter/Konkurransetilsynet. Catering-operatører: HHI metodisk uegnet (anbudsmarked).
- **AP-7:** fôr→oppdrett-PPI → SSB publiserer ingen ren fôr-PPI; vurder Nofima/Fiskeridir fôrkostnadsstatistikk.
- **AP-4:** per-aktør volum↔margin → DB-join `DeliveryVolume × CompanyFinancial` (~50 % finansdekning).
- **AP-6:** restråstoffvolum per aktør → RUBIN/SINTEF.

## 6. Git / status

Hovedlinjen er ryddet etter en Gemini-avsporing (Gemini Flash jobbet i en Downloads-kopi, committet på sidebranch `codex/assessment-and-fixes` og blandet inn egne endringer). Opprydding gjennomført + merget til main: AP-1/AP-5/maktkart-pakken + AP-3-fiks + §8 3–4 + AP-4/6/7/8-funnnotatene + Geminis nyttige verktøy (`validate-against-brreg`, `reconcile-import-corpus`, audit-konsern-forbedring) er på `main`; de ekskluderte docene (MCP-CONNECTOR, PILOT-BRREG) + sync-skriptet ble fjernet. **`origin/main` var aldri berørt av Gemini.** Sikker arbeidsmodell for videre Gemini-bruk: `food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md`.

Uncommittet nå (denne øktens kryss-node-arbeid): `...ap2-kryssnode-hhi-funn-2026-06-15.md` (nytt) + `...gemini-arbeidsplan-protokoll-2026-06-15.md` (nytt), samt oppdatert syntese §5 / PCQ Runde 9–11 / arbeidsplan §9 / denne handoffen. Foreslått commit: `docs(ap2): kryss-node markeds-HHI + §8 steg 3 lukket + gjenopprett status`.

### 6.1 AP-3 2024 — ryddet ✓

AP-3-inkonsistensen (skript fikset, men aggregat/funnnotat/surfacing sto på gammel 10,94 mrd etter git-shufflingen) er **løst**: aggregatet regenerert til 18,61 mrd, og funnnotat §4 + `dybdeanalyse.ts` sier «2024 lukket». Konsistent på alle nivåer. PCQ Runde 9–10 + arbeidsplan §9 gikk tapt i samme shuffling (uncommittede edits) og er **gjenskapt** 2026-06-15.

## 7. Konvensjoner (følg disse)

- **Nye AP-pakker:** DB-fri/ren eksportert kjerne + `pathToFileURL`-guard; enhetstest matematikken; funnnotat (kort funn, tall, tolkning/lakmustest, claim-lock-rad, forbehold, verifikasjon, kilder); claim-disiplin («makt» = strukturell posisjon; dekningsgrad alltid; `needs-data` framfor å gjette).
- **personKey:** alltid `canonicalPersonKey`; kjør `dedupe-person-keys --commit` etter nye styre-/personrader.
- **Verifiser før commit:** `npx eslint <filer>`, `npx tsc --noEmit` (egne filer), `npm test`, `git diff --check`.
- **Fan-out-mønster (denne sesjonen):** parallelle subagenter for uavhengige lenser + coordinator-verifikasjon. Det fungerte godt og fanget faktisk en subagent-feil (AP-3-mekanismen). Bruk in-session-subagenter for parallell research; vurder Platform managed-agents først ved løpende produksjonsvolum.

## 8. Veier videre (velg i ny økt)

1. **Lokal lukking** (høyest verdi nå): kjør closeout + guide-stegene → strict-source grønn → CL-AP1/AP-5 mot citable.
2. **Eierandel-% (AP-5):** bestill Aksjonærregister-uttrekk → kjør `verify-ownership-aksjonaerregister.ts`.
3. **Lukk gjenstående needs-data:** presise fôr-/egg-/foodservice-andeler (AP-2), fôr→oppdrett-PPI (AP-7), restråstoff (AP-6), per-aktør volum↔margin (AP-4, DB) — kryss-node markeds-HHI er ellers lukket (5 noder dekket).
4. **Samlende uttak:** når struktur + eierandel + §8 er grønt — bygg whitepaper-kapittel/figur over maktkartet.

## 9. Verifikasjon

Hele testsuiten grønn (515/515) inkl. nye AP-1-/AP-5-/AP-3-tester; `eslint`/`tsc` (egne filer)/`git diff --check` rene. Alle analysefunn er intern baseline bak claim-lock; ingen påstand er løftet til ekstern faktastemme. Primærsjekkene er etterprøvbare per orgnr/serie-ID i de respektive funnnotatene og JSON-aggregatene.
