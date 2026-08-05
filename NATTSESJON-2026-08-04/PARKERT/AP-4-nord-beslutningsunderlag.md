# AP-4 — Beslutningsunderlag for de to Nord-aliasene

**Type:** Research og dokumentasjon. **Ingen kodeendring, ingen repoendring.**
**Estimat:** 1–2 timer
**Avhenger av:** ingenting — kan kjøre parallelt med alt
**Gren:** ingen. Du skriver kun til `NATTSESJON-2026-08-04/`.

---

## Hvorfor denne pakken finnes

Av de 12 åpne PDF-blokkeringene er 10 av typen `database_registration_required` — de løses av registreringsporten, som ikke kan åpnes i natt. De 2 siste er av typen `legacy_alias_scope_mismatch`, og de løses av **én beslutning fra Gabriel.** Ingen kode, ingen kjøring, ingen database.

Det gjør dem til den billigste framdriften som finnes i hele prosjektet akkurat nå: to avgjørelser fjerner en sjettedel av blokkeringene.

Problemet er at Gabriel må ha noe å avgjøre *på*. Denne pakken produserer det.

### Hva som er galt

To eldre databasealiaser peker på andre publikasjoner enn navnene antyder:

| Alias | Faktisk publikasjon | DOI | Systemets vurdering |
|---|---|---|---|
| `Nord 2024:023` | *UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability* | `10.6027/nord2024-023` | `pending_owner_classification_indirect_context` |
| `Nord 2025:010` | *Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices* | `10.6027/nord2025-010` | `pending_owner_disposition_likely_out_of_scope` |

I blokkeringskøen finner du dem under disse `targetId`-ene og dokumentnøklene:

| targetId | identityKey |
|---|---|
| `pdf-recovery.karlstad-legacy-alias` | `document:cmppajyvb0012njvmnphhze07` |
| `pdf-recovery.nordic-food-alert-legacy-alias` | `document:cmppajyve0013njvmw7zok4yr` |

> Legg merke til avviket: `targetId`-ene peker på «Karlstad» og «nordic-food-alert», mens de faktiske publikasjonene er UNESCO Biosphere Reserves og Beyond Zero. Det er nettopp derfor de er flagget som `legacy_alias_scope_mismatch`. **En del av jobben din er å avklare og dokumentere denne dobbeltheten** — hvilket navn hørte opprinnelig til hvilken oppføring, og hvor oppsto forvekslingen.

Merk også at systemet allerede *har* en formening om nummer to (`likely_out_of_scope`), men nekter å handle på den. Det er fail-closed-disiplinen i praksis: en maskinvurdering er ikke en eierbeslutning.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md, spesielt §2.

Lesekatalog (KUN LESING — du skal ikke endre noe i repoet):
/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1

Oppgaven din er AP-4: lage et beslutningsunderlag for to Nord-aliaser som Gabriel
må avgjøre omfanget av. Du skal IKKE ta beslutningen, ikke endre køfiler,
ikke endre databasen, ikke flette aliaser.

Følg NATTSESJON-2026-08-04/AP-4-nord-beslutningsunderlag.md.
Skriv til NATTSESJON-2026-08-04/NOTAT-NORD-BESLUTNINGER.md
og NATTSESJON-2026-08-04/RAPPORT-AP-4.md.
```

---

## Steg for steg

### Steg 1 — Hent alt repoet allerede vet

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'

# De to blokkeringsradene i sin helhet
grep -E 'karlstad-legacy-alias|nordic-food-alert-legacy-alias' \
  knowledge/corpus/pdf-page-extraction/pdf-page-extraction-blocker-queue.v1.jsonl \
  | python3 -m json.tool

# Dokumentoppføringene i sammendraget
python3 - <<'PY'
import json
d = json.load(open('knowledge/corpus/pdf-page-extraction/pdf-page-extraction-summary.v1.json'))
for doc in d['documents']:
    if 'legacy-alias' in doc.get('targetId',''):
        print(json.dumps(doc, ensure_ascii=False, indent=2))
PY

# Registerradene
grep -E 'cmppajyvb0012njvmnphhze07|cmppajyve0013njvmw7zok4yr' \
  knowledge/corpus/corpus-processing-register.v1.jsonl | python3 -m json.tool
```

Finn også side-kartene under `knowledge/corpus/pdf-page-extraction/page-maps/` for disse to. Der ligger det faktiske tekstuttrekket — 100 % pålitelig kilde til hva dokumentene faktisk handler om.

### Steg 2 — Les det faktiske innholdet

Ikke vurder ut fra tittelen. Les side-kartene.

For hver av de to publikasjonene, finn ut:

- Hva handler den om, konkret? Sammendrag på 5–10 linjer basert på faktisk tekst.
- Hvor mange sider, hvor mange ord?
- Nevner den mat, matsystemer, matproduksjon, matdistribusjon, matsikkerhet, jordbruk, akvakultur eller matavfall? **Sitér de faktiske passasjene**, med sidetall.
- Er slike omtaler bærende for publikasjonen, eller er de forbigående eksempler?

Dette er avgjørelsens kjerne. En arkitekturrapport som nevner urbant landbruk i to setninger på side 47 er noe helt annet enn en arkitekturrapport med et kapittel om matproduksjon i bygg.

### Steg 3 — Vurder mot prosjektets omfang

Les hva prosjektet faktisk har definert som sitt omfang:

```
MASTERPLAN-2026-07-06.md
DATAGAP-ANALYSE-2026-07-06.md
knowledge/KNOWLEDGE-CONSTITUTION.md
knowledge/corpus/SOURCE-DISCOVERY-PROTOCOL.md
```

Vurder hver publikasjon mot dette. Vær spesielt oppmerksom på om noen av de målte kunnskapshullene i DATAGAP-analysen (aktørdybde, materialstrømmer/N-P-K, alternativt protein, beredskapsnoder, lokale kjeder, økologi og jordhelse) faktisk berøres.

Se også om det finnes presedens: har lignende grensetilfeller vært klassifisert før? Søk i korpuset etter andre kilder med `scopeDisposition: pending_owner_classification` eller lignende, og se hvordan de er behandlet.

### Steg 4 — Nøst opp aliasforvekslingen

Hvorfor heter blokkeringene «karlstad» og «nordic-food-alert» når publikasjonene er noe helt annet?

```bash
git log --oneline -S 'karlstad-legacy-alias' -- knowledge/ | head
git log --oneline -S 'nordic-food-alert-legacy-alias' -- knowledge/ | head
```

Finn ut hvor navnene kom fra, om det finnes en *annen* kilde som legitimt heter noe slikt og som nå er hjemløs, og om beslutningen om disse to har konsekvenser for den. Dette er viktig: løser man aliaset feil, kan man miste sporet av en kilde som faktisk hører hjemme i korpuset.

### Steg 5 — Skriv underlaget

For hver publikasjon skal Gabriel kunne lese to sider og ta beslutningen uten å måtte grave selv.

Sett opp alternativene eksplisitt. For `Nord 2024:023` er de trolig:

- **Behold som indirekte kontekst** — hva betyr det konkret for dekningspåstander, for analysekøen, for arbeidsmengden?
- **Ta ut av omfang** — hva mistes? Blir noe hull større?
- **Omklassifiser** — finnes det en tredje kategori i systemet som passer bedre?

For `Nord 2025:010` tilsvarende, men merk at systemet allerede peker mot «utenfor omfang». Din jobb er å teste den vurderingen, ikke å gjenta den. Finner du gode grunner til at den er feil, si det.

**Gi en anbefaling.** Ikke gjem deg bak «det avhenger». Gabriel kan overprøve deg, men han skal ha noe å overprøve.

---

## Leveranse

`NATTSESJON-2026-08-04/NOTAT-NORD-BESLUTNINGER.md`:

```markdown
# Beslutningsunderlag: to Nord-aliaser med omfangsavvik

## Sammendrag
<hva som skal avgjøres, og hva du anbefaler — maks 10 linjer>

## 1. Nord 2024:023 — UNESCO Biosphere Reserves
### 1.1 Hva publikasjonen faktisk er
### 1.2 Relevans for matsystemomfanget (med siterte passasjer og sidetall)
### 1.3 Alternativer med konsekvens
### 1.4 Anbefaling

## 2. Nord 2025:010 — Beyond Zero
### 2.1 Hva publikasjonen faktisk er
### 2.2 Relevans for matsystemomfanget (med siterte passasjer og sidetall)
### 2.3 Alternativer med konsekvens
### 2.4 Anbefaling

## 3. Aliasforvekslingen
<hvor navnene «karlstad» og «nordic-food-alert» kom fra, og om noen kilde er hjemløs>

## 4. Hva som skjer etter beslutningen
<hvilke køer/felt som må oppdateres, av hvem, med hvilken kommando —
som instruks til framtidig arbeid, ikke som noe du utfører>

## 5. Usikkerhet
```

---

## Definisjon av ferdig

- [ ] Begge publikasjoner er lest via faktisk tekstuttrekk, ikke via tittel
- [ ] Matsystemrelevans er dokumentert med siterte passasjer og sidetall — eller eksplisitt konstatert fraværende
- [ ] Vurdert mot MASTERPLAN, DATAGAP og kunnskapskonstitusjonen
- [ ] Aliasforvekslingen er undersøkt med git-historikk
- [ ] Alternativer med konsekvens er satt opp for begge
- [ ] Anbefaling gitt for begge, med begrunnelse
- [ ] **Ingen** endring i repoet, køene eller databasen
- [ ] Notat og rapport finnes

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Du fristes til å oppdatere køen med beslutningen | Nei. Gabriel avgjør, deretter registreres det. |
| Side-kartene mangler for en av dem | Rapporter det som en egen mangel — det ville være et nytt funn. |
| Du finner at en tredje kilde er berørt av aliasforvekslingen | Dokumenter den grundig. Det er verdifullt. |
| Publikasjonen er utvetydig irrelevant | Si det klart. «Ut av omfang» er et fullgodt svar. |
