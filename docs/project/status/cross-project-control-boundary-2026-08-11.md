---
tittel: Food Systems 2026 — grense mot GabiBFree portefølje- og driftskontroll
dato: 2026-08-11
status: kontrollert intern driftskvittering
gate: internal
---

# Grense mot GabiBFree Dashboard

## Autoritetsdeling

Food Systems eier prosjektets faglige sannhet: completion-status,
informasjonsgap, kilder, appraisal, claims, arbeidskø og publiseringsporter.
GabiBFree Dashboard eier portefølje- og infrastruktursannheten: hvilke
ressurser som kjører, backup, offsite-kopi, restore-bevis og avvik på tvers av
prosjekter.

| Spørsmål | Kanonisk flate |
| --- | --- |
| Hva er faglig levert eller åpent? | `food-systems-completion-register-2026-07-15.md` |
| Hvilke gap og menneskeporter finnes? | `information-gap-register-2026-08-11.jsonl` |
| Hva kjører, og hvor? | GabiBFree `/systems/estate` |
| Er databasen sikret og gjenopprettbar? | GabiBFree `data_asset_proofs` og `MANIFEST-COOLIFY-v1.tsv` |

GabiBFree kan vise peker, datert sammendrag og neste menneskeport. Det skal
ikke kopiere Food Systems-oppgaver, gaprader, claims, kildestatus,
migrasjonsledger eller publiseringsbeslutninger. Food Systems skal på sin side
ikke bruke Coolifys egne backupplaner som fasit når den sentrale backupkjeden
ligger i GabiBFree.

## Korrigering av backupbildet

Den tidligere PR #342-preflighten fant 0 Coolify-native backupplaner. Det var
korrekt for Coolify, men ikke et korrekt svar på om Food Systems-databasen har
backup.

GabiBFree Estate binder produksjonsdatabasen til asset
`coolify:l0s8o8oo00c8gossw0gksswk`. En full 26-måls kjøring 2026-08-11 fra
publisert GabiBFree `main` på commit
`61e158e95d0c9da49821989450ee95ead9903aca` endte med exit `0` og skrev 75
Estate-bevis for 25 dataressurser. Den registrerte følgende immutable Food
Systems-kvittering:

| Felt | Verdi |
| --- | --- |
| Artefakt | `coolify-food-systems-pgvector-db-20260811-095016-7ed6da.dump.age` |
| Kryptert SHA-256 | `643af599714e2959d7603e2fe9b29806df405d643369d12891155173484775ed` |
| Backup registrert | `2026-08-11T09:50:31Z` |
| Restore bevist | `2026-08-11T09:50:28Z` |
| iCloud/offsite | `verified` |
| S3/R2/offsite | `verified` |

GabiBFree-databasen har separate `backup`, `restore` og `offsite`-bevis for
samme asset, artefakt og hash. Dette lukker den tekniske påstanden «ingen
off-node backup/restore finnes».

Den releasebundne kjøringen etter kunnskapsreconciliation og rolleherding
bekreftet dessuten artefakten
`coolify-food-systems-pgvector-db-20260811-125323-b91c5a.dump.age`, SHA-256
`8055e332115d65313e22cb1f18fdeacf995665ac31eb3fafb3bb458f2a413738`,
restore `2026-08-11T12:53:39Z` og begge offsite-mål som `verified`. Detaljert
release-readback står i
[produksjons- og kunnskapskvitteringen](./food-systems-production-release-receipt-2026-08-11.md).

## Det som fortsatt er åpent

`IG-003` er ikke helt lukket. Følgende styrings- og driftsporter gjenstår:

- navngitt systemeier og dataoperatør;
- vedtatt RPO/RTO og retensjonskrav;
- kvittering fra første uovervåkede 03:30-kjøring på publisert hovedgren;
- neste planlagte restore-test og eieraksept.

Den avgrensede PR #342/#346-releasen er gjennomført etter fersk backup,
ledger-/schema-reconciliation, minst privilegert `MIGRATION_DATABASE_URL` og
eksakt-SHA runtime-readback. Dette lukker `IG-004`, men åpner ikke
publiserings-, fagreview-, personvern- eller langsiktig driftsport. `IG-003`
forblir åpen for RPO/RTO, eier, retensjon og uovervåket kadens.

## Vedlikeholdsregel

Denne fila er en datert releasekvittering, ikke et levende backupregister.
Gjeldende backupstatus leses i GabiBFree Estate. Ved hver risikofylt migrasjon
lagres bare en ny immutable kvittering med asset key, artefakt, hash,
restore-tidspunkt og kildecommit; løpende backupstatus kopieres ikke hit.
