# Food TG Source Locator Risk Audit 2026-05

**Status:** Intern kilde- og locator-kontroll
**Dato:** 2026-05-21
**Scope-status:** Kan utføres uten scope-vedtak. Ekstern bruk krever claim-lock og faktisk locator.
**Formål:** Sikre at high-risk claims har kilde, locator, år, geografi, definisjon, systemgrense og caveat før de brukes i ekstern tekst, figurer eller roadmap.

Food har allerede `citationReadiness`, `externalUse`, `sourceCitationIds`, `fieldCitationIds` og `blockedReason` i claim-registeret. Denne auditfilen er et praktisk risikokart over kilder og datalag som kan bli overtolket.

## Locator-status

| Status | Betydning | Bruksregel |
|---|---|---|
| `locator-ok` | Kilde, URL/path, side/tabell/celle, år, geografi og definisjon er kjent. | Kan brukes hvis claim-lock tillater det. |
| `locator-ok-med-forbehold` | Locator finnes, men scope, metode eller sammenlignbarhet må forklares. | Kan brukes med caveat. |
| `aktor-data` | Kilde er aktørspesifikk, ikke bransjesnitt. | Bruk som benchmark/actor-data, ikke totalclaim. |
| `intern-syntese` | Intern fil strukturerer analyse, men er ikke ekstern evidens. | Må peke videre til EV-/SRC-/primærkilde. |
| `regulatorisk-tidsfoelsom` | Lov/forskrift/status kan endre seg. | Må sjekkes mot gjeldende kilde før ekstern bruk. |
| `hold-tilbake` | Mangler locator, blander datalag eller har feil tolkning. | Skal ikke brukes før reparert. |

## High-risk kildegrupper

| Kilde-/claimgruppe | Risiko | Nåstatus | Styrende claim | Kildeanker | Må låses før ekstern bruk | Trygg formulering nå |
|---|---|---|---|---|---|---|
| SSB 08801 soyabønner, soyamel/-kaker, soyaolje | Handelsstatistikk kan leses som faktisk fôrbruk eller aktørbruk. | `locator-ok-med-forbehold` | `CL-A-020`, `CL-C-011` | `EV-A-021`, `SRC-A-017` | Varenummer, år, opprinnelsesland, mengde/verdi, oppdateringsdato og metodeforbehold. | "SSB 08801 gir importserie per varenummer, ikke faktisk fôrbruk." |
| `210610` proteinkonsentrater | Kan feilaktig omtales som SPC eller soyaspesifikk kode. | `hold-tilbake` for SPC-claim | `CL-A-020` | `EV-A-021` | Tolletaten/SSB-metode og fôraktørbekreftelse. | "`210610` er en bred proteinkonsentratkode og kan ikke alene brukes som SPC-serie." |
| `23099040` prepared fish feed | Kan feilaktig omtales som SPC, laksefôr eller råvareandel. | `hold-tilbake` for SPC/laksefôrclaim | `CL-A-020` | `EV-A-021` | Varekodeavgrensning, art, sluttbruk og aktørdata. | "`23099040` er fiskefôr/prepared feed og må ikke blandes med råvareandel." |
| Fiskeridirektoratet/Sjømat Norge total fôr | Total oppdrettsfôr kan leses som laksefôr, råvareandel eller substitusjonsgrunnlag. | `locator-ok-med-forbehold` | `CL-A-020` | `EV-A-018` | Art, periode, definisjon, total fôr vs ingredienser. | "Gir volumramme for oppdrettsfôr, ikke råvareandel eller substitusjonseffekt." |
| Skretting Norway Impact Report | Actor-data kan brukes som bransjesnitt. | `aktor-data` | `CL-A-020`, `CL-C-011` | `EV-A-019` | Selskap, år, råvarekategori, metode, sammenligning mot andre aktører. | "Skretting-data er actor-benchmark, ikke norsk bransjesnitt." |
| Denofa soya og produkter | Actor-nettside kan bli total norsk importclaim. | `aktor-data` | `CL-A-020`, `CL-C-011` | `EV-A-017` | Dato, år, anlegg, råvare, opprinnelse og offisiell importserie separat. | "Denofa er konkret norsk aktørpunkt, ikke totalmarked." |
| EUDR EU-scope | EU-regel kan blandes med norsk/EØS-gjennomføring. | `regulatorisk-tidsfoelsom` | `CL-C-011` | `EV-C-017`, `PCQ-C-001` | EU-status, norsk EØS-status, norsk forskrift, ikrafttredelse, eksport/import-scope. | "EUDR er EU-compliance-tema; norsk status må formuleres separat." |
| Norsk EUDR-forskrift/status | Kan bli utdatert raskt. | `regulatorisk-tidsfoelsom` | `CL-C-011` | `EV-C-017` | Landbruksdirektoratet, Miljødirektoratet, Lovdata/forskrift, EØS-komité, dato. | "Norsk status må sjekkes mot direktorat/Lovdata før ekstern bruk." |
| Mattilsynet insekter til fôr | Generell veiledning kan overføres til alle substrater. | `locator-ok-med-forbehold` | `CL-A-011`, `CL-A-021` | `EV-A-013`, `EV-A-014` | Konkret substrat, sluttbruk, ABP/TSE, veiledningsdato og eventuelt pilotunntak. | "Hovedregelen gir juridisk gate; konkrete substrater må sjekkes." |
| EUR-Lex ABP/TSE/insekt-PAP | Juridisk kompleksitet kan forenkles feil. | `locator-ok-med-forbehold` | `CL-A-011`, `CL-A-021` | `EV-A-015` | Konsolidert tekst, EØS-/Lovdata-status, juridisk vurdering ved behov. | "Kategori 3 er nødvendig, men ikke tilstrekkelig." |
| EFSA/insekt risiko | Risikoprofil kan leses som lovlighetsbevis. | `locator-ok-med-forbehold` | `CL-A-005`, `CL-A-021` | `EV-A-016` | Skill risikoramme fra juridisk lovlighet. | "EFSA støtter casevis risikovurdering, ikke grønt lys for konkret substrat." |
| Okara/BSG benchmark | Svenske eller FoU-cases kan bli norsk pilotbevis. | `locator-ok-med-forbehold` / `intern-syntese` | `CL-B-014`, `CL-B-021` | `EV-B-011`, `EV-B-018`, `EV-B-019` | Råvareeier, volum, fukt, mikrobiologi, food-grade, Novel Food, off-taker. | "Okara/BSG er benchmark og kandidat etter råvare- og hygienegate." |
| Matsvinnstatus Norge | Tall kan blandes mellom sektor, år og rapport. | `locator-ok-med-forbehold` | `CL-B-017`, `CL-C-012`, `CL-C-016` | `EV-B-014`, `EV-B-021`, `EV-C-026` | År, sektor, jordbruk inkludert/ekskludert, definisjon, rapportversjon. | "Norge har dokumentert matsvinnreduksjon med sektor- og definisjonsforbehold." |
| Svensk matsvinn/HORECA | Nyansering kan overdrives som nordisk trend. | `locator-ok-med-forbehold` | `CL-B-018` | `SRC-BASE-007`, `SRC-BASE-009` | Naturvårdsverket/IVL primærtall, år, sektor og definisjon. | "Sverige nyanserer bildet; ikke alle nordiske sektorer faller likt." |
| Matsvinnlov Norge | Vedtatt lov kan omtales som operativ plikt uten ikrafttredelse. | `regulatorisk-tidsfoelsom` | `CL-C-016`, `CL-B-022` | `EV-C-026` | Lovdata, § 14, forskrift, ikrafttredelsesvedtak, virksomhetsomfang. | "Loven er vedtatt, men operative plikter krever ikrafttredelses-/forskriftssjekk." |
| Salling Group matsvinn | Konsern-/retaildata kan bli nordisk sammenligning eller halvering. | `aktor-data` | `CL-B-020`, `CL-B-022` | `EV-B-027` | Scope, baseline, land/formater, rapporteringsdefinisjon, andre kjeder. | "Salling er retail-benchmark, ikke nordisk rangering." |
| RecoLab/Helsingborg | Infrastrukturcase kan leses som kopierbar pilot eller N/P/K-effekt. | `locator-ok-med-forbehold` | `CL-B-016`, `CL-B-023` | `EV-B-013`, `EV-B-015` | Massebalanse, produktstatus, driftsskala, regelverk, norsk overføringsverdi. | "RecoLab er benchmark for kildeseparering og næringsgjenvinning." |
| VEAS/HIAS/biogass/struvitt | Ulike systemgrenser kan gi falsk sammenligning. | `locator-ok-med-forbehold` | `CL-B-023`, `CL-C-015` | `EV-B-008`, `EV-B-010`, `EV-B-016`, `EV-B-017`, `EV-B-024` | N/P/K, systemgrense, produktmarked, avfalls-/gjødselregelverk, dataeier. | "Nutrient loops er benchmark/sekundærspor inntil systemgrense låses." |
| Dagligvaretilsynet/Konkurransetilsynet | Struktur- og rapporteringsrisiko kan bli kausal effektclaim. | `locator-ok-med-forbehold` | `CL-C-001`, `CL-C-006`, `CL-C-014` | `EV-C-013`, `EV-C-014`, `EV-C-015` | Absolutte datoer, myndighetsansvar, metode, aktørdata for faktisk praksis. | "Kildene dokumenterer struktur- og rapporteringsrisiko, ikke konkrete sirkulær-effekter." |
| DFØ/offentlig innkjøp | Kriterier kan leses som faktisk etterspørsel. | `locator-ok-med-forbehold` | `CL-C-002`, `CL-C-015` | `EV-C-016` | Kontraktskrav, kjøkkenpraksis, leverandørmarked, datakrav og kommune/innkjøper. | "Offentlig innkjøp er demand-side-mulighet, ikke dokumentert effekt." |
| Danmark Green Tripartite | Skattesats kan oppgis uten bunnfradrag eller implementeringsstatus. | `regulatorisk-tidsfoelsom` | `CL-C-017` | `EV-C-027` | Avtaledato, lovstatus, effektiv sats, bunnfradrag, utslippsbaseline. | "Bruk som policy-benchmark med fradrag og implementeringsforbehold." |
| Sverige Riksrevisionen | 68 prosent kan overgeneraliseres. | `locator-ok-med-forbehold` | `CL-C-018` | `EV-C-028` | Kilde, dato, hvilke utslippskilder, 2023-base og regjeringens svar. | "68 prosent gjelder organogen jord og drøvtygger-fordøyelse i 2023." |
| Kunnskapsgraf-/relasjonsdata | Graf kan leses som kildebevis eller aktørforankring. | `intern-syntese` / `citable_with_note` per kant | `CL-C-001`, `CL-C-014` | App/DB + kilde per kant | Kilde per relasjon, konfidens, type, dato og bruksrett. | "Grafen er navigasjon og struktur, ikke forankringsbevis." |
| KPI-katalog | KPI-forslag kan leses som resultat eller måloppnåelse. | `intern-syntese` | `CL-C-015` | `EV-C-011` + dataeier senere | Definisjon, år, geografi, enhet, kilde, dataeier, frekvens, baseline. | "KPI-er er datagate før de er styringsmål." |

## Reparasjonskø

| Prioritet | Reparasjon | Berører |
|---:|---|---|
| 1 | Lås EUDR/Norge/EU-scope med dato, direktoratstatus, Lovdata/forskrift og EU-eksport/innenlandsk bruk. | `CL-C-011`, `CL-A-020` |
| 2 | Skriv datalagstabell for fôr: SSB/HS, Fiskeridirektoratet/Sjømat Norge, Denofa, Skretting/BioMar, EUDR. | `CL-A-020`, `CL-C-011` |
| 3 | Marker `210610` og `23099040` som metodegater, ikke claimgrunnlag for SPC/laksefôr. | `CL-A-020` |
| 4 | Bygg råvaredatakort for okara/BSG før pilotord brukes. | `CL-B-014`, `CL-B-021` |
| 5 | Bygg matsvinnkvalitet-datakort med baseline, kategori, tidsvindu og kontrafaktisk. | `CL-B-022`, `CL-C-012` |
| 6 | Knytt alle graf-/Sankey-/KPI-figurer til figurnote og claim-lock før decision deck. | appflater og decision pack |
| 7 | Harmoniser nordiske policy- og matsvinnsammenligninger per land, år og definisjon. | `CL-B-017`, `CL-B-018`, `CL-C-016`, `CL-C-017`, `CL-C-018` |

## Minimum locator-mal

Når et claim skal løftes til ekstern bruk, fyll inn:

```text
Claim-ID:
Publikasjonssetning:
Kilde-ID:
URL/path:
Locator:
År/periode:
Geografi:
Enhet:
Definisjon:
Systemgrense:
Readiness:
Caveat:
Ikke si:
Sjekket dato:
Sjekket av:
```

## Stop-regler

- Ikke bruk en intern syntesefil som eneste ekstern kilde.
- Ikke bruk en aktørkilde som bransjesnitt.
- Ikke bruk regulatorisk status uten sjekkdato.
- Ikke bruk varekoder som råvare- eller bruksbevis uten metodeavklaring.
- Ikke bruk case eller benchmark som pilotbevis.
- Ikke bruk KPI uten dataeier og baseline.
- Ikke bruk grafrelasjon som aktørforankring.

## Neste handling

1. Bruk denne filen før alle nye external-use-rader i `claim-register-food-tg.md`.
2. Oppdater `primary-check-queue-food-tg-v0.1.md` med lukket/åpent per reparasjonskø etter hvert som sjekkene gjøres.
3. Når ekstern tekst skrives, kopier minimum locator-mal per claim inn i kildepakken eller vedlegg.
