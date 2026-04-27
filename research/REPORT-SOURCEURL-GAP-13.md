# Report sourceUrl gap - 13 resterende poster

Dato: 2026-04-27

## Kort konklusjon

`npm run db:audit` flagget 13 rapportposter uten `sourceUrl`. Gjennomgangen viser at dette ikke var 13 like feil, og anbefalingene er nå fulgt opp i seed-data og auditlogikk:

- 7 er interne oversikter/registre med mange enkeltkilder og er merket med `internal_synthesis` eller `internal_register`.
- 4 er komposittnotater/faktaark basert på flere selskaper eller historiske kilder og er merket med `composite_source` eller `internal_synthesis`.
- 1 er rettet med ekstern 2025-kilde: `beredskap-island-melmolle-2025`.
- 1 er satt i karantene som `blocked_source`: `agrianalyse-bondens-andel-2025`.

## Implementert status

- `src/lib/types.ts` har fått `ReportProvenanceType` og `ReportSupportingSource`.
- `src/lib/data/reports.ts` har fått `provenanceType` og `supportingSources` på alle 13.
- `dlf-leverandor-2025` er retitlet til `DLF leverandorposisjoner 2025` og har fått offisiell DLF-URL.
- `beredskap-island-melmolle-2025` har fått Iceland Review/RUV som kildegrunnlag og korrigert institusjon/publisher.
- DLF- og Island-kildene er arkivert lokalt som HTML-snapshots under `research/evidence-pack/`.
- `Report`-modellen i Prisma har fått persistente `provenanceType`- og `supportingSources`-felt, og import/API/rapportlisten eksponerer feltene.
- `scripts/verify-data-integrity.ts` feiler fortsatt på eksterne rapporter uten URL, men varsler for interne registre, interne synteser, komposittkilder og blokkerte kilder når de har resolvbare underlagskilder.
- `npm run db:audit` passer nå og viser 11 klassifiserte `sourceUrl`-unntak som varsel, ikke feil.

## Gjennomgang

| ID | Type | Vurdering | Anbefalt tiltak |
|---|---|---|---|
| `agrianalyse-bondens-andel-2025` | Ekstern rapport? | AgriAnalyse 2025-arkivet viser 11 publikasjoner, men ikke denne tittelen. Lokal PDF er allerede merket som HTML feil-lagret som PDF. | Implementert som `blocked_source` med AgriAnalyse-arkiv og lokal blokkert PDF som underlag. |
| `beredskap-island-melmolle-2025` | Ekstern nyhets-/beredskapskilde | Reell kilde finnes: Iceland Review/RUV om Kornax og Islands eneste melmølle, 27.03.2025. | Implementert med `sourceUrl`, `external_article`, korrigert metadata og støtteartikkel om beredskapsmat. |
| `dlf-leverandor-2025` | DLF-posisjoner, ikke funnet som rapport | Ingen offentlig rapport med tittelen "Leverandorperspektivet 2025" funnet. DLF har relevante 2025-sider og høringssvar om Dagligvaretilsynet, EMV og god handelsskikk. | Implementert som `DLF leverandorposisjoner 2025` med DLF-URL og høringer som underlag. |
| `merkevarer-historie` | Intern bransje-/historisk syntese | Lokalt faktaark om Orkla/TINE uten URL-er. Ikke én ekstern rapport. | Implementert som `internal_synthesis` med lokalt notat. |
| `nordisk-sammenligning-2024` | Kompositt av ICA/Axfood/Kesko | Bygger på flere årsrapporter som allerede finnes som egne seed-poster med URL-er. | Implementert som `composite_source` koblet til ICA/Axfood/Kesko-rapportene og lokalt notat. |
| `verdibutikker-utfordrere` | Kompositt av Normal/Europris | Tallene kan underbygges av Normal-regnskap og Europris-rapportering, men posten er et sammenstilt faktaark. | Implementert som `composite_source` med Normal, Europris og lokalt notat. |
| `oversikt-nordisk-avhandlingsregister` | Internt register | Lokalt register over 70 avhandlinger, laget fra flere repositorier/søk. Ikke én kilde. | Implementert som `internal_register`. |
| `oversikt-nordisk-mat-tenkere` | Intern nettverkskartlegging | Egenkartlegging av personer/miljøer. Ikke ekstern rapport. | Implementert som `internal_synthesis`. |
| `oversikt-nordisk-matmakt-historikk` | Intern historisk syntese | Egenkartlegging/diverse kilder, ingen URL-er i lokalt notat. | Implementert som `internal_synthesis`. |
| `oversikt-nou-stortingsdok-juridisk` | Juridisk metaoversikt | Lokalt notat har mange primær-URL-er til NOU, meldinger, lovdata og EU-direktiv. | Implementert som `internal_register` med juridisk register og NOU 2013:6 som støtte. |
| `oversikt-offentlig-rapportlogg` | Offentlig rapportregister | Lokalt notat har mange URL-er til offentlige rapporter og rapportportaler. | Implementert som `internal_register`. |
| `oversikt-sirkularitet-dyp` | Dyp intern syntese | Lokalt notat har 20+ eksplisitte kilder, inkludert Matvett, Lovdata, Biogas Danmark, IEA og NORSUS. | Implementert som `internal_synthesis` med lokalt notat, Matvett og Biogassplattformen. |
| `oversikt-tenketanker-ngo` | Intern landskapskartlegging | Lokalt notat har mange URL-er til organisasjoner/rapporter. | Implementert som `internal_synthesis`. |

## IA-endring

For `Report` skiller vi nå mellom:

- `sourceUrl`: én kanonisk ekstern kilde for en rapport/publikasjon.
- `supportingSources`: flere URL-er eller dokumentkoblinger for komposittnotater og synteser.
- `provenanceType`: for eksempel `external_report`, `external_article`, `internal_synthesis`, `internal_register`, `blocked_source`.

Da kan `db:audit` feile på eksterne rapporter uten kilde, men bare varsle på interne synteser uten `sourceUrl`.

## Komposittbeslutning

Beslutning 2026-04-27: vi splitter ikke komposittpostene nå. `nordisk-sammenligning-2024`, `verdibutikker-utfordrere` og `dlf-leverandor-2025` beholdes som analyserbare samlerader fordi enkeltkildene allerede finnes som URL-er, rapport-ID-er eller lokale notater. Å splitte dem til nye selvstendige rapportposter ville gitt duplikater og svakere informasjonsarkitektur.

`merkevarer-historie` beholdes som `internal_synthesis` inntil kildegrunnlaget er utvidet med eksplisitte primær-URL-er. `agrianalyse-bondens-andel-2025` holdes utenfor videre behandling her og står som `blocked_source` til riktig AgriAnalyse-underlag er avklart.

## Lokale kildekopier

- `research/evidence-pack/bransje/dlf-leverandor-2025.html`
- `research/evidence-pack/beredskap/beredskap-island-melmolle-2025.html`
- `research/evidence-pack/beredskap/beredskap-island-food-stockpiles-2025.html`

## Eksterne funn brukt i vurderingen

- AgriAnalyse publikasjoner 2025: https://www.agrianalyse.no/publikasjoner/category856.html?span=01.01.2025-31.12.2025
- Iceland Review om Kornax/melmøllen, 27.03.2025: https://www.icelandreview.com/news/icelands-only-flour-mill-set-to-be-scrapped/
- Iceland Review om beredskapsmat/University of Iceland, 08.07.2025: https://www.icelandreview.com/news/iceland-needs-emergency-food-stockpiles-say-university-researchers/
- DLF om Dagligvaretilsynet/Konkurransetilsynet, 12.12.2025: https://www.dlf.no/dagligvaretilsynet-legges-ned-konkurransetilsynet-far-mer-ansvar/
- Regjeringen høring om håndheving av lov om god handelsskikk, 20.02.2025: https://www.regjeringen.no/no/dokumenter/horing-av-forslag-til-endringer-i-lov-om-god-handelsskikk-i-dagligvarekjeden-handheving/id3088084/
- Regjeringen høring om presiseringer i god handelsskikk-standarden, 22.05.2025: https://www.regjeringen.no/no/dokumenter/horing-av-forslag-til-endringer-i-lov-om-god-handelsskikk-presiseringer-i-god-handelsskikk-standarden-mv/id3101536/
- Europris 2025-finansdata: https://financialreports.eu/filings/europris/annual-report/2026/32982811/
- Normal Norge regnskapstall via Vainu: https://haku.vainu.com/company/normal-norge-as-omsetning-og-finansiell/NO917019738/bedriftsinformasjon
