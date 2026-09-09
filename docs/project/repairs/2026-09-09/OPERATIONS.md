# Drift og sikkerhet, 9. september 2026

## Kontrollert før endringen

Produksjonen rapporterte `8badda09a65c15ccb0a21c3955d6f71c54d24ef6` fra
`/api/version` 2026-09-09T00:06:48Z. Skrivebeskyttet readback bekreftet
1615 dokumenter, 1770 klassifikasjoner, 60310 primærleveranser og null
kandidatrader/godkjenningsvedtak. Databasen og de eksisterende tekniske sideportene
svarte positivt. Dette er driftstall, ikke bevis på datakvalitet eller fullførte brukerreiser.

## Estate-backup

Ny kvittering: `config/production-backup-receipts/food-systems-pgvector-db-2026-09-09.json`.
Den er avledet fra Estate-manifestet `MANIFEST-COOLIFY-v1.tsv`, linje 852,
for eksakt database `l0s8o8oo00c8gossw0gksswk` og kildecommit
`8e346e8329b948f326d6ffe3a3935b74a829d85d`.

Artefakt: `coolify-food-systems-pgvector-db-20260908-013009-970359.dump.age`,
21509577 bytes, SHA256
`1ac2b06567ed65b1d2db657692948fc397a558715ebecb7a1c8fec031a05d87a`.
De faktiske lokale krypterte bytes ble kontrollsummert og samsvarte.
Estate registrerte backup/offsite 2026-09-08T01:30:30Z og gjenoppretting
2026-09-08T01:30:26Z; både iCloud og S3 har verified i det åpnete manifestet.
36-timersverifier besto ved innlesning. Denne kontrollen kjørte ikke en ny restore
eller et nytt nettverksreadback av offsitekopiene; den kontrollerte ferske,
artefaktbundne bevis fra det systemet som eier sikkerhetskopieringen.

Den tidligere kvitteringen fra 4. september bevares. Import-workflowen peker til
ny kvittering og beholder samme aldersgrense. Kvitteringen utløper som før;
fremtidig datamutasjon krever et nytt ferskt Estate-bevis. Ingen aldersgrense er
utvidet og ingen backupport er fjernet.

Coolify-watcheren rapporterer fortsatt egne scheduler-tall som diagnostikk.
Disse er allerede tatt ut av feilbetingelsen og beskrives uttrykkelig som et annet
system enn Estate. PR #381 er derfor historisk handover, ikke en ny datamigrasjon.

## Sikkerhetsoppdatering

Fersk npm-audit fant 4 berørte pakker: Next, sharp, Hono og js-yaml.
Next og eslint-config-next er oppdatert til 16.3.4. Låsefilen oppdaterer de
berørte underavhengighetene. Npm rapporterte null varsler etter oppdatering.
Full bygg-, type- og regresjonskontroll dokumenteres i leveranserapporten.

Primærvarsler: [Next AVIF](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4),
[sharp/libheif](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c),
[Hono toSSG](https://github.com/honojs/hono/security/advisories/GHSA-gqvv-2mrq-wpjv).
De tidligere avgrensede Prisma-overstyringene beholdes.

## Lokal kjøretid

`RUNTIME-CLOSURE.md` viser ny eksakt Node/llhttp-forsegling og videre kontroll
av PostgreSQL-/systembindingen. macOS-kontroll, Linux-CI, produksjonscontainer
og autentisert brukerflate dokumenteres hver for seg.

## Eldre PR-er

- #379: den brede gamle NOK-normaliseringen erstattes ikke blindt inn. Nåværende
  eksplisitte unitScale/amountCurrency og kildekontroller skal beholdes.
  Påstanden om brutt registry-source-match er avkreftet med eksisterende regresjonstest.
- #381: backup-handover avstemmes mot gjeldende Estate-eierskap og ny kvittering.
- #386: månedsrevisjon er et datert auditgrunnlag; det er ikke bevis på at funn er rettet.
- #359: mandatnotat til beslutningsmøte krever faktisk eierbeslutning.

Ingen eldre PR-er eller andre arbeidsgrener er slettet eller flettet inn automatisk.
