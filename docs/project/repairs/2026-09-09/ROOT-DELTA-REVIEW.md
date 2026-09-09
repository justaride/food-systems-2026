# Uavhengig review av root-delta

**Kontrollert:** 2026-09-09. Dette er en teknisk og innholdsavgrenset
kontroll av root-endringene for person- og selskapspaginering, mediegrid,
sidetitler, samt synlighets- og ferskhetsrelatert tekst. Det er ikke en
ekstern eller menneskelig faglig godkjenning.

## Funn

Ingen materielle feil funnet i det kontrollerte deltaet.

- `PersonerContent` og `SelskaperContent` bruker samme lokale
  `useClientPagination`-kontrakt som resten av grensesnittet. Filterverdiene
  inngår i nøkkelen, slik at en ny filtrering starter på side 1. Bare
  `pagination.rows` rendres, og totalen beholdes i sidestatusen.
- Begge nye søkefelter har navngivning for hjelpemiddelteknologi. Personfilter
  eksponerer valgt tilstand med `aria-pressed`; selskapets select-filtre har
  egne etiketter. `ClientPagination` har navngitt navigasjon og en
  `role=status`-tekst for resultatintervall og side.
- Mediesidens fire endrede gridspor bruker `minmax(0, …)`. Det tillater at
  fleksible kolonner krymper innen gridet og endrer ikke innholdsrekkefølge
  eller tabellenes eksisterende horisontale rulling.
- De nye statiske `metadata.title`-verdiene er sidebestemte og konsistente med
  navigasjonsnavnene. Ingen påstand om datakvalitet eller ferskhet er lagt til
  i metadata.
- Ferskhetsteksten i eierskapsflaten skiller fortsatt mellom
  datakvalitetssnapshot og databasedata. Den kaller ikke Brønnøysund-datoen en
  ekstern validering.

## Målrettet kontroll

- `npx eslint` for de berørte person-, selskap-, media- og eierskapsfilene:
  bestått.
- `node --import=tsx --test tests/lib/ui-diacritics.test.ts`: bestått, 29 av
  29.
- `git diff --check`: bestått.

## Privat reconciliation-readback

`restlist/library-reconciliation/readback-v2.json` har
`transactionReadOnly: "on"`. Den rapporterer 1 770 poster og en union på 392
poster med lav tekstkvalitet. Den private arbeidslisten har schema
`library-analysis-missing-text-worklist/v1`, `count: 392` og nøyaktig 392
elementer.

Kontrollerte invarianter holder: reparasjonsmatrisen summerer til 392,
kildetypene summerer til 392, alle worklist-elementene er
`review_required`/`internal_background` med `low_text_quality` og
`wordCount < 150`, og `legacyInternalMarkOnMissingText` er 0. Dette er en
readback av privat arbeidsgrunnlag, ikke en endring av kandidatstatus eller en
H-port.

## Gjenstående kontrollgrense

Statisk og målrettet test dekker ikke visuell responsivitet i en faktisk
nettleser. Browser-verifisering gjenstår hos root som planlagt.
