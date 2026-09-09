# Datamodell og gjenbrukbar intern review

Runde003 er en lokal, kandidatbasert analysepakke. Den har ingen databaseimport. Domenefunnene beholder originale ID-er og forskjellige måleoppsett; [analysis-model.json](analysis-model.json) kobler dem til kjeder med eksplisitte ukjente.

## Modellens enhet

Hver kjede følger node → flyt → avhengighet → forstyrrelse → tiltak → utfall. Den beskriver én mottakerfunksjon under ett scenario. Hvert ledd peker til observasjoner; hver observasjon har full versjonshash og kildenes rå-/teksthasher. Et scenariovalg er et analytisk forslag, ikke en kildeobservasjon. Ukjent utfall har `value:null` og begrunnelse. Rapportert produksjon, forsøksrespons, øvelsesutfall og veiledning beholder ulike evidenstyper.

Enheter og perioder følger variabelen. Total-P i produkt, plantetilgjengelig P og opptatt P er separate variabler. Tilberedt porsjon er ikke dokumentert konsum. Stasjonsandel er ikke andel vannvolum. To inkompatible kildeledd kan stå i samme undersøkelseskjede uten at de blir en sammenhengende målt strøm. Det kan ikke beregnes en effekt fra dem før parti, periode, kvalitet og mottaker er koblet.

| Analyseartefakt | Eksisterende kandidatgrense ved eventuell senere innføring |
|---|---|
| Bevart kilde og lest tekst | `CandidateContentUnitInputSchema`; ny kildeversjon og rettighets-/innholdsbinding må kvalifiseres. |
| Run, policy og interne kvitteringer | `CandidateAnalysisRunInputSchema`, artefakter og run-events; denne rundens kvittering gir ingen produksjonskvalifisering. |
| Observasjon og avgrensning | `CandidateAssertionInputSchema`; hele påstanden, perioden og enheten følger versjonen. |
| Kildepeker og lokator | `CandidateEvidenceLinkInputSchema`; rå-/tekstversjon og leseomfang må følge. |
| Kjedeavhengighet | `CandidateDependencyInputSchema`; observerte ledd og hypoteser må holdes atskilt, med sykelkontroll. |

Kartleggingen er kontrollert mot `src/lib/knowledge/candidate-analysis-contract.ts` og writerens append-grensesnitt. Det er en modellkobling, ikke ferdige eller validerte DB-inputobjekter. Eventuell kandidatinnføring skal gå gjennom `src/lib/knowledge/candidate-analysis-writer.ts`. Ingen generisk upsert eller muterende SQL er brukt. Menneskelig review og promotering forblir separate, eksakt hashbundne handlinger.

## Hva køen gjør

`scripts/run-beredskap-review-queue.py` kjører den eksisterende kvitteringsverifikatoren på en avgrenset, eksplisitt JSON-kø. Manifestet binder pakkehash, verifierhash og policyhash. Hver kjøring krever en ny outputmappe og lager resultat per jobb og samlet feilstatus. Endret innhold skal vurderes på nytt; å oppdatere hash alene er ingen faglig review.

Køen gjør ingen modellkall. De faktiske KI-lesingene er utført i denne oppgaven og dokumentert i domenepakkene; scriptet kontrollerer integritet og dekning av kvitteringene. Dette er en gjenbrukbar lokal kontroll, ikke en kontinuerlig produksjonstjeneste, uavhengig modellvalidering eller attestasjon på sannhet. Se [runnerens bruk og testede begrensninger](REVIEW-QUEUE.md).

## Endring og ny vurdering

Ved endret påstand, tall, enhet, periode, råfil, tekst eller policy bevares tidligere kvittering. Nytt run får ny baseline, review og privat outputmappe. En faktisk vurdering kan ende med motsigelse eller utilstrekkelig evidens; teknisk vellykket innhenting er ikke et støtteutfall. Den gamle Luna-piloten er fortsatt separat historikk. Bibliotekets tidligere 1 770 poster er ikke brukt som dagens verifiserte populasjon eller som bestilling av et fullt løp.

For å utvide runden må arbeidet navngi hvilken påstand eller kjedekobling som kan endres, ny direkte kildeinngang og stoppregel. De fire fôrartiklene mangler fortsatt full metode etter en avgrenset ny tilgangsrunde. Nye generelle søk uten ny inngang er ikke neste oppgave.
