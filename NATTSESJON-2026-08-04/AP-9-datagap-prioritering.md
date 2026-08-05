# AP-9 — DATAGAP-prioritering og syntese

**Type:** Analyse og syntese
**Estimat:** 2–3 timer
**Avhenger av:** AP-8 fullført (alle 20 skiver)
**Gren:** ingen — ren lesing av AP-8s utdata. Skriver til `NATTSESJON-2026-08-04/`.

---

## Hvorfor denne pakken finnes

AP-8 gir 511 triage-poster. Det er råvarer, ikke et svar. Denne pakken svarer på spørsmålet Gabriel faktisk sitter med:

> **Når registreringsporten åpner — hvor skal jeg begynne?**

Prosjektet har elleve dokumenterte kunnskapshull og 511 leste kilder. Koblingen mellom dem er det denne pakken lager.

Den svarer også på et ubehagelig spørsmål ingen har stilt: **dekker kildemassen i det hele tatt hullene?** Det er fullt mulig at 511 kilder gir dyp dekning av tre felt og null av åtte. Det ville i så fall være det viktigste funnet i hele nattsesjonen — og det ville endre hva prosjektet bør gjøre videre langt mer enn noen teknisk oppgave.

DATAGAP-analysen sier det selv: av 73 dekningsceller er **bare 2 merket høy konfidens**. Nå kan vi for første gang si noe om hvorfor, basert på hva materialet faktisk inneholder.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md i sin helhet, spesielt Vedlegg A.
Les deretter DATAGAP-ANALYSE-2026-07-06.md og MASTERPLAN-2026-07-06.md i
prosjektroten.

Oppgaven din er AP-9: syntetisere de 511 triage-postene fra AP-8 til en
prioritert research-agenda.

Inndata: NATTSESJON-2026-08-04/triage/triage-skive-*.jsonl (20 filer)
Utdata:  NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md
         NATTSESJON-2026-08-04/NOTAT-NORD-BESLUTNINGER.md

Du skal ikke endre noe i repoet, ikke røre køene, ikke ta beslutninger på
Gabriels vegne. Du produserer underlag og anbefalinger.

Følg NATTSESJON-2026-08-04/AP-9-datagap-prioritering.md.
Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-9.md.
```

---

## Steg for steg

### Steg 1 — Slå sammen og kvalitetssikre inndataene

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026'
cat NATTSESJON-2026-08-04/triage/triage-skive-*.jsonl > /tmp/triage-alle.jsonl
wc -l /tmp/triage-alle.jsonl        # forventet: 511
```

Før du analyserer, kontroller datagrunnlaget:

- Er alle 511 enhetene fra manifestet dekket? Finn eventuelle hull ved å diffe `identityKey` mot `triage-manifest.jsonl`.
- Er noen enhet dekket to ganger?
- Hvor mange har `readState: "unreadable"` eller `"read_partially"`?
- Hvilke skiver leverte færre poster enn forventet?

**Rapporter dekningsgraden ærlig i toppen av leveransen.** En prioritering basert på 470 av 511 kilder er fortsatt nyttig — men bare hvis leseren vet det.

### Steg 2 — Dekningsmatrisen

Bygg matrisen som svarer på om materialet dekker hullene. Elleve felt × relevansnivå:

| DATAGAP-felt | Type | `core` | `supporting` | `peripheral` | Sum kilder | Beste kilde |
|---|---|---|---|---|---|---|
| `aktordybde` | B | | | | | |
| `materialstrommer` | A/C | | | | | |
| `alternativt_protein` | A/B | | | | | |
| `beredskap_import` | A/C | | | | | |
| `lokale_verdikjeder` | A/B | | | | | |
| `okologi_jordhelse` | C | | | | | |
| `makt_eierskap` | B | | | | | |
| `nordisk_dybde` | A | | | | | |
| `kvalitativt_lag` | B | | | | | |
| `offentlig_innkjop` | A/B | | | | | |
| `kausalitet` | — | | | | | |

Legg til en kolonne for **ferskhet**: hvor nye er kildene som dekker feltet? DATAGAP-analysen flagger ferskhet som et utbredt problem — «REKO-tall fra 2022, PT-data etterslep». Et felt dekket av femten kilder fra 2019 er dårligere stilt enn ett dekket av tre fra 2025.

Og en kolonne for **geografi**: hvor mange av kildene er norske mot øvrig nordiske? DATAGAP-analysen kaller asymmetrien mot Norge et eget hull (`nordisk_dybde`). Nå kan du måle den.

### Steg 3 — De tomme rutene

Dette er den mest verdifulle delen av pakken.

Identifiser felt der **ingen** kilde er merket `core`, og felt der de eneste kildene har svake kvalitetsflagg. For hvert slikt felt, skriv:

- hva som mangler, konkret
- om hullet er Type A (kan lukkes med desk research), B (krever aktørkontakt eller betalt kilde) eller C (ingen kjent kilde måler dette)
- hva som ville lukket det — en navngitt kilde, et register, en aktør å kontakte
- om DATAGAP-analysens §6 «Datakilder å skaffe, forhandle eller overvåke» allerede navngir den

Et Type C-hull som bekreftes tomt av 511 kilder er ikke en fiasko. DATAGAP-analysen sier det rett ut: hullet er *et funn i seg selv, og ofte et policy-argument*. Behandle det som et resultat, ikke som en mangel.

### Steg 4 — Topp 50

Ranger de femti kildene som betyr mest. Kriterier, i prioritert rekkefølge:

1. Dekker et felt som ellers er tynt dekket
2. `datagapRelevance: "core"`
3. Primærkilde med metodeseksjon og kildeliste
4. Fersk — nyere data slår eldre
5. Dekker et nordisk land utenfor Norge
6. Bærer påstander i `claimsWorthVerifying` som er etterprøvbare

For hver: identitetsnøkkel, tittel, hvilket felt den løfter, hvorfor akkurat den, og hva neste steg er når porten åpner.

**Ranger også nedenfra:** hvilke kilder kan trygt nedprioriteres eller tas ut av omfang? DATAGAP-analysen har en egen seksjon som heter «Bevisst nedprioritert» — den disiplinen bør videreføres. En liste over hva man *ikke* skal bruke tid på er like nyttig som topp 50.

### Steg 5 — Rollekorreksjonene

Samle alle poster der `machineRoleWasCorrect: false`.

Dette er en direkte måling av hvor mye filnavnheuristikken bommet, og det har konsekvenser utover rollekøen: hvis mange enheter merket `primary_evidence` egentlig er internt materiale, er den reelle eksterne kildemassen enda mindre enn 538.

Lag en tabell Gabriel kan godkjenne i bulk:

| identityKey | Maskinrolle | Foreslått rolle | Konfidens | Begrunnelse |
|---|---|---|---|---|

Sorter etter konfidens, høyest først — da kan de sikreste godkjennes raskt og de tvilsomme behandles enkeltvis.

**Ikke skriv til rollekøen.** Tabellen er underlaget; oppdateringen er en gatet operasjon med kvitteringskrav (`decisionReceiptRequired: true`).

### Steg 6 — Duplikatoversikt

Samle alle `duplicateSuspicion.suspected: true`. Kryssjekk mot de 53 gruppene i `corpus-normalized-path-duplicate-queue.v1.jsonl`.

Interessant er særlig: fant triage-agentene duplikater som køen *ikke* kjenner? Det ville bety at deduplisering på sti og innholdshash ikke fanger semantiske duplikater — samme rapport lastet ned fra to kilder, eller en rapport og dens sammendrag.

Ikke flett noe. Lever listen.

### Steg 7 — De to Nord-aliasene

Denne oppgaven kom fra den parkerte AP-4, og den hører hjemme her fordi den er nøyaktig samme type omfangsvurdering som resten av triagen.

To eldre databasealiaser peker på andre publikasjoner enn navnene antyder, og begge blokkerer en PDF-registrering:

| Alias | Faktisk publikasjon | DOI | Systemets vurdering |
|---|---|---|---|
| `Nord 2024:023` | *UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability* | `10.6027/nord2024-023` | `pending_owner_classification_indirect_context` |
| `Nord 2025:010` | *Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices* | `10.6027/nord2025-010` | `pending_owner_disposition_likely_out_of_scope` |

I blokkeringskøen står de som:

| targetId | identityKey |
|---|---|
| `pdf-recovery.karlstad-legacy-alias` | `document:cmppajyvb0012njvmnphhze07` |
| `pdf-recovery.nordic-food-alert-legacy-alias` | `document:cmppajyve0013njvmw7zok4yr` |

> Legg merke til dobbeltheten: `targetId`-ene peker på «Karlstad» og «nordic-food-alert», mens publikasjonene er noe helt annet. Det er derfor de er flagget som `legacy_alias_scope_mismatch`. Finn ut hvor navnene kom fra — `git log -S 'karlstad-legacy-alias' -- knowledge/` er et godt startpunkt — og om en tredje kilde er blitt hjemløs i forvekslingen. Løses aliaset feil, kan man miste sporet av en kilde som faktisk hører hjemme.

Les det faktiske tekstuttrekket under `knowledge/corpus/pdf-page-extraction/page-maps/`, ikke tittelen. Vurder mot samme DATAGAP-taksonomi som resten. Skriv `NOTAT-NORD-BESLUTNINGER.md` med, for hver: hva publikasjonen faktisk er, matsystemrelevans med siterte passasjer og sidetall, alternativene med konsekvens, og en anbefaling.

To avgjørelser fjerner 2 av 12 blokkeringer uten en linje kode. Det er den billigste framdriften i prosjektet.

---

## Leveranse

`NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md`:

```markdown
# Prioritert research-agenda basert på 511 leste kilder

## 0. Datagrunnlag og dekning
<hvor mange enheter dekket, hvor mange uleselige, hvilke skiver mangler.
Ærlig og først.>

## 1. Sammendrag
<maks 15 linjer: dekker materialet hullene? hvor skal Gabriel begynne?
hva er den viktigste overraskelsen?>

## 2. Dekningsmatrise
<elleve felt × relevans, med ferskhet og geografi>

## 3. De tomme rutene
<felt uten core-dekning, med Type A/B/C og hva som ville lukket dem>

## 4. Topp 50
<rangert, med begrunnelse og neste steg>

## 5. Bevisst nedprioritert
<hva som trygt kan vente eller tas ut>

## 6. Rollekorreksjoner
<tabell for bulk-godkjenning, sortert på konfidens>

## 7. Duplikatmistanker
<inkl. de køen ikke kjenner>

## 8. Påstander verdt å etterprøve
<de mest slående claimsWorthVerifying på tvers av korpuset>

## 9. Usikkerhet og forbehold
```

---

## Definisjon av ferdig

- [ ] Dekningsgraden er målt og oppgitt først, ikke gjemt
- [ ] Alle elleve DATAGAP-felt er dekket i matrisen, med ferskhet og geografi
- [ ] Tomme ruter er identifisert og klassifisert som Type A, B eller C
- [ ] Topp 50 er rangert med begrunnelse per kilde
- [ ] En nedprioriteringsliste finnes — ikke bare en prioriteringsliste
- [ ] Rollekorreksjonene er samlet i en bulk-godkjennbar tabell
- [ ] Duplikatmistanker er kryssjekket mot den eksisterende køen
- [ ] Nord-notatet finnes med anbefaling for begge
- [ ] **Ingen** endring i repoet, køene eller databasen

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Færre enn 400 triage-poster foreligger | Lag prioriteringen likevel, men merk den tydelig som ufullstendig i seksjon 0. |
| Et DATAGAP-felt har null dekning | Det er et **funn**, ikke en feil i arbeidet ditt. Løft det i sammendraget. |
| Triage-postene motsier hverandre om samme kilde | Noter konflikten. Ikke velg side uten grunnlag. |
| Du fristes til å oppdatere rollekøen | Nei. Tabellen er underlaget; oppdateringen er gatet. |
| Du fristes til å ta Nord-beslutningen | Nei. Du anbefaler. |
