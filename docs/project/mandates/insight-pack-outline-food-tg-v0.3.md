---
tittel: "Insight / Decision Pack Outline Food TG v0.3"
status: Kontrollert intern outline
eier: Gabriel
dato: 2026-05-21
canonical_docs_redigert: false
formaal: "Produksjonskontrakt for Food TG decision pack / insight pack etter etablering av claim-, figur-, case- og kildekontrollag."
neste_handling: "Brukes til å bygge decision-pack v0.1 og reader journey-QA. Ikke ekstern presentasjon før scope/minimumsvedtak, claim-lock og kildeporter er oppdatert."
relaterte_filer:
  - docs/project/mandates/insight-pack-outline-food-tg-v0.2.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md
  - docs/project/mandates/food-tg-case-to-claim-index-2026-05.md
  - docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md
  - docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md
  - docs/project/mandates/food-tg-validation-sprint-log-2026-05.md
---

# Insight / Decision Pack Outline Food TG v0.3

## Bruksregel

Dette er neste redaksjonelle kontrollpunkt etter v0.2. v0.2 beskrev historien og slide-rekkefølgen. v0.3 beskriver hvordan pakken skal produseres uten å overstyre statusdisiplinen.

Pakken skal kunne brukes internt til å ta beslutning om valideringssprint og neste arbeidsfase. Den skal ikke leses som ekstern whitepaper, pilotløfte eller ferdig roadmap. Scope er fortsatt ikke formelt bekreftet per 2026-05-21.

## Kontrollporter

| Port | Styrende fil | Må være sant før ekstern bruk |
|---|---|---|
| Scope-port | `food-tg-scope-decision-request-2026-05-21.md` | JTO/Cathrine/Einar har minst godkjent minimumsvedtak for valideringssprint. |
| Claim-port | `food-tg-claim-lock-table-2026-05.md` | Hver publikasjonssetning har status, kildeanker, caveat og "ikke si". |
| Figur-port | `food-tg-figure-model-note-audit-2026-05.md` | Alle grafer, modeller, KPI-er og flytfigurer har dekningsnote og ikke-bevis. |
| Case-port | `food-tg-case-to-claim-index-2026-05.md` | Alle cases er merket som benchmark, hypotese, pilotkandidat eller sekundærspor. |
| Kilde-port | `food-tg-source-locator-risk-audit-2026-05.md` | High-risk tall, regelverk og aktørdata har locator, år, geografi, definisjon og caveat. |
| Validerings-port | `food-tg-validation-sprint-log-2026-05.md` | Ingen claims løftes til `Validert eksternt` uten dato, rolle, aktør, kilde og bruksrett. |

## Redaksjonell standard

- Hver seksjon skal ha én tydelig beslutningsjobb.
- Hver slide/seksjon skal ha status: `klar`, `klar-med-forbehold`, `krever-bekreftelse`, `benchmark`, `hypotese` eller `hold-tilbake`.
- Hver figur skal ha figurnote før den brukes i deck.
- Hver case må si hva den kan og ikke kan underbygge.
- Hver high-risk claim må ha source-locator før ekstern bruk.
- Ingen pilot-, effekt-, finansierings- eller aktørcommitment-språk uten dokumentert respons.

## Foreslått pakke

| # | Seksjon | Beslutningsjobb | Status | Kan sies nå | Må vente | Kontrollfil |
|---:|---|---|---|---|---|---|
| 0 | Tittel og status | Gjøre klart at pakken er intern og kontrollert. | `klar` | "Intern decision pack for valideringssprint." | Ekstern tittel/lanseringsspråk. | Scope-port |
| 1 | Executive summary | Gi én side med anbefalt neste steg. | `klar-med-forbehold` | "Food har nok intern substans til å gå videre med kontrollert valideringssprint." | At scope er endelig besluttet eller eksternt validert. | Claim-port |
| 2 | Hvor prosjektet står | Skille intern kvalitet fra ekstern forankring. | `klar` | Kunnskapsbasen er sterk internt, men ekstern validering mangler. | "God nok for ekstern roadmap." | Claim-port |
| 3 | Kontrollaget | Vise hvorfor vi ikke går rett til pilot. | `klar` | Claim-lock, figurnoter, case-indeks og source-locator er nye porter. | At portene er lukket for alle claims. | Alle kontrollfiler |
| 4 | Scope-valget | Forklare A+B med C-gate som anbefaling. | `krever-bekreftelse` | A+B/C er anbefalt arbeidsretning. | At dette er formelt besluttet. | Scope-port |
| 5 | Spor A datalag | Skille fôr/import/EUDR-datalag. | `klar-med-forbehold` | SSB/HS, total oppdrettsfôr, actor-data og EUDR må holdes separat. | SPC-/laksefôr-/EUDR-Norge-claims uten metode. | Source-locator |
| 6 | Spor A mulighet | Presentere alternative fôrproteiner som roadmap-spor. | `klar-med-forbehold` | Alternative fôrproteiner er relevant hvis modenhet, kost, LCA, regelverk og kjøperkrav bekreftes. | Substitusjonseffekt eller pilotklarhet. | Claim-port / Case-port |
| 7 | Spor B teknisk kandidat | Presentere okara/BSG som betinget kandidat. | `benchmark` / `hypotese` | Svenske benchmark gir designkrav. | Norsk/nordisk volum, food-grade, off-taker og pilotklarhet. | Case-port / Source-locator |
| 8 | Spor B adoption-kandidat | Presentere matsvinnkvalitet som lavterskel testspor. | `klar-med-forbehold` | Kandidaten er sterk hvis baseline, kategori, tidsvindu og rutineendring finnes. | Effektclaim uten kontrafaktisk. | Claim-port / Case-port |
| 9 | Benchmark-appendix | Parkere tunge, men nyttige spor. | `benchmark` | Marint restråstoff og nutrient loops gir læring. | Første lettvekts-pilot, N/P/K-effekt eller kopierbar VA-pilot. | Case-port |
| 10 | C-gate | Gjøre adoption, regelverk, data og marked til gate for alle kandidater. | `klar-med-forbehold` | Ingen A/B-kandidat går videre uten lov, kjøper, data, drift og governance. | Kausal markedseffekt uten aktørdata. | Claim-port |
| 11 | Figurer og leserflater | Vise hvilke appflater kan støtte pakken. | `klar-med-forbehold` | `/forsyningskjede`, `/verdikjede`, `/sirkularitet`, `/graf`, `/innsikt` kan brukes med noter. | Figurer uten dekningsnote. | Figur-port |
| 12 | Valideringssprint | Gjøre neste handling konkret. | `krever-bekreftelse` | Sprint kan forberedes og loggen står klar. | Outreach før minimumsvedtak. | Scope-port / Validerings-port |
| 13 | Go/no-go-logikk | Beskrive hvordan resultater skal vurderes. | `klar` | Hvert spor kan modnes, parkeres, nedskaleres eller flyttes til benchmark. | Pilotvalg før respons. | Case-port |
| 14 | Vedlegg | Samle claim-lock, source-locator, figurnoter og kandidatkort. | `klar` | Vedleggene er kontrollflater. | Vedlegg som ekstern kilde alene. | Alle kontrollfiler |

## Seksjonstekst og kontroll

### 0. Tittel og status

**Arbeidstittel:** Food TG Decision Pack v0.1 - intern valideringssprint

**Statuslinje:** Intern beslutningspakke. Ikke ekstern presentasjon, ikke pilotløfte, ikke validert roadmap.

**Må ha på forsiden:**

- Dato.
- Scope-status.
- Kildestatus.
- "Ingen claims er `Validert eksternt` gjennom denne pakken."

### 1. Executive summary

**Hovedbudskap:** Food TG har nok intern substans til å gå videre, men neste steg er kontrollert valideringssprint, ikke pilotcommitment.

**Trygg tekst:**

> Food TG har en sterk intern kunnskapsbase og tydelige kandidatspor. Neste kvalitetsløft er å validere få, avgjørende spørsmål hos aktører og primærkilder før pilot, finansiering eller roadmap omtales som besluttet.

**Må ikke si:**

- "Prosjektet er klart for ekstern roadmap."
- "Pilotkandidater er validert."
- "Scope er besluttet."

### 2. Hvor prosjektet står

**Beslutningsjobb:** Gi status uten å overdrive.

**Innhold:**

- Intern kunnskapsbase: claim-register, evidence matrix, source shortlist, PCQ, actor pack, control layer.
- Sterke sider: fôr/import-datalag, sidestrømsdesign, adoption-gate, nordiske benchmark.
- Svake sider: scope ikke bekreftet, aktørvalidering mangler, enkelte datalag må ikke blandes.

**Kontrollnotat:** Bruk `food-tg-baseline-freeze-2026-05-21.md` for auditstatus, men ikke bruk baseline som ekstern validering.

### 3. Kontrollaget

**Beslutningsjobb:** Forklare hvorfor vi kan gå videre metodisk uten å overselge.

**Figuridé:** Fem porter i en horisontal kjede:

```text
Scope -> Claim-lock -> Source locator -> Figure/model note -> Actor validation
```

**Figurnote:** Portfiguren er arbeidsstyring, ikke bevis for at portene er lukket.

### 4. Scope-valget

**Hovedbudskap:** A+B med C som gate er anbefalt, men må fortsatt besluttes.

**Trygg tekst:**

> Arbeidsanbefalingen er Spor A+B, med Spor C som tverrgående adoption-, regelverks- og datagate. Uten skriftlig scope- eller minimumsvedtak bør prosjektet ikke sende P1-outreach eller omtale scope som låst.

**Må vente:** Beslutning i `decision-log-food-tg.md`.

### 5. Spor A datalag

**Beslutningsjobb:** Hindre datamiks før fôr/EUDR presenteres.

| Datalag | Kan brukes til | Må ikke brukes til |
|---|---|---|
| SSB/HS 08801 | Importserie per varenummer. | Faktisk fôrbruk eller SPC uten metode. |
| Fiskeridirektoratet/Sjømat Norge | Total oppdrettsfôr-volumramme. | Råvareandel eller substitusjonseffekt. |
| Denofa/Skretting/BioMar | Actor-/benchmarkdata. | Norsk bransjesnitt. |
| EUDR EU-scope | Compliance- og sporbarhetsdriver. | Norsk soya-plikt uten norsk/EØS-status. |
| NMBU/Foods of Norway | FoU-/teknisk relevans. | Kommersiell modenhet eller pilotvolum. |

**Figuridé:** Datalagstack med røde "ikke bland"-streker mellom lag.

### 6. Spor A mulighet

**Hovedbudskap:** Alternative fôrproteiner er et sterkt roadmap-spor hvis gates åpner.

**Trygg tekst:** Bruk formulering fra `CL-A-020` i claim-lock.

**Må vente:**

- Modenhet.
- Kost.
- LCA.
- Regulatorisk vei.
- Råvaretilgang.
- Kjøperkrav.
- Aktørdata.

### 7. Spor B teknisk kandidat

**Hovedbudskap:** Okara/BSG er praktisk og konkret, men bare som kandidat etter råvare- og hygienegate.

**Kandidatkort skal ha:**

- Råvareeier.
- Tonn/år.
- Batchfrekvens.
- Fukt/tørrstoff.
- Temperatur.
- Mikrobiologi.
- Nåværende avsetning.
- Stabiliseringsmetode.
- Lovlig sluttbruk.
- Off-taker.
- Om data kan siteres.

**Må ikke si:** "Okara/BSG er pilotklart."

### 8. Spor B adoption-kandidat

**Hovedbudskap:** Matsvinnkvalitet kan være raskere å teste enn fysisk prosessering hvis partnerdata finnes.

**Kandidatkort skal ha:**

- Partner.
- Varekategori.
- Tidsvindu før kvalitetstap.
- Baseline.
- Destinasjon før/etter tiltak.
- Rutineendring.
- Kontrafaktisk.
- Dataeier.
- Bruksrett.

**Må ikke si:** "Måltider reddet er effektbevis."

### 9. Benchmark-appendix

**Beslutningsjobb:** Beholde relevant læring uten å gjøre alt til pilot.

| Benchmark | Behold som | Ikke bruk som |
|---|---|---|
| Marint restråstoff | Fraksjons- og høyverdi-læring. | Første B-pilot. |
| RecoLab/Helsingborg | Governance, N/P/K og produktstatus. | Kopierbar norsk pilot. |
| VEAS/HIAS/Den Magiske Fabrikken | Infrastruktur- og nutrient-loop læring. | Lettvekts-pilot eller sammenlignbar KPI uten systemgrense. |
| Salling Group | Retail-/matsvinn benchmark. | Nordisk rangering eller norsk effekt. |
| Danmark Green Tripartite | Policy-benchmark. | Norsk overførbarhet uten analyse. |

### 10. C-gate

**Hovedbudskap:** C er ikke bred policyagenda nå. C er gate for A og B.

**C-gate i hvert kandidatkort:**

| Gate | Spørsmål |
|---|---|
| Lov | Er bruken lovlig nå, eller er den bare regulatorisk mulighet? |
| Kjøper | Hvem kjøper eller bruker output? |
| Data | Hvem eier baseline og løpende data? |
| Drift | Hvem må endre rutine, logistikk eller prosess? |
| Governance | Hvem kan beslutte, finansiere og bære risiko? |
| KPI | Hvilke minimumsdata trengs før effekt måles? |

### 11. Figurer og leserflater

**Beslutningsjobb:** Velge hvilke appflater som kan brukes som støtte i deck/rapport.

| Flate | Bruk i pakken | Minimum før bruk |
|---|---|---|
| `/mandat` | Intern mandatstatus og valideringslogikk. | Må vise at scope ikke er endelig. |
| `/innsikt` | Leserinngang til innsikter. | Readiness og kildechips må være tydelige. |
| `/forsyningskjede` | Datalag: primærflyt, import, relasjoner, returstrømmer. | Ikke bland datalag; bruk figurnote. |
| `/verdikjede` | Verdikjededekning og flow-skisse. | Kjent matsvinn må ikke leses som nordisk total. |
| `/sirkularitet` | R-stige, KPI og case-/gaplogikk. | KPI og cases må markeres som ikke-effekt. |
| `/graf` | Navigasjon og datakvalitet. | Ikke les som aktørforankring. |
| `/sammenligning` | Nordisk kontekst. | Harmoniser definisjon før rangering. |

### 12. Valideringssprint

**Beslutningsjobb:** Gjøre neste handling praktisk, men fortsatt blokkere utsending uten minimumsvedtak.

**Sprintspørsmål:**

1. Kan EUDR/Norge/EU-scope formuleres trygt?
2. Er alternative fôrproteiner roadmap, FoU-benchmark eller senere kandidat?
3. Kan okara/BSG åpne råvare-, hygiene- og off-taker-gate?
4. Kan matsvinnkvalitet testes med baseline og kontrafaktisk?
5. Har hvert kandidatspor lov, kjøper, data, drift og governance?

**Må vente:** P1-outreach til minimumsvedtak er godkjent.

### 13. Go/no-go-logikk

| Resultat etter validering | Handling | Språk |
|---|---|---|
| Gate åpner med data og aktør | Modnes til pilotbrief. | `pilotkandidat`, ikke `pilotklar`. |
| Gate åpner delvis | Hold som scoping/roadmap-spor. | `klar-med-forbehold`. |
| Bare læring, ingen eier | Flytt til benchmark. | `benchmark`. |
| Regelverk/data blokkerer | Parker eller legg i watchlist. | `hold-tilbake` eller `parkert`. |
| Motstridende funn | Harmoniser claim og kilde. | `maa-harmoniseres`. |

### 14. Vedlegg

Vedleggene skal følge pakken, ikke ligge som skjulte arbeidsnotater:

- Claim-lock table.
- Source locator risk audit.
- Figure/model note audit.
- Case/pilot-to-claim index.
- Validation sprint log.
- Baseline freeze.
- Scope decision request.

## Produksjonsrekkefølge

1. Bygg decision-pack v0.1 i Markdown eller slide-outline fra denne v0.3.
2. Legg inn statusfelt på hver slide/seksjon.
3. Legg inn kilde-/locatorfelt for alle high-risk claims.
4. Legg inn figurnote for alle figurer og app-screenshots.
5. Lag kandidatkort for A1, A/B, B1 og B2.
6. Kjør reader journey-QA mot appflatene.
7. Be om scope- eller minimumsvedtak før P1-outreach.

## Stop-regler

- Ikke produser ekstern decktekst uten at claim-lock er oppdatert.
- Ikke bruk app-screenshot uten figurnote.
- Ikke skriv "pilot" uten kandidatkort og gate.
- Ikke skriv "validert" uten sprintloggdata.
- Ikke skriv "roadmap" som forpliktelse før aktørrespons og finance note finnes.
- Ikke bland A/B/C til bred rapport; C skal være gate for A/B før annet besluttes.

## Neste handling

Neste konkrete arbeidsprodukt bør være `food-tg-decision-pack-v0.1.md`, basert på denne v0.3. Det kan lages som intern deck-disposisjon med slide for slide tekst, statusfelt, figurnote og kildeport.
