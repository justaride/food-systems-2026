# Norsk og tilgjengelighet: statisk kontroll, 9. september 2026

Dette er en kodelesing av de prioriterte sidene `/arbeidsko`, `/kilder`,
`/bibliotek`, `/sok`, `/aktorer` og `/produsenter`. Den er ikke en
skjermlesertest, tastaturnavigasjonstest eller browserkontroll. Slike brukerreiser
må kontrolleres på den kjørende flaten.

## Kontrollert uten nye funn i dette steget

- `/arbeidsko` har norske handlingsetiketter og tilgjengelige navn for søk og
  begge filtre.
- `/produsenter` har norsk rådataavgrensning, tabelloverskrifter med `scope`,
  og søkefelt med tilgjengelig navn.
- Den endrede `/aktorer`-oversikten har norske labels for holdning, kvadranter
  og forespørsler; interne vurderinger er fortsatt merket som arbeidsvurderinger.
- De nye bibliotek-/søk-/AI-kunnskapstekstene reduserer overclaim om historiske
  policymerker. De endrer ikke kilde-, kandidat- eller human-review-status.

## Etterkontroll etter tilgjengelighetsretting

De seks konkrete statiske funnene under er rettet i kode: feltnavn, ikonlenkens
navn, `aria-pressed`, bibliotekets ekspansjonsstatus/-kobling, søkets live-/feilstatus
og aktørdetaljens norske tekst. Dokumentdetaljer har nå et stabilt kontrollert
innholds-ID også når panelet er lukket. `ui-diacritics` dekker nå også
`/aktorer/[slug]`.

Den målrettede testgruppen besto etter rettingen:
`library-analysis-presentation`, `status-legend`, `search-warning-copy` og
`ui-diacritics` (40 tester). Målrettet ESLint for de fem endrede filene besto,
og `git diff --check` er grønn.

## Statisk rettet; fortsatt browserkontroll

| Prioritet | Side / fil | Rettet i kode | Hva som fortsatt må testes i browser |
|---|---|---|---|---|
| P1 | `/kilder` — `src/app/kilder/KilderContent.tsx:278`, `:499` | Søkefelt har `aria-label`; ikonlenken har dynamisk navn og dekorativ SVG. | At navn, fokus og lenkemål i ny fane er forståelig i skjermleser. |
| P1 | `/bibliotek` — `src/app/bibliotek/BibliotekContent.tsx:268`, `:299`, `:309`, `:319`, `:356` | Søk/felter har navn; ekspandering har `aria-expanded`, `aria-controls` og et stabilt ID-mål. | At ekspansjon, lastestatus og fokusrekkefølge fungerer med tastatur og skjermleser. |
| P1 | `/sok` — `src/app/sok/SokContent.tsx:194`, `:202`, `:229`, `:251` | Søk har navn; spinner/resultat bruker statusregion og feil bruker alert. | At debouncet søk ikke gir støy, og at feil/resultat kun leses én gang. |
| P2 | `/aktorer/[slug]` — `src/app/aktorer/[slug]/page.tsx:163`, `:244`, `:264`, `:269`, `:289` | Norsk «Konkret forespørsel», «Utgående» og «Inngående» er på plass; diakritikktesten omfatter nå detaljsiden. | At sideinnhold fra datafelt har samme språk og er lesbart på smal skjerm. |
| P2 | `/kilder` — `src/app/kilder/KilderContent.tsx:179`, `:233`, `:254`, `:293` | Runde-, status-, opprinnelses- og typefiltre setter nå `aria-pressed`. | At valgt filter og oppdatert antall blir tydelig annonsert. |

## Ekstern claim-markering

Metrikktittelen er endret til «Ekstern claim-markering». Det skiller antallet historiske markeringer fra den separate eksterne porten, som fortsatt vises som stengt eller grønn. Markeringen er ikke human eller publiseringsgodkjenning.

## Roots faktiske nettleserkontroll

CUA-kontrollen på produksjons-SHA `9749825` fulgte alle 40 navigasjonsmål (det tidligere tallet 39 var utdatert). Alle lastet med én hovedoverskrift og uten synlig main-alert. Dette er en grunnkontroll av initial side, ikke alle interaksjoner eller en skjermleserattestasjon. Mediasiden hadde scrollWidth 1465 ved viewport 1280. Åtte søkefelt manglet eksplisitte navn.

Navn er nå lagt til på disse feltene. Person- og selskapsregisteret bruker 50 poster per side; selskapenes tidligere skjulte 300-grense er fjernet. Personkortene tillates å krympe og bryte lange navn. Mediasidens rutenett bruker minmax(0, …) slik at brede tabeller ruller inne i kortet. 24 sider som arvet samme dokumenttittel har fått egne titler, slik at også rutekunngjøringen kan identifisere siden. Nyeste innsiktsdato er nå eksplisitt skilt fra dato for kildekontroll.

Lokalt ved 390 px: søk, kilder, bibliotek, aktører, selskaper, personer, økonomi og media holdt dokumentbredden innen viewport. Personregisteret rendret 50 lenker, neste side viste 51–100, og søk etter et navn fra side 2 returnerte 1 treff på side 1. Lokalt datagrunnlag er eldre enn produksjon (1642 personer); eierskap/krysstyrer kan ikke UI-attesteres lokalt fordi den gamle databasen mangler amountCurrency. Den databasen er ikke migrert i denne oppgaven.

Dokumenterte produksjonssider og lokale observasjoner ligger privat i `restlist/ui-baseline.json`. Produksjonskontroll av ny release følger separat. Full engelsk innholdsadaptasjon, faktisk skjermleserbruk og test med ny intern leser er fortsatt ikke gjennomført.
