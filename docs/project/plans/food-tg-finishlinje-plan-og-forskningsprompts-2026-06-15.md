---
tittel: Food TG — Finishlinje-plan + forskningsbacklog med ferdige prompts (2026-06-15)
status: Forward-plan / referansedokument
eier: Gabriel
dato: 2026-06-15
formål: Ett sted å se (1) hva som gjenstår og i hvilken rekkefølge, (2) den lokale DB-lukkingen, (3) needs-data-forskningsbacklogen med navngitte kilder, og (4) ferdige, lim-inn-klare prompts per gjenstående lens. Agent-agnostisk (Claude/Gemini under protokollen, eller manuelt).
relaterte_filer:
  - docs/project/status/food-tg-strom-a-runbook-2026-06-15.md
  - docs/project/status/food-tg-strom-a-kommandoark-2026-06-15.md
  - docs/project/status/food-tg-master-handover-sluttrapport-2026-06-15.md
  - docs/project/status/food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md
  - docs/project/status/food-tg-dybdeanalyse-handoff-2026-06-15.md
---

# Finishlinje-plan + forskningsbacklog

## 1. Statusbilde (per 2026-06-15)

**Ferdig + deployet (main `3c5a5f3`):** all plattform-surfacing (8 lenser + kryss-node i `/innsikt`), 4 figurer, HHI-harmonisering (3327 KT), whitepaper-kapittel, policy-oppsummering, 3 nye acceptance-tester, drift-fikser. Runbook + kommandoark for Strøm A (staget).

**Gjenstår** — alt henger på én ting: **en lokal økt med levende DB.**

| Spor | Hva | Blokker | Når |
|---|---|---|---|
| **Strøm A** | Lokal DB-lukking: vei 2 (styre-dekning) + strict-source (9 brudd) + operator-sekvens + vei 1 (eierandel-%) | Lokal Postgres + bestilt Aksjonærregister-uttrekk | **Nå — kritisk sti** |
| **Strøm B4** | Verifiser at `/graf`, `/styremedlemmer`, `/personer`, `/eierskap`, `/selskap` reflekterer nye rader | Avhenger av A | Rett etter A |
| **Strøm D3/D4** | Konsern-coverage-konsumenter; `validate:brreg` + orgnr-korreksjon (NTS/SalmoNor/Hallvard Lerøy) | Avhenger av A | Rett etter A |
| **CL-MAKTKART-001 → citable** | Løft det samlende uttaket; publiser whitepaper eksternt | Eierandel-% + operator-sekvens (begge i A) | Etter A |
| **Strøm E** | Needs-data-forskning (4 lenser, se §4) | Ny datainnhenting (åpne kilder + 1 DB-join) | Parallelt/senere |

## 2. Anbefalt rekkefølge

1. **Strøm A — kjør runbooken** (`food-tg-strom-a-runbook-2026-06-15.md`). Gir citable-porten grønn. Rekkefølge i runbooken: §0 preflight → §1 vei 2 → §2 strict-source → §3 operator-sekvens + push → §4 vei 1 eierandel-% → §5 validate:brreg.
2. **Post-A-verifikasjon (B4 + D3/D4):** kjør `npm run graph:audit` grønn; sjekk de fem sidene; kjør `validate:brreg` og vurder orgnr-korreksjon.
3. **Løft CL-MAKTKART-001:** når §2–§4 i A er grønne, er alle blokkere borte (§8 steg 3–4 er allerede lukket). Oppdater claim-status i syntese + whitepaper, og ta whitepaper-kapittelet ut eksternt (claim-locket, citable_with_note).
4. **Strøm E (forskning):** kjør de fire needs-data-promptene i §5 — parallelt med eller etter A. AP-4 krever DB (gjør etter A); AP-2/AP-6/AP-7 er åpne-data (kan gjøres når som helst).

## 3. Slik kjører du en forsknings-/lukkeøkt (protokoll + konvensjoner)

**Sikkerhet (ufravikelig):** alt agent-arbeid på `claude/<oppgave>`- eller `gemini/<oppgave>`-branch fra siste main; aldri direkte på main; aldri push/merge uten din review; én oppgave + akseptansekriterium om gangen; gater `npm test && npm run lint && npm run build && git diff --check` + kort rapport per oppgave. Rør aldri DB-avledede artefakter utenom `compute-metrics:full`. (Full protokoll: `food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md`.)

**Konvensjoner for nye AP-/forskningspakker:**
- DB-fri/ren eksportert kjerne + `pathToFileURL`-guard (så `import` ikke kjører `main`); enhetstest matematikken.
- Funnnotat med fast form: kort funn, tall, tolkning/lakmustest, claim-lock-rad, forbehold, verifikasjon, kilder.
- Claim-disiplin: «makt»/«konsentrasjon» = strukturell posisjon, ikke intensjon; oppgi alltid dekningsgrad; **`needs-data` framfor å gjette**; estimerte andeler merkes eksplisitt (aldri som kildebelagte).
- Fan-out-mønster: parallelle subagenter for uavhengige lenser + én coordinator som re-verifiserer aritmetikken (HHI = Σ andel²). Det fanget faktisk en subagent-feil sist.
- Verifiser før commit: `npx eslint <filer>`, `npx tsc --noEmit` (egne filer), `npm test`, `git diff --check`.

## 4. Forskningsbacklog (needs-data) — navngitte kilder

| Lens | Spørsmål som lukker | Navngitt kilde | Output | Merknad |
|---|---|---|---|---|
| **AP-2 presise node-andeler** | Produsentandeler for oppdrettsfôr, kraftfôr, egg; foodservice-distribusjon (ASKO leder-andel 36–50 %); logistikk volum-HHI | Kontali; selskapenes årsrapporter; Konkurransetilsynet; Landbruksdirektoratet kraftfôrstatistikk | Oppgraderer 5 noder fra «citable struktur» → ekte HHI | Catering-operatører: HHI **metodisk uegnet** (anbudsmarked) — ikke regn |
| **AP-7 fôr→oppdrett-PPI** | Ren månedlig fôr-prisindeks for å teste fôr→laks-asymmetrien (det opprinnelig spesifiserte leddet) | Nofima / Fiskeridirektoratet fôrkostnadsstatistikk (SSB publiserer **ingen** ren fôr-PPI) | Lukker det utestede fôr-leddet i AP-7 | Til da: ikke lån foredlings- eller dagligvarefunnet til fôr-leddet |
| **AP-6 restråstoffvolum** | Faktiske restråstoff-volumer per aktør (slakteavskjær, ensilasje, slam) | RUBIN / SINTEF / Fiskeridirektoratet restråstoffstatistikk | Tallfester «MTB-konsentrasjon → restråstoff-kontroll» (nå kun strukturell posisjon) | Hold lokalitet ≠ MTB ≠ restråstoff strengt atskilt |
| **AP-4 volum↔margin** | Per-aktør volum-mot-margin-divergens | **DB-join** `DeliveryVolume` × `CompanyFinancial` (~50 % finansdekning) | Tester selve verdifangst-hypotesen | Krever DB → gjør etter Strøm A; ikke ekstrapoler 50 %-dekningen |

## 5. Lim-inn-klare prompts (én per gjenstående lens)

> Gi én prompt om gangen til en ny agent-økt. Hver er selvstendig og bakt med protokoll + akseptanse. Bytt `<…>` der det trengs.

### 5.1 AP-2 — presise node-markeds-HHI (åpne data, fan-out)

```
Oppgave: Lukk AP-2 «presise node-markeds-HHI» for nodene som i dag står som «citable struktur / needs-data presis»: oppdrettsfôr, kraftfôr, egg, foodservice-distribusjon (ASKO/NG leder-andel), logistikk volum-HHI.

Kontekst: Les docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md (§7 node-dekningskart, §11 logistikk/foodservice). 5 noder har allerede ekte HHI; disse 5 mangler presise produsentandeler.

Metode: Fan-out — én subagent per node. Hver henter kildebelagte markedsandeler (volum eller omsetning, oppgi basis + år) fra: Kontali, selskapenes årsrapporter, Konkurransetilsynet, Landbruksdirektoratets kraftfôrstatistikk. Coordinator re-verifiserer HHI = Σ(andel%)². Merk markedsleder-andeler som kildebelagt og utfordrer-split som estimert (aldri motsatt).

Hardt stoppspråk: Catering-operatører (kantinedrift) skal IKKE få HHI — anbudsmarked, KT advarer at spot-andeler overdriver. Ikke bland baser/år. Ikke dobbelttell eier-overlappende aktører.

Output: oppdater funnnotatet §7-statusene + claim-statusene; hvis en node når «citable m/forbehold», noter leder-gulvet. Ingen committet fil endres uten at tallene er coordinator-verifisert.

Sikkerhet + gater: jobb på claude/ap2-node-hhi-presis branch; ingen push/merge uten review; npm test && npm run lint && git diff --check; kort rapport.
```

### 5.2 AP-7 — fôr→oppdrett-PPI (åpne data)

```
Oppgave: Skaff en månedlig fôr-prisindeks for laksefôr så det opprinnelig spesifiserte fôr→oppdrett-leddet i AP-7 kan testes (i dag er bare laks→foredling testet).

Kontekst: Les docs/project/analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md (§6 needs-data). SSB publiserer INGEN ren månedlig fôr-PPI (SNN108 er sammenblandet).

Metode: Vurder Nofima og Fiskeridirektoratets fôrkostnads-/fôrfaktorstatistikk, evt. importprisindeks for fiskemel/-olje/soya. Hvis en brukbar månedsserie finnes: replikér NARDL + distribuert-lag + fortegnstest fra research/norge/kvantitativ-dybdeanalyse.md §H-NY1, mot oppdretternes førstehåndspris. Kontroller for valuta (deflater EUR/USD) — det er hovedforbeholdet i hele AP-7.

Hvis ingen ren serie finnes: dokumenter eksplisitt at leddet forblir needs-data, med hvilke kilder som ble sjekket. Ikke lån foredlings- eller dagligvarefunnet til fôr-leddet.

Output: enten et nytt fôr→oppdrett-delfunn (med valuta-forbehold) eller en oppdatert needs-data-avgrensning i AP-7-notatet.

Sikkerhet + gater: claude/ap7-for-ppi branch; ingen push/merge uten review; npm test && npm run lint && git diff --check; kort rapport.
```

### 5.3 AP-6 — restråstoffvolum per aktør (åpne data)

```
Oppgave: Tallfest restråstoff-koblingen i AP-6 («MTB-konsentrasjon → restråstoff-kontroll») som i dag kun er strukturell posisjon.

Kontekst: Les docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md (§3 + §6). Tre nivåer skal holdes STRENGT atskilt: lokalitet ≠ MTB (biomasse) ≠ restråstoffvolum.

Metode: Hent faktiske restråstoff-volumer per aktør (slakteavskjær, dødfisk/ensilasje, slam) fra RUBIN, SINTEF og Fiskeridirektoratets restråstoffstatistikk. Sammenhold med sjøbasert MTB-konsentrasjonen (CR4 57 %, HHI ~929). Vurder hvor mye som internaliseres (egne slakterier/bearbeiding) vs selges i et åpent annenhåndsmarked.

Stoppspråk: Restråstoff-kontroll er strukturell posisjon/mulighet til volumer foreligger; ikke fremstill som intensjon. Ikke konflater de tre nivåene.

Output: et restråstoff-delfunn med faktiske volumer + dekningsgrad, eller en skjerpet needs-data-avgrensning hvis volumene ikke er offentlige per aktør.

Sikkerhet + gater: claude/ap6-restrastoff branch; ingen push/merge uten review; npm test && npm run lint && git diff --check; kort rapport.
```

### 5.4 AP-4 — per-aktør volum↔margin (KREVER DB — kjør etter Strøm A)

```
Oppgave: Test verdifangst-hypotesen i AP-4: per-aktør volum-mot-margin-divergens langs verdikjeden.

Forutsetning: Lokal DB (kjør etter Strøm A). Les docs/project/analysis/food-tg-ap4-ap8-partial-funn-2026-06-14.md.

Metode: DB-join DeliveryVolume (~60 310 rader, volum per leverandør) × CompanyFinancial (omsetning/margin), bro via Company.id. Normaliser volum til tonn per commodity; left-join til regnskap; flagg hasFinancial (~50 % treff); Spearman volum↔margin; aggreger til kjedeledd. DB-fri/ren eksportert kjerne + pathToFileURL-guard; enhetstest aritmetikken.

Stoppspråk: ~50 % finansdekning er systematisk skjev mot store/konsern — INGEN korpus-ekstrapolering. GVA/tonn blander inn importert råstoff (sjømat-fôr ~92 % importert) → verdi/tonn ≠ ren norsk verdiskaping.

Output: AP-4-funnnotat oppdatert fra needs-data → delfunn/klar-med-forbehold med faktisk volum↔margin-test + dekningsgrad. Oppdater CL-AP4-001.

Sikkerhet + gater: claude/ap4-volum-margin branch; ingen push/merge uten review; npm test && npm run lint && npm run build && git diff --check; kort rapport.
```

## 6. Når er ALT i land?

- [ ] Strøm A grønn (runbook §6 done-kriterier): strict-source 0 brudd, operator-sekvens grønn, eierandel-% verifisert.
- [ ] B4 + D3/D4: sider reflekterer nye data; `graph:audit` grønn; `validate:brreg` grønn/dokumentert.
- [ ] CL-MAKTKART-001 løftet til citable; whitepaper-kapittel publisert eksternt (claim-locket).
- [ ] Strøm E: de fire needs-data-lensene enten lukket eller eksplisitt avgrenset med sjekkede kilder.
- [ ] Alt review’d + merget til main; deploy verifisert (`/api/version` = ny SHA).
