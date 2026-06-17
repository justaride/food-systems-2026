---
tittel: Food Systems — Ukesrapport (uken som endte 16. juni 2026)
status: Prosjektrapport for intern gjennomgang / møte — komplett, står på egne ben
eier: Gabriel
dato: 2026-06-16
formål: Forklare — i klart, lite teknisk språk — alt som er arbeidet med, utviklet og verifisert den siste uken, hva funnene forteller oss, hva som er ferdig og hva som gjenstår. Alle lenker er reverifisert live 16. juni 2026. Med direkte lenker til uttakene på plattformen.
plattform: https://food-systems.naturalstateproject.com
prod_versjon_verifisert: bc92db3 (bygget 2026-06-15 22:05Z)
relaterte_filer:
  - docs/project/status/food-tg-ukesrapport-2026-06-15.md
  - docs/project/status/food-tg-statusoppdatering-2026-06-15.md
  - docs/project/status/food-tg-master-handover-sluttrapport-2026-06-15.md
  - docs/project/analysis/food-tg-policy-oppsummering-konsentrasjon-2026-06-15.md
  - docs/project/analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md
  - docs/project/analysis/food-tg-brreg-triage-2026-06-15.md
  - docs/project/plans/food-tg-finishlinje-plan-og-forskningsprompts-2026-06-15.md
---

# Food Systems — Ukesrapport

**Plattform:** <https://food-systems.naturalstateproject.com>
**Uken som endte:** 16. juni 2026

> **Én ting å vite før møtet:** Alt det utadvendte arbeidet er ferdig, testet, lagt ut i koden (GitHub) **og verifisert live på nettsiden i dag (16. juni)** — inkludert siden som var ødelagt i går (`/eierskap`), som nå rendrer riktig. Det som gjenstår er i praksis **én fokusert datakjøring på din egen maskin** pluss lavprioritert tilleggsforskning. Alle lenker under er klikket og kontrollert.

---

## 1. Sammendrag

Denne uken gikk prosjektet fra «funn i interne notater» til **funn som er synlige, illustrerte, forklart og publisert på plattformen**, og — det viktigste etter forrige ukesrapport — fra «venter på den siste datakjøringen» til **maktkartet løftet til et siterbart nivå (med forbehold) og en kritisk publiseringsfeil oppdaget og rettet.**

Tre ting flyttet seg etter morgenrapporten 15. juni:

1. **Strøm A ble kjørt ferdig lokalt** mot prosjektets database. Den tidligere kritiske blokkeren (kildekvalitets-porten var rød) er lukket, og det samlede maktkartet er løftet fra «klar med forbehold» til **siterbart med fotnote** (`citable_with_note`).
2. **Eierandel-prosentene ble verifisert** mot offentlige primærkilder (selskapenes egne IR-/årsrapporter) — uten å måtte vente på det bestilte uttrekket fra Skatteetatens Aksjonærregister.
3. **En publiseringsfeil ble oppdaget og rettet:** eierskap-siden (`/eierskap`) krasjet i produksjon fordi en datafil ikke ble pakket med i containeren. Feilen er rettet, deployet, og **bekreftet løst live i dag.**

**Hovedhistorien, i én setning (uendret og nå bedre underbygget):** Makten i norsk matsystem handler ikke først og fremst om dagligvarekjedene — *den mest ekstreme markedskonsentrasjonen ligger oppstrøms, i foredlingen, og den ligger i de medlemseide samvirkene* (meieri/TINE, egg og kjøtt/Nortura). Dagligvare er konsentrert, men foredlingsleddet er enda mer det.

**Status samlet:** Hoveduttakene er nå på nivå **🟢 siterbart med forbehold** (internt + forsiktig eksternt med fotnotene). Det som gjenstår før det helt siste — full ekstern publisering uten forbehold og fullstendig datahygiene — er **én lokal databasekjøring** og noe lavprioritert tilleggsforskning.

---

## 2. Hva vi gjorde denne uken (overordnet, uten det tekniske)

- **Lukket den siste kritiske datakjøringen (Strøm A).** Kildekvalitets-porten som var rød er nå grønn; ingen rader mangler en ærlig kildehenvisning.
- **Verifiserte eierandelene.** Hvem som eier hvor mye i de 14 sporede konsernene er nå bekreftet mot selskapenes egne offentlige rapporter.
- **Oppdaget og rettet en feil som gjorde eierskap-siden utilgjengelig** for besøkende — og bekreftet i dag at den nå fungerer.
- **Kjørte en uavhengig kontroll mot Brønnøysundregistrene** (over 250 navn/roller sjekket). Avvikene viste seg å være kosmetiske (ulik skrivemåte av navn, gammel rolletittel) — **ingen påvirker maktkartet.**
- **Ryddet i persondataene** slik at samme person ikke teller som to. Logikken er programmert og testet; selve opprydding-kjøringen mot databasen gjenstår (se §6).
- **Holdt alt testet og grønt:** 544 av 544 interne tester passerer, koden bygger, og alle endringer er lagt ut på hovedgrenen og deployet.

---

## 3. Hva funnene forteller oss — tema for tema

Tre nivåer av «hvor klart»: 🟢 = klart med forbehold (kan brukes utad hvis forbeholdene er med) · 🟡 = internt solid (bra nok for oss, ikke klart utad ennå) · 🔴 = mangler data.

Alle tall bærer kilde, år og grunnlag. «Konsentrasjon»/«makt» betyr her **strukturell posisjon i data** — ikke en påstand om ulovlig samordning eller hensikt.

### 🟢 Eierskap & konsentrasjon — *hovedfunnet*

Måler vi konsentrasjon ledd for ledd med målet konkurransemyndigheter bruker (HHI — summen av hver aktørs markedsandel opphøyd i annen), ligger den **høyest i foredling:**

- Meieri (TINE): HHI ~6000
- Egg (Nortura/Prior): HHI ~5500–6800
- Rødt kjøtt (Nortura): HHI ~4600
- Dagligvare (butikkleddet): HHI ~3327 (Konkurransetilsynets omsetningstall 2024, CR3 96,6 %)
- Laks-/ørretoppdrett: HHI ~950 — den *minst* konsentrerte noden

De tre mest konsentrerte leddene er alle **samvirke** (TINE, Nortura/Prior). **Hva det betyr:** tiltak rettet bare mot butikkleddet treffer ikke der konsentrasjonen er størst.

*Live-bekreftet i dag (`/eierskap`):* 14 sporede konserner, 161 datterselskap kartlagt, 32 åpne datakvalitet-gap. De største kontrollerende eierne: NorgesGruppen → Joh. Johannson-familien (74,4 %), Reitan Retail → Reitan-familien (100 %), Coop → samvirkelagene (100 %), Nortura → 17 000 bønder (100 %), TINE → 8 600 melkebønder (100 %), BAMA → NorgesGruppen (46 %), Mowi → John Fredriksen (14,4 %), SalMar → Gustav Witzøe (41,3 %).

→ Se på plattformen: [/innsikt](https://food-systems.naturalstateproject.com/innsikt) · [/eierskap](https://food-systems.naturalstateproject.com/eierskap) · [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🟢 Tilskudd (offentlig støtte)

Produksjonstilskuddene er **moderat** konsentrert (ikke ekstremt), og fordelingen følger i hovedsak hvor bøndene er. Samlet for 2024: ~18,6 mrd kr (vi rettet tidligere en regnefeil som feilaktig viste 10,94 mrd). **Hva det betyr:** «makten» ligger ikke i selve støtten, men i marked/distribusjon.

→ Se på plattformen: [/subsidier](https://food-systems.naturalstateproject.com/subsidier)

### 🟢 Konsern-kontroll *(styrket denne uken)*

Få konsern kontrollerer vertikalt på tvers av leddene — NorgesGruppen spenner fire ledd (butikk + logistikk + foredling + servering). To uavhengige datakilder (styrer og eierskap) gir samme bilde. **Nytt denne uken:** den siste sjekken — eierandel-% — er nå **verifisert mot offentlige primærkilder** (selskapenes IR-/årsrapporter), uten å vente på Aksjonærregisteret. Restforbehold: BAMAs eksakte NorgesGruppen/Reitan-split og et valgfritt register-kryss.

→ Se på plattformen: [/eierskap](https://food-systems.naturalstateproject.com/eierskap) · [/selskap](https://food-systems.naturalstateproject.com/selskap)

### 🟡 Havbruk

Fire konsern (Mowi, SalMar, Lerøy, Cermaq) styrer ~57 % av den sjøbaserte produksjonskapasiteten. Nye land-anlegg «vanner ut» totaltallet, så den produksjonen som faktisk finnes i dag er mer konsentrert enn et råtall antyder. Vi tallfestet også restråstoff (~546 000 tonn fra havbruk i 2022) og dokumenterte at de store i stor grad håndterer dette internt. **Hva det betyr:** kontroll over biomasse gir også posisjon i restråstoff-strømmene.

→ Se på plattformen: [/havbruk](https://food-systems.naturalstateproject.com/havbruk)

### 🟡 Pris-asymmetri

I fiskeforedling stiger prisene raskere enn de faller («rockets and feathers»): nedstrøms-prisene fanger økninger mye mer enn fall. I 2025 falt råprisen ~13 % mens foredlingsprisen *steg* ~10 %. **Forbehold:** vi har ikke renset for valutaeffekt ennå, så dette er et mønster, ikke en margin-anklage. Det rene fôr→laks-leddet (det opprinnelig spesifiserte) er fortsatt ikke testet — det krever en ren fôr-prisindeks vi ikke har ennå (se §6, Strøm E).

→ Bakgrunn på plattformen: [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🟡 Styrer / nettverk

Et fåtall styrer binder butikk, logistikk og foredling sammen — knutepunktene er BAMA, ASKO, NorgesGruppen og Reitan. *Live-bekreftet i dag (`/graf`):* 1 011 koblede noder, med NorgesGruppen, Reitan, Coop og BAMA på topp av interlock-listen. **Status:** dekningen utvides fra 36 % til ~47 % i den kommende lokale datakjøringen.

→ Se på plattformen: [/graf](https://food-systems.naturalstateproject.com/graf) · [/styremedlemmer](https://food-systems.naturalstateproject.com/styremedlemmer) · [/personer](https://food-systems.naturalstateproject.com/personer)

### 🔴 Verdifangst

Sjømat skaper ~2× verdi per tonn sammenlignet med landbruk, på nesten lik tonnasje. **Mangler:** selve testen per selskap (volum mot margin) krever en database-kobling og er ikke kjørt ennå.

→ Bakgrunn på plattformen: [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🔴 Tilskudd ↔ konsentrasjon

Et regionalt delfunn er klart: støtten er regionalt strukturnøytral (følger antall mottakere). Selve koblingen tilskudd-mot-markedskonsentrasjon mangler data.

→ Bakgrunn på plattformen: [/subsidier](https://food-systems.naturalstateproject.com/subsidier)

### Samlet «maktkart»

**Løftet denne uken:** fra 🟡 «klar med forbehold» til **🟢 `citable_with_note`** (siterbart med fotnote) i syntese, whitepaper, kø og acceptance-pakke — og er nå live på plattformen. Det betyr at hovedfunnet kan brukes utad *forutsatt at forbeholdene er med*. Helt forbeholdsfri ekstern publisering venter fortsatt på operator-sekvensen grønn på prod-databasen etter den lokale reimporten (se §6).

---

## 4. Uttakene — hva vi har produsert

### På plattformen (klikkbare sider — alle reverifisert live 16. juni)

| Side | Hva du ser | Lenke | Verifisert |
|---|---|---|---|
| Innsikt | Alle 8 analyse-temaene som kort, med funn + forbehold | <https://food-systems.naturalstateproject.com/innsikt> | ✅ rendrer |
| Eierskap | Konsern- og eierstruktur, datakvalitet, Brreg-ferskhet | <https://food-systems.naturalstateproject.com/eierskap> | ✅ **rettet & live** |
| Sammenligning | Nordisk konsentrasjon (HHI) på tvers av land | <https://food-systems.naturalstateproject.com/sammenligning> | ✅ rendrer |
| Graf | Nettverket av styrer/eierskap (1 011 noder) | <https://food-systems.naturalstateproject.com/graf> | ✅ rendrer |
| Verdikjede | Verdikjeden ledd for ledd | <https://food-systems.naturalstateproject.com/verdikjede> | ✅ rendrer |
| Havbruk | Havbrukskonsentrasjon | <https://food-systems.naturalstateproject.com/havbruk> | ✅ (pageGate ok) |
| Subsidier | Tilskuddsfordeling | <https://food-systems.naturalstateproject.com/subsidier> | ✅ (pageGate ok) |
| Styremedlemmer | Krysstyrer / interlock | <https://food-systems.naturalstateproject.com/styremedlemmer> | ✅ rendrer |
| Personer | Personprofiler i nettverket | <https://food-systems.naturalstateproject.com/personer> | ✅ rendrer |
| Selskap | Selskapsprofiler | <https://food-systems.naturalstateproject.com/selskap> | ✅ rendrer |

### Dokumenter (de skriftlige uttakene — deles som filer)

- **Policy-oppsummering** (1–2 sider, enkelt språk) — `docs/project/analysis/food-tg-policy-oppsummering-konsentrasjon-2026-06-15.md`
- **Whitepaper-kapittel** (det samlende, med tall + forbehold) — `docs/project/analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md`
- **Figurer** (4 stk., bl.a. konsentrasjonsprofilen) — `docs/project/figures/food-tg-2026-06-15/`
- **Brønnøysund-triage** (de 222 avvikene forklart) — `docs/project/analysis/food-tg-brreg-triage-2026-06-15.md`
- **Brønnøysund-auditrapport** (maskinlesbar + tabell) — `research/BRREG-VALIDATION-AUDIT.md`
- **Finishlinje-plan** (hva som gjenstår + ferdige forsknings-prompts) — `docs/project/plans/food-tg-finishlinje-plan-og-forskningsprompts-2026-06-15.md`
- **Strøm A-runbook** (steg-for-steg-oppskrift for den lokale kjøringen) — `docs/project/status/food-tg-strom-a-runbook-2026-06-15.md`

---

## 5. Verifikasjon — hva jeg faktisk kontrollerte (16. juni 2026)

Dette er gjennomgangen som bekrefter at det utadvendte arbeidet er ferdig:

- **Prod kjører nyeste bygg.** `/api/version` = `bc92db3` (bygget 2026-06-15 22:05Z). *Merk:* førstesvaret viste en eldre versjon (`3c5a5f3`) — det var bare edge-cache; med cache-bust bekreftes nyeste bygg.
- **Helsesjekk grønn.** `/api/data-status`: `ok / dbOk / pageGatesOk` alle sanne. Kunnskapsbasen inneholder bl.a. 185 selskaper, 369 personprofiler, 169 aktører, 105 forretningsrelasjoner, 990 dokumenter, 127 innsikter, 179 310 produksjonstilskudd-rader, 285 oppdrettslokaliteter.
- **Eierskap-siden fungerer igjen.** `/eierskap` rendrer nå fullt (14 konserner, 161 datterselskap, eierandeler, datakvalitet-score, Brreg-ferskhet). I går krasjet den i produksjon.
- **Nøkkelsidene rendrer med data:** `/innsikt` (alle 8 kort), `/graf` (1 011 koblede noder), `/sammenligning`, `/styremedlemmer`, `/personer`, `/selskap`.
- **Interne gater (kjørt på grenen denne uken):** 544/544 tester passerer, ESLint ren, `db:audit` og `db:audit:strict-sources` grønne (0 brudd), citation-kø P0=0/P1=0/P2=1/P3=0, acceptance-pakke 10/16 cite-ready, `build` grønn, `git diff --check` ren.

**Én nyanse å være presis på (viktig for ekstern bruk):** dagligvare-HHI er harmonisert til **3327** (Konkurransetilsynets omsetning 2024, CR3 96,6 %) i de siterbare uttakene. Den **nordiske sammenligningen** på `/sammenligning` bruker fortsatt en **butikkantall-proxy** (Norge = 3445) som er holdt konsistent på tvers av land (NO 3445 vs DK 2157 osv.) — bevisst, for ikke å desynce sammenligningen. Bland derfor ikke de to tallene: 3327 er det norske omsetnings-HHI-et, 3445 er proxyen brukt for kryssnasjonal sammenligning.

---

## 6. Hva som gjenstår (nøyaktig)

Det utadvendte er ferdig. Det som står igjen er i hovedsak **én lokal databasekjøring på din maskin** pluss lavprioritert tilleggsarbeid.

| # | Spor | Hva | Hvem / hvor | Prioritet |
|---|---|---|---|---|
| 1 | **Lokal DB-kjøring** | `db:import` (styre-dekning, vei 2) → `dedupe-person-keys --commit` (re-nøkle eksisterende personrader) → operator-sekvensen grønn på prod-DB. Logikken er ferdig og testet; selve kjøringen mot databasen gjenstår. | Din maskin (runbook finnes) | **Kritisk sti** |
| 2 | **Orgnr-rydding (D3/D4)** | 6 organisasjonsnummer-saker (bl.a. NTS / SalmoNor / Hallvard Lerøy) korrigeres i import-skriptene + `validate:brreg` før neste import. Påvirker ikke maktkartet — ren datahygiene. | Din maskin | Rett etter #1 |
| 3 | **`graph:audit` lokalt** | Den visuelle side-sjekken er gjort (og `/eierskap` bekreftet live); selve `graph:audit`-kjøringen gjenstår. | Din maskin | Rett etter #1 |
| 4 | **CL-MAKTKART-001 → fullt eksternt** | Løfte fra «siterbart med fotnote» til forbeholdsfritt eksternt. Krever operator-sekvensen grønn på prod-DB etter reimporten (#1). | Etter #1 | Når du vil utad |
| 5 | **Strøm E (needs-data)** | 4 lenser: presise node-andeler (oppdrettsfôr/kraftfôr/egg/foodservice), fôr→oppdrett-prisindeks, restråstoffvolum per aktør, per-aktør volum↔margin (krever DB). Ferdige forsknings-prompts ligger i finishlinje-planen. | Parallelt/senere | Lav |
| 6 | **Smårydding (din vurdering)** | Uncommittet `research/stale-document-fix-log.csv`; to uncommittede research-filer fra 10. juni — bl.a. `Råvareopprinnelse og globale sårbarheter i nordisk sjømatfôr` (38 KB, relevant for Strøm E fôr-lensen). Avgjør om de skal sjekkes inn eller forbli lokal scratch. | Din vurdering | Lav |

---

## 7. Hvor «klart» er det — og forbeholdene

- **Hovedfunnet (konsentrasjon topper i foredling) er godt underbygget** med offentlige, navngitte kilder, og er robust selv om enkelttallene har usikkerhet — fordi markedslederen alene allerede gir et høyt «gulv».
- **Nivået er nå «siterbart med fotnote»** (`citable_with_note`), ikke forbeholdsfritt eksternt. Det betyr: bra nok for intern beslutning *og* forsiktig ekstern bruk **så lenge fotnotene/forbeholdene følger med** — men ikke en forbeholdsfri pressemelding ennå.
- **Språket er bevisst nøkternt:** «konsentrasjon»/«makt» betyr *strukturell posisjon i data* — ikke påstander om ulovlig samordning eller hensikt.
- **Ikke bland år, markedsbaser eller HHI-proxyer** (jf. 3327 vs 3445 i §5). Ikke framstill estimerte utfordrer-andeler som kildebelagte punktverdier. Den siterbare ruten for maktpåstanden er trianguleringen av styrebroer + eierandel-% + kryss-node-HHI samlet — ikke styrebroene alene.
- **Der vi mangler sikre tall sier vi «mangler data»** i stedet for å gjette (gjelder verdifangst per selskap, tilskudd↔konsentrasjon-koblingen, og de presise node-andelene i Strøm E).

---

## 8. Anbefalt neste steg

1. **Kjør den lokale databasekjøringen** (runbooken ligger klar: `food-tg-strom-a-runbook-2026-06-15.md`). Det er det eneste som står mellom dagens tilstand og full ferdigstillelse.
2. **Etter kjøringen:** bekreft i appen at de nye dataene vises riktig (graf, styrer, eierskap), kjør `graph:audit` og `validate:brreg`.
3. **Til møtet:** bruk policy-oppsummeringen + konsentrasjonsfiguren som utgangspunkt. Hovedhistorien er klar til intern beslutning, og er ett skritt fra forbeholdsfri ekstern deling.
4. **Avgjør smårydding** (§6 #6) — om de uncommittede research-filene skal sjekkes inn.

---

*Rapporten dekker hele uken og står på egne ben. For den detaljerte tekniske statusen etter Strøm A-lukkingen, se `food-tg-statusoppdatering-2026-06-15.md`. For oppgave-for-oppgave-loggen, se `food-tg-master-handover-sluttrapport-2026-06-15.md`.*
