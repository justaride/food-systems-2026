# Source Attribution Policy

> Datert: 2026-05-18
> Gjelder: nye importer, nye DB-fakta, whitepaper-eksport og brukerflater som viser faktiske påstander.

## Formål

Alle faktiske påstander som importeres, vises i appen eller brukes i juni-2026-whitepaperet skal kunne spores til en navngitt kilde med lokator, aksessdato og klassifisert proveniens. Eldre data kan merkes som legacy i en overgangsfase, men skal ikke passere som whitepaper-klare uten eksplisitt kildegrunnlag.

## SourceClass

| Klasse | Bruk | Minimumskrav |
|---|---|---|
| `primary` | Original publisering, årsrapport, offentlig vedtak, lovtekst, registerutskrift eller myndighetsdata | URL, `accessedAt`, og lokal kopi når kilden er brukt til en sentral påstand |
| `secondary` | Analyse, media, bransjeartikkel eller rapport som tolker primærdata | URL, `accessedAt`, tydelig avsender og publiseringsdato hvis tilgjengelig |
| `synthesis` | Prosjektets egen sammenstilling av flere navngitte kilder | Underlagskilder må være koblet; syntesen er ikke selv primærbevis |
| `internal_construct` | Forskningskonstrukt laget for analysemodellering, for eksempel syntetisk eiendomsgren | Må ha forklaring, ansvarlig import og lenke til intern syntese eller beslutningsnotat |
| `registry_snapshot` | Maskinell eller manuell snapshot fra offentlig register/API | URL/API-endepunkt, `accessedAt`, lokal JSON/PDF/HTML-kopi og SHA-256 når mulig |
| `legacy_unsourced` | Historisk rad uten tilstrekkelig kilde | Tillatt bare som overgangsstatus; blokkeres fra whitepaper-eksport og nye importer |

## VerificationStatus

| Status | Betydning |
|---|---|
| `unverified` | Kilden er registrert, men feltet er ikke kontrollert manuelt eller maskinelt |
| `machine_verified` | Feltet er avstemt mot strukturert ekstern kilde eller registersnapshot |
| `human_verified` | Feltet er kontrollert av navngitt reviewer med dato |
| `disputed` | Kildene spriker eller feltet trenger faglig vurdering |
| `rejected` | Feltet er vurdert som feil, blokkert eller uegnet for bruk |

## AccessedAt

- `accessedAt` skal lagres som ISO-8601 med dato-presisjon: `YYYY-MM-DD`.
- Nye kilder uten aksessdato skal avvises av import-helper eller audit.
- Hvis en kilde har både publiseringsdato og aksessdato, skal begge bevares der modellen støtter det. Aksessdato erstatter ikke publiseringsdato.

## Lokatorer

For alle nye ikke-interne kilder kreves minst én av:

- `url`
- `localPath`
- `sourceDocId`
- `documentId`

For sentrale whitepaper-påstander skal en ekstern URL normalt ha lokal arkivkopi eller en koblet `Document`/`SourceDoc`.

## Internal Synthesis

`synthesis` eller eksisterende `internal_synthesis` er gyldig når prosjektet sammenstiller flere navngitte kilder, lager et register, eller formulerer en analyse basert på dokumenterte underlagskilder.

Det er ikke gyldig som erstatning for manglende primærkilde til:

- regnskapstall
- eierandeler
- styre- og rolleinformasjon
- subsidiebeløp
- registerstatus for selskaper
- konkrete juridiske eller regulatoriske vedtak

## Forskningskonstrukter

Forskningskonstrukter er entiteter som finnes i analysemodellen, men ikke nødvendigvis som juridisk registrerte selskaper. Eksempler er syntetiske orgnummer eller interne eiendomsgrener som brukes for å modellere struktur.

Slike entiteter skal:

- merkes med `isResearchConstruct = true`
- ha `orgNrFormat = 'research_construct'`
- ha en `internal_construct` eller `synthesis`-citation
- ikke vises som ordinær registerverifisert virksomhet

Standardspørringer til rapporter og whitepaper skal ekskludere forskningskonstrukter med mindre de er eksplisitt valgt inn.

## Hva betyr verifisert

Et felt er verifisert når verdien er kontrollert mot kilden som faktisk dokumenterer feltet.

- Brønnøysund Enhetsregisteret kan verifisere selskapsidentitet, adresse, organisasjonsform, NACE, status og roller der API-et har feltet.
- Enhetsregisteret skal ikke brukes som kilde for omsetning eller EBITDA dersom slike verdier ikke finnes i responsen.
- Regnskapstall krever årsrapport, Regnskapsregisteret-utskrift, OffentligData financial statement, Proff eller tilsvarende eksplisitt regnskapskilde med lovlig tilgang.
- Rolledata skal bruke separat rollekilde/snapshot, ikke bare generell selskapsmetadata.

## Valutakonvertering til NOK

NOK-konverterte regnskapstall er ikke verifisert bare fordi kildevaluta-tallet er funnet. Begge ledd må dokumenteres:

1. source-currency value fra primærkilde, for eksempel `net sales SEK 84,057m`
2. valutametode og valutakilde, for eksempel Norges Bank årsgjennomsnitt for samme regnskapsår

Standardregel for kalenderårsregnskap:

- Bruk Norges Banks offisielle valutakurser, årsgjennomsnitt, med NOK som kvoteringsvaluta.
- Lagre kurskilde som egen `SourceCitation` eller som eksplisitt `notes`/underlagskilde i citationen.
- Arkiver JSON/CSV fra Norges Bank API når valutakursen brukes i whitepaper-klare tall.
- Bevar originalverdien i kildevaluta i citation-notat eller eget felt når modellen støtter det.
- Avrund bare etter beregning, og dokumenter om DB-feltet bruker MNOK, hele NOK eller annen enhet.

For avvikende regnskapsår, for eksempel Hagar 2024/25, skal man ikke bruke kalenderår 2024 uten særskilt beslutning. Bruk enten:

- gjennomsnitt for faktisk regnskapsperiode hvis API/metode støtter det, eller
- kildevaluta direkte i rapport/UI inntil korrekt FX-metode er etablert.

Hagar 2024/25-pilot: Norges Bank daglige observasjoner for ISK/NOK 2024-03-01 til 2025-02-28 ble hentet 2026-05-18. Serien hadde 250 observasjoner og ga aritmetisk gjennomsnitt 7.85668 NOK per 100 ISK, dvs. 0.0785668 NOK per 1 ISK. Dette gir ca. 14,168.9 MNOK for Hagar sales 180,342 m.ISK. Serien er arkivert som `research/evidence-pack/fx-rates/norges-bank/EXR-B-ISK-NOK-SP-2024-03-01_2025-02-28-2026-05-18.json`.

Observerte Norges Bank-årsgjennomsnitt for 2024, hentet 2026-05-18:

| Valuta | API-observasjon | Enhet | NOK per 1 |
|---|---:|---|---:|
| SEK | 101.74 | NOK per 100 SEK | 1.0174 |
| DKK | 155.89 | NOK per 100 DKK | 1.5589 |
| EUR | 11.6276 | NOK per 1 EUR | 11.6276 |
| ISK | 7.79 | NOK per 100 ISK | 0.0779 |

## Wayback og lokal arkivering

Wayback- eller annen ekstern arkivlink kreves når:

- kilden er en webside som kan endres uten versjonert PDF eller DOI
- kilden er media, bransjeweb, pressemelding eller organisasjonsside brukt til sentral påstand
- samme URL tidligere har vært ustabil, omdirigert eller blokkert
- kilden inngår i whitepaperet og ikke har stabil offentlig arkivversjon

Wayback er normalt ikke nødvendig når:

- DOI eller annen persistent akademisk identifikator peker til kilden
- lokal PDF/JSON/HTML-kopi med SHA-256 er tilstrekkelig og lisensmessig forsvarlig
- kilden er et internt forskningskonstrukt med dokumentert beslutningsnotat

## Legacy-regler

Eksisterende fritekstverdier i `source`-felt kan beholdes midlertidig, men skal klassifiseres og ryddes gradvis.

- `web research`, `manual`, rene domenenavn og registeretiketter uten URL/dato skal flagges.
- `legacy_unsourced` skal være eksplisitt, ikke implisitt fravær av kilde.
- Nye import-scripts skal ikke introdusere nye legacy-kilder.
- Whitepaper-eksport skal feile dersom påstanden bygger på `legacy_unsourced`, `disputed` eller `rejected`.

## Minimum for ny import

Nye importer skal levere:

1. `sourceClass`
2. `citationText`
3. `accessedAt`
4. minst én lokator (`url`, `localPath`, `sourceDocId`, `documentId`)
5. `verificationStatus`, minst `unverified`
6. `fieldPath` når citationen bare gjelder et bestemt felt

Hvis kilden er lokal fil, skal SHA-256 beregnes før den brukes i whitepaper eller som registersnapshot.
