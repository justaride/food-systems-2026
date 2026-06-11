---
tittel: Statusnotat til Jan Thomas - uke 25
status: Utkast v0.1
eier: Gabriel
dato: 2026-06-15
scope: Kort beslutningsnotat for JT-møte i uke 25, basert på arbeid etter 26.05 og plattformløftet 11.06.
bruksregel: Internt beslutningsnotat. Tall fra kilde-/operatorgater skal ikke brukes eksternt før Fase B har re-kjort operatorsekvensen etter merge/deploy.
relaterte_filer:
  - docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md
  - docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md
  - docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md
  - docs/project/mandates/food-tg-minimumsvedtak-casekort-2026-06-09.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md
---

# Statusnotat til Jan Thomas - uke 25

## 1. Hva er gjort siden 26.05

Siden metodeoverføringsmøterunden 26.05 er Food TG-materialet flyttet fra bred research til et styrt beslutnings- og valideringsapparat. Arbeidet har særlig levert fem ting:

1. Kilde- og siteringskontroll er strammet inn på databasenivå, med claim-lock, source-shortlist, PCQ og citable-gater som faste porter.
2. Wageningen/Moerman/R9-overføringen er lukket som internt metodegrunnlag med tydelige forbehold, ikke som ekstern validering.
3. 09.06-samtalen er omsatt til en case-shortlist, casekort, sprintboard, dokumentasker og deck-outline.
4. Plattformen har fått et stort transparensløft gjennom 17 goals: data-status, provenienslinjer, kildede KPI-er, missing-data-semantikk, mandat/metodikk-split, Food TG board i DB og coverage-badges.
5. Integrasjonsstacken for disse 17 goals er samlet i draft-PR #159, GitHub CI er grønn, og PR-en er mergebar. Den er fortsatt draft fordi G-06, G-10 og G-11 krever eksplisitt Gabriel-vedtak.

Kort sagt: innholdet og kontrollapparatet er modent nok til et beslutningsmøte i uke 25, men plattformstacken må merges/deployes før nye flater kan demonstreres som prod.

## 2. Hvorfor grunnlaget er tryggere nå

Grunnlaget er tryggere fordi prosjektet ikke lenger er avhengig av fritekstlig vurdering alene. Hver ny påstand skal gå gjennom samme kjede: kilde eller dokumentask, PCQ/source-shortlist, claim-lock, intern/ekstern status og eventuelt actor validation.

Det viktigste kvalitetsprinsippet er at uferdige case ikke skal pyntes opp. Sprintboardet skiller derfor mellom:

- `deckklart internt` med caveat, for eksempel Valio som soyafri governance-case og 100% Fish som benchmark.
- `needs-primary-check`, for eksempel kaffe/Brasil og kakao/Elfenbenskysten som relasjonscase.
- `needs-actor-validation`, for eksempel distribusjon/adoption-gate.
- `watchlist` eller parkering, for spor som ikke har nok dokumentert aktør-, volum- eller fulltekstgrunnlag.

Plattform-PR #159 gir også et sterkere demonstrasjonslag: den gjør kildevalg, datamangler og styringsflater synligere for JT/Cathrine/Thea. Lokal operatorgate har fortsatt 9 baseline-/dataavvik som også finnes på `main`; disse er klassifisert som Fase B-operatorarbeid, ikke som PR-spesifikk kodefeil.

## 3. Hva som fortsatt ikke skal sies eksternt

Følgende skal ikke brukes som ekstern faktastemme før det er validert:

- At kaffe/Brasil eller kakao/Elfenbenskysten har en bestemt MOU, partsliste eller partnerrolle. Dette må først avklares med DASK-0906-001 og DASK-0906-002.
- At Valio/Finland er "importfritt" på fôr. Trygg intern formulering er soyafri governance og datagap på fôrstandard, fôrkurv og importandel.
- At BAMA eller en bestemt aktør blokkerer grønt-/distribusjonsløsninger. Trygg formulering er bred distribusjon/adoption-gate.
- At 100% Fish beviser norsk pilotstatus eller faktisk 100 prosent utnyttelse. Trygg formulering er benchmark/designkrav.
- At spillvarme har et nasjonalt TWh-potensial for matproduksjon. Hima kan brukes internt med datagap; resten må inn i mini-ledger.
- At de ferskeste citable-/strict-source-tallene kan brukes utad. Operatorsekvensen skal re-kjøres etter stack-merge og før møte-/eventbruk.

## 4. Beslutninger vi ber om i møtet

Vi ber om fire beslutninger, formulert i eget beslutningsnotat:

1. Minimumsvedtak for intern casekort- og researchsprint.
2. Bekreftelse av H1/H2-todelingen fram mot kontraktsfristen 31.07.2026.
3. Port E: offentlig online event - dato/format/vertskap og Thea-aktivering.
4. Godkjenning til å sende DASK-0906-001/002 internt nå.

I tillegg må Gabriel separat lukke plattform-PR-gaten for G-06, G-10 og G-11. Den beslutningen handler om kode-/plattformstacken, mens JT-møtet handler om programleveranse og styring.

## 5. Neste 14 dager

Foreslått løp etter møtet:

| Tidsrom | Leveranse | Ferdigkriterium |
|---|---|---|
| 15.-17.06 | Minimumsvedtak og DASK-0906-001/002 | Vedtak loggført; interne dokumentasker sendt. |
| 15.-19.06 | Deck v0.1 og Port E | Intern deck v0.1 gjennomgått; eventdato/format og Thea-rolle avklart. |
| 16.-20.06 | Plattformstack merge/deploy | PR #159 merget etter Gabriel-vedtak; deploy og `/api/data-status` verifisert. |
| 17.-24.06 | Casestatus og "start her" | JT/Cathrine/Thea kan følge case, blokkere og neste handling uten repo-lesing. |
| 24.-30.06 | Event- og roadmaparbeid | Event-innholdsramme og roadmap v0.1-struktur klar for uke 28-31. |

Risikoen nå er ikke mangel på materiale. Risikoen er at materialet ikke blir gjort om til beslutninger i tide. Møtet i uke 25 bør derfor behandles som beslutningsmøte, ikke orientering.
