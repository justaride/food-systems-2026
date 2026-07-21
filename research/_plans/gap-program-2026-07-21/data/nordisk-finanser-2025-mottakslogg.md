# Mottakslogg — Nordiske 2025-finanser (FI/IS)

**Batch-ID:** nordisk-finanser-2025-fi-is
**Dato:** 2026-07-21
**Innhentet av:** KI-agent (desk research, gap-lukkingsprogram T3)
**Formål:** Lukke asymmetrien DATAGAP §3.8 flagget — «FI/IS 2025-finanser mangler» — for de nordiske dagligvare-majors.
**Status:** Source-gated kandidatbatch. IKKE navngitt menneskereviewet, PCQ-kontrollert, importert eller claim-locket. Skal gjennom kildereview → importdesign → PCQ → dry-run → eventuell import → `db:audit`.

## Claim-grenser (leses før import)

1. **Kildekandidater, ikke menneskeverifisert.** Tallene er registrert fra oppgitte selskapsrapporter/børsmeldinger med URL og tilgangsdato. De er *mottatt*, ikke kontrollert av navngitt reviewer, PCQ-kontrollert eller kryssverifisert mot en andrekilde. `verificationStatus` skal derfor ikke settes til `human_verified` før review er dokumentert.
2. **Avvikende regnskapsår må merkes.** Lidl Suomi (t.o.m. 28.02.2025) og Hagar hf (2025/26, 01.03.2025–28.02.2026) følger IKKE kalenderår. Disse kan ikke sammenlignes direkte med kalenderårstall uten eksplisitt note. Kesko, S-ryhmä og Festi er kalenderår 2025.
3. **Valuta ikke omregnet.** ISK-tall (Hagar, Festi) og EUR-tall (Kesko, S-ryhmä, Lidl) er beholdt i original valuta. Enhver NOK-normalisering er en avledning som krever dokumentert valutakilde, metode og faktisk regnskapsperiode etter `.claude/source-attribution-policy.md`; originalverdien skal bevares.
4. **Lidl-raden er ikke et 2025-kalenderår.** Kandidatsøket har lokalisert
   regnskapsåret t.o.m. 28.02.2025 (publisert 28.08.2025), klassifisert av
   kilden som fiscal 2024. Kandidatsettet dokumenterer ikke at et nyere tall
   ikke finnes; raden forblir source-gated til periode og siste tilgjengelige
   rapport er kontrollert.
5. **Samkaup står åpen.** Samkaup hf (IS) mangler fortsatt et brukbart driftsresultatfelt i de offentlige børsmeldingene — dokumenteres som åpen B-celle (jf. DATAGAP §3.10), ikke som lukket.
6. **Divisjonstall vs konserntall.** Kesko er ført både som konsern og som ren dagligvaredivisjon (grocery trade) — hold disse adskilt; dagligvaretallet er det relevante for verdikjedeanalysen, konserntallet inkluderer byggevare og bil. Kandidatbatchen kan ikke importeres før det er besluttet hvordan konsern-/segmentrader og flere metrikktyper skal mappes uten å overskrive hverandre.
7. **Minimumsproveniens før import.** Hver importert feltpåstand må ha `sourceClass`, `citationText`, `accessedAt`, minst én lokator, `verificationStatus` og relevant `fieldPath`. En fritekstlig `source` eller `provenanceType` alene oppfyller ikke kildepolicyen.

## Rader i batch

Se `nordisk-finanser-2025-kandidater.csv` (**16 datarader: 15 tallceller + 1 åpen Samkaup-rad**).

| # | Aktør | Tall låst? | Kilde lokalisert | Merknad |
|---|---|---|---|---|
| 1–4 | Kesko (konsern + dagligvare) | nei (kandidat) | ja — Kesko FS-release 05.02.2026; menneskereview gjenstår | 4 tall |
| 5–7 | S-ryhmä | nei (kandidat) | ja — s-ryhma.fi 12.02.2026; menneskereview gjenstår | 3 tall |
| 8–9 | Lidl Suomi | nei (kandidat) | ja — Lidl/STT 28.08.2025; menneskereview gjenstår | 2 tall; avvikende regnskapsår |
| 10–12 | Hagar hf | nei (kandidat) | ja — Hagar FS 29.04.2026; menneskereview gjenstår | 3 tall; avvikende regnskapsår |
| 13–15 | Festi hf | nei (kandidat) | ja — Festi ársreikningur 05.02.2026; menneskereview gjenstår | 3 tall; kalenderår |
| — | Samkaup hf | ÅPEN | — | B-celle |

## Maskinell modellgate

`npm run validate:fi-is-financial-candidates` er en read-only, fail-closed
kontroll av CSV-en mot gjeldende `CompanyFinancial`-skjema. Kontroll 2026-07-21:

- kontrakt: 16 rader = 15 tallceller + 1 åpen rad — bestått;
- Kesko, S Group, Lidl, Hagar og Festi: `model_decision_required`;
- Samkaup: `source_gap`;
- samlet resultat: `canApply: false`.

Validatoren dokumenterer hvorfor batchen ikke kan mates inn i det eksisterende
SE/DK-importløpet: modellen har én rad per `companyId` + heltallsår, ingen
scope-dimensjon og ingen net-profit-kolonne. Den krever også dokumentert FX for
faktisk periode. Dette erstatter ikke menneskereview eller PCQ, men hindrer at
kandidatarket omtales som importklart.

## Review-kø (menneskehandling før import)

- [ ] Kryssverifiser Kesko dagligvare- vs konserntall mot Kesko-rapportens tabell (unngå divisjonsforveksling).
- [ ] Bekreft S-ryhmä marketkauppa = dagligvare (ikke inkl. ABC/varehus) mot kilde.
- [ ] Dokumenter navngitt reviewer og reviewdato; behold `verificationStatus = unverified` frem til denne kontrollen er fullført.
- [ ] Merk Lidl + Hagar med faktisk regnskapsperiode i importdesignet så avvikende regnskapsår vises i appen.
- [ ] Beslutt modellmapping for konsern vs segment og for `net_sales`/`retail_sales`/`grocery_sales`/`operating_result`/`ebitda`/`profit` før dry-run.
- [ ] Dokumenter eventuell NOK-konvertering med valutakilde og periode; bevar original valuta og originalverdi.
- [ ] Vurder om Samkaup-tallet kan hentes fra årsregnskap/årsrapport; behold
  raden som åpent source-gap hvis ingen kontrollert kilde blir funnet. Ikke
  klassifiser nasjonalt eller institusjonelt fravær fra ett mislykket søk.
- [ ] Opprett feltbundet kildeproveniens med `sourceClass`, `citationText`, `accessedAt`, URL/lokal lokator, `verificationStatus` og `fieldPath`; `provenanceType = external_report` alene er utilstrekkelig.
- [ ] Kjør `npm run db:audit` etter import; bekreft strict source gate forblir grønn.

## Neste steg

1. Navngitt menneskereview av punktene over; ingen fast tidsprognose før kilde-, scope-, periode-, valuta- og modellvalgene er avklart.
2. Beslutt modell- og valutamapping; skriv/utvid deretter import-scriptet med batchen som typed input. Det eksisterende `db:import:nordic-financials-2025`-løpet dekker SE/DK og skal ikke brukes som FI/IS-import uten eksplisitt utvidelse og review.
3. Kjør dry-run og inspiser hele planen; importer bare etter godkjent plan.
4. Eventuell import → `npm run db:audit` → `npm run compute-masterhjerne`; kjør relevante claim-gater før ekstern bruk.
5. Først etter bestått review, import og audit kan FI/IS-status flyttes fra «source-gated kandidat» til «kontrollert/importert». Samkaup forblir åpen til egen disposisjon er dokumentert.
