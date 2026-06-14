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
- `scripts/analyze-subsidy-concentration.ts` — **bugfix**: `SCHEME_ALIASES`/`resolveSchemeHeaders` for 2024s omdøpte kolonner. Enhetstestet (committet). **NB:** aggregatet `ap3-tilskuddskonsentrasjon.json` står fortsatt på den gamle 10,94 mrd — regenereringen ble rullet tilbake (se §6.1).

**Nye datasett:**
- `research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json` (265 styreverv, 31 selskaper).
- `research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json` (22 selskaper, form + styrekontroll).
- `research/analyse/ap3-tilskuddskonsentrasjon.json` (committet på gammel 2024 = 10,94 mrd — regenerering til 18,61 mrd gjenstår, se §6.1).

**Nye funnnotater:** AP-1 dekningsutvidelse, maktkart Brønnøysund-stikkprøve (§8 steg 1), maktkart §8 steg 3–4, AP-6 havbruk, AP-7 pris-asymmetri, AP-4+AP-8 partial.

**Primærsjekker utført herfra (åpne kilder):** Brønnøysund (form + styre, 22/22 formmatch, 9/10 broer); Landbruksdirektoratet/LMD (2024-tilskudd total); SSB (AP-7 prisserier); Fiskeridirektoratet (AP-6 MTB); Konkurransetilsynet (dagligvare-HHI).

## 2. Status alle 8 lenser (intern baseline, claim-lock)

| AP | Status | Kjerne-funn |
|---|---|---|
| AP-1 styrer | `klar-med-forbehold` | Broer i retail/logistikk/foredling; 9/10 primærsjekket; dekningsutvidelse 36 %→~47 % klar til DB-kjøring |
| AP-2 eierskap | `intern baseline` + dagligvare-HHI delvis | Makt er samvirke-/styrebåren, ikke aksjekonsentrert; ekte dagligvare-HHI ~3 327 |
| AP-3 tilskudd | `klar-med-forbehold` | Moderat konsentrert (Gini ~0,52–0,54); 2024 lukket (var skript-bug) |
| AP-4 verdifangst | delvis; kjerne `needs-data` | Sjømat ~2× verdi/tonn; per-aktør volum↔margin = DB-join |
| AP-5 konsern | `klar-med-forbehold` for struktur | 19 tverrsektorielle kontrollører; form+styre primærsjekket; eierandel-% `needs-data` |
| AP-6 havbruk | `intern baseline` | Sjøbasert MTB CR4 57 %, HHI ~929; land-RAS fortynner totaltall |
| AP-7 pris-asymmetri | `intern STØTTET` (valuta-forbehold) | Asymmetri bekreftet laks→foredling (NARDL t=14,0) |
| AP-8 tilskudd↔konsentrasjon | `needs-data`-kjerne + regionalt null-funn | Regionalt strukturnøytral (r≈−0,05) |
| Syntese | `klar-med-forbehold` for struktur | CL-MAKTKART-001; CL-DAGLIGVARE-HHI-001 citable-kvalifisert m/forbehold |

Detaljer: arbeidsplan §9 (statusoversikt) + PCQ Runde 8–10 + de enkelte funnnotatene.

## 3. Vei til citable (maktkart §8)

Steg 1 (Brønnøysund-stikkprøve) ✓ · steg 2 (dekningsutvidelse) klar · **steg 4 (2024-tilskudd) lukket** · **steg 3 (markeds-HHI) delvis** (dagligvare) · steg 5 (operator-sekvens) gjenstår. CL-MAKTKART-001 kan løftes mot citable først når eierandel-% + kryss-node-HHI + operator-sekvensen er på plass.

## 4. Lokale steg som gjenstår (din maskin)

Alt er spesifisert i to operator-docs:
- **`food-tg-closeout-2026-06-14.md`** — strict-source-opprydding (9 brudd; enrich→prune→backfill) + full sekvens.
- **`food-tg-lokal-kjoere-commit-guide-2026-06-14.md`** — vei 2 (import→dedupe→AP-1-rekjøring), vei 1 (Aksjonærregister), commit/push.

Kjernerekkefølge: vei 2-import → `dedupe-person-keys --commit` → AP-1-rekjøring → strict-source-opprydding → operator-sekvens grønn → vei 1 eierandel-%.

## 5. Needs-data (navngitte kilder per lens)

- **AP-5:** eierandel-% → Skatteetaten Aksjonærregister (bestilt uttrekk; verktøy klart).
- **AP-2/AP-8:** kryss-node markeds-HHI → Fiskeridirektoratet/Kontali (sjømat), markedsregulator (TINE/Nortura), bransjekilder (fôr/logistikk/foodservice).
- **AP-7:** fôr→oppdrett-PPI → SSB publiserer ingen ren fôr-PPI; vurder Nofima/Fiskeridir fôrkostnadsstatistikk.
- **AP-4:** per-aktør volum↔margin → DB-join `DeliveryVolume × CompanyFinancial` (~50 % finansdekning).
- **AP-6:** restråstoffvolum per aktør → RUBIN/SINTEF.

## 6. Git / uncommittede filer

To commits er allerede pushet til `main` (`bccb924` tooling, `0501c0a` docs). Senere runder (AP-3-fiks + §8 3–4 + AP-4/6/7/8) ligger uncommittet i treet — du/parallell-prosessen styrer git. Foreslåtte commits:
- `fix(ap3): alias-resolver for 2024 kolonnenavn + regenerert aggregat`
- `docs(maktkart): §8 steg 3–4 + AP-4/6/7/8 funn + status — alle 8 lenser`

Separate, bevisst utelatte spor: `MCP-CONNECTOR-ANALYSIS...md`, `PILOT-BRREG-...md`, og en uncommittet `validate-against-brreg`-pakke (+ `package.json`-linje) — beslutning gjenstår.

### 6.1 Kjent inkonsistens å rydde (AP-3 2024)

AP-3-avstemmingen ble delvis rullet tilbake i git. Treet er nå internt motstridende:

- **Committet og korrekt:** script-fiksen (`analyze-subsidy-concentration.ts`, gir 18,61 mrd ved kjøring) + `...maktkart-section8-3-4...` (sier «2024 lukket, 18,61 mrd»).
- **Committet, men gammelt:** `ap3-tilskuddskonsentrasjon.json` (2024 = 10,94 mrd), AP-3-funnnotatets §4 («2024 ufullstendig») og `dybdeanalyse.ts` `ins-ap3-001` («2024 utelatt»).

**Rydding (når du vil):** regenerer aggregatet (`npx tsx scripts/analyze-subsidy-concentration.ts --year=2022,2023,2024 --out=research/analyse/ap3-tilskuddskonsentrasjon.json`) og oppdater AP-3-funnnotatets §4 + `dybdeanalyse.ts` `ins-ap3-001` til «2024 lukket (18,61 mrd)». Disse tre redigeringene ble laget i forrige økt men rullet tilbake — re-applisering avventer din beslutning.

## 7. Konvensjoner (følg disse)

- **Nye AP-pakker:** DB-fri/ren eksportert kjerne + `pathToFileURL`-guard; enhetstest matematikken; funnnotat (kort funn, tall, tolkning/lakmustest, claim-lock-rad, forbehold, verifikasjon, kilder); claim-disiplin («makt» = strukturell posisjon; dekningsgrad alltid; `needs-data` framfor å gjette).
- **personKey:** alltid `canonicalPersonKey`; kjør `dedupe-person-keys --commit` etter nye styre-/personrader.
- **Verifiser før commit:** `npx eslint <filer>`, `npx tsc --noEmit` (egne filer), `npm test`, `git diff --check`.
- **Fan-out-mønster (denne sesjonen):** parallelle subagenter for uavhengige lenser + coordinator-verifikasjon. Det fungerte godt og fanget faktisk en subagent-feil (AP-3-mekanismen). Bruk in-session-subagenter for parallell research; vurder Platform managed-agents først ved løpende produksjonsvolum.

## 8. Veier videre (velg i ny økt)

1. **Lokal lukking** (høyest verdi nå): kjør closeout + guide-stegene → strict-source grønn → CL-AP1/AP-5 mot citable.
2. **Eierandel-% (AP-5):** bestill Aksjonærregister-uttrekk → kjør `verify-ownership-aksjonaerregister.ts`.
3. **Lukk needs-data-lenser:** kryss-node markeds-HHI (AP-2/AP-8), fôr→oppdrett-PPI (AP-7), restråstoff (AP-6) — alle ny datainnhenting.
4. **Samlende uttak:** når struktur + eierandel + §8 er grønt — bygg whitepaper-kapittel/figur over maktkartet.

## 9. Verifikasjon

Hele testsuiten grønn (515/515) inkl. nye AP-1-/AP-5-/AP-3-tester; `eslint`/`tsc` (egne filer)/`git diff --check` rene. Alle analysefunn er intern baseline bak claim-lock; ingen påstand er løftet til ekstern faktastemme. Primærsjekkene er etterprøvbare per orgnr/serie-ID i de respektive funnnotatene og JSON-aggregatene.
