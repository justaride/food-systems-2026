# Verifiserte lokatorreparasjoner — 2026-07-19

## Beslutning og bevisgrense

Tretti konkrete feilbindinger, generiske lokatorer eller bare domener er rettet i seeddata og
i den kanoniske lokale databasen. Databaseoppdateringen brukte eksakt forventet
gammel verdi, `Serializable`-transaksjon og eksplisitt bekreftelse. Etterkontroll
rapporterte `0 pending`, `30 already applied` og `0 conflicts`.
Reparasjonsrunneren pinner alle 30 gamle og nye verdier, forventede tittelendringer
og verifisert tilgangsdato 2026-07-19 i en eksplisitt
kontrakt, krever at seeddata fortsatt matcher de godkjente nye verdiene og
avviser ikke-offentlige/reserverte URL-er. En senere seedendring kan derfor
ikke gjenbruke bekreftelsen som autorisasjon for en annen lokator.
Redirect-følgende HTTP-kontroller i de to batchene 2026-07-19 ga fungerende
arbeidssider for alle 30 reparasjoner. Menon-siden krevde vanlig
nettleseridentitet i kontrollen; korrekt side ble i tillegg kontrollert mot
sidetittelen. Begge handle-URL-ene løste til SIKTs Nasjonalt vitenarkiv.

Dette er ikke en generell kvalitetsgodkjenning av kildene. Reparasjonene viser
at de navngitte postene nå peker på det identifiserte arbeidet hos en offentlig
utgiver eller institusjon. De tilfører ikke peer-review/appraisal,
risk-of-bias eller claim-anker. Tilgangsdato er nå strukturert og registrert for
de 30 radene, men det er ikke det samme som kildeappraisal eller
påstandsforankring. Produksjonsdatabasen er ikke endret.

En påfølgende provenance-batch klassifiserte 42 SourceDoc-rader med en egen,
CAS-beskyttet kontrakt: 25 eksterne kilder og 17 interne primærkilder,
synteser eller duplikater. Etterkontrollen rapporterte `0 pending`,
`42 already applied` og `0 conflicts`. Ukjent provenance blir nå `unknown` og
kan ikke automatisk bli `primary` eller eksternt siterbar ved citation-backfill.

## Anvendte reparasjoner

| Sett | ID-er | Reparasjon og verifisert autoritativ kilde |
|---|---|---|
| Report | `dagligvaretilsynet-aarsrapport-2021` til `-2024` | En årsforskjøvet URL-kaskade ble rettet mot de offisielle årsrapportene for [2021](https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/arsrapport-2021-for-dagligvaretilsynet-l3728148.pdf), [2022](https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/dagligvaretilsynet-arsrapport-for-2022.pdf), [2023](https://www.regjeringen.no/contentassets/a9f933fc2c5c4d8aaed0a267b45a033d/arsrapport_dagligvaretilsynet-2023.pdf) og [2024](https://www.regjeringen.no/contentassets/036ffda0c81e4b3f99456a78ec31df0e/arsrapport-dagligvaretilsynet-2024.pdf). |
| Report | `konkurrensverket-summary-2024` | Fullrapporten ble erstattet med Konkurrensverkets engelske [summary-PDF](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf). |
| SourceDoc | `src-19`, `src-22` | Generisk NHH-forside ble erstattet med persistente arbeidsnivå-handles for [Black Sheep-oppgaven](https://hdl.handle.net/11250/3051794) og [Restrictive covenants-oppgaven](https://hdl.handle.net/11250/3158950). Begge ga HTTP 200 og løste til SIKTs Nasjonalt vitenarkiv 2026-07-19; det tidligere `openaccess.nhh.no`-vertsnavnet løste ikke i kontrollmiljøet. |
| SourceDoc | `src-25`, `src-78`, `src-141` | Generisk publikasjonsside ble erstattet med Konkurrensverkets arbeidssider for [rapport 2024:5](https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/), [rapport 2024:4](https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/) og [UTP-evaluering 2025:5](https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/). `src-141` fikk også den offisielle tittelen i seeddata og lokal DB. |
| SourceDoc | `src-27`, `src-28`, `src-47` | Bare domenet `regjeringen.no` ble erstattet med den relevante [Meld. St. 4-seksjonen](https://www.regjeringen.no/no/dokumenter/meld.-st.-4-20242025/id3056808/?ch=15), [EMV-kartleggingens dokumentside](https://www.regjeringen.no/no/dokumenter/kartlegging-av-egne-merkevarer-og-verti-kal-integrasjon-i-dagligvaremarkedet/id2997407/) og [NIBIOs grunnlagsmateriale 2024](https://www.nibio.no/tema/landbruksokonomi/grunnlagsmateriale-til-jordbruksforhandlingene/grunnlagsmaterialet-til-jordbruks-forhandlingene-2024). |
| SourceDoc | `src-36`, `src-42`, `src-44` | Bare domenet `konkurransetilsynet.no` ble erstattet med den konkrete siden om [markedsetterforskning](https://konkurransetilsynet.no/markedsetterforskningsverktoyet-trer-i-kraft-i-dag/), [gebyrvedtaket](https://konkurransetilsynet.no/49-milliarder-i-gebyr-til-coop-norgesgruppen-og-rema/) og [Marginstudie 2024, del 1](https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf). |
| SourceDoc | `src-29`–`src-33` | Bare domener eller feil attribusjon ble erstattet med verksidene for [Dagligvarehandelen 2025](https://www.virke.no/analyse/statistikk-rapporter/dagligvarehandelen/), [Bærekraft i ASKO 2024](https://asko.no/nyhetsarkiv/barekraft-i-asko-2024/), [NIBIOs metode- og statistikkside](https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk), [NORSUS OR.27.25](https://norsus.no/publikasjon/faktaark-om-matsvinn-i-norge-2024/) og [Eurostats prisnivåartikkel for 2024](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250619-1). |
| SourceDoc | `src-35`, `src-37`, `src-38` | Sammensatte eller generiske poster ble bundet til [FIVHs temaside om matsvinn](https://www.framtiden.no/tema/matsvinn), [Menon 68/2022](https://menon.no/prosjekter/egne-merkevarer-emv-og-innovasjon-i-dagligvare) og den persistente [DOI-en til Gabrielsen og Johansen (2015)](https://doi.org/10.1016/j.ijindorg.2014.11.001). Metadata og evidensgrenser markerer henholdsvis interesseaktør, bestillingsrapport og teoretisk artikkel. |
| SourceDoc | `src-39`, `src-40`, `src-43` | Postene ble bundet til [NESAs offisielle organisasjonsside](https://www.huoltovarmuuskeskus.fi/en/organisation/the-national-emergency-supply-agency), [NBS' dokumentside for jordbruksoppgjøret 2025](https://www.smabrukarlaget.no/politikk/jordbruksoppgjoeret/tidligere-oppgjoer/jordbruksoppgjoeret-2025/) og [SSBs grensehandelsstatistikk](https://www.ssb.no/varehandel-og-tjenesteyting/varehandel/statistikk/grensehandel). Sidene dokumenterer mandat, posisjon/dokumenter eller statistikk — ikke alle påstander i de lokale sammendragene. |
| SourceDoc | `src-45`, `src-48`, `src-49` | Postene ble bundet til [Oslo Economics-rapporten bestilt av NorgesGruppen](https://osloeconomics.no/publication/konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte/), [DLFs posisjonsnotat](https://www.dlf.no/ingen-forbud-mot-ulike-innkjopspriser/) og [Miljødirektoratets dynamiske EUDR-side](https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/avskogingsforordningen-eudr/). Oppdragsgiver, interesseposisjon og tidsfølsomhet er eksplisitt markert. |

Tolv tilhørende biblioteknotater har i tillegg fått eksplisitte blokker for
`Kildestatus`, `Kilderolle` og `Evidensgrense`. En fungerende locator oppgraderer
dermed ikke automatisk uankrede narrative påstander til eksternt verifiserte
funn.

## Gjenstående duplikat- og aliasvurdering

Auditens gjenværende fire locatorgrupper omfatter åtte Report-rader:

- `emv-kartlegging-2023` og `soa-emv-2023` er sannsynlige aliaser for samme
  SØA-rapport.
- `dk-salling-coop-decision-2025` og `kfst-salling-coop-2025` er sannsynlige
  aliaser for samme KFST-avgjørelse.
- `coop-2024` og `coop-norge-2024` er sannsynlige aliaser for samme årsrapport.
- `akademia-nhh-butikkstruktur-2024` og
  `akademia-nhh-matbors-historie` peker bare på NHH FOODs generelle side. Eksakt
  publikasjon ble ikke identifisert; begge skal forbli blokkert for ekstern
  sitering til arbeidsnivåbevis finnes.

Ingen av disse radene ble automatisk slått sammen. Det krever en eksplisitt
datastyringsbeslutning om kanonisk ID, aliasbevaring og eventuelle avhengigheter.

## Oppdatert målbar kø

- SourceDoc har 101 ikke-tomme URL-felt: alle 101 er gyldige absolutte
  HTTP(S)-URL-er, ingen har ugyldig syntaks, og 81 mangler URL.
- Alle 25 SourceDoc-rader som hittil er eksplisitt klassifisert som eksterne,
  har gyldig absolutt locator og tilgangsdato. Den offentlige locator-køen for
  disse radene er derfor 0.
- 140 SourceDoc-rader har fortsatt `unknown` provenance og ligger i en separat
  review-kø. De skal klassifiseres før systemet avgjør om de trenger offentlig
  locator, lokal evidensidentitet eller duplikathåndtering.
- 17 SourceDoc-rader er eksplisitt interne eller duplikater. De krever lokal
  sti/dokumentidentitet og hash, ikke en oppdiktet offentlig URL.
- Duplikatlokator-køen er fire Report-grupper / åtte rader og null
  SourceDoc-grupper.
- Strukturert tilgangsdato er registrert for 5/132 Report-rader og 25/182
  SourceDoc-rader. Thesis står fortsatt på 0/78.
- Databaselaget modellerer claim-ankre via `FieldCitation`, men 0/415
  databaseposter har både claimtekst og side-/sitatanker. Dette er en målbar
  kvalitetsmangel, ikke et manglende skjema.
- Målingene er syntaks- og metadataresultater. De beviser ikke varig
  tilgjengelighet, redirectkjeder eller arkivering.
