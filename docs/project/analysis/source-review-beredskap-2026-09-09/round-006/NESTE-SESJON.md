# Overlevering etter runde 006

Les README.md, target-profile.json, q1-comparison.json, observations.json, INNTAK-USENDT.md, data-gaps.json og verification.json i denne mappen. Kontroller Git-root, HEAD, status og worktrees før arbeid. Isolert gren: `codex/beredskap-round-006`, base `44e34c60df69c686633008bb11524b91310e7f9a`. Finn endelig analysecommit med `git log -1` på grenen. Runde 003–005 er historikk og skal ikke endres.

## Ferdig og vesentlig nytt

Begge nøyaktige bulk-SKU-er er åpnet og frosset fra produsentens nettsider: Regal 160105 og Nord Mills 160585. Næringsdeklarasjonene oppgir henholdsvis 13 og 12 g protein per 100 g, men fullstendige daterte produktspesifikasjoner, batchmålinger og Q1-akseptgrenser ble ikke funnet i de kontrollerte kildene. Utmalingsfeltet er tomt på dagens norske bulkside. 78 % i den separate sekkvaren og 2021-katalogen skal ikke bli en nåværende batchkoeffisient.

Furuset har konkret historisk dokumentasjon om melsiloer, men søknaden for Mat i Farta beskriver flytting/demontering av siloene og ombygging av silorom til fryserom. Deler av bakeriet skal flyttes til Økern; bakeri og konditori skal fortsatt finnes på Furuset. Dette er søknadsbeskrivelsen, ikke et kontrollert nåsituasjonskart. Ny plassering og bulktilkobling mangler. Midlertidig brukstillatelse er datert 17.04.2026; søkers erklæring om ferdigstillelse og anmodning om ferdigattest er datert 13.08.2026. Ikke presenter søknaden som kommunal ferdigattest eller fysisk driftstest.

Leveransen har 17 kildeversjoner, 13 kandidatobservasjoner, 12 Q1-sammenligningsfelt, ni presiserte gap og 70 ubesvarte inntaksfelt. Ingen operativ mengde eller tilleggseffekt er tallfestet. Nytt presist stopp er dagens produksjonsplan og «som bygget»-dokumentasjon av mottaket etter ombygging, i tillegg til fullstendige spesifikasjoner for begge bulkvarene.

## Første neste steg

1. Gjennomgå inntaksskjemaet internt. Ingen kontakt er sendt eller autorisert.
2. Fortsett bare med et konkret nytt dokument: gjeldende bulkspesifikasjon, datert mottaks-/silokart, koblings-/losseprotokoll eller reell produksjons-/reseptplan fra dataeier. Offentlige PBE-plantegninger var markert med innlogging og er ikke lest. Før eventuell dokumentinnhenting utover det offentlige må oppdragets mandat avklares.
3. Ved nye data: bind dokumentversjon, råhash, evidenslokator, kandidat, policy og targetprofil. Bruk en ny kandidatversjon; aldri overskriv historikk eller registrer menneskelig review automatisk.
4. Dersom Furuset ikke passer Q1/bulk, behold stoppet. Ikke flytt caset til Økern, sekkvarer eller ferdig bakst uten en uttrykkelig ny avgrensning.

Finland-restene og de åtte avlingsvarslene er uendret. Følg de eksakte stoppene i round-005/DEFINISJONER.md; ingen brede søk eller avsluttede fôrtilgangsforsøk er gjentatt.

## Privat kilderot og reprodusering

`/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/round-006`

Rå HTML/PDF, per-kilde innhentingskvitteringer, tekstuttrekk, ti sidebilder, byggeprogram, tidligere utkast og verifikasjonskjøringer ligger her. Norske/svenske katalog-PDF-er og distribusjonsbeskrivelsen ble åpnet på nytt og matcher runde 005 byte for byte. Kilder som er «aktuelle på nett» har ikke dermed en bekreftet revisjons-/gyldighetsdato.

`predecessor-119-baseline.json` verner alle 119 private forgjengerfiler. `prior-packages-baseline.json` verner 64 Git-filer i runde 003–005. `round005-private-baseline.json` verner 48 private arbeids-/kildefiler fra runde 005; Python-miljø og cache er ikke omfattet av denne 48-filers kontrollen. Ingen av de eldre røttene er brukt som output.

Kjør fra repository med en **ny** privat outputmappe:

```sh
python3 scripts/verify-beredskap-round006.py --output /absolutt/ny/privat/verification-run
```

Kvitteringen testes mot dagens kildebytes, evidenslinjer, kandidat-/policy-/profilhash, ukjente felt og historiske filer. Ved flytting kreves en ny manifestversjon med korrekte absolutte stier; ikke endre forventede kildehashverdier. Det private `build-package.py` er hashbundet i input-manifest og lager JSON-grunnlaget bare i en ny pakkemappe; det skriver ikke rapportteksten eller verifikasjonen. Tidligere `package-draft-001` bevares. Verifikatoren skriver bare en ny privat kvittering, som kopieres til pakken etter bestått kontroll.

## Grenser og gates

Dette er en lokal intern analyseleveranse. Ingen ny push, PR, release, migrasjon, deployment eller produksjons-UI-kontroll inngår. Releasegodkjenningen gjaldt runde 003–005. Lokale integritetskontroller beviser ikke kildeutsagnenes sannhet, mottaksfunksjon eller menneskelig autoritet. Ingen DB-skriving, kontakt, fysisk test, human review, kanonisk promotering eller readiness-endring er utført. Superpowers er av. Beredskapsanalysens C1-melkjede er ikke `/nordic`-sidens C1-dagligvarekonsentrasjon.
