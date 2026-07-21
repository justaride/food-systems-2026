---
type: seksjon
status: kuratert
kilde: src/lib/obsidian-vault.ts
siterbarhet: intern
oppdatert: 2026-07-15
---

# Metadata- og navnekonvensjoner

Denne noten dokumenterer dagens maskinelle minimumskontrakt og foreslåtte regler for et mer modent kunnskapskart. Forslagene er ikke autoritative før generator, validator og menneskelig arbeidsregel er oppdatert sammen.

## Dagens obligatoriske frontmatter

Hver Markdown-note i vaulten må ha fire ikke-tomme, skalarverdier:

```yaml
---
type: seksjon
status: utkast
kilde: sti/til/autoritativt-grunnlag.md
siterbarhet: intern
---
```

- `type` styrer lag, Dataview og enkelte spesialregler.
- `status` beskriver notens arbeidsstatus, ikke evidensens sannhet.
- `kilde` peker på grunnlaget for noten eller generatoren som eier den.
- `siterbarhet` beskriver tillatt bruk; `intern` er ikke ekstern godkjenning.

Dagens parser håndterer bare enkle `key: value`-linjer sikkert. Ikke legg lister, nestede objekter eller flerlinjeverdier i frontmatter før parseren støtter og bevarer full YAML.

Alle noter må også ha én `## Notater`-seksjon. For genererte noter er dette den eneste delen med testet byte-for-byte-bevaring gjennom sync.

## Vanlige valgfrie felt

- `tier: kjerne | periferi` brukes i selskaps- og personlaget.
- `mission` kobler en gap-note til en ID i `research/RESEARCH-MISSIONS.md`.
- `orgnr`, `verv`, `ask`, `prioritet` og `relasjon` brukes av bestemte genererte notetyper.

Ikke gjenbruk et felt med ny betydning uten å oppdatere både dokumentasjon, generator og validering.

## Foreslått modenhetsmodell

Dette er et forslag for senere implementering, ikke en aktiv statusvokabular:

- `indeks` — peker videre, men bærer ingen selvstendig claim.
- `arbeidsnode` — samler observasjoner eller åpne spørsmål.
- `syntese` — binder flere kilder sammen med eksplisitte forbehold.
- `claim-kandidat` — har presis ordlyd og identifisert evidenskjede, men venter gate.
- `claim-låst` — er godkjent for en bestemt mottaker, kontekst og versjon.

Et fremtidig felt, for eksempel `modenhet`, må aldri erstatte `siterbarhet`. En moden intern syntese kan fortsatt være uegnet for ekstern bruk.

## Foreslått identitetsregel

Hver aktør-, person-, kilde- og datasett-note bør få en stabil identitetsnøkkel som ikke avhenger av visningstittelen:

- selskap: verifisert organisasjonsnummer eller eksplisitt research-ID;
- person: stabil `personKey` med dokumentert navnevariant;
- kilde: dokument-ID, DOI, offentlig dokumentnummer eller kanonisk repo-sti;
- datasett: stabil `datasetId` og versjon/periode;
- innsikt, gap og mission: varig, unik ID.

Før dette er implementert og validert, er filsti og eksisterende data-ID den praktiske identiteten. Like visningstitler må ikke tolkes som samme objekt.

## Navn og duplikater

- Filens basename skal være unikt i hele vaulten, også ved forskjeller i store/små bokstaver og nordisk translitterasjon.
- Bruk menneskelesbar tittel i `#`-overskriften.
- Ved like navn skal filnavnet kvalifiseres med rolle, land, organisasjonsnummer eller stabil ID.
- Bruk vault-relativ, path-kvalifisert wikilenke når flere noter kan ha samme visningsnavn, for eksempel målet `11 Maktkart/Personer/Register/Navn` med visningstittelen `Navn`.
- Ikke løs identitetskonflikter bare med alias. Avklar først om radene er samme entitet, historiske varianter eller forskjellige objekter.
- Deduplisering skal skje i autoritativ kilde eller DB-eksport før genererte noter slås sammen.

## Generert og kuratert innhold

### Generator-eid

- DB-backed selskaps- og personnoter;
- registre som bygges av sync;
- møte-/transkriptmetadata og stakeholder-skjeletter;
- konsern-canvas under `0 Kart/Konsern/`;
- `.obsidian/graph.json`;
- eksplisitt styrte start-, Dataview- og M2-seksjoner.

Generator-eid innhold over `## Notater` kan bli erstattet. Et ukjent canvas under `0 Kart/Konsern/` kan bli slettet som foreldet eksportartefakt.

### Kuratert

Håndskrevne leseguider, kartforklaringer, vurderinger og arbeidsnotater. Nye kuraterte canvas bør ligge i `0 Kart/` eller `0 Kart/Temakart/`, aldri i den generator-eide konsernmappen.

Plasser menneskelig tilleggstekst under `## Notater` hvis noten helt eller delvis eies av generatoren. For en ny kuratert note skal eierskapet være tydelig i `kilde` og PR-beskrivelsen.

## Minimal mal for en kuratert note

```markdown
---
type: seksjon
status: utkast
kilde: sti/til/grunnlag.md
siterbarhet: intern
---

# Unik og menneskelesbar tittel

Formål, avgrensning og hovedinnhold.

## Koblinger

- En eksplisitt inngangslenke
- En eksplisitt evidens- eller nabolenke

## Notater

_Utvikles gjennom prosjektet._
```

Noten må få minst én innkommende wikilenke. Ellers feiler orphan-kontrollen.

## Trygg oppdateringsflyt

1. Kjør `git status --short --branch` og les eksisterende vault-diff før arbeid.
2. Bevar eller avklar alle lokale endringer i generator-eide filer før sync.
3. Opprett kuraterte noter med unikt basename, skalar frontmatter og innkommende lenke.
4. Kjør `npm run vault:check` før eventuell sync.
5. Hvis endringen ikke trenger regenererte registre eller DB-data, ikke kjør sync.
6. Hvis sync er nødvendig, bevar brukerarbeid først, kjør `npm run vault:sync`, les hele diffen og kjør sync en gang til for idempotens.
7. Avslutt med `npm run vault:check`, relevante tester, `git diff --check` og ny statusgjennomgang.

Se [[Leseguide for nye lesere]] for leseflyten og [[Kildekartet]] for evidenskjeden.

## Notater

_Utvikles gjennom prosjektet._
