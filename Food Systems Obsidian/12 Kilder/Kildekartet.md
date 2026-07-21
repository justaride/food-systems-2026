---
type: seksjon
status: kuratert
kilde: .claude/source-attribution-policy.md
siterbarhet: intern
oppdatert: 2026-07-15
---

# Kildekartet

Kildekartet viser hvordan en leser går fra en formulert innsikt til det opprinnelige evidensgrunnlaget og videre til riktig bruksgate. Det er et navigasjonskart, ikke en erstatning for kildekontroll.

## Evidenskjeden

`innsikt eller analyse` → `kildenote` → `original repo-/datakilde` → `claim-gate` → `tillatt bruk`

### 1. Innsikt eller analyse

Start i [[Innsiktskartet]], [[Maktkartet]] eller en faglig syntesenote. Noten skal gi påstand, sammenheng og forbehold, men kan fortsatt være intern eller i utkast.

### 2. Kildenote

Følg en eksplisitt lenke til en note med `type: kilde`. Kildenoten skal identifisere originaldokumentet og forklare hvilken del av syntesen det støtter. En generell «kilder»-lenke er ikke nok for et konkret tall eller aktørutsagn.

### 3. Original repo-/datakilde

Åpne den oppgitte stien i `research/`, `docs/`, `content/`, `public/data/` eller `data/vault-export/`. Kontroller minst:

- utgiver eller dataeier;
- dato og periode;
- geografi og populasjon;
- enhet og metode;
- side, tabell, rad eller felt som støtter formuleringen;
- eventuelle forbehold i originalen.

`data/vault-export/` er et committet DB-øyeblikksbilde. Det viser hva databasen inneholdt ved eksport, men gjør ikke en usitert DB-rad til primærevidens.

### 4. Claim-gate

Kontroller den konkrete formuleringen mot prosjektets kilde- og claim-lock-regler. Tall, årsaksspråk, aktørpåstander og personkoblinger krever mer enn en fungerende wikilenke. PCQ brukes der menneskelig eller omdømmemessig vurdering er nødvendig.

### 5. Tillatt bruk

Bruk formuleringen bare innenfor statusen gaten faktisk gir:

- internt arbeidsgrunnlag;
- siterbar med eksplisitt note eller caveat;
- eksternt siterbar for en avgrenset claim;
- blokkert inntil kilde, presisjon eller menneskelig beslutning finnes.

## Kildeklasser

### Primærkilder og originaldata

Offentlige registre, lov- og myndighetsdokumenter, offisiell statistikk, årsrapporter, publiserte datasett og annen original dokumentasjon. Disse er førstevalget for verifiserbare fakta, men må fortsatt leses med riktig periode og metode.

### Strukturert database- og eksportdata

[[Prisma-database]], [[Strukturerte datasett]], `public/data/` og `data/vault-export/`. Disse er nyttige for kobling, telling og visualisering. Proveniens på rad- eller feltnivå avgjør om de kan bære en ekstern claim.

### Forskning og faglige rapporter

Akademiske arbeider, utredninger og analyser i [[Forskningsarkiv]] og [[Bibliotek]]. Skill mellom original forskning, sekundær syntese og prosjektets egen tolkning.

### Interne synteser og beslutningsartefakter

Prosjektanalyser, rammeverk, kontrollnotater og planfiler. De kan binde evidens sammen og forklare beslutninger, men er normalt ikke originalkilden for fakta de omtaler.

### Møter og transkripter

[[Møte- og transkriptregister]] inneholder metadata-noter. Vault-notene kopierer ikke fulltekst; åpne originalfilen for sitat, kontekst, taleridentitet og claim-lock. Utsagn i samtaler er ikke automatisk verifiserte fakta.

### Genererte registre og kart

Registre, grafer, canvas og DB-genererte noter gjør materialet navigerbart. De kan vise mønstre eller hvor en rad finnes, men er ikke en ny evidensklasse.

### Gaps og research-missions

[[Gap-register]] beskriver hva som mangler eller må undersøkes. Et gap er et arbeidsobjekt, ikke bevis for fravær.

## Kanoniske inngangsregistre

- [[Kilder]] — generell inngang til dokumenter, referanser og kildehelse.
- [[Møte- og transkriptregister]] — møter og transkripter med originalstier.
- [[Eierskapsregisteret]] — DB-eksporterte eierkanter og oppgitte kilder.
- [[Selskapsregister]] — DB-eksporterte selskapsnoder.
- [[Selskapsmappe-register]] — alle selskapsnoter, også eldre analyse- og kjernenoder.
- [[Personregister]] — personer med flere registrerte styreverv.
- [[Loop-register]] — sirkularitetslooper som arbeids- og navigasjonsnoder.
- [[Gap-register]] — gaps med research-missions.
- [[Stakeholder-register]] — stakeholder-utkast og valideringsbehov.
- [[Forskningsarkiv]] — inngang til forskningskorpuset i repoet.
- [[Strukturerte datasett]] — inngang til strukturerte filer som mater analyse og visninger.

## Minstekontroll før gjenbruk

1. Kan jeg peke på originalfilen eller den direkte offentlige lokatoren?
2. Støtter originalen akkurat denne formuleringen, ikke bare temaet?
3. Har jeg periode, geografi, enhet og metode?
4. Er datadekning eller utvalg tydelig?
5. Er dette observasjon, beregning, syntese eller hypotese?
6. Krever aktør-/personspråket PCQ?
7. Har claimen riktig siterbarhetsstatus for mottakeren og formatet?

Hvis svaret er nei på ett nødvendig punkt, behold bruken intern og registrer det manglende leddet.

## Videre navigasjon

- [[Leseguide for nye lesere]] — 10-, 30- og 90-minutters lesestier.
- [[Metadata- og navnekonvensjoner]] — metadata, identitet og trygg oppdatering.
- [[Innsiktskartet]] — syntesene som skal spores tilbake gjennom denne kjeden.

## Notater

_Utvikles gjennom prosjektet._
