# Sluttgjennomgang — library-analysis workflow 1.0.24

Dato: 2026-09-09
Omfang: kode- og migrasjonsgjennomgang; ingen databasekjøring eller produksjonsendring

## Konklusjon

Forward-migrasjonen
`prisma/migrations/20260909_library_analysis_prompt_1_0_24/migration.sql` er en
avgrenset erstatning av `public.candidate_worker_append`. Sammenlignet med
1.0.23 endrer funksjonskroppen bare:

- workflow- og promptversjon fra `1.0.23` til `1.0.24` for analyseprofilen;
- workflow- og promptversjon fra `1.0.23` til `1.0.24` for valideringsprofilen;
- de fire tilhørende innholdshashene.

De fire nye hashene samsvarer med profilene i
`src/lib/knowledge/candidate-analysis-contract.ts` og med SHA-256 av de fire
gjeldende workflow-/promptfilene. `candidate_only`-profilen er uendret.

## Autoritet, historikk og idempotens

Migrasjonen bruker `CREATE OR REPLACE FUNCTION` og inneholder ingen `GRANT`,
rolleoppretting, DML eller tabellendringer. Den utvider dermed ikke PUBLIC- eller
worker-autoritet og skriver ikke om historiske runs, candidates eller reviewvedtak.
PostgreSQL beholder funksjonens eksisterende eierskap og privilegier ved
`CREATE OR REPLACE`; foundation-migrasjonens `REVOKE ... FROM PUBLIC` består.
Gjentatt kjøring erstatter funksjonen med samme definisjon og gir ingen datadelta.

Writer-operasjonene, inputskjemaet, scope-, config-, input-envelope- og
idempotency-kontrollene, append-only historikkreglene, dependencykontrollene og
kravet `promotionState = 'candidate'` er identiske med 1.0.23 etter normalisering
av de seks tillatte profilfeltene.

## Modellkvitteringer og CLI-fixture

Kvitteringsskjemaet tillater nå eksplisitt `gpt-5.6-luna`, `gpt-5.6-sol` og
`gpt-5.6-terra` under provider `openai-codex`. Skjemaet er fortsatt strict og
avviser oppdiktede modellnavn og fremmede providere. CLI-testens tidligere bruk
av `gpt-5.6-sol` som ugyldig fixture er korrekt erstattet med
`gpt-5.6-invented`; den tester fortsatt avvisningsgrensen uten å kollidere med
det nye gyldige modellsettet.

## Regresjonsvakt

`tests/lib/library-analysis-profile-migration.test.ts` normaliserer de to
profilversjonene og fire hashene tilbake til 1.0.23 og krever at resten av
funksjonskroppen er identisk. Den avviser også framtidige rolle-/datamuteringer i
denne profil-migrasjonen og kontrollerer at `candidate_only` og
candidate-promotion-grensen fortsatt finnes.

Ingen alvorlige eller blokkerende feil ble funnet i det gjennomgåtte deltaet.

## Arbeidspakke: Markdown-skillelinjer

Arbeidspakkebyggingen klassifiserte tidligere en frittstående tematisk
Markdown-skillelinje, for eksempel `---`, som `content`. Dekningskontrollen
krevde derfor en påstand eller eksplisitt blokkering for en ren layoutlinje.
Byggingen utelater nå tematiske skillelinjer med minst tre like `-`, `*` eller
`_`, også når markørene har mellomrom. Tabellskiller som `| --- | --- |`
beholder typen `table_separator`, mens listepunkter og annen tekst som bruker
de samme tegnene fortsatt er `content` og må dekkes. Endringen skriver ikke om
historiske, forseglede arbeidspakker; en ny kjøring må bygge og binde en ny
arbeidspakkehash fra samme kildeinnhold.

## Minstekrav til reell Sol/Terra-kvalifisering

En reell kvalifisering krever en ny, liten og eksplisitt valgt pilot med samme
hashbundne kildeenheter og gjeldende 1.0.24 workflow- og prompthasher. Sol og
Terra må kjøres uavhengig med faktiske `openai-codex`-modellkvitteringer, og
hver innholdslinje må enten knyttes til eksakt kildeevidens eller blokkeres med
grunn. Resultatene må passere eksisterende skjema-, arbeidspakke-, dekning- og
finaliseringskontroller før feilrate og samsvar kan sammenlignes. Modellenes
samsvar er testbevis, ikke menneskelig kildegodkjenning, og pilotkandidater skal
ikke promoteres til kanonisk innhold uten ordinært reviewvedtak.
