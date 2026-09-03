---
tittel: Backup-gaten spør feil system — handoff til GabiBFree
dato: 2026-08-26
status: handoff, venter på svar fra GabiBFree
gate: internal
---

# Backup-gaten spør feil system

CI-gaten som skal kreve fersk backup før en prod-mutasjon spør Coolify om
backupplaner. Den kjeden ligger i GabiBFree Estate, ikke i Coolify — så gaten
kan aldri passere, og alle muterende prod-targets i Food Systems står låst.

Dette dokumentet er en datert handoff, ikke et levende register. Samme
vedlikeholdsregel som [grensedokumentet](./cross-project-control-boundary-2026-08-11.md):
gjeldende backupstatus leses i GabiBFree Estate.

## Det vi ber om

1. **Et grensesnitt CI kan lese.** Gitt asset-nøkkelen
   `coolify:l0s8o8oo00c8gossw0gksswk` — returner siste backup-, restore- og
   offsite-bevis med tidsstempel, i noe en GitHub Actions-jobb kan hente og
   sjekke fail-closed. Endepunkt, signert artefakt eller committet manifest;
   formen bestemmer GabiBFree.
2. **Kjører 03:30-kadensen uovervåket nå?** Grensedokumentet lister «kvittering
   fra første uovervåkede 03:30-kjøring på publisert hovedgren» som åpen under
   `IG-003`. Svaret avgjør om et ferskhetskrav i det hele tatt er meningsfullt.
3. **Hva er faktisk RPO?** Gaten krever i dag under 36 timer. Er den reelle
   kadensen døgnlig, er 36 t riktig; er den ukentlig, er kravet en garantert
   blokkering. `IG-003` har RPO/RTO som åpen post.

## Hva som utløste dette

To muterende kjøringer mot prod ble stoppet på steget
`Require a recent successful off-node backup before mutation`:

| Kjøring | Target | Utfall |
| --- | --- | --- |
| 2026-08-25 21:45 | `leroy-duplicate` | stoppet på gaten |
| 2026-08-26 | `financial-units` | stoppet på gaten |

Begge feilet med `COOLIFY_API_TOKEN is required`. Det er en egen feil:
workflowen leser `secrets.COOLIFY_READ_API_TOKEN`, mens repoet har
`COOLIFY_API_TOKEN` — som også er navnet de tre andre Coolify-workflowene
bruker. Men den feilen maskerte den egentlige: selv med et gyldig token spør
gaten Coolify om noe Coolify per design ikke vet.

## Dette er ikke en backup-mangel

Førstelesningen i denne gjennomgangen var «prod har ingen backup», basert på at
Coolify viser *No scheduled backups configured* på prod-databasen. Det er den
samme feilslutningen som PR #342-preflighten gjorde, og som grensedokumentet
ble skrevet for å rette: **null Coolify-native planer er forventet, ikke et
avvik.** Food Systems skal ikke bruke Coolifys egne backupplaner som fasit.

Siste kvittering vi kjenner er fra 2026-08-11: artefakt
`coolify-food-systems-pgvector-db-20260811-125323-b91c5a.dump.age`, restore
bevist `2026-08-11T12:53:39Z`, begge offsite-mål `verified`. Om noe nyere
finnes vet vi ikke — det er derfor vi spør.

## Hva gaten krever i dag

Steget kaller `GET {COOLIFY_BASE_URL}/api/v1/databases/{DB_UUID}/backups` med
CF Access-headere, og krever at minst én execution oppfyller alt følgende.
Erstattes kilden, er dette kontrakten som må gjenskapes:

- `schedule.enabled === true`
- `schedule.save_s3 === true` — lokal backup teller ikke
- `execution.status === 'success'`
- `execution.s3_uploaded === true`
- `execution.filename` ikke tom
- `execution.size > 0`
- `created_at` innenfor 36 t (repo-variabel `DB_BACKUP_MAX_AGE_HOURS`)

Kravene er formet etter Coolifys datamodell. Vi forventer ikke at Estate
speiler feltnavnene — det vi trenger å kunne avgjøre er: finnes det et bevist,
off-node backup av denne asseten, og hvor gammelt er det?

## Identifikatorer

| Felt | Verdi |
| --- | --- |
| Asset-nøkkel | `coolify:l0s8o8oo00c8gossw0gksswk` |
| Prod-Postgres | `l0s8o8oo00c8gossw0gksswk` |
| App-container | `so8ko44goccc8gcgswwscgco` |
| Coolify-prosjekt | `jwcokgg8840sc00k4w0gok8k` |
| Miljø (production) | `ow4wwk4gswg4ow8s88k00go8` |
| Coolify | `https://coolify.gabistudio.dev` (bak CF Access) |
| Vert | Hetzner `77.42.43.227` |
| Repo | `justaride/food-systems-2026` |
| Workflow | `.github/workflows/prod-data-import.yml` |

**Én felle verdt å kjenne til.** Prod-Postgres ligger i en container som
*heter* `food-systems-pgvector-db`. Coolify har i tillegg en container ved navn
`food-systems-db` (`ks8sks4oo4k4gk8c080sk0ko`) som prod **ikke** bruker.
Navnene inviterer til å «rette» UUID-en til feil database — det skjedde i denne
gjennomgangen før infrastrukturkartet korrigerte det.

## Hva Food Systems gjør på sin side

Vi skriver om gaten til å konsultere det grensesnittet GabiBFree peker på, i
stedet for Coolifys `/backups`. Vi avklarer også tokennavnet, slik at alle fire
Coolify-workflowene bruker samme hemmelighet.

Inntil da holder vi muterende prod-targets stengt. To endringer venter:
enhetsnormaliseringen av `CompanyFinancial` (162 rader, tørrkjørt og verifisert)
og Lerøy-duplikatet. Ingen av dem haster nok til å omgå gaten.

## Hva vi selv har sett, og ikke

**Verifisert direkte.** Coolify-dashbordet 2026-08-26: «No scheduled backups
configured» på både `l0s8o8oo00c8gossw0gksswk` og `ks8sks4oo4k4gk8c080sk0ko`.
De to blokkerte kjøringene og feilmeldingen deres. Hemmelighetsnavnene i repoet.

**Sitert fra dokumentasjon.** Estate-bevisene fra 2026-08-11 og
`IG-003`-postene er lest fra grensedokumentet — ikke bekreftet mot Estate selv.

**Ikke undersøkt.** Om andre prosjekter på samme Coolify-vert har samme
situasjon. Vi så bare `food-systems-2026`. Gitt at porteføljeoversikt er
GabiBFrees mandat, er det kanskje verdt et blikk.
