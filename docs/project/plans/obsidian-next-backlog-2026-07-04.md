---
tittel: Obsidian kunnskapskart - neste backlogg
dato: 2026-07-04
status: aktiv-backlogg
arbeidsflate: Food Systems Obsidian/
grunnlag:
  - docs/project/reviews/obsidian-kunnskapskart-assessment-2026-07-03.md
  - docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md
  - docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md
  - research/_status/food-tg-r14/r14-intake-index-2026-07-03.md
  - research/_status/food-tg-r14/claim-lock-kandidater.md
siterbarhet: intern
---

# Obsidian kunnskapskart - neste backlogg

## Kort konklusjon

Neste fase skal ikke bygge "mer kart" først. Den skal gjøre kartet brukbart som arbeids-cockpit:

1. Rydde hvordan mennesker starter og leser kartet.
2. Gjøre gaps, parkerte innsikter og R14-artefakter til en prioritert arbeidskø.
3. Korrigere de tydeligste datakvalitetsrisikoene før eksterne figurer eller app-løft.
4. Velge én liten ekstern/presentasjonsrettet leveranse først etter claim-lock.

## Nåstatus

- PR #240 er merget inn i `main` som vurderings- og statusartefakt.
- PR #242 lukket P0.1/P0.2: startsti for mennesker og lokal Obsidian config-policy.
- PR #243 lukket P1.1 for Orkla/Lilleborg 0 %-kanten; PR #244 la til bredere ikke-kontroll-semantikk for eierkanter.
- PR #245 lukket P2.1 som smal R14 claim-lock-delta for Rest AS, uten å åpne REKO/andelslandbruk som nåtidstall.
- PR #246 lukket P2.2 ved å nedgradere VK4-GAP-007 fra samlet 25-30 %-claim til N/P/K-arbeidsmatrise per strøm.
- PR #248 lukket P2.3 ved å bekrefte I28/I29/I30/I32/I33/I35 som parkerte datareview-/claim-lock-kandidater uten ny I-node-generering.
- PR #249 lukket P2.4 ved å prioritere actor-gate-spørsmål uten outreach: D2 først, D4 nummer to og D1/D3/D5 som samlet lokal/regenerativ metodepakke.
- PR #250 lukket P3.1 som intern briefing-pilot: 25-minutters møteflyt, svar på pilotspørsmålene, trygg språkpakke og neste beslutningsvalg.
- PR #251 legger P2.2 follow-up for VK4-GAP-007: primærkildekø per strøm og næringsstoff, uten å åpne 25-30 %-claim.
- VK-5-protokollen er lukket for intern cockpit-bruk.
- `vault:review-closeout` er forventet grønn så lenge VK-5-protokollen forblir lukket og alle review-rader er løst.
- Obsidian-grafen er et kuratert utsnitt, ikke hele kunnskapsbasen.
- All ekstern bruk av tall, aktør-/personpåstander og årsaksspråk krever claim-lock og siterbarhetsgate.

## P0 - rydd og cockpit-bruk

| ID | Arbeid | Hvorfor | Output | Gate |
|---|---|---|---|---|
| P0.1 | Startsti for mennesker | Assessmenten sier at kartet gir mening, men kan kjennes uklart uten lesesti. | Oppdatert `Welcome.md` og/eller egen "Start her"-note med fire innganger: HUB, Innsiktskart, Maktkart, Gap-register. | `npm run vault:sync && npm run vault:check` |
| P0.2 | Lokal Obsidian config-policy | Reviewen installerte plugins lokalt; lokale `.obsidian`-endringer skal ikke fortsette å dukke opp som støy. | Kort beslutning: hvilke `.obsidian`-filer trackes, hvilke holdes lokale/ignoreres. | Rent `git status`; eventuelt egen liten PR. |
| P0.3 | Backlogg-visning fra eksisterende kilder | Gap-register, I27+-parkering og R14-index ligger i flere filer. | Én operativ arbeidskø som peker til kildene uten å kopiere fulltekst. | `git diff --check` + lenker til eksisterende filer. |

## P1 - datakvalitet før publisering

| ID | Arbeid | Kilde | Neste handling | Stopplinje |
|---|---|---|---|---|
| P1.1 | Orkla/Lilleborg 0 %-kant | VK-5 canvas-review noterte at én kant viser `0 %`. | Kildesjekk Orkla/Lilleborg mot `data/vault-export/ownership-edges.json`, `data/konsern-coverage.json` og importkilde. | Ikke bruk Orkla-canvas eksternt før avklart. |
| P1.2 | Styredata-dekning for 13 konserntrær | VK-5 neste datainnsamling og R14 B1/B2. | Prioriter konsern med lav dekning og høy cockpit-verdi før full bredde. | Ikke konkluder nettverksmakt utover dekket populasjon. |
| P1.3 | Brreg-refresh for aldri-refreshede konsern | VK-5 neste datainnsamling og R14 B1/B2. | Kjør smal refresh på konkrete selskaper før bred refresh. | Ikke bland refreshed og ikke-refreshed status i samme eksterne claim. |
| P1.4 | M&A-events for NorgesGruppen-treet | VK-5 neste datainnsamling og R14 B3. | Lag verifikasjonsrunde for NG-treet før ny M&A-fortelling. | Ikke presenter "0 registrert" som funn før søkelogg er oppdatert. |

## P2 - claim-lock og innsiktskø

| ID | Arbeid | Kilde | Neste handling | Stopplinje |
|---|---|---|---|---|
| P2.1 | R14 claim-lock-kandidater | `research/_status/food-tg-r14/claim-lock-kandidater.md` | Åpne bare smale formuleringer med tydelig kilde og caveat. | Ikke si REKO/andelslandbruk som nåtidstall uten ny kilde. |
| P2.2 | VK4-GAP-007 næringsstoffgap | R14 claim-lock og gap-register. | Del opp N/P/K-massebalanse per strøm før claim. | Ikke si at 25-30 % er dokumentert norsk realisert gjenvinningspotensial. |
| P2.3 | Parkerte I27+-kandidater | `docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md` | Behandle I28, I29, I30, I32, I33 og I35 som egne små claim-lock/datareview-saker. | Ikke generer nye I-noder uten eksplisitt beslutning. |
| P2.4 | Actor-gate-pakker | R14 D1-D6. | Velg hvem som faktisk skal spørres først; lag spørsmålspakke før outreach. | Ikke merk actor-gate som validert før menneskelig svar eller primærkilde. |

## P3 - første leveranse ut av kartet

| ID | Kandidat | Fordel | Risiko | Anbefaling |
|---|---|---|---|---|
| P3.1 | Intern briefing for teamet | Lav risiko, høy læring. | Kan bli for generell hvis den ikke bruker konkrete spørsmål. | Lukket i PR #250 som briefing-pilot. |
| P3.2 | Temacanvas Sirkularitet som møtefigur | Tydelig og kompakt. | Krever claim-lock før ekstern bruk. | Bra etter P2.2. |
| P3.3 | `/graf` eller app-side | Kan gjøre kunnskapsbasen mer synlig. | Høyere teknisk kost og fort scope creep. | Vent til pilotspørsmålene er testet. |

## Pilotspørsmål

Bruk disse for å teste om kartet faktisk hjelper, før ny visualisering bygges:

1. Hva er de tre mest beslutningsnyttige gapene akkurat nå?
2. Hvilke gaps har kildegrunnlag nok til claim-lock, og hvilke er bare research-missions?
3. Hvilke aktører eller konsern er relevante for ett valgt gap?
4. Hvilke påstander må ikke brukes eksternt ennå?
5. Hvilken én figur tåler intern briefing uten å overclaim'e?

## Anbefalt rekkefølge

1. Lukket: P0.1 og P0.2 i PR #242.
2. Lukket: P1.1 i PR #243, med kantsemantikk fulgt opp i PR #244.
3. Lukket: P2.1/P2.2 i PR #245 og PR #246.
4. Lukket: P2.3 i PR #248.
5. Lukket: P2.4 i PR #249.
6. Lukket: P3.1 i PR #250.
7. P2.2 follow-up: N/P/K source-shortlist i PR #251.
8. Neste valg: G1 actor-gate eller I27+ datareview. P3.2 bør vente til teamet har valgt trygg intern figurflate.

## Verifikasjon per slice

- Vault-endringer: `npm run vault:sync && npm run vault:check`.
- VK-5/statusflater: `npm run vault:review-preflight && npm run vault:review-closeout`.
- Claim-/siterbarhetsendringer: `npm run audit:citable` og relevant claim-lock/source-locator-sjekk.
- Dataimport eller DB-endringer: kjør relevant import i isolert worktree med eksplisitt `DATABASE_URL` og dokumenter lokal vs CI-proof separat.

## Ikke gjør ennå

- Ikke bygg ny `/graf`-side før pilotspørsmålene viser konkret behov.
- Ikke gjør hele vaulten ekstern eller "presentasjonsklar".
- Ikke bland intern beslutningsverdi med publiserbarhet.
- Ikke la skjermbilder eller canvas bli nytt datagrunnlag.
