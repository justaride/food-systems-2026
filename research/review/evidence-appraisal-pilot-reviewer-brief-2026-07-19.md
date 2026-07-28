# Evidence Appraisal Pilot — reviewerbrief

## Formål og grense

Denne briefen klargjør tre kilder for navngitt menneskelig fulltekstvurdering.
Den forhåndsbestemmer ikke appraisal-resultatet og er ikke en attestasjon på at
kildene er lest. Maskinbeviset for filidentitet, sidekontroll og hash ligger i
`research/_status/evidence-appraisal-pilot-source-receipt-2026-07-19.md`.

## Reviewsett

| Target | Kildetype som må vurderes | Særskilt spørsmål |
|---|---|---|
| `SourceDoc:src-30` | ASKO corporate self-report | Hvilke tall er egenrapporterte, hva er målegrunnlaget, og hvor langt kan de generaliseres utover ASKO? |
| `SourceDoc:src-32` | NORSUS-rapport bestilt av Matvett | Hvilken populasjon og verdikjede dekker målingen, hvordan beregnes endringen, og hvilke følger får eksplisitt eksklusjon av landbruket? |
| `SourceDoc:src-45` | Oslo Economics-utredning bestilt av NorgesGruppen | Hvordan påvirker mandat, metodevalg og oppdragsgiver hvilke konkurransepåstander rapporten kan støtte? |

Spørsmålene er reviewprompter, ikke ferdige bias- eller kvalitetsdommer.

## Før review

1. Kontroller at hver PDF finnes på `reviewArtifactPath` i
   `research/review/evidence-appraisal-pilot-manifest.ts`.
2. Beregn SHA-256 og krev eksakt likhet med `expectedSourceHash`.
3. Les hele det hashbundne dokumentet, ikke bare ankret side eller lokal
   sammendragstekst.
4. Registrer reviewer med fullt menneskenavn og et faktisk UTC-tidspunkt.

## Felter som skal fylles per kilde

Manifestoppføringen skal først endres fra `pending_human_review` til
`human_review_complete` når revieweren kan stå inne for alle feltene:

- `status`, `basis`, `studyDesign` og eventuell `studyDesignDetails`
- `methodologySummary` og `sampleOrCoverage`
- `applicability`, `applicabilityContext` og `applicabilityNotes`
- `limitationsStatus`, konkrete `limitations` og `limitationsNotes`
- `riskOfBias` og `riskOfBiasNotes`
- `framework`, `frameworkVersion` og `reviewMethod`
- `reviewedSourceHash`, `reviewedBy` og `reviewedAt`
- eventuell `notApplicableReason` og `notes`
- korrekt ordrett `attestation` fra workflow-kontrakten

Ikke bruk `TBD`, generiske standardtekster eller Codex/AI som revieweridentitet.

## Kontrollrekkefølge

```bash
npm run review:evidence-appraisal:template-check
npm run review:evidence-appraisal:dry-run
```

Etter ferdig menneskereview skal første kommando vise
`readyForDatabaseDryRun=true`. Dry-run skal deretter kontrolleres rad for rad,
inkludert kilde-, citation-, hash- og appraisal-snapshots. Database-apply krever
fortsatt den eksakte planhashen og den eksplisitte ACK-en som runneren skriver
ut; denne briefen gir ikke slik autorisasjon.

## Minimum for en brukbar vurdering

En appraisal er ikke et kvalitetsstempel. Den skal gjøre kildens metode,
dekning, anvendelighet, begrensninger, mulige skjevheter og tillatt bruk
etterprøvbar. Selv en gjennomgått kilde forblir blokkert for en konkret claim
dersom claim-ankeret, citation-statusen eller måltilknytningen ikke består.
