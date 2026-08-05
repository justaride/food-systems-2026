# AP-3 — Normaliserte sti-duplikater: diagnose og forslag (funn F7)

**Type:** Analyse. **Ingen automatisk opprydding.**
**Estimat:** 2–4 timer
**Avhenger av:** AP-2 fullført
**Gren:** `codex/nattsesjon-ap3-path-normalization` i eget worktree

---

## Hvorfor denne pakken finnes

Under QA-en 3. august ble hele korpusregisteret regenerert fra bunnen i en ren Linux-sandkasse og sammenlignet byte for byte. Resultat: **1 553 av 1 555 identiteter reproduserte identisk.** De to siste kunne ikke løses.

Årsaken er ikke drift. Den er filsystemsemantikk:

Bokstavene æ, ø og å kan lagres på to måter i Unicode. Enten som ett kodepunkt — *precomposed*, NFC — eller som en grunnbokstav pluss et kombinerende tegn — *decomposed*, NFD. `ø` og `o`+`U+0338` ser identiske ut på skjermen, men er ulike bytesekvenser.

macOS' filsystem gjør normaliserings-insensitivt oppslag: spør du etter den ene formen og fila er lagret i den andre, finner det den likevel. Linux og de fleste andre filsystemer gjør byte-eksakt oppslag: da er det to forskjellige filer, og den ene finnes ikke.

Registeret inneholder stivarianter i begge former. På Gabriels Mac løser **alle** til fil, og raden står som `present`. På Linux gjør 2 av dem det ikke.

### Hva dette betyr — og ikke betyr

**Ikke** en feil i repoet. Den uavhengige hash-kontrollen kjørt direkte på Gabriels maskin re-hashet alle 1 526 `present`-filer mot registerets SHA-256-verdier: **0 avvik, 0 manglende filer.** Innholdet er intakt.

**Men:** 2 rader som står som «fila finnes» betyr egentlig «fila finnes *på macOS*». Det bryter i det øyeblikket noen gjenoppretter en backup til Linux, setter opp CI, eller flytter prosjektet til en server. Og det er nettopp det en kunnskapsbase bygget for juridisk og akademisk ettersyn ikke har råd til: en «present»-påstand som er sann på én maskin.

En relevant detalj du bør kjenne til: repoets `.git/config` har `precomposeunicode = true` og `ignorecase = true`. Den første får git til å konvertere NFD-navn fra macOS til NFC ved lagring. At varianter likevel finnes i registeret, tyder på at de er skrevet inn fra ulike kilder eller på ulike tidspunkt — noe av diagnosen din blir å finne ut hvilke.

Køen finnes allerede for akkurat dette formålet: `corpus-normalized-path-duplicate-queue.v1.jsonl`, 53 grupper som dekker 113 identiteter.

---

## Kritisk avgrensning: du foreslår, du løser ikke

Hver rad i køen har:

```json
"resolutionState": "owner_review_required",
"automaticAction": "none"
```

Det er ikke en tilfeldighet — det er kontrakten. Automatisk deduplisering av kildeidentiteter er nøyaktig den typen operasjon systemet er bygget for å nekte. To rader som *ser ut* som samme kilde kan være to legitime registreringer med ulik proveniens.

**Du skal derfor ikke:**

- endre `corpus-normalized-path-duplicate-queue.v1.jsonl`
- endre `corpus-processing-register.v1.jsonl`
- kjøre `knowledge:corpus:generate`
- flytte, omdøpe eller normalisere noen fil på disk
- røre `research/evidence-pack/`

**Du skal:** finne ut nøyaktig hva som er galt, hvilke to identiteter det gjelder, hvorfor akkurat de to, hvordan de 53 gruppene henger sammen, og hvilke alternativer Gabriel har — med konsekvensen av hvert alternativ.

Leveransen er et **beslutningsnotat**, ikke en fiks.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md, spesielt §2 (stoppregler) og §4 (isolasjon).

Sett opp ditt eget worktree:
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git worktree add ../nattsesjon-ap3-pathdupes -b codex/nattsesjon-ap3-path-normalization
cd ../nattsesjon-ap3-pathdupes
npm install

Oppgaven din er AP-3: diagnostisere funn F7 (Unicode-normaliseringsvarianter i
korpusregisteret) og skrive et beslutningsnotat.

Dette er en ANALYSEOPPGAVE. Du skal ikke fikse noe, ikke endre køfiler,
ikke endre registeret, ikke flytte filer, ikke kjøre knowledge:corpus:generate.
Køen er merket owner_review_required — det er bindende.

Følg NATTSESJON-2026-08-04/AP-3-normaliserte-stiduplikater.md.
Skriv beslutningsnotatet til NATTSESJON-2026-08-04/NOTAT-F7-STINORMALISERING.md
og rapporten til NATTSESJON-2026-08-04/RAPPORT-AP-3.md.
```

---

## Steg for steg

### Steg 1 — Finn de to identitetene

Dette er kjernen. Alt annet er kontekst.

Skriv et frittstående skript (Python eller Node — **ikke** en endring i prosjektets skript) som for hver `present`-rad i `corpus-processing-register.v1.jsonl`:

1. leser stien
2. sammenligner `unicodedata.normalize('NFC', sti)` mot `normalize('NFD', sti)` — er de like, er stien ren ASCII og uinteressant
3. sjekker om stien finnes **byte-eksakt** i katalogoppføringen fra foreldrekatalogen (altså: `os.listdir()` og eksakt strengsammenligning, ikke `os.path.exists()` — `exists()` bruker macOS' insensitive oppslag og vil svare «ja» på begge former)

De radene der byte-eksakt oppslag feiler, men `exists()` lykkes, er de macOS-avhengige.

**Forventet:** nøyaktig 2 treff.

Får du et annet tall enn 2, er det i seg selv et funn — rapporter det tydelig, og ikke forsøk å tvinge svaret til 2.

For hver av de to, dokumenter:

- `identityKey`
- stien slik den står i registeret, med bytene eksplisitt (`sti.encode('utf-8')`)
- stien slik den faktisk står på disk, med bytene eksplisitt
- hvilke kodepunkter som avviker, med navn (`unicodedata.name()`)
- filens SHA-256 og størrelse
- om identiteten inngår i en av de 53 gruppene i duplikatkøen

### Steg 2 — Kartlegg de 53 gruppene

```bash
wc -l knowledge/corpus/corpus-normalized-path-duplicate-queue.v1.jsonl   # forventet: 53
```

Bygg en oversiktstabell over alle 53 gruppene med:

- `queueId`
- antall identiteter i gruppen (summen skal bli 113)
- `canonicalPaths` og `resolvedRepositoryPaths`
- `mediaTypes`
- om gruppen inneholder ikke-ASCII-tegn i stien
- om gruppen inneholder én av de 2 kritiske identitetene

**Klassifiser hver gruppe.** Fra prøvelesing ser minst to distinkte mønstre ut til å finnes:

- **Prefiksvarianter** — samme fil registrert både som `bibliotek/...` og `research/bibliotek/...`. Dette er *ikke* et Unicode-problem; det er to registreringer av samme sti med og uten rot-prefiks.
- **Unicode-varianter** — samme navn i NFC og NFD.

Disse to krever ulik behandling og bør ikke slås sammen i én anbefaling. Finner du flere mønstre, navngi dem.

### Steg 3 — Finn ut hvordan variantene oppsto

Dette avgjør om en fiks holder eller om problemet kommer tilbake.

```bash
# Når kom radene inn i registeret?
git log --oneline -- knowledge/corpus/corpus-processing-register.v1.jsonl | head -20

# Når kom køen?
git log --oneline -- knowledge/corpus/corpus-normalized-path-duplicate-queue.v1.jsonl
```

Se på generatoren `scripts/knowledge/generate-corpus-processing-register.ts`: normaliserer den stier ved innlesing? Hvis ikke — skal den? Hvis den gjør det ett sted men ikke et annet, er det sannsynligvis rotårsaken.

Sjekk også om `precomposeunicode = true` gjelder for alle inngangene. Git normaliserer filnavn fra arbeidstreet, men et register bygget fra en JSON-kilde eller et eksternt manifest går ikke gjennom git.

### Steg 4 — Utarbeid alternativene

For hvert realistiske alternativ, beskriv: hva som gjøres, hva som endres på disk og i registeret, hvilke kontroller som må kjøres etterpå, hva som kan gå galt, og om det er reversibelt.

Minst disse tre bør vurderes:

| Alternativ | Kort beskrivelse |
|---|---|
| **A. Normaliser registeret** | Skriv alle stier i registeret på NFC-form. Filene på disk røres ikke. Krever regenerering av registeret — som i seg selv er en operasjon Gabriel må godkjenne. |
| **B. Normaliser på disk** | Omdøp de avvikende filene til NFC. Innholdshasher er uendret, men filstier i registeret må da også oppdateres. Berører muligens `research/evidence-pack` — i så fall er alternativet trolig utelukket. |
| **C. Normaliser ved oppslag** | La generatoren og verifikatoren normalisere stier før sammenligning. Ingen data endres; portabiliteten løses i koden. Størst kodeendring, minst dataendring. |

Vurder eksplisitt om noen av alternativene bryter mot at `research/evidence-pack` er hashbundet.

Anbefal ett. Begrunn. Vær tydelig på hva du er usikker på.

### Steg 5 — Skriv en test som *ville* fanget dette

Uten å endre eksisterende tester: skriv en ny, frittstående testfil som byte-eksakt verifiserer at hver `present`-sti i registeret finnes i foreldrekatalogens oppføring.

Denne testen skal **feile** på nåværende tilstand — det er poenget. Den dokumenterer problemet maskinlesbart og blir regresjonsvernet når fiksen først kommer.

Legg den i `tests/lib/` som en ny fil. **Ikke** legg den inn i `knowledge:processing-contracts:check` — det ville gjøre kontrollpakken rød, og kontrollpakkens grønne tilstand er noe Gabriel skal kunne stole på i morgen tidlig. Nevn i notatet at den bør inn i pakken *sammen med* fiksen.

Commit gjerne testen på din egen gren. Den kanoniske grenen røres ikke.

---

## Leveranse

`NATTSESJON-2026-08-04/NOTAT-F7-STINORMALISERING.md` med denne strukturen:

```markdown
# Beslutningsnotat: Unicode-normaliserte stier i korpusregisteret (F7)

## Sammendrag
<maks 10 linjer: hva som er galt, hvor stort det er, hva du anbefaler>

## 1. De to kritiske identitetene
<full dokumentasjon per identitet: nøkkel, bytes, kodepunkter, hash, gruppetilhørighet>

## 2. De 53 gruppene
<tabell + klassifisering etter mønster>

## 3. Rotårsak
<hvordan variantene oppsto, med git-bevis>

## 4. Alternativer
<A / B / C med konsekvens, risiko og reversibilitet>

## 5. Anbefaling
<ett alternativ, begrunnet>

## 6. Hva som må kjøres etter en fiks
<eksakte kommandoer>

## 7. Usikkerhet
<det du ikke fikk avklart>
```

---

## Definisjon av ferdig

- [ ] De 2 macOS-avhengige identitetene er identifisert med byte-nivå-dokumentasjon
- [ ] Alle 53 grupper er kartlagt og klassifisert; summen er 113 identiteter
- [ ] Rotårsak er undersøkt med git-historikk og kodelesing
- [ ] Minst tre alternativer er vurdert med konsekvens og reversibilitet
- [ ] Én anbefaling er gitt og begrunnet
- [ ] En feilende regresjonstest finnes, utenfor kontrollpakken
- [ ] **Ingen** endring i registeret, køene, filnavn eller `evidence-pack`
- [ ] `knowledge:corpus:check` er fortsatt grønn i ditt worktree
- [ ] Notat og rapport finnes

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Du finner et annet antall enn 2 kritiske identiteter | Ikke tving tallet. Rapporter det du fant, med metoden din. |
| Du oppdager reell drift — en hash som ikke stemmer | **Stopp umiddelbart.** Dette ville motsi QA-ens hovedfunn og er langt viktigere enn F7. Rapporter straks. |
| Du fristes til å «bare rette opp de to» | Nei. `owner_review_required` er bindende. |
| En fiks ser ut til å kreve endring i `evidence-pack` | Stopp den linjen. Beskriv den som utelukket, og forklar hvorfor. |
