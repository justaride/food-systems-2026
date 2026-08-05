# AP-8 — Kildelesing og klassifisering: 20 parallelle agenter

**Type:** Innhold. Nattens hovedoppgave.
**Estimat:** 4–8 timer med 20 agenter i parallell
**Avhenger av:** AP-1 fullført
**Gren:** ingen — ren lesing. Utdata går til `NATTSESJON-2026-08-04/triage/`.

---

## Hvorfor denne pakken finnes

Prosjektet har brukt måneder på å bygge maskineriet og **null kilder** har gått gjennom det. Det er ikke fordi noen har vært lat — det er fordi hendelseslinjen er gatet bak ekstern tillitsrot, som er gatet bak rebaseline, som er gatet bak registrering, som venter på Gabriels signatur.

Men den gaten beskytter mot **å publisere en påstand som ikke er bevist.** Den hindrer ikke å lese.

Og bytene ligger der. 1 438 av 1 467 fulltekstenheter har `processingInputState: repository_file_available`. De venter ikke på noe.

### Hva som faktisk skal leses

Ikke 1 555 kilder. Av korpuset er 634 prosjektets egne notater, 177 er indeksfiler og administrative artefakter, og 123 er uklassifiserte. **538 er ekte eksterne kilder**, og 511 av dem har filer på disk:

| | Antall |
|---|---|
| Enheter | **511** |
| PDF-er | 98, til sammen **8 155 sider** |
| Tekstfiler | 413 (markdown, plain, csv) |
| Ord totalt | ca. **3,89 millioner** (tekst eksakt talt, PDF estimert til 350 ord/side) |
| Per agent ved 20 skiver | ~26 enheter, ~194 000 ord |

Det er én natt med tjue agenter. Ikke et årsverk.

### Hva som kommer ut

For hver av de 511 enhetene: en strukturert triage-post som svarer på hva kilden er, hvor god den er, hvilke av de elleve DATAGAP-hullene den treffer, og hva Gabriel bør gjøre med den.

Det gir tre ting samtidig:

1. **1 555 rolleklassifiseringer blir mulige å bekrefte.** I dag er de gjettet på filnavn (`ruleId: control_path_or_filename`). Etter i natt er de basert på faktisk innhold.
2. **Eierkontrollkøen løsner.** Alle 1 555 er `blockedBy: ["full_text_processing_receipt_missing", "source_role_owner_confirmation_missing"]`. Du fjerner ikke sperren, men du gjør beslutningen bak den mulig å ta.
3. **Prioriteringen blir mulig.** AP-9 tar utdataene dine og svarer på hvilke femti kilder som betyr mest for hullene prosjektet faktisk har målt.

---

## Grunnregelen: du leser, du hevder ikke

Dette er den viktigste seksjonen i pakken. Les den to ganger.

Hele prosjektets verdi hviler på at det aldri påstår mer enn det kan bevise. 511 KI-sammendrag som *ser ut* som kunnskap ville vært verre enn ingenting — de ville forurenset en base som skal tåle akademisk og juridisk ettersyn.

Derfor:

| Du skriver | Du skriver aldri |
|---|---|
| «Rapporten oppgir 43 % på side 12» | «43 % av norsk matavfall …» |
| «Kilden hevder X uten å oppgi metode» | «X er tilfellet» |
| «Ser ut til å overlappe med `document:abc…`» | *(fletter identiteter)* |
| `confidence: "low"` med begrunnelse | *(gjetter og later som du vet)* |

Og konkret:

1. **Ingenting skrives til `knowledge/corpus/`.** Alle utdata til `NATTSESJON-2026-08-04/triage/`.
2. **Hver post har `provisional: true` og `producedBy: "nattsesjon-2026-08-04"`.**
3. **Ingen kilde blir «analysert».** Du produserer triage. Analyse er en senere, gatet operasjon med egen protokoll (`SOURCE-ANALYSIS-PROTOCOL.md`).
4. **Ingen identitetsfletting.** Mistanke noteres i `duplicateSuspicion`, aldri handles på.
5. **`research/evidence-pack/` leses, aldri endres.** Ikke omdøp, ikke flytt, ikke normaliser filnavn — den er hashbundet.

---

## Skiveinndelingen er ferdig regnet ut

`NATTSESJON-2026-08-04/triage-manifest.jsonl` inneholder alle 511 enhetene med feltet `slice` (0–19) allerede satt. Fordelingen er balansert på ordmengde med grådig bin-packing, så hver skive er på ~194 000 ord — variasjonen mellom største og minste skive er under 40 ord.

Hver post i manifestet har:

| Felt | Betydning |
|---|---|
| `identityKey` | Korpusidentiteten |
| `queueId` | Køposten i fulltekstkøen |
| `resolvedPath` | Sti relativt til worktree-roten |
| `mediaType` | `application/pdf`, `text/markdown`, `text/plain`, `text/csv` |
| `sizeBytes` | Filstørrelse |
| `pageCount` | Sider — kun for PDF |
| `words` | Ordmengde. Eksakt for tekst, estimert for PDF (`wordsAreEstimate`) |
| `queuePriority` | `p1`, `p2_role_review`, `p3` — prosjektets egen prioritering |
| `machineProvisionalRole` | Maskinens gjetning |
| `machineRuleId` | Regelen den gjettet med |
| `title` | Tittel fra køen |
| `slice` | **Din skive, 0–19** |

Hent din skive slik:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026'
python3 -c "
import json,sys
s=int(sys.argv[1])
for l in open('NATTSESJON-2026-08-04/triage-manifest.jsonl'):
    d=json.loads(l)
    if d['slice']==s: print(json.dumps(d,ensure_ascii=False))
" 07 > /tmp/min-skive.jsonl
wc -l /tmp/min-skive.jsonl
```

---

## Agentprompt (lim inn ordrett — bytt ut `<NN>` med skivenummer 00–19)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md i sin helhet — spesielt §3 (stoppregler),
§5 (regelen som gjør fart trygt) og Vedlegg A (DATAGAP-taksonomien).

Lesekatalog (KUN LESING):
/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1

Du er triage-agent for SKIVE <NN> av 20.
Hent dine enheter fra NATTSESJON-2026-08-04/triage-manifest.jsonl der slice == <NN>.
Det er ca. 26 enheter og ca. 194 000 ord.

For HVER enhet: les kilden faktisk, og skriv én triage-post etter skjemaet i
NATTSESJON-2026-08-04/AP-8-kildelesing-fanout.md.

Skriv postene til NATTSESJON-2026-08-04/triage/triage-skive-<NN>.jsonl
(én JSON-post per linje). Ikke skriv til noen annen fil enn din egen skivefil
og din egen rapport.

ABSOLUTT FORBUDT:
- å skrive til knowledge/corpus/, registeret eller noen kø
- å endre, flytte eller omdøpe noe under research/evidence-pack/
- å flette identiteter
- å hevde at noe er sant fordi en kilde sier det — du refererer, du bekrefter ikke
- å hoppe over en enhet uten å skrive en post for den (bruk readState for å
  markere at den ikke lot seg lese)

Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-8-skive-<NN>.md.
```

---

## Triage-postens skjema

Én JSON-post per enhet, én linje per post. Alle felt er obligatoriske; bruk `null` eller `"unknown"` der du ikke vet.

```json
{
  "schemaVersion": "1.0.0",
  "provisional": true,
  "producedBy": "nattsesjon-2026-08-04",
  "slice": 7,
  "readBy": "<agentnavn/modell>",

  "identityKey": "document:cmp8xyjy30077vvvmr9s125te",
  "queueId": "corpus-full-text.…",
  "resolvedPath": "research/evidence-pack/akademia/bojo-2023.md",
  "readState": "read_fully | read_partially | unreadable",
  "readNotes": "ved partially/unreadable: hvorfor",

  "title": "<faktisk tittel i dokumentet, ikke fra køen>",
  "titleMatchesQueue": true,
  "publisher": "<utgiver/institusjon>",
  "publicationYear": 2023,
  "language": "no | sv | da | fi | is | en | annet",
  "geographicScope": ["NO", "SE", "DK", "FI", "IS", "Nordic", "EU", "global"],
  "documentType": "offentlig_rapport | akademisk | bransjerapport | arsrapport | juridisk | dataset | media | notat | ukjent",
  "pageCount": 34,
  "wordCount": 12045,

  "proposedRole": "primary_evidence | internal_synthesis | operational_control | generated_projection | unknown",
  "proposedRoleConfidence": "high | medium | low",
  "proposedRoleReasons": ["konkrete grunner basert på innhold, ikke filnavn"],
  "machineRoleWasCorrect": true,

  "summary": "3–6 setninger. Hva dokumentet er og hva det inneholder. Faktabasert, ingen vurdering.",

  "datagapFields": ["materialstrommer", "nordisk_dybde"],
  "datagapRelevance": "core | supporting | peripheral | none",
  "datagapNotes": "hvilke konkrete hull den kan bidra til å lukke, og hvordan",
  "gapTypeAddressed": ["A", "C"],
  "qualityDimensions": {
    "bredde": "sterk | middels | svak | ikke_relevant",
    "dybde": "sterk | middels | svak | ikke_relevant",
    "ferskhet": "sterk | middels | svak | ikke_relevant",
    "kausalitet": "sterk | middels | svak | ikke_relevant"
  },

  "isPrimarySource": true,
  "hasMethodSection": true,
  "hasSourceList": true,
  "dataYearsCovered": [2019, 2023],
  "qualityFlags": ["udatert", "ingen kildeliste", "sekundaergjengivelse", "betalingsmur", "kun_sammendrag", "maskinoversatt", "utdatert_tallgrunnlag"],

  "claimsWorthVerifying": [
    {"claim": "<påstand, ordrett eller tett parafrase>", "location": "s. 12", "whyNotable": "<hvorfor den er verdt å etterprøve>"}
  ],

  "duplicateSuspicion": {
    "suspected": false,
    "againstIdentityKeys": [],
    "basis": ""
  },

  "verdictForOwner": "prioriter | standard | lav | ut_av_omfang",
  "verdictReason": "én setning",
  "uncertainty": "det du ikke fikk avklart — tom streng er lov, men vær ærlig"
}
```

### Utfyllingsveiledning

**`summary`** er det Gabriel leser når han skal huske hva en kilde var. Skriv den slik: hva er dette, hvem har laget det, hva inneholder det, hva dekker det ikke. Ingen ros, ingen vurdering — den hører hjemme i `verdictForOwner`.

**`proposedRoleReasons`** skal begrunne med innhold. «Filen ligger under `research/evidence-pack/`» er *ikke* en gyldig grunn — det er nøyaktig den filnavnheuristikken vi erstatter. «Dokumentet er Landbruksdirektoratets årsrapport med primærstatistikk over produksjonstilskudd» er gyldig.

**`datagapFields`** bruker slug-verdiene i briefens Vedlegg A ordrett. Treffer kilden ingen av de elleve, sett tom liste og `datagapRelevance: "none"` — det er et helt gyldig og nyttig svar.

**`claimsWorthVerifying`** er høyverdifeltet. Let etter tall, andeler, rangeringer og årsakspåstander som kan etterprøves mot en annen kilde. To til fem per dokument er passe; er det ingen, skriv tom liste. Ikke fyll den med trivialiteter.

**`verdictForOwner`** — vær villig til å si `lav` og `ut_av_omfang`. En triage som merker alt som `prioriter` har ikke gjort jobben sin. Prosjektets største risiko akkurat nå er ikke å miste en kilde; det er å drukne i 511 like viktige.

### Praktisk om PDF-lesing

```bash
pdfinfo <fil>                    # sider og metadata
pdftotext <fil> -                # all tekst til stdout
pdftotext -f 1 -l 20 <fil> -     # kun side 1–20
```

For store PDF-er (noen er over 25 MB, og årsrapportene er de største): les innholdsfortegnelse og sammendrag først, deretter de seksjonene som faktisk berører DATAGAP-feltene. Du skal forstå dokumentet godt nok til å fylle skjemaet ærlig — ikke gjengi det.

Er et dokument uleselig — skannet uten tekstlag, korrupt, tomt — sett `readState: "unreadable"` med begrunnelse i `readNotes` og fyll ut det du kan fra metadata. **Skriv alltid en post.** En manglende post er umulig å skille fra en glemt enhet.

---

## Rapporten din

`NATTSESJON-2026-08-04/RAPPORT-AP-8-skive-<NN>.md` etter malen i briefens §8, med disse tilleggene i seksjon 3:

- antall enheter i skiven, antall poster skrevet — **tallene skal stemme**
- fordeling av `readState`
- fordeling av `verdictForOwner`
- antall enheter der `machineRoleWasCorrect: false` — dette er direkte mål på hvor mye filnavnheuristikken bommet
- de tre mest verdifulle funnene i din skive, med identitetsnøkkel og én setning hver
- eventuelle duplikatmistanker

Siste punkt er verdt oppmerksomhet: hvis maskinrollene bommer mye i din skive, er det et systemfunn AP-9 trenger å vite om.

---

## Definisjon av ferdig

- [ ] Én triage-post per enhet i din skive — antallet stemmer med manifestet
- [ ] Hver post er gyldig JSON på én linje, med alle obligatoriske felt
- [ ] `provisional: true` og `producedBy` er satt i hver eneste post
- [ ] Hver kilde er faktisk lest — ikke klassifisert fra tittel eller filsti
- [ ] `proposedRoleReasons` begrunner med innhold, ikke filnavn
- [ ] DATAGAP-slugene er skrevet ordrett fra Vedlegg A
- [ ] `verdictForOwner` er differensiert — ikke alt er `prioriter`
- [ ] **Ingenting** skrevet til `knowledge/corpus/`, registeret, køene eller `evidence-pack`
- [ ] Rapporten finnes med tellingene i seksjon 3

Valider til slutt at fila di er velformet:

```bash
python3 -c "
import json,sys
n=0
for i,l in enumerate(open('NATTSESJON-2026-08-04/triage/triage-skive-<NN>.jsonl'),1):
    try: json.loads(l); n+=1
    except Exception as e: print('UGYLDIG linje',i,e)
print('gyldige poster:',n)
"
```

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| En fil i manifestet finnes ikke på disk | Skriv post med `readState: "unreadable"` og forklar. Ikke stopp. |
| Du oppdager at en fil er endret siden manifestet ble laget | Noter det tydelig — det ville være et driftsfunn. Fortsett. |
| Du fristes til å oppdatere rollekøen med din bedre klassifisering | Nei. Du foreslår i triage-posten. Gabriel bekrefter. |
| Du fristes til å flette to like enheter | Nei. `duplicateSuspicion`. |
| Du finner noe som ser ut som en reell integritetsfeil i korpuset | Rapporter det umiddelbart og tydelig — det er viktigere enn resten av skiven din. |
| Du rekker ikke hele skiven | Skriv poster for det du rakk, oppgi nøyaktig hvilke enheter som gjenstår i rapporten. Delvis og ærlig slår komplett og gjettet. |
