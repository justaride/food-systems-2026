# Food TG Meeting Transfer QA 2026-05-28

**Status:** Intern QA-lukking av møte- og metodeoverforing
**Readiness label:** intern metodepakke klar med forbehold; ikke eksternt validert; ikke claim-lukket
**Scope:** Kontrollerer hva fra Food/Cities-motene faktisk er registrert i Food, og hvilke porter som fortsatt er apne for bruk i deck, rapport, whitepaper og apptekst.

## Kort Konklusjon

Food-checkouten har allerede de viktigste Food-relevante delene av Cities/JT-sporet:

- mote 9 er registrert som cross-project intake, ikke formelt Food TG-vedtak
- Wageningen/Moerman/R9 er registrert som intern metode- og gatesprakpakke
- `SRC-B-035` har Food-local locator-ledger, men fortsatt ikke ekstern metodegodkjenning
- kandidatstrommene er scoret kvalitativt som pre-screen, ikke som effekt- eller pilotbevis

Det som gjenstar er lukking av canonical claim-koblinger og valideringsrespons. Ingen nye store motepakker bor flyttes fra Cities til Food for disse sporene for Food har lukket source-/claim-/validation-gatene under.

## Mote-Til-Artefakt Matrix

| Mote | Food-relevant beslutning eller diskusjon | Food-artefakt | QA-status |
|---|---|---|---|
| Mote 5, 13.04 | Fast prosjektdag, mandatbehov, partnerliste som eksempler, ingen partnerkontakt etter tildeling | `docs/meetings/MØTEOVERSIKT.md`; `docs/meetings/STATUS-2026-05-26.md` | Dokumentert som motehistorikk; post-21.04 formelle moter ikke bevist i repo |
| Mote 6, 13.04 | Verdikjedeanker, importavhengighet, alternativt for, matsvinn, regenerativt og akademia-til-skala-gap | `src/lib/data/meetings.ts`; Food TG sporbriefs og claim-register | Brukes som scope- og analysegrunnlag, ikke som ekstern kilde |
| Mote 7, 20.04 | R9 som teoretisk grunnlag, 7-10 sirkularitetssporsmal, alternativt for, matsvinnkvalitet og svartvann/nutrient-loop referanser | `src/lib/data/meetings.ts`; `src/lib/data/wageningen-method.ts`; case/claim-indeks | R9/Wageningen holdes som intern lens og gate |
| Mote 8, 21.04 | Food for bredt; prioriter fa spor med sirkularitetspotensial, finansieringsmulighet og pain points | `docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md`; control layer | Scope/minimumsvedtak er fortsatt port for outreach og statusloft |
| Mote 9, 26.05 | Cities/JT-overforing av Wageningen/Moerman/R9 til Food-local kontrollprosess | `docs/meetings/JT-GABRIEL - Metodeoverforing Cities Food mai 2026.md`; Wageningen control docs | Registrert som intake, ikke formelt Food TG-vedtak |

## Seks Lukke-Punkter Fra Siste Gjennomgang

| Punkt | Repo-status 2026-05-28 | Neste port |
|---|---|---|
| 1. Lukke `SRC-B-035` med side-, tabell- og figurlocatorer | Delvis lukket internt: `wageningen-source-locator-ledger-2026-05-26.md` har PDF-/rapportside-locatorer kontrollert mot lokal PDF i hovedcheckouten. | Ikke bruk sterkt eksternt metodeclaim for locatoren er koblet til konkret claimrad og bruksniva. |
| 2. Koble Wageningen/Moerman til konkrete Food claim-IDer | Lukkes i denne QA-pakken for `CL-B-008`, `CL-B-009`, `CL-B-021`, `CL-B-022`, `CL-B-023` og `CL-C-015`. | Hold alle seks som caveated/internal der canonical claim-status sier det. |
| 3. Bruke scorecard/gate pa kandidatstrommer | Finnes i `wageningen-initial-candidate-scorecards-2026-05-26.md`. | Bruk scorecard som valideringssprint-sporsmal, ikke som effektbevis. |
| 4. Holde Ghana/Costa Rica/Nederland som benchmark-caser | Lukket som sprakkontroll: Ghana/Costa Rica/Nederland er benchmark-only og ikke nordisk pilot- eller effektbevis. | Bare bruk dem til flaskehalslaering og metodeeksempler. |
| 5. Fa Food TG/eiere til a beslutte synlig metode, internt scoreverktøy eller vedlegg | Apent eierpunkt. Transferpakken ber eksplisitt Food velge mellom synlig metode, internt scoringstemplate, appendix eller parkert kildekandidat. | Krever Food TG/eierbeslutning etter minimumsvedtak. |
| 6. Oppdatere Circular stale peker | Food-status er na klar nok til a gi Circular en datert statuslinje. | Circular ma si at Food har pakken og QA-notatet, men source/claim/validation-lukking fortsatt er Food-eid. |

## Claim-Gate Kobling

`SRC-B-035` brukes bare som internt Wageningen/Elbersen-metodeanker for disse claimene:

| Claim | Wageningen-bruk | Ma ikke bety |
|---|---|---|
| `CL-B-008` | Kaskade og hoyverdig bruk ma vurderes per fraksjon, lovlig sluttbruk og systemgrense. | Universell rangering eller klimaeffekt. |
| `CL-B-009` | Designgate for ravarekvalitet, hygiene, stabilisering, lovlig sluttbruk og off-taker. | Pilotstatus basert pa volum. |
| `CL-B-021` | Okara/BSG og marint restrastoff holdes som kandidat/benchmark til eier, lov og kjoper er avklart. | Valgt forste pilot. |
| `CL-B-022` | Matsvinnkvalitet prioriteres for validation sprint nar baseline, tidsvindu, destinasjon og kontrafaktisk finnes. | Dokumentert effekt eller app-bevis. |
| `CL-B-023` | Nutrient loops holdes som benchmark/sekundaerspor med produktstatus, marked og massebalanse som port. | Lettvekts forste pilot eller N/P/K-effekt. |
| `CL-C-015` | KPI/datastandard krever definisjon, ar, geografi, enhet, kilde, dataeier, frekvens, baseline og systemgrense. | At WUR-score er KPI-effekt. |

Felles caveat: Wageningen/Elbersen-score kan stotte intern prioritering, men lukker ikke effekt, aktor, juridisk bruk, LCA, KPI eller ekstern validering.

## Kandidatgate Per Strom

| Kandidatstrom | Status etter scorecard | Trygg bruk na | Stoppsignal |
|---|---|---|---|
| Okara/BSG | Intern kandidat | Design- og valideringsspor for ren prosess-sidestrom | Ikke bruk pilotstatus uten ravareeier, food/feed-status, stabilisering og off-taker |
| Matsvinnkvalitet | Hoyest prioriterte valideringskandidat | Rask adoption-hypotese hvis partnerdata finnes | Ikke bruk "maltider reddet" som effekt uten baseline og kontrafaktisk |
| Marint restrastoff | Benchmark / sekundaerspor | Fraksjons- og hoyverdi-laering fra sjomat | Ikke kall forste lettvekts B-pilot |
| Nutrient loops | Benchmark / sekundaerspor | Produktstatus-, N/P/K- og governance-laering | Ikke promoter uten massebalanse, marked, lov og systemgrense |
| For/substrater / insektprotein | Blokkert pending substratgate | A/B-hypotese etter lovlig substratliste og kjoperkrav | Ikke si at kjokken-/matavfall, gjodsel/slam eller blandet avfall er lovlig substrat |

## Kontrollregel Videre

For Food TG-tekst, deck, rapport, whitepaper eller apptekst som bruker Wageningen/Moerman/R9:

- oppgi `SRC-B-035` locator eller konkret Food control doc
- oppgi claim-ID
- oppgi candidate/scorecard-rad nar det gjelder kandidatstrom
- oppgi caveat state: intern, caveated external eller hold tilbake
- oppgi apen validation gate og eierrespons som mangler

Ikke flytt flere store mote- eller Cities-pakker inn i Food for disse sporene for dette kontrollsettet er brukt i validation sprint og canonical claim-status er oppdatert med datert respons.
