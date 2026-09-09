# Release og opprydding 9. september 2026

Brukeren har bestilt push, PR, review, merge, redeploy og opprydding av prosjektets arbeidsstier. Denne leveransen samler kildevurderingen og relevant historisk forskningsarbeid på hovedgrenen. Den endrer ikke menneskelig kildegodkjenning eller kanonisk readiness.

## Disposisjon

- Nye gjennomganger og whitepaper ligger i `docs/project/analysis/source-review-beredskap-2026-09-09/round-002/`.
- A1–A6 fra 8. september bevares som historisk forskningsgrunnlag med lenke til den nyere rettelseslisten. Gamle kildepåstander er ikke omdøpt til godkjente fakta.
- Beredskapsrettelsene fra 7. september føres inn i de opprinnelige analysene. Private originaltranskripsjoner, kontrakter og råkilder publiseres ikke.
- Tidligere lokale landscape-filer var eldre enn main og ville fjernet nyere kilde-, manifest- og valideringsvern. Nyere main beholdes; gamle bytes bevares privat. Ulik filhash alene beviser ikke at en endring skal flettes.
- AP10-notater bevares som datert historikk. Gamle kandidatkvitteringer, DOM-uttrekk, skjermbilder og runtime-logger bevares privat og brukes ikke som nye produksjonsbevis.
- De eldre PR-ene379,381,386,359 avsluttes som erstattet/historiske etter kontroll mot den eksisterende PR-disposisjonen. De flettes ikke blindt inn. Særlig379 ville gjeninnført en foreldet økonomisk normalisering.
- G01–G17 og aggregate159 er tidligere lukkede utviklingsspor. Historikken arkiveres; dette er ikke en påstand om at hvert gammelt forslag er implementert. Uinnført brreg-workflow og gammel AP6-plattformbeskrivelse behandles på samme måte.

## Bevaring og aktive stier

Før opprydding ble22worktrees og107lokale grener kartlagt.451endrede/uversjonerte filer ble kopiert og hashkontrollert, og alle Git-referanser bevart i et verifisert bundle. Hele pensjonerte arbeidsmapper bevares dessuten privat, inkludert ignorerte kildefiler. Gamle evidensstier opprettholdes som arkivpekere der de er brukt i materialet. Arkivene er ikke aktive Git-checkouts.

Målet etter merge er én kanonisk main-checkout og denne oppgavens checkout på samme commit, uten lokale filendringer eller konflikter. Historisk arbeid som ikke skal aktiveres ligger i det private arkivet, ikke som en glemt aktiv gren. Den endelige maskinlesbare avlesningen registrerer faktisk oppnådd tilstand.

## Kontroller og kvittering

Den separate gjennomgangen av de nye kontrollscriptfilene fant ingen blokkerende feil;34reviewtester og4forhåndstester bestod. Fullt bygg og lint bestod. Første fulle lokale testkjøring brukteNode22 og feilet mot prosjektets eksplisitt pinnede macOS-runtimeNode26; ny kjøring bruker riktig runtime. Ingen runtime-pin eller sikkerhetsport svekkes for å få grønt resultat.

CI-resultat, full merge-SHA, Coolify-deploy, runtime-/datahelse og autentisert UI føres som separate bevis. Denne teksten lover ikke et resultat før det er avlest.

Privat bevarings- og releasekvittering:

`/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a083be-a7c3-7db2-bfa2-97227f1a107d/release-cleanhouse/`

Git-bundle: `before/all-refs.bundle`. Originale lokale endringer: `before/manifest.json`. Arkiverte arbeidsmapper: `retired-worktrees/`. Endelig avlesning: `final-status.json` når release og opprydding er fullført.
