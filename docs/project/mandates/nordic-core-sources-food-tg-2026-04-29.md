---
tittel: Nordic Core Sources for Food TG
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-29
formaal: Operativ kildeliste for ekstern brief om nordisk situasjon i matsystemet.
relaterte_filer:
  - docs/project/NORDISK-MATSYSTEM-KILDESTATUS-2026-04-29.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/
  - research/norden/verdikjede/10-kryss-analyse.md
  - research/norden/nordisk-komparativ-analyse.md
---

# Nordic Core Sources for Food TG

Denne listen er en styringsliste, ikke en full bibliografi. Den skiller mellom kilder som kan bære ekstern tekst nå, interne synteser som må kobles til primærkilder, og kilder som fortsatt trenger DB-/primærsjekk.

## Statuskoder

| Status | Betydning |
|---|---|
| `db-linked` | Koblet til `Document` via `SourceDoc` eller `Report.documentId` i Postgres. |
| `repo/static` | Finnes i repoet eller statisk app-data, men ikke fullstendig normalisert i DB. |
| `internal-synthesis` | Egen analyse i repoet; brukes som struktur, ikke som primærkilde. |
| `needs-primary-check` | Kan være relevant i brief, men krever kontroll mot primærkilde, sidetall eller gjeldende URL. |
| `not-citable-input` | Brukes som kildejakt/hypotesegrunnlag, ikke som evidens. |

## Kjernepakke

| ID | Kilde | Type | Status | DB/repo-anker | Bruk i Food TG | Forbehold / neste handling |
|---|---|---|---|---|---|---|
| NORDIC-CORE-001 | Stockholm Resilience Centre, `Nordic Food Systems for Improved Health and Sustainability` (2019) | Ekstern rapport | `db-linked` | `Report: stockholm-resilience-2019`; `SourceDoc: src-food-dc5f1fd3d327`; `Document: cmoh2g8s10046n60d1rikrioz` | Baseline for helse, miljø, EAT-Lancet-gap og systemisk matsystempress i Norden. | Kanonisk `Report` er flyttet til SourceDoc-støttet `research/evidence-pack/...`-dokument; gammel stale `Document` står igjen i duplicate-review. |
| NORDIC-CORE-002 | Nordic Nutrition Recommendations 2023 | Ekstern rapport | `db-linked` | `Report: nnr2023-nordic-nutrition-recommendations`; `SourceDoc: src-food-nnr2023`; `Document: cmokdp3qf0000y20dsvg0p64j`; `research/evidence-pack/nordisk/nordic-nutrition-recommendations-2023.pdf` | Normativt grunnlag for kosthold, helse og miljø i nordisk policy. | Full PDF er importert med tekstuttrekk; bruk original PDF for sidetall ved ekstern sitering. |
| NORDIC-CORE-002B | NORMO 2025, `Nordic Monitoring 2014-2024` | Ekstern rapport/dataappendiks | `db-linked-countrymetrics` | `Report: normo-2025-nordic-monitoring`; `Document: cmmxvfo0d002o1i0dy20v7h6i`; `research/data/nordic/normo-2025/raw/appendix-6-data-tables-for-figures.xlsx`; `research/data/nordic/normo-2025/normalized/normo-2025-country-metrics.csv` | Empirisk motstykke til NNR2023: faktisk kostholdsfrekvens og overvekt/fedme per land. | 57 `CountryMetric`-rader er upsertet; full PDF og aktivitet/ulikhetstabeller kan hentes senere hvis ekstern leveranse krever det. |
| NORDIC-CORE-003 | Nordregio / Nordic Council of Ministers, `Policy tools for sustainable and healthy eating` (Nord 2024:007) | Ekstern rapport | `db-linked` | `SourceDoc: src-food-d760f6d96053`; `Report: norden-policy-2024`; `Document: cmoh2g8g9003ln60d1luiwjr1` | Policyverktøy for matmiljø, etterspørsel, offentlige innkjøp og A4-modellen. | DB-kobling er reparert; bruk original PDF for sidetall ved ekstern sitering. |
| NORDIC-CORE-004 | Nordic Council of Ministers, `Breaking Barriers: Empowering Effective Food Waste Solutions in the Nordic Countries` (Nord 2024:034) | Ekstern rapport | `db-linked` | `Report: sirkularitet-matsvinn-2024`; `SourceDoc: src-food-8047a53676d7`; `Document: cmoh2g8gr003mn60d5og028js`; `research/bibliotek/sirkularitet/matsvinn-barrierer-nordiske-losninger-2024.md` | Beste nordiske rapport for matsvinn, virkemidler og landspesifikke tiltaksbarrierer. | PDF-`Document` har lav tekstuttrekkskvalitet; hent sidetall fra original ved ekstern sitering. |
| NORDIC-CORE-005 | GFI Europe, `The Nordic alternative protein research ecosystem` | Ekstern rapport | `db-linked` | `SourceDoc: src-food-559ac48dbd62`; lokal PDF | Alternative proteiner, forskningsøkosystem, finansiering og Track A-kontekst. | PDF er markert low-text; ikke bruk som tallkilde uten OCR/primærsjekk. |
| NORDIC-CORE-006 | Nordic Council, `Policy commitment: Reducing food waste for a green Nordic Region` | Ekstern policykilde | `db-linked` | `SourceDoc: src-food-17957bbc99a8`; lokal PDF | Politisk forankring for nordisk matsvinnreduksjon og samarbeid. | Bruk som policyanker, ikke som effektmåling. |
| NORDIC-CORE-007 | SOU 2024:8, `Livsmedelsberedskap för en ny tid` | Offentlig utredning | `db-linked` | `Report: sou-2024-8-svensk-beredskap`; `Report: report-food-15bc81bae00c` | Svensk beredskapsmodell, ansvar, lager og forsyningssikkerhet. | Det finnes flere report-rader; bruk den lenkede PDF-raden og presiser svensk kontekst. |
| NORDIC-CORE-008 | Konkurrensverket 2024:5 og 2025:5 om livsmedelsbranschen | Offentlig tilsyn/utredning | `db-linked` | `Report: se-konkurrensverket-2024-5`; `Report: konkurrensverket-2025-5-livsmedelsutredning`; `Document: cmoh0jq8j001gvw0dq305lmb4` | Svensk marked, konkurranse, etableringsbarrierer, UTP og eiendomsstruktur. | 2024 er lenket og path-reparert; 2025 er nå lenket til lokal PDF, men URL var blokkert i URL-audit og bør fortsatt kilde-URL-sjekkes før ekstern sitatbruk. |
| NORDIC-CORE-009 | KFST / Konkurrencerådet, Salling Group - Coop Danmark 2025 | Offentlig fusjonsvedtak | `db-linked` | `Report: kfst-salling-coop-2025`; `Document: cmmxa66oq003zty0dhw4emg34`; parallell `dk-salling-coop-decision-2025` | Dansk konsolidering, lokal markedsanalyse og fusjonskontroll. | Kanonisk `Report` er lenket og path-reparert; parallell report-rad bør avklares i duplikat-review. |
| NORDIC-CORE-010 | Finland Food2030 / Ruokastrategia | Offentlig strategi | `db-linked` | `Report: finland-food2030`; `Document: cmmxa66ng003wty0dlfdpgu2b`; `research/bibliotek/nordisk/finland-ruokastrategia-2040.md` | Finsk matstrategi, beredskap, offentlige kjøkken, detaljistmakt og resiliens. | DB-kobling og path er reparert; sjekk sidetall/oversettelse mot original ved ekstern bruk. |
| NORDIC-CORE-011 | `research/norden/verdikjede/10-kryss-analyse.md` | Intern syntese | `internal-synthesis` | Repo | Tverrgående analyse av makt, systemrisiko og flaskehalser i nordiske verdikjeder. | Skal ikke siteres alene; koble på NORDIC-CORE-001 til 010 ved claims. |
| NORDIC-CORE-012 | `research/norden/nordisk-komparativ-analyse.md` | Intern syntese | `internal-synthesis` | Repo | Komparativ analyse av dagligvarestruktur, selvforsyning, konkurranse og landforskjeller. | Bruk som disposisjon og claim-generator; primærkilder må ligge bak eksterne tall. |
| NORDIC-CORE-013 | `research/norden/nordic-analysis-panel-first-findings.md` og `research/data/nordic/analysis-panel/` | Intern datapanel/syntese | `internal-synthesis` | Repo + datafiler | Harmoniserte nordiske pris-, handels- og produksjonsindikatorer. | Metodeflagg og kildekolonner må sjekkes før visualisering i ekstern brief. |
| NORDIC-CORE-014 | NIBIO selvforsyningsgrad og engrosforbruk | Offisiell statistikk | `needs-primary-check` | `SRC-BASE-006` i `source-shortlist-food-tg.md` | Norsk selvforsyning, kraftfôrkorreksjon og beredskapsbaseline. | 2024-tall er foreløpige; oppgi definisjon med/uten kraftfôrkorreksjon. |
| NORDIC-CORE-015 | EEA Country Profiles 2025 for nordiske land | Sekundær sammenligningskilde | `needs-primary-check` | `SRC-BASE-007` i `source-shortlist-food-tg.md` | Landsammenligning for utslipp, avfall, miljø og sirkularitet. | Kryss tunge claims mot nasjonale primærkilder. |
| NORDIC-CORE-016 | Luke Balance Sheet for Food Commodities 2024 | Offisiell statistikk | `needs-primary-check` | `SRC-BASE-008` i `source-shortlist-food-tg.md` | Finsk forbruksendring og matvaregruppe-baseline. | Serien er utfaset; sjekk erstatningsstatistikk for 2025+. |
| NORDIC-CORE-017 | Bærekraftsdossieret 2026-04-28 | Internt input-korpus | `not-citable-input` | `docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/` | Kildejakt, gap-liste, hypoteser og aktørkøer. | Ikke importer som evidens uten egen provenance og primærsjekk. |

## Bruk i ekstern brief

For en kort ekstern brief om nordisk situasjon i matsystemet bør første versjon bygges på:

1. `NORDIC-CORE-001` til `NORDIC-CORE-010` som kildegrunnlag.
2. `NORDIC-CORE-011` til `NORDIC-CORE-013` som intern struktur.
3. `NORDIC-CORE-014` til `NORDIC-CORE-016` bare der definisjon, år og primærkilde er låst.
4. `NORDIC-CORE-017` kun som rutekart for kilder som skal sjekkes.

Ekstern tekst skal ikke markeres `Validert eksternt` bare fordi kilden er sterk. Den kan markeres `Utført internt` inntil aktør- eller ekspertvalidering faktisk er gjennomført.
