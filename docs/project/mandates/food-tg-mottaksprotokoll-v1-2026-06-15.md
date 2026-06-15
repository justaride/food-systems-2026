---
tittel: Food TG mottaksprotokoll v1.0
status: Aktiv intern
eier: Gabriel
dato: 2026-06-15
opprettet: 2026-06-11
scope: Standard prosedyre for all ny Deep Research, dokumentask og casevis kildeinntak etter 10.06-sprinten.
bruksregel: Intern kontrollprotokoll. Åpner ikke ekstern outreach, faktastemme eller nye claims.
relaterte_filer:
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
---

# Food TG mottaksprotokoll v1.0

Denne protokollen standardiserer 10.06-pipelinen fra prompt pack til mottakslogg, DASK/AASK, source-shortlist, PCQ og claim-lock. Den gjelder for nye researchfunn, Deep Research-outputer, dokumentforespørsler, casekort og kildekandidater som skal inn i Food TG-arbeidet etter plattformløftet.

Hovedregelen er enkel: ingen kilde inn uten DRO/DRR-rad. En kilde, et case eller et claim kan ikke løftes videre før raden viser eier, dato, status, locator, bruksrett, neste kontrollpunkt og hvilken claim- eller casebruk raden eventuelt støtter.

## Obligatorisk rekkefølge

1. **Prompt og oppdrag:** Bruk `docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md` eller en caseprompt som eksplisitt sier hva som skal valideres, hvilken case den gjelder, og hvilke claims som ikke kan løftes uten primærsjekk.
2. **DRO-rad:** Registrer forventet Deep Research-output eller rå kildekandidat i `docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md` før innholdet brukes i casekort, deck eller shortlist.
3. **DRR-rad:** Når output er mottatt, registrer funn, filnavn, eier, dato, status, locator og bruksrett i `docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md`.
4. **DASK:** Hvis funnet krever intern dokumenteier, avtalekopi, rådata, møtereferanse eller bruksrett, opprett eller oppdater DASK i `docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md`.
5. **AASK:** Hvis funnet senere krever aktørbekreftelse, forbered AASK i samme fil. AASK er actor validation-forberedelse, ikke ekstern outreach.
6. **PCQ og source-shortlist:** Bare kilder med tydelig locator, bruksrett og intern status kan gå videre til `docs/project/mandates/primary-check-queue-food-tg-v0.1.md` eller `docs/project/mandates/source-shortlist-food-tg.md`.
7. **Claim-lock:** Oppdater `docs/project/mandates/food-tg-claim-lock-table-2026-05.md` først når PCQ, DASK/AASK eller source-shortlist viser hvilken bruk som faktisk er trygg.
8. **Sprintboard:** Oppdater `docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md` sist, med neste gate og om saken er deckklart internt, på vent eller parkert.

## Minimumsfelt

| Felt | Krav | Bruk |
|---|---|---|
| ID | DRO- eller DRR-ID, eventuelt DASK/AASK/PCQ-ID | Gjør raden sporbar på tvers av mottak, dokumentask og claim-lock. |
| Case/tema | Caseanker, kildegruppe eller claim | Hindrer at løse funn flyter inn som generelle claims. |
| Source/output path | Filsti, URL, rapportnavn eller dokumenteier | Må gi praktisk locator før source-shortlist eller PCQ. |
| Eier | Person som kan svare for neste steg | Minimum Gabriel, Cathrine, JT, Thea eller annen navngitt eier. |
| Dato | Registreringsdato og eventuell frist | Bruk ISO eller norsk dato konsekvent i raden. |
| Status | Ett kontrollert statusord | Statusord må matche statusvokabularet under. |
| Locator | Filsti, URL, side/tabell/kapittel eller dokumentnavn | Trengs før et funn kan bli kilde, ikke bare inspirasjon. |
| Bruksrett | Intern, ekstern siterbar, trenger samtykke eller uklar | Uklar bruksrett stopper ekstern bruk. |
| Claim/case-bruk | Hvilken claim, casekort eller decklinje funnet kan støtte | Må være smalere enn hele Food TG-scope. |
| Neste gate | PCQ, DASK, AASK, source-shortlist, claim-lock eller parkert | Viser hva som må skje før bruk. |

## Statusvokabular

- `deckklart internt`: Kan brukes i intern JT-/TG-pakke med tydelig forbehold, men ikke som ekstern faktastemme uten claim-lock.
- `needs-primary-check`: Krever primærkilde, tabell, lovtekst, rapportkapittel eller datasett før videre bruk.
- `needs-actor-validation`: Krever actor validation, men AASK kan bare sendes etter separat outreach-gate.
- `watchlist`: Relevant indikasjon eller caseidé, men ikke prioritert for uke 25 uten ny beslutning.
- `parkert`: Skal ikke brukes i deck, rapport eller plattform før ny eier og gate er satt.
- `blocked-unsourced`: Mangler locator eller kildegrunnlag.
- `ready-for-PCQ`: Kan inn i PCQ fordi locator, eier, dato, status og bruksrett er registrert.

## Stoppsignaler

- Ingen kilde, case eller claim flyttes til source-shortlist, PCQ eller claim-lock uten DRO/DRR-rad.
- Ingen ekstern outreach åpnes fra denne protokollen; uttrykket ikke ekstern outreach gjelder både AASK, intervjuer, aktørkontakt og deling av deck.
- Actor validation er en senere review- og operatorsekvens, ikke et løfte om at aktørspørsmål kan sendes nå.
- Raw Deep Research-filer og Downloads-materiale holdes utenfor repoet til de har mottaksrad, locator og bruksregel.
- Claim-lock kan bare løftes når kildegrunnlag, bruksrett og status er avklart i riktig rekkefølge.
- Funn med uklar dokumenteier, uklar bruksrett eller juridisk sensitiv aktørtekst blir `parkert` eller `needs-actor-validation`.

## Repo-oppdatering

Oppdater filene i denne rekkefølgen når ny research kommer inn:

1. `docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md`
2. `docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md`
3. `docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md`
4. `docs/project/mandates/primary-check-queue-food-tg-v0.1.md`
5. `docs/project/mandates/source-shortlist-food-tg.md`
6. `docs/project/mandates/food-tg-claim-lock-table-2026-05.md`
7. `docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md`

Hver commit som importerer ny Food TG-research skal kunne forklare hvilke DRO/DRR-rader som ble oppdatert, hvilke kilder som fortsatt er sperret, og hvilke rader som eventuelt er deckklart internt.

## Ferdigdefinisjon

Et researchinntak er ferdig først når raden har eier, dato, status, locator, bruksrett og neste gate, og når sprintboardet viser om funnet er `deckklart internt`, `needs-primary-check`, `needs-actor-validation`, `watchlist` eller `parkert`. Ferdig betyr intern kontrollklar, ikke ekstern publiseringsklar.
