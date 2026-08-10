# Nordisk prosjektlandskap: metode, schema og styrt kunnskapsinntak

Versjon/cutoff: `2026-08-10`

Status: intern beslutningsstøtte, kilde- og menneskeportet

Integrasjonsgrense: filbasert; ingen Prisma-, API-, UI-, database-, kontakt- eller publiseringsendring

Registeret er et vedlikeholdbart sammenligningsgrunnlag, ikke en påstand om en fullstendig Norden- eller verdenscensus. Hovedregisteret har nøyaktig 40 verifiserte, scorebare profiler for tidsserie-sammenlignbarhet. Longlisten er åpen og evidensstyrt.

## Leveranser

- `projects-2026-08-10.jsonl`: 40 verifiserte hovedprofiler.
- `longlist-2026-08-10.jsonl`: kandidater, avvisninger, duplikater og seed-disposisjon; aldri rangert.
- `sources-2026-08-10.jsonl`: claim-/feltkoblet kilde- og inntaksregister.
- `search-log-2026-08-10.jsonl`: søk, dekning, treff, avvisning og stopregel.
- `schema-2026-08-10.json`: JSON Schema for alle fire radtyper.
- `report-2026-08-10.md`: reproduserbar norsk rangering og porteføljevurdering.
- `../../scripts/validate-project-landscape.ts`: strukturell og semantisk validator.
- `../evidence-pack/project-landscape-2026-08-10/`: lenke-/lokator-manifest og kildeavgrensede analysenotater; ingen rå PDF-er.

## Analyseenhet og entitetstype

`entityKind` er obligatorisk og skiller `project`, `programme`, `platform`, `dataset`, `model`, `network`, `framework` og `repository_reference`. Ulike entitetstyper kan sammenlignes, men skal aldri fremstilles som om de leverer det samme. Organisasjoner ligger i `organisations`; de er ikke egne rangerte prosjektprofiler.

Et hovedprosjekt har:

- `geography` og `coverage` for land, sted, urfolksregion, verdikjede og tema;
- `lifecycle` med datoer, siste dokumenterte aktivitet og statuskilder;
- strukturerte `methods`, `dataAssets` og `outputs`, alle med kilde-ID-er;
- `qualitativeProfile` for deltakergrupper, kunnskapstyper, medvirkningsnivå og etikk/rettigheter;
- claim-koblede `qualitativeFindings`;
- `evidence.fieldSources` for sentrale felt;
- `analysis` med strategisk score og separat evidensscore.

## Evidensstatus og kvalitative funn

Tillatte funntyper er:

`barrier`, `enabler`, `tension`, `reported_outcome`, `evaluated_outcome`, `failure`, `unintended_effect`, `transferable_practice`, `open_question`.

Evidensstatus skiller:

- `owner_reported` / `project_reported`: prosjektets egen fremstilling;
- `documented`: kilden dokumenterer feltet, uten at den er en evaluering;
- `independently_documented`: uavhengig dokumentasjon av den konkrete påstanden;
- `internal_analysis`: Food Systems 2026s egen syntese;
- `human_gate`: krever navngitt menneskelig, samtykke- eller rettighetsbeslutning.

Resultater omtales som «rapportert» inntil en faktisk uavhengig evaluering foreligger. En finansieringsportal kan være uavhengig metadata-kilde, men er ikke automatisk uavhengig effektevaluering.

## Kilderegister

Hver kilderad har:

- `sourceClass`: `primary`, `secondary`, `dataset` eller `unknown`;
- `verificationStatus`: verifiseringsgrad;
- `citationReadiness`: om påstanden kan siteres, krever note, bare er intern kontekst eller er blokkert;
- `role`: `owner_primary`, `funder_registry`, `method_result`, `independent_evaluation` eller `discovery_only`;
- `independence`: `owner`, `affiliated`, `independent` eller `unknown`;
- publiserings-/tilgangsdato, eksakt `locator`, `supports`-koblinger, arkiv-/lokalsti, hash, lisens, rettighet og inntaksstatus.

`corroboratingSourceIds` kan bare inneholde kilder med `independence=independent`. Validatoren avviser samme domene som eier-/prosjektnære primærkilder. Uavhengighet vurderes per konkret kilde og claim, ikke ved å telle antall lenker.

Rå PDF-er lagres ikke i Git. Når et lovlig tekstuttrekk senere arkiveres, skal `localPath`, SHA-256, lokator, lisens/rettighetsstatus og claimkobling fylles ut. En tom lokalsti betyr lenke-/metadatafangst, ikke innholdservervelse.

## Strategisk score

`priorityScore` beregnes som:

```text
0,20 * directOverlap
+ 0,15 * complementarity
+ 0,15 * nordicRelevance
+ 0,15 * qualitativeDepth
+ 0,15 * learningNovelty
+ 0,10 * transferability
+ 0,05 * maturity
+ 0,05 * collaborationPotential
```

Alle dimensjoner bruker forankret 0–5-rubrikk:

| Dimensjon | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Direkte overlapp | ingen | perifer | ett støttefelt | flere støttefelt | nær kjernefunksjon | samme kjerneproblem og analyseenhet |
| Komplementaritet | ingen | marginal | avgrenset ressurs | tydelig metode/data | fyller prioritert hull | unik, handlingsklar utfylling |
| Nordisk relevans | ingen | indirekte | europeisk overførbar | ett nordisk spor | flere nordiske land | eksplisitt nordisk/Sápmi-kjerne |
| Kvalitativ dybde | ingen | omtalt | enkel konsultasjon | dokumentert kvalitativ metode | flere deltakergrupper/metoder | dyp, deltakende og rettighetsbevisst |
| Læringsnyhet | kjent | liten | inkrementell | ny kombinasjon | vesentlig nytt perspektiv | endrer problem-/løsningsforståelsen |
| Overførbarhet | ikke overførbar | svært kontekstavhengig | prinsippnivå | metode kan tilpasses | artefakter/praksis kan brukes | dokumentert replikerbar med vilkår |
| Modenhet | idé | tidlig plan | aktiv pilot | aktiv leveranse | flere leveranser | stabilt, dokumentert og vedlikeholdt |
| Samarbeidspotensial | ingen | usannsynlig | mulig | komplementære roller | klar gjensidig verdi | konkret, rettighetsmessig mulig inngang |

`evidenceScore` står separat og er summen av fem binære porter:

| Poengport | Krav |
|---|---|
| 1 | eier-/registerkilde dokumenterer både identitet og livsløpsstatus |
| 1 | alle obligatoriske hovedfelt har minst én feltkoblet kilde |
| 1 | verifisert metode-/resultatkilde støtter metode, data, leveranse eller kvalitativ profil/funn |
| 1 | minst én uavhengig corroborerende kilde fra annet domene enn eier/prosjekt |
| 1 | verifisert `independent_evaluation` støtter leveranse eller kvalitativt funn |

Mange eierkilder øker ikke scoren automatisk. `5/5` kan ikke oppnås uten en faktisk verifisert, uavhengig evaluering.

## Dekningskrav

Hovedregister og rapport skal vise Norge, Sverige, Danmark, Finland, Island, Sápmi og minst én av Grønland/Færøyene/Åland. Tematisk kreves produksjon, foredling, distribusjon, forbruk/helse, sjømat, lokalmat, sirkularitet, beredskap, makt/governance og data/modeller. En celle kan være dekket av verifisert profil eller eksplisitt merket som hull; validatoren krever den avtalte minimumsdekningen og søkelogg for land/Sápmi.

## Arbeidsflyt og promotering

Normal flyt:

```text
discovered → identity_resolved → metadata_verified → content_acquired
→ extracted → analyst_reviewed → eligible_main
```

Sideutfall: `duplicate`, `not_same`, `source_blocked`, `human_gated` eller `reference_only`.

Promotering til hovedregister krever samlet:

1. stabil ID og løst identitet/entitetstype;
2. eier- eller registerbevis for navn, organisasjon og status;
3. konkret statuskilde og siste dokumenterte aktivitet;
4. strukturerte metoder, dataressurser og leveranser med feltkilder;
5. dokumentert geografi og dekningsceller;
6. kvalitative funn med kilde-ID og evidensstatus;
7. rettighets- og sitatstatus;
8. analyst review og korrekt score;
9. fjerning fra longlisten i samme endring;
10. grønn validator og regenerert rapport.

En kandidat på longlisten kan aldri rangeres. `eligible_main` er et kortvarig reviewutfall før den faktisk flyttes; validatoren tillater ikke statusen å bli stående på longlisten.

## Søk og stopregel

Hvert søkepass logger spørring, portal, geografi, perspektiv, dato, antall undersøkte resultater, nye kandidater, promoteringer, duplikater, avvisninger med begrunnelse og dekningsceller.

En kildeklasse kan bare stoppes når:

1. pass 1 er dokumentert;
2. pass 2 gir null nye kvalifiserte Tier A/B-treff;
3. pass 2 har `stopRuleMet=true` og en konkret begrunnelse;
4. alle avtalte dekningsceller har evidens eller et eksplisitt dokumentert hull.

Stopregelen betyr at det avtalte søkepasset er mettet ved cutoff. Den betyr ikke at alle relevante prosjekter finnes.

## Vedlikehold, staleness og review

- Behold datert versjon uendret etter cutoff; ny kunnskap får ny datoversjon.
- Re-sjekk aktive prosjekter når `lastActivityDate` er eldre enn 12 måneder, og planlagte/aktive kandidater når kilden endrer status.
- Endre bare claimene den nye kilden faktisk støtter. Ikke oppgrader hele prosjektets evidensstatus samlet.
- Oppdater først kilde, deretter feltkobling/funn, score, search-log og rapport.
- Kjør rapportgenerator før validator; validatoren avviser rangering eller tabeller som ikke kan reproduseres.
- Completion-registeret forblir kanonisk statusflate for kilde-, menneske- og publiseringsporter. Dette landskapet peker til den prosessen og er ikke et parallelt sannhetsregister.

## Intervju- og workshopport

Ingen kontaktes i denne leveransen. Et senere opplegg må minst angi:

- målgruppe og representasjonsbegrunnelse;
- konkret kunnskapshull som åpne kilder ikke dekker;
- informert samtykke og mulighet for tilbaketrekking;
- dataeierskap, tilgang, lagringstid og sletting;
- urfolks-/lokalsamfunnsrettigheter og eventuell kollektiv godkjenning;
- separat sitatgodkjenning og publiseringsport.

Aktuelle grupper er samiske kunnskapsbærere, lokale produsenter/foredlere, REKO-administratorer, forbrukere, beredskapsaktører og offentlige innkjøpere. Dette er behovsbeskrivelser, ikke kontaktlister.

## Feltmapping uten apply

Filene er kun kandidatgrunnlag for eksisterende modeller:

| Landskapsfelt | Mulig eksisterende mål | Port |
|---|---|---|
| kilde-ID, URL, lokator, claimstatus | `SourceCitation` | claim-review og citation-readiness |
| lovlig lokalt uttrekk, hash, lisens | `Document` | rights, hash og eksplisitt importbeslutning |
| intern score/syntese/funn | `LibraryAnalysisRecord` | analyst review og human gate |

Det kjøres ikke `--apply`. Eksterne prosjekter skal ikke presses inn i `Actor` eller `ProjectTask`; repoet mangler en egnet ekstern prosjektmodell.

## Kjøring

```bash
npm run landscape:report
npm run landscape:validate
npm run test:landscape
```

Full akseptanse inkluderer også `npm test`, TypeScript/lint, `git diff --check` og `npm run audit:research-artifacts -- --base=origin/main`.
