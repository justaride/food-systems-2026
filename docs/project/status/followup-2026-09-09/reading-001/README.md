# Full faglig lesning — første dokumenterte del

Arbeidet viderefører `continuation-001` fra commit `0d72eb8a7edc8aca7a61affcc0fb2b423d2b3e6d`. Dette er en lokal, kildebundet analysepakke for senere styrt kandidatinnføring. Den skriver ikke til databasen.

Første del omfatter tre ferdigleste originaler: Meld. St. 11 (2023–2024), *Framework for evaluation of food safety in the circular food system* og *A novel approach to identify critical knowledge gaps for food safety in circular food systems*. Totalt 81 av korpusets 9 919 fysiske PDF-sider er lest, samt et separat vedlegg på åtte sider. 29 kildesider er kontrollert visuelt. Kildeinnhold, metode, nevnere, begrensninger og overførbarhet er vurdert i 33 påstandskandidater.

**Hele biblioteket er ikke ferdiglest.** Registeret omfatter fortsatt alle 140 PDF-er og alle 392 fryste bibliotekrader. 122 dokumenter med brukbar identitetskobling er ulest; 15 har identitets- eller internkontekstforbehold. Rader uten brukbar original har fortsatt sin opprinnelige årsak og neste handling. En ferdiglest fil gjør ikke andre utgaver, referanser eller tilknyttede titler ferdigleste.

## Les leveransen

- [Faglig syntese av de første tre dokumentene](SYNTESE-001.md)
- [Presis restliste og neste leseblokk](RESTLISTE-001.md)
- [Dokument- og bibliotekregister](reading-register.json)
- [Maskinell status](status.json) og [verifikasjon](verification.json)
- [Regne- og konsistenskontroller](quantitative-verification.json)
- [Meld. St. 11: dossier](dossiers/125-001.json)
- [Mattrygghetsrammeverk: dossier](dossiers/100-001.json)
- [Kunnskapshull: dossier](dossiers/101-001.json)
- [Separat rapporteringsvedlegg til rammeverket](supplements/100-reporting-summary-001.json)

## Etterprøvbarhet

Hver påstand har fysisk PDF-side, trykt sidenummer der dette finnes, enbaserte linjer i sideuttrekket og SHA-256 for passasjen og hele siden. Original, tekstuttrekk, identitetskandidat, analyseinput, policy og målprofil er bundet med egne hasher. Bildene og originalene ligger privat på de registrerte absolutte stiene. Ingen nye rå-PDF-er eller fulltekstuttrekk er lagt i Git.

`full_document_read` betegner utført KI-lesning og faglig vurdering av dokumentets sider. Det er ikke menneskelig verifikasjon. Hashkontrollen viser uendret kildegrunnlag og reproduserbare bindinger; den kan ikke bevise kvaliteten på en faglig vurdering. Gjennomlesing av en referanseliste betyr ikke at referansenes originaler er lest. Klassifiseringskonflikter er bevart og er ikke rettet i kilden.

Fra prosjektroten:

```sh
python3 docs/project/status/followup-2026-09-09/reading-001/build-reading.py
python3 docs/project/status/followup-2026-09-09/reading-001/verify-quantitative.py
```

Nye vurderinger legges som nye nummererte `inputs`-filer. `build-reading.py --write` oppretter nye, uforanderlige dossierer og regenererer register/status/kvittering. Korrigeringer av et bundet dossier krever en ny inputversjon. `verify-quantitative.py --write` regenererer regnekvitteringen fra de eksplisitte kildeverdiene. Manuell syntese/restliste får nye nummererte filer når omfanget utvides.

Kontrollnivået er lokalt: kildehash, passasjer, sideregnskap, regning, visuell kildekontroll og reproduksjon. CI, migrasjon, deploy, runtime og autentisert UI er ikke utført. `human_verified=false`; ingen kanonisk endring, publisering eller endring av readiness. Ingen C1–C5-effekt er tallfestet eller godkjent gjennom denne pakken.
