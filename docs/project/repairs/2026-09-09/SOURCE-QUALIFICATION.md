# Ny avgrenset Sol/Terra-prøve

Dato: 2026-09-09. Resultat: **partial — modellversjon ikke attestert**. Ingen databaseendring, menneskelig review, kanonisk promotering eller endret ekstern beredskap.

## Faktisk kilde og kjøring

Rislakkis originale masteroppgave er hentet fra JYUs institusjonsarkiv. Begge registrerte URL-er ga identiske PDF-bytes: 73 sider, SHA-256 `5ac4298e9401134e70c23e014b05e870ed0a01c393f95da4c8d7ad71b63c5fc0`. Fullt tekstuttrekk har 73 sideavslutninger. Synlig tittelblad identifiserer Milla Rislakki; innbygde PDF-metadata er malrester og skal ikke brukes som forfatter/tittel. Dette er kildeinnhenting og uttrekkskontroll, ikke full faglig analyse av masteroppgaven.

Den nye modellprøven bruker hele SSBs JSON-stat-svar for én uttrykkelig avgrenset spørring mot tabell 13136: Landet, Matavfall, Ialt/Biogassproduksjon, alle nedstrømsløsninger, tonn, 2024. Det er en komplett respons for to celler, ikke hele tabellen eller dens metodebeskrivelse. Responsen er 3336 kodepunkter og 3350 bytes, SHA-256 `e82e6031e6527cfac907c7480cd00736d1ec07bcc01a922024d9080f08c56f0f`. Dimensjonsproduktet er 2 og verdiarrayet har 2 elementer.

Faktisk `openai-codex/gpt-5.6-sol` leverte 11 kandidatutsagn om data, metadata og avgrensning. Faktisk `openai-codex/gpt-5.6-terra` kontrollerte dem uavhengig mot de samme forseglete bytes. Modellkontrollen fant ingen feil; deterministiske tall-, lokator-, hash- og dekningskontroller fant heller ingen feil i sluttresponsen. Root kontrollerte attributtering, rekkefølge, verdier og avgrensning separat.

Root forsøkte første innlesning før analysørens ferdigsignal. Den mellomliggende responsen ble avvist og bevart i forseglet attempt-001; ferdig respons ble bundet til attempt-002. Dette er en orkestreringsfeil og skal ikke brukes som måling av feilrate i en ferdig modellrespons. Senere innlesninger ventet på eksplisitt ferdigsignal.

## Sluttporten er ikke grønn

Begge faktiske modellnavn er kjent, men verktøyet eksponerer ikke en eksakt modellversjon. Kvitteringene beholder derfor `version=unknown`. `deriveValidatorSeparation` krever kjent versjon for alle modeller og returnerer konservativt `same_model` når identiteten ikke er tilstrekkelig attestert. Den avledede statusen er derfor `partial`, `candidate_only`, med `validator_separation_insufficient`.

En for bred `qualified`-formulering i den allerede forseglete sluttmanifestets beslutningsfelt er eksplisitt korrigert i en ny `ROOT-ADJUDICATION.json`; historikken er bevart. Avledet `partial` og den nye adjudikasjonen er gjeldende konklusjon. Det er ikke endret kode eller svekket noen port for å få prøven gjennom.

Neste avhengighet er verktøyutstedt attestasjon av eksakte modellversjoner, fulgt av en ny forseglet kjøring. Det skal ikke oppdiktes versjonsnummer eller bes om API-nøkkel. En slik prøve vil uansett bare kvalifisere dette avgrensede API-svaret; lange PDF-er, fullkildeanalyse og massebehandling trenger egne etterprøvbare prøver.

## Bevis

Ny privat mappe: `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a083be-a7c3-7db2-bfa2-97227f1a107d/restlist/ssb-qualification/`.

- Køhash: `c95be5e71ceac490d6667f6f12a22351c162a94b3e0ab02b0da813a5e7de49ff`, kodegrunnlag `9749825b442be23dff966762e7ebf97b24a62374`.
- Kilderesultat: `2df7350dd5916d23715c9168ec5447e5d63737614bbdc73a18232ff1a4a07fb9`.
- Valideringsresultat: `ad4bf3d4383a471ced413e407a675352617b9c42a0fa257fbe968824c278f6b7`.
- Sluttkvittering: `terminal-final.json`; faktisk konklusjon: `ROOT-ADJUDICATION.json`; kontrollsummer: `SHA256SUMS.txt`.

Gamle Rislakki- og Luna-prøver er fortsatt i karantene og er ikke omskrevet eller gjenbrukt som godkjenningsbevis.
