# Nordic Vision 2030 x Food Systems 2026: beslutningsbrief

**Dato:** 2026-04-29  
**Status:** Intern beslutningsbrief v0.1  
**Formål:** Avgjøre hvordan Nordic Vision 2030 bør brukes i Food Systems 2026 videre.  
**Viktig avgrensning:** Briefen er klar for intern styring. Ekstern bruk krever full PDF-/primærkildearkiv for kildene som siteres tungt.

## Kort anbefaling

Bruk Nordic Vision 2030 som policyanker, ikke som ferdig matsystemanalyse. Visjonen gir tre styrende krav: grønn omstilling, konkurransekraft og sosial bærekraft. Food Systems 2026 kan gjøre dette operativt ved å vise hva disse kravene betyr konkret for nordiske matsystemer: ressursbruk, matsvinn, produksjon, handel, markedsstruktur, kosthold, matpriser og beredskap.

## Kontrollerte kilder i denne runden

| Kilde | Lokal status | Bruk i brief |
|---|---|---|
| `src-165` Our Vision 2030 | SourceDoc, Document, SourceRef og lokal kildefil | Toppnivå policyanker |
| `src-166` Action Plan for Vision 2030 | SourceDoc, Document, SourceRef og lokal kildefil | Operasjonalisering av tre prioriteringer |
| `src-167` Nordic Indicators for Our Vision 2030 | SourceDoc, Document, SourceRef og lokal kildefil | Indikatorramme og gap-analyse |
| `src-168` Status Report 2023 | SourceDoc, Document, SourceRef og lokal kildefil | Overordnet statuskontekst |
| `src-169` FJLS Co-operation Programme 2025-2030 | SourceDoc, Document, SourceRef og lokal kildefil | Direkte mat-, fiskeri-, jordbruk-, skog- og bioøkonomikobling |
| `src-92` Nordic Bioeconomy Programme | DB-refresh, lokal kildefil og SourceRef reparert | Bioøkonomi, sidestrømmer og sirkularitet |

## Seks styringsfunn

| Funn | Vurdering | Hva prosjektet bør gjøre |
|---|---|---|
| Vision 2030 er relevant, men bred | Etablert fra offisielle NMR-kilder | Bruk den som ramme for hvorfor nordiske matsystemdata trengs |
| Mat er sterkest koblet til grønn og bio-basert omstilling | Etablert policykobling, delvis prosjektdata | Prioriter matsvinn, materialfotavtrykk, organisk areal, næringsstoffer og sjømat/fôr |
| Konkurransekraftsporet kan gjøres konkret gjennom handel, priser og markedsstruktur | Intern analyse + lokale datasett | Kildebind HHI/markedsandeler og bygg intra-nordisk matimportandel |
| Sosial bærekraft har nå første kosthold/helse-datalag, men mangler affordability | Delvis dataklart | Bruk NORMO/NNR for kosthold/helse og bygg food affordability-kobling med matpris/lavinntekt |
| NMR-indikatorene er nordiske aggregater, mens prosjektet jobber land- og verdikjedenært | Etablert fra indikatorrammen | Ikke prøv å kopiere NMR; bygg en food-systems oversettelse per land og verdikjede |
| FJLS 2025-2030 er den mest direkte policybroen til matsporet | Etablert fra kildeklassifisering | Bruk `src-169` som hovedpolicykilde når briefen handler om landbruk, fiskeri, mat og skog |

## Datagrunnlag som kan brukes nå

| Datagrunnlag | Hva det belyser | Bruksstatus |
|---|---|---|
| `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv` | 45 Vision-indikatorer mappet til matrelevans, lokal dekning og neste handling | Klar som arbeidskø |
| `research/data/nordic/analysis-panel/` | Matpris, total handel og produksjonsproxyer | Klar for intern analyse |
| `CountryMetric.intraNordicImportShare` + `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv` | Intra-nordisk importandel for valgt matkurv | Runtime-seed for DK/FI/IS/NO/SE; bruk andeler innen land, ikke verdinivåer på tvers |
| `CountryMetric.organicAgriculture` + `research/data/nordic/core-series/organic_agriculture_annual.csv` | Økologisk jordbruksareal og andel av UAA | Integrert i runtime for DK/FI/NO/SE; Island holdes som `needs_primary_check` |
| `CountryMetric.dietFrequency` / `CountryMetric.healthOutcome` + `research/data/nordic/normo-2025/normalized/normo-2025-country-metrics.csv` | NORMO 2025 voksenkosthold og overvekt/fedme hos voksne og barn | 57 rader i runtime; bruk som sosial bærekraft-proxy, ikke som direkte NMR self-rated-health indikator |
| `CountryMetric.foodWastePerCapita` + `research/data/nordic/food-waste/normalized/nordic-food-waste-countrymetric-snapshot.csv` | Matsvinn per person og eksisterende ledddata | Intern sammenligning klar for 2020/2022; leddvise DK/FI/IS-hull må lukkes før ekstern verdikjedeclaim |
| `research/norden/verdikjede/10-kryss-analyse.md` | Verdikjede, flaskehalser og systemrisiko | Sterk intern analyse; må primærkildebindes for ekstern bruk |
| `CountryMetric` | GHG, matsvinn, selvforsyning, HHI, retailer share m.m. | Delvis klar; dekningen varierer per land og indikator |

## Prioritert videre prosess

1. Lag første interne policy-/databrief med Vision 2030 som ramme og indikator-mappen som bakgrunn.
2. Bruk all-country intra-nordisk matimportandel som operativ Vision 2.5.2-proxy; neste løft er metode-/indikatornotat før ekstern bruk.
3. Bruk NORMO 2025/NNR 2023 som ryddig første sosial bærekraft-pakke; neste løft er food affordability og eventuelt aktivitet/ulikhet.
4. Lag source pack for materialfotavtrykk, leddvis matsvinn, næringsstoffer, biogass og fôr før sirkulær bioøkonomi brukes som sterk ekstern claim.
5. Arkiver full PDF/original for NMR-kildene dersom briefen skal deles eksternt.

## Beslutning som bør tas nå

Prosjektet bør gå videre med en **Nordic Vision 2030 food-systems oversettelse**, ikke en ren gjengivelse av NMRs indikatorramme. Første operative leveranse bør være en intern brief som viser:

- hva vi allerede kan dokumentere med lokale data
- hvilke Vision-indikatorer som er matrelevante
- hvor prosjektet kan supplere NMR med land-, verdikjede- og aktørnær analyse
- hvilke datagap som må lukkes før eksterne claims

Dette gir en tydelig rolle for Food Systems 2026: å gjøre Nordic Vision 2030 målbar og beslutningsnær for matsystemomstilling.
