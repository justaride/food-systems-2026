---
tittel: Food TG Dybdeanalyse-arbeidsplan 2026-06-14 — ikke-opplagt analyse på eksisterende data
status: Forslag til intern arbeidsplan
eier: Gabriel
dato: 2026-06-14
scope: Strukturert, kjørbar plan for å gjøre den innsamlede dataen om til ikke-opplagte, forsvarbare påstander — uten ny bredde-research. Replikerer hypotesetest-metoden fra `research/norge/kvantitativ-dybdeanalyse.md` på tvers av de 7 caseankrene.
bruksregel: Internt arbeidsdokument. Hver analyse produserer interne funn som går gjennom claim-lock og PCQ før ekstern bruk. Ingen output er ekstern faktastemme uten operator-sekvensen i research/CITABLE-KNOWLEDGE-BASE-STATUS.md. Statistiske funn merkes med forbehold, dekningsgrad og metode.
relaterte_filer:
  - research/norge/kvantitativ-dybdeanalyse.md
  - docs/project/analysis/plattform-dybdeanalyse-2026-06-11.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/food-tg-definerte-sok-spesifikasjon-2026-06-14.md
  - docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md
---

# Food TG Dybdeanalyse-arbeidsplan 2026-06-14

## 0. Hva planen er — og hvorfor

Bekymringen som utløste planen: at kunnskapsbasen lister opp informasjon som er allemannskunnskap for folk i feltet («tre aktører kontrollerer 96 %», «selvforsyning under 50 %»), uten å gi noe nytt. Planen svarer på det med ett grep: **vri eksisterende data til ikke-opplagte, kvantifiserte påstander gjennom hypotesetesting** — ikke gjennom mer datainnsamling.

Premisset er at vi allerede har et bevis på at dette går: `kvantitativ-dybdeanalyse.md` testet faktisk hypoteser (asymmetrisk pristransmisjon PPI→KPI, sesongbasert marginekspansjon, HHI/Gini/Lorenz, tidsseriedekomponering) og produserte påstander en bransjeinnsider *ikke* allerede har liggende. Den analysen er imidlertid konsentrert om dagligvare/pris-domenet. Denne planen replikerer metoden på de andre ankrene, med data vi allerede har i basen.

Dette er bevisst **ikke** en research-plan. Bredt videre-søk er ikke flaskehalsen (jf. 09.06-konklusjonen «risikoen nå er ikke for lite kunnskap, men at alt blir like viktig»). De målrettede, definerte søkene står i eget uttak: `food-tg-definerte-sok-spesifikasjon-2026-06-14.md`.

## 1. Prinsipp og lakmustest

Hver arbeidspakke må bestå denne testen før den regnes som ferdig:

> **Produserer den minst én påstand en bransjeinnsider ikke allerede vet, og som vi kan forsvare med data?**

Beskrivende kartlegging (hvem eier hva, hva flyter hvor) består *ikke* testen alene — det er inngangsdataen, ikke innsikten. Innsikten ligger i mønsteret: konsentrasjon, asymmetri, overlapp, korrelasjon, divergens over tid.

To disipliner gjelder gjennomgående: (1) statistisk nøkternhet — korrelasjon er ikke årsak, og funn merkes med n, dekningsgrad og usikkerhet; (2) claim-disiplin — ingen påstand løftes til ekstern faktastemme uten claim-lock/PCQ, og strukturelle funn formuleres som posisjon/mønster, ikke som intensjon eller anklage.

## 2. Datagrunnlag (det vi allerede har)

Tall fra `/api/data-status` per 14.06.2026:

| Datasett | Volum | Brukes i |
|---|---|---|
| Produksjonstilskudd (`subsidiesProduksjon`) | ~179 310 rader | AP-3, AP-8 |
| Leveransevolum (`deliveryVolumes`) | ~60 310 rader | AP-4 |
| Havbrukslokaliteter (`aquacultureSites`) | 285 | AP-6 |
| Selskaper (`companies`) | 185 | AP-1, AP-2, AP-5 |
| Aktører (`actors`) | 169 | AP-1, AP-6 |
| Personprofiler (`personProfiles`) | 369 | AP-1 |
| Forretningsrelasjoner (`businessRelationships`) | 105 | AP-1, AP-5 |
| Konserndekning (`konsern-coverage`) | 14 konsern | AP-5 |

Metodisk presedens: `research/norge/kvantitativ-dybdeanalyse.md` (HHI, Gini, Lorenz, pris-asymmetri, tidsserie). Kjent begrensning: finansdekning ~50 % av selskapskorpuset (jf. `plattform-dybdeanalyse-2026-06-11.md` funn A1) — påvirker AP-4.

## 3. Analyse-backlog (arbeidspakker)

Hver pakke: ikke-opplagt hypotese → datagrunnlag → metode → output → claim-gate → anker → estimat.

### AP-1 — Styreoverlapp og maktnettverk (board interlocks)
- **Hypotese:** Reell innflytelse i norsk matsystem går via personer med styreverv på tvers av fôr, dagligvare og produksjon — ikke bare via selskapseierskap. Få personer er «broer» mellom ellers atskilte sektorer.
- **Data:** `personProfiles` (369) × `companies` (185) × `businessRelationships` (105).
- **Metode:** Bygg bipartitt person↔selskap-graf; tell styreverv per person; beregn betweenness/broer mellom sektorklynger; mål interlock-tetthet.
- **Output:** Interlock-kart + topp-N personer etter tverrsektoriell posisjon + liste over sektorbroer.
- **Claim-gate:** Styreverv verifiseres mot Brønnøysund-dato; «makt» formuleres som strukturell posisjon, ikke intensjon. Personvern: offentlige rolledata, ikke karakteristikk.
- **Anker:** Tverrgående (1, 5). **Estimat:** 2–3 dager.

### AP-2 — Eierkonsentrasjon per verdikjede-node (HHI)
- **Hypotese:** Konsentrasjonen er ujevn langs kjeden — enkelte noder (f.eks. fôrimport, grøntdistribusjon) er mer konsentrert enn dagligvarens topplinje på 96 % antyder.
- **Data:** `companies` + eierskap + `verdikjede.ts`.
- **Metode:** HHI per node i verdikjeden; ranger noder etter konsentrasjon.
- **Output:** HHI-profil per node + identifiserte flaskehals-noder.
- **Claim-gate:** HHI krever fullstendig markedsandelsgrunnlag per node; der det mangler, merk `needs-data` framfor å estimere.
- **Anker:** 1, 5. **Estimat:** 2 dager.

### AP-3 — Tilskuddskonsentrasjon (Gini/Lorenz)
- **Hypotese:** Av ~179 000 produksjonstilskudd-rader konsentreres pengene asymmetrisk — offentlig støtte forsterker eksisterende struktur framfor å utjevne den.
- **Data:** `subsidiesProduksjon` (~179 310).
- **Metode:** Gini + Lorenz-kurve per region/kategori/mottaker; topp-decil-andel; konsentrasjon over tid hvis årsdata finnes.
- **Output:** Tilskudds-Gini + topp-mottaker-konsentrasjon + regional skjevhet.
- **Claim-gate:** Tilskudd ≠ misbruk; beskriv fordeling nøytralt, ikke moralsk. Bekreft at radene er mottaker-nivå, ikke transaksjons-duplikater.
- **Anker:** 1, 5. **Estimat:** 2 dager. *(Høy gevinst: stort, rent datasett; politisk relevant; vanskelig å avfeie.)*
- **Skript:** `scripts/analyze-subsidy-concentration.ts` (kjørbart, DB-fritt; henter Landbruksdirektoratets åpne data; Gini/Lorenz/topp-andel per mottaker, ordning og kommune; matematikk enhetstestet 14.06).

### AP-4 — Verdifangst-asymmetri (volum vs. verdi)
- **Hypotese:** De som flytter mest volum er ikke de som fanger mest verdi — verdifangsten sitter et annet sted i kjeden enn volumet.
- **Data:** `deliveryVolumes` (~60 310) + finansdata der den finnes.
- **Metode:** Koble leveransevolum til omsetning/margin per aktør; volum-vs-verdi-kart; identifiser asymmetri.
- **Output:** Verdifangst-indikator per kjedeledd.
- **Claim-gate:** Finansdekning ~50 % — begrens til selskaper med regnskap og merk dekningshullet eksplisitt; ikke ekstrapoler til hele korpuset.
- **Anker:** 2, 5. **Estimat:** 3 dager.

### AP-5 — Krysseie og tverrsektoriell kontroll
- **Hypotese:** Samme eiermiljøer kontrollerer på tvers av fôr + dagligvare + produksjon — vertikal/horisontal integrasjon skjult bak konsernstruktur.
- **Data:** `companies` + eierskap + `konsern-coverage` (14 konsern).
- **Metode:** Spor ultimate eiere; finn delte eiere på tvers av spor; bygg krysseie-kart.
- **Output:** Krysseie-kart + liste over skjulte tverrsektorielle koblinger.
- **Claim-gate:** Ultimate ownership spores til kilde; ikke anta kontroll fra minoritetspost; skill eierskap fra kontroll.
- **Anker:** Tverrgående. **Estimat:** 2 dager.

### AP-6 — Havbrukskonsentrasjon og restråstoff-tilgang
- **Hypotese:** Konsentrasjon av oppdrettslokaliteter/biomasse hos få aktører former hvem som faktisk har tilgang til restråstoff-strømmene (anker 2).
- **Data:** `aquacultureSites` (285) + `actors`.
- **Metode:** Konsentrasjon per aktør/region; koble til restråstoff-tilgangslogikk.
- **Output:** Havbruk-konsentrasjonsprofil + tilgangsimplikasjon for B-sporet.
- **Claim-gate:** Lokalitet ≠ biomasse ≠ restråstoffvolum; hold nivåene atskilt.
- **Anker:** 2. **Estimat:** 1–2 dager.

### AP-7 — Replikér pris-asymmetri til andre domener
- **Hypotese:** «Rockets and feathers»-asymmetrien finnes også utenfor dagligvare — f.eks. fôr→oppdrett eller grønt — der prisøkninger slår raskere ut enn prisfall.
- **Data:** Prisindekser (PPI/KPI) per domene der serier finnes.
- **Metode:** Gjenbruk H-NY1-metoden fra `kvantitativ-dybdeanalyse.md` på nye domener.
- **Output:** Asymmetri-test per domene (bekreftet/avkreftet/utilstrekkelig data).
- **Claim-gate:** Krever PPI/KPI-serier med definisjon per domene; der de mangler, `needs-data` — ikke lån dagligvare-funnet til andre domener.
- **Anker:** 1, 5. **Estimat:** 2–3 dager.

### AP-8 — Tilskudd-mot-konsentrasjon-korrelasjon
- **Hypotese:** Offentlige midler flyter mot allerede konsentrerte noder (eller, motsatt, mot fragmenterte) — en testbar påstand om hvorvidt støtte motvirker eller forsterker konsentrasjon.
- **Data:** AP-3-output (tilskudd) × AP-2-output (HHI).
- **Metode:** Korrelér tilskuddsintensitet mot konsentrasjon per node/region.
- **Output:** Én forsvarbar påstand om støttens strukturelle retning.
- **Claim-gate:** Korrelasjon ≠ årsak; formuler som observert samvariasjon med n og usikkerhet.
- **Anker:** 1, 5. **Estimat:** 1 dag (bygger på AP-2/AP-3).

## 4. Faseplan og rekkefølge

Sekvensert etter gevinst/avhengighet — selvstendige, høy-novelty-pakker først:

| Fase | Uke | Pakker | Hvorfor først |
|---|---|---|---|
| 1 | 1 | AP-1, AP-3 | Ren eksisterende data, høy novelty, ingen avhengigheter; AP-3 er stort rent datasett |
| 2 | 2 | AP-2, AP-5, AP-6 | Konsentrasjons-/eierstruktur; bygger maktbildet |
| 3 | 3 | AP-4, AP-7, AP-8 | AP-4 begrenset av finansdekning; AP-8 bygger på fase 1–2 |

Etter hver fase: en kort konsolidering — hvilke påstander besto lakmustesten, hvilke ble `needs-data`, og hvordan de surfaces (jf. §6).

## 5. Kvalitet, claim-disiplin og surfacing

Tre krav per output:

1. **Claim-lock/PCQ:** hver påstand som skal kunne brukes utad får en claim-lock-rad med evidens og risikofelt; uavklarte deler går til PCQ som `needs-data`/`needs-primary-check`.
2. **Statistiske forbehold:** n, dekningsgrad, metode og «hva vi ekskluderte og hvorfor» dokumenteres — samme mal som metodologikapittelet i `kvantitativ-dybdeanalyse.md`.
3. **Surfacing:** funnet plasseres der det forklarer noe. `plattform-dybdeanalyse-2026-06-11.md` viste at dyp analyse i dag drukner i hardkodede KPI-kort og listedumper — et funn som ikke surfaces, oppleves som allemannskunnskap selv om det ikke er det. Hver bestått pakke kobles til en flate (graf, verdikjede, innsikt) eller en figur.

## 6. Ferdigkriterium per pakke

En pakke er ferdig når: (a) den har produsert minst én påstand som består lakmustesten, (b) påstanden har claim-lock-rad med forbehold, (c) usikre deler er ført til PCQ, og (d) funnet er surfaced på en flate eller i en figur. Pakker som *ikke* finner et ikke-opplagt mønster, lukkes som «testet, negativt» — også det er et resultat, og det dokumenteres.

## 7. Risiko

| Risiko | Mottiltak |
|---|---|
| Spuriøse korrelasjoner / p-hacking | Forhåndsdefiner hypotesen før kjøring; rapporter negative funn; ingen etterrasjonalisering |
| Overclaiming fra delvis data (særlig AP-4) | Eksplisitt dekningsgrad; ingen ekstrapolering utover korpuset med regnskap |
| Strukturelle funn leses som anklage | Formuler som posisjon/mønster; juridisk nøkternt språk; ingen aktørspesifikk «misbruk»-claim uten primærkilde |
| Analyse spiser H1-leveransen | Pakkene kan alle utsettes til H2 uten å true 31.07; kjør fase 1 som pilot, vurder resten etter |
| Funn surfaces ikke → oppleves som grunt | §5 krav 3 er obligatorisk per pakke |

## 8. Verifikasjon

Metodisk presedens og datagrunnlag er hentet fra `research/norge/kvantitativ-dybdeanalyse.md` (hypotesetest-metode) og `/api/data-status` (datasettvolum 14.06.2026). Finansdekningsforbeholdet (AP-4) er fra `plattform-dybdeanalyse-2026-06-11.md` funn A1. Konserntall fra `data/konsern-coverage.json` (14 entries). Ingen påstand i denne planen er selv et analysefunn — planen beskriver analyser som skal kjøres. Alle resultater går gjennom claim-lock/PCQ før ekstern bruk. `git diff --check` forutsettes kjørt før commit.

## 9. Statusoversikt — alle 8 lenser (oppdatert 2026-06-15)

Alle åtte arbeidspakkene er kjørt minst én gang. Status er intern baseline / claim-lock-disiplin; ingenting er eksternt validert. *(Gjenskapt + oppdatert 2026-06-15 etter tap i git-shuffling.)*

| AP | Status | Kort | Funnnotat |
|---|---|---|---|
| AP-1 styrer | `klar-med-forbehold` | Primærsjekket (9/10 broer) + dekningsutvidelse klar (36 %→~47 %) | `...ap1-styreoverlapp...`, `...ap1-dekningsutvidelse...` |
| AP-2 eierskap | `klar-med-forbehold` for kryss-node-HHI | Ekte markeds-HHI for 5/8 noder; **konsentrasjonen topper i foredling (samvirke), ikke retail** | `...ap2-nodekonsentrasjon...`, `...ap2-kryssnode-hhi...`, `...section8-3-4...` |
| AP-3 tilskudd | `klar-med-forbehold` | 2024 lukket (var skript-bug); Gini 0,52–0,55, **2022–2025** (2025 lagt til 2026-08-24, ikke avstemt mot publisert total) | `...ap3-tilskuddskonsentrasjon...` |
| AP-4 verdifangst | delvis; kjerne `needs-data` | Sjømat ~2× verdi/tonn; per-aktør volum↔margin krever DB-join | `...ap4-ap8-partial...` |
| AP-5 konsern | `klar-med-forbehold` for struktur | Form+styrekontroll primærsjekket; eierandel-% `needs-data` (Aksjonærregister) | `...ap5-krysseie...`, `...maktkart-bronnoysund-stikkprove...` |
| AP-6 havbruk | `intern baseline` | Sjøbasert MTB CR4 57 %, HHI ~929; land-RAS fortynner totaltall | `...ap6-havbrukskonsentrasjon...` |
| AP-7 pris-asymmetri | `intern STØTTET` (valuta-forbehold) — **under revisjon, se §6c** | Asymmetri bekreftet laks→foredling (NARDL t=14,0). Reprodusert 2026-08-24: punktestimatene holder, signifikansen ikke; valutakontroll fjerner ~60 %. Fôr→oppdrett kjørt og lukket som **testet, negativt** | `...ap7-prisasymmetri...` (funnnotat + `research/analyse/ap7-prisasymmetri.json`) |
| AP-8 tilskudd↔konsentrasjon | `needs-data`-kjerne + regionalt null-funn | Node-HHI nå delvis tilgjengelig (R11); regionalt strukturnøytral | `...ap4-ap8-partial...` |

Gjenstående mot citable: eierandel-% (AP-5), logistikk-/foodservice-HHI + presise fôr-/egg-andeler (AP-2), fôr→oppdrett-PPI (AP-7), restråstoffvolum (AP-6), per-aktør volum↔margin (AP-4, DB), og full operator-sekvens.

*Lukket 2026-08-24:* «fôr→oppdrett-PPI (AP-7)» er ute av listen. Leddet er kjørt via proxy (Verdensbankens fôrråvarepriser → lakseråpris, med USDNOK som eksogen regressor) og lukket som **testet, negativt** — ingen asymmetrisk gjennomslag på noen horisont, vindu, råvare eller valutabehandling. Se §6c (d) i AP-7-notatet. Det som mangler er ikke data: en native norsk fôr-PPI ville ikke endret nullfunnet.

*Presisert 2026-08-24:* «eierandel-% (AP-5)» er i praksis nesten lukket — §6b i AP-5-notatet verifiserte topp-eier-andelen for ni av ni konsern mot offentlige primærkilder (IR-/årsrapportsider). Det som genuint gjenstår er **BAMA-splitten NG/Reitan** (krever Aksjonærregisteret eller BAMAs egen årsrapport); Reitan og ASKO står som strukturelt sikre, men inferte, 100 %.

### Statuskontroll 2026-08-24

Tabellen over ble kontrollert mot filene i `research/analyse/` og `docs/project/analysis/`. Alle åtte funnnotatene finnes. Kontrollen avdekket at tabellen har **drevet fra funnnotatene på to punkter**, og at appen ikke har fått med seg den samme oppdateringen:

| AP | Denne tabellen | Funnnotatets egen frontmatter | Appen (`dybdeanalyse.ts`) |
|---|---|---|---|
| AP-5 | `klar-med-forbehold` for struktur; eierandel-% `needs-data` | `klar-med-forbehold (citable_with_note)` — eierandel-% verifisert fra offentlige primærkilder 2026-06-15 (§6b) | `internal_context`, med blokkeringstekst «ikke ekstern bruk før stikkprøve … mot Brønnøysund» |
| AP-6 | `intern baseline` | `klar-med-forbehold (citable_with_note)` — konsern-rollup stikkprøvet mot Brønnøysund 2026-06-15 (§7b) | `internal_context`, med blokkeringstekst «ikke ekstern bruk før konsern-rollup stikkprøves» |

I begge tilfellene er **den betingelsen appen navngir som blokkerer, allerede innfridd** — §6b og §7b dokumenterer nettopp de stikkprøvene, med orgnr og kilde. Statusene er **ikke** oppgradert her: hevingen fra `internal_context` til `citable_with_note` på appflaten er en claim-gate-beslutning som ligger hos eier, ikke en opprydding. AP-2s kryss-node-funn står allerede på `citable_with_note` i appen, så nivået er i bruk.

To presiseringer utover det:

- **AP-3 er den eneste DB-frie pakken.** `scripts/analyze-subsidy-concentration.ts` er DB-fri; `analyze-board-interlocks.ts` (AP-1), `analyze-node-concentration.ts` (AP-2) og `analyze-cross-holdings.ts` (AP-5) krever alle `DATABASE_URL`. Uten lokal DB kan bare AP-3 re-kjøres på maskinen; de tre andre må gå via workflow mot prod.
- **AP-3 reprodusert + utvidet.** 2022–2024 kom ut bit-identisk mot det committede aggregatet (kilden er ikke revidert siden juni). 2025 forelå ikke i juni og er nå lagt til: 36 728 mottakere, 18,97 mrd, Gini 0,547, topp 10 % = 34,2 %. Statusen er *ikke* oppgradert — 2025 mangler avstemming mot publisert primærtotal.

Funnene er surfaced i appen: `src/lib/data/dybdeanalyse.ts` → `src/app/innsikt/DybdeanalyseSection.tsx` viser alle åtte lensene på `/innsikt` med evidensstatus, dekningsnotat, stoppspråk og tre figurer (Lorenz, sektorbro, kryss-node-HHI).
